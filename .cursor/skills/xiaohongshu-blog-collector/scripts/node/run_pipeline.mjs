#!/usr/bin/env node
/**
 * 一键：采集 → 标准化 → 合并 → HTML（在技能根目录执行：npm run pipeline）
 */
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const NODE = process.execPath;

const DEFAULT_CREATOR = "https://www.xiaohongshu.com/user/profile/5a3bc3a34eacab3b08167b93";

function parseArgs(argv) {
  const a = argv.slice(2);
  const o = {
    creatorUrl: DEFAULT_CREATOR,
    maxPosts: 50,
    /** 与 collect 默认一致：有头 + 等 feed，不强制登录 */
    headless: false,
    manualLogin: false,
    feedWaitSeconds: 120,
    loginTimeoutSeconds: 600,
    rawOut: "data/raw_payload.json",
    incoming: "data/incoming_posts.json",
    base: "data/xiaohongshu_posts.json",
    merged: "data/xiaohongshu_posts.json",
    html: "data/xiaohongshu_posts.html",
  };
  for (let i = 0; i < a.length; i++) {
    if (a[i] === "--creator-url" && a[i + 1]) o.creatorUrl = a[++i];
    else if (a[i] === "--max-posts" && a[i + 1]) o.maxPosts = parseInt(a[++i], 10) || 50;
    else if (a[i] === "--headed") o.headless = false;
    else if (a[i] === "--headless") o.headless = true;
    else if (a[i] === "--manual-login") o.manualLogin = true;
    else if (a[i] === "--feed-wait" && a[i + 1]) o.feedWaitSeconds = parseInt(a[++i], 10) || 120;
    else if (a[i] === "--login-timeout" && a[i + 1]) o.loginTimeoutSeconds = parseInt(a[++i], 10) || 600;
  }
  return o;
}

function run(script, args) {
  const scriptPath = path.join(__dirname, script);
  const r = spawnSync(NODE, [scriptPath, ...args], {
    stdio: "inherit",
    cwd: process.cwd(),
    env: process.env,
  });
  if (r.error) {
    console.error(r.error);
    process.exit(1);
  }
  if (r.status !== 0) process.exit(r.status ?? 1);
}

function main() {
  const o = parseArgs(process.argv);
  const collectArgs = [
    "--creator-url",
    o.creatorUrl,
    "--out",
    o.rawOut,
    "--max-posts",
    String(o.maxPosts),
    "--feed-wait",
    String(o.feedWaitSeconds),
  ];
  if (o.manualLogin) {
    collectArgs.push("--manual-login", "--login-timeout", String(o.loginTimeoutSeconds));
  } else if (o.headless) {
    collectArgs.push("--headless");
  }

  run("collect_playwright.mjs", collectArgs);
  run("normalize_incoming.mjs", [
    "--creator-url",
    o.creatorUrl,
    "--raw-payload",
    o.rawOut,
    "--incoming-out",
    o.incoming,
    "--max-posts",
    String(o.maxPosts),
  ]);
  run("merge_posts.mjs", ["--base", o.base, "--incoming", o.incoming, "--out", o.merged]);
  run("render_html.mjs", ["--input", o.merged, "--output", o.html]);
  console.log("Pipeline done.");
}

main();
