<script setup lang="ts">
import Reveal from 'reveal.js'
import Markdown from 'reveal.js/plugin/markdown/markdown.esm.js'
import 'reveal.js/dist/reveal.css'
import 'reveal.js/dist/theme/serif.css'

onMounted(() => {
  const deck = new Reveal({
    plugins: [Markdown],
  })
  deck.initialize()
})
</script>

<template>
  <div class="reveal h-full w-full">
    <div class="slides">
      <section>Slide 1</section>
      <section>Slide 2</section>
    </div>
  </div>
</template>
