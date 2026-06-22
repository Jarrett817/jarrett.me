<template>
  <div class="pipeline" data-reveal-interactive @click.stop>
    <button
      v-for="(step, i) in steps"
      :key="step.id"
      type="button"
      class="step"
      :class="{ on: active === step.id }"
      @click="active = step.id"
    >
      <span class="idx">{{ i + 1 }}</span>
      <code>{{ step.code }}</code>
      <span class="tag">{{ step.tag }}</span>
    </button>
    <p class="hint">{{ currentHint }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const active = ref('transform');

const steps = [
  {
    id: 'messages',
    code: 'AgentMessage[]',
    tag: '内部态',
    hint: '可含 UI 消息、扩展类型、完整 tool 链'
  },
  {
    id: 'transform',
    code: 'transformContext()',
    tag: '可选',
    hint: '结构裁剪：删旧 toolResult、注入 RAG / 记忆'
  },
  {
    id: 'convert',
    code: 'convertToLlm()',
    tag: '必需',
    hint: '过滤非 LLM 消息，对齐 user / assistant / toolResult'
  },
  {
    id: 'llm',
    code: 'LLM',
    tag: '调用',
    hint: '模型只看到协议允许的消息子集'
  }
];

const currentHint = computed(() => steps.find(s => s.id === active.value)?.hint ?? '');
</script>

<style scoped lang="scss">
.pipeline {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  gap: 8px;
  margin-top: 10px;
}

.step {
  flex: 1 1 140px;
  min-width: 120px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px;
  background: #fafbfc;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;

  &.on {
    border-color: #3e66ae;
    background: #eef3fb;
  }

  code {
    display: block;
    font-size: 0.78rem;
    color: #1e293b;
    margin: 4px 0;
  }
}

.idx {
  display: inline-flex;
  width: 20px;
  height: 20px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #3e66ae;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
}

.tag {
  font-size: 0.68rem;
  color: #6b7280;
}

.hint {
  flex: 1 1 100%;
  margin: 6px 0 0;
  padding: 8px 12px;
  border-radius: 8px;
  background: #f1f5f9;
  font-size: 0.8rem;
  color: #374151;
}
</style>
