# 讲稿佐证（不放进幻灯片）

讲完对应页后，用下面代码抽象口头对照。本文档不进站点导航、不参与 Reveal 渲染。

---

## 1 · 什么是模型的上下文管理？

共性骨架（各家 harness 类似）：

```text
prompt → LLM → toolCall → toolResult → LLM → …
```

---

## 2 · 每轮调用 LLM，实际送了什么？

**pi** — 会话拼装进模型前：

```ts
// buildSessionContext: leaf → 根，拼消息 + Compaction 摘要
// transformContext: 可选，裁旧 toolResult
convertToLlm: (messages) => messages.flatMap(m => {
  if (m.role === 'notification') return [];
  if (m.role === 'custom' && !m.display) return [];
  return [m];
})
```

**Claude Code** — Read 工具 schema（分页是协议的一部分）：

```ts
interface ReadInput {
  file_path: string;
  offset?: number;  // 从大文件中间读起
  limit?: number;
}
// 默认先返回前 2000 行；项目 CLAUDE.md 每轮从磁盘注入，不依赖对话记忆
```

---

## 3 · 模型怎么读一个超大文件？

**pi** — `read` 工具 schema 与上限（`packages/coding-agent/src/core/tools/read.ts`）：

```ts
const readSchema = Type.Object({
  path: Type.String(),
  offset: Type.Optional(Type.Number({ description: "Line number to start (1-indexed)" })),
  limit: Type.Optional(Type.Number({ description: "Maximum number of lines to read" })),
});

// 工具说明里写死：文本输出截断到 DEFAULT_MAX_LINES(2000) 或 DEFAULT_MAX_BYTES(50KB)，先到先停
description: `… output is truncated to 2000 lines or 50KB … Use offset/limit for large files.`
```

**pi** — 选行 + `truncateHead` + 续读提示（同文件 `execute` 核心）：

```ts
const allLines = textContent.split("\n");
const startLine = offset ? Math.max(0, offset - 1) : 0;

let selectedContent: string;
if (limit !== undefined) {
  const endLine = Math.min(startLine + limit, allLines.length);
  selectedContent = allLines.slice(startLine, endLine).join("\n");
} else {
  selectedContent = allLines.slice(startLine).join("\n");
}

const truncation = truncateHead(selectedContent); // 共享 truncate.ts

if (truncation.truncated) {
  const endLineDisplay = startLine + 1 + truncation.outputLines - 1;
  const nextOffset = endLineDisplay + 1;
  outputText = truncation.content;
  outputText += `\n\n[Showing lines ${startLine + 1}-${endLineDisplay} of ${allLines.length}. Use offset=${nextOffset} to continue.]`;
  // details.truncation 同时给 TUI 显示警告
}
```

**pi** — 单行超大时的兜底（引导用 bash 抽一行）：

```ts
if (truncation.firstLineExceedsLimit) {
  outputText = `[Line ${startLine + 1} is ${firstLineSize}, exceeds 50KB limit. Use bash: sed -n '${startLine + 1}p' ${path} | head -c ${DEFAULT_MAX_BYTES}]`;
}
```

**pi** — 配合 `grep`：先搜行号，再 `read(offset, limit)` 精读；不必从头读完 8000 行。

**Claude Code** — 同类分页：

```ts
interface ReadInput {
  file_path: string;
  offset?: number;
  limit?: number;
}
// 默认先返回前 2000 行；超大文件拒读时提示 offset/limit 或 grep
read({ file_path: "src/app.ts", offset: 2001, limit: 2000 })
```

---

## 4 · 截断了，还能连贯吗？

**pi** — Compaction 切点规则（`compaction.md`）：

```text
合法切点: user | assistant | bashExecution
禁止切点: toolResult 中间（必须保留 tool 链）
```

**Claude Code** — 实践坑：

```text
Compaction 后「读全文件」类指令可能被压掉 → 关键规则写进 CLAUDE.md（每轮重读）
```

---

## 5 · 还记住什么？ / 存在哪？怎么用？

**pi** — 会话 entry 类型（`session-format.md`）：

```ts
type Entry =
  | { type: 'message'; message: AgentMessage }
  | { type: 'compaction'; summary: string; firstKeptEntryId: string }
  | { type: 'branch_summary'; summary: string }
  | { type: 'custom'; data: unknown }  // 不进 LLM
```

**Claude Code** — 两层：

```text
对话历史 → harness 内存 / 压缩后摘要
CLAUDE.md、rules → 磁盘，每轮重新加载
PreCompact 钩子 → 压缩前把状态写到磁盘
```

---

## 6 · 对话太长怎么办？

**pi** — 触发与保留（`compaction.md`）：

```text
contextTokens > contextWindow - reserveTokens   // reserve 默认 16k
keepRecentTokens 默认 ~20k → 切点之后原文全留
serializeConversation → tool 单条先截 2000 字再摘要
```

**Claude Code** — 触发与恢复（公开资料 / harness 行为）：

```text
上下文用到约 80%+ → 自动 Compact
压缩后可将少量最近读过的文件重新挂回上下文（有 token 预算）
```

摘要模板（pi 默认，Claude Code 同类 harness 结构相近）：

```markdown
## Goal
## Progress · Key Decisions · Next Steps
<read-files>…</read-files>
```
