#!/usr/bin/env node
/**
 * 小红书博主主页采集：收集博主笔记列表中每张卡片对应的详情链接，再逐条打开详情页抽取字段。
 *
 * 页面结构（内置浏览器实测）：笔记区为多条卡片，每条常见为「封面 a + 博主名 a」成对出现；
 * 有效跳转多为带 24 位十六进制 noteId 的 /explore/{id}（或 data-note-id 等）。
 *
 * 默认：有头浏览器 + 不强制登录；轮询等待 feed 渲染出笔记链接。仅调试可用 --headless。
 */
import fs from "fs";
import path from "path";
import { chromium } from "playwright";
import { resolveData } from "./lib/paths.mjs";

function parseArgs(argv) {
  const a = argv.slice(2);
  const out = {
    creatorUrl: "",
    out: "data/raw_payload.json",
    maxPosts: 50,
    headed: true,
    delayMs: 3000,
    waitManualLogin: false,
    loginTimeoutSeconds: 600,
    feedWaitSeconds: 120,
    explicitHeadless: false,
  };
  for (let i = 0; i < a.length; i++) {
    const x = a[i];
    if (x === "--creator-url" && a[i + 1]) out.creatorUrl = a[++i];
    else if (x === "--out" && a[i + 1]) out.out = a[++i];
    else if (x === "--max-posts" && a[i + 1]) out.maxPosts = parseInt(a[++i], 10) || 50;
    else if (x === "--headed") out.headed = true;
    else if (x === "--headless") {
      out.headed = false;
      out.explicitHeadless = true;
    } else if (x === "--manual-login") {
      out.waitManualLogin = true;
      out.headed = true;
    } else if (x === "--no-wait-login") out.waitManualLogin = false;
    else if (x === "--login-timeout" && a[i + 1]) out.loginTimeoutSeconds = parseInt(a[++i], 10) || 600;
    else if (x === "--feed-wait" && a[i + 1]) out.feedWaitSeconds = parseInt(a[++i], 10) || 120;
    else if (x === "--delay-ms" && a[i + 1]) out.delayMs = parseInt(a[++i], 10) || 3000;
  }
  if (out.waitManualLogin) out.headed = true;
  return out;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * 在页面内收集所有指向笔记详情的 URL（去重按 noteId）。
 * 覆盖：a[href] 中的 /explore/{24hex}、discovery/item、query 中的 noteId，以及 data-note-id 等。
 */
const GATHER_NOTE_HREFS_FROM_DOM = () => {
  const NOTE_ID = /^[a-f0-9]{24}$/i;
  const byId = new Map();

  function addExploreId(id, search) {
    if (!id || !NOTE_ID.test(id)) return;
    const q = search && search !== "undefined" ? search : "";
    const full = `${location.origin}/explore/${id}${q}`;
    if (!byId.has(id)) byId.set(id, full);
  }

  document.querySelectorAll("a[href]").forEach((a) => {
    const raw = a.getAttribute("href");
    if (!raw || raw === "#" || raw.startsWith("javascript:")) return;
    try {
      const u = new URL(raw, location.href);
      if (!u.hostname.replace(/^www\./, "").includes("xiaohongshu.com")) return;

      let m = u.pathname.match(/\/explore\/([a-f0-9]{24})(?:\/|$)/i);
      if (m) {
        addExploreId(m[1], u.search || "");
        return;
      }
      m = u.pathname.match(/\/discovery\/item\/([a-f0-9]{24})/i);
      if (m) {
        addExploreId(m[1], u.search || "");
        return;
      }
      const qs = u.search.match(/(?:^|[?&])note_?id=([a-f0-9]{24})/i);
      if (qs) addExploreId(qs[1], "");
    } catch (_) {}
  });

  ["data-note-id", "data-noteid", "data-nid", "note-id"].forEach((attr) => {
    try {
      document.querySelectorAll(`[${attr}]`).forEach((el) => {
        const id = el.getAttribute(attr);
        if (id && NOTE_ID.test(id)) addExploreId(id, "");
      });
    } catch (_) {}
  });

  return [...byId.values()];
};

/** @returns {Promise<number>} 笔记链接数；-1 表示浏览器已关闭 */
async function countNoteLinks(page) {
  const maxAttempts = 5;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const arr = await page.evaluate(GATHER_NOTE_HREFS_FROM_DOM);
      return arr.length;
    } catch (e) {
      const msg = String(e?.message || e);
      if (/has been closed|Target page|Browser closed|Context closed/i.test(msg)) return -1;
      if (/Execution context was destroyed|navigation|navigating/i.test(msg) && attempt < maxAttempts - 1) {
        await sleep(1000);
        continue;
      }
      if (/Execution context was destroyed|navigation|navigating/i.test(msg)) return 0;
      throw e;
    }
  }
  return 0;
}

async function scrollFeedNudge(page) {
  try {
    await page.evaluate(() => {
      window.scrollBy(0, 500);
      const feed =
        document.querySelector("main") ||
        document.querySelector('[class*="feeds"]') ||
        document.querySelector('[class*="userPosted"]') ||
        document.documentElement;
      try {
        feed.scrollBy?.(0, 600);
      } catch (_) {}
    });
  } catch (e) {
    const msg = String(e?.message || e);
    if (/Execution context was destroyed|navigation/i.test(msg)) await sleep(800);
  }
}

async function scrollFeedPage(page) {
  try {
    await page.evaluate(() => {
      window.scrollBy(0, 1200);
      const feed =
        document.querySelector("main") ||
        document.querySelector('[class*="feeds"]') ||
        document.querySelector('[class*="note"]') ||
        document.documentElement;
      try {
        feed.scrollBy?.(0, 800);
      } catch (_) {}
    });
  } catch (e) {
    const msg = String(e?.message || e);
    if (/Execution context was destroyed|navigation/i.test(msg)) await sleep(1000);
  }
}

async function gatherNoteHrefs(page) {
  const maxAttempts = 5;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await page.evaluate(GATHER_NOTE_HREFS_FROM_DOM);
    } catch (e) {
      const msg = String(e?.message || e);
      if (/Execution context was destroyed|navigation/i.test(msg) && attempt < maxAttempts - 1) {
        await sleep(1000);
        continue;
      }
      throw e;
    }
  }
  return [];
}

async function waitForManualLoginAndNotes(page, { timeoutSeconds = 600, pollInterval = 2000 } = {}) {
  const deadline = Date.now() + timeoutSeconds * 1000;
  console.log("\n┌─────────────────────────────────────────────────────────┐");
  console.log("│ 请在浏览器中登录小红书（如需）。检测到笔记链接后继续。   │");
  console.log(`│ 每 ${pollInterval / 1000}s 检测一次，最长 ${timeoutSeconds}s                    │`);
  console.log("└─────────────────────────────────────────────────────────┘\n");

  let lastLog = 0;
  while (Date.now() < deadline) {
    const n = await countNoteLinks(page);
    if (n < 0) {
      console.error("浏览器已关闭。");
      return false;
    }
    if (n >= 1) {
      console.log(`已检测到 ${n} 条笔记链接。`);
      return true;
    }
    if (Date.now() - lastLog >= 8000) {
      lastLog = Date.now();
      console.log("[等待] 尚未发现笔记详情链接，请完成登录或等待列表加载…");
    }
    await sleep(pollInterval);
  }
  console.error("超时：未检测到笔记链接。");
  return false;
}

/** 未登录模式：等待 SPA 渲染出笔记 a 标签 / data-note-id */
async function waitForFeedNotes(page, { timeoutSeconds = 120, pollInterval = 2000 } = {}) {
  const deadline = Date.now() + timeoutSeconds * 1000;
  const started = Date.now();
  console.log(
    `等待笔记列表渲染（最长 ${timeoutSeconds}s，每 ${pollInterval / 1000}s 检测；可适当向下滚动触发懒加载）…`,
  );
  let tick = 0;
  while (Date.now() < deadline) {
    const n = await countNoteLinks(page);
    if (n < 0) return false;
    if (n >= 1) {
      console.log(`已检测到 ${n} 条笔记详情链接。`);
      return true;
    }
    await scrollFeedNudge(page);
    tick += 1;
    if (tick % 4 === 0) console.log(`[feed] 仍无笔记链接，继续等待… (已等待 ${Math.round((Date.now() - started) / 1000)}s)`);
    await sleep(pollInterval);
  }
  console.warn("超时仍未发现笔记链接。可延长 --feed-wait，或改用 --manual-login 等待登录后再采。");
  return true;
}

async function scrollToLoadMore(page, maxPosts) {
  console.log("继续滚动以加载更多笔记…");
  let lastCount = 0;
  let stableRounds = 0;
  while (true) {
    const count = await countNoteLinks(page);
    if (count < 0) {
      console.warn("浏览器已关闭，停止滚动。");
      break;
    }
    console.log(`当前已收集到 ${count} 条笔记链接`);
    if (count >= maxPosts) {
      console.log(`已达到 --max-posts=${maxPosts}，停止滚动。`);
      break;
    }
    if (count === lastCount) {
      stableRounds += 1;
      if (stableRounds >= 4) {
        console.log("笔记数量不再增加，认为已到底或已无可加载项。");
        break;
      }
    } else {
      stableRounds = 0;
    }
    lastCount = count;
    await scrollFeedPage(page);
    await sleep(2200);
  }
}

const EXTRACT_DETAIL_FN = () => {
  const titleEl = document.querySelector('h1, [class*="title"]');
  const contentEl = document.querySelector('[class*="desc"], [class*="content"], article');
  const creatorEl = document.querySelector('[class*="nickname"], [class*="userName"]');
  const getCount = (sel) => {
    const el = document.querySelector(sel);
    return el ? el.innerText : "0";
  };
  const tags = Array.from(document.querySelectorAll('a[href*="search_result"]'))
    .map((a) => a.innerText.replace("#", "").trim())
    .filter((t) => t.length > 0);
  return {
    title: titleEl ? titleEl.innerText : "",
    content_text: contentEl ? contentEl.innerText : "",
    creator_name: creatorEl ? creatorEl.innerText : "",
    publish_time_text: document.querySelector('[class*="date"], [class*="time"]')
      ? document.querySelector('[class*="date"], [class*="time"]').innerText
      : "",
    counts: {
      like: getCount('[class*="like"] span, [class*="interact"] [class*="like"]'),
      collect: getCount('[class*="collect"] span, [class*="interact"] [class*="collect"]'),
      comment: getCount('[class*="comment"] span, [class*="interact"] [class*="comment"]'),
    },
    tags: Array.from(new Set(tags)),
  };
};

function parsePostId(url) {
  const s = String(url);
  const m = s.match(/\/explore\/([a-f0-9]{24})/i);
  if (m) return m[1];
  const m2 = s.match(/\/explore\/([a-zA-Z0-9]+)/);
  return m2 ? m2[1] : "";
}

async function extractPostDetail(page, url, creatorUrl) {
  console.log(`Extracting: ${url}`);
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    await sleep(4000);
    const curr = page.url() || "";
    if (curr.includes("login")) {
      console.warn("跳转到了登录页，跳过该条。");
      return null;
    }
    const detail = await page.evaluate(EXTRACT_DETAIL_FN);
    detail.post_url = url;
    detail.post_id = parsePostId(url) || parsePostId(curr);
    detail.creator_url = creatorUrl;
    return detail;
  } catch (e) {
    console.warn(`Extract failed: ${url} — ${e.message}`);
    return null;
  }
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.creatorUrl) {
    console.error(
      "Usage: node collect_playwright.mjs --creator-url <url> [options]\n" +
        "  默认：有头浏览器，不强制登录；--feed-wait 内等待笔记链接出现\n" +
        "  --headless            无头（仅调试；易被风控）\n" +
        "  --manual-login        有头并等待你登录直至出现笔记链接\n" +
        "  --feed-wait SEC       等待列表渲染（默认 120）\n" +
        "  --max-posts N         最多采集条数（默认 50）\n" +
        "  --login-timeout SEC   仅 --manual-login 时有效\n" +
        "  --out path  --delay-ms MS",
    );
    process.exit(1);
  }

  const outPath = resolveData(args.out);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  const launchOpts = {
    headless: !args.headed,
    args: ["--disable-blink-features=AutomationControlled"],
  };
  if (process.env.PW_CHANNEL) launchOpts.channel = process.env.PW_CHANNEL;

  const browser = await chromium.launch(launchOpts);
  const context = await browser.newContext({
    locale: "zh-CN",
    viewport: { width: 1440, height: 900 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    extraHTTPHeaders: { "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8" },
  });
  const page = await context.newPage();

  try {
    console.log(`Navigating to ${args.creatorUrl}`);
    await page.goto(args.creatorUrl, { waitUntil: "domcontentloaded", timeout: 90000 });
    await sleep(2000);

    let ok = true;
    if (args.waitManualLogin) {
      ok = await waitForManualLoginAndNotes(page, {
        timeoutSeconds: args.loginTimeoutSeconds,
        pollInterval: 2000,
      });
    } else {
      ok = await waitForFeedNotes(page, {
        timeoutSeconds: args.feedWaitSeconds,
        pollInterval: 2000,
      });
    }
    if (!ok) {
      process.exitCode = 2;
      return;
    }

    await scrollToLoadMore(page, args.maxPosts);
    const links = await gatherNoteHrefs(page);
    const slice = links.slice(0, args.maxPosts);
    console.log(`共 ${links.length} 条笔记链接，将抓取前 ${slice.length} 条。`);

    const results = [];
    for (let i = 0; i < slice.length; i++) {
      const link = slice[i];
      const detail = await extractPostDetail(page, link, args.creatorUrl);
      if (detail) results.push(detail);
      console.log(`Progress: ${i + 1}/${slice.length}`);
      await sleep(args.delayMs);
    }

    fs.writeFileSync(outPath, JSON.stringify(results, null, 2), "utf-8");
    console.log(`Successfully saved ${results.length} posts to ${outPath}`);
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
