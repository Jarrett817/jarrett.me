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
    <p class="desc">{{ activeDesc }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const active = ref('transformContext');

const hooks = [
  { name: 'transformContext', desc: 'Agent 配置级：每次调用前裁剪 messages' },
  { name: 'context', desc: 'Extension：LLM 调用前改列表' },
  { name: 'session_before_compact', desc: '自定义 Compaction 摘要策略' },
  { name: 'before_agent_start', desc: '改 systemPrompt / 注入前置消息' }
];

const activeDesc = computed(() => hooks.find(h => h.name === active.value)?.desc ?? '');
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

.desc {
  flex: 1 1 100%;
  margin: 8px 0 0;
  font-size: 0.78rem;
  color: #4b5563;
}
</style>
