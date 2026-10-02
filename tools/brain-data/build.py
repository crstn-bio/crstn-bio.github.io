"""
Design 섹션의 뇌 점 구름 데이터 만들기  →  public/brain/hcp-mni152.bin

모든 좌표는 MNI152 공간(mm)이에요. 실제 집단 평균 해부 데이터를 써요.
- 대뇌 피질: HCP S1200 집단 평균 pial 표면 (fs_LR 32k, 양쪽 반구) + 고랑 깊이(sulc)
- M1: HCP-MMP1.0 (Glasser et al., 2016)의 area 4, 왼쪽 반구
- 해마·소뇌·뇌간·시상: HCP Atlas_ROIs.2 (FreeSurfer 라벨)
- 시상하핵(STN): 아틀라스가 없어서 문헌상 대략적 위치에 렌즈 모양 타원체로 표시

필요한 파일
- hcp_utils 패키지의 data 폴더 (S1200 표면, sulc, mmp_1.0.npz)
- HCPpipelines/global/templates/standard_mesh_atlases/Atlas_ROIs.2.nii.gz

실행
  python build.py --hcp <hcp_utils/data> --atlas <Atlas_ROIs.2.nii.gz> --out ../../public/brain/hcp-mni152.bin

파일 구조 (리틀 엔디언)
  'HCPB' | uint32 JSON 길이 | JSON (4바이트 맞춤) | int16 위치 ×3N (0.01 mm) | int8 법선 ×3N | uint8 고랑 깊이 ×N
  JSON 안에 부위별 [시작, 개수]와 표적 좌표(landmarks)가 들어 있어요.
  부위마다 점 순서를 섞어 두어서, 앞에서부터 일부만 그려도 고르게 보여요 (모바일용).
"""
import argparse, json, struct
import numpy as np, nibabel as nib
from scipy import ndimage
from skimage import measure

ap = argparse.ArgumentParser()
ap.add_argument('--hcp', required=True)
ap.add_argument('--atlas', required=True)
ap.add_argument('--out', required=True)
ap.add_argument('--cortex', type=int, default=56000, help='반구당 피질 점 수')
args = ap.parse_args()
D = args.hcp.rstrip('/') + '/'
rng = np.random.default_rng(7)


def sample_mesh(V, F, n, face_mask=None):
    """면적에 비례해 삼각형 위에 점을 뿌려요. 점 좌표, 면 법선, 면, 무게중심 좌표를 돌려줘요."""
    if face_mask is not None:
        F = F[face_mask]
    a, b, c = V[F[:, 0]], V[F[:, 1]], V[F[:, 2]]
    cr = np.cross(b - a, c - a)
    area = np.linalg.norm(cr, axis=1) / 2
    nrm = cr / (2 * area[:, None] + 1e-12)
    idx = rng.choice(len(F), size=n, p=area / area.sum())
    r1, r2 = rng.random(n), rng.random(n)
    s = np.sqrt(r1)
    w = np.stack([1 - s, s * (1 - r2), s * r2], 1)
    P = w[:, :1] * a[idx] + w[:, 1:2] * b[idx] + w[:, 2:] * c[idx]
    return P, nrm[idx], F[idx], w


# ── 피질 (양쪽 반구) ──
cii = nib.load(D + 'S1200.sulc_MSMAll.32k_fs_LR.dscalar.nii')
sulc_all = cii.get_fdata()[0]
mmp = np.load(D + 'mmp_1.0.npz')
L4 = int(np.where(mmp['labels'] == 'L_4')[0][0])

hemi = {}
for name, slc, bm in cii.header.get_axis(1).iter_structures():
    h = 'L' if name.endswith('LEFT') else 'R'
    g = nib.load(D + f'S1200.{h}.pial_MSMAll.32k_fs_LR.surf.gii')
    V = g.darrays[0].data.astype(np.float64); F = g.darrays[1].data
    sulc = np.full(len(V), np.nan); sulc[bm.vertex] = sulc_all[slc]
    # mmp map_all은 91,282개 grayordinate 전체라서, 이 반구 구간만 잘라 써요
    start = slc.start or 0
    lab = np.zeros(len(V), int); lab[bm.vertex] = mmp['map_all'][start:start + len(bm.vertex)]
    hemi[h] = dict(V=V, F=F, sulc=sulc, lab=lab)

# 고랑 깊이 부호: HCP sulc는 고랑에서 음수예요. 섬엽(깊음)과 가쪽 볼록면(얕음)을 비교해서 확인
VL, sL = hemi['L']['V'], hemi['L']['sulc']
ins = (np.abs(VL[:, 0] + 38) < 4) & (np.abs(VL[:, 1] - 4) < 8) & (np.abs(VL[:, 2] - 2) < 8) & ~np.isnan(sL)
cvx = (VL[:, 0] < -58) & ~np.isnan(sL)
SGN = 1.0 if np.nanmean(sL[ins]) > np.nanmean(sL[cvx]) else -1.0
dep_all = SGN * np.concatenate([hemi['L']['sulc'], hemi['R']['sulc']])
LO, HI = np.nanpercentile(dep_all, [2, 98])
print('sulc sign', SGN, 'range', round(LO, 2), round(HI, 2))


def cortex_points(h, n, faces):
    V, F, sulc = hemi[h]['V'], hemi[h]['F'], hemi[h]['sulc']
    P, N, FF, W = sample_mesh(V, F, n, faces)
    # 바깥쪽을 향하도록 법선 방향 맞추기 (가쪽 볼록면의 법선은 바깥(|x| 증가)을 향해야 해요)
    side = -1 if h == 'L' else 1
    lat = np.abs(P[:, 0]) > 55
    if np.mean(N[lat, 0] * side) < 0:
        N = -N
    dep = (W * np.nan_to_num(SGN * sulc[FF], nan=HI)).sum(1)
    dep = np.clip((dep - LO) / (HI - LO), 0, 1)        # 0 = 이랑 꼭대기, 1 = 깊은 고랑
    return np.column_stack([P, N, dep])


parts, marks = {}, {}
for h in 'LR':
    V, F, sulc, lab = (hemi[h][k] for k in ('V', 'F', 'sulc', 'lab'))
    ok = (~np.isnan(sulc))[F].all(1)                      # 안쪽 벽(medial wall) 제외
    m1f = (lab == L4)[F].all(1) if h == 'L' else np.zeros(len(F), bool)
    parts[f'ctx{h}'] = cortex_points(h, args.cortex, ok & ~m1f)
    if h == 'L':
        parts['m1'] = cortex_points(h, 9000, m1f)

# ── 피질 아래 구조: HCP Atlas_ROIs.2 (2 mm) ──
roi = nib.load(args.atlas); A = np.asarray(roi.dataobj); aff = roi.affine


def structure(labels, n, sigma=0.7):
    m = ndimage.gaussian_filter(np.isin(A, labels).astype(float), sigma)
    verts, faces, _, _ = measure.marching_cubes(m, 0.5)
    Vm = nib.affines.apply_affine(aff, verts)
    P, N, _, _ = sample_mesh(Vm, faces, n)
    # 아핀 x축이 뒤집혀 있어서 법선이 안쪽을 볼 수 있어요. 덩어리 중심(좌우가 있으면 같은 쪽 중심) 기준으로 바깥을 향하게
    if len(labels) == 1:
        c = Vm.mean(0)
    else:
        c = np.where(P[:, :1] < 0, Vm[Vm[:, 0] < 0].mean(0), Vm[Vm[:, 0] >= 0].mean(0))
    s = np.sign(((P - c) * N).sum(1, keepdims=True)); s[s == 0] = 1
    return np.column_stack([P, N * s, np.zeros(n)]), Vm


parts['hpcL'], hpcLV = structure([17], 3500, 0.6)
parts['hpcR'], hpcRV = structure([53], 3500, 0.6)
parts['thal'], _ = structure([10, 49], 3200, 0.7)
parts['cb'], _ = structure([8, 47], 14000, 0.8)
parts['bs'], _ = structure([16], 4500, 0.8)

# ── STN: 문헌상 대략적 위치의 렌즈 모양 타원체 ──
# 중심 ≈ MNI (±12, −13, −5), 크기 ≈ 12 × 5 × 3 mm. 긴 축은 앞·안쪽·아래 → 뒤·바깥쪽·위로 비스듬해요.
def stn(side):
    c = np.array([12.0 * side, -13.0, -5.0])
    u = np.array([0.35 * side, -0.85, 0.40]); u /= np.linalg.norm(u)
    v = np.cross(u, [0, 0, 1.0]); v /= np.linalg.norm(v)
    w = np.cross(u, v)
    n = 900
    d = rng.normal(size=(n, 3)); d /= np.linalg.norm(d, axis=1, keepdims=True)
    semi = np.array([6.0, 2.6, 1.6])
    P = c + (d[:, :1] * semi[0]) * u + (d[:, 1:2] * semi[1]) * v + (d[:, 2:] * semi[2]) * w
    N = (d[:, :1] / semi[0]) * u + (d[:, 1:2] / semi[1]) * v + (d[:, 2:] / semi[2]) * w
    N /= np.linalg.norm(N, axis=1, keepdims=True)
    return np.column_stack([P, N, np.zeros(n)]), c


parts['stnL'], stnLc = stn(-1)
parts['stnR'], stnRc = stn(1)

# ── 표적과 경로 ──
ctx_all = np.vstack([hemi['L']['V'], hemi['R']['V']])
ctx_pts = np.vstack([parts['ctxL'], parts['ctxR'], parts['m1']])
unit = lambda v: v / np.linalg.norm(v)


def exit_point(origin, direction, max_t=140.0):
    """origin에서 direction으로 나가다가 마지막으로 피질 표면을 지나는 점 (리드·탐침이 뇌에 들어가는 자리)"""
    t = np.arange(0, max_t, 0.5)
    ray = origin + t[:, None] * direction
    from scipy.spatial import cKDTree
    d, _ = cKDTree(ctx_all).query(ray)
    hit = np.where(d < 2.0)[0]
    return ray[hit.max()] if len(hit) else ray[-1]


# M1: 왼쪽 손 영역(hand knob) 부근의 area 4 이랑 쪽 점에 초점을 둬요
m1 = parts['m1']
crown = m1[m1[:, 6] < 0.35]
want = np.array([-37.0, -21.0, 58.0])
m1_target = crown[np.argmin(np.linalg.norm(crown[:, :3] - want, axis=1)), :3]
near = ctx_pts[(np.linalg.norm(ctx_pts[:, :3] - m1_target, axis=1) < 16) & (ctx_pts[:, 6] < 0.3)]
m1_normal = unit(near[:, 3:6].mean(0))

# DBS 리드: STN에서 위·앞·바깥쪽으로 (시상면에서 AC–PC선과 65°, 관상면에서 수직과 18°)
al, be = np.radians(65), np.radians(18)
leads = {}
for side, c in (('L', stnLc), ('R', stnRc)):
    s = -1 if side == 'L' else 1
    u = unit(np.array([s * np.tan(be), 1 / np.tan(al), 1.0]))
    leads[side] = dict(target=c.tolist(), dir=u.round(4).tolist(), entry=exit_point(c, u).round(1).tolist())

# 해마 긴 축 (주성분): 머리(앞) ↔ 꼬리(뒤). 뒤통수 쪽에서 긴 축을 따라 들어가는 탐침 경로
def long_axis(Vm):
    c = Vm.mean(0)
    _, _, vt = np.linalg.svd(Vm - c, full_matrices=False)
    a = vt[0] if vt[0][1] > 0 else -vt[0]               # 앞쪽(+y)을 향하게
    t = (Vm - c) @ a
    head, tail = c + a * np.percentile(t, 97), c + a * np.percentile(t, 3)
    return c, a, head, tail


hpc = {}
for side, Vm in (('L', hpcLV), ('R', hpcRV)):
    c, a, head, tail = long_axis(Vm)
    hpc[side] = dict(centroid=c.round(1).tolist(), axis=a.round(4).tolist(), head=head.round(1).tolist(),
                     tail=tail.round(1).tolist(), entry=exit_point(head, -a).round(1).tolist(),
                     length=round(float(np.linalg.norm(head - tail)), 1))

marks = dict(
    m1=dict(target=m1_target.round(1).tolist(), normal=m1_normal.round(4).tolist(),
            centroid=parts['m1'][:, :3].mean(0).round(1).tolist()),
    stn=dict(L=stnLc.tolist(), R=stnRc.tolist()),
    leads=leads, hpc=hpc,
    bounds=dict(min=ctx_all.min(0).round(1).tolist(), max=ctx_all.max(0).round(1).tolist()),
)
print(json.dumps(marks, indent=1))

# ── 저장 ──
order = ['ctxL', 'ctxR', 'm1', 'hpcL', 'hpcR', 'stnL', 'stnR', 'thal', 'cb', 'bs']
offs, arrs, o = {}, [], 0
for k in order:
    arr = parts[k][rng.permutation(len(parts[k]))]       # 앞에서부터 일부만 그려도 고르게 보이도록 섞기
    offs[k] = [o, len(arr)]; arrs.append(arr); o += len(arr)
X = np.vstack(arrs)
pos = np.round(X[:, :3] * 100).astype('<i2')
nrm = np.round(np.clip(X[:, 3:6], -1, 1) * 127).astype('i1')
dep = np.round(X[:, 6] * 255).astype('u1')
meta = dict(version=1, count=int(len(X)), posScale=0.01, parts=offs, landmarks=marks,
            source='HCP S1200 group average (WU-Minn HCP); HCP-MMP1.0 (Glasser et al., 2016); '
                   'HCP Atlas_ROIs.2; STN approximate (literature coordinates)')
js = json.dumps(meta, separators=(',', ':')).encode()
js += b' ' * ((4 - len(js) % 4) % 4)
with open(args.out, 'wb') as f:
    f.write(b'HCPB'); f.write(struct.pack('<I', len(js))); f.write(js)
    f.write(pos.tobytes()); f.write(nrm.tobytes()); f.write(dep.tobytes())
print('points', len(X), 'bytes', 8 + len(js) + pos.nbytes + nrm.nbytes + dep.nbytes)
