<script setup lang="ts">
</script>

<template>
  <article class="h-full overflow-auto">
    <ContentList v-slot="{ list }" path="/">
      <div v-for="article in list" :key="article._path">
        <h2>{{ article.title }}</h2>
        <p>{{ article.description }}</p>
        {{ console.log(list) }}
      </div>
    </ContentList>
    <ClientOnly>
      <MindMap />
    </ClientOnly>
    <!-- <ContentDoc class="mx-auto my-0 w-3/5" /> -->
  </article>
</template>
