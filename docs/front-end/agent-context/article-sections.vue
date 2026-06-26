<script setup lang="ts">
import ContextOverview from './components/ContextOverview.vue';
import ContextPipeline from './components/ContextPipeline.vue';
import ReadFileViz from './components/ReadFileViz.vue';
import CoherenceViz from './components/CoherenceViz.vue';
import ProactiveCompress from './components/ProactiveCompress.vue';
import CompressionMethods from './components/CompressionMethods.vue';
import CompactionViz from './components/CompactionViz.vue';
import CompactionSteps from './components/CompactionSteps.vue';
import MemoryStoreGuide from './components/MemoryStoreGuide.vue';
import MemoryGranularity from './components/MemoryGranularity.vue';
import MemoryMap from './components/MemoryMap.vue';
import MemoryStack from './components/MemoryStack.vue';
import MemoryLoop from './components/MemoryLoop.vue';
import RuntimeInject from './components/RuntimeInject.vue';
import HooksGrid from './components/HooksGrid.vue';
import SubAgentRead from './components/SubAgentRead.vue';
import CompareTable from './components/CompareTable.vue';

type PartId = 'turn' | 'compact' | 'memory';

const parts: Record<PartId, { num: string; title: string; desc: string }> = {
  turn: {
    num: '01',
    title: '当前对话',
    desc: '模型每轮看到什么、大文件怎么读、截断了怎么办'
  },
  compact: {
    num: '02',
    title: '上下文压缩',
    desc: 'Context Compaction：对话历史超出窗口时的信息压缩策略'
  },
  memory: {
    num: '03',
    title: '持久记忆',
    desc: 'Persistent Memory：跨会话的知识持久化与读回'
  }
};

const partAccent: Record<PartId, string> = {
  turn: 'border-l-blue-600',
  compact: 'border-l-amber-600',
  memory: 'border-l-emerald-600'
};

const partBadgeClass = (part: PartId) =>
  [
    'inline-block border-l-[3px] bg-gray-50 font-semibold tracking-wide text-gray-600',
    'mb-3 px-2.5 py-1 text-xs',
    partAccent[part]
  ].join(' ');
</script>

<template>
  <!-- ═══ 封面 + 约束（独立横向） ═══ -->
  <section>
    <section>
      <h1>Agent 的上下文管理</h1>
      <blockquote>
        <p>有限窗口下的设计哲学 · 当前对话 · 上下文压缩 · 持久记忆</p>
      </blockquote>
    </section>
    <section>
      <h3>所有 Agent 面临的同一个约束</h3>
      <p class="fragment text-[0.85em] text-gray-600">
        无论是 Claude Code、Cursor、Kiro 还是 pi——底层 LLM 都没有跨调用记忆。每次请求必须传入完整
        <code>messages</code>，context window 有限，而 Agent 任务链可以无限长。
        所有上下文管理策略都是在解同一道题：<strong>有限窗口 × 无限任务</strong>。
      </p>
      <ContextOverview class="fragment" part="limits" />
      <ContextOverview class="fragment mt-3" part="blocks" />
    </section>
  </section>

  <!-- ═══ 01 当前对话（纵向） ═══ -->
  <section>
    <section>
      <p class="m-0 text-xs font-semibold tracking-widest text-gray-400">{{ parts.turn.num }}</p>
      <h2 class="mt-1 text-[1.75rem] font-bold text-gray-900">{{ parts.turn.title }}</h2>
      <p class="fragment mt-2 text-[0.9em] text-gray-600">{{ parts.turn.desc }}</p>
    </section>

    <section>
      <p :class="partBadgeClass('turn')">{{ parts.turn.num }} · {{ parts.turn.title }}</p>
      <h3>短期记忆：messages 列表</h3>
      <p class="fragment text-[0.85em] text-gray-600">
        当前任务的 <code>messages</code> 即工作台；每次 API 调用携带该列表的全量内容。
      </p>
      <ContextOverview class="fragment" part="loop" />
    </section>

    <section>
      <p :class="partBadgeClass('turn')">{{ parts.turn.num }} · {{ parts.turn.title }}</p>
      <h3>模型每轮收到什么</h3>
      <p class="fragment text-[0.85em] text-gray-600"
        >模型收到两样东西：system prompt（固定指令）和 messages（对话记录）。发送前 Agent
        可以对内容做裁剪和格式转换。</p
      >
      <ContextPipeline class="fragment" />
    </section>

    <section>
      <p :class="partBadgeClass('turn')">{{ parts.turn.num }} · {{ parts.turn.title }}</p>
      <h3>大文件读取：分块续读</h3>
      <p class="fragment text-[0.85em] text-gray-600">
        单次 toolResult 硬上限 2000 行或 50KB，超出部分附带
        <code>Use offset=… to continue</code> 提示，由模型多轮续读。
      </p>
      <ReadFileViz class="fragment" mode="chunk" />
    </section>

    <section>
      <p :class="partBadgeClass('turn')">{{ parts.turn.num }} · {{ parts.turn.title }}</p>
      <h3>大文件读取：关键词定位</h3>
      <p class="fragment text-[0.85em] text-gray-600">
        grep 返回 <code>文件:行号: 内容</code>（默认 100 条匹配、单行 500
        字符），需要更大范围时模型再 <code>read(offset, limit)</code>。
      </p>
      <ReadFileViz class="fragment" mode="grep" />
    </section>

    <section>
      <p :class="partBadgeClass('turn')">{{ parts.turn.num }} · {{ parts.turn.title }}</p>
      <h3>大文件读取：超长 bash 输出</h3>
      <p class="fragment text-[0.85em] text-gray-600">
        输出超限时自动保留末尾 2000 行或 50KB，因为错误信息通常在最后。
      </p>
      <ReadFileViz class="fragment" mode="tail" />
    </section>

    <section>
      <p :class="partBadgeClass('turn')">{{ parts.turn.num }} · {{ parts.turn.title }}</p>
      <h3>大文件读取：委派 Sub-agent</h3>
      <p class="fragment text-[0.85em] text-gray-600">
        不塞进主上下文——派 sub-agent 在独立窗口读完，只返回结论。
      </p>
      <SubAgentRead class="fragment" />
    </section>

    <section>
      <p :class="partBadgeClass('turn')">{{ parts.turn.num }} · {{ parts.turn.title }}</p>
      <h3>截断后语义丢失了怎么办</h3>
      <CoherenceViz class="fragment" />
    </section>
  </section>

  <!-- ═══ 02 上下文压缩（纵向） ═══ -->
  <section>
    <section>
      <p class="m-0 text-xs font-semibold tracking-widest text-gray-400">{{ parts.compact.num }}</p>
      <h2 class="mt-1 text-[1.75rem] font-bold text-gray-900">{{ parts.compact.title }}</h2>
      <p class="fragment mt-2 text-[0.9em] text-gray-600">{{ parts.compact.desc }}</p>
    </section>

    <section>
      <p :class="partBadgeClass('compact')">{{ parts.compact.num }} · {{ parts.compact.title }}</p>
      <h3>主动压缩</h3>
      <ProactiveCompress class="fragment" />
    </section>

    <section>
      <p :class="partBadgeClass('compact')">{{ parts.compact.num }} · {{ parts.compact.title }}</p>
      <h3>压缩策略有哪几种</h3>
      <p class="fragment text-[0.85em] text-gray-600"
        >四种策略，只有摘要压缩是内置自动的。其余需要自己实现。</p
      >
      <CompressionMethods class="fragment" />
    </section>

    <section>
      <p :class="partBadgeClass('compact')">{{ parts.compact.num }} · {{ parts.compact.title }}</p>
      <h3>压缩的具体过程</h3>
      <p class="fragment text-[0.78em] text-gray-600"
        >token 消耗呈锯齿形：涨到阈值 → 压缩降回来 → 又涨 → 又压。</p
      >
      <CompactionViz class="fragment" />
      <CompactionSteps class="fragment mt-3" />
      <div
        class="fragment mt-3 rounded-lg border-2 border-amber-200 bg-amber-50/60 px-2.5 py-2 text-[0.72em] text-gray-700"
      >
        <strong>越聊越久，最早的记忆越模糊。</strong>关键约束必须写进磁盘文件，不能只靠摘要传递。
      </div>
    </section>
  </section>

  <!-- ═══ 03 持久记忆（纵向） ═══ -->
  <section>
    <section>
      <p class="m-0 text-xs font-semibold tracking-widest text-gray-400">{{ parts.memory.num }}</p>
      <h2 class="mt-1 text-[1.75rem] font-bold text-gray-900">{{ parts.memory.title }}</h2>
      <p class="fragment mt-2 text-[0.9em] text-gray-600">{{ parts.memory.desc }}</p>
    </section>

    <section>
      <p :class="partBadgeClass('memory')">{{ parts.memory.num }} · {{ parts.memory.title }}</p>
      <h3>压缩摘要 ≠ 持久记忆</h3>
      <div class="fragment grid grid-cols-2 gap-3 text-left text-[0.7em]">
        <div class="rounded-lg border border-amber-200 bg-amber-50/50 p-2.5">
          <div class="font-bold text-amber-800">压缩摘要</div>
          <ul class="mt-1.5 space-y-0.5 text-gray-700">
            <li>token 超限时自动触发</li>
            <li>存在当前会话 messages 里</li>
            <li>会话结束即消亡</li>
          </ul>
        </div>
        <div class="rounded-lg border border-emerald-200 bg-emerald-50/50 p-2.5">
          <div class="font-bold text-emerald-700">持久记忆</div>
          <ul class="mt-1.5 space-y-0.5 text-gray-700">
            <li>模型自行决定何时写入</li>
            <li>存在磁盘文件</li>
            <li>永久保留</li>
          </ul>
        </div>
      </div>
    </section>

    <section>
      <p :class="partBadgeClass('memory')">{{ parts.memory.num }} · {{ parts.memory.title }}</p>
      <h3>记忆何时写入——模型自行决策</h3>
      <div class="fragment space-y-1 text-[0.72em] text-gray-700">
        <div
          ><span class="font-semibold text-gray-600">Claude Code：</span>模型主动调用 memory tool
          写入笔记</div
        >
        <div
          ><span class="font-semibold text-gray-600">pi hermes-memory：</span>每 N 轮用独立 LLM
          审查对话 → 决定写什么</div
        >
        <div
          ><span class="font-semibold text-gray-600">Kiro：</span>agent 提议修改 steering
          files，人确认</div
        >
        <div
          ><span class="font-semibold text-gray-600">Cursor：</span>不自动写，靠 .cursorrules
          人工维护</div
        >
      </div>
    </section>

    <section>
      <p :class="partBadgeClass('memory')">{{ parts.memory.num }} · {{ parts.memory.title }}</p>
      <h3>什么值得写入记忆</h3>
      <MemoryStoreGuide class="fragment" />
    </section>

    <section>
      <p :class="partBadgeClass('memory')">{{ parts.memory.num }} · {{ parts.memory.title }}</p>
      <h3>记忆整合（Consolidation）</h3>
      <div class="fragment space-y-2 text-left text-[0.72em]">
        <div class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700">
          <span class="font-semibold text-gray-800">去重</span> — 语义相近的多条合并为一条
        </div>
        <div class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700">
          <span class="font-semibold text-gray-800">冲突消解</span> — 保留最新，标记旧的过期
        </div>
        <div class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700">
          <span class="font-semibold text-gray-800">抽象提炼</span> — 多次经历 → 提炼成通用规律
        </div>
      </div>
    </section>

    <section>
      <p :class="partBadgeClass('memory')">{{ parts.memory.num }} · {{ parts.memory.title }}</p>
      <h3>记忆有哪些类型、怎么进入模型</h3>
      <p class="fragment text-[0.78em] text-gray-600"
        >自动注入（每轮必带）vs 按需检索（模型主动调 tool）</p
      >
      <MemoryMap class="fragment" />
    </section>

    <section>
      <p :class="partBadgeClass('memory')">{{ parts.memory.num }} · {{ parts.memory.title }}</p>
      <h3>存储粒度</h3>
      <MemoryGranularity class="fragment" />
    </section>

    <section>
      <p :class="partBadgeClass('memory')">{{ parts.memory.num }} · {{ parts.memory.title }}</p>
      <h3>持久化与读回</h3>
      <MemoryStack class="fragment" />
    </section>

    <section>
      <p :class="partBadgeClass('memory')">{{ parts.memory.num }} · {{ parts.memory.title }}</p>
      <h3>运行时主动控制</h3>
      <RuntimeInject class="fragment" />
    </section>

    <section>
      <p :class="partBadgeClass('memory')">{{ parts.memory.num }} · {{ parts.memory.title }}</p>
      <h3>扩展钩子</h3>
      <HooksGrid class="fragment" />
    </section>
  </section>

  <!-- ═══ 对比 + 总结（纵向） ═══ -->
  <section>
    <section>
      <h3>各家 Agent 的设计决策对比</h3>
      <CompareTable class="fragment" />
    </section>

    <section>
      <h3>全文总结：读 → 用 → 写</h3>
      <MemoryLoop class="fragment" />
      <ul class="fragment mt-4 space-y-1 text-[0.85em] text-gray-700">
        <li><strong>读</strong>：从磁盘加载规则 + 持久记忆 → 注入 system prompt</li>
        <li><strong>用</strong>：messages 维持状态；满了做压缩；大文件分块或委派 sub-agent</li>
        <li><strong>写</strong>：Agent 判断值得记住的信息 → 写入磁盘 → 下次读回</li>
      </ul>
      <div
        class="fragment mt-4 rounded-lg border border-[#dbe3f0] bg-[#fafbfc] px-3 py-2.5 text-[0.78em] text-gray-600"
      >
        用得越多 → 记忆越厚 → 下次理解任务越快。这是 Agent 从"单次工具"变成"长期助手"的关键。
      </div>
    </section>
  </section>
</template>
