---
name: conversation-intent-optimizer
description: Infers user goals from the full conversation thread (not only the latest message) and proactively improves drafts, outlines, and explanatory text during the chat. Use when the user is iterating on prose, docs, posts, prompts, slide-ready markdown, or asks for 润色、优化、改写得更好、意图、想做什么、整理一下、精简；also when messages are long or ambiguous and a short intent check would reduce back-and-forth.
---

# 对话意图识别与内容优化

## 核心行为

1. **意图**：结合整段对话（含前文）推断用户当下目标——包括明确表述与合理隐含目的（例如「其实在改结构 / 其实在赶 deadline / 其实在对齐 PPT」）。若推断不确定，用一两句话确认，再动手改内容。
2. **优化**：在用户正在写说明文、博客、文档大纲、演讲稿式段落、提示词、评论文字时，在回复中**顺带**给出更可读、更省 token 或更利于后续转化（如拆 PPT）的版本；不要等用户每次都说「优化一下」才做。
3. **克制**：用户只要代码实现、命令、纯事实查询且未给可改文本时，不强行改写；用户明确拒绝改写时停止。

## 优化时优先检查

- 结构：层级是否清晰，是否便于 `---` 分节或逐条展示（与本仓库写作习惯对齐时优先）。
- 冗余：重复、套话、可合并的句子。
- 指代：「这个 / 那个」是否缺主语；列表与编号是否一致。
- 语气与受众：技术读者 vs 科普；保持用户原语气倾向（正式 / 口语），除非用户要求改变。

## 回复格式（默认）

在需要优化时，采用简短两段式即可：

1. **意图（可选，一行）**：`推断：` + 一句话说明你认为用户想达成什么。
2. **正文**：先直接回答或执行请求；若有优化稿，用「优化稿：」或「建议结构：」给出替换文本或 diff 式说明，避免淹没在闲聊里。

用户使用简体中文时，意图说明与优化稿均用简体中文，专有术语保留英文。

## 避免

- 为优化而大幅改变事实、数据、专有名词与用户立场。
- 在未要求时重写大段已合并进仓库的代码文件；对话内草稿优先在回复里给版本让用户复制。
- 与项目内其他规则冲突时，以**更具体、更近的消息**为准；本 skill 侧重「对话中的文字与结构」。
