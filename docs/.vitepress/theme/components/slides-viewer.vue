<script setup lang="ts">
import { nextTick, ref, shallowRef, watch } from 'vue';
import { useRoute, withBase } from 'vitepress';
import { data as markdownData } from '../../data/markdown.data';
import { base } from '../../shared/index';
import { resolveSlideMarkdownImages } from '../slideImageUrls';
import { Close } from '@vicons/carbon';
import type Revealjs from 'reveal.js';
import { type Api } from 'reveal.js';
import type Markdownjs from 'reveal.js/plugin/markdown/markdown.esm.js';
import type Highlightjs from 'reveal.js/plugin/highlight/highlight.esm.js';

interface Props {
  visible: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
}>();

const route = useRoute();
const containerRef = ref<HTMLElement | null>(null);
const revealRef = ref<HTMLElement | null>(null);
const themeContainerRef = ref<HTMLElement | null>(null);
const currentTheme = ref('black');
const markdownContent = ref('');

// 缩放：持久化到 localStorage
const ZOOM_STORAGE_KEY = 'reveal-slides-zoom';
const ZOOM_MIN = 0.6;
const ZOOM_MAX = 1.4;
const ZOOM_STEP = 0.1;

const zoomScale = ref(1);

const loadZoom = () => {
  if (typeof window === 'undefined') return;
  const saved = localStorage.getItem(ZOOM_STORAGE_KEY);
  if (saved != null) {
    const v = parseFloat(saved);
    if (!Number.isNaN(v) && v >= ZOOM_MIN && v <= ZOOM_MAX) zoomScale.value = v;
  }
};

const saveZoom = () => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ZOOM_STORAGE_KEY, String(zoomScale.value));
};

const zoomIn = () => {
  zoomScale.value = Math.min(ZOOM_MAX, zoomScale.value + ZOOM_STEP);
  saveZoom();
};

const zoomOut = () => {
  zoomScale.value = Math.max(ZOOM_MIN, zoomScale.value - ZOOM_STEP);
  saveZoom();
};

// Reveal.js 相关类型和实例（仅在客户端使用）
// 使用 shallowRef 因为不需要深度响应式，只需要引用
const revealInstance = shallowRef<Api | null>(null);
const Reveal = shallowRef<typeof Revealjs | null>(null);
const Markdown = shallowRef<typeof Markdownjs | null>(null);
const Highlight = shallowRef<typeof Highlightjs | null>(null);

// 当前加载的主题（CSS模块由Vite自动管理）

// Reveal.js 主题列表（与 themeCSSModules 保持一致）
const themes: Array<{ label: string; value: string }> = [
  { label: '米色 (Beige)', value: 'beige' },
  { label: '黑色 (Black)', value: 'black' },
  { label: '黑色高对比 (Black Contrast)', value: 'black-contrast' },
  { label: '血液 (Blood)', value: 'blood' },
  { label: 'Dracula', value: 'dracula' },
  { label: '联盟 (League)', value: 'league' },
  { label: '月亮 (Moon)', value: 'moon' },
  { label: '夜晚 (Night)', value: 'night' },
  { label: '衬线 (Serif)', value: 'serif' },
  { label: '简约 (Simple)', value: 'simple' },
  { label: '天空 (Sky)', value: 'sky' },
  { label: 'Solarized', value: 'solarized' },
  { label: '白色 (White)', value: 'white' },
  { label: '白色高对比 (White Contrast)', value: 'white-contrast' },
  {
    label: '白色高对比紧凑 (White Contrast Compact)',
    value: 'white-contrast-compact-verbatim-headers'
  }
];

// 切换主题 - 只更新当前主题状态
const loadTheme = (themeName: string) => {
  // 保存到 localStorage
  localStorage.setItem('reveal-theme', themeName);
  currentTheme.value = themeName;
};

// 初始化主题与缩放
const initTheme = () => {
  if (typeof window === 'undefined') return;
  const savedTheme = localStorage.getItem('reveal-theme') || 'black';
  loadTheme(savedTheme);
  loadZoom();
};
// 从构建时加载的数据中获取当前页面的原始 Markdown（与用于图片解析的 url 一致）
const getPageMarkdownAndUrl = (): { src: string; pageUrlPath: string } => {
  const pageUrlPath = route.path.replace(base, '') || '/index';
  const page = markdownData.find(item => item.url === pageUrlPath);
  return { src: page?.src || '', pageUrlPath };
};

// 初始化 Reveal.js
const init = async () => {
  // 仅在客户端执行
  if (typeof window === 'undefined') return;
  if (!containerRef.value || !revealRef.value) return;

  // 动态导入 reveal.js 及其插件（仅在客户端）
  if (!Reveal.value) {
    try {
      const revealModule = await import('reveal.js');
      Reveal.value = revealModule.default || revealModule;

      const markdownModule = await import('reveal.js/plugin/markdown/markdown.esm.js');
      Markdown.value = markdownModule.default || markdownModule;

      const highlightModule = await import('reveal.js/plugin/highlight/highlight.esm.js');
      Highlight.value = highlightModule.default || highlightModule;
    } catch (error) {
      console.error('Failed to load reveal.js:', error);
      return;
    }
  }

  // 清理之前的实例
  if (revealInstance.value) {
    try {
      revealInstance.value.destroy();
    } catch (e) {
      // 忽略销毁错误
    }
    revealInstance.value = null;
  }

  const { src: pageMarkdown, pageUrlPath } = getPageMarkdownAndUrl();
  if (pageMarkdown) {
    markdownContent.value = resolveSlideMarkdownImages({ markdown: pageMarkdown, pageUrlPath });
  } else {
    console.warn('No markdown content found for current page');
    return;
  }

  // 等待 DOM 更新
  await nextTick();

  // 初始化主题（必须在初始化 Reveal.js 之前）
  initTheme();

  // 再次等待，确保主题类已应用
  await nextTick();

  // 初始化 Reveal.js - 使用正确的 API
  revealInstance.value = new Reveal.value(revealRef.value, {
    plugins: [Markdown.value!, Highlight.value!],
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
    markdown: {
      smartypants: true
    },
    highlight: {
      highlightOnLoad: true
    }
  });

  try {
    await revealInstance.value?.initialize();
    // 初始化后再次确保主题正确
    if (revealRef.value) {
      loadTheme(currentTheme.value);
    }
  } catch (error) {
    console.error('Failed to initialize Reveal.js:', error);
  }
};

// 关闭幻灯片
const closeSlides = () => {
  if (revealInstance.value) {
    try {
      revealInstance.value.destroy();
    } catch (e) {
      // 忽略销毁错误
    }
    revealInstance.value = null;
  }

  emit('close');
};

// 监听 visible 变化
watch(
  () => props.visible,
  async newVal => {
    if (newVal) {
      await nextTick();
      await init();
    } else {
      closeSlides();
    }
  }
);
</script>

<template>
  <!-- 预加载所有主题的 CSS -->
  <Teleport to="head">
    <template v-for="theme in themes" :key="theme.value">
      <link
        v-if="currentTheme === theme.value"
        rel="stylesheet"
        :href="withBase(`/revealjs-theme/${theme.value}.css`)"
        :data-reveal-theme="theme.value"
      />
    </template>
  </Teleport>
  <Teleport to="body">
    <div
      v-if="visible"
      ref="containerRef"
      :class="`theme-${currentTheme} reveal-container w-screen h-screen`"
    >
      <div ref="revealRef" class="reveal">
        <!-- 缩放只作用在包裹层，不能写 .slides 的 transform，否则会覆盖 Reveal 的定位 transform，内容会挤到右下角 -->
        <div class="reveal-zoom-wrapper" :style="{ transform: `scale(${zoomScale})` }">
          <div class="slides">
            <section data-markdown data-separator-vertical="^\r?\n--\r?\n$">
              <textarea data-template>{{ markdownContent }}</textarea>
            </section>
          </div>
        </div>
      </div>
    </div>
    <!-- 主题切换区域（左上角，鼠标悬停显示） -->
    <div
      v-if="visible"
      ref="themeContainerRef"
      class="absolute top-0 left-0 shadow-sm w-full h-15 z-[10001] flex justify-between p-4 opacity-0 hover:opacity-100 transition-all duration-300"
    >
      <div class="flex items-center gap-2">
        <n-select
          v-if="themeContainerRef"
          v-model="currentTheme"
          :options="themes"
          placeholder="选择主题"
          size="small"
          :to="themeContainerRef"
          class="w-[200px]"
          @update:value="loadTheme"
        />
        <span class="text-sm text-gray-500">缩放</span>
        <n-button size="small" :disabled="zoomScale <= ZOOM_MIN" @click="zoomOut"> − </n-button>
        <span class="min-w-[3rem] text-center text-sm">{{ Math.round(zoomScale * 100) }}%</span>
        <n-button size="small" :disabled="zoomScale >= ZOOM_MAX" @click="zoomIn"> + </n-button>
      </div>
      <n-button circle @click="closeSlides">
        <template #icon>
          <n-icon><Close /></n-icon>
        </template>
      </n-button>
    </div>
  </Teleport>
</template>

<style lang="scss">
@import 'reveal.js/dist/reveal.css';
@import 'reveal.js/plugin/highlight/zenburn.css';
</style>

<style lang="scss" scoped>
/* Reveal.js 容器样式 */
.reveal-container {
  overflow: hidden;
  position: relative;
}

/* Reveal.js 样式 */
:deep(.reveal) {
  width: 100%;
  height: 100%;
  position: relative;
}

/* 仅缩放幻灯片区域；.slides 的 transform 由 Reveal 自己管理，不可覆盖 */
:deep(.reveal .reveal-zoom-wrapper) {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform-origin: center center;
}

:deep(.reveal .reveal-zoom-wrapper .slides) {
  width: 100%;
  height: 100%;
}

/* 长竖图单独一页：限制可视高度，内部滚动，避免撑破幻灯片 */
:deep(.reveal-long-image-scroll) {
  max-height: 72vh;
  overflow-y: auto;
  overflow-x: hidden;
  margin: 0 auto;
  padding: 0 0.25rem;
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;
  text-align: center;
}

:deep(.reveal-long-image-scroll img) {
  max-width: 100%;
  height: auto;
  vertical-align: top;
  display: inline-block;
}
</style>
