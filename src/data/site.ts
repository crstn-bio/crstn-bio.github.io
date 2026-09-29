// 사이트 전체에서 쓰는 개인 정보. 여기만 고치면 모든 페이지에 반영돼요.
export const site = {
  name: 'Christine Park',
  altName: 'Hanbi Park',
  title: 'Neurophysiology & computational neuroscience',
  location: 'Toronto, Ontario',
  current: 'Research assistant and thesis student at the Krembil Brain Institute, University Health Network',
  intro:
    'I study how the brain responds when we deliberately stimulate it. My thesis work looks at pairing accelerated theta-burst transcranial focused ultrasound with functional electrical stimulation, and my analysis work lives in reproducible R pipelines.',
  about: [
    'I am a final-year Honours BSc student at the University of Toronto, specialising in Human Biology, Physiology and Immunology. At UHN’s Krembil Brain Institute I work on neuromodulation and neurophysiology, which is where I spend most of my research hours.',
    'Before and alongside the lab, I have worked on the clinical side of care: preparing perioperative spaces, taking vital signs, and getting imaging records in front of physicians. It keeps me close to the patients this research is ultimately for.',
    'My interests sit between computational neuroscience and neurotechnology — building analyses that are honest about their uncertainty, and asking how stimulation protocols translate into measurable change.',
  ],
  // TODO: 공개해도 되는 이메일 주소로 바꾸세요.
  email: 'your.email@mail.utoronto.ca',
  links: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/christine-park-7ab9ab427' },
    // { label: 'GitHub', href: 'https://github.com/<아이디>' },
    // { label: 'Google Scholar', href: '...' },
  ],
  cv: '/cv.pdf', // public/cv.pdf 파일을 넣으면 연결돼요
};

export const experience = [
  {
    role: 'Research Assistant & Thesis Student',
    org: 'Krembil Brain Institute, UHN',
    period: 'Aug 2026 – present',
    detail:
      'Investigating the effects of combined accelerated theta-burst transcranial focused ultrasound stimulation (a-tbTUS) and functional electrical stimulation.',
    kind: 'research',
  },
  {
    role: 'Clinical Supporter',
    org: 'Kensington Vision and Research Centre',
    period: 'Jun 2026 – present',
    detail:
      'Retrieve patient charts and ophthalmic imaging records, including OCT results, so the right information is ready for physician review. Work daily in the electronic medical record.',
    kind: 'clinical',
  },
  {
    role: 'Research Intern',
    org: 'Stepped Care Solutions',
    period: 'Sep – Dec 2025',
    detail:
      'Ran a mixed-methods review of 40+ peer-reviewed and grey-literature sources from PubMed and Scopus on integrating PROMs and PREMs into digital mental health care.',
    kind: 'research',
  },
  {
    role: 'Perioperative Supporter',
    org: 'Kensington Screening Clinic',
    period: 'Sep 2025 – present',
    detail:
      'Prepare and disinfect beds before and between appointments, keep care spaces ready, and support staff with vital signs.',
    kind: 'clinical',
  },
  {
    role: 'Amgen Biotech Experience',
    org: 'Amgen × University of Toronto',
    period: 'Mar – Jun 2020',
    detail:
      'Hands-on molecular biology and research-design programme run in partnership between the University of Toronto and Amgen.',
    kind: 'research',
  },
];

export const education = {
  school: 'University of Toronto',
  degree: 'Honours Bachelor of Science',
  programme: 'Human Biology, Physiology and Immunology',
  period: '2022 – Jun 2027',
  courses: ['GGR274 Computer & Data Science', 'PCL200 Drugs & the Brain'],
};

export const skills = {
  Analysis: ['R', 'Python', 'Statistical modelling', 'Cross-validation & bootstrap inference', 'Machine learning'],
  Research: ['Neurophysiology', 'Neuromodulation', 'Evidence synthesis', 'Literature reviews', 'Experimental design'],
  Clinical: ['Electronic medical records', 'Vital signs', 'Perioperative preparation'],
};

export const honours = [
  { name: 'Canadian Senior Mathematics Contest, global top 25%', by: 'University of Waterloo', year: '2020' },
  { name: 'Ambassador Leadership Recognition Award', by: 'GVSS', year: '2019' },
];
