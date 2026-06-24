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

const props = withDefaults(
  defineProps<{
    mode?: 'slide' | 'read';
  }>(),
  { mode: 'read' }
);

type PartId = 'turn' | 'compact' | 'memory';

const parts: Record<PartId, { num: string; title: string; desc: string }> = {
  turn: {
    num: '01',
    title: '当前对话',
    desc: 'messages 工作台：拼装流水线、大文件读取、截断后的连贯性'
  },
  compact: {
    num: '02',
    title: '窗口压缩',
    desc: 'context window 内的信息管理：主动压缩、策略组合与 keepRecent'
  },
  memory: {
    num: '03',
    title: '跨轮记忆',
    desc: '窗口外持久化：写入标准、类型划分、粒度与读回路径'
  }
};

const slide = () => props.mode === 'slide';
const frag = (extra = '') => (slide() ? `fragment ${extra}`.trim() : extra);

const partAccent: Record<PartId, string> = {
  turn: 'border-l-blue-600',
  compact: 'border-l-amber-600',
  memory: 'border-l-emerald-600'
};

const partBadgeClass = (part: PartId) =>
  [
    'inline-block border-l-[3px] bg-gray-50 font-semibold tracking-wide text-gray-600',
    slide() ? 'mb-[0.55em] px-[0.55em] py-[0.18em] text-[0.42em]' : 'mb-3 px-2.5 py-1 text-xs',
    partAccent[part]
  ].join(' ');

const partDividerClass = () =>
  slide() ? 'deck-part-divider text-center' : 'mt-16 border-t-2 border-gray-200 pt-10';

const partNumClass = () =>
  slide() ? 'm-0 text-[0.5em] font-semibold tracking-widest text-gray-400' : 'm-0 text-xs font-semibold tracking-widest text-gray-400';

const partTitleClass = () =>
  slide()
    ? 'm-0 mb-[0.4em] text-[1.55em] font-bold text-gray-900'
    : 'mt-1 text-[1.75rem] font-bold text-gray-900';

const partDescClass = () =>
  slide()
    ? 'mx-auto mt-0 max-w-[24em] text-[0.58em] leading-relaxed text-gray-500'
    : 'mt-2 text-[0.9em] text-gray-600';

const lead = () =>
  slide()
    ? 'mb-3 max-w-[95%] text-[0.68em] leading-relaxed text-gray-600'
    : 'text-[0.85em] text-gray-600';

const note = () =>
  slide() ? 'text-[0.58em] leading-snug text-gray-500' : 'text-[0.75em] text-gray-500';

const sectionGap = () => (slide() ? undefined : 'mt-10');
const coverClass = () => (slide() ? 'deck-cover text-center' : undefined);
const coverSubtitleClass = () =>
  slide() ? 'mx-auto max-w-[22em] text-[0.55em] font-normal text-gray-500' : undefined;
</script>

<template>
  <section :class="coverClass()">
    <h1>Agent 的上下文管理</h1>
    <blockquote :class="slide() ? `${frag()} ${coverSubtitleClass()}` : undefined">
      <p>当前对话 · 窗口压缩 · 跨轮记忆</p>
    </blockquote>
  </section>

  <section :class="sectionGap()">
    <h3>核心约束</h3>
    <p :class="lead()">
      LLM 无跨调用记忆：每轮请求传入完整 <code>messages</code>。超出 context window 后从最早消息截断；输入 token 随历史增长而增加。
    </p>
    <ContextOverview part="limits" />
    <ContextOverview part="blocks" :class="frag('mt-3')" />
  </section>

  <section :class="partDividerClass()">
    <p :class="partNumClass()">{{ parts.turn.num }}</p>
    <h2 :class="partTitleClass()">{{ parts.turn.title }}</h2>
    <p :class="partDescClass()">{{ parts.turn.desc }}</p>
  </section>

  <section :class="sectionGap()">
    <p :class="partBadgeClass('turn')">{{ parts.turn.num }} · {{ parts.turn.title }}</p>
    <h3>短期记忆：messages 列表</h3>
    <p :class="lead()">
      当前任务的 <code>messages</code> 即工作台；每次 API 调用携带该列表的全量内容。
    </p>
    <ContextOverview part="loop" />
  </section>

  <section :class="sectionGap()">
    <p :class="partBadgeClass('turn')">{{ parts.turn.num }} · {{ parts.turn.title }}</p>
    <h3>调用前流水线</h3>
    <p :class="lead()">拼上下文 → 裁剪/注入 → 过滤映射 → 调用 LLM；每步明确拼入什么、裁掉什么，最终形成模型请求体。</p>
    <ContextPipeline />
  </section>

  <section :class="sectionGap()">
    <p :class="partBadgeClass('turn')">{{ parts.turn.num }} · {{ parts.turn.title }}</p>
    <h3>大文件读取：分块续读</h3>
    <p :class="lead()">
      pi 的 <code>read</code> 从磁盘读全文件后切片；单次 toolResult 硬上限 2000 行或 50KB，超出部分附带
      <code>Use offset=… to continue</code> 提示，由模型多轮续读。
    </p>
    <ReadFileViz mode="chunk" />
  </section>

  <section :class="sectionGap()">
    <p :class="partBadgeClass('turn')">{{ parts.turn.num }} · {{ parts.turn.title }}</p>
    <h3>大文件读取：关键词定位</h3>
    <p :class="lead()">
      pi <code>grep</code> 调 ripgrep，返回 <code>文件:行号: 内容</code>（默认 100 条匹配、单行 500 字符）；
      需要更大范围时，模型可再 <code>read(offset, limit)</code>——这是常见策略，不是 grep 内置第二步。
    </p>
    <ReadFileViz mode="grep" />
  </section>

  <section :class="sectionGap()">
    <p :class="partBadgeClass('turn')">{{ parts.turn.num }} · {{ parts.turn.title }}</p>
    <h3>大文件读取：尾部场景</h3>
    <p :class="lead()">
      bash 输出超限：pi 统计 stdout+stderr，超 2000 行或 50KB 自动 truncateTail；读日志末尾由模型发
      <code>tail</code>；不够则 read 临时文件或扩大范围。
    </p>
    <ReadFileViz mode="tail" />
  </section>

  <section :class="sectionGap()">
    <p :class="partBadgeClass('turn')">{{ parts.turn.num }} · {{ parts.turn.title }}</p>
    <h3>截断后怎么衔接</h3>
    <p :class="lead()">
      三件事：工具调用和返回要成对；裁切按行不按词；裁掉的部分靠续读提示和压缩摘要补——pi 保证格式不乱，不保证模型一次看懂全部。
    </p>
    <CoherenceViz />
  </section>

  <section :class="partDividerClass()">
    <p :class="partNumClass()">{{ parts.compact.num }}</p>
    <h2 :class="partTitleClass()">{{ parts.compact.title }}</h2>
    <p :class="partDescClass()">{{ parts.compact.desc }}</p>
  </section>

  <section :class="sectionGap()">
    <p :class="partBadgeClass('compact')">{{ parts.compact.num }} · {{ parts.compact.title }}</p>
    <h3>主动压缩</h3>
    <ProactiveCompress />
  </section>

  <section :class="sectionGap()">
    <p :class="partBadgeClass('compact')">{{ parts.compact.num }} · {{ parts.compact.title }}</p>
    <h3>记忆压缩方法</h3>
    <p :class="lead()">
      常见组合：滑动窗口 + 摘要压缩。亦可叠加重要性过滤与结构化抽取。
    </p>
    <CompressionMethods />
    <p :class="frag(`mt-3 ${note()}`)">
      Prompt Caching（计算层）与记忆压缩（信息层）互补，不互相替代。
    </p>
  </section>

  <section :class="sectionGap()">
    <p :class="partBadgeClass('compact')">{{ parts.compact.num }} · {{ parts.compact.title }}</p>
    <h3>实现：keepRecent 切分</h3>
    <p :class="lead()">
      切点之后保留原文；更早历史合并为摘要；右侧预留回复 token。
    </p>
    <CompactionViz />
    <p :class="frag(`mt-3 ${lead()}`)">
      触发条件：已用 token &gt; 窗口上限 − 回复预留
    </p>
    <CompactionSteps :class="frag('mt-3')" />
  </section>

  <section :class="partDividerClass()">
    <p :class="partNumClass()">{{ parts.memory.num }}</p>
    <h2 :class="partTitleClass()">{{ parts.memory.title }}</h2>
    <p :class="partDescClass()">{{ parts.memory.desc }}</p>
  </section>

  <section :class="sectionGap()">
    <p :class="partBadgeClass('memory')">{{ parts.memory.num }} · {{ parts.memory.title }}</p>
    <h3>写入标准</h3>
    <p :class="lead()">仅持久化对后续任务有增量价值的信息。</p>
    <MemoryStoreGuide />
  </section>

  <section :class="sectionGap()">
    <p :class="partBadgeClass('memory')">{{ parts.memory.num }} · {{ parts.memory.title }}</p>
    <h3>跨轮记忆类型</h3>
    <p :class="lead()">
      任务结束后 <code>messages</code> 清空；跨轮数据落盘后，在拼上下文阶段注入。
    </p>
    <MemoryMap />
  </section>

  <section :class="sectionGap()">
    <p :class="partBadgeClass('memory')">{{ parts.memory.num }} · {{ parts.memory.title }}</p>
    <h3>存储粒度</h3>
    <MemoryGranularity />
  </section>

  <section :class="sectionGap()">
    <p :class="partBadgeClass('memory')">{{ parts.memory.num }} · {{ parts.memory.title }}</p>
    <h3>持久化与读回</h3>
    <p :class="lead()">磁盘：1 行 JSON = 1 entry。读回：转为 message 或摘要块后拼入上下文。</p>
    <MemoryStack />
  </section>

  <section :class="sectionGap()">
    <h3>记忆生命周期</h3>
    <p :class="lead()">读（任务开始注入）→ 用（执行中维持 messages）→ 写（任务结束落盘）。</p>
    <MemoryLoop />
    <ul :class="frag(slide() ? 'mt-4 space-y-1 ' + lead() : 'mt-4 space-y-1 text-[0.85em] text-gray-700')">
      <li><strong>当前对话</strong>：本轮 LLM 可见的全部输入</li>
      <li><strong>窗口压缩</strong>：context window 内的信息管理策略</li>
      <li><strong>跨轮记忆</strong>：窗口外持久化，按需注入</li>
    </ul>
  </section>
</template>
