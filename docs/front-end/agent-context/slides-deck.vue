<script setup lang="ts">
import ContextPainPoints from './components/ContextPainPoints.vue';
import ContextPipeline from './components/ContextPipeline.vue';
import CompactionViz from './components/CompactionViz.vue';
import SummaryStructure from './components/SummaryStructure.vue';
import RuntimeInject from './components/RuntimeInject.vue';
import HooksGrid from './components/HooksGrid.vue';
</script>

<template>
  <section>
    <h1>Agent 的上下文管理</h1>
    <blockquote>
      <p><strong>有限窗口 × 无限任务链</strong> · pi-agent 实践</p>
    </blockquote>
  </section>

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

  <section>
    <section>
      <h3>送进 LLM 前：两条转换</h3>
      <ContextPipeline />
    </section>

    <section>
      <h3>最小代码：<code>convertToLlm</code></h3>
      <pre><code class="language-ts">convertToLlm: (msgs) =&gt; msgs.flatMap(m =&gt;
  m.role === 'notification' ? [] : [m]
)</code></pre>
      <div class="fragment fade-up"><strong>UI 消息不进模型。</strong></div>
    </section>

    <section>
      <h3>最小代码：<code>transformContext</code></h3>
      <pre><code class="language-ts">transformContext: async (msgs) =&gt;
  pruneOldToolResults(msgs, { keepRounds: 3 })</code></pre>
      <div class="fragment fade-up">
        <strong>结构裁剪</strong> → Compaction 做<strong>语义摘要</strong>，配合不替代。
      </div>
    </section>
  </section>

  <section>
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
      <pre><code>[结构化 Summary] + [firstKept 之后原文]</code></pre>
      <div class="fragment fade-up">旧对话折叠，最近 turn 保持完整 tool 链。</div>
    </section>
  </section>

  <section>
    <section>
      <h3>运行时注入</h3>
      <RuntimeInject />
      <div class="fragment fade-up">
        <strong>空间</strong>：Compaction · <strong>时间</strong>：Steer / Follow-up
      </div>
    </section>
  </section>

  <section>
    <h3>扩展钩子</h3>
    <HooksGrid />
  </section>

  <section>
    <h3>落地三原则</h3>
    <ul>
      <li class="fragment fade-up"><strong>先裁 toolResult</strong>，再 Compaction</li>
      <li class="fragment fade-up"><strong>摘要保 Goal / Decision</strong>，少压多</li>
      <li class="fragment fade-up"><strong>UI 可视化</strong> token 占比与压缩点</li>
    </ul>
  </section>

  <section>
    <h3>三句话带走</h3>
    <ol>
      <li class="fragment fade-up">
        <code>transformContext</code> 裁结构 · <code>convertToLlm</code> 对齐协议
      </li>
      <li class="fragment fade-up">Compaction 换空间，保留最近原文</li>
      <li class="fragment fade-up">Steer / Follow-up 改方向，钩子做领域定制</li>
    </ol>
  </section>
</template>
