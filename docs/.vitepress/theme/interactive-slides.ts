import type { Component } from 'vue';

/** 路由 key → 交互式幻灯片 Vue 组件（在 slides-viewer 内直接渲染，保留响应式） */
export const INTERACTIVE_SLIDE_DECKS: Record<string, () => Promise<{ default: Component }>> = {
  'front-end/agent-context': () => import('../../front-end/agent-context/slides-deck.vue')
};

export const getInteractiveDeckLoader = (pageKey: string) => INTERACTIVE_SLIDE_DECKS[pageKey];
