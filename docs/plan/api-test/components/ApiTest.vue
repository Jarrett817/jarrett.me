<template>
  <n-space vertical>
    <div class="flex items-center">
      <n-input v-model:value="url" placeholder="输入请求地址" class="flex-1" />
      <n-select v-model:value="requestMethod" :options="options" class="w-20% ml-10px" />
    </div>
    <n-input v-model:value="data" type="textarea" placeholder="输入请求参数" />
    <n-button type="info" @click="fetchData">发送请求</n-button>
    <n-card v-if="response">
      <pre>{{ response }}</pre>
    </n-card>
    <n-card v-if="error">
      <pre>{{ error }}</pre>
    </n-card>
  </n-space>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';

// 定义响应和错误状态
const response = ref('');
const error = ref('');
// 定义输入框绑定的URL变量
const url = ref('/api');
const requestMethod = ref<'post' | 'get'>('get');
const data = ref('{}');

const options = [
  {
    label: 'GET',
    value: 'get'
  },
  {
    label: 'POST',
    value: 'post'
  }
];

const fetchData = async () => {
  try {
    response.value = '';
    error.value = '';
    // 发送GET请求
    const res = await axios({
      method: requestMethod.value,
      url: url.value,
      data: JSON.parse(data.value)
    });
    response.value = JSON.stringify(res.data, null, 2);
  } catch (err: any) {
    console.log(err);
    error.value = err.toString();
  }
};
</script>

<style scoped>
.n-card {
  margin-top: 20px;
  padding: 20px;
}
</style>
