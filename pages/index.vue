<script setup lang="ts">
const online = useOnline()
</script>

<template>
  <div class="h-full w-full">
    <Suspense>
      <ClientOnly>
        <Welcome v-if="online" />
        <div v-else text-gray:80>
          You're offline
        </div>
      </ClientOnly>
      <template #fallback>
        <div italic op50>
          <span animate-pulse>Loading...</span>
        </div>
      </template>
    </Suspense>
  </div>
</template>
