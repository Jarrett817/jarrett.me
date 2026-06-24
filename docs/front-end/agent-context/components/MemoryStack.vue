<template>
  <div class="mt-4 space-y-1.5 text-left" data-reveal-interactive @click.stop>
    <button
      v-for="l in layers"
      :key="l.id"
      type="button"
      class="flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left transition-all"
      :class="active === l.id ? l.activeClass : l.baseClass"
      @click="active = l.id"
    >
      <DeckIcon
        :icon="l.icon"
        :size="18"
        :color-class="active === l.id ? 'text-[#3e66ae]' : 'text-gray-500'"
      />
      <div class="min-w-0 flex-1">
        <div class="text-[0.75rem] font-semibold">{{ l.label }}</div>
        <div class="text-[0.65rem] text-gray-500">{{ l.hint }}</div>
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue';
import { ref } from 'vue';
import { SendAlt, ShrinkScreen, StoragePool } from '@vicons/carbon';
import DeckIcon from './DeckIcon.vue';

const active = ref('disk');

const layers: Array<{
  id: string;
  icon: Component;
  label: string;
  hint: string;
  baseClass: string;
  activeClass: string;
}> = [
  {
    id: 'disk',
    icon: StoragePool,
    label: '磁盘',
    hint: '1 行 JSON = 1 entry',
    baseClass: 'border-gray-200 bg-gray-50',
    activeClass: 'border-[#3e66ae] bg-[#eef3fb]'
  },
  {
    id: 'msg',
    icon: SendAlt,
    label: '送模型',
    hint: 'message 或摘要块',
    baseClass: 'border-gray-200 bg-white ml-4',
    activeClass: 'border-[#3e66ae] bg-[#eef3fb] ml-4'
  },
  {
    id: 'zip',
    icon: ShrinkScreen,
    label: '压缩',
    hint: '多段历史 → 1 条摘要',
    baseClass: 'border-gray-200 bg-white ml-8',
    activeClass: 'border-[#3e66ae] bg-[#eef3fb] ml-8'
  }
];
</script>
