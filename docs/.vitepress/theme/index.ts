import { defineAsyncComponent, type Component } from 'vue';
import Layout from './components/base-layout.vue';
import './style/commom.scss';
import { EnhanceAppContext, type Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';

const lazy = (loader: () => Promise<{ default: Component }>) =>
  defineAsyncComponent(loader);

export default <Theme>{
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }: EnhanceAppContext) {
    app.component('MindMap', lazy(() => import('./components/mind-map/index.vue')));
    app.component('KnowledgeMap', lazy(() => import('./components/knowledge-map.vue')));
    app.component('CodeEditor', lazy(() => import('./components/code-editor/index.vue')));
    app.component('CaseComparison', lazy(() => import('./components/case-comparison.vue')));
  }
};
