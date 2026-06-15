#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { resolveData } from "./lib/paths.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_PATH = path.join(__dirname, "report_template.html");

function parseArgs(argv) {
  const a = argv.slice(2);
  const o = { input: "", output: "" };
  for (let i = 0; i < a.length; i++) {
    if (a[i] === "--input" && a[i + 1]) o.input = a[++i];
    else if (a[i] === "--output" && a[i + 1]) o.output = a[++i];
  }
  return o;
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.input || !args.output) {
    console.error("Usage: node render_html.mjs --input data/xiaohongshu_posts.json --output data/xiaohongshu_posts.html");
    process.exit(1);
  }
  let data = { meta: { updated_at: "" }, posts: [] };
  const inPath = resolveData(args.input);
  if (fs.existsSync(inPath)) {
    try {
      data = JSON.parse(fs.readFileSync(inPath, "utf-8"));
    } catch {
      /* keep default */
    }
  }
  const tpl = fs.readFileSync(TEMPLATE_PATH, "utf-8");
  const dataJson = JSON.stringify(data);
  const content = tpl.replace("__DATA__", dataJson);
  const outPath = resolveData(args.output);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, content, "utf-8");
  console.log(`Report generated: ${outPath}`);
}

main();
