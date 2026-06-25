<template>
  <div class="mt-3 text-left" data-reveal-interactive @click.stop>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="t in tabs"
        :key="t.id"
        type="button"
        class="rounded-md border px-2 py-1 text-[0.65rem] transition-all"
        :class="
          active === t.id
            ? 'border-[#3e66ae] bg-[#eef3fb] font-semibold text-[#3e66ae]'
            : 'border-gray-200 text-gray-500'
        "
        @click="active = t.id"
      >
        {{ t.label }}
      </button>
    </div>

    <!-- 放不下结果怎么办 -->
    <div v-if="active === 'pairing'" class="mt-2 space-y-2 text-[0.65rem]">
      <p class="rounded-lg bg-slate-100 px-2.5 py-2 text-gray-700">
        LLM API 协议要求：<strong>tool_use 后面必须跟 tool_result</strong
        >。如果上下文放不下了，不能只留调用、丢掉返回。那怎么办？
      </p>
      <div class="space-y-1.5">
        <div
          v-for="item in pairingItems"
          :key="item.title"
          class="rounded-lg border border-[#dbe3f0] bg-white px-2.5 py-2"
        >
          <div class="font-semibold text-[#3e66ae]">{{ item.title }}</div>
          <div class="mt-0.5 text-gray-600">{{ item.body }}</div>
        </div>
      </div>
      <div class="rounded-lg border border-amber-200 bg-amber-50/60 px-2.5 py-2 text-gray-700">
        <strong>所以不存在「只放下调用放不下结果」的情况</strong>——pi
        在切点选择上就规避了这个问题。如果空间不够，整对（调用+结果）一起被压缩进摘要。
      </div>
    </div>

    <!-- 截在哪 -->
    <div v-else-if="active === 'boundary'" class="mt-2 space-y-2 text-[0.65rem]">
      <p class="text-gray-600">
        文件/命令输出太长时，pi
        按<strong>行</strong>裁，不按「词」裁。尽量不出现半行乱码，但整行、整段仍可能被丢掉。
      </p>
      <div class="overflow-x-auto rounded-lg border border-slate-200">
        <table class="w-full text-left text-[0.62rem]">
          <thead class="bg-slate-100 text-gray-600">
            <tr>
              <th class="px-2 py-1.5">场景</th>
              <th class="px-2 py-1.5">会裁到半行吗</th>
              <th class="px-2 py-1.5">pi 怎么处理</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="row in boundaryRows" :key="row.tool">
              <td class="px-2 py-1.5 text-slate-800">{{ row.tool }}</td>
              <td class="px-2 py-1.5" :class="row.partial ? 'text-amber-700' : 'text-emerald-700'">
                {{ row.partial ? '有可能' : '不会，只丢整行' }}
              </td>
              <td class="px-2 py-1.5 text-gray-600">{{ row.how }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="rounded-lg border border-amber-200 bg-amber-50/60 px-2.5 py-2 text-gray-700">
        <strong>丢的是整行/整段内容，不是半个字。</strong>
        模型看到的 toolResult 虽然不完整，但格式是合法的——丢了多少行、从哪接着读，都有提示。
      </div>
    </div>

    <!-- 丢了怎么补 -->
    <div v-else class="mt-2 space-y-2 text-[0.65rem]">
      <p class="text-gray-600">
        语义丢失后，靠两条路径补回：<strong>工具级</strong>的续读提示 +
        <strong>会话级</strong>的压缩摘要。
      </p>

      <div class="rounded-lg border border-[#dbe3f0] bg-white p-2.5">
        <div class="mb-1.5 text-[0.62rem] font-bold text-[#3e66ae]">工具级：续读提示</div>
        <p class="text-gray-600">
          每次截断后，pi 在 toolResult 末尾追加提示，告诉模型：被截了多少、全量在哪、怎么接着读。
        </p>
        <div class="mt-2 space-y-1.5">
          <div
            v-for="hint in toolHints"
            :key="hint.scene"
            class="rounded border border-gray-100 bg-[#fafbfc] px-2 py-1.5"
          >
            <span class="font-semibold text-slate-700">{{ hint.scene }}</span>
            <CodeBlock :code="hint.example" language="text" />
          </div>
        </div>
      </div>

      <div class="rounded-lg border border-[#dbe3f0] bg-white p-2.5">
        <div class="mb-1.5 text-[0.62rem] font-bold text-emerald-700">会话级：压缩摘要</div>
        <p class="text-gray-600">
          更早的对话（包括完整的 tool 调用链）被 Compaction 折叠成结构化摘要。模型通过摘要中的 Goal
          / Progress / read-files 恢复上下文。
        </p>
        <CodeBlock :code="summaryExample" language="markdown" />
      </div>

      <div class="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-2 text-gray-600">
        <strong>关键点：</strong>pi 不会自动把裁掉的内容补回来。它只提供线索，由模型自己决定要不要再
        read / grep / bash。
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CodeBlock from './CodeBlock.vue';

const active = ref<'pairing' | 'boundary' | 'continue'>('pairing');

const tabs = [
  { id: 'pairing' as const, label: '① 放不下结果怎么办' },
  { id: 'boundary' as const, label: '② 截断边界在哪' },
  { id: 'continue' as const, label: '③ 丢了怎么恢复' }
];

const pairingItems = [
  {
    title: '切点永远不落在 tool_result 上',
    body: 'Compaction 的 findCutPoint 只允许在 user 或 assistant 消息处切开。tool_use + tool_result 作为整体要么全保留、要么全进摘要。'
  },
  {
    title: '单条 toolResult 内部可以被截短，但消息本身不会被拆',
    body: 'read 返回 8000 行文件只展示前 2000 行——内容不全，但消息格式完整，模型可以续读。'
  },
  {
    title: '如果 tool_result 太大？在写入 messages 前就已截断',
    body: '截断发生在工具执行层（truncateHead / truncateTail），进入 messages 的永远是合法大小的完整消息。'
  }
];

const boundaryRows = [
  {
    tool: 'read 读文件',
    partial: false,
    how: '按整行累加；超 50KB 就停在前一行。首行就超 50KB 则不给内容，提示换 sed 读。'
  },
  {
    tool: 'bash 命令输出',
    partial: true,
    how: '一般保留完整行；只有「最后一行本身超 50KB」时，才只取行尾一段。'
  },
  {
    tool: 'grep 搜索结果',
    partial: true,
    how: '单行超 500 字会截断并标 [truncated]，提示用 read 看全文。'
  }
];

const toolHints = [
  {
    scene: 'read 文件截断',
    example: '[Showing lines 1-2000 of 8400. Use offset=2001 to continue.]'
  },
  {
    scene: 'bash 输出截断',
    example: '[Showing last 2000 lines. Full output: /tmp/pi-bash-a1b2c3.log]'
  },
  {
    scene: 'grep 行过长',
    example: 'app.ts:412: export function handleSub... [truncated]'
  }
];

const summaryExample = `## Goal
修复 handleSubmit 的类型错误

## Progress
- 已 grep 定位到 auth.ts:42
- 尝试修复但测试仍失败

<read-files>src/auth.ts, src/app.ts</read-files>`;
</script>
