<template>
  <div class="mt-3 text-left" data-reveal-interactive @click.stop>
    <!-- 对比两种思路 -->
    <div class="grid grid-cols-2 gap-2">
      <button
        v-for="approach in approaches"
        :key="approach.id"
        type="button"
        class="rounded-lg border p-2.5 text-left transition-all"
        :class="
          active === approach.id ? 'border-[#3e66ae] bg-[#eef3fb]' : 'border-gray-200 bg-white'
        "
        @click="active = approach.id"
      >
        <div
          class="text-[0.72rem] font-bold"
          :class="active === approach.id ? 'text-[#3e66ae]' : 'text-gray-800'"
        >
          {{ approach.title }}
        </div>
        <div class="mt-0.5 text-[0.62rem] text-gray-500">{{ approach.tag }}</div>
      </button>
    </div>

    <!-- 分块塞入 -->
    <div v-if="active === 'chunk'" class="mt-2 space-y-2">
      <div class="rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-[0.72rem] text-gray-700">
        <p class="leading-snug">
          模型自己多轮 read，每次 2000 行，逐步把文件内容塞入自己的上下文。
        </p>
        <div class="mt-2 flex items-center gap-1.5 text-[0.62rem] text-gray-500">
          <span class="rounded bg-amber-100 px-1.5 py-0.5 text-amber-800">缺点</span>
          大文件需要多轮调用，每轮内容都占 context window，容易触发压缩
        </div>
      </div>
      <div class="flex items-center justify-center gap-1 text-[0.62rem] text-gray-500">
        <span class="rounded-full bg-slate-100 px-2 py-0.5">read 第1次</span>
        <span>→</span>
        <span class="rounded-full bg-slate-100 px-2 py-0.5">read 第2次</span>
        <span>→</span>
        <span class="rounded-full bg-slate-100 px-2 py-0.5">read 第3次</span>
        <span>→ …</span>
      </div>
    </div>

    <!-- Sub-agent 委派 -->
    <div v-else class="mt-2 space-y-2">
      <div
        class="rounded-lg border border-emerald-200 bg-emerald-50/50 p-2.5 text-[0.72rem] text-gray-700"
      >
        <p class="leading-snug">
          主 agent 不自己读大文件，而是派一个
          <strong>sub-agent</strong> 在独立上下文中分析，只把结论返回主上下文。
        </p>
        <div class="mt-2 flex items-center gap-1.5 text-[0.62rem] text-gray-500">
          <span class="rounded bg-emerald-100 px-1.5 py-0.5 text-emerald-800">优势</span>
          主上下文不膨胀；sub-agent 有自己的完整 context window 可用
        </div>
      </div>

      <div class="rounded-lg border border-[#dbe3f0] bg-white p-2.5">
        <div class="flex items-start gap-3">
          <!-- 主 agent -->
          <div class="flex-1 rounded-lg border border-gray-200 bg-[#fafbfc] p-2 text-center">
            <div class="text-[0.62rem] font-bold text-gray-600">主 Agent</div>
            <div class="mt-1 text-[0.58rem] text-gray-500">保持精简上下文</div>
            <div class="mt-2 rounded bg-[#eef3fb] px-2 py-1 text-[0.58rem] text-[#3e66ae]">
              "分析这个 8000 行文件的架构"
            </div>
          </div>

          <!-- 箭头 -->
          <div
            class="flex flex-col items-center justify-center gap-0.5 pt-3 text-[0.55rem] text-gray-400"
          >
            <span>委派 →</span>
            <span>← 结论</span>
          </div>

          <!-- Sub-agent -->
          <div class="flex-1 rounded-lg border border-emerald-200 bg-emerald-50/30 p-2 text-center">
            <div class="text-[0.62rem] font-bold text-emerald-700">Sub-agent</div>
            <div class="mt-1 text-[0.58rem] text-gray-500">独立 context window</div>
            <div class="mt-2 space-y-0.5 text-[0.55rem] text-gray-600">
              <div class="rounded bg-white px-1.5 py-0.5">读全文件（自己的窗口）</div>
              <div class="rounded bg-white px-1.5 py-0.5">分析 + 提取关键信息</div>
              <div class="rounded bg-white px-1.5 py-0.5">返回结构化摘要</div>
            </div>
          </div>
        </div>
      </div>

      <div
        class="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-2 text-[0.65rem] text-gray-600"
      >
        <strong>典型场景：</strong>Kiro 用 context-gatherer sub-agent 探索不熟悉的代码库——sub-agent
        可以任意 read/grep， 最终只返回"哪些文件相关、为什么"的结论。主 agent
        上下文只多了一段结论文本。
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const active = ref('delegate');

const approaches = [
  { id: 'chunk', title: '分块塞入主上下文', tag: '传统方式 · 多轮 read' },
  { id: 'delegate', title: '委派 Sub-agent', tag: '不塞 · 只回结论' }
];
</script>
