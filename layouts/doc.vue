<template>
  <main class="h-screen w-screen flex flex-col">
    <Plum />
    <Header />
    <div class="flex-1 overflow-auto">
      <slot />
    </div>
  </main>
</template>
