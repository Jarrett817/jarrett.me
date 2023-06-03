<script setup lang="ts">
const color = useColorMode()

const themes = [
  { theme: 'light', icon: 'i-carbon-sun' },
  { theme: 'dark', icon: 'i-carbon-moon' },
  { theme: 'sepia', icon: 'i-carbon-idea' },
  { theme: 'system', icon: 'i-carbon-laptop' },
]

const index = ref(themes.findIndex(({ theme }) => theme === color.preference))

useHead({
  meta: [{
    id: 'theme-color',
    name: 'theme-color',
    content: () => color.value === 'dark' ? '#222222' : '#ffffff',
  }],
})

function changeTheme() {
  index.value = index.value >= themes.length - 1 ? 0 : index.value + 1
  color.preference = themes[index.value].theme
}
</script>

<template>
  <button class="!outline-none" @click="changeTheme">
    <ClientOnly>
      <div :class="[themes[index].icon]" />
    </ClientOnly>
  </button>
</template>
