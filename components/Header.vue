<script setup lang="ts">
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
  <div
    class="header"
    text="xl slate-700"
    w-full
    flex
    items-center
    justify-between
    px-4
    py-4
  >
    <div flex items-center>
      <NuxtLink i-carbon-campsite m-r-2 to="/" />
      <h1 select-none font-serif italic>
        {{ authorDetail.name }}
      </h1>
    </div>
    <ContentNavigation v-slot="{ navigation }">
      <ul
        flex
        justify-between
        class="menu-list"
      >
        <li
          v-for="link of navigation"
          :key="link._path"
          class="menu-list__item"
          mr-4
          whitespace-nowrap
        >
          <NuxtLink :to="link._path">
            {{ link.title }}
          </NuxtLink>
        </li>
      </ul>
    </ContentNavigation>
    <!-- <DarkToggle m-r-2 text="gray-4" /> -->
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

<style lang="postcss" scoped>
.header {
  /* background-color: var(--blue-atoll); */
  /* color: white; */
  font-size: 14px;
}
.menu-list {
  &__item {
    width: fit-content;
    padding: 4px 8px;
    border-radius: 14px 14px;

    &.--active,
    &:hover {
      background-color: rgba(255, 255, 255, 0.3);
    }
  }
}
</style>
