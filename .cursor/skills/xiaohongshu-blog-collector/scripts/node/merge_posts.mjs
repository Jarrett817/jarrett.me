#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { resolveData } from "./lib/paths.mjs";

function nowIsoUtc() {
  return new Date().toISOString().slice(0, 19) + "+00:00";
}

function loadPosts(filePath) {
  const p = resolveData(filePath);
  if (!fs.existsSync(p)) return [];
  try {
    const data = JSON.parse(fs.readFileSync(p, "utf-8"));
    const posts = data.posts;
    return Array.isArray(posts) ? posts : [];
  } catch {
    return [];
  }
}

function nonEmpty(v) {
  if (v == null) return false;
  if (typeof v === "string") return v.trim() !== "";
  if (Array.isArray(v)) return v.length > 0;
  return true;
}

function keyOf(p) {
  if (nonEmpty(p.post_id)) return `id:${p.post_id}`;
  if (nonEmpty(p.post_url)) return `url:${p.post_url}`;
  return "";
}

function merge(basePosts, incomingPosts) {
  const out = [...basePosts];
  const idx = {};
  for (let i = 0; i < out.length; i++) {
    const k = keyOf(out[i]);
    if (k) idx[k] = i;
  }
  let inserted = 0;
  let updated = 0;
  for (const raw of incomingPosts) {
    const p = { ...raw };
    if (!p.captured_at) p.captured_at = nowIsoUtc();
    let k = keyOf(p) || `generated:${out.length}`;
    if (idx[k] !== undefined) {
      const cur = out[idx[k]];
      for (const [kk, vv] of Object.entries(p)) {
        if (nonEmpty(vv)) cur[kk] = vv;
      }
      cur.captured_at = p.captured_at || nowIsoUtc();
      updated += 1;
    } else {
      out.push(p);
      idx[k] = out.length - 1;
      inserted += 1;
    }
  }
  out.sort((a, b) => String(b.captured_at || "").localeCompare(String(a.captured_at || "")));
  return { posts: out, inserted, updated };
}

function parseArgs(argv) {
  const a = argv.slice(2);
  const o = { base: "", incoming: "", out: "" };
  for (let i = 0; i < a.length; i++) {
    if (a[i] === "--base" && a[i + 1]) o.base = a[++i];
    else if (a[i] === "--incoming" && a[i + 1]) o.incoming = a[++i];
    else if (a[i] === "--out" && a[i + 1]) o.out = a[++i];
  }
  return o;
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.base || !args.incoming || !args.out) {
    console.error("Usage: node merge_posts.mjs --base data/xiaohongshu_posts.json --incoming data/incoming_posts.json --out data/xiaohongshu_posts.json");
    process.exit(1);
  }
  const base = loadPosts(args.base);
  const incoming = loadPosts(args.incoming);
  const { posts, inserted, updated } = merge(base, incoming);
  const payload = {
    meta: {
      updated_at: nowIsoUtc(),
      total_posts: posts.length,
      last_inserted: inserted,
      last_updated: updated,
    },
    posts,
  };
  const outPath = resolveData(args.out);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), "utf-8");
  console.log(JSON.stringify({ inserted, updated, total: posts.length }));
}

main();
