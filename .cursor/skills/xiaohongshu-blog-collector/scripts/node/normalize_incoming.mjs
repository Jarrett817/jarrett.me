#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { resolveData } from "./lib/paths.mjs";
import {
  SELECTORS,
  buildOperationPlan,
  normalizePayloadItem,
  nowIsoUtc,
} from "./lib/normalize_lib.mjs";

const DEFAULT_URL = "https://www.xiaohongshu.com/user/profile/5a3bc3a34eacab3b08167b93";

function parseArgs(argv) {
  const a = argv.slice(2);
  const out = {
    creatorUrl: DEFAULT_URL,
    incomingOut: "data/incoming_posts.json",
    rawPayload: "",
    maxPosts: 50,
  };
  for (let i = 0; i < a.length; i++) {
    const x = a[i];
    if (x === "--creator-url" && a[i + 1]) out.creatorUrl = a[++i];
    else if (x === "--incoming-out" && a[i + 1]) out.incomingOut = a[++i];
    else if (x === "--raw-payload" && a[i + 1]) out.rawPayload = a[++i];
    else if (x === "--max-posts" && a[i + 1]) out.maxPosts = parseInt(a[++i], 10) || 50;
  }
  return out;
}

function normalizeCreatorUrl(u) {
  try {
    const x = new URL(u);
    return `${x.protocol}//${x.host}${x.pathname}`;
  } catch {
    return u;
  }
}

function loadRawPayload(filePath) {
  const p = resolveData(filePath);
  if (!fs.existsSync(p)) return [];
  let data;
  try {
    data = JSON.parse(fs.readFileSync(p, "utf-8"));
  } catch {
    return [];
  }
  if (Array.isArray(data)) return data.filter((x) => x && typeof x === "object");
  if (data && typeof data === "object" && Array.isArray(data.posts)) {
    return data.posts.filter((x) => x && typeof x === "object");
  }
  return [];
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.rawPayload) {
    console.error("Usage: node normalize_incoming.mjs --raw-payload data/raw_payload.json [--creator-url URL] [--incoming-out data/incoming_posts.json] [--max-posts 50]");
    process.exit(1);
  }
  const creatorUrl = normalizeCreatorUrl(args.creatorUrl);
  const plan = buildOperationPlan(creatorUrl, args.maxPosts);
  const rawItems = loadRawPayload(args.rawPayload);
  const posts = rawItems.map((x) => normalizePayloadItem(x, creatorUrl));

  const runMeta = {
    creator_url: creatorUrl,
    started_at: nowIsoUtc(),
    login_wait_rule: "if /login appears, wait up to 300s with 2s polling",
    planned_max_posts: args.maxPosts,
    selectors_version: "2026-04-07-node-playwright",
    selectors: SELECTORS,
    operation_plan: plan.collection_flow,
    raw_payload_count: rawItems.length,
    engine: "node+playwright",
  };

  const outPath = resolveData(args.incomingOut);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify({ meta: runMeta, posts }, null, 2), "utf-8");
  console.log(
    JSON.stringify(
      {
        incoming_out: args.incomingOut,
        normalized_posts: posts.length,
        raw_payload_count: rawItems.length,
        selectors_version: runMeta.selectors_version,
      },
      null,
      0,
    ),
  );
}

main();
