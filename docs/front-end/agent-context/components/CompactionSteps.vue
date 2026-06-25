<template>
  <div class="mt-3 text-left" data-reveal-interactive @click.stop>
    <div class="flex items-center justify-between gap-1">
      <template v-for="(s, i) in steps" :key="s.id">
        <button
          type="button"
          class="flex flex-1 flex-col items-center rounded-lg border px-1 py-2 transition-all"
          :class="active === i ? 'border-[#3e66ae] bg-[#eef3fb]' : 'border-gray-200 bg-white'"
          @click="active = i"
        >
          <DeckIcon
            :icon="s.icon"
            :size="20"
            :color-class="active === i ? 'text-[#3e66ae]' : 'text-gray-400'"
          />
          <span class="mt-1 text-[0.6rem] font-medium text-gray-700">{{ s.label }}</span>
        </button>
        <DeckIcon
          v-if="i < steps.length - 1"
          :icon="ArrowRight"
          :size="14"
          color-class="text-gray-300"
        />
      </template>
    </div>
    <div class="mt-2 rounded-lg border border-[#dbe3f0] bg-white px-3 py-2">
      <p class="text-[0.72rem] leading-snug text-gray-700">
        {{ steps[active].detail }}
      </p>
      <CodeBlock v-if="steps[active].code" :code="steps[active].code ?? ''" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue';
import { ref } from 'vue';
import { ArrowRight, Cut, Document, Renew, Ruler } from '@vicons/carbon';
import DeckIcon from './DeckIcon.vue';
import CodeBlock from './CodeBlock.vue';

const active = ref(0);

const steps: Array<{ id: string; icon: Component; label: string; detail: string; code?: string }> =
  [
    {
      id: 'cut',
      icon: Ruler,
      label: '定切点',
      detail:
        '从最新消息向前累加 token，累积到 keepRecentTokens（默认 ~20k）时停下。切点只能在 user 或 assistant 消息上，不会切在 toolResult 中间。',
      code: `findCutPoint(entries, startIndex, endIndex, keepRecentTokens)
// → { firstKeptEntryIndex, isSplitTurn }`
    },
    {
      id: 'serialize',
      icon: Cut,
      label: '序列化',
      detail:
        '切点之前的消息序列化为纯文本。单条 tool 输出先截断到 2000 字符再进入摘要，避免摘要模型被大输出淹没。',
      code: `messagesToSummarize = entries.slice(0, firstKeptEntryIndex)
// 每条 toolResult 截断到 ~2000 chars`
    },
    {
      id: 'summary',
      icon: Document,
      label: '写摘要',
      detail:
        '用 LLM 生成结构化摘要，格式包含 Goal / Progress / Key Decisions / Next Steps / read-files / modified-files。如已有上一轮摘要，执行增量更新而非从头写。',
      code: `generateSummary(messagesToSummarize, model, reserveTokens, ...)
// 支持 previousSummary 做增量合并`
    },
    {
      id: 'reload',
      icon: Renew,
      label: '重载',
      detail:
        '新摘要写入 session 文件后重载上下文：摘要 + 切点后原文 + 从磁盘重注入项目规则。模型下一轮看到的是压缩后的完整上下文。'
    }
  ];
</script>
