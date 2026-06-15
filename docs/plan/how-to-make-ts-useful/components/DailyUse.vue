<script setup lang="ts">
import { type MindElixirData, type NodeObj } from 'mind-elixir';
import { v4 } from 'uuid';

const model: NodeObj = {
  id: v4(),
  topic: '业务-service',
  children: [
    {
      id: v4(),
      topic: 'types文件，业务数据类型声明'
    },
    {
      id: v4(),
      topic: 'api文件，业务接口继承、组合base方法'
    }
  ]
};

const base: NodeObj = {
  id: v4(),
  topic: 'base-service',
  children: [
    {
      id: v4(),
      topic: 'types类型文件'
    },
    {
      id: v4(),
      topic: 'api文件，基础请求方法、拦截器'
    }
  ]
};

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
          topic: 'request文件，基础请求方法、拦截器'
        }
      ]
    },
    {
      id: v4(),
      topic: '业务-service',
      children: [
        {
          id: v4(),
          topic: 'types文件，业务数据类型声明'
        },
        {
          id: v4(),
          topic: 'api文件，业务接口继承、组合base方法'
        }
      ]
    },
    {
      id: v4(),
      topic: '业务调用',
      parent: base
    }
  ]
};

const mindMapData: MindElixirData = {
  nodeData,
  arrows: [
    {
      id: v4(),
      label: '导入request方法',
      from: nodeData.children![0].id,
      to: nodeData.children![1].id,
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
      from: nodeData.children![1].id,
      to: nodeData.children![2].id,
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
