---
name: doubao-doc-images
description: Generates images for markdown or docs using browser automation on Doubao 豆包 chat image mode, evaluates four candidates, saves the chosen file under the editing document's sibling images/ directory, and inserts a relative markdown image reference. Use when the user needs illustrations for a post or doc and wants 豆包生图, Doubao image generation, or browser-based配图 instead of local SD/DALL·E APIs.
---

# 豆包文档配图（Playwright / 浏览器 MCP）

## 何时启用

用户在写/改 **Markdown、VitePress 文档、博客文章** 等需要配图，且指定或接受用 **豆包网页** 生成图片时，按本流程执行。优先使用 **Playwright MCP**（`mcp_playwright_browser_*`）；若环境仅有 Cursor IDE Browser，可用对等的 `browser_*` 工具，步骤相同。

## 前置假设

- 目标站点：[豆包对话](https://www.doubao.com/chat/)（需能打开 **图像/图片生成** 模式；具体入口以当前页面为准，用 snapshot 定位）。
- 豆包单次出图 **4 张**；需 **人工（代理）判断** 哪张最符合文档主题、风格与可读性。
- 用户可能需 **已登录** 豆包账号；若未登录，在 snapshot 中引导用户登录后再继续，不要猜测密码。

## 路径约定（必须一致）

1. 确定「正在编辑的文档」的绝对路径 `DOC_PATH`（如 `docs/ai-robot/index.md`）。
2. 配图目录：`IMAGES_DIR = dirname(DOC_PATH) + "/images"`（与文档 **同级的** `images/`，不是仓库根目录除非文档就在根下）。
3. 若 `images/` 不存在则创建（含父目录）。
4. 文中引用使用 **相对文档路径**，例如文档在 `docs/foo/bar.md` 时写：`![简述](./images/your-file.png)`。

文件名：小写 kebab-case，与段落主题相关，避免 `image1.png`；扩展名以实际 MIME 为准（`.png` / `.webp` / `.jpg`）。

## 工作流

### 1. 打开站点并进入生图模式

- `browser_navigate` → `https://www.doubao.com/chat/`
- `browser_snapshot` 查看结构；找到切换到 **图片/图像生成** 的 tab、按钮或菜单并完成点击。
- 若界面与说明不一致，**以 snapshot 为准**，不要硬编码已失效的选择器文案。

### 2. 填写提示词

- 提示词应贴合 **当前文档小节主题**、受众与语气（技术示意图 / 封面氛围 / 扁平插画等）。
- 避免生成带 **不可控大段文字** 的图（水印、乱码、与正文冲突的 slogan）；若文档需要纯示意，优先「无字、简洁、高对比」类描述。

### 3. 等待四张结果

- 使用 `browser_wait_for`（文案或时间）与多次 snapshot，直到 **四张缩略图或结果格** 稳定出现。
- 若失败或超时：截图或记录可见错误，**最多再试一轮**（改提示词或重试）；仍失败则向用户说明阻塞原因。

### 4. 评判与择一（四选一）

对每张从以下维度快速打分（ mental checklist，不必输出长文除非用户要）：

- **相关性**：与本节论点、比喻是否一致。
- **可读性**：主体是否清晰，是否过于杂乱或 AI 违和感过强。
- **文档适配**：浅色/深色主题、是否需要透明底（若无法透明，选背景最干净的一张）。
- **风险**：明显错误信息、敏感不当内容、无法辨认的伪文字 → **淘汰**。

选出 **一张**；若四张均明显不合格，可 **调整提示词再生成一轮**，仍不行则询问用户是否接受次优或改用其他配图来源。

### 5. 下载到 `IMAGES_DIR`

优先顺序（从可靠到兜底）：

1. **网络面板**：`browser_network_requests`（`includeStatic: true`）在生成完成后查找图片响应 URL（`content-type` 为 image 或 URL 含常见图片 CDN 路径），用终端 `curl -L -o "IMAGES_DIR/文件名"` 下载（注意引号与路径）。
2. **DOM**：对选中那张的 `img` 用 `browser_evaluate` 读取 `currentSrc` / `src`（若是 blob URL，需改从 network 找对应请求或对该格 **右键另存** 的等价操作——以 Playwright 能力为准）。
3. **兜底**：对 **选定的那一格** `browser_take_screenshot`（仅当无法拿到原始文件时），并在回复中说明分辨率可能低于原图。

保存后确认文件非空、可打开。

### 6. 写回文档

- 在合适位置插入 Markdown：  
  `![简短有意义的 alt 文本](./images/文件名.ext)`
- alt 应概括图像内容，利于无障碍与 SEO。
- 若同主题已有多图，避免重复文件名；必要时加后缀 `-2`、`-workflow` 等。

### 7. 收尾

- 简短告知用户：**保存路径**、**选中理由（一句话）**、若用了截图兜底需标明。
- 不要将账号 cookie、token 写入仓库或聊天以外的持久化位置。

## 自检清单

- [ ] 图片落在 **文档父目录下的 `images/`**
- [ ] Markdown 使用 **相对路径** `./images/...`
- [ ] 从四张中 **明确择一** 并说明取舍
- [ ] 登录/网络错误有 **可执行** 的下一步（重试或用户操作）

## 合规与边界

- 遵守豆包服务条款与合理使用；自动化仅用于 **用户本人授权** 的配图场景。
- 不批量爬取、不绕过付费或风控；频率过高时暂停并提醒用户。
- UI 变更时依赖 snapshot 与网络请求，而非死记按钮文案。
