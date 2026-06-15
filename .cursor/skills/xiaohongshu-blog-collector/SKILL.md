---
name: xiaohongshu-blog-collector
description: 使用 Node.js + Playwright 抓取小红书博主主页：从笔记列表收集详情链接再逐篇打开抽取；默认有头 Chromium、不强制登录，可选 --headless 调试或 --manual-login。支持增量 JSON 与 HTML 报告。
---

# 小红书博主采集技能

## 默认目标与可覆盖 URL

- 默认 URL：`https://www.xiaohongshu.com/user/profile/5a3bc3a34eacab3b08167b93`
- 若用户提供其他博主主页 URL，优先使用用户提供的 URL。

## 页面结构（内置浏览器实测）

- 博主主页笔记区为多条**卡片**；每条常见为**成对 `a` 链接**（如封面入口 + 博主名），点击可进入笔记详情。
- 脚本不依赖固定 class，在页面内**汇总所有合法笔记详情 URL**：
  - `a[href]` 中路径为 **`/explore/{24位十六进制noteId}`**（小红书笔记 ID 常规格式）；
  - 以及 **`/discovery/item/{noteId}`**、query 中的 `note_id` / `noteId`；
  - 容器上的 **`data-note-id` / `data-noteid` / `note-id` 等**（若存在）。
- 去重按 `noteId`，再对每个 URL **`goto` 详情页**抽取标题、正文、标签、赞藏评等。

## 强约束（当前主路径）

- **主路径**：Node.js + **Playwright** + **Chromium**。
- **默认**：**有头浏览器**（不使用无头），**不强制登录**；打开博主主页后在 **`--feed-wait` 秒数内轮询**（默认 120s），直到 DOM 出现至少一条上述笔记链接，并配合滚动触发懒加载。
- **需要登录后再采**：使用 **`--manual-login`**，有头并等待直至出现笔记链接（`--login-timeout`，默认 600s）。
- **仅调试**：可加 **`--headless`**（无头，易被风控，一般不推荐）。
- 逐篇：**导航到详情 URL** → 等待加载 → `page.evaluate` 抽取 DOM。
- **单篇失败只记日志，不中断**。
- 环境变量 **`PW_CHANNEL=chrome`** 可使用本机 Google Chrome。

## 数据输出

- `data/raw_payload.json`、`data/incoming_posts.json`、`data/xiaohongshu_posts.json`、`data/xiaohongshu_posts.html`
- 字段：`post_id`、`post_url`、`creator_url`、`creator_name`、`title`、`content_text`、`tags`、`publish_time_text`、互动数字段、`captured_at`、`raw` 等。

## 环境与安装

```bash
cd .cursor/skills/xiaohongshu-blog-collector
npm install
npx playwright install chromium
```

## 一键流水线

默认：**有头**、**feed 等待 120s**、**最多 50 篇**：

```bash
npm run pipeline
```

延长等待或指定篇数：

```bash
node scripts/node/run_pipeline.mjs --feed-wait 180 --max-posts 30
```

需要扫码/手机号登录后再采：

```bash
node scripts/node/run_pipeline.mjs --manual-login --login-timeout 600
```

强制无头（仅调试）：

```bash
node scripts/node/run_pipeline.mjs --headless
```

## 分步命令

```bash
cd .cursor/skills/xiaohongshu-blog-collector

node scripts/node/collect_playwright.mjs \
  --creator-url "https://www.xiaohongshu.com/user/profile/5a3bc3a34eacab3b08167b93" \
  --out data/raw_payload.json \
  --max-posts 50 \
  --feed-wait 120

node scripts/node/normalize_incoming.mjs \
  --creator-url "https://www.xiaohongshu.com/user/profile/5a3bc3a34eacab3b08167b93" \
  --raw-payload data/raw_payload.json \
  --incoming-out data/incoming_posts.json \
  --max-posts 50

node scripts/node/merge_posts.mjs \
  --base data/xiaohongshu_posts.json \
  --incoming data/incoming_posts.json \
  --out data/xiaohongshu_posts.json

node scripts/node/render_html.mjs \
  --input data/xiaohongshu_posts.json \
  --output data/xiaohongshu_posts.html
```

### `collect_playwright.mjs` 参数摘要

| 参数 | 说明 |
|------|------|
| `--creator-url` | 博主主页 URL（必填） |
| `--max-posts` | 最多抓取篇数，默认 `50` |
| `--feed-wait SEC` | 等待列表出现笔记链接，默认 `120` |
| `--headless` | 无头（默认不使用） |
| `--manual-login` | 有头并等待登录直至出现笔记链接 |
| `--login-timeout SEC` | 仅配合 `--manual-login`，默认 `600` |
| `--out` / `--delay-ms` | 输出路径、篇间隔 |

## 博主风格分析与内容创作

基于 `xiaohongshu_posts.json` 或 HTML 报告做风格画像；按需生成「模仿该博主」的笔记文案。
