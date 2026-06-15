<template>
  <div class="knowledge-map relative w-full h-full overflow-hidden">
    <div :id="nodeId" class="w-full h-full relative" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
const emits = defineEmits(['node-click']);
import { type Options, type MindElixirInstance, type MindElixirData } from 'mind-elixir';
import { v4 } from 'uuid';

interface Props {
  data: MindElixirData | null;
  options: Omit<Options, 'el'> | null;
}

const props = withDefaults(defineProps<Props>(), {
  data: null,
  options: null
});

const nodeId = 'el' + v4().replace(/-/g, '');

let mind: MindElixirInstance | null = null;

onMounted(async () => {
  if (!props.data) return;
  const MindElixirModule = await import('mind-elixir');
  const { default: MindElixir } = MindElixirModule;
  const options: Options = {
    el: '#' + nodeId,
    direction: MindElixir.SIDE,
    draggable: true,
    contextMenu: false, // default true
    toolBar: true, // default true
    nodeMenu: false, // default true
    keypress: false, // default true,
    locale: 'zh_CN',
    contextMenuOption: {
      focus: true,
      link: true,
      extend: [
        {
          name: 'Node edit',
          onclick: () => {
            alert('extend menu');
          }
        }
      ]
    }
  };
  mind = new MindElixir(props.options ? Object.assign(options, props.options) : options);
  mind.bus.addListener('selectNode', node => emits('node-click', node));
  mind.init(props.data);
});

onUnmounted(() => {
  mind?.destroy();
});
</script>

<style lang="scss" scoped>
:deep(.map-container .lt) {
  width: 40px;
}
</style>
