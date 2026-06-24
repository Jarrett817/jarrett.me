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

    <!-- 调用和结果要成对 -->
    <div v-if="active === 'pairing'" class="mt-2 space-y-2 text-[0.65rem]">
      <p class="rounded-lg bg-slate-100 px-2.5 py-2 text-gray-700">
        这里说的是：<strong>发给 LLM 的对话记录格式不能坏</strong>。pi 会保证「调了工具」后面一定有「工具返回」，压缩时也不会从返回中间切开。
        <span class="text-gray-500">——不等于模型看懂了全部内容。</span>
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
    </div>

    <!-- 截在哪 -->
    <div v-else-if="active === 'boundary'" class="mt-2 space-y-2 text-[0.65rem]">
      <p class="text-gray-600">
        文件/命令输出太长时，pi 按<strong>行</strong>裁，不按「词」裁。尽量不出现半行乱码，但整行、整段仍可能被丢掉。
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
        <strong>一个字会被劈成两半吗？</strong>
        汉字不会在 UTF-8 字节中间切断。但如果一行特别长，可能只保留这一行的<strong>尾部一段</strong>，前面的字整段没了——需要模型再 read 补。
      </div>
    </div>

    <!-- 丢了怎么补 -->
    <div v-else class="mt-2 space-y-2 text-[0.65rem]">
      <p class="text-gray-600">
        被裁掉的内容，pi 会在 tool 返回末尾<strong>写明怎么继续读</strong>；更早的对话则靠窗口压缩时的摘要补上。
      </p>
      <div
        v-for="hint in continuationHints"
        :key="hint.tool"
        class="rounded-lg border border-[#dbe3f0] bg-white p-2"
      >
        <span class="text-[0.62rem] font-semibold text-[#3e66ae]">{{ hint.tool }}</span>
        <pre
          class="mt-1 overflow-x-auto rounded bg-slate-900 px-2 py-1.5 text-[0.58rem] leading-relaxed text-slate-100"
        ><code>{{ hint.example }}</code></pre>
        <div class="mt-1 text-gray-500">{{ hint.note }}</div>
      </div>
      <div class="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-2 text-gray-600">
        模型要根据这些提示自己再调 read / grep / bash；pi 不会自动把裁掉的部分拼回去。
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const active = ref<'pairing' | 'boundary' | 'continue'>('pairing');

const tabs = [
  { id: 'pairing' as const, label: '① 调用和结果要成对' },
  { id: 'boundary' as const, label: '② 截在哪一行' },
  { id: 'continue' as const, label: '③ 丢了怎么补' }
];

const pairingItems = [
  {
    title: '调了工具，就必须有返回',
    body: '模型说「我要 read 某文件」→ 下一条消息一定是这次 read 的返回。不能只有调用、没有结果。'
  },
  {
    title: '压缩对话时，不从返回中间切',
    body: 'context 满了要压缩旧消息时，切点只能落在用户话或模型话上，不会把某次工具返回切成上下两半。'
  },
  {
    title: '一次工具返回是一条完整消息',
    body: 'read/bash/grep 就算内容被截短，也仍算同一条返回；不会拆成两条 tool 消息。'
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

const continuationHints = [
  {
    tool: 'read 续读提示',
    example: '[Showing lines 1-2000 of 8400. Use offset=2001 to continue.]',
    note: '告诉模型下一批从第几行接着读。'
  },
  {
    tool: 'bash 续读提示',
    example: '[Showing lines … of …. Full output: /tmp/pi-bash-xxx.log]',
    note: '全量输出在临时文件里，模型可以 read 那个文件。'
  },
  {
    tool: '窗口压缩摘要',
    example: '## Goal … ## Progress … <read-files>…</read-files>',
    note: '更早的对话合并成摘要，补上被删掉的上下文。'
  }
];
</script>
