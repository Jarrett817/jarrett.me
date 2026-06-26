<template>
  <div class="mt-3 text-left" data-reveal-interactive @click.stop>
    <div class="space-y-2">
      <button
        v-for="m in methods"
        :key="m.id"
        type="button"
        class="flex w-full items-start gap-3 rounded-lg border p-2.5 text-left transition-all"
        :class="active === m.id ? 'border-[#3e66ae] bg-[#eef3fb]' : 'border-gray-200 bg-white'"
        @click="active = m.id"
      >
        <span
          class="mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[0.58rem] font-bold"
          :class="m.statusClass"
          >{{ m.status }}</span
        >
        <div class="min-w-0">
          <div
            class="text-[0.72rem] font-bold"
            :class="active === m.id ? 'text-[#3e66ae]' : 'text-gray-800'"
          >
            {{ m.title }}
          </div>
          <div class="mt-0.5 text-[0.62rem] text-gray-500">{{ m.brief }}</div>
        </div>
      </button>
    </div>

    <div
      v-if="current"
      class="mt-2 rounded-lg border border-[#dbe3f0] bg-white p-2.5 text-[0.72rem]"
    >
      <p class="leading-snug text-gray-700">{{ current.detail }}</p>
      <div
        class="mt-2 rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-[0.62rem] text-gray-600"
      >
        <strong>何时触发：</strong>{{ current.trigger }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

interface Method {
  id: string;
  title: string;
  brief: string;
  status: string;
  statusClass: string;
  detail: string;
  trigger: string;
}

const active = ref('summary');

const methods: Method[] = [
  {
    id: 'summary',
    title: '摘要压缩（Compaction）',
    brief: '大多数 Agent 的核心策略（以 pi 为例）：用 LLM 把旧对话生成结构化摘要',
    status: '内置·自动',
    statusClass: 'bg-emerald-100 text-emerald-800',
    detail:
      '当 context tokens 超过阈值（窗口 − 预留）时自动触发。保留最近 ~20k token 原文，更早的消息用 LLM 生成摘要替代。支持增量更新——多次压缩不重读全部历史。',
    trigger:
      '自动。已用 token > context window − reserveTokens（默认 16k）。也可手动调用 /compact 命令。'
  },
  {
    id: 'window',
    title: '滑动窗口（硬截断）',
    brief: '直接丢弃旧消息，不生成摘要',
    status: '概念·退化',
    statusClass: 'bg-gray-200 text-gray-700',
    detail:
      '最简单的做法：只保留最近 N 轮消息，更早的直接丢掉。不需要额外的 LLM 调用，但丢失的信息没有任何补偿。pi 没有单独实现这个策略——它是 Compaction 的退化形式（如果摘要步骤失败或被跳过）。',
    trigger: '在 pi 中不会独立触发。一些简单的 Agent 框架（如纯 API wrapper）默认用这种方式。'
  },
  {
    id: 'importance',
    title: '重要性过滤',
    brief: '按价值打分，只保留高分消息',
    status: '需自行实现',
    statusClass: 'bg-amber-100 text-amber-800',
    detail:
      '给每条消息打重要性分，低分的不进入 prompt（不删除、只隐藏）。比如：3 轮前的 grep 结果不重要了，但决策对话要保留。可通过 transformContext 实现，但"重要性"的判断逻辑需要自己写。',
    trigger: '通过 transformContext 钩子，每次 LLM 调用前执行。由开发者自定义过滤规则。'
  },
  {
    id: 'structured',
    title: '结构化抽取',
    brief: '从对话中抽取字段化事实，不保留原文',
    status: '需自行实现',
    statusClass: 'bg-amber-100 text-amber-800',
    detail:
      '把对话转化为结构化数据（如"用户偏好：no-semicolons"、"确认方案：用 PostgreSQL"）。信息密度最高，但实现成本也最高。项目规则文件（CLAUDE.md）和 Extension 状态存储接近这条路径。',
    trigger: '不作为压缩策略自动触发。适合在任务结束时（持久记忆写入阶段）提取关键事实落盘。'
  }
];

const current = computed(() => methods.find(m => m.id === active.value));
</script>
