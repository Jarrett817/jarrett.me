<template>
  <div class="mt-3 grid grid-cols-2 gap-3 text-left text-[0.78em]">
    <div class="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
      <div class="font-bold text-emerald-700">建议写入</div>
      <ul class="mt-2 space-y-1 text-gray-700">
        <li>用户偏好与习惯</li>
        <li>关键结论与决策</li>
        <li>项目规则 / 外部知识</li>
      </ul>
    </div>
    <div class="rounded-lg border border-gray-200 bg-gray-50 p-3">
      <div class="font-bold text-gray-500">不建议写入</div>
      <ul class="mt-2 space-y-1 text-gray-600">
        <li>中间推理过程</li>
        <li>原始 tool 大输出</li>
        <li>一次性噪声与闲聊</li>
      </ul>
    </div>
  </div>
</template>
