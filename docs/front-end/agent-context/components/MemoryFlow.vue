<template>
  <div class="mt-4 space-y-2 text-left">
    <div v-for="(row, i) in rows" :key="row.label" class="flex items-center gap-3">
      <div
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
        :class="colors[i]"
      >
        {{ i + 1 }}
      </div>
      <div class="min-w-0 flex-1 rounded-lg border border-[#dbe3f0] bg-white px-3 py-1.5">
        <div class="text-[0.72rem] font-semibold text-gray-800">{{ row.label }}</div>
        <div class="text-[0.65rem] text-gray-500">{{ row.hint }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const rows = [
  { label: '每轮推理', hint: 'leaf 回溯 → 摘要 + 原文' },
  { label: '跳分支', hint: '带走离开路径的摘要' },
  { label: '扩展 / 插队', hint: '消息进模型 · 状态落盘' }
];

const colors = ['bg-[#3e66ae]', 'bg-[#6b8fd4]', 'bg-[#5cb88a]'];
</script>
