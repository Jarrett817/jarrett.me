<script setup lang='ts'>
const authorDetail = {
  name: 'Jarrett',
  socialLinks: [
    { icon: 'i-carbon-logo-github', link: 'https://github.com/Jarrett817/Jarrett.me' },
    {
      icon: 'i-tabler-brand-juejin',
      link: 'https://juejin.cn/user/3940246036687774',
    },
  ],
}
</script>

<template>
  <div flex items-center justify-between px-8 py-4 text="xl slate-700">
    <div flex items-center>
      <NuxtLink i-carbon-campsite m-r-2 to="/" />
      <h1 select-none font-serif italic>
        {{ authorDetail.name }}
      </h1>
    </div>
    <DarkToggle m-r-2 text="gray-4" />
    <div flex="~ gap3" justify-center>
      <a
        v-for="(item, index) in authorDetail.socialLinks"
        :key="index"
        :href="item.link"
        :class="item.icon"
        target="_blank"
      />
    </div>
  </div>
</template>
