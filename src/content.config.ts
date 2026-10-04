import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// 연구 프로젝트 하나 = src/content/research/ 안의 마크다운 파일 하나
const research = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/research' }),
  schema: z.object({
    title: z.string(),
    short: z.string(),            // 목록에 보이는 짧은 제목
    period: z.string(),
    order: z.number(),            // 작을수록 위에 표시
    role: z.string(),
    setting: z.string(),          // 소속 / 맥락
    summary: z.string(),
    methods: z.array(z.string()),
    tools: z.array(z.string()),
    status: z.enum(['ongoing', 'complete']),
    figure: z.enum(['amyloid-operating-points']).optional(),
    links: z.array(z.object({ label: z.string(), href: z.string() })).default([]),
  }),
});

// 로드맵 노드 하나 = src/content/roadmap/ 안의 마크다운 파일 하나. 파일 이름이 주소가 돼요 (/how/<파일이름>/).
const status = z.enum(['current', 'done', 'build', 'next', 'question', 'concept', 'frontier']);
const roadmap = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/roadmap' }),
  schema: z.object({
    title: z.string(),                       // 노드 이름 (로드맵 · 페이지)
    order: z.number(),                       // 로드맵 순서 (작을수록 앞)
    published: z.boolean().default(true),    // false면 숨김
    status,
    status_label: z.string().optional(),     // 상태 표시 글자를 바꾸고 싶을 때
    group: z.string().default(''),           // 페이지 위쪽 경로에 보이는 묶음 이름
    tag: z.string().optional(),              // 작은 꼬리표 (예: Parkinson’s)
    question: z.string(),
    mechanism: z.string().default(''),
    diagram: z.union([z.string(), z.array(z.string())]).optional(), // 내장 도안 이름 또는 /images/… 경로
    diagram_caption: z.string().optional(),
    card: z.object({
      label: z.string().default(''),
      status: status.optional(),
      status_label: z.string().optional(),
      title: z.string().default(''),
      text: z.string().optional(),
      rows: z.array(z.object({ label: z.string(), text: z.string() })).default([]),
      note: z.string().optional(),
    }).optional(),
    steps: z.array(z.object({ name: z.string(), text: z.string() })).optional(),
    evidence: z.array(z.object({ label: z.string(), project: z.string() })).default([]),
    sources: z.array(z.object({ label: z.string(), url: z.string() })).default([]),
  }),
});

export const collections = { research, roadmap };
