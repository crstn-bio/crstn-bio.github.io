// 콘텐츠 읽기 도우미. 글은 전부 src/content/ 에 있고, 컴포넌트는 여기서 받아 그리기만 해요.
//   site.yaml          → 홈 · 공통 글
//   roadmap/*.md       → 로드맵 노드 (파일 하나 = 노드 하나)
import yaml from 'js-yaml';
import { getCollection, type CollectionEntry } from 'astro:content';
import raw from '../content/site.yaml?raw';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const site: any = (() => {
  try { return yaml.load(raw) ?? {}; }
  catch (e: any) {
    const line = e?.mark ? ` (line ${e.mark.line + 1})` : '';
    throw new Error(`src/content/site.yaml${line}: ${e?.reason ?? e?.message}. Check the spaces at the start of the line, and put text containing ":" in "quotes".`);
  }
})();

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** 사이트 안 경로(/…)에 base를 붙여요. 외부 주소나 #앵커는 그대로. */
export const url = (u = '') => (u.startsWith('/') && !u.startsWith('//') ? `${BASE}${u}` : u);
/** 홈의 앵커(#why)를 어느 페이지에서든 동작하게 */
export const homeUrl = (h = '') => (h.startsWith('#') ? `${BASE}/${h}` : url(h));

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** 짧은 글 안의 *기울임*, **굵게**, [링크](주소), 줄바꿈만 처리하는 작은 변환기 */
export function md(text: unknown): string {
  if (text == null) return '';
  return esc(String(text))
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, h) => {
      const ext = /^https?:/.test(h);
      return `<a href="${url(h)}"${ext ? ' target="_blank" rel="noreferrer"' : ''}>${t}</a>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<i>$2</i>')
    .replace(/\n/g, '<br />');
}

export const statusLabel = (kind: string, override?: string) => override || site.status_labels?.[kind] || kind;

export type Node = CollectionEntry<'roadmap'> & { slug: string; n: string };

/** 공개된 로드맵 노드를 순서대로. 번호(01, 02…)는 순서에서 자동으로 붙어요. */
export async function getRoadmap(): Promise<Node[]> {
  const all = await getCollection('roadmap', (e) => e.data.published !== false);
  return all
    .sort((a, b) => a.data.order - b.data.order || a.id.localeCompare(b.id))
    .map((e, i) => ({ ...e, slug: e.id.replace(/\.md$/, ''), n: String(i + 1).padStart(2, '0') }));
}

export const projects = (): any[] => site.projects ?? [];
