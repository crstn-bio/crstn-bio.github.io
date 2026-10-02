// 연구 프로그램: 11단계 질문. 홈의 지도와 /how/<slug>/ 페이지가 모두 여기서 만들어져요.
// 글은 세 단계만: 질문(q) · 기전(mech) · 짧은 주석(note). 상태 표시로 한 일과 질문을 구분해요.
import type { StatusKind } from '../components/Status.astro';

export type Stage = {
  n: string; slug: string; verb: string;
  q: string; short: string; mech: string; note: string;
  status: StatusKind; statusText?: string; mark?: string;
  evidence?: { label: string; open: string }[];
  sources?: { label: string; href: string }[];
};

export type Group = { id: string; label: string; logic: string; stages: Stage[] };

const SRC = {
  yin: { label: 'Yin et al., npj Digit Med 2026 · subcortical signals reconstructed from cortex', href: 'https://www.nature.com/articles/s41746-026-03173-5' },
  fda: { label: 'FDA approval of adaptive DBS, 2025', href: 'https://www.healio.com/news/neurology/20250225/fda-approves-first-adaptive-deep-brain-stimulation-system-for-parkinsons-disease' },
  little: { label: 'Little et al., Ann Neurol 2013 · adaptive DBS driven by β', href: 'https://onlinelibrary.wiley.com/doi/10.1002/ana.23951' },
  roy: { label: 'Roy et al., Nature 2016 · engram activation in Alzheimer’s mouse models', href: 'https://www.nature.com/articles/nature17172' },
  josselyn: { label: 'Josselyn & Tonegawa, Science 2020 · memory engrams', href: 'https://www.science.org/doi/10.1126/science.aaw4325' },
  npx: { label: 'Neuropixels 1.0 NHP Long', href: 'https://www.neuropixels.org/probe-1-0-nhp-long' },
};

export const groups: Group[] = [
  {
    id: 'model', label: 'Build the model', logic: 'observe → infer',
    stages: [
      {
        n: '01', slug: 'measure', verb: 'Measure', status: 'current', mark: 'now',
        q: 'How does the human brain respond to intervention?', short: 'response to intervention',
        mech: 'intervene → measure → relate',
        note: 'My honours thesis pairs focused ultrasound on motor cortex with functional electrical stimulation and investigates the effect.',
        evidence: [{ label: 'a-tbTUS + FES', open: 'thesis' }],
      },
      {
        n: '02', slug: 'decode', verb: 'Decode', status: 'done', statusText: 'Completed · signal analysis',
        q: 'What state is this brain in?', short: 'state and representation',
        mech: 'signals → features → latent state / representation',
        note: 'Raw recordings become features a model can use. Done so far: spike and spectral analysis of deep-brain and EEG/EMG recordings.',
        evidence: [{ label: 'DBS microelectrode recordings', open: 'mer' }, { label: 'EEG / EMG', open: 'eeg' }],
      },
      {
        n: '03', slug: 'personalize', verb: 'Personalize', status: 'question',
        q: 'How quickly can a model learn a new brain?', short: 'learn a new brain',
        mech: 'population prior → individual data → personal model',
        note: 'Start from many brains, then let each person’s observations move the model.',
      },
    ],
  },
  {
    id: 'control', label: 'Control', logic: 'predict → act', stages: [
      {
        n: '04', slug: 'predict', verb: 'Predict', status: 'question',
        q: 'What happens if we intervene now?', short: 'what if we intervene?',
        mech: 'z(t) + u(t) → z(t+1)',
        note: 'From classifying a state to forecasting the response to each candidate intervention, then choosing one and learning from what happens.',
      },
      {
        n: '05', slug: 'control', verb: 'Control', status: 'question', mark: 'Parkinson’s',
        q: 'Which intervention should we choose?', short: 'which intervention?',
        mech: 'sense → estimate → predict → select → act → observe → update',
        note: 'Parkinson’s disease is the nearer-term testbed. Adaptive DBS already exists; the open question is how fast it can be personalized, and with how little sensing.',
        evidence: [{ label: 'Build 01 · physical control loop', open: 'imu' }],
        sources: [SRC.fda, SRC.little],
      },
    ],
  },
  {
    id: 'memory', label: 'Memory', logic: 'represent → retrieve', stages: [
      {
        n: '06', slug: 'memory', verb: 'Memory', status: 'question',
        q: 'What information does this brain contain?', short: 'what is represented?',
        mech: 'experience → encoding → representation → consolidation → storage → retrieval → behaviour',
        note: 'Memory is not one variable. A memory could fail at several of these stages, and each failure would look different in the signals.',
        sources: [SRC.josselyn],
      },
      {
        n: '07', slug: 'retrieval', verb: 'Retrieval fails', status: 'question',
        q: 'When a memory cannot be retrieved, what exactly has failed?', short: 'what has failed?',
        mech: 'detect → predict → perturb → observe',
        note: 'A research framework for moving from decoding to causal testing. None of this exists yet; each step is a question.',
      },
    ],
  },
  {
    id: 'interface', label: 'Interface', logic: 'information → hardware', stages: [
      {
        n: '08', slug: 'minimize', verb: 'Minimize', status: 'question',
        q: 'How much neural information is actually necessary?', short: 'how much information?',
        mech: 'channels → informative features → state variables → minimum sufficient',
        note: 'To control a symptom, or to identify and track a memory? High-density recording is the discovery instrument: find the structure first, then the minimum the model needs.',
      },
      {
        n: '09', slug: 'interface', verb: 'Interface', status: 'concept',
        q: 'How much hardware does that information require?', short: 'how much hardware?',
        mech: 'discovery → sufficient information → minimal interface',
        note: 'If the information is needed, a chronic deep interface. If not, cortical or non-invasive signals may carry enough: subcortical β-burst dynamics have been reconstructed from cortical recordings (Yin et al., 2026).',
        sources: [SRC.yin, SRC.npx],
      },
    ],
  },
  {
    id: 'frontier', label: 'Frontier', logic: 'scale → restore', stages: [
      {
        n: '10', slug: 'scale', verb: 'Scale', status: 'question',
        q: 'Can this become a multiscale model of one person’s brain?', short: 'one brain, many scales',
        mech: 'signals → local populations → circuits → networks → individual model',
        note: 'The long-range question: could such a model detect pathological change before symptoms appear? Not a claim that it exists. Each added scale has to earn its place by improving prediction for one person.',
      },
      {
        n: '11', slug: 'restore', verb: 'Restore', status: 'frontier', mark: 'Alzheimer’s',
        q: 'What would have to become possible before memory restoration is a real intervention?', short: 'what must become possible?',
        mech: 'measure → decode → track → model → distinguish → intervene → restore',
        note: 'Can we understand memory precisely enough to restore access to information the brain can no longer retrieve on its own? Not today. These are the problems in the way.',
        sources: [SRC.roy, SRC.josselyn],
      },
    ],
  },
];

export const stages: Stage[] = groups.flatMap((g) => g.stages);
export const groupOf = (slug: string) => groups.find((g) => g.stages.some((s) => s.slug === slug))!;
