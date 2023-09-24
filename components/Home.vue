<script setup lang="ts">
import AOS from 'aos'
import 'aos/dist/aos.css'

useDotMatrix('#dot-matrix')

// import Markdown from 'reveal.js/plugin/markdown/markdown.esm.js'

// import 'reveal.js/dist/reveal.css'

AOS.init({
  // Global settings:
  disable: false, // accepts following values: 'phone', 'tablet', 'mobile', boolean, expression or function
  startEvent: 'DOMContentLoaded', // name of the event dispatched on the document, that AOS should initialize on
  initClassName: 'aos-init', // class applied after initialization
  animatedClassName: 'aos-animate', // class applied on animation
  useClassNames: false, // if true, will add content of `data-aos` as classes on scroll
  disableMutationObserver: false, // disables automatic mutations' detections (advanced)
  debounceDelay: 100, // the delay on debounce used while resizing window (advanced)
  throttleDelay: 99, // the delay on throttle used while scrolling the page (advanced)

  // Settings that can be overridden on per-element basis, by `data-aos-*` attributes:
  offset: 120, // offset (in px) from the original trigger point
  delay: 0, // values from 0 to 3000, with step 50ms
  duration: 400, // values from 0 to 3000, with step 50ms
  easing: 'ease', // default easing for AOS animations
  once: false, // whether animation should happen only once - while scrolling down
  mirror: false, // whether elements should animate out while scrolling past them
  anchorPlacement: 'top-bottom', // defines which position of the element regarding to window should trigger the animation
})

// import 'reveal.js/dist/theme/serif.css'

// onMounted(() => {
//   const deck = new Reveal(MainReveal.value, {
//     // plugins: [Markdown],
//     progress: false,
//     backgroundTransition: 'convex',
//     navigationMode: 'default',
//     touch: true,
//     controlsLayout: 'bottom-right',
//     mouseWheel: true,
//     controlsTutorial: true,
//     overview: false,
//     margin: 0.01,
//   })
//   deck.initialize()
// })
</script>

<template>
  <div class="home-page">
    <div class="home-page__content">
      <h1 class="home-page__title" font-serif>
        Jarrett's
      </h1>
      <h1 class="home-page__title" font-serif>
        Blog
      </h1>
      <!-- <NuxtImg src="/assets/images/building.jpeg" class="home-page__pic">
        <div id="dot-matrix" class="home-page__pic-dot" />
      </NuxtImg> -->
      <div class="copyright flex prose">
        <p class="w-full text-center text-sm op50">
          Released under the MIT License.
          <br>
          MIT Licensed | Copyright © 2021-present Jarrett Wang
        </p>
      </div>

      <!-- <section> -->
      <!-- <section class="h-screen"> -->
      <!-- </section> -->
      <!-- <section class="h-4/5 flex" data-aos="fade-up" data-aos-once="false">
      <Cards class="flex-1" />
    </section>
    <section class="h-4/5" data-aos="fade-in" data-aos-once="false">
      <TimeTree class="w-1/2" />
    </section> -->
      <!-- </section> -->
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.home-page {
  --bg-color: rgb(194, 225, 247);

  height: 100%;
  padding: 0 24px 24px 24px;

  &__title {
    font-size: 48px;
    position: absolute;

    &:first-child {
      top: 50%;
      left: 10%;
      transform: translate(-30%, -120%);
    }

    &:last-of-type {
      top: 50%;
      left: calc(10% + 100px);
      transform: translate(0, -50%);
    }
  }

  &__content {
    position: relative;
    border-radius: 12px;
    height: 100%;
    width: 100%;
    background: var(--bg-color);
    background: linear-gradient(0deg, rgba(246, 247, 247, 1) 50%, var(--bg-color) 50%);

    .copyright {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translate(-50%);
    }

    &::before {
      content: "";
      width: 60vh;
      height: 30vh;
      display: block;
      position: absolute;
      top: 50%;
      right: 10vw;
      transform: translate(0, -100%);
      box-shadow: -1px 3px 15px #b0b0b0;
    }
  }

  &__pic {
    width: 60vh;
    height: 60vh;
    position: absolute;
    top: 50%;
    right: 10vw;
    transform: translate(0, -50%);
    background-color: var(--bg-color);
    z-index: 1;

    &-dot {
      position: absolute;
      right: 0;
      top: 0;
      transform: translate(50%, -50%);
    }
  }
}
</style>
