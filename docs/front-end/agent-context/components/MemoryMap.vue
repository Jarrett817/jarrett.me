<template>
  <div class="mt-4 text-left" data-reveal-interactive @click.stop>
    <div class="grid grid-cols-3 gap-2">
      <button
        v-for="m in items"
        :key="m.id"
        type="button"
        class="rounded-lg border p-2 text-center transition-all"
        :class="
          active === m.id
            ? 'border-[#3e66ae] bg-[#eef3fb] shadow-sm'
            : 'border-gray-200 bg-white'
        "
        @click="active = m.id"
      >
        <DeckIcon
          :icon="m.icon"
          :size="20"
          :color-class="active === m.id ? 'text-[#3e66ae]' : 'text-gray-500'"
        />
        <div class="mt-0.5 text-[0.7rem] font-semibold">{{ m.label }}</div>
        <div class="mt-1 text-[0.6rem]" :class="m.inLlm ? 'text-emerald-600' : 'text-gray-400'">
          {{ m.inLlm ? '进模型' : '仅落盘' }}
        </div>
      </button>
    </div>
    <p v-if="detail" class="mt-2 rounded-lg bg-slate-100 px-3 py-2 text-[0.72rem] text-gray-600">
      {{ detail }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue';
import { computed, ref } from 'vue';
import {
  Branch,
  Chat,
  Document,
  Rule,
  Save,
  SkipForward
} from '@vicons/carbon';
import DeckIcon from './DeckIcon.vue';

const active = ref('work');

const items: Array<{
  id: string;
  icon: Component;
  label: string;
  inLlm: boolean;
  hint: string;
}> = [
  { id: 'work', icon: Chat, label: '工作记忆', inLlm: true, hint: '当前分支消息，每轮拼入' },
  { id: 'sum', icon: Document, label: '压缩摘要', inLlm: true, hint: '旧对话语义压缩' },
  { id: 'rule', icon: Rule, label: '项目规则', inLlm: true, hint: '磁盘说明，每轮可重注入' },
  {
    id: 'branch',
    icon: Branch,
    label: '探索分支',
    inLlm: true,
    hint: '切换方案时保留另一条分支的上下文'
  },
  { id: 'ext', icon: Save, label: '扩展状态', inLlm: false, hint: '持久化存储，按需注入' },
  {
    id: 'queue',
    icon: SkipForward,
    label: '运行时插队',
    inLlm: true,
    hint: '修改下一轮执行方向'
  }
];

const detail = computed(() => items.find(i => i.id === active.value)?.hint ?? '');
</script>
