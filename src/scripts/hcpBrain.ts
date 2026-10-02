// ──────────────────────────────────────────────────────────────
// 실제 해부 데이터로 그리는 점 구름 뇌 (Design 섹션)
//
// 데이터: public/brain/hcp-mni152.bin  (만드는 법: tools/brain-data/build.py)
//  - 대뇌 피질: HCP S1200 집단 평균 pial 표면, 양쪽 반구 (WU-Minn HCP)
//  - M1: HCP-MMP1.0 area 4 (Glasser et al., 2016)
//  - 해마·시상·소뇌·뇌간: HCP Atlas_ROIs.2
//  - STN: 문헌상 대략적 위치의 타원체
// 좌표는 모두 MNI152 (mm): x 오른쪽(+), y 앞쪽(+), z 위쪽(+)
//
// 화면에는 정사영(orthographic)으로 그려요. 그래서 축척 막대가 화면 어디서나 정확해요.
// 점은 WebGL로 더하기 혼합(additive)해서 그리고, WebGL이 없으면 2D 캔버스로 대신 그려요.
// ──────────────────────────────────────────────────────────────

export type V3 = [number, number, number];

export interface Landmarks {
  m1: { target: V3; normal: V3; centroid: V3 };
  stn: { L: V3; R: V3 };
  leads: Record<'L' | 'R', { target: V3; dir: V3; entry: V3 }>;
  hpc: Record<'L' | 'R', { centroid: V3; axis: V3; head: V3; tail: V3; entry: V3; length: number }>;
  bounds: { min: V3; max: V3 };
}

export type PartName = 'ctxL' | 'ctxR' | 'm1' | 'hpcL' | 'hpcR' | 'stnL' | 'stnR' | 'thal' | 'cb' | 'bs';

export interface BrainData {
  count: number;
  parts: Record<PartName, [number, number]>;
  landmarks: Landmarks;
  source: string;
  pos: Int16Array;  // 0.01 mm 단위
  nrm: Int8Array;   // ×127
  dep: Uint8Array;  // 고랑 깊이 ×255 (0 = 이랑 꼭대기)
}

/** 바이너리 파일 읽기: 'HCPB' | JSON 길이 | JSON | 위치 | 법선 | 깊이 */
export async function loadBrain(url: string): Promise<BrainData> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`brain data ${res.status}`);
  const buf = await res.arrayBuffer();
  const dv = new DataView(buf);
  if (String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3)) !== 'HCPB') throw new Error('bad brain data');
  const jl = dv.getUint32(4, true);
  const meta = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 8, jl)));
  const n = meta.count as number;
  let o = 8 + jl;
  const pos = new Int16Array(buf, o, n * 3); o += n * 6;
  const nrm = new Int8Array(buf, o, n * 3); o += n * 3;
  const dep = new Uint8Array(buf, o, n);
  return { count: n, parts: meta.parts, landmarks: meta.landmarks, source: meta.source, pos, nrm, dep };
}

// ── 카메라 ──
// az: 수평 방위 (0 = 왼쪽 옆에서, +π/2 = 앞에서), el: 높이 (+ = 위에서 내려다봄)
export interface Camera { R: V3; U: V3; T: V3; c: V3; k: number; cx: number; cy: number }

export function makeCamera(az: number, el: number, c: V3, k: number, cx: number, cy: number): Camera {
  const t0: V3 = [-Math.cos(az), Math.sin(az), 0];            // 화면 → 카메라 쪽 (수평 성분)
  const R: V3 = [-Math.sin(az), -Math.cos(az), 0];            // 화면 오른쪽
  const ce = Math.cos(el), se = Math.sin(el);
  const T: V3 = [t0[0] * ce, t0[1] * ce, se];                 // 카메라 쪽
  const U: V3 = [-t0[0] * se, -t0[1] * se, ce];               // 화면 위쪽
  return { R, U, T, c, k, cx, cy };
}

const dot = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** MNI 좌표(mm) → [화면 x, 화면 y, 카메라 쪽 깊이 mm] */
export function project(cam: Camera, X: number[]): V3 {
  const p = [X[0] - cam.c[0], X[1] - cam.c[1], X[2] - cam.c[2]];
  return [cam.cx + cam.k * dot(p, cam.R), cam.cy - cam.k * dot(p, cam.U), dot(p, cam.T)];
}

/** 방향 벡터만 화면으로 (길이 mm → px) */
export function projectDir(cam: Camera, d: number[]): [number, number] {
  return [cam.k * dot(d, cam.R), -cam.k * dot(d, cam.U)];
}

// ── 그리기 모드 ──
// cortex: 이랑 꼭대기와 윤곽은 밝게, 고랑은 어둡게
// faint:  피질 아래 구조를 맥락으로만 옅게
// accent: 표적 구조 (파란색)
export type Mode = 'cortex' | 'faint' | 'accent';
export interface Pass {
  part: PartName;
  mode: Mode;
  gain: number;            // 0이면 건너뜀
  color?: V3;              // 0–1
  glow?: boolean;          // 크고 부드러운 점으로 한 번 더 (빛 번짐)
  cutZ?: number;           // 이 높이(mm) 아래는 서서히 사라짐 (뇌간 아래쪽)
}

export interface Renderer {
  kind: 'webgl' | '2d';
  resize(w: number, h: number, dpr: number): void;
  draw(cam: Camera, passes: Pass[], lod: number): void;
}

const VS = `
attribute vec3 aPos; attribute vec3 aNrm; attribute float aDep;
uniform vec3 uC, uR, uU, uT;
uniform vec2 uK, uO;
uniform float uSize, uMode, uGain, uCut;
uniform vec2 uNear;
uniform vec3 uCol;
varying vec4 vC;
void main() {
  vec3 X = aPos * 0.01;
  vec3 p = X - uC;
  gl_Position = vec4(dot(p, uR) * uK.x + uO.x, dot(p, uU) * uK.y + uO.y, 0.0, 1.0);
  gl_PointSize = uSize;
  float f = dot(aNrm, uT);
  float a;
  if (uMode < 0.5) {
    float crown = pow(1.0 - aDep, 1.6);
    float rim = pow(1.0 - min(1.0, abs(f)), 4.0);
    float lat = clamp((dot(p, uT) - uNear.x) / uNear.y, 0.0, 1.0);
    a = 0.012 + 0.2 * crown * max(0.0, f) * (0.35 + 0.65 * lat) + 0.07 * rim * (0.4 + 0.6 * crown);
  } else if (uMode < 1.5) {
    float rim = pow(1.0 - min(1.0, abs(f)), 3.0);
    a = (0.3 + 0.7 * max(0.0, f)) + 1.4 * rim;
    a *= clamp((X.z - uCut) / 14.0, 0.0, 1.0);
  } else {
    a = 0.3 + 0.7 * (0.5 + 0.5 * f);
  }
  vC = vec4(uCol, a * uGain);
}`;

const FS = `
precision mediump float;
varying vec4 vC;
uniform float uSoft;
void main() {
  vec2 c = gl_PointCoord * 2.0 - 1.0;
  float r2 = dot(c, c);
  if (r2 > 1.0) discard;
  float fall = uSoft > 0.5 ? exp(-r2 * 4.0) : 1.0 - smoothstep(0.0, 1.0, r2);
  float a = min(1.0, vC.a) * fall;
  gl_FragColor = vec4(vC.rgb * a, a);
}`;

const WHITE: V3 = [1, 1, 1];

function webgl(canvas: HTMLCanvasElement, data: BrainData): Renderer | null {
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, preserveDrawingBuffer: false });
  if (!gl) return null;
  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader');
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  const attr = (name: string, arr: ArrayBufferView, size: number, type: number, norm: boolean) => {
    const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, name); gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, size, type, norm, 0, 0);
  };
  attr('aPos', data.pos, 3, gl.SHORT, false);
  attr('aNrm', data.nrm, 3, gl.BYTE, true);
  attr('aDep', data.dep, 1, gl.UNSIGNED_BYTE, true);

  const u: Record<string, WebGLUniformLocation | null> = {};
  for (const n of ['uC', 'uR', 'uU', 'uT', 'uK', 'uO', 'uSize', 'uMode', 'uGain', 'uCut', 'uNear', 'uCol', 'uSoft']) u[n] = gl.getUniformLocation(prog, n);
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
  gl.clearColor(0, 0, 0, 0);

  let W = 1, H = 1, D = 1;
  return {
    kind: 'webgl',
    resize(w, h, dpr) {
      W = w; H = h; D = dpr;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    },
    draw(cam, passes, lod) {
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform3fv(u.uC, cam.c); gl.uniform3fv(u.uR, cam.R); gl.uniform3fv(u.uU, cam.U); gl.uniform3fv(u.uT, cam.T);
      gl.uniform2f(u.uK, (2 * cam.k) / W, (2 * cam.k) / H);
      gl.uniform2f(u.uO, (2 * cam.cx) / W - 1, 1 - (2 * cam.cy) / H);
      gl.uniform2f(u.uNear, 5, 55);
      // 점 하나의 크기(기기 픽셀): 확대할수록 조금 크게
      const base = Math.max(1.6, 1.5 * D) * Math.max(0.85, Math.min(1.3, cam.k / 2.6));
      for (const p of passes) {
        if (p.gain <= 0.004) continue;
        const [o, n] = data.parts[p.part];
        const cnt = Math.max(1, Math.floor(n * lod));
        const mode = p.mode === 'cortex' ? 0 : p.mode === 'faint' ? 1 : 2;
        gl.uniform1f(u.uMode, mode);
        gl.uniform1f(u.uCut, p.cutZ ?? -999);
        gl.uniform3fv(u.uCol, p.color ?? WHITE);
        // 점 수를 줄이면 그만큼 밝게 해서 전체 밝기를 유지
        const g = p.gain / Math.sqrt(lod);
        if (p.glow) {
          gl.uniform1f(u.uSoft, 1); gl.uniform1f(u.uSize, base * 5.5); gl.uniform1f(u.uGain, g * 0.05);
          gl.drawArrays(gl.POINTS, o, cnt);
        }
        gl.uniform1f(u.uSoft, 0); gl.uniform1f(u.uSize, base); gl.uniform1f(u.uGain, g);
        gl.drawArrays(gl.POINTS, o, cnt);
      }
    },
  };
}

/** WebGL이 없을 때: 2D 캔버스에 점 일부만 더하기 혼합으로 */
function canvas2d(canvas: HTMLCanvasElement, data: BrainData): Renderer {
  const ctx = canvas.getContext('2d')!;
  let W = 1, H = 1;
  return {
    kind: '2d',
    resize(w, h, dpr) {
      W = w; H = h;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    },
    draw(cam, passes, lod) {
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      const step = 3;
      for (const p of passes) {
        if (p.gain <= 0.004) continue;
        const [o, n] = data.parts[p.part];
        const cnt = Math.floor(n * lod);
        const col = (p.color ?? WHITE).map((v) => Math.round(v * 255)).join(',');
        for (let i = o; i < o + cnt; i += step) {
          const X = [data.pos[i * 3] * 0.01, data.pos[i * 3 + 1] * 0.01, data.pos[i * 3 + 2] * 0.01];
          const [sx, sy, d] = project(cam, X);
          const f = (data.nrm[i * 3] * cam.T[0] + data.nrm[i * 3 + 1] * cam.T[1] + data.nrm[i * 3 + 2] * cam.T[2]) / 127;
          let a: number;
          if (p.mode === 'cortex') {
            const crown = Math.pow(1 - data.dep[i] / 255, 1.6), rim = Math.pow(1 - Math.min(1, Math.abs(f)), 4);
            const lat = Math.min(1, Math.max(0, (d - 5) / 55));
            a = 0.012 + 0.2 * crown * Math.max(0, f) * (0.35 + 0.65 * lat) + 0.07 * rim * (0.4 + 0.6 * crown);
          } else if (p.mode === 'faint') a = 0.3 + 0.7 * Math.max(0, f) + 1.4 * Math.pow(1 - Math.min(1, Math.abs(f)), 3);
          else a = 0.3 + 0.7 * (0.5 + 0.5 * f);
          a = Math.min(1, a * p.gain * step * 0.9);
          if (a < 0.01) continue;
          ctx.fillStyle = `rgba(${col},${a.toFixed(3)})`;
          ctx.fillRect(sx - 0.6, sy - 0.6, 1.2, 1.2);
        }
      }
      ctx.globalCompositeOperation = 'source-over';
    },
  };
}

/** WebGL로 만들고, 안 되면 2D로. WebGL 문맥을 이미 잡은 캔버스는 2D로 못 바꿔서 새 캔버스로 갈아 끼워요. */
export function createRenderer(canvas: HTMLCanvasElement, data: BrainData): { renderer: Renderer; canvas: HTMLCanvasElement } {
  try { const r = webgl(canvas, data); if (r) return { renderer: r, canvas }; } catch { /* 아래에서 2D로 */ }
  const fresh = canvas.cloneNode(false) as HTMLCanvasElement;
  canvas.replaceWith(fresh);
  return { renderer: canvas2d(fresh, data), canvas: fresh };
}
