<template>
  <div class="mt-4 text-left" data-reveal-interactive @click.stop>
    <!-- 分类维度说明 -->
    <p class="text-[0.7rem] text-gray-500 mb-2">
      借用认知科学的分类：按内容性质分为"事实型"和"程序型"，按注入方式分为"自动带入"和"按需检索"。
    </p>

    <!-- 记忆类型列表 -->
    <div class="space-y-1.5">
      <button
        v-for="m in items"
        :key="m.id"
        type="button"
        class="flex w-full items-start gap-2.5 rounded-lg border p-2.5 text-left transition-all"
        :class="active === m.id ? 'border-[#3e66ae] bg-[#eef3fb]' : 'border-gray-200 bg-white'"
        @click="active = m.id"
      >
        <div class="flex shrink-0 flex-col gap-1 mt-0.5">
          <span
            class="rounded px-1.5 py-0.5 text-[0.52rem] font-bold leading-tight"
            :class="
              m.inject === 'auto' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
            "
            >{{ m.inject === 'auto' ? '自动注入' : '按需检索' }}</span
          >
          <span
            class="rounded px-1.5 py-0.5 text-[0.52rem] font-bold leading-tight"
            :class="
              m.kind === 'declarative'
                ? 'bg-gray-100 text-gray-600'
                : 'bg-purple-100 text-purple-700'
            "
            >{{ m.kind === 'declarative' ? '事实型' : '程序型' }}</span
          >
        </div>
        <div class="min-w-0 flex-1">
          <div class="text-[0.72rem] font-semibold text-gray-800">{{ m.label }}</div>
          <div class="mt-0.5 text-[0.62rem] text-gray-500">{{ m.brief }}</div>
        </div>
      </button>
    </div>

    <!-- 展开详情 -->
    <div
      v-if="current"
      class="mt-2 rounded-lg border border-[#dbe3f0] bg-white p-2.5 text-[0.7rem]"
    >
      <p class="leading-snug text-gray-700">{{ current.detail }}</p>
      <div
        v-if="current.example"
        class="mt-1.5 rounded bg-slate-100 px-2 py-1.5 text-[0.62rem] text-gray-600 font-mono"
      >
        {{ current.example }}
      </div>
      <div class="mt-1.5 flex flex-wrap gap-1.5 text-[0.6rem]">
        <span
          v-for="agent in current.agents"
          :key="agent"
          class="rounded bg-gray-100 px-1.5 py-0.5 text-gray-600"
        >
          {{ agent }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

interface MemoryItem {
  id: string;
  label: string;
  brief: string;
  inject: 'auto' | 'on-demand';
  kind: 'declarative' | 'procedural';
  detail: string;
  example?: string;
  agents: string[];
}

const active = ref('rules');

const items: MemoryItem[] = [
  {
    id: 'rules',
    label: '项目规则',
    brief: '人写的持久指令，每轮必带',
    inject: 'auto',
    kind: 'declarative',
    detail:
      '每次调用 LLM 时从磁盘重新读取，拼到模型的"固定指令"区域。因为不存在对话历史里，所以永远不会被压缩或丢弃——是最可靠的持久记忆形式。代价：每轮都重复发送，占用 token 额度。',
    example: '// CLAUDE.md: "使用 TypeScript strict 模式，禁止 any"',
    agents: [
      'Claude Code: CLAUDE.md',
      'Kiro: .kiro/steering/',
      'Cursor: .cursorrules',
      'pi: prompts/'
    ]
  },
  {
    id: 'auto-memory',
    label: '语义记忆（自动笔记）',
    brief: 'Agent 从对话中提炼的事实和偏好',
    inject: 'auto',
    kind: 'declarative',
    detail:
      'Agent 判断"这条信息以后有用"时自主写入。每次新会话开始时自动加载到上下文。有容量上限，超出后触发 consolidation（合并旧条目、去重、消解冲突）。',
    example: 'MEMORY.md: "用户偏好 no-semicolons · 项目用 PostgreSQL 不是 MySQL"',
    agents: ['Claude Code: auto memory', 'pi: hermes-memory MEMORY.md']
  },
  {
    id: 'user-profile',
    label: '用户画像',
    brief: '长期稳定的用户偏好，不会被 consolidation 合并',
    inject: 'auto',
    kind: 'declarative',
    detail:
      '和语义记忆类似但更稳定——存储用户的技术栈、风格偏好、工作习惯等不太会变的信息。通常通过 interview 或多次交互逐步积累。',
    example: 'USER.md: "技术栈: Vue3 + TypeScript · 风格: 函数式优先"',
    agents: ['pi: hermes-memory USER.md', 'Claude Code: 融合在 auto memory']
  },
  {
    id: 'procedural',
    label: '程序性记忆（Skills）',
    brief: 'Agent 沉淀的可复用操作流程',
    inject: 'on-demand',
    kind: 'procedural',
    detail:
      '完成复杂任务后，Agent 判断"这个流程值得记住"时自主创建。存储的是"怎么做"而非"知道什么"——包含步骤、注意事项和验证方法。模型遇到类似场景时通过 tool 读取。',
    example: 'SKILL.md "deploy-to-prod": 步骤 → 检查 → 验证 → 回滚',
    agents: ['pi: hermes-memory skill_manage tool', 'Kiro: specs/tasks（人工维护）']
  },
  {
    id: 'session-history',
    label: '情节记忆（会话历史索引）',
    brief: '过去做过什么——可搜索但不自动加载',
    inject: 'on-demand',
    kind: 'declarative',
    detail:
      '每次会话结束后索引入库。模型需要回忆"上次怎么解决类似问题"时，调用 search tool 按关键词检索。不自动注入——太大了，注入会挤占有用空间。',
    example: 'session_search("部署失败") → "6月12日: nginx 配置缺少 upstream…"',
    agents: ['pi: hermes-memory SQLite FTS5', 'Claude Code: 无公开检索']
  }
];

const current = computed(() => items.find(i => i.id === active.value));
</script>
