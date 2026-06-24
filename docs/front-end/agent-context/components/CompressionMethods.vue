<template>
  <div class="mt-3 text-left" data-reveal-interactive @click.stop>
    <div class="grid grid-cols-2 gap-2">
      <button
        v-for="m in methods"
        :key="m.id"
        type="button"
        class="rounded-lg border p-2.5 text-left transition-all"
        :class="
          active === m.id
            ? 'border-[#3e66ae] bg-[#eef3fb]'
            : 'border-gray-200 bg-white'
        "
        @click="active = m.id"
      >
        <div class="text-[0.72rem] font-bold text-[#3e66ae]">{{ m.title }}</div>
        <div class="mt-0.5 text-[0.65rem] text-gray-600">{{ m.tag }}</div>
      </button>
    </div>
    <p class="mt-2 rounded-lg bg-slate-100 px-3 py-2 text-[0.75rem] leading-snug text-gray-700">
      {{ current.hint }}
    </p>
    <p v-if="current.impl" class="mt-1.5 text-[0.68rem] text-emerald-700">
      {{ current.impl }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const active = ref('window');

const methods = [
  {
    id: 'window',
    title: '滑动窗口',
    tag: '截断策略 · 丢弃旧消息',
    hint: '仅保留最近 N 轮；实现简单，按时间截断，不区分内容重要性。',
    impl: '编码 Agent 常用作兜底：达到窗口硬上限时触发。'
  },
  {
    id: 'summary',
    title: '摘要压缩',
    tag: '截断策略 · 摘要替换原文',
    hint: '超出窗口前将历史压成摘要并替换原文；可分层（近期原文 / 中期摘要 / 长期摘要）。',
    impl: '↳ keepRecent：切点之后保留原文，更早历史合并为摘要。'
  },
  {
    id: 'importance',
    title: '重要性过滤',
    tag: '筛选策略 · 按价值保留',
    hint: '按重要性打分筛选；或观察遮蔽——按当前任务阶段隐藏无关历史（不删除，仅不进 prompt）。',
    impl: ''
  },
  {
    id: 'structured',
    title: '结构化抽取',
    tag: '存储策略 · 字段化事实',
    hint: '不保留对话原文，抽取结构化字段（如技术偏好、已确认方案）；信息密度高，实现成本较高。',
    impl: '↳ 项目规则、扩展状态接近此路径。'
  }
];

const current = computed(() => methods.find(m => m.id === active.value)!);
</script>
