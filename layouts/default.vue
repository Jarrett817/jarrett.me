<script setup lang="ts"></script>

<template>
  <article class="default-layout flex flex-col">
    <Header />
    <main flex-1 overflow-hidden class="default-layout__main">
      <slot />
    </main>
  </article>
</template>

<style lang="postcss" scoped>
.default-layout {
  height: 100vh;
  width: 100vw;
}
</style>
