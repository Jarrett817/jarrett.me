<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, shallowRef, watch, type Component } from 'vue';
import { useRoute } from 'vitepress';
import { data as markdownData } from '../../data/markdown.data';
import { base } from '../../shared/index';
import { resolveSlideMarkdownImages } from '../slideImageUrls';
import { getInteractiveDeckLoader } from '../interactive-slides';
import { Close } from '@vicons/carbon';
import type Revealjs from 'reveal.js';
import { type Api } from 'reveal.js';
import type Markdownjs from 'reveal.js/plugin/markdown/markdown.esm.js';
import type Highlightjs from 'reveal.js/plugin/highlight/highlight.esm.js';
import 'reveal.js/dist/reveal.css';

interface Props {
  visible: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
}>();

const route = useRoute();
/** 对应 React 示例里的 deckDivRef */
const deckDivRef = ref<HTMLElement | null>(null);
const deckComponent = shallowRef<Component | null>(null);

const ZOOM_MIN = 0.6;
const ZOOM_MAX = 1.4;
const ZOOM_STEP = 0.1;
const zoomScale = ref(1);

const revealInstance = shallowRef<Api | null>(null);
const RevealCtor = shallowRef<typeof Revealjs | null>(null);
const Markdown = shallowRef<typeof Markdownjs | null>(null);
const Highlight = shallowRef<typeof Highlightjs | null>(null);

let useVueMode = false;

const zoomIn = () => {
  zoomScale.value = Math.min(ZOOM_MAX, zoomScale.value + ZOOM_STEP);
};

const zoomOut = () => {
  zoomScale.value = Math.max(ZOOM_MIN, zoomScale.value - ZOOM_STEP);
};

const toDocKey = (path: string): string => {
  const stripped = path.startsWith(base) ? path.slice(base.length) : path;
  return (
    stripped
      .replace(/^\/+/, '')
      .replace(/\.html$/, '')
      .replace(/\/$/, '') || 'index'
  );
};

const toPageUrlPath = (path: string): string => {
  const key = toDocKey(path);
  return key === 'index' ? '/' : `/${key}`;
};

const getPageMarkdownAndUrl = (): { src: string; pageUrlPath: string } => {
  const pageKey = toDocKey(route.path);
  const page = markdownData.find(item => toDocKey(item.url) === pageKey);
  return { src: page?.src || '', pageUrlPath: toPageUrlPath(route.path) };
};

const mountMarkdownSlides = (slidesEl: HTMLElement, content: string) => {
  slidesEl.innerHTML = '';
  const section = document.createElement('section');
  section.setAttribute('data-markdown', '');
  section.setAttribute('data-separator-vertical', '^\\r?\\n--\\r?\\n$');
  const textarea = document.createElement('textarea');
  textarea.setAttribute('data-template', '');
  textarea.textContent = content;
  section.appendChild(textarea);
  slidesEl.appendChild(section);
};

const loadRevealModules = async () => {
  if (RevealCtor.value) return true;

  try {
    const revealModule = await import('reveal.js');
    RevealCtor.value = revealModule.default || revealModule;

    const markdownModule = await import('reveal.js/plugin/markdown/markdown.esm.js');
    Markdown.value = markdownModule.default || markdownModule;

    const highlightModule = await import('reveal.js/plugin/highlight/highlight.esm.js');
    Highlight.value = highlightModule.default || highlightModule;
    return true;
  } catch (error) {
    console.error('Failed to load reveal.js:', error);
    return false;
  }
};

/** Vue 组件 deck：先渲染 <section>，再 initialize（同 React useEffect） */
const prepareVueDeck = async () => {
  const pageKey = toDocKey(route.path);
  const deckLoader = getInteractiveDeckLoader(pageKey);
  if (!deckLoader) return false;

  deckComponent.value = null;
  await nextTick();

  const mod = await deckLoader();
  deckComponent.value = mod.default;

  // 等 Vue 把 <section> 写进 .slides
  await nextTick();
  await nextTick();

  const slidesEl = deckDivRef.value?.querySelector('.slides');
  if (!slidesEl?.querySelector('section')) {
    console.warn('Slide sections not ready before Reveal init');
    return false;
  }
  return true;
};

const prepareMarkdownDeck = () => {
  deckComponent.value = null;
  const slidesEl = deckDivRef.value?.querySelector('.slides');
  if (!slidesEl) return false;

  const { src: pageMarkdown, pageUrlPath } = getPageMarkdownAndUrl();
  if (!pageMarkdown) {
    console.warn('No markdown content found for current page');
    return false;
  }

  mountMarkdownSlides(
    slidesEl,
    resolveSlideMarkdownImages({ markdown: pageMarkdown, pageUrlPath })
  );
  return true;
};

const initReveal = async () => {
  if (typeof window === 'undefined') return;
  if (!deckDivRef.value) return;
  if (revealInstance.value) return;

  if (!(await loadRevealModules())) return;

  const pageKey = toDocKey(route.path);
  useVueMode = !!getInteractiveDeckLoader(pageKey);

  const ready = useVueMode ? await prepareVueDeck() : prepareMarkdownDeck();
  if (!ready) return;

  zoomScale.value = 1;
  await nextTick();

  const plugins = useVueMode ? [Highlight.value!] : [Markdown.value!, Highlight.value!];

  revealInstance.value = new RevealCtor.value!(deckDivRef.value, {
    plugins,
    hash: true,
    controls: true,
    progress: true,
    center: true,
    touch: true,
    keyboard: true,
    overview: true,
    transition: 'slide',
    transitionSpeed: 'default',
    backgroundTransition: 'fade',
    fragmentInURL: true,
    help: true,
    hideInactiveCursor: true,
    markdown: { smartypants: true },
    highlight: { highlightOnLoad: true }
  });

  try {
    await revealInstance.value.initialize();
    revealInstance.value.sync();
    revealInstance.value.layout();
  } catch (error) {
    console.error('Failed to initialize Reveal.js:', error);
  }
};

const destroyReveal = () => {
  if (revealInstance.value) {
    try {
      revealInstance.value.destroy();
    } catch {
      // ignore
    }
    revealInstance.value = null;
  }

  deckComponent.value = null;

  if (!useVueMode) {
    const slidesEl = deckDivRef.value?.querySelector('.slides');
    if (slidesEl) slidesEl.innerHTML = '';
  }
};

const requestClose = () => {
  emit('close');
};

watch(
  () => props.visible,
  async visible => {
    if (visible) {
      await nextTick();
      await initReveal();
    } else {
      destroyReveal();
    }
  }
);

onBeforeUnmount(() => {
  destroyReveal();
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="reveal-presentation reveal-container w-screen h-screen"
      :style="{ transform: `scale(${zoomScale})`, transformOrigin: 'center center' }"
    >
      <!-- 结构与 React 官方示例一致：.reveal > .slides > section -->
      <div ref="deckDivRef" class="reveal reveal-interactive-deck">
        <div class="slides">
          <component :is="deckComponent" v-if="deckComponent" />
        </div>
      </div>
    </div>

    <div
      v-if="visible"
      class="slides-toolbar absolute top-0 left-0 w-full z-[10001] flex justify-between items-center px-4 py-3 opacity-0 hover:opacity-100 transition-opacity duration-300"
    >
      <div class="flex items-center gap-2">
        <span class="text-sm text-slate-600">缩放</span>
        <n-button size="small" :disabled="zoomScale <= ZOOM_MIN" @click="zoomOut"> − </n-button>
        <span class="min-w-[3rem] text-center text-sm text-slate-700">{{
          Math.round(zoomScale * 100)
        }}%</span>
        <n-button size="small" :disabled="zoomScale >= ZOOM_MAX" @click="zoomIn"> + </n-button>
      </div>
      <n-button circle @click="requestClose">
        <template #icon>
          <n-icon><Close /></n-icon>
        </template>
      </n-button>
    </div>
  </Teleport>
</template>

<style lang="scss">
@use '../style/reveal-presentation.scss';
</style>

<style lang="scss" scoped>
.reveal-container {
  overflow: hidden;
  position: relative;
  z-index: 10000;
}

.slides-toolbar {
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0));
  pointer-events: none;
}

.slides-toolbar > * {
  pointer-events: auto;
}

:deep(.reveal) {
  width: 100%;
  height: 100%;
}

:deep(.reveal .slides) {
  width: 100%;
  height: 100%;
}
</style>
