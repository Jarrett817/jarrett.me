<script setup lang="ts">
import { type MindElixirData, type NodeObj } from 'mind-elixir';
import { v4 } from 'uuid';

const nodeData: NodeObj = {
  topic: '项目应用',
  id: v4(),
  expanded: true,
  children: [
    {
      id: v4(),
      topic: 'base-service',
      children: [
        {
          id: v4(),
          topic: 'types类型文件'
        },
        {
          id: v4(),
          topic: 'request文件，基础请求方法、拦截器',
          tags: ['接收业务传入的zod schema']
        },
        {
          id: v4(),
          topic: 'validator文件，导出集成了纠错、错误上报能力的校验器'
        }
      ]
    },
    {
      id: v4(),
      topic: '业务-service',
      children: [
        {
          id: v4(),
          topic: 'validator文件，zod编写schema'
        },
        {
          id: v4(),
          topic: 'types文件，业务数据类型声明',
          tags: ['引入validator schema，生成的静态类型']
        },
        {
          id: v4(),
          topic: 'api文件，业务接口继承、组合base方法',
          tags: ['给base request方法传递schema']
        }
      ]
    },
    {
      id: v4(),
      topic: '业务调用'
    }
  ]
};
const mindMapData: MindElixirData = {
  nodeData,
  arrows: [
    {
      id: v4(),
      label: '导入request方法',
      from: nodeData!.children![0].id,
      to: nodeData!.children![1].id,
      delta1: {
        x: 0,
        y: 57
      },
      delta2: {
        x: 0,
        y: -57
      }
    },
    {
      id: v4(),
      label: '导入使用api、types',
      from: nodeData!.children![1].id,
      to: nodeData!.children![2].id,
      delta1: {
        x: 0,
        y: 57
      },
      delta2: {
        x: 0,
        y: -57
      }
    }
  ]
};
</script>

<template>
  <div class="h-500px">
    <MindMap :data="mindMapData" :options="{ direction: 1 }" />
  </div>
</template>
