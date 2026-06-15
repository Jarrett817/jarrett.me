<script setup lang="ts">
import DefaultTheme from 'vitepress/theme';
import { ref, onMounted } from 'vue';
import { darkTheme, lightTheme } from 'naive-ui';
import { Maximize, PlayOutline } from '@vicons/carbon';
import { defineClientComponent, useData } from 'vitepress';
import Plum from './Plum/index.vue';
import TimeTree from './TimeTree/index.vue';

// 懒加载SlidesViewer组件
const SlidesViewer = defineClientComponent(() => import('./slides-viewer.vue'));

const { frontmatter } = useData();
const data = useData();

const { Layout } = DefaultTheme;
const slidesVisible = ref(false);

const theme = ref<'dark' | 'light'>('light');
const APPEARANCE_KEY = 'vitepress-theme-appearance';

const setTheme = (isDark: boolean) => {
  theme.value = isDark ? 'dark' : 'light';
};
onMounted(() => {
  listenThemeChange();
  setTheme(isDarkMode());
});

const isDarkMode = () => {
  // 监听vitepress设置的主题
  const query = window.matchMedia('(prefers-color-scheme: dark)');
  let userPreference = localStorage.getItem(APPEARANCE_KEY) || 'auto';
  return userPreference === 'auto' ? query.matches : userPreference === 'dark';
};

const listenThemeChange = () => {
  const buttonEl = document.querySelector('.VPSwitchAppearance');
  buttonEl && buttonEl.addEventListener('click', () => setTheme(isDarkMode()));
};

const openFullScreenMode = () => {
  const mainContent: HTMLElement = document.querySelector('div.VPDoc>.container') || document.body;
  const contentBlock: HTMLElement | null = mainContent.querySelector('.content-container');
  if (contentBlock) {
    type Styles = Partial<Omit<CSSStyleDeclaration, 'parentRule' | 'length'>>;
    const styles: Styles = {
      padding: '40px',
      overflow: 'auto',
      backgroundColor: 'var(--vp-c-bg)',
      color: 'var(--vp-c-text-1)'
    };
    for (const key in styles) {
      mainContent.style[key] = styles[key] as string;
    }
    const contentStyles: Styles = {
      maxWidth: '1000px'
    };
    for (const key in contentStyles) {
      contentBlock.style[key] = contentStyles[key] as string;
    }
    mainContent.requestFullscreen();
  }
};
</script>

<template>
  <n-config-provider :theme="theme === 'dark' ? darkTheme : lightTheme">
    <!-- <ClientOnly v-if="slidesVisible">
      <j-slides />
    </ClientOnly> -->

    <Plum
      v-if="frontmatter.value?.layout && !['home', 'page'].includes(frontmatter.value.layout)"
    />

    <Layout v-show="!slidesVisible">
      <template v-if="!data.frontmatter.value.isMapMode" #home-features-after
        ><TimeTree class="time-tree" />
      </template>

      <template #layout-bottom>
        <div
          class="fixed right-6 bottom-[100px] flex flex-col gap-3 z-[100] pointer-events-auto md:right-4 md:bottom-20 md:gap-2"
        >
          <n-button
            quaternary
            circle
            type="info"
            size="large"
            @click="slidesVisible = true"
            title="播放幻灯片"
            class="shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg bg-[var(--vp-c-bg-soft)] border border-[var(--vp-c-divider)]"
          >
            <template #icon>
              <n-icon size="20"><PlayOutline /></n-icon>
            </template>
          </n-button>
          <n-button
            quaternary
            circle
            type="info"
            size="large"
            @click="openFullScreenMode"
            title="全屏模式"
            class="shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg bg-[var(--vp-c-bg-soft)] border border-[var(--vp-c-divider)]"
          >
            <template #icon>
              <n-icon size="20"><Maximize /></n-icon>
            </template>
          </n-button>
        </div>
        <n-back-top />
      </template>
    </Layout>

    <!-- 幻灯片播放器 -->
    <ClientOnly>
      <SlidesViewer :visible="slidesVisible" @close="slidesVisible = false" />
    </ClientOnly>
  </n-config-provider>
</template>

<style lang="scss" scoped>
@use '../style//function.scss' as *;

.time-tree {
  position: absolute;
  bottom: 112px;
  right: 10px;

  @include Mobile {
    position: relative;
    left: 34%;
    bottom: 0;
  }

  &,
  :deep(canvas) {
    height: 37vh;
  }
}
</style>
