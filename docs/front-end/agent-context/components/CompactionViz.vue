<template>
  <div class="mt-3 text-left" data-reveal-interactive @click.stop>
    <!-- 条形图 -->
    <div class="flex h-11 overflow-hidden rounded-lg border border-[#dbe3f0]">
      <div
        class="flex min-w-0 items-center justify-center bg-gradient-to-r from-[#6b8fd4] to-[#3e66ae] text-xs font-semibold text-white transition-[width] duration-300"
        :style="{ width: summaryPct + '%' }"
      >
        <span>摘要 ~{{ summaryK }}k</span>
      </div>
      <div
        class="flex min-w-0 items-center justify-center bg-gradient-to-r from-[#5cb88a] to-[#2d8a5e] text-xs font-semibold text-white transition-[width] duration-300"
        :style="{ width: recentPct + '%' }"
      >
        <span>原文 ~{{ keep }}k</span>
      </div>
      <div
        class="flex min-w-0 items-center justify-center bg-gradient-to-r from-[#f0b429] to-[#e08b12] text-xs font-semibold text-gray-800 transition-[width] duration-300"
        :style="{ width: reservePct + '%' }"
      >
        <span>预留 {{ reserveK }}k</span>
      </div>
    </div>

    <!-- 滑块 -->
    <label class="mt-3 flex items-center gap-3 text-[0.8rem] text-gray-700">
      <span>保留最近原文 ≈ {{ keep }}k tokens</span>
      <input
        v-model.number="keep"
        type="range"
        min="10"
        max="40"
        step="2"
        class="min-w-0 flex-1 accent-[#3e66ae]"
      />
    </label>

    <!-- Tab: 第一次 vs 第二次 -->
    <div class="mt-3 flex gap-2">
      <button
        v-for="t in tabs"
        :key="t.id"
        type="button"
        class="rounded-md border px-2 py-1 text-[0.8rem] transition-all"
        :class="
          tab === t.id
            ? 'border-[#3e66ae] bg-[#eef3fb] font-semibold text-[#3e66ae]'
            : 'border-gray-200 text-gray-500'
        "
        @click="tab = t.id"
      >
        {{ t.label }}
      </button>
    </div>

    <!-- 第一次压缩 -->
    <div
      v-if="tab === 'first'"
      class="mt-2 rounded-lg border border-[#dbe3f0] bg-white p-2.5 text-[0.68rem]"
    >
      <div class="space-y-1.5 text-gray-700">
        <div class="flex items-start gap-2">
          <span
            class="shrink-0 rounded bg-[#eef3fb] px-1.5 py-0.5 text-[0.7rem] font-semibold text-[#3e66ae]"
            >1</span
          >
          <span
            >对话 token 超过阈值（{{ windowK }}k − {{ reserveK }}k =
            <strong>{{ windowK - reserveK }}k</strong>），触发压缩</span
          >
        </div>
        <div class="flex items-start gap-2">
          <span
            class="shrink-0 rounded bg-[#eef3fb] px-1.5 py-0.5 text-[0.7rem] font-semibold text-[#3e66ae]"
            >2</span
          >
          <span
            >从最新消息往前数 ~{{ keep }}k token，找到切点（只能落在 user/assistant 消息上）</span
          >
        </div>
        <div class="flex items-start gap-2">
          <span
            class="shrink-0 rounded bg-[#eef3fb] px-1.5 py-0.5 text-[0.7rem] font-semibold text-[#3e66ae]"
            >3</span
          >
          <span>切点之前的所有消息 → 用 LLM 生成结构化摘要</span>
        </div>
        <div class="flex items-start gap-2">
          <span
            class="shrink-0 rounded bg-[#eef3fb] px-1.5 py-0.5 text-[0.7rem] font-semibold text-[#3e66ae]"
            >4</span
          >
          <span
            >结果：<strong>[摘要]</strong> + <strong>[切点后原文]</strong> +
            <strong>[预留空间]</strong></span
          >
        </div>
      </div>
    </div>

    <!-- 第二次压缩（具体例子） -->
    <div
      v-else-if="tab === 'second'"
      class="mt-2 rounded-lg border border-[#dbe3f0] bg-white p-2.5 text-[0.72rem]"
    >
      <div class="space-y-2 font-mono text-gray-700">
        <div>
          <div class="mb-0.5 text-[0.8rem] font-sans font-semibold text-gray-500"
            >第一轮压缩后的上下文：</div
          >
          <div class="rounded bg-slate-100 px-2 py-1">
            <span class="text-[#3e66ae] font-semibold">[摘要A]</span>
            <span class="text-emerald-700">[消息51]...[消息70]</span
            ><span class="text-gray-400"> ← 保留原文 ~{{ keep }}k</span>
          </div>
        </div>
        <div class="text-center text-gray-400 font-sans">↓ 继续对话，又满了</div>
        <div>
          <div class="mb-0.5 text-[0.8rem] font-sans font-semibold text-gray-500"
            >第二轮压缩前：</div
          >
          <div class="rounded bg-slate-100 px-2 py-1">
            <span class="text-[#3e66ae]">[摘要A]</span>
            <span class="text-amber-700">[消息51]...[消息70]</span>
            <span class="text-emerald-700">[消息71]...[消息100]</span>
          </div>
          <div class="mt-0.5 text-[0.52rem] font-sans text-gray-500">
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <span class="text-amber-700">↑ 这部分放不下了</span>
            &nbsp;&nbsp;&nbsp;&nbsp;
            <span class="text-emerald-700">↑ 保留原文</span>
          </div>
        </div>
        <div>
          <div class="mb-0.5 text-[0.8rem] font-sans font-semibold text-gray-500"
            >送给 LLM 合并：</div
          >
          <div class="rounded bg-amber-50 border border-amber-200 px-2 py-1">
            previousSummary = <span class="text-[#3e66ae]">摘要A</span><br />
            messagesToSummarize = <span class="text-amber-700">[消息51]...[消息70]</span>
          </div>
        </div>
        <div>
          <div class="mb-0.5 text-[0.8rem] font-sans font-semibold text-gray-500"
            >第二轮压缩后：</div
          >
          <div class="rounded bg-emerald-50 border border-emerald-200 px-2 py-1">
            <span class="text-[#3e66ae] font-semibold">[摘要B]</span>
            <span class="text-emerald-700">[消息71]...[消息100]</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 第三次及以后 -->
    <div v-else class="mt-2 rounded-lg border border-[#dbe3f0] bg-white p-2.5 text-[0.72rem]">
      <p class="font-sans text-gray-700">
        第三次和第二次<strong>完全一样</strong>——永远是 LLM(旧摘要 + 放不下的消息) → 新摘要：
      </p>
      <div class="mt-2 rounded bg-slate-100 px-2 py-1.5 font-mono text-gray-700">
        <span class="text-[#3e66ae]">[摘要B]</span>
        <span class="text-amber-700">[消息71]...[消息100]</span>
        <span class="text-emerald-700">[消息101]...[消息130]</span><br />
        → LLM(<span class="text-[#3e66ae]">摘要B</span> +
        <span class="text-amber-700">[71-100]</span>) →
        <span class="text-[#3e66ae] font-semibold">[摘要C]</span>
        <span class="text-emerald-700">[消息101]...[消息130]</span>
      </div>
      <div class="mt-2 space-y-1 font-sans text-[0.68rem] text-gray-600">
        <div>• 原文始终保留最近 ~{{ keep }}k token（可调）</div>
        <div>• 每次压缩只处理"摘要 + 新增量"，不重读全部历史</div>
        <div>• 代价：压缩次数越多，最早期的细节越模糊</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const keep = ref(20);
const windowK = 128;
const reserveK = 16;
const tab = ref<'first' | 'second' | 'third'>('first');

const tabs = [
  { id: 'first' as const, label: '第一次压缩' },
  { id: 'second' as const, label: '第二次满了' },
  { id: 'third' as const, label: '第三次及以后' }
];

const summaryK = computed(() => windowK - keep.value - reserveK);
const summaryPct = computed(() => Math.max(8, ((windowK - keep.value - reserveK) / windowK) * 100));
const recentPct = computed(() => (keep.value / windowK) * 100);
const reservePct = computed(() => (reserveK / windowK) * 100);
</script>
