<template>
  <div class="inject" data-reveal-interactive @click.stop>
    <div class="axis">
      <div
        v-for="item in items"
        :key="item.id"
        class="node"
        :class="{ active: active === item.id }"
        @click="active = item.id"
      >
        <span class="dot" />
        <strong>{{ item.name }}</strong>
        <small>{{ item.when }}</small>
      </div>
    </div>
    <pre v-if="snippet" class="code"><code>{{ snippet }}</code></pre>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const active = ref('steer');

const items = [
  { id: 'steer', name: 'Steering', when: '工具跑完 → 注入', snippet: 'agent.steer({ role: "user", content: "…" })' },
  { id: 'follow', name: 'Follow-up', when: 'Agent 将停 → 排队', snippet: 'agent.followUp({ role: "user", content: "…" })' },
  { id: 'compact', name: 'Compaction', when: '窗口将满 → 摘要', snippet: 'summary + firstKept 之后原文' }
];

const snippet = computed(() => items.find(i => i.id === active.value)?.snippet ?? '');
</script>

<style scoped lang="scss">
.inject {
  margin-top: 10px;
}

.axis {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.node {
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s ease;

  &.active {
    border-color: #3e66ae;
    background: #eef3fb;
  }

  strong {
    display: block;
    font-size: 0.85rem;
    color: #1f2937;
  }

  small {
    display: block;
    margin-top: 4px;
    font-size: 0.68rem;
    color: #6b7280;
  }
}

.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #3e66ae;
  margin-bottom: 6px;
}

.code {
  margin: 12px 0 0;
  padding: 10px 12px;
  border-radius: 8px;
  background: #1e293b;
  color: #e2e8f0;
  font-size: 0.72rem;
  text-align: left;
  overflow-x: auto;
}
</style>
