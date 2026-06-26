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

    <!-- ① -->
    <div v-if="active === 'pairing'" class="mt-2 space-y-1.5 text-[0.65rem]">
      <div class="rounded-lg border border-[#dbe3f0] bg-white px-2.5 py-2 text-gray-700">
        <strong>不存在"只留调用丢结果"的情况。</strong>
        压缩切点只能落在 user/assistant 消息上，tool_use + tool_result
        整对要么全保留、要么全进摘要。
      </div>
      <div class="rounded-lg border border-[#dbe3f0] bg-white px-2.5 py-2 text-gray-700">
        单条 toolResult 内容可以被截短（如只展示前 2000
        行），但它仍然是一条完整的返回——不会变成半截残缺的消息。模型看到的是"前 2000 行 +
        续读提示"，可以接着读。
      </div>
    </div>

    <!-- ② -->
    <div v-else-if="active === 'boundary'" class="mt-2 space-y-1.5 text-[0.65rem]">
      <div class="rounded-lg border border-[#dbe3f0] bg-white px-2.5 py-2 text-gray-700">
        <strong>按行裁，不按词裁。</strong>丢的是整行/整段，不会出现半个字被劈开。
      </div>
      <div class="overflow-x-auto rounded-lg border border-slate-200">
        <table class="w-full text-left text-[0.6rem]">
          <thead class="bg-slate-100 text-gray-600">
            <tr
              ><th class="px-2 py-1">场景</th><th class="px-2 py-1">半行？</th
              ><th class="px-2 py-1">处理</th></tr
            >
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="row in boundaryRows" :key="row.tool">
              <td class="px-2 py-1 text-slate-800">{{ row.tool }}</td>
              <td class="px-2 py-1" :class="row.partial ? 'text-amber-700' : 'text-emerald-700'">{{
                row.partial ? '极少' : '不会'
              }}</td>
              <td class="px-2 py-1 text-gray-600">{{ row.how }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ③ -->
    <div v-else class="mt-2 space-y-1.5 text-[0.65rem]">
      <div class="rounded-lg border border-[#dbe3f0] bg-white px-2.5 py-2 text-gray-700">
        <strong>工具级：</strong>截断后 toolResult 末尾附带续读提示（行号、文件路径），模型按需再
        read。
      </div>
      <div class="rounded-lg border border-[#dbe3f0] bg-white px-2.5 py-2 text-gray-700">
        <strong>会话级：</strong>更早的对话被压缩成结构化摘要（Goal / Progress /
        Files），模型靠摘要恢复语义。
      </div>
      <div class="rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-gray-500">
        Agent 只提供线索，不会自动补回——由模型决定要不要再查。
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const active = ref<'pairing' | 'boundary' | 'continue'>('pairing');

const tabs = [
  { id: 'pairing' as const, label: '① 放不下结果？' },
  { id: 'boundary' as const, label: '② 截在哪' },
  { id: 'continue' as const, label: '③ 怎么恢复' }
];

const boundaryRows = [
  { tool: 'read', partial: false, how: '整行累加，超 50KB 停' },
  { tool: 'bash', partial: true, how: '保留末尾完整行' },
  { tool: 'grep', partial: true, how: '超 500 字标 [truncated]' }
];
</script>
