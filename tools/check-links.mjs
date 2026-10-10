#!/usr/bin/env node
/**
 * Link & asset checker for the static site in public/. No dependencies.
 *
 *   node tools/check-links.mjs
 *
 * Checks, for every .html and .css file under public/:
 *   - every local href / src / srcset / poster / url() target exists (CASE-SENSITIVE, like Firebase Hosting)
 *   - every #fragment points at an id that exists in the target page
 * Also reports assets under public/assets that nothing references (orphans) and exits 1 on any broken link.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUB = path.join(ROOT, "public");

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);

const files = walk(PUB);
const sources = files.filter((f) => /\.(html|css)$/i.test(f));
const toRel = (f) => path.relative(PUB, f).split(path.sep).join("/");

// exact-case existence check (fs.existsSync is case-insensitive on Windows/macOS)
function existsExact(abs) {
  const rel = path.relative(PUB, abs);
  if (rel.startsWith("..")) return false;
  let cur = PUB;
  for (const part of rel.split(path.sep).filter(Boolean)) {
    let names;
    try { names = fs.readdirSync(cur); } catch { return false; }
    if (!names.includes(part)) return false;
    cur = path.join(cur, part);
  }
  return true;
}

const idCache = new Map();
function idsOf(file) {
  if (!idCache.has(file)) {
    const t = fs.readFileSync(file, "utf8");
    idCache.set(file, new Set([...t.matchAll(/\bid=["']([^"']+)["']/g)].map((m) => m[1])));
  }
  return idCache.get(file);
}

const referenced = new Set();
const problems = [];

function resolve(fromFile, url) {
  let u = url.trim();
  if (!u || /^(https?:|\/\/|mailto:|tel:|data:|javascript:|#)/i.test(u)) return null;
  const [pathPart, ...hashParts] = u.split("#");
  const hash = hashParts.join("#");
  const clean = pathPart.split("?")[0];
  if (!clean) return { abs: fromFile, hash };
  const decoded = decodeURIComponent(clean);
  let abs = decoded.startsWith("/") ? path.join(PUB, decoded) : path.resolve(path.dirname(fromFile), decoded);
  if (decoded.endsWith("/") || (fs.existsSync(abs) && fs.statSync(abs).isDirectory())) abs = path.join(abs, "index.html");
  return { abs, hash };
}

for (const f of sources) {
  let t = fs.readFileSync(f, "utf8");
  const isHtml = /\.html$/i.test(f);
  if (isHtml) t = t.replace(/<!--[\s\S]*?-->/g, ""); // ignore commented-out markup
  const urls = [];
  if (isHtml) {
    for (const m of t.matchAll(/\b(?:href|src|poster|action)=["']([^"']*)["']/gi)) urls.push(m[1]);
    for (const m of t.matchAll(/\bsrcset=["']([^"']*)["']/gi)) m[1].split(",").forEach((s) => urls.push(s.trim().split(/\s+/)[0]));
    for (const m of t.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) urls.push(m[1]);
  } else {
    for (const m of t.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) urls.push(m[1]);
  }
  for (const url of urls) {
    if (url.includes("${")) continue; // JS template strings are checked via their data, see below
    const r = resolve(f, url);
    if (!r) continue;
    if (!existsExact(r.abs)) { problems.push(`${toRel(f)}: missing  ${url}`); continue; }
    referenced.add(r.abs);
    if (r.hash && /\.html$/i.test(r.abs) && !idsOf(r.abs).has(r.hash))
      problems.push(`${toRel(f)}: no #${r.hash} in ${toRel(r.abs)}  (${url})`);
  }
}

// assets referenced from JS (the AI tools + project data live in assets/js/pages/*.js)
for (const f of files.filter((x) => /\.js$/i.test(x))) {
  const t = fs.readFileSync(f, "utf8");
  for (const m of t.matchAll(/["'`](\/assets\/[^"'`$]+?\.(?:png|jpe?g|gif|svg|webp|pdf|ico))["'`]/gi)) {
    const abs = path.join(PUB, m[1]);
    if (!existsExact(abs)) problems.push(`${toRel(f)}: missing  ${m[1]}`); else referenced.add(abs);
  }
}
// ai.js builds logo paths from a directory prefix + a file name: check those names too
const aiJs = path.join(PUB, "assets/js/pages/ai.js");
if (fs.existsSync(aiJs)) {
  const t = fs.readFileSync(aiJs, "utf8");
  for (const m of t.matchAll(/\[\s*'[^']+'\s*,\s*'([\w.-]+\.(?:png|jpe?g|svg))'/g)) {
    const abs = path.join(PUB, "assets/img/logos/ai", m[1]);
    if (!existsExact(abs)) problems.push(`assets/js/pages/ai.js: missing  /assets/img/logos/ai/${m[1]}`); else referenced.add(abs);
  }
}

const orphans = files
  .filter((f) => toRel(f).startsWith("assets/") && !/\.(css|js)$/i.test(f) && !referenced.has(f))
  .map(toRel);

console.log(`checked ${sources.length} html/css files, ${referenced.size} distinct local targets`);
if (orphans.length) console.log(`\nunreferenced assets (${orphans.length}):\n  ` + orphans.join("\n  "));
if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n  ` + problems.join("\n  "));
  process.exit(1);
}
console.log("\nno broken links or missing assets");
