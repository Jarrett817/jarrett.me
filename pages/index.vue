<script setup lang="ts">
import '@/style/color.css'
</script>

<template>
  <div class="home-page h-full w-full">
    <Suspense>
      <ClientOnly>
        <Home />
      </ClientOnly>
      <template #fallback>
        <div italic op50>
          <span animate-pulse>Loading...</span>
        </div>
      </template>
    </Suspense>
  </div>
</template>
