export type ImplBlock = {
  product: 'pi' | 'claude';
  label: string;
  path: string;
  code: string;
};

export const implRefs = {
  constraints: [
    {
      product: 'pi',
      label: 'pi-agent-core',
      path: 'agent-loop.d.ts',
      code: `// 每次 LLM 调用边界才 convertToLlm；上下文在 Agent 内维持
export declare function agentLoop(
  prompts: AgentMessage[],
  context: AgentContext,
  config: AgentLoopConfig,
  ...
): EventStream<AgentEvent, AgentMessage[]>;`
    },
    {
      product: 'claude',
      label: 'Claude Code 文档',
      path: 'prompt-caching.md',
      code: `// 每轮 API 请求重发完整上下文；模型本身无跨请求记忆
The model doesn't remember anything between requests,
so Claude Code re-sends the full context.`
    }
  ] as ImplBlock[],

  pipeline: [
    {
      product: 'pi',
      label: 'pi-agent-core',
      path: 'types.d.ts',
      code: `// 调用前：transformContext → convertToLlm
transformContext?: (messages, signal?) => Promise<AgentMessage[]>;
convertToLlm: (messages) => Message[] | Promise<Message[]>;`
    },
    {
      product: 'pi',
      label: 'pi-coding-agent',
      path: 'messages.d.ts',
      code: `// 拼入 compactionSummary / branchSummary 等自定义消息
export declare function convertToLlm(messages: AgentMessage[]): Message[];`
    },
    {
      product: 'claude',
      label: 'Claude Code 文档',
      path: 'prompt-caching.md',
      code: `// 请求分层：system prompt → 项目上下文 → 对话
| System prompt | 工具定义、输出风格 |
| Project context | CLAUDE.md、auto memory、rules |
| Conversation | 消息、tool 结果 |`
    }
  ] as ImplBlock[],

  readChunk: [
    {
      product: 'pi',
      label: 'pi-coding-agent',
      path: 'tools/read.js',
      code: `// offset/limit + 续读提示
outputText += \`\\n\\n[Showing lines \${start}-\${end} of \${total}.
Use offset=\${nextOffset} to continue.]\`;`
    },
    {
      product: 'claude',
      label: '@anthropic-ai/claude-code',
      path: 'sdk-tools.d.ts · FileReadInput',
      code: `export interface FileReadInput {
  file_path: string;
  offset?: number;  // 大文件起始行
  limit?: number;   // 读取行数
}`
    }
  ] as ImplBlock[],

  readGrep: [
    {
      product: 'pi',
      label: 'pi-coding-agent',
      path: 'tools/index.d.ts',
      code: `export type ToolName =
  "read" | "bash" | "edit" | "write" | "grep" | "find" | "ls";`
    },
    {
      product: 'claude',
      label: '@anthropic-ai/claude-code',
      path: 'sdk-tools.d.ts · GrepInput',
      code: `export interface GrepInput {
  pattern: string;
  path?: string;
  output_mode?: "content" | "files_with_matches" | "count";
  head_limit?: number;  // 默认 250，限制进上下文的结果量
}`
    }
  ] as ImplBlock[],

  readTail: [
    {
      product: 'pi',
      label: 'pi-coding-agent',
      path: 'tools/truncate.d.ts',
      code: `// bash 输出默认尾部截断
export declare function truncateTail(
  content: string,
  options?: TruncationOptions
): TruncationResult;`
    },
    {
      product: 'claude',
      label: '@anthropic-ai/claude-code',
      path: 'sdk-tools.d.ts · GrepInput.offset',
      code: `// grep 的 offset 语义等价 tail + head
// "tail -n +N | head -N"
offset?: number;`
    }
  ] as ImplBlock[],

  coherence: [
    {
      product: 'pi',
      label: 'pi-coding-agent',
      path: 'compaction/compaction.d.ts',
      code: `// 切点：user/assistant，永不落在 toolResult
export declare function findCutPoint(
  entries, startIndex, endIndex, keepRecentTokens
): CutPointResult;`
    },
    {
      product: 'claude',
      label: 'Claude Code 文档',
      path: 'glossary.md · Compaction',
      code: `// 先清理旧 tool 输出，再摘要对话
Older tool outputs are cleared first,
then the conversation is summarized.`
    }
  ] as ImplBlock[],

  proactive: [
    {
      product: 'pi',
      label: 'pi-coding-agent',
      path: 'tools/truncate.d.ts',
      code: `// 工具边界硬截断（非 LLM 摘要）
DEFAULT_MAX_LINES = 2000;
DEFAULT_MAX_BYTES = 50KB;`
    },
    {
      product: 'claude',
      label: 'Claude Code 文档',
      path: 'costs.md · hooks',
      code: `// PreToolUse hook：进上下文前过滤 tool 输出
// 例：grep ERROR | head -100，把万行日志压成数百 token`
    }
  ] as ImplBlock[],

  compactMethods: [
    {
      product: 'pi',
      label: 'pi-coding-agent',
      path: 'docs/compaction.md',
      code: `// 默认策略：keepRecent + LLM 结构化摘要
keepRecentTokens: 20000
reserveTokens: 16384`
    },
    {
      product: 'claude',
      label: 'Claude Code 文档',
      path: 'glossary.md',
      code: `// auto-compaction + /compact [focus]
// 非纯滑动窗口；摘要后 CLAUDE.md 从磁盘重注入`
    }
  ] as ImplBlock[],

  keepRecent: [
    {
      product: 'pi',
      label: 'pi-coding-agent',
      path: 'compaction/compaction.d.ts',
      code: `export declare function shouldCompact(
  contextTokens: number,
  contextWindow: number,
  settings: CompactionSettings
): boolean;

// findCutPoint: 从最新向前累加，保留 keepRecentTokens`
    },
    {
      product: 'claude',
      label: 'Claude Code 文档',
      path: 'context-window.md',
      code: `// 接近上限时自动 compact；可手动 /compact focus on ...
Claude Code compacts automatically as you approach the limit.`
    }
  ] as ImplBlock[],

  memoryClaude: [
    {
      product: 'claude',
      label: 'Claude Code 文档',
      path: 'memory.md',
      code: `// 跨会话记忆（非 messages 列表）
- CLAUDE.md：你写的持久指令，每会话加载
- auto memory：Claude 写的笔记，~/.claude/projects/
// compact 后 project-root CLAUDE.md 从磁盘重注入`
    },
    {
      product: 'pi',
      label: 'pi-coding-agent',
      path: 'session JSONL',
      code: `// 对照：pi 用 JSONL entry 树 + CompactionEntry
// 非 Claude 的 CLAUDE.md / auto memory 模型`
    }
  ] as ImplBlock[]
} as const;

export type ImplRefKey = keyof typeof implRefs;
