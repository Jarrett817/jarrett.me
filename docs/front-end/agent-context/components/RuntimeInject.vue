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
      <CodeBlock :code="currentItem.snippet" />
      <p v-if="currentItem.source" class="source">
        <code>{{ currentItem.source }}</code>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import CodeBlock from './CodeBlock.vue';

interface InjectItem {
  id: string;
  name: string;
  when: string;
  scenario: string;
  snippet: string;
  source?: string;
}

const active = ref('steer');

const items: InjectItem[] = [
  {
    id: 'steer',
    name: 'Steering',
    when: '工具跑完 → 即时插入',
    scenario:
      '场景：agent 正在写代码，你发现方向错了，想让它停下来换路线。消息注入后立刻参与下一轮 LLM 调用。',
    snippet: `// AgentLoopConfig.getSteeringMessages
// 每轮 turn_end 后、下次 LLM 调用前被调用
getSteeringMessages: async () => {
  const pending = steeringQueue.drain();
  // 返回 [] 表示无干预；返回消息则注入 context
  return pending;
}`,
    source: '@earendil-works/pi-agent-core · AgentLoopConfig'
  },
  {
    id: 'follow',
    name: 'Follow-up',
    when: 'Agent 将停 → 自动续',
    scenario:
      '场景：agent 完成主任务后，自动追加验证步骤（如跑测试）。仅在 steering 无消息且 agent 即将停止时触发。',
    snippet: `// AgentLoopConfig.getFollowUpMessages
// 当 agent 无更多 tool 调用、无 steering 时调用
getFollowUpMessages: async () => {
  if (followUpQueue.length === 0) return [];
  // 消息加入 context，agent 继续一轮
  return [followUpQueue.shift()!];
}`,
    source: '@earendil-works/pi-agent-core · AgentLoopConfig'
  },
  {
    id: 'rules',
    name: '持久规则',
    when: '每轮重读 → 不受压缩影响',
    scenario:
      '场景：关键约束写入项目规则文件，每轮从磁盘拼入 systemPrompt，永远不会被 Compaction 压掉。',
    snippet: `// 构建 system prompt 时从磁盘加载规则
// buildSystemPrompt 每轮执行，不依赖对话记忆
systemPrompt = [
  toolDefinitions,
  behaviorGuidelines,
  ...loadProjectRules(cwd), // 每轮重读
].join("\\n");`,
    source: '@earendil-works/pi-coding-agent · system-prompt.ts'
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

.source {
  margin: 6px 0 0;
  font-size: 0.62rem;
  color: #9ca3af;
}
</style>
