<template>
  <div class="mt-3 text-left" data-reveal-interactive @click.stop>
    <div class="flex items-center justify-between gap-1">
      <template v-for="(s, i) in steps" :key="s.label">
        <button
          type="button"
          class="flex flex-1 flex-col items-center rounded-lg border px-1 py-2 transition-all"
          :class="
            active >= i ? 'border-[#3e66ae] bg-[#eef3fb]' : 'border-gray-200 bg-white'
          "
          @click="active = i"
        >
          <DeckIcon
            :icon="s.icon"
            :size="20"
            :color-class="active >= i ? 'text-[#3e66ae]' : 'text-gray-400'"
          />
          <span class="mt-1 text-[0.6rem] font-medium text-gray-700">{{ s.label }}</span>
        </button>
        <DeckIcon
          v-if="i < steps.length - 1"
          :icon="ArrowRight"
          :size="14"
          color-class="text-gray-300"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue';
import { ref } from 'vue';
import { ArrowRight, Cut, Document, Renew, Ruler } from '@vicons/carbon';
import DeckIcon from './DeckIcon.vue';

const active = ref(0);

const steps: Array<{ icon: Component; label: string }> = [
  { icon: Ruler, label: '定切点' },
  { icon: Cut, label: '序列化' },
  { icon: Document, label: '写摘要' },
  { icon: Renew, label: '重载' }
];
</script>
