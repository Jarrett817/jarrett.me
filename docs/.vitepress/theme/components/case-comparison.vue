<template>
  <div class="case-comparison">
    <div class="bad-case">
      <div class="case-header">
        <span class="case-icon">❌</span>
        <span class="case-title">{{ badTitle }}</span>
      </div>
      <div class="case-content">
        <slot name="bad"></slot>
      </div>
    </div>

    <div class="good-case">
      <div class="case-header">
        <span class="case-icon">✅</span>
        <span class="case-title">{{ goodTitle }}</span>
      </div>
      <div class="case-content">
        <slot name="good"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  badTitle: {
    type: String,
    default: 'Bad Case'
  },
  goodTitle: {
    type: String,
    default: 'Good Case'
  }
});
</script>

<style scoped>
.case-comparison {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin: 2rem 0;
}

.bad-case,
.good-case {
  border-radius: 12px;
  padding: 1.5rem;
  position: relative;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.bad-case:hover,
.good-case:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px -3px rgba(0, 0, 0, 0.1);
}

.bad-case {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border: 2px solid #ef4444;
}

.good-case {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  border: 2px solid #22c55e;
}

.case-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
  font-size: 1.1rem;
}

.case-icon {
  font-size: 1.2rem;
}

.case-title {
  color: #374151;
}

.case-content {
  line-height: 1.6;
}

.case-content :deep(p) {
  margin: 0.5rem 0;
}

.case-content :deep(ul),
.case-content :deep(ol) {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.case-content :deep(li) {
  margin: 0.25rem 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .case-comparison {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .bad-case,
  .good-case {
    padding: 1rem;
  }
}
</style>
