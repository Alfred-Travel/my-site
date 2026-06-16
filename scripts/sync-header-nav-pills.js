#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { ensureNavPillsInHtml } = require('./header-nav-pills');

const ROOT = path.resolve(__dirname, '..');
const SKIP = new Set(['node_modules', '.git', '.next', 'dist']);

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, files);
    else if (name.endsWith('.html')) files.push(full);
  }
  return files;
}

let updated = 0;
for (const file of walk(ROOT)) {
  if (file.includes(`${path.sep}src${path.sep}`)) continue;
  const html = fs.readFileSync(file, 'utf8');
  if (!html.includes('tai-nav-pill')) continue;
  const next = ensureNavPillsInHtml(html);
  if (next !== html) {
    fs.writeFileSync(file, next);
    updated += 1;
  }
}

console.log(`Updated header nav pills on ${updated} HTML files.`);
