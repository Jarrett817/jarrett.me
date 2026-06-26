<template>
  <div class="mt-3 text-left" data-reveal-interactive @click.stop>
    <p class="text-[0.78rem] leading-snug text-gray-700">
      工具返回过长时，在进入 <code>messages</code> 前先截断（非 LLM 摘要），从源头控制上下文膨胀。
    </p>

    <div class="mt-3 grid grid-cols-2 gap-2">
      <button
        v-for="s in strategies"
        :key="s.id"
        type="button"
        class="rounded-lg border p-2.5 text-left transition-all"
        :class="active === s.id ? 'border-[#3e66ae] bg-[#eef3fb]' : 'border-gray-200 bg-white'"
        @click="active = s.id"
      >
        <div
          class="text-[0.72rem] font-bold"
          :class="active === s.id ? 'text-[#3e66ae]' : 'text-gray-700'"
        >
          {{ s.title }}
        </div>
        <div class="mt-0.5 text-[0.72rem] text-gray-500">{{ s.tag }}</div>
      </button>
    </div>

    <div v-if="current" class="mt-2 rounded-lg border border-[#dbe3f0] bg-white px-3 py-2">
      <p class="text-[0.72rem] leading-snug text-gray-700">{{ current.detail }}</p>
      <CodeBlock v-if="current.code" :code="current.code" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import CodeBlock from './CodeBlock.vue';

interface Strategy {
  id: string;
  title: string;
  tag: string;
  detail: string;
  code?: string;
}

const active = ref('truncate');

const strategies: Strategy[] = [
  {
    id: 'truncate',
    title: '硬截断',
    tag: 'read / bash 输出',
    detail:
      'pi 在工具执行层对输出做硬截断：read 保留前 2000 行或 50KB（truncateHead），bash 保留末尾 2000 行或 50KB（truncateTail）。截断发生在 toolResult 写入 messages 之前，比 Compaction 更早、更轻量。',
    code: `// truncate.ts
const DEFAULT_MAX_LINES = 2000;
const DEFAULT_MAX_BYTES = 50 * 1024; // 50KB

truncateHead(content, { maxLines: 2000, maxBytes: 50_000 })
truncateTail(content, { maxLines: 2000, maxBytes: 50_000 })`
  },
  {
    id: 'grep-limit',
    title: '结果限数',
    tag: 'grep 搜索',
    detail:
      'grep 默认只返回前 100 条匹配，单行超 500 字符时截断并标 [truncated]。整体输出仍受 50KB 上限约束。这样即使搜索命中千行，进入上下文的内容也是可控的。',
    code: `const GREP_MAX_LINE_LENGTH = 500;
// 默认 maxResults=100, 超出 → "... and N more matches"`
  },
  {
    id: 'hook',
    title: '自定义过滤',
    tag: 'Extension tool_result 事件',
    detail:
      '通过 Extension 的 tool_result 事件，可以在工具执行后对 content 做自定义替换。比如把万行日志过滤成只含 ERROR 的行，再写入上下文。',
    code: `// Extension: tool_result event
on("tool_result", (event) => {
  if (event.toolName === "bash" && isTooLarge(event.content)) {
    event.content = filterErrors(event.content);
  }
})`
  },
  {
    id: 'transform',
    title: 'transformContext',
    tag: '调用前裁旧输出',
    detail:
      '不干预 toolResult 本身，而是在下一轮 LLM 调用前，通过 transformContext 删掉早期轮次的大输出。被删的消息仍保留在 session 文件中（不丢失），只是不再送入模型。',
    code: `// AgentLoopConfig
transformContext: async (messages) => {
  // 保留最近 3 轮 toolResult，更早的替换为占位
  return pruneOldToolResults(messages, { keepRounds: 3 });
}`
  }
];

const current = computed(() => strategies.find(s => s.id === active.value));
</script>
