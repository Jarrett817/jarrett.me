<template>
  <div class="inject" data-reveal-interactive @click.stop>
    <div class="axis">
      <div
        v-for="item in items"
        :key="item.id"
        class="node"
        :class="{ active: active === item.id }"
        @click="active = item.id"
      >
        <span class="dot" />
        <strong>{{ item.name }}</strong>
        <small>{{ item.when }}</small>
      </div>
    </div>
    <div v-if="currentItem" class="detail-box">
      <p class="scenario">{{ currentItem.scenario }}</p>
      <pre class="code"><code>{{ currentItem.snippet }}</code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const active = ref('steer');

const items = [
  {
    id: 'steer',
    name: 'Steering',
    when: '工具跑完 → 即时插入',
    scenario: '场景：agent 正在写代码，你发现方向错了，想让它停下来换路线',
    snippet: `agent.steer({
  role: "user",
  content: "停！不要用 class 组件，改用 hooks"
})`
  },
  {
    id: 'follow',
    name: 'Follow-up',
    when: 'Agent 将停 → 自动续',
    scenario: '场景：agent 完成主任务后，自动追加验证步骤',
    snippet: `agent.followUp({
  role: "user",
  content: "现在运行 npm test 确认没破坏测试"
})`
  },
  {
    id: 'rules',
    name: '持久规则',
    when: '每轮重读 → 不受压缩影响',
    scenario: '场景：关键约束写入 CLAUDE.md / rules，每轮从磁盘注入，永远不被压缩掉',
    snippet: `// CLAUDE.md 内容每轮从磁盘重新加载注入 system
// 不依赖对话记忆，Compaction 后依然生效
"使用 TypeScript strict 模式，禁止 any"`
  }
];

const currentItem = computed(() => items.find(i => i.id === active.value));
</script>

<style scoped lang="scss">
.inject {
  margin-top: 10px;
}

.axis {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.node {
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s ease;

  &.active {
    border-color: #3e66ae;
    background: #eef3fb;
  }

  strong {
    display: block;
    font-size: 0.85rem;
    color: #1f2937;
  }

  small {
    display: block;
    margin-top: 4px;
    font-size: 0.68rem;
    color: #6b7280;
  }
}

.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #3e66ae;
  margin-bottom: 6px;
}

.detail-box {
  margin-top: 12px;
}

.scenario {
  font-size: 0.75rem;
  color: #4b5563;
  margin: 0 0 8px;
  padding: 6px 10px;
  background: #f8fafc;
  border-radius: 6px;
  border-left: 3px solid #3e66ae;
}

.code {
  margin: 0;
  padding: 10px 12px;
  border-radius: 8px;
  background: #1e293b;
  color: #e2e8f0;
  font-size: 0.68rem;
  text-align: left;
  overflow-x: auto;
  line-height: 1.5;
}
</style>
