<script setup lang="ts">
import { useData, type DefaultTheme, useRouter } from 'vitepress';
import { MindMapNode } from './mind-map/types';
import MindMap from './mind-map/index.vue';
import { v4 } from 'uuid';
import { base } from '../../shared';

const sidebar = useData().theme.value.sidebar;

const formatData = (data: DefaultTheme.SidebarItem[]): MindMapNode => {
  const root: MindMapNode = {
    id: 'root',
    topic: '知识导图',
    children: []
  };
  root.children = data?.map(({ text, items }) => {
    return {
      topic: text!,
      id: v4(),
      expanded: true,
      children: items?.map(({ text, link }) => ({
        id: v4(),
        topic: text!,
        expanded: true,
        route: base + link
      }))
    };
  });
  return root;
};

const minMapData = { nodeData: formatData(sidebar) };
const router = useRouter();
const handleNodeClick = ({ route }: MindMapNode) => {
  route && router.go(route);
};
</script>

<template>
  <div class="h-90vh">
    <MindMap :data="minMapData" @node-click="handleNodeClick" />
  </div>
</template>

<style lang="scss"></style>
