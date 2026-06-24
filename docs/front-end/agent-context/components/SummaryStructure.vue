<template>
  <div class="summary-blocks" data-reveal-interactive @click.stop>
    <button
      v-for="block in blocks"
      :key="block.id"
      type="button"
      class="block"
      :class="{ on: picked.has(block.id) }"
      @click="toggle(block.id)"
    >
      {{ block.label }}
    </button>
    <p class="note">
      {{ picked.size ? '已选：' + [...picked].join(' · ') : '点击块查看 Compaction 摘要结构' }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const picked = ref(new Set<string>());

const blocks = [
  { id: 'Goal', label: 'Goal' },
  { id: 'Progress', label: 'Progress' },
  { id: 'Decisions', label: 'Key Decisions' },
  { id: 'Next', label: 'Next Steps' },
  { id: 'Files', label: 'read / modified files' }
];

const toggle = (id: string) => {
  const next = new Set(picked.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  picked.value = next;
};
</script>

<style scoped lang="scss">
.summary-blocks {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.block {
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid #c7d4ea;
  background: #f8fafc;
  font-size: 0.78rem;
  font-weight: 600;
  color: #3e66ae;
  cursor: pointer;
  transition: all 0.15s ease;

  &.on {
    background: #3e66ae;
    color: #fff;
    border-color: #3e66ae;
  }
}

.note {
  flex: 1 1 100%;
  margin: 8px 0 0;
  font-size: 0.75rem;
  color: #6b7280;
}
</style>
