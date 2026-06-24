<script setup lang="ts">
import type { Component } from 'vue';

withDefaults(
  defineProps<{
    icon: Component;
    size?: number;
    colorClass?: string;
  }>(),
  {
    size: 20,
    colorClass: 'text-gray-600'
  }
);
</script>

<template>
  <n-icon :size="size" :class="['inline-flex shrink-0', colorClass]">
    <component :is="icon" />
  </n-icon>
</template>
