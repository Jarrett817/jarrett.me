<script setup lang="ts">
import { type NodeObj } from 'mind-elixir';
import { v4 } from 'uuid';

const options = { direction: 1 };

const mindMapData: NodeObj = {
  topic: '项目迭代',
  id: v4(),
  expanded: true,
  children: [
    {
      id: v4(),
      topic: '开发前期',
      children: [
        {
          id: v4(),
          topic: '接口文档'
        },
        {
          id: v4(),
          topic: '接口数据mock'
        },
        {
          id: v4(),
          topic: '编译时类型校验'
        },
        {
          id: v4(),
          topic: '运行时接口数据校验'
        }
      ]
    },
    {
      id: v4(),
      topic: '前后端联调',
      children: [
        {
          id: v4(),
          topic: '接口文档改动diff、历史记录'
        },
        {
          id: v4(),
          topic: '接口mock'
        }
      ]
    },
    {
      id: v4(),
      topic: '测试上线',
      children: [
        {
          id: v4(),
          topic: '运行时接口数据校验、日志上报'
        }
      ]
    }
  ]
};
</script>

<template>
  <div class="h-500px">
    <MindMap :data="{ nodeData: mindMapData }" :options="options" />
  </div>
</template>
