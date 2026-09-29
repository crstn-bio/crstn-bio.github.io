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

export const collections = { research };
