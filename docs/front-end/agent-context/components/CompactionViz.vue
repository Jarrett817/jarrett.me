<template>
  <div class="compaction" data-reveal-interactive @click.stop>
    <div class="bar">
      <div class="zone summary" :style="{ width: summaryPct + '%' }">
        <span>摘要</span>
      </div>
      <div class="zone recent" :style="{ width: recentPct + '%' }">
        <span>原文</span>
      </div>
      <div class="zone reserve" :style="{ width: reservePct + '%' }">
        <span>预留</span>
      </div>
    </div>
    <label class="slider-row">
      <span>keepRecent ≈ {{ keep }}k tokens</span>
      <input v-model.number="keep" type="range" min="8" max="32" step="2" />
    </label>
    <p class="trigger">触发：tokens &gt; window − reserve（默认 reserve ≈ 16k）</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const keep = ref(20);
const windowK = 128;
const reserveK = 16;

const summaryPct = computed(() => Math.max(8, ((windowK - keep.value - reserveK) / windowK) * 100));
const recentPct = computed(() => (keep.value / windowK) * 100);
const reservePct = computed(() => (reserveK / windowK) * 100);
</script>

<style scoped lang="scss">
.compaction {
  margin-top: 10px;
}

.bar {
  display: flex;
  height: 44px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #dbe3f0;
}

.zone {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: #fff;
  transition: width 0.25s ease;
  min-width: 0;
}

.summary {
  background: linear-gradient(90deg, #6b8fd4, #3e66ae);
}

.recent {
  background: linear-gradient(90deg, #5cb88a, #2d8a5e);
}

.reserve {
  background: linear-gradient(90deg, #f0b429, #e08b12);
  color: #1f2937;
}

.slider-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  font-size: 0.8rem;
  color: #374151;

  input {
    flex: 1;
    accent-color: #3e66ae;
  }
}

.trigger {
  margin: 8px 0 0;
  font-size: 0.72rem;
  color: #6b7280;
}
</style>
