<template>
  <div class="mt-3 text-left" data-reveal-interactive @click.stop>
    <!-- 顶部：模型收到的三大块 -->
    <div class="flex items-stretch gap-2">
      <button
        v-for="block in blocks"
        :key="block.id"
        type="button"
        class="flex-1 cursor-pointer rounded-[10px] border-2 p-2.5 text-left transition-all duration-200"
        :class="
          active === block.id ? 'border-[#3e66ae] bg-[#eef3fb]' : 'border-gray-200 bg-[#fafbfc]'
        "
        @click="active = block.id"
      >
        <div
          class="text-[0.72rem] font-bold"
          :class="active === block.id ? 'text-[#3e66ae]' : 'text-gray-800'"
        >
          {{ block.label }}
        </div>
        <div class="mt-0.5 text-[0.72rem] text-gray-500">{{ block.size }}</div>
      </button>
    </div>

    <!-- system -->
    <div v-if="active === 'system'" class="mt-2 space-y-2">
      <p class="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[0.72rem] leading-snug text-gray-700">
        固定指令——模型据此理解自己能做什么、该遵守什么。
      </p>
      <div class="space-y-1">
        <div
          v-for="item in systemItems"
          :key="item.name"
          class="flex items-baseline gap-1.5 rounded-md bg-white px-2 py-1"
        >
          <span class="shrink-0 text-[0.7rem] font-semibold text-slate-800">{{ item.name }}</span>
          <span class="text-[0.8rem] text-gray-500">{{ item.desc }}</span>
        </div>
      </div>
    </div>

    <!-- messages -->
    <div v-else-if="active === 'messages'" class="mt-2 space-y-2">
      <p class="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[0.72rem] leading-snug text-gray-700">
        对话记录——user 输入、assistant 回复、tool 调用和返回。用户当前输入 = 最后一条。
      </p>
      <div class="space-y-1 rounded-lg border border-[#dbe3f0] bg-white p-2">
        <div
          v-for="msg in messageExample"
          :key="msg.label"
          class="flex items-center gap-2 rounded-md px-2 py-1.5 text-[0.68rem]"
          :class="msg.bg"
        >
          <code class="shrink-0 font-semibold" :class="msg.labelClass">{{ msg.role }}</code>
          <span class="truncate text-gray-600">{{ msg.content }}</span>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div class="rounded-lg border border-emerald-200 bg-emerald-50/50 p-2">
          <div class="mb-1 text-[0.72rem] font-bold text-emerald-700">进入 messages</div>
          <div class="flex flex-wrap gap-1">
            <span
              v-for="t in included"
              :key="t"
              class="rounded-md bg-white px-1.5 py-0.5 text-[0.72rem] text-gray-700 shadow-sm"
              >{{ t }}</span
            >
          </div>
        </div>
        <div class="rounded-lg border border-gray-200 bg-gray-50 p-2">
          <div class="mb-1 text-[0.72rem] font-bold text-gray-500">不进入 messages</div>
          <div class="flex flex-wrap gap-1">
            <span
              v-for="t in excluded"
              :key="t"
              class="rounded-md bg-white px-1.5 py-0.5 text-[0.72rem] text-gray-500 shadow-sm"
              >{{ t }}</span
            >
          </div>
        </div>
      </div>
    </div>

    <!-- 可调节部分 -->
    <div v-else class="mt-2 space-y-2">
      <p class="rounded-lg bg-slate-100 px-3 py-2 text-[0.78rem] leading-snug text-gray-700">
        在发送前，Agent 可以对 messages 做两步处理——一步裁剪注入，一步格式转换。<span
          class="text-[0.72rem] text-gray-500"
          >（以 pi 为例）</span
        >
      </p>
      <div class="grid grid-cols-2 gap-2">
        <div class="rounded-lg border border-[#3e66ae]/30 bg-[#eef3fb] p-2">
          <code class="text-[0.8rem] font-bold text-[#3e66ae]">transformContext</code>
          <p class="mt-1 text-[0.72rem] text-gray-600">
            可选。语义层面决定保留什么：删旧 tool 输出、注入 RAG 片段、去重。
          </p>
        </div>
        <div class="rounded-lg border border-gray-200 bg-white p-2">
          <code class="text-[0.8rem] font-bold text-slate-700">convertToLlm</code>
          <p class="mt-1 text-[0.72rem] text-gray-600">
            必需。格式转换：内部消息类型映射为 API 协议格式，过滤仅 UI 用的消息。
          </p>
        </div>
      </div>
      <div
        class="rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2 text-[0.68rem] text-gray-700"
      >
        前者像<strong>编辑删稿件</strong>（选择保留什么内容），后者像<strong>排版转印刷格式</strong>（不改内容，保证格式合法）。
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const active = ref('system');

const blocks = [
  { id: 'system', label: 'system prompt（固定指令）', size: '每轮重发 · 规则/工具定义' },
  { id: 'messages', label: 'messages（对话记录）', size: '包含 user 输入 · 动态增长' },
  { id: 'control', label: '发送前处理', size: '裁剪 + 格式转换' }
];

const systemItems = [
  { name: '工具定义', desc: '模型可以调用哪些工具、参数格式' },
  { name: '行为约束', desc: '输出风格、安全规则、角色设定' },
  { name: '项目规则', desc: 'CLAUDE.md / .cursorrules — 每轮从磁盘重读，全量注入' },
  { name: '持久记忆', desc: '自动笔记 + 用户画像（每轮注入，有容量上限）' },
  { name: '技能描述', desc: '每个 skill 只注入一行触发描述，匹配到才加载完整内容' }
];

const messageExample = [
  {
    role: 'user',
    content: '← 压缩摘要：用户要修登录 bug；已读 auth.ts；决定用 hooks 重构',
    bg: 'bg-[#eef3fb]',
    labelClass: 'text-[#3e66ae]'
  },
  {
    role: 'user',
    content: '帮我看看 handleSubmit 为什么报错（← 用户当前输入）',
    bg: 'bg-emerald-50',
    labelClass: 'text-emerald-700'
  },
  {
    role: 'assistant',
    content: '我先 grep 定位 handleSubmit…',
    bg: 'bg-white',
    labelClass: 'text-gray-700'
  },
  {
    role: 'user',
    content: 'tool_result: grep → 3 matches in app.ts',
    bg: 'bg-amber-50',
    labelClass: 'text-amber-800'
  }
];

const included = ['用户消息', '模型回复', 'tool 调用 + 返回', '压缩摘要'];
const excluded = ['UI 通知', '分支摘要（仅 UI）', '仅落盘状态'];
</script>
