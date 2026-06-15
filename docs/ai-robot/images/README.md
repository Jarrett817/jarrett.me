# 幻灯配图（豆包出图）

**配图统一用豆包生成 PNG/JPEG**，不要用仓库内 SVG 作为幻灯主图（部分环境预览/嵌入异常）。

## 与 `index.md` 的对应关系（当前引用）

| 文件 | 大致对应页 |
|------|------------|
| `project-example.jpeg` | 示例：项目中的 Agent + MCP（长图） |
| `doubao-mcp-hub.jpeg` | 工具扩展：伸出去的手 |
| `doubao-doc-design-agent.jpeg` | 准备阶段 · doc 与设计稿 |
| `doubao-iterate-8020.jpeg` | 开发 · 80/20 |
| `doubao-code-review.jpeg` | 审查 |
| `doubao-design-vs-impl.jpeg` | 对稿 |
| `test-example.jpeg` | 自测 / 浏览器与用例 |
| `doubao-libraries-orchestration.jpeg` | 怎么让模型少乱写 |
| `log-tool.jpeg` | 数据面板 |
| `doubao-tesla-vision-analogy.jpeg` | 类比 · 纯视觉感知 |

## 换新图（命令行即可）

豆包里生成后复制图片的 **https 直链**，在项目根目录执行（Git Bash / WSL / 装了 curl 的终端）：

```bash
curl -sL "粘贴完整URL" -o docs/ai-robot/images/doubao-xxx.jpeg
```

`index.md` 里已经是 `./images/doubao-xxx.jpeg`，**文件名不变**就只换文件内容。

**风格建议**：提示词里可加「手稿/手绘风、浅色纸纹、信息图、横版 16:9」等，和当页内容对齐。

## 其他

- 直链若过期：到豆包 **我的创作** 重新打开对话，右键图另存为，或复制新 URL 再 `curl -o` 覆盖。
