<template>
  <n-button @click="sendRequest">阻止xml请求</n-button>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

let xhr: XMLHttpRequest;
const handler = (e: ProgressEvent<XMLHttpRequestEventTarget>) => {
  alert(e);
  console.log(e);
};
onMounted(() => {
  xhr = new XMLHttpRequest();

  xhr.addEventListener('abort', handler);
  xhr.addEventListener('error', handler);
  xhr.addEventListener('load', handler);
});

onUnmounted(() => {
  xhr.removeEventListener('abort', handler);
  xhr.removeEventListener('error', handler);
  xhr.removeEventListener('load', handler);
});
const sendRequest = () => {
  const method = 'GET',
    url = 'https://test';

  xhr.open(method, url, true);
  xhr.send();
  xhr && xhr.abort();
};
</script>
