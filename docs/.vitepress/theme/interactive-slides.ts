import type { Component } from 'vue';

/** 路由 key → 纯 Vue 幻灯片 deck（多根 <section>，须为 .slides 直接子节点） */
export const INTERACTIVE_SLIDE_DECKS: Record<string, () => Promise<{ default: Component }>> = {
  'front-end/agent-context': () => import('../../front-end/agent-context/article-sections.vue')
};

export const getInteractiveDeckLoader = (pageKey: string) => INTERACTIVE_SLIDE_DECKS[pageKey];
