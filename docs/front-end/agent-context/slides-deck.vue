<script setup lang="ts">
import ContextPainPoints from './components/ContextPainPoints.vue';
import ContextPipeline from './components/ContextPipeline.vue';
import CompactionViz from './components/CompactionViz.vue';
import SummaryStructure from './components/SummaryStructure.vue';
import RuntimeInject from './components/RuntimeInject.vue';
import HooksGrid from './components/HooksGrid.vue';
import CompareTable from './components/CompareTable.vue';
</script>

<template>
  <!-- 封面 -->
  <section>
    <h1>Agent 的上下文管理</h1>
    <blockquote>
      <p><strong>有限窗口 × 无限任务链</strong> · pi-agent 实践</p>
    </blockquote>
  </section>

  <!-- 场景引入 -->
  <section>
    <section>
      <h3>你遇到过这种情况吗？</h3>
      <p class="fragment fade-up" style="font-size: 0.9rem; line-height: 1.6; color: #374151">
        用 Cursor 改代码，第 20 轮你发现——<br />
        它忘了你之前定的接口约束，开始随意命名字段。
      </p>
      <p class="fragment fade-up" style="font-size: 0.9rem; line-height: 1.6; color: #374151">
        用 Claude Code 写组件，明确要求用 ESLint 规范，<br />
        15 轮后它开始加分号了——因为那条规则被压缩掉了。
      </p>
      <div
        class="fragment fade-up"
        style="
          margin-top: 1.2em;
          padding: 12px 16px;
          border-radius: 8px;
          background: #eef3fb;
          font-size: 0.85rem;
        "
      >
        👆 这些都是<strong>上下文管理</strong>的问题。今天聊聊怎么解决。
      </div>
    </section>
  </section>

  <!-- 痛点 + 本质 -->
  <section>
    <section>
      <h3>不管理会怎样？</h3>
      <ContextPainPoints />
    </section>

    <section>
      <h3>本质</h3>
      <div class="fragment fade-up">
        在 <strong>token 预算</strong> 内，保留对<strong>下一步决策</strong>最有用的信息。
      </div>
    </section>
  </section>

  <!-- Pipeline：每轮调用前 -->
  <section>
    <section>
      <h3>送进 LLM 前：两条转换</h3>
      <ContextPipeline />
    </section>

    <section>
      <h3><code>transformContext</code> vs <code>convertToLlm</code></h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px">
        <div
          style="padding: 12px; border-radius: 10px; border: 2px solid #5cb88a; background: #f0fdf4"
        >
          <code style="font-size: 0.8rem">transformContext</code>
          <p style="font-size: 0.72rem; color: #374151; margin-top: 6px">
            像<strong>编辑删稿件</strong>：语义层面选择保留什么
          </p>
          <pre
            style="
              font-size: 0.65rem;
              margin-top: 8px;
              background: #1e293b;
              color: #e2e8f0;
              padding: 8px;
              border-radius: 6px;
            "
          ><code>pruneOldToolResults(msgs, { keepRounds: 3 })</code></pre>
        </div>
        <div
          style="padding: 12px; border-radius: 10px; border: 2px solid #3e66ae; background: #eef3fb"
        >
          <code style="font-size: 0.8rem">convertToLlm</code>
          <p style="font-size: 0.72rem; color: #374151; margin-top: 6px">
            像<strong>排版转印刷格式</strong>：协议对齐，不改内容
          </p>
          <pre
            style="
              font-size: 0.65rem;
              margin-top: 8px;
              background: #1e293b;
              color: #e2e8f0;
              padding: 8px;
              border-radius: 6px;
            "
          ><code>msgs.flatMap(m => m.role === 'notification' ? [] : [m])</code></pre>
        </div>
      </div>
      <div class="fragment fade-up" style="margin-top: 12px; font-size: 0.78rem; color: #6b7280">
        前者<strong>可选</strong>，做语义裁剪；后者<strong>必需</strong>，保证格式合法。配合不替代。
      </div>
    </section>
  </section>

  <!-- 过渡：从 per-call 到累积 -->
  <section>
    <section>
      <h3>对话本身太长了呢？</h3>
      <p class="fragment fade-up" style="font-size: 0.85rem; color: #374151; line-height: 1.6">
        刚才是<strong>每次调用前</strong>的实时裁剪。<br />
        但如果对话已经累积了 80k+ tokens，裁也裁不够——<br />
        需要 <strong>Compaction</strong>：把旧对话折叠成结构化摘要。
      </p>
    </section>

    <section>
      <h3>Compaction：何时触发？</h3>
      <CompactionViz />
    </section>

    <section>
      <h3>摘要长什么样？</h3>
      <SummaryStructure />
      <div class="fragment fade-up">增量更新 · 累积 read / modified files</div>
    </section>

    <section>
      <h3>压缩后模型看到</h3>
      <pre><code>[结构化摘要] + [切点之后的完整原文]</code></pre>
      <div class="fragment fade-up" style="font-size: 0.8rem; color: #374151">
        旧对话折叠成摘要，最近 ~20k tokens 保持完整 tool 链不动。
      </div>
    </section>
  </section>

  <!-- 运行时注入：聚焦主动控制 -->
  <section>
    <section>
      <h3>运行时主动控制</h3>
      <RuntimeInject />
    </section>
  </section>

  <!-- 对比：pi-agent vs Claude Code -->
  <section>
    <section>
      <h3>横向对比：pi-agent vs Claude Code</h3>
      <CompareTable />
    </section>
  </section>

  <!-- 扩展钩子：场景驱动 -->
  <section>
    <h3>扩展钩子</h3>
    <HooksGrid />
  </section>

  <!-- Takeaway：合并为一页 -->
  <section>
    <h3>带走三件事</h3>
    <ol>
      <li class="fragment fade-up">
        <strong>每轮裁</strong>：<code>transformContext</code> 删旧结果 ·
        <code>convertToLlm</code> 对齐协议
      </li>
      <li class="fragment fade-up">
        <strong>累积压</strong>：Compaction 把旧对话折叠成摘要，保留最近原文完整性
      </li>
      <li class="fragment fade-up">
        <strong>主动控</strong>：Steering 改方向 · Follow-up 续任务 · 钩子做领域定制
      </li>
    </ol>
    <div
      class="fragment fade-up"
      style="
        margin-top: 1em;
        padding: 10px 14px;
        border-radius: 8px;
        background: #f1f5f9;
        font-size: 0.78rem;
        color: #374151;
      "
    >
      💡 实践原则：先裁 toolResult 再 Compact · 摘要保 Goal/Decision 少压多 · UI 可视化 token 占比
    </div>
  </section>
</template>
