<template>
  <div class="mt-3 text-left" data-reveal-interactive @click.stop>
    <div class="flex h-11 overflow-hidden rounded-lg border border-[#dbe3f0]">
      <div
        class="flex min-w-0 items-center justify-center bg-gradient-to-r from-[#6b8fd4] to-[#3e66ae] text-xs font-semibold text-white transition-[width] duration-300"
        :style="{ width: summaryPct + '%' }"
      >
        <span>摘要</span>
      </div>
      <div
        class="flex min-w-0 items-center justify-center bg-gradient-to-r from-[#5cb88a] to-[#2d8a5e] text-xs font-semibold text-white transition-[width] duration-300"
        :style="{ width: recentPct + '%' }"
      >
        <span>原文</span>
      </div>
      <div
        class="flex min-w-0 items-center justify-center bg-gradient-to-r from-[#f0b429] to-[#e08b12] text-xs font-semibold text-gray-800 transition-[width] duration-300"
        :style="{ width: reservePct + '%' }"
      >
        <span>预留</span>
      </div>
    </div>
    <label class="mt-3 flex items-center gap-3 text-[0.8rem] text-gray-700">
      <span>keepRecent ≈ {{ keep }}k</span>
      <input
        v-model.number="keep"
        type="range"
        min="10"
        max="40"
        step="2"
        class="min-w-0 flex-1 accent-[#3e66ae]"
      />
    </label>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const keep = ref(20);
const windowK = 128;
const reserveK = 16;

const summaryPct = computed(() =>
  Math.max(8, ((windowK - keep.value - reserveK) / windowK) * 100)
);
const recentPct = computed(() => (keep.value / windowK) * 100);
const reservePct = computed(() => (reserveK / windowK) * 100);
</script>
