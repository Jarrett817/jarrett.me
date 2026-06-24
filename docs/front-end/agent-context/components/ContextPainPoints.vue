<template>
  <div class="pain-grid" data-reveal-interactive @click.stop>
    <button
      v-for="item in items"
      :key="item.id"
      type="button"
      class="pain-card"
      :class="{ active: active === item.id }"
      @click="active = active === item.id ? '' : item.id"
    >
      <span class="icon">{{ item.icon }}</span>
      <span class="label">{{ item.label }}</span>
      <p v-if="active === item.id" class="detail">{{ item.detail }}</p>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const active = ref('');

const items = [
  { id: 'forget', icon: '🧠', label: '忘约束', detail: '早期 system / 决策被挤出窗口' },
  { id: 'repeat', icon: '🔁', label: '重复读', detail: 'toolResult 堆满，重点被淹没' },
  { id: 'drift', icon: '🎯', label: '摘要走偏', detail: 'Goal / Decision 丢失' },
  { id: 'cost', icon: '💸', label: '成本爆', detail: '每轮全量 tool 输出送模型' }
];
</script>

<style scoped lang="scss">
.pain-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-top: 12px;
}

.pain-card {
  border: 1px solid #dbe3f0;
  border-radius: 10px;
  padding: 12px 8px;
  background: #fff;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s ease;

  &.active {
    border-color: #3e66ae;
    background: #eef3fb;
    box-shadow: 0 4px 12px rgba(62, 102, 174, 0.15);
  }
}

.icon {
  display: block;
  font-size: 1.6rem;
  line-height: 1.2;
}

.label {
  display: block;
  margin-top: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #1f2937;
}

.detail {
  margin: 8px 0 0;
  font-size: 0.72rem;
  color: #4b5563;
  line-height: 1.35;
}
</style>
