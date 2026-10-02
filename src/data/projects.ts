// 지금까지 한 일(근거). 홈의 Evidence 목록과 상세 창(홈 · 단계 페이지 공통)이 여기서 만들어져요.
import type { StatusKind } from '../components/Status.astro';
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export type Item = {
  id: string; cap: string; stage: string; status: StatusKind; statusText?: string; title: string; line: string;
  chain: { t: string; next?: boolean }[]; kind?: 'tus' | 'spikes' | 'eeg' | 'adni' | 'imu'; label?: string;
  facts?: [string, string][]; href?: string; piece: 'read' | 'model' | 'control' | 'stimulate';
};
export const projects: Item[] = [
  {
    id: 'thesis', piece: 'stimulate', cap: 'Measure · intervene', stage: '01', status: 'current', title: 'a-tbTUS + FES',
    line: 'How perturbation changes human motor-system function.',
    chain: [{ t: 'a-tbTUS → M1' }, { t: 'FES → muscle' }, { t: 'measure' }],
    kind: 'tus', label: 'Thesis method: accelerated theta-burst transcranial ultrasound to primary motor cortex, functional electrical stimulation of the matching muscle in the same session, and the response measured before and after.',
    facts: [['Role', 'Honours thesis student and research assistant, Krembil Brain Institute, UHN'], ['Question', 'Effects of combining a-tbTUS with functional electrical stimulation']],
  },
  {
    id: 'mer', piece: 'read', cap: 'Decode', stage: '02', status: 'done', statusText: 'Completed · workshop', title: 'Deep-brain microelectrode recordings',
    line: 'Spikes and spectral features from deep-brain recordings.',
    chain: [{ t: 'LFP · spikes' }, { t: 'filter' }, { t: 'features' }, { t: 'state', next: true }, { t: 'policy', next: true }, { t: 'simulated stimulation', next: true }],
    kind: 'spikes', label: 'Method: microelectrode recordings from four deep nuclei (Vim, STN, SNr, Rt), band-pass filtered 300 to 3000 Hz, spikes detected at minus 10 times the median absolute deviation, rasters across 115 recordings, population firing rate with a 10 ms Gaussian kernel, and LFP power spectra with Welch’s method.',
    facts: [['Setting', 'NeuroTech coding workshop'], ['Data', 'Milosevic lab, Toronto Western Hospital (public) · LFP: Paulk et al.'], ['Next', 'state → policy → simulated stimulation (not built yet)']],
  },
  {
    id: 'eeg', piece: 'read', cap: 'Decode', stage: '02', status: 'done', title: 'EEG / EMG state analysis',
    line: 'Spectral features from scalp and muscle signals.',
    chain: [{ t: 'EEG · EMG' }, { t: 'windowed FFT' }, { t: 'band power' }],
    kind: 'eeg', label: 'Method: EEG and EMG signals, windowed FFT, and power spectral density summarised as band power.',
    facts: [['Field', 'Behavioural neuroscience']],
  },
  {
    id: 'adni', piece: 'model', cap: 'Human data · disease modelling', stage: '04', status: 'done', title: 'Plasma biomarkers → amyloid PET',
    line: 'Visit-matched human data and out-of-sample evaluation in Alzheimer’s disease. Not memory decoding.',
    chain: [{ t: 'match visits' }, { t: '3 models' }, { t: 'grouped CV' }, { t: 'AUC .902 → .919' }],
    kind: 'adni', href: `${base}/research/plasma-abeta/`,
    label: 'Method: plasma and amyloid-PET visits matched one-to-one within participant up to 365 days; 1,524 observations from 1,236 participants; three logistic models; participant-grouped 5-fold cross-validation repeated 5 times; 1,000 participant-level bootstrap replicates. Adding Aβ42/40 raised AUC from 0.902 to 0.919 and specificity at 90% sensitivity from 0.713 to 0.803.',
    facts: [['Question', 'Does plasma Aβ42/40 add to p-tau217 for amyloid-PET positivity?'], ['Cohort', '1,524 observations · 1,236 participants (ADNI, Mar 2026)'], ['Result', 'ΔAUC +0.017 (95% CI 0.010–0.026); larger in CU (+0.027) than CI (+0.012)']],
  },
  {
    id: 'imu', piece: 'control', cap: 'Control-system engineering', stage: '05', status: 'build', title: 'Motion-controlled pan–tilt',
    line: 'A physical control loop. Not a brain–computer interface.',
    chain: [{ t: 'sense · IMU' }, { t: 'estimate · orientation' }, { t: 'map · control law' }, { t: 'act · 2-axis servos' }],
    kind: 'imu', label: 'Build: an IMU senses tilt, the angle is mapped to a servo pulse width on an Arduino UNO R3, and two SG90 servos move the pan and tilt axes.',
    facts: [['Parts', 'Arduino UNO R3 · 2 × SG90 servos · IMU · 3D-printed mount'], ['Principle', 'sense a state → compute → act']],
  },
];

// 만들기 경로: 물리적 제어 → 신경 신호 제어 → 사람 데이터로 닫힌 고리 모델링
export const buildPath: { tag: string; name: string; chain: string[]; status: StatusKind; statusText?: string }[] = [
  { tag: 'Build 01', name: 'Physical control', chain: ['sense', 'compute', 'act'], status: 'build' },
  { tag: 'Build 02', name: 'Neural control', chain: ['LFP', 'features', 'state', 'policy', 'simulated stimulation'], status: 'next' },
  { tag: 'Summer 2027', name: 'Human closed-loop modelling', chain: ['human signals', 'patient model', 'closed-loop modelling'], status: 'next' },
];
