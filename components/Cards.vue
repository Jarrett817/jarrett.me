<script setup lang="ts">
const colorArray = linearInterpolation(getCssVar('--blue-atoll'), getCssVar('--blue-tiffany'), 10)
const slides = ref(Array.from(colorArray, (item) => {
  return { bg: item, color: 'white' }
}))
</script>

<template>
  <Swiper
    class="swiper-cards"
    :width="400"
    :modules="[SwiperAutoplay, SwiperEffectCards]"
    :slides-per-view="1"
    :loop="true"
    effect="cards"
    :autoplay="{
      delay: 8000,
      disableOnInteraction: true,
    }"
  >
    <SwiperSlide
      v-for="(slide, idx) in slides"
      :key="idx"
      :style="`background-color: ${slide.bg}; color: ${slide.color}`"
    >
      {{ idx }}
    </SwiperSlide>
  </Swiper>
</template>

<style>
.swiper-slide {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  /* height: 20vh; */
  font-size: 4rem;
  font-weight: bold;
  font-family: 'Roboto', sans-serif;
}
.swiper-wrapper {
  min-width: 100vh;
  width: 100vh;
}
.swiper-cards {
  min-height: 600px;
  min-width: 500px;
}
.swiper-cards .swiper-slide {
  border-radius: 6px;
}
</style>
