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
import MemoryMap from './components/MemoryMap.vue';
import MemoryGranularity from './components/MemoryGranularity.vue';
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
        不需要从头读——grep 直接返回匹配行的内容和行号。需要看上下文时再 read 那一小段。
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
      <h3>记忆的四个层次</h3>
      <div class="fragment space-y-1.5 text-[0.72em]">
        <div class="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
          <span
            class="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[0.6rem] font-bold text-gray-500"
            >最短暂</span
          >
          <div><strong>感知记忆</strong> — 当前这条输入，处理完就消失</div>
        </div>
        <div
          class="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50/50 px-3 py-2"
        >
          <span
            class="shrink-0 rounded bg-blue-100 px-1.5 py-0.5 text-[0.6rem] font-bold text-blue-700"
            >会话内</span
          >
          <div><strong>短期记忆</strong> — messages 列表，任务结束就清空（第一章已讲）</div>
        </div>
        <div
          class="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/50 px-3 py-2"
        >
          <span
            class="shrink-0 rounded bg-emerald-100 px-1.5 py-0.5 text-[0.6rem] font-bold text-emerald-700"
            >跨会话</span
          >
          <div><strong>长期记忆</strong> — 磁盘/数据库持久化，语义检索召回</div>
        </div>
        <div
          class="flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50/50 px-3 py-2"
        >
          <span
            class="shrink-0 rounded bg-purple-100 px-1.5 py-0.5 text-[0.6rem] font-bold text-purple-700"
            >结构化</span
          >
          <div
            ><strong>实体记忆</strong> — 长期记忆的精炼版：从文本中提取为结构化字段，可精确查询</div
          >
        </div>
      </div>
      <p class="fragment mt-2 text-[0.65em] text-gray-500">
        长期记忆可细分：情节记忆（具体经历）、语义记忆（提炼规律）、程序记忆（操作流程）。
      </p>
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
      <h3>什么会被写入记忆——由 LLM 判断</h3>
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
      <h3>记忆存在哪</h3>
      <div class="fragment space-y-1.5 text-[0.7em]">
        <div class="rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-700">
          <strong>Markdown 文件</strong> — 最简单：MEMORY.md / USER.md，每轮读取拼入。pi
          hermes-memory、Claude Code 都用这种。
        </div>
        <div class="rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-700">
          <strong>SQLite（全文检索）</strong> — pi hermes-memory 的会话搜索用 FTS5
          索引，支持按关键词检索历史会话。
        </div>
        <div class="rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-700">
          <strong>向量数据库</strong> — Mem0、Letta 等框架用 embedding
          做语义检索，适合大量非结构化记忆。
        </div>
        <div class="rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-700">
          <strong>知识图谱</strong> — Zep/Graphiti 用三元组存储实体关系，支持多跳推理。
        </div>
      </div>
    </section>

    <section>
      <p :class="partBadgeClass('memory')">{{ parts.memory.num }} · {{ parts.memory.title }}</p>
      <h3>扩展钩子</h3>
      <HooksGrid class="fragment" />
    </section>
  </section>

  <!-- ═══ 对比 + 启发（纵向） ═══ -->
  <section>
    <section>
      <h3>各家 Agent 的设计决策对比</h3>
      <CompareTable class="fragment" />
    </section>

    <section>
      <h3>了解上下文管理后，怎么用好 Agent</h3>
      <ul class="fragment space-y-2 text-[0.78em] text-gray-700">
        <li
          ><strong>关键约束写进规则文件</strong>——不要只口头说"用 TypeScript"，写进 CLAUDE.md /
          .cursorrules，永远不会被压缩掉</li
        >
        <li
          ><strong>长对话主动开新会话</strong>——与其让 Agent
          反复压缩丢细节，不如在关键节点开新会话、把结论带过去</li
        >
        <li
          ><strong>大任务拆成小任务</strong
          >——每个小任务在一个干净的上下文里完成，比一个超长会话效果好</li
        >
        <li
          ><strong>别重复粘贴大段代码</strong>——Agent 能自己 read 文件，你粘进去只是浪费
          token、加速触发压缩</li
        >
        <li
          ><strong>发现 Agent "失忆"时</strong
          >——不是它笨，是上下文被压缩了。重新明确关键信息，或检查规则文件是否缺失</li
        >
      </ul>
    </section>
  </section>
</template>
