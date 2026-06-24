<template>
  <div class="mt-3 text-left" data-reveal-interactive @click.stop>
    <div class="flex flex-wrap items-stretch gap-2">
      <button
        v-for="(step, i) in steps"
        :key="step.id"
        type="button"
        class="min-w-[110px] flex-[1_1_120px] cursor-pointer rounded-[10px] border-2 border-gray-200 bg-[#fafbfc] p-2 text-left transition-all duration-200"
        :class="active === step.id ? 'border-[#3e66ae] bg-[#eef3fb]' : ''"
        @click="active = step.id"
      >
        <span
          class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#3e66ae] text-[0.7rem] font-bold text-white"
        >
          {{ i + 1 }}
        </span>
        <code class="my-1 block text-[0.76rem] text-slate-800">{{ step.code }}</code>
        <span class="text-[0.65rem] text-gray-500">{{ step.tag }}</span>
      </button>
    </div>

    <!-- 1 拼上下文 -->
    <div v-if="active === 'assemble'" class="mt-2 space-y-2">
      <p class="rounded-lg bg-slate-100 px-3 py-2 text-[0.78rem] leading-snug text-gray-700">
        从会话状态取出各层内容，拼成待处理的 <code>messages[]</code>
      </p>
      <div class="rounded-lg border border-[#dbe3f0] bg-white p-2">
        <div class="mb-1.5 text-[0.65rem] font-bold text-[#3e66ae]">拼入</div>
        <div class="space-y-1.5">
          <div
            v-for="row in assembleInject"
            :key="row.item"
            class="flex items-start gap-2 rounded-md bg-[#fafbfc] px-2 py-1.5"
          >
            <code class="shrink-0 text-[0.65rem] font-semibold text-slate-700">{{ row.item }}</code>
            <span class="text-[0.65rem] leading-snug text-gray-600">{{ row.from }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 2 裁剪 / 注入 -->
    <div v-else-if="active === 'transform'" class="mt-2 space-y-2">
      <p class="rounded-lg bg-slate-100 px-3 py-2 text-[0.78rem] leading-snug text-gray-700">
        在 token 预算内调整 <code>messages[]</code>：补入外部片段，裁掉低价值内容
      </p>
      <div class="grid grid-cols-2 gap-2">
        <div class="rounded-lg border border-emerald-200 bg-emerald-50/50 p-2">
          <div class="mb-1.5 text-[0.65rem] font-bold text-emerald-700">↑ 注入</div>
          <div class="space-y-1">
            <div
              v-for="row in transformInject"
              :key="row.item"
              class="rounded bg-white px-1.5 py-1 text-[0.62rem] shadow-sm"
            >
              <code class="font-semibold text-emerald-800">{{ row.item }}</code>
              <span class="text-gray-600"> — {{ row.detail }}</span>
            </div>
          </div>
        </div>
        <div class="rounded-lg border border-amber-200 bg-amber-50/50 p-2">
          <div class="mb-1.5 text-[0.65rem] font-bold text-amber-700">↓ 裁掉</div>
          <div class="space-y-1">
            <div
              v-for="row in transformTrim"
              :key="row.item"
              class="rounded bg-white px-1.5 py-1 text-[0.62rem] shadow-sm"
            >
              <code class="font-semibold text-amber-800">{{ row.item }}</code>
              <span class="text-gray-600"> — {{ row.detail }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 3 过滤映射 -->
    <div v-else-if="active === 'filter'" class="mt-2 space-y-2">
      <p class="rounded-lg bg-slate-100 px-3 py-2 text-[0.78rem] leading-snug text-gray-700">
        内部 <code>AgentMessage[]</code> 映射为 API 可接受的 <code>Message[]</code>
      </p>
      <pre
        class="overflow-x-auto rounded-lg border border-slate-200 bg-slate-900 p-2.5 text-[0.62rem] leading-relaxed text-slate-100"
      ><code>// convertToLlm：摘要类消息 → user 文本块；tool 配对校验
messages.map(m => {
  if (m.role === 'compactionSummary') return { role: 'user', content: m.text };
  if (m.role === 'toolResult')     return { role: 'user', content: toolBlocks(m) };
  return m; // user / assistant / system
})</code></pre>
      <div class="grid grid-cols-2 gap-2">
        <div class="rounded-lg border-2 border-emerald-200 bg-emerald-50/50 p-2">
          <div class="mb-1.5 text-[0.65rem] font-bold text-emerald-700">进模型</div>
          <div class="flex flex-wrap gap-1">
            <span
              v-for="t in inList"
              :key="t"
              class="rounded-md bg-white px-1.5 py-0.5 text-[0.62rem] text-gray-700 shadow-sm"
            >
              {{ t }}
            </span>
          </div>
        </div>
        <div class="rounded-lg border-2 border-gray-200 bg-gray-50 p-2">
          <div class="mb-1.5 text-[0.65rem] font-bold text-gray-500">不进模型</div>
          <div class="flex flex-wrap gap-1">
            <span
              v-for="t in outList"
              :key="t"
              class="rounded-md bg-white px-1.5 py-0.5 text-[0.62rem] text-gray-500 shadow-sm"
            >
              {{ t }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 4 调用 LLM -->
    <div v-else class="mt-2 space-y-2">
      <p class="rounded-lg bg-slate-100 px-3 py-2 text-[0.78rem] leading-snug text-gray-700">
        最终 HTTP 请求体：模型本轮可见的完整输入
      </p>
      <pre
        class="overflow-x-auto rounded-lg border border-slate-200 bg-slate-900 p-2.5 text-[0.62rem] leading-relaxed text-slate-100"
      ><code>{
  "system": "工具定义 + 行为约束 + CLAUDE.md …",
  "messages": [
    { "role": "user",      "content": "[摘要] 用户要修登录 bug…" },
    { "role": "user",      "content": "帮我看看 handleSubmit 为什么报错" },
    { "role": "assistant", "content": "我先 grep 定位…", "tool_use": [...] },
    { "role": "user",      "content": [{ "type": "tool_result", "content": "3 matches…" }] }
  ]
}</code></pre>
      <div class="space-y-1 rounded-lg border border-[#dbe3f0] bg-white p-2">
        <div
          v-for="block in payloadBlocks"
          :key="block.role"
          class="flex items-center gap-2 rounded-md px-2 py-1.5 text-[0.68rem]"
          :class="block.bg"
        >
          <code class="shrink-0 font-semibold" :class="block.labelClass">{{ block.role }}</code>
          <span class="truncate text-gray-600">{{ block.preview }}</span>
        </div>
      </div>
      <p class="text-center text-[0.72rem] text-gray-500">
        模型实际读到 ≈ <strong>system</strong> + <strong>压缩摘要</strong> + <strong>最近原文 messages</strong>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const steps = [
  { id: 'assemble', code: '拼上下文', tag: '每轮' },
  { id: 'transform', code: '裁剪 / 注入', tag: '可选' },
  { id: 'filter', code: '过滤映射', tag: '必需' },
  { id: 'llm', code: '调用 LLM', tag: '最终输入' }
];

const active = ref('assemble');

const assembleInject = [
  { item: 'messages[]', from: '本轮 user / assistant / toolResult 全量历史' },
  { item: 'compactionSummary', from: '窗口压缩后生成的历史摘要块' },
  { item: 'CLAUDE.md / rules', from: '项目目录持久化规则，每轮重注' },
  { item: 'system / skills', from: 'Agent 内置指令与技能说明' }
];

const transformInject = [
  { item: 'RAG 片段', detail: '检索到的文档段落' },
  { item: '超大输出预览', detail: 'tool 结果超限时保留头尾摘要' },
  { item: '跨轮记忆', detail: 'auto memory / MEMORY.md 读回块' }
];

const transformTrim = [
  { item: '旧 tool 大输出', detail: '早期 read/bash 结果截断或替换' },
  { item: '重复附件', detail: '已注入过的文件内容去重' },
  { item: '过期探索分支', detail: '被放弃的子任务消息链' }
];

const inList = ['system', 'user', 'assistant', 'tool_result', '摘要块', '项目规则'];
const outList = ['UI 通知', 'branchSummary（仅 UI）', '仅落盘状态'];

const payloadBlocks = [
  { role: 'system', preview: '工具定义 · 输出风格 · CLAUDE.md …', bg: 'bg-slate-100', labelClass: 'text-slate-700' },
  { role: 'user', preview: '[摘要] 用户要修登录 bug；已读过 auth.ts…', bg: 'bg-[#eef3fb]', labelClass: 'text-[#3e66ae]' },
  { role: 'user', preview: '帮我看看 handleSubmit 为什么报错', bg: 'bg-emerald-50', labelClass: 'text-emerald-700' },
  { role: 'assistant', preview: '我先 grep 定位 handleSubmit…', bg: 'bg-white', labelClass: 'text-gray-700' },
  { role: 'user', preview: 'tool_result: grep → 3 matches in app.ts', bg: 'bg-amber-50', labelClass: 'text-amber-800' }
];
</script>
