<template>
  <div class="mt-3 space-y-2 text-left" data-reveal-interactive @click.stop>
    <!-- 分块续读 -->
    <template v-if="mode === 'chunk'">
      <p class="text-[0.68rem] text-gray-500">
        续读时模型通常只传 <code>offset</code>，不传 <code>limit</code>——由 pi
        <code>truncateHead</code> 自动截到 {{ MAX_LINES }} 行；<code>limit</code>
        仅在精读等场景由模型自选。
      </p>

      <div class="grid grid-cols-3 gap-2 text-[0.8rem]">
        <div class="rounded-lg border border-gray-200 bg-gray-50 p-2">
          <div class="mb-1 font-bold text-gray-500">磁盘</div>
          <div class="font-mono text-gray-700">app.ts</div>
          <div class="mt-1 text-gray-500">共 {{ TOTAL }} 行（全量在磁盘）</div>
          <div class="relative mt-2 h-6 overflow-hidden rounded bg-gray-200">
            <div
              class="absolute inset-y-0 bg-[#3e66ae]/25 transition-all duration-300"
              :style="{ left: chunkVisual.left, width: chunkVisual.width }"
            />
          </div>
        </div>

        <div class="rounded-lg border border-[#3e66ae]/40 bg-[#eef3fb] p-2">
          <div class="mb-1 font-bold text-[#3e66ae]">模型发起</div>
          <CodeBlock :code="chunkSteps[chunkIdx].call" language="text" />
        </div>

        <div class="rounded-lg border border-amber-200 bg-amber-50/60 p-2">
          <div class="mb-1 font-bold text-amber-800">进上下文 toolResult</div>
          <div class="font-mono text-[0.72rem] leading-relaxed text-gray-700">
            {{ chunkSteps[chunkIdx].result }}
          </div>
          <div v-if="chunkSteps[chunkIdx].hint" class="mt-1.5 text-[0.7rem] text-amber-700">
            {{ chunkSteps[chunkIdx].hint }}
          </div>
        </div>
      </div>

      <div class="flex gap-2">
        <button
          v-for="(s, i) in chunkSteps"
          :key="i"
          type="button"
          class="flex-1 rounded-md border px-1 py-1.5 text-[0.8rem] transition-all"
          :class="
            chunkIdx === i
              ? 'border-[#3e66ae] bg-[#eef3fb] font-semibold text-[#3e66ae]'
              : 'border-gray-200 text-gray-500'
          "
          @click="chunkIdx = i"
        >
          第 {{ i + 1 }} 次 read
        </button>
      </div>
    </template>

    <!-- grep（pi 真实行为 + 可选 read 精读） -->
    <template v-else-if="mode === 'grep'">
      <p class="text-[0.68rem] text-gray-500">
        pi <code>grep</code> 底层调 <strong>ripgrep</strong>，默认最多 {{ GREP_LIMIT }} 条匹配、单行
        {{ GREP_LINE_CHARS }} 字符、总输出 {{ MAX_KB }}；结果已含
        <code>文件:行号: 内容</code>，不是只返回行号。
      </p>

      <div class="grid grid-cols-2 gap-2">
        <div class="rounded-lg border border-gray-200 bg-gray-50 p-2">
          <div class="mb-1 text-[0.8rem] font-bold text-gray-500">① grep 进上下文（pi 实现）</div>
          <CodeBlock :code="grepCall" language="json" />
          <div class="mt-2 space-y-0.5 font-mono text-[0.72rem]">
            <button
              v-for="(hit, i) in grepHits"
              :key="i"
              type="button"
              class="block w-full rounded px-1.5 py-0.5 text-left transition-colors"
              :class="
                grepIdx === i ? 'bg-[#eef3fb] text-[#3e66ae]' : 'text-gray-600 hover:bg-white'
              "
              @click="grepIdx = i"
            >
              {{ hit.formatted }}
            </button>
          </div>
          <div class="mt-1.5 text-[0.68rem] text-gray-500">
            也可用 <code>context</code> 参数在 grep 里直接带上下文行，不必再 read
          </div>
        </div>

        <div class="rounded-lg border border-[#3e66ae]/40 bg-[#eef3fb] p-2">
          <div class="mb-1 text-[0.8rem] font-bold text-[#3e66ae]"
            >② read 精读（模型自选，非 grep 内置）</div
          >
          <p class="mb-1 text-[0.68rem] text-gray-500">
            行被截断到 {{ GREP_LINE_CHARS }} 字符、或需要更大范围时，模型再发起 read
          </p>
          <CodeBlock :code="grepReadCall" language="text" />
          <div
            class="mt-2 rounded bg-white/80 p-2 font-mono text-[0.7rem] leading-relaxed text-gray-700"
          >
            <div v-for="(ln, i) in grepReadPreview" :key="i">{{ ln }}</div>
          </div>
        </div>
      </div>
    </template>

    <!-- 尾部：调用 → 为何 → 进上下文 → 不够怎么办 -->
    <template v-else>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="t in tailTabs"
          :key="t.id"
          type="button"
          class="rounded-md border px-2 py-1 text-[0.8rem] transition-all"
          :class="
            tailTab === t.id
              ? 'border-[#3e66ae] bg-[#eef3fb] font-semibold text-[#3e66ae]'
              : 'border-gray-200 text-gray-500'
          "
          @click="
            tailTab = t.id;
            tailStepIdx = 0;
          "
        >
          {{ t.label }}
        </button>
      </div>

      <div class="flex gap-2">
        <button
          v-for="(s, i) in activeTailSteps"
          :key="s.id"
          type="button"
          class="flex-1 rounded-md border px-1 py-1.5 text-[0.72rem] transition-all"
          :class="
            tailStepIdx === i
              ? 'border-[#3e66ae] bg-[#eef3fb] font-semibold text-[#3e66ae]'
              : 'border-gray-200 text-gray-500'
          "
          @click="tailStepIdx = i"
        >
          {{ i + 1 }}. {{ s.short }}
        </button>
      </div>

      <div class="rounded-lg border border-[#dbe3f0] bg-white p-2.5 text-[0.8rem]">
        <div class="mb-1 font-bold text-gray-800">{{ activeTailStep.title }}</div>
        <p class="leading-relaxed text-gray-600">{{ activeTailStep.body }}</p>

        <div v-if="activeTailStep.call" class="mt-2">
          <div class="mb-0.5 text-[0.68rem] font-semibold text-[#3e66ae]">调用</div>
          <CodeBlock :code="activeTailStep.call" language="text" />
        </div>

        <div v-if="activeTailStep.who" class="mt-2 flex flex-wrap gap-1">
          <span
            class="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[0.68rem] text-gray-600"
            >{{ activeTailStep.who }}</span
          >
        </div>

        <div v-if="activeTailStep.thresholds?.length" class="mt-2 space-y-1">
          <div class="text-[0.68rem] font-semibold text-gray-700">
            pi 判断条件（任一满足即截断；右侧为示意数值，非真实跑出来的）
          </div>
          <div
            v-for="(t, i) in activeTailStep.thresholds"
            :key="i"
            class="flex flex-wrap items-center gap-1.5 rounded border px-2 py-1 text-[0.7rem]"
            :class="t.hit ? 'border-amber-300 bg-amber-50/80' : 'border-gray-200 bg-gray-50'"
          >
            <code class="text-slate-700">{{ t.label }}</code>
            <span class="text-gray-500">{{ t.limit }}</span>
            <span class="text-gray-400">·</span>
            <span :class="t.hit ? 'font-semibold text-amber-800' : 'text-gray-600'"
              >示意 {{ t.example }}</span
            >
            <span v-if="t.hit" class="rounded bg-amber-200 px-1 text-[0.8rem] text-amber-900"
              >触发</span
            >
          </div>
        </div>

        <div
          v-if="activeTailStep.output"
          class="mt-2 rounded border border-amber-200 bg-amber-50/60 p-2 font-mono text-[0.7rem] leading-relaxed text-amber-900"
        >
          <div v-for="(ln, i) in activeTailStep.output" :key="i">{{ ln }}</div>
          <div v-if="activeTailStep.hint" class="mt-1.5 text-amber-700">{{
            activeTailStep.hint
          }}</div>
        </div>

        <div v-if="activeTailStep.actions?.length" class="mt-2 space-y-1">
          <div class="text-[0.68rem] font-semibold text-emerald-700">模型可继续</div>
          <div
            v-for="(a, i) in activeTailStep.actions"
            :key="i"
            class="rounded bg-emerald-50/80 px-2 py-1 text-[0.7rem] text-gray-700"
          >
            <code class="text-emerald-800">{{ a.call }}</code>
            <span class="text-gray-500"> — {{ a.why }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import CodeBlock from './CodeBlock.vue';

withDefaults(
  defineProps<{
    mode?: 'chunk' | 'grep' | 'tail';
  }>(),
  { mode: 'chunk' }
);

const MAX_LINES = 2000;
const MAX_KB = '50KB';
const TOTAL = 8400;
const GREP_LIMIT = 100;
const GREP_LINE_CHARS = 500;

type TailAction = { call: string; why: string };
type TailThreshold = { label: string; limit: string; example: string; hit: boolean };
type TailStep = {
  id: string;
  short: string;
  title: string;
  body: string;
  call?: string;
  who?: string;
  thresholds?: TailThreshold[];
  output?: string[];
  hint?: string;
  actions?: TailAction[];
};

const chunkIdx = ref(0);
const grepIdx = ref(0);
const tailTab = ref<'bash' | 'file'>('bash');
const tailStepIdx = ref(0);

const chunkSteps = [
  {
    call: 'read("app.ts")',
    result: '第 1–2000 行原文',
    hint: '[Showing lines 1-2000 of 8400. Use offset=2001 to continue.]',
    start: 1,
    end: 2000
  },
  {
    call: 'read("app.ts", offset=2001)',
    result: '第 2001–4000 行原文',
    hint: '[Showing lines 2001-4000 of 8400. Use offset=4001 to continue.]',
    start: 2001,
    end: 4000
  },
  {
    call: 'read("app.ts", offset=4001)',
    result: '第 4001–6000 行原文',
    hint: '[Showing lines 4001-6000 of 8400. Use offset=6001 to continue.]',
    start: 4001,
    end: 6000
  }
];

const chunkVisual = computed(() => {
  const s = chunkSteps[chunkIdx.value];
  const left = ((s.start - 1) / TOTAL) * 100;
  const width = ((s.end - s.start + 1) / TOTAL) * 100;
  return { left: `${left}%`, width: `${width}%` };
});

const grepCall = '{ pattern: "handleSubmit", path: "app.ts" }';

const grepHits = [
  { line: 412, formatted: 'app.ts:412: export function handleSubmit() {' },
  { line: 891, formatted: 'app.ts:891:   await handleSubmit(form);' },
  { line: 1204, formatted: 'app.ts:1204: // TODO: refactor handleSubmit' }
];

const grepReadCall = computed(() => {
  const line = grepHits[grepIdx.value].line;
  const start = Math.max(1, line - 5);
  return `read("app.ts", offset=${start}, limit=15)`;
});

const grepReadPreview = computed(() => {
  const line = grepHits[grepIdx.value].line;
  const start = Math.max(1, line - 5);
  const lines: string[] = [];
  for (let i = 0; i < 15; i++) {
    const n = start + i;
    const mark = n === line ? '→' : ' ';
    lines.push(`${mark} ${n}: …`);
  }
  return lines;
});

const tailTabs = [
  { id: 'bash' as const, label: 'bash 输出超限（pi 自动截尾）' },
  { id: 'file' as const, label: '读日志文件末尾（模型主动）' }
];

const bashTailSteps: TailStep[] = [
  {
    id: 'call',
    short: '怎么调用',
    title: '模型只发 bash 命令',
    body: '模型调用 bash 工具执行命令。pi 在后台用 OutputAccumulator 流式收集 stdout + stderr 文本，模型不参与长度判断。',
    call: '{ command: "npm test" }',
    who: '模型发起 · pi 执行并累计输出'
  },
  {
    id: 'judge',
    short: '何时超限',
    title: '什么叫「bash 输出超限」',
    body: '命令跑完后，pi 用 OutputAccumulator 累计 stdout+stderr，对比写死的阈值。下面用 npm test 场景举例说明判断逻辑——数字仅为示意，真实值取决于项目。',
    thresholds: [
      { label: 'totalLines', limit: '> 2000 行', example: '假设 12000 行', hit: true },
      { label: 'totalDecodedBytes', limit: '> 50KB', example: '假设 >50KB', hit: true }
    ],
    who: '任一满足 → truncated=true · 阈值来自 truncate.js（DEFAULT_MAX_LINES / DEFAULT_MAX_BYTES）'
  },
  {
    id: 'truncate',
    short: '截断做什么',
    title: '超限后 pi 自动 truncateTail',
    body: '丢掉输出开头，只把最后 2000 行或 50KB 放进 toolResult。假设：测试/构建的失败信息和 stack trace 通常在输出末尾。',
    who: 'pi 内置 · 模型不会、也不能传 truncateTail 参数'
  },
  {
    id: 'result',
    short: '进上下文',
    title: '模型看到的 toolResult',
    body: '末尾内容 + pi 生成的续读提示（告知被截了多少行、完整输出在哪）。',
    output: [
      '…（前 10000 行未进上下文，示意）',
      'FAIL src/auth.test.ts',
      '  Expected true, received false',
      '  at handleSubmit (auth.ts:42)'
    ],
    hint: '[Showing lines 11801-12000 of 12000. Full output: /tmp/pi-bash-a1b2c3.log]（pi 生成的提示格式，行号为示意）'
  },
  {
    id: 'more',
    short: '不够怎么办',
    title: '尾部信息不够时，模型继续扩读',
    body: '全量已在临时文件中。模型根据 toolResult 提示再发起 read / grep / 缩小命令重跑。',
    actions: [
      {
        call: 'read("/tmp/pi-bash-a1b2c3.log", offset=11500)',
        why: '从更早行号往前读，补失败前上下文'
      },
      {
        call: '{ command: "grep -n FAIL /tmp/pi-bash-a1b2c3.log" }',
        why: '在完整输出里定位第一个失败点'
      },
      {
        call: '{ command: "npm test -- --testNamePattern=auth" }',
        why: '缩小命令，让输出不再超限'
      }
    ]
  }
];

const fileTailSteps: TailStep[] = [
  {
    id: 'why',
    short: '为何读尾',
    title: '模型主动选择「只要最近」',
    body: '日志按时间追加，排查当下故障时，最新 ERROR / stack trace 在文件末尾。整文件 read 会浪费 context，所以模型常用 tail。',
    who: '模型决策 · pi read 无 tail 模式'
  },
  {
    id: 'call',
    short: '怎么调用',
    title: '常见：bash tail，不是 read 内置',
    body: '读文件末尾靠模型发 shell 命令；若已知总行数，也可 read 自算 offset。',
    call: '{ command: "tail -n 50 app.log" }',
    actions: [
      {
        call: 'read("app.log", offset=8351, limit=50)',
        why: '备选：须已知总行数（如前次 read 提示 of 8400）'
      }
    ]
  },
  {
    id: 'result',
    short: '进上下文',
    title: 'tail 输出进 toolResult',
    body: '50 行日志通常不触发截断；若 tail 行数很大，同样走 truncateTail + fullOutputPath。',
    output: [
      '2024-06-15 10:23:01 INFO request completed',
      '2024-06-15 10:23:02 ERROR unhandled rejection',
      '  at processQueue (app.ts:8391)',
      '  at main (app.ts:8398)'
    ],
    hint: '（未超限时无截断提示）'
  },
  {
    id: 'more',
    short: '不够怎么办',
    title: '末尾几行不够定位时',
    body: '模型扩大范围或换工具，多轮补上下文——与分块续读同一套路。',
    actions: [
      {
        call: '{ command: "tail -n 500 app.log" }',
        why: '扩大时间窗口，多看几百行'
      },
      {
        call: '{ pattern: "ERROR", path: "app.log" }',
        why: 'grep 定位所有错误行号，再 read 精读'
      },
      {
        call: 'read("app.log", offset=8200, limit=200)',
        why: '已知行号后，精读更大片段'
      }
    ]
  }
];

const activeTailSteps = computed(() => (tailTab.value === 'bash' ? bashTailSteps : fileTailSteps));
const activeTailStep = computed(() => activeTailSteps.value[tailStepIdx.value]);
</script>
