// ──────────────────────────────────────────────────────────────
// 점 구름 뇌 모델 (첫 화면과 Vision 섹션이 같이 사용)
// 모든 모양은 수식으로 생성해요. 실제 환자 데이터가 아니에요.
// 좌표: x 앞(+)·뒤(−), y 위(+)·아래(−), z 좌우
// ──────────────────────────────────────────────────────────────

export type Vec3 = [number, number, number];

export const REGION = {
  cortex: 0,
  cerebellum: 1,
  stem: 2,
  interior: 3,
  stn: 4,       // 시상하핵 (파킨슨병 DBS 표적)
  hippo: 5,     // 해마 (기억 회로)
} as const;

export interface BrainPoint { x: number; y: number; z: number; b: number; r: number }

const Y_SHIFT = 0.14; // 화면에서 뇌를 살짝 위로

/** 재현 가능한 난수 (mulberry32) */
export function makeRng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomDir(R: () => number): Vec3 {
  const u = R() * 2 - 1, th = R() * Math.PI * 2, s = Math.sqrt(1 - u * u);
  return [s * Math.cos(th), u, s * Math.sin(th)];
}

type Raw = [number, number, number, number];

function cerebrum(R: () => number): Raw | null {
  const d = randomDir(R);
  let x = d[0] * 1.0, y = d[1] * 0.74;
  const z = d[2] * 0.8;
  if (y < 0) y *= 0.6;                                     // 아래쪽은 평평하게
  if (x < -0.55) y *= 0.93;                                // 후두엽
  if (x > 0.45 && y < 0) y *= 0.75;                        // 안와전두
  const lateral = Math.min(1, Math.max(0, (Math.abs(z) - 0.28) / 0.4));
  const temporal = Math.exp(-(((x - 0.12) / 0.34) ** 2)) * lateral;
  if (y < 0.06) y -= 0.32 * temporal;                      // 측두엽이 아래로 내려옴

  if (Math.abs(z) < 0.035 && y > 0.05) return null;        // 대뇌 종렬
  const yl = -0.08 - 0.375 * (x - 0.55);                    // 실비우스 열
  if (x > -0.28 && x < 0.6 && Math.abs(z) > 0.3 && Math.abs(y - yl) < 0.024) return null;
  if (y > 0.05 && y < 0.74) {                               // 중심고랑
    const xc = 0.2 - (0.3 * (y - 0.05)) / 0.65;
    if (Math.abs(x - xc) < 0.018 && y > yl) return null;
  }
  // 이랑과 고랑
  const g =
    Math.sin(9.5 * x + 3.1 * Math.sin(6.0 * y + 2.0 * z)) * Math.sin(8.5 * y + 2.7 * Math.sin(7.5 * z + 1.5 * x)) +
    0.35 * Math.sin(13 * z + 4 * x);
  if (Math.abs(g) < 0.075) return null;
  const b = 0.42 + 0.58 * Math.min(1, Math.abs(g) * 1.7);
  const k = 1 - R() * 0.018;
  return [x * k, y * k, z * k, b];
}

function cerebellum(R: () => number): Raw | null {
  const d = randomDir(R);
  const x = -0.56 + d[0] * 0.3, y = -0.45 + d[1] * 0.18, z = d[2] * 0.52;
  if (y > -0.33) return null;
  if (Math.abs(Math.sin(y * 72 + x * 9)) < 0.5) return null; // 소엽 줄무늬
  return [x, y, z, 0.55];
}

function brainstem(R: () => number): Raw {
  const t = R(), a = R() * Math.PI * 2;
  const cx = -0.28 + 0.1 * t, cy = -0.42 - 0.6 * t, r = 0.12 * (1 - 0.3 * t);
  return [cx + Math.cos(a) * r * 0.8, cy, Math.sin(a) * r, 0.34];
}

function interior(R: () => number): Raw {
  for (;;) {
    const x = R() * 2 - 1, y = R() * 2 - 1, z = R() * 2 - 1;
    if (x * x + y * y + z * z < 1) return [x * 0.9, y < 0 ? y * 0.45 : y * 0.66, z * 0.72, 0.13];
  }
}

/** 시상하핵: 뇌 깊은 곳의 작은 렌즈 모양 핵 (좌우 한 쌍) */
function stn(R: () => number, side: 1 | -1): Raw {
  const d = randomDir(R), r = Math.cbrt(R());
  return [-0.1 + d[0] * 0.07 * r, -0.2 + d[1] * 0.032 * r, side * (0.12 + d[2] * 0.04 * r), 0.9];
}

/** 해마: 측두엽 안쪽에서 뒤·위로 휘어 올라가는 관 모양 (좌우 한 쌍) */
function hippocampus(R: () => number, side: 1 | -1): Raw {
  const t = R();
  const cx = 0.14 - 0.46 * t - 0.08 * t * t;          // 앞쪽 머리 → 뒤쪽 꼬리
  const cy = -0.36 + 0.3 * t * t;                         // 뒤로 갈수록 위로 휘어 올라감
  const cz = side * (0.3 - 0.14 * t);
  const rad = 0.05 * (1 - 0.45 * t) * Math.sqrt(R());
  const d = randomDir(R);
  return [cx + d[0] * rad, cy + d[1] * rad, cz + d[2] * rad, 0.9];
}

export interface BuildOptions { seed?: number; deep?: boolean }

/** 점 구름 만들기. deep: true 이면 시상하핵과 해마 점도 추가해요. */
export function buildBrain(count: number, opts: BuildOptions = {}): BrainPoint[] {
  const R = makeRng(opts.seed ?? 1729);
  const out: BrainPoint[] = [];
  const push = (p: Raw, r: number) => out.push({ x: p[0], y: p[1] + Y_SHIFT, z: p[2], b: p[3], r });

  const want = { c: count * 0.7, cb: count * 0.12, bs: count * 0.05, in: count * 0.13 };
  let guard = 0;
  while (out.length < want.c && guard++ < count * 40) { const p = cerebrum(R); if (p) push(p, REGION.cortex); }
  let n = 0; guard = 0;
  while (n < want.cb && guard++ < count * 40) { const p = cerebellum(R); if (p) { push(p, REGION.cerebellum); n++; } }
  for (let i = 0; i < want.bs; i++) push(brainstem(R), REGION.stem);
  for (let i = 0; i < want.in; i++) push(interior(R), REGION.interior);

  if (opts.deep) {
    for (const side of [1, -1] as const) {
      for (let i = 0; i < 110; i++) push(stn(R, side), REGION.stn);
      for (let i = 0; i < 380; i++) push(hippocampus(R, side), REGION.hippo);
    }
  }
  return out;
}

/** 후보 점들 중 일부를 노드로 골라 가까운 노드끼리 잇기 */
export function buildNetwork(
  pts: BrainPoint[], candidates: number[], nodeCount: number, R: () => number, k = 3, maxD = 0.5,
): { nodes: number[]; edges: [number, number][] } {
  const nodes: number[] = [];
  for (let i = 0; i < nodeCount; i++) nodes.push(candidates[Math.floor(R() * candidates.length)]);
  const seen = new Set<string>();
  const edges: [number, number][] = [];
  for (let i = 0; i < nodes.length; i++) {
    const a = pts[nodes[i]];
    const near = nodes
      .map((j, m) => ({ m, d: m === i ? 9 : Math.hypot(pts[j].x - a.x, pts[j].y - a.y, pts[j].z - a.z) }))
      .sort((p, q) => p.d - q.d)
      .slice(0, k);
    for (const { m, d } of near) {
      if (d > maxD) continue;
      const key = i < m ? `${i}-${m}` : `${m}-${i}`;
      if (!seen.has(key)) { seen.add(key); edges.push([i, m]); }
    }
  }
  return { nodes, edges };
}

export interface View { yaw: number; pitch: number; cx: number; cy: number; scale: number }

/** 회전 + 원근 투영. 앞쪽(+x)이 화면 왼쪽을 보도록 해요. 반환: [화면 x, 화면 y, 깊이] */
export function makeProjector(v: View) {
  const cyw = Math.cos(v.yaw), syw = Math.sin(v.yaw), cp = Math.cos(v.pitch), sp = Math.sin(v.pitch);
  return (x: number, y: number, z: number): Vec3 => {
    const x1 = x * cyw + z * syw, z1 = -x * syw + z * cyw;
    const y2 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;
    const s = 4.2 / (4.2 - z2);
    return [v.cx - x1 * v.scale * s, v.cy - y2 * v.scale * s, z2];
  };
}

export const depthOf = (z: number) => Math.min(1, Math.max(0, (z + 1.1) / 2.2));
