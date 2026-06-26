<template>
  <div class="mt-4 text-left">
    <div v-if="part === 'limits'" class="flex items-center gap-3">
      <div class="flex-1 rounded-lg border-2 border-[#3e66ae] bg-[#eef3fb] px-3 py-2 text-center">
        <div class="text-[0.8rem] text-gray-500">LLM 窗口</div>
        <div class="text-sm font-bold text-[#3e66ae]">有限</div>
      </div>
      <DeckIcon :icon="Close" :size="18" color-class="text-gray-400" />
      <div class="flex-[2] rounded-lg border border-dashed border-gray-300 px-3 py-2 text-center">
        <div class="text-[0.8rem] text-gray-500">Agent 任务</div>
        <div class="text-sm font-bold text-gray-700">无限长</div>
      </div>
    </div>

    <div v-else-if="part === 'blocks'" class="grid grid-cols-3 gap-2">
      <div
        v-for="b in blocks"
        :key="b.id"
        class="flex flex-col items-center rounded-lg border border-[#dbe3f0] bg-white p-2 text-center"
      >
        <DeckIcon :icon="b.icon" :size="22" color-class="text-[#3e66ae]" />
        <div class="mt-1 text-[0.75rem] font-semibold text-gray-800">{{ b.label }}</div>
      </div>
    </div>

    <div
      v-else
      class="flex flex-wrap items-center justify-center gap-1 text-[0.72rem] font-medium text-gray-600"
    >
      <span class="rounded-full bg-slate-100 px-2 py-1">用户</span>
      <DeckIcon :icon="ArrowRight" :size="14" color-class="text-gray-400" />
      <span class="rounded-full bg-[#eef3fb] px-2 py-1 text-[#3e66ae]">LLM</span>
      <DeckIcon :icon="ArrowRight" :size="14" color-class="text-gray-400" />
      <span class="rounded-full bg-slate-100 px-2 py-1">工具</span>
      <DeckIcon :icon="ArrowRight" :size="14" color-class="text-gray-400" />
      <span class="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">toolResult</span>
      <DeckIcon :icon="ArrowRight" :size="14" color-class="text-gray-400" />
      <DeckIcon :icon="Renew" :size="16" color-class="text-gray-400" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight, Close, MachineLearning, Renew, SendAlt, ShrinkScreen } from '@vicons/carbon';
import DeckIcon from './DeckIcon.vue';

withDefaults(
  defineProps<{
    part?: 'limits' | 'blocks' | 'loop';
  }>(),
  { part: 'limits' }
);

const blocks = [
  { id: 'turn', icon: SendAlt, label: '当前对话' },
  { id: 'zip', icon: ShrinkScreen, label: '上下文压缩' },
  { id: 'mem', icon: MachineLearning, label: '持久记忆' }
];
</script>
