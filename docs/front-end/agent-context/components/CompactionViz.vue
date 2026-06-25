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
        class="rounded-md border px-2 py-1 text-[0.65rem] transition-all"
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
            class="shrink-0 rounded bg-[#eef3fb] px-1.5 py-0.5 text-[0.6rem] font-semibold text-[#3e66ae]"
            >1</span
          >
          <span
            >对话 token 超过阈值（{{ windowK }}k − {{ reserveK }}k =
            <strong>{{ windowK - reserveK }}k</strong>），触发压缩</span
          >
        </div>
        <div class="flex items-start gap-2">
          <span
            class="shrink-0 rounded bg-[#eef3fb] px-1.5 py-0.5 text-[0.6rem] font-semibold text-[#3e66ae]"
            >2</span
          >
          <span
            >从最新消息往前数 ~{{ keep }}k token，找到切点（只能落在 user/assistant 消息上）</span
          >
        </div>
        <div class="flex items-start gap-2">
          <span
            class="shrink-0 rounded bg-[#eef3fb] px-1.5 py-0.5 text-[0.6rem] font-semibold text-[#3e66ae]"
            >3</span
          >
          <span>切点之前的所有消息 → 用 LLM 生成结构化摘要</span>
        </div>
        <div class="flex items-start gap-2">
          <span
            class="shrink-0 rounded bg-[#eef3fb] px-1.5 py-0.5 text-[0.6rem] font-semibold text-[#3e66ae]"
            >4</span
          >
          <span
            >结果：<strong>[摘要]</strong> + <strong>[切点后原文]</strong> +
            <strong>[预留空间]</strong></span
          >
        </div>
      </div>
    </div>

    <!-- 第二次压缩（增量） -->
    <div
      v-else-if="tab === 'second'"
      class="mt-2 rounded-lg border border-[#dbe3f0] bg-white p-2.5 text-[0.68rem]"
    >
      <p class="text-gray-700">
        第二次触发时，<strong>不会</strong>把全部历史重新读一遍。做法是增量合并（由 LLM
        执行，不是简单拼接字符串）：
      </p>
      <div class="mt-2 space-y-1.5 text-gray-700">
        <div class="flex items-start gap-2">
          <span
            class="shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-[0.6rem] font-semibold text-amber-800"
            >旧</span
          >
          <span>上一轮已有的摘要（previousSummary）</span>
        </div>
        <div class="flex items-center gap-1 pl-6 text-gray-400">+</div>
        <div class="flex items-start gap-2">
          <span
            class="shrink-0 rounded bg-emerald-100 px-1.5 py-0.5 text-[0.6rem] font-semibold text-emerald-800"
            >新</span
          >
          <span>上次保留的原文中，这次放不下、需要压掉的那部分</span>
        </div>
        <div class="flex items-center gap-1 pl-6 text-gray-400">↓</div>
        <div class="flex items-start gap-2">
          <span
            class="shrink-0 rounded bg-[#eef3fb] px-1.5 py-0.5 text-[0.6rem] font-semibold text-[#3e66ae]"
            >合并</span
          >
          <span>LLM 把旧摘要 + 新消息合并成一份更新的摘要</span>
        </div>
      </div>
      <div
        class="mt-2 rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-[0.62rem] text-gray-600"
      >
        关键：已被压缩的原始消息<strong>永远不再被读取</strong>。每次压缩只处理"摘要 +
        增量"，成本可控。
      </div>
    </div>

    <!-- 第三次及以后 -->
    <div v-else class="mt-2 rounded-lg border border-[#dbe3f0] bg-white p-2.5 text-[0.68rem]">
      <p class="text-gray-700">
        和第二次<strong>完全一样的逻辑</strong>——永远是"旧摘要 + 新增量 → 合并成新摘要"：
      </p>
      <div class="mt-2 space-y-1.5 text-gray-700">
        <div class="flex items-start gap-2">
          <span
            class="shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-[0.6rem] font-semibold text-amber-800"
            >第2次的摘要</span
          >
          <span>已经融合了第1次+第2次的信息</span>
        </div>
        <div class="flex items-center gap-1 pl-6 text-gray-400">+</div>
        <div class="flex items-start gap-2">
          <span
            class="shrink-0 rounded bg-emerald-100 px-1.5 py-0.5 text-[0.6rem] font-semibold text-emerald-800"
            >新增量</span
          >
          <span>第2次压缩后到现在，又放不下的那些消息</span>
        </div>
        <div class="flex items-center gap-1 pl-6 text-gray-400">↓</div>
        <div class="flex items-start gap-2">
          <span
            class="shrink-0 rounded bg-[#eef3fb] px-1.5 py-0.5 text-[0.6rem] font-semibold text-[#3e66ae]"
            >第3次摘要</span
          >
          <span>融合了全部历史信息的最新版摘要</span>
        </div>
      </div>
      <div
        class="mt-2 rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-[0.62rem] text-gray-600"
      >
        <strong>规律：</strong
        >摘要像滚雪球——每次只"滚进"一小批新消息，不会回头重读已经融合过的原文。 第 N 次压缩的成本 ≈
        摘要长度 + 新增量长度，和总历史长度无关。
      </div>
      <div
        class="mt-2 rounded border border-amber-200 bg-amber-50/60 px-2 py-1.5 text-[0.62rem] text-gray-700"
      >
        <strong>代价：</strong>每次合并都有信息损耗。压缩次数越多，最早期的细节越模糊。
        关键约束如果只存在摘要里，多轮压缩后可能漂移——所以重要规则要写进磁盘文件（system
        prompt），不能只靠摘要传递。
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
