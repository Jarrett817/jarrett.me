<template>
  <div class="mt-4 text-left">
    <div
      v-if="part === 'in'"
      class="rounded-lg border-2 border-emerald-200 bg-emerald-50/50 p-3"
    >
      <div class="mb-2 text-[0.7rem] font-bold text-emerald-700">进模型</div>
      <div class="flex flex-wrap gap-1.5">
        <span
          v-for="t in inList"
          :key="t"
          class="rounded-md bg-white px-2 py-0.5 text-[0.68rem] text-gray-700 shadow-sm"
        >
          {{ t }}
        </span>
      </div>
    </div>
    <div v-else class="rounded-lg border-2 border-gray-200 bg-gray-50 p-3">
      <div class="mb-2 text-[0.7rem] font-bold text-gray-500">不进模型</div>
      <div class="flex flex-wrap gap-1.5">
        <span
          v-for="t in outList"
          :key="t"
          class="rounded-md bg-white px-2 py-0.5 text-[0.68rem] text-gray-500 shadow-sm"
        >
          {{ t }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    part?: 'in' | 'out';
  }>(),
  { part: 'in' }
);

const inList = ['system', 'user', 'assistant', 'toolResult', '摘要', '项目规则'];
const outList = ['UI 通知', '隐藏消息', '仅落盘状态'];
</script>
