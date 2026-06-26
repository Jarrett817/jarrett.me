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
        <div class="text-[0.8rem] text-gray-500">{{ l.hint }}</div>
      </div>
    </button>
    <div v-if="currentLayer" class="mt-2 rounded-lg border border-[#dbe3f0] bg-white px-3 py-2">
      <p class="text-[0.72rem] leading-snug text-gray-700">{{ currentLayer.detail }}</p>
      <CodeBlock v-if="currentLayer.code" :code="currentLayer.code" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue';
import { computed, ref } from 'vue';
import { SendAlt, ShrinkScreen, StoragePool } from '@vicons/carbon';
import DeckIcon from './DeckIcon.vue';
import CodeBlock from './CodeBlock.vue';

const active = ref('disk');

interface LayerItem {
  id: string;
  icon: Component;
  label: string;
  hint: string;
  detail: string;
  code?: string;
  baseClass: string;
  activeClass: string;
}

const layers: LayerItem[] = [
  {
    id: 'disk',
    icon: StoragePool,
    label: '磁盘',
    hint: '1 行 JSON = 1 entry',
    detail:
      'pi 的 session 文件是 JSONL 格式，每行一个 SessionEntry（message / compaction / branch_summary）。支持 tree 结构：entry 有 parentUuid 指向父节点，可以分支和导航。',
    code: `type SessionEntry =
  | { type: "message"; message: AgentMessage }
  | { type: "compaction"; summary: string; firstKeptEntryId: string }
  | { type: "branch_summary"; summary: string }`,
    baseClass: 'border-gray-200 bg-gray-50',
    activeClass: 'border-[#3e66ae] bg-[#eef3fb]'
  },
  {
    id: 'msg',
    icon: SendAlt,
    label: '送模型',
    hint: 'convertToLlm 转为 API 可接受格式',
    detail:
      '读回时从 leaf 向 root 遍历 entry 树，遇到 compaction entry 则提取 summary 作为首条 user 消息；后续 message entry 原样保留。最终通过 convertToLlm 映射成 LLM 协议格式。',
    code: `// convertToLlm: AgentMessage[] → Message[]
// compactionSummary → { role: "user", content: summary }
// notification → [] (过滤)`,
    baseClass: 'border-gray-200 bg-white ml-4',
    activeClass: 'border-[#3e66ae] bg-[#eef3fb] ml-4'
  },
  {
    id: 'zip',
    icon: ShrinkScreen,
    label: '压缩',
    hint: '多段历史 → 1 条摘要',
    detail:
      '压缩后旧 entry 不删除（支持回溯），新 CompactionEntry 记录 firstKeptEntryId 标记分界。读回路径自动从 compaction 之后开始。',
    code: `interface CompactionResult {
  summary: string;
  firstKeptEntryId: string;
  tokensBefore: number;
  details?: { readFiles: string[]; modifiedFiles: string[] };
}`,
    baseClass: 'border-gray-200 bg-white ml-8',
    activeClass: 'border-[#3e66ae] bg-[#eef3fb] ml-8'
  }
];

const currentLayer = computed(() => layers.find(l => l.id === active.value));
</script>
