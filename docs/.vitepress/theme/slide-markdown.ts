/** 仅注册需要 Reveal markdown 模式的页面（按需 ?raw 加载，避免扫全站 md） */
export const SLIDE_MARKDOWN_LOADERS: Record<string, () => Promise<{ default: string }>> = {
  'ai-robot': () => import('../../ai-robot/index.md?raw')
};

export const getSlideMarkdownLoader = (pageKey: string) => SLIDE_MARKDOWN_LOADERS[pageKey];
