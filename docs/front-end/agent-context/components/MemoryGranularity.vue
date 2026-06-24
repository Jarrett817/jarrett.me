<template>
  <div class="mt-3 space-y-2 text-left text-[0.78em]">
    <div class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700">
      <span class="font-semibold text-gray-800">粒度过细</span>
      — 单条偏好拆成多条存储，检索时易部分命中，信息不完整。
    </div>
    <div class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700">
      <span class="font-semibold text-gray-800">粒度过粗</span>
      — 整段任务历史单条存储，检索命中后无关内容占比高。
    </div>
    <p class="text-[0.85em] text-gray-600">
      推荐粒度：<strong>一次完整交互</strong> 或 <strong>一条独立知识点</strong>。
    </p>
  </div>
</template>
