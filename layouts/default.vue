<script setup lang="ts">
useBackground()
</script>

<template>
  <article class="default-layout h-full w-full flex">
    <Background />
    <div class="default-layout__sider" fixed left-0 top-0 h-full>
      <Header />
    </div>
    <main flex-1 class="default-layout__main">
      <slot />
    </main>
  </article>
</template>

<style lang="postcss" scoped>
.default-layout {
  --sider-width: 100px;

  &__sider {
    width: var(--sider-width);
  }
  &__main {
    padding-left: var(--sider-width);
  }
}
</style>
