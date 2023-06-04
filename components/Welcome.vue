<script setup lang="ts">
import Reveal from 'reveal.js'
import Markdown from 'reveal.js/plugin/markdown/markdown.esm.js'
import 'reveal.js/dist/reveal.css'
import 'reveal.js/dist/theme/serif.css'

onMounted(() => {
  const deck = new Reveal({
    plugins: [Markdown],
    progress: false,
    backgroundTransition: 'convex',
    navigationMode: 'default',
    touch: true,
    controlsLayout: 'bottom-right',
    mouseWheel: true,
  })
  deck.initialize()
})
</script>

<template>
  <!-- <div class="reveal h-full w-full">
    <div class="slides">
      <section>
        Slide 1
      </section>
      <section>Slide 2</section>
      <section>Horizontal Slide</section>
      <section>
        <section>Vertical Slide 1</section>
        <section>Vertical Slide 2</section>
      </section>
    </div>
  </div> -->

  <Swiper
    :modules="[SwiperAutoplay, SwiperEffectCreative]"
    :slides-per-view="1"
    :loop="true"
    effect="creative"
    :autoplay="{
      delay: 8000,
      disableOnInteraction: true,
    }"
    :creative-effect="{
      prev: {
        shadow: false,
        translate: ['-20%', 0, -1],
      },
      next: {
        translate: ['100%', 0, 0],
      },
    }"
  >
    <SwiperSlide v-for="slide in 10" :key="slide">
      <strong>{{ slide }}</strong>
    </SwiperSlide>
  </Swiper>
</template>
