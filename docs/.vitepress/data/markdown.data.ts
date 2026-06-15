import { createContentLoader } from 'vitepress';

export interface MarkdownData {
  url: string;
  frontmatter: Record<string, any>;
  src?: string;
}

declare const data: MarkdownData[];
export { data };

export default createContentLoader('**/*.md', {
  includeSrc: true, // 包含原始 Markdown 源
  render: false, // 不需要渲染后的 HTML
  excerpt: false, // 不需要摘要
  transform(rawData): MarkdownData[] {
    return rawData;
  }
});
