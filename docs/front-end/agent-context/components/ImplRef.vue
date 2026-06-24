<script setup lang="ts">
import { computed } from 'vue';
import { implRefs, type ImplBlock, type ImplRefKey } from '../impl-refs';

const props = withDefaults(
  defineProps<{
    refKey: ImplRefKey;
    mode?: 'slide' | 'read';
  }>(),
  { mode: 'read' }
);

const blocks = () => implRefs[props.refKey];
const isSlide = computed(() => props.mode === 'slide');

const summaryClass = computed(() =>
  [
    'list-none cursor-pointer font-semibold text-gray-500 [&::-webkit-details-marker]:hidden',
    isSlide.value ? 'text-[0.42em]' : 'text-xs'
  ].join(' ')
);

const preClass = computed(() =>
  [
    'max-w-full overflow-x-auto rounded-md border border-gray-200 bg-gray-50 px-2.5 py-2 leading-relaxed text-gray-800',
    isSlide.value ? 'text-[0.36em]' : 'text-[0.68rem]'
  ].join(' ')
);

const badgeClass = (product: ImplBlock['product']) =>
  product === 'pi'
    ? 'bg-slate-100 text-slate-700 border-slate-200'
    : 'bg-orange-50 text-orange-800 border-orange-200';
</script>

<template>
  <details class="mt-3 text-left">
    <summary :class="summaryClass">实现对照（pi-coding-agent / Claude Code）</summary>
    <div v-for="block in blocks()" :key="block.path" class="mt-2.5">
      <div class="mb-1 flex flex-wrap items-center gap-1.5">
        <span
          class="rounded border px-1.5 py-0.5 text-[0.65rem] font-semibold"
          :class="badgeClass(block.product)"
        >
          {{ block.label }}
        </span>
        <span class="text-[0.65rem] text-gray-500">{{ block.path }}</span>
      </div>
      <pre :class="preClass"><code>{{ block.code }}</code></pre>
    </div>
  </details>
</template>
