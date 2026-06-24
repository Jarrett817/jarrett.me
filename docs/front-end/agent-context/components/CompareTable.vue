<template>
  <div class="compare" data-reveal-interactive @click.stop>
    <table>
      <thead>
        <tr>
          <th>维度</th>
          <th>pi-agent</th>
          <th>Claude Code</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in rows"
          :key="row.dim"
          :class="{ highlight: active === row.dim }"
          @click="active = active === row.dim ? '' : row.dim"
        >
          <td class="dim">{{ row.dim }}</td>
          <td>{{ row.pi }}</td>
          <td>{{ row.claude }}</td>
        </tr>
      </tbody>
    </table>
    <p v-if="activeNote" class="note">{{ activeNote }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const active = ref('');

const rows = [
  {
    dim: '读大文件',
    pi: 'offset/limit 分页，默认 2000 行或 50KB',
    claude: '同类分页，默认 2000 行',
    note: '两者都不会一次性读完整大文件，而是分段 + 提示续读'
  },
  {
    dim: '压缩触发',
    pi: 'tokens > window − reserve（reserve 默认 16k）',
    claude: '上下文用到约 80%+ 自动触发',
    note: 'pi-agent 可精确配置阈值；Claude Code 行为类似但阈值不可调'
  },
  {
    dim: '规则持久化',
    pi: '写入摘要的 Goal / Constraints 中',
    claude: 'CLAUDE.md 每轮从磁盘重读',
    note: 'Claude Code 的规则不依赖对话记忆，Compaction 后也不丢。pi-agent 也可通过 Extension 实现类似效果'
  },
  {
    dim: '保留原文',
    pi: 'keepRecentTokens ~20k 可调',
    claude: '少量最近文件可重新挂回',
    note: 'pi-agent 直接保留最近原文；Claude Code 压缩后可有选择地恢复部分文件'
  },
  {
    dim: '摘要结构',
    pi: 'Goal / Progress / Decisions / Next / Files',
    claude: '类似结构（公开资料有限）',
    note: '两者都用结构化摘要保留关键决策，pi-agent 还累积追踪 read/modified files'
  }
];

const activeNote = computed(() => rows.find(r => r.dim === active.value)?.note ?? '');
</script>

<style scoped lang="scss">
.compare {
  margin-top: 10px;
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
}

.dim {
  font-weight: 600;
  color: #3e66ae;
  white-space: nowrap;
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
  padding: 8px 12px;
  border-radius: 6px;
  background: #f8fafc;
  border-left: 3px solid #3e66ae;
  font-size: 0.72rem;
  color: #4b5563;
  line-height: 1.4;
}
</style>
