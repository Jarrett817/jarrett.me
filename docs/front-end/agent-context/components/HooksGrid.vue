<template>
  <div class="hooks" data-reveal-interactive @click.stop>
    <button
      v-for="hook in hooks"
      :key="hook.name"
      type="button"
      class="hook"
      :class="{ on: active === hook.name }"
      @click="active = hook.name"
    >
      <code>{{ hook.name }}</code>
    </button>
    <div v-if="activeHook" class="detail">
      <p class="desc">{{ activeHook.desc }}</p>
      <p class="scenario">💡 {{ activeHook.scenario }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const active = ref('transformContext');

const hooks = [
  {
    name: 'transformContext',
    desc: 'Agent 配置级：每次 LLM 调用前裁剪 messages',
    scenario: '删 3 轮前的 toolResult 大输出，省 token 又不影响最近推理'
  },
  {
    name: 'context',
    desc: 'Extension 事件：LLM 调用前修改消息列表',
    scenario: '注入 RAG 检索到的文档片段，让 agent 回答时引用最新资料'
  },
  {
    name: 'session_before_compact',
    desc: '自定义 Compaction 摘要策略',
    scenario: '保留用户原始创意输入完整内容，只压缩 agent 的中间推理过程'
  },
  {
    name: 'before_agent_start',
    desc: '改 systemPrompt / 注入前置消息',
    scenario: '根据意图分类动态切换 system prompt：代码任务 vs 文案任务用不同指令集'
  }
];

const activeHook = computed(() => hooks.find(h => h.name === active.value));
</script>

<style scoped lang="scss">
.hooks {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.hook {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #dbe3f0;
  background: #fff;
  cursor: pointer;

  &.on {
    border-color: #3e66ae;
    background: #eef3fb;
  }

  code {
    font-size: 0.72rem;
    color: #3e66ae;
  }
}

.detail {
  flex: 1 1 100%;
  margin: 10px 0 0;
}

.desc {
  font-size: 0.78rem;
  color: #4b5563;
  margin: 0 0 6px;
}

.scenario {
  font-size: 0.72rem;
  color: #1f2937;
  margin: 0;
  padding: 8px 10px;
  background: #f0fdf4;
  border-radius: 6px;
  border-left: 3px solid #5cb88a;
}
</style>
