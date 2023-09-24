<script setup lang="ts">
import MindElixir from 'mind-elixir'
import { onMounted, ref } from 'vue'

export interface MindMapNode {
  name: string
  topic?: string
  id: string
  routeName?: string
  root?: boolean
  expanded?: boolean
  direction?: 0 | 1
  style?: { fontSize: string; color: string; background: string }
  tags?: string[]
  icons?: string[]
  hyperLink?: string
  children?: MindMapNode[]
}

interface Props {
  data: MindMapNode | null
}

const props = withDefaults(defineProps<Props>(), {
  data: () => null,
})
const emits = defineEmits(['nodeClick'])
const id = 'mindMap'

const isClicked = ref(false)

onMounted(() => {
  if (!props.data)
    return
  const mind = new MindElixir({
    el: `#${id}`,
    direction: MindElixir.RIGHT,
    data: {
      nodeData: props.data,
      linkData: {},
    },
    draggable: false, // default true
    contextMenu: false, // default true
    toolBar: true, // default true
    nodeMenu: false, // default true
    keypress: false, // default true
  })
  mind.bus.addListener('selectNode', (node: MindMapNode) => {
    emits('nodeClick', node)
  })
  mind.init()
})
</script>

<template>
  <div class="relative h-full w-full overflow-auto">
    <div :id="id" class="relative h-full w-full" />
  </div>
</template>

<style lang="postcss">
.map-container .lt {
  width: 40px;
}
</style>
