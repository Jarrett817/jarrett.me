<template>
  <div class="mt-4 text-left" data-reveal-interactive @click.stop>
    <div class="flex flex-wrap items-center justify-center gap-2">
      <template v-for="(step, i) in steps" :key="step.id">
        <button
          type="button"
          class="min-w-[88px] rounded-lg border px-2 py-2 text-center transition-all"
          :class="
            active === step.id
              ? 'border-[#3e66ae] bg-[#eef3fb]'
              : 'border-gray-200 bg-white'
          "
          @click="active = step.id"
        >
          <DeckIcon
            :icon="step.icon"
            :size="20"
            :color-class="active === step.id ? 'text-[#3e66ae]' : 'text-gray-500'"
          />
          <div class="mt-0.5 text-[0.7rem] font-bold text-gray-800">{{ step.label }}</div>
        </button>
        <DeckIcon
          v-if="i < steps.length - 1"
          :icon="ArrowRight"
          :size="14"
          color-class="text-gray-300"
        />
      </template>
    </div>
    <p class="mt-2 rounded-lg bg-slate-100 px-3 py-2 text-[0.75rem] leading-snug text-gray-700">
      {{ current.hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue';
import { computed, ref } from 'vue';
import { ArrowRight, Download, Settings, Upload } from '@vicons/carbon';
import DeckIcon from './DeckIcon.vue';

const active = ref('read');

const steps: Array<{
  id: string;
  icon: Component;
  label: string;
  hint: string;
}> = [
  {
    id: 'read',
    icon: Download,
    label: '读',
    hint: '任务开始：按任务描述检索摘要、规则与历史偏好，注入 system prompt。'
  },
  {
    id: 'use',
    icon: Settings,
    label: '用',
    hint: '执行中：messages 维持任务状态；按需检索外部记忆或调用查记忆 Tool。'
  },
  {
    id: 'write',
    icon: Upload,
    label: '写',
    hint: '任务结束：将新偏好与结论写入持久化存储；清空短期 messages。'
  }
];

const current = computed(() => steps.find(s => s.id === active.value)!);
</script>
