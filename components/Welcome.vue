<script setup lang="ts">
import Reveal from 'reveal.js'

// import Markdown from 'reveal.js/plugin/markdown/markdown.esm.js'

import 'reveal.js/dist/reveal.css'

// import 'reveal.js/dist/theme/serif.css'
const MainReveal = ref(null)

onMounted(() => {
  const deck = new Reveal(MainReveal.value, {
    // plugins: [Markdown],
    progress: false,
    backgroundTransition: 'convex',
    navigationMode: 'default',
    touch: true,
    controlsLayout: 'bottom-right',
    mouseWheel: true,
    controlsTutorial: true,
    overview: false,
    margin: 0.01,
  })
  deck.initialize()
})
</script>

<template>
  <div class="h-full w-full flex flex-col">
    <Header />
    <div ref="MainReveal" class="reveal flex:1">
      <div class="slides">
        <section>
          <section class="h-full">
            <div class="flex">
              <Cards class="flex-1" />
            </div>
          </section>
          <section class="h-full">
            <TimeTree class="w-1/2" />
            Horizontal Slide1
          </section>
          <section class="h-full">
            Horizontal Slide2
          </section>
        </section>
      </div>
    </div>
    <Footer />
  </div>
</template>
