<template>
  <div class="compare" data-reveal-interactive @click.stop>
    <p class="intro">
      同一个设计问题，不同 Agent 做了不同选择。没有绝对优劣——取决于场景和 trade-off。
    </p>
    <table>
      <thead>
        <tr>
          <th>设计决策</th>
          <th>各家怎么做</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in rows"
          :key="row.decision"
          :class="{ highlight: active === row.decision }"
          @click="active = active === row.decision ? '' : row.decision"
        >
          <td class="dim">{{ row.decision }}</td>
          <td class="agents">
            <div v-for="a in row.agents" :key="a.name" class="agent-row">
              <span class="agent-name">{{ a.name }}</span>
              <span class="agent-approach">{{ a.approach }}</span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="activeRow" class="note"> <strong>设计哲学：</strong>{{ activeRow.philosophy }} </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

interface AgentApproach {
  name: string;
  approach: string;
}

interface DecisionRow {
  decision: string;
  agents: AgentApproach[];
  philosophy: string;
}

const active = ref('');

const rows: DecisionRow[] = [
  {
    decision: '大文件怎么读',
    agents: [
      { name: 'pi', approach: 'offset/limit 分页，2000 行/50KB 硬上限' },
      { name: 'Claude Code', approach: '类似分页，默认 2000 行' },
      { name: 'Kiro', approach: '委派 sub-agent 在独立窗口读，主上下文只收结论' },
      { name: 'Cursor', approach: '语义索引 + 按需读取相关片段' }
    ],
    philosophy:
      '核心 trade-off：完整性 vs 上下文占用。分页保留原文但多轮；sub-agent 省主窗口但丢失细节控制；索引最省但依赖预处理。'
  },
  {
    decision: '压缩何时触发',
    agents: [
      { name: 'pi', approach: 'token > window − reserve（可配）' },
      { name: 'Claude Code', approach: '约 80% 窗口自动触发' },
      { name: 'Cursor', approach: '按轮次裁剪 + 摘要' },
      { name: 'OpenHands', approach: '固定保留最近 N 条，更早丢弃或摘要' }
    ],
    philosophy:
      '越早压缩 → 信息丢失越多但成本可控；越晚压缩 → 保真度高但一旦触发压缩量大。自动阈值 vs 手动控制也是一种选择。'
  },
  {
    decision: '规则怎么持久化',
    agents: [
      { name: 'Claude Code', approach: 'CLAUDE.md 每轮从磁盘注入 system prompt' },
      { name: 'Kiro', approach: 'steering files (.kiro/steering/) 按条件自动加载' },
      { name: 'pi', approach: '通过 Extension 或写入摘要的 Goal/Constraints' },
      { name: 'Cursor', approach: '.cursorrules 文件注入 system prompt' }
    ],
    philosophy:
      '关键约束绝不能只存在对话里（会被压缩掉）。磁盘文件每轮重读是最可靠的方式——不依赖对话记忆。'
  },
  {
    decision: '压缩后保留什么',
    agents: [
      { name: 'pi', approach: '结构化摘要（Goal/Progress/Files）+ 最近 ~20k 原文' },
      { name: 'Claude Code', approach: '摘要 + CLAUDE.md 磁盘重注入' },
      { name: 'Kiro', approach: '压缩摘要 + 自动 compaction 后继续' },
      { name: 'OpenHands', approach: '最近消息原文 + 关键事件日志' }
    ],
    philosophy:
      '摘要的结构化程度决定恢复质量。越结构化（Goal/Decision/Files）→ 恢复越准但实现越重；纯文本摘要简单但容易漂移。'
  },
  {
    decision: '跨会话怎么记',
    agents: [
      { name: 'Claude Code', approach: 'auto memory + CLAUDE.md（Agent 自动写笔记）' },
      { name: 'Kiro', approach: 'specs + steering files（结构化项目知识）' },
      { name: 'pi', approach: 'session JSONL + Extension 状态存储' },
      { name: 'Cursor', approach: '项目索引 + .cursorrules' }
    ],
    philosophy:
      '跨会话记忆的关键是 "什么值得记"。太多噪声 → 检索命中率下降；太少 → 每次重新理解项目。大多数 agent 选择让规则由人写、笔记由 agent 写。'
  }
];

const activeRow = computed(() => rows.find(r => r.decision === active.value));
</script>

<style scoped lang="scss">
.compare {
  margin-top: 10px;
}

.intro {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0 0 10px;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.72rem;
}

th {
  background: #f1f5f9;
  padding: 8px 10px;
  text-align: left;
  font-weight: 700;
  color: #1f2937;
  border-bottom: 2px solid #dbe3f0;
}

td {
  padding: 8px 10px;
  border-bottom: 1px solid #e5e7eb;
  color: #374151;
  line-height: 1.4;
  vertical-align: top;
}

.dim {
  font-weight: 600;
  color: #3e66ae;
  white-space: nowrap;
  width: 120px;
}

.agents {
  padding: 6px 10px;
}

.agent-row {
  display: flex;
  gap: 6px;
  align-items: baseline;
  padding: 2px 0;
}

.agent-name {
  shrink: 0;
  font-size: 0.62rem;
  font-weight: 600;
  color: #6b7280;
  min-width: 70px;
}

.agent-approach {
  font-size: 0.65rem;
  color: #374151;
}

tr {
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: #fafbfc;
  }

  &.highlight {
    background: #eef3fb;
  }
}

.note {
  margin: 10px 0 0;
  padding: 10px 12px;
  border-radius: 6px;
  background: #f8fafc;
  border-left: 3px solid #3e66ae;
  font-size: 0.72rem;
  color: #4b5563;
  line-height: 1.5;
}
</style>
