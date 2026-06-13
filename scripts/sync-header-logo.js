#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { ensureHeaderLogoInHtml } = require('./header-logo');
const { detectCssPrefix } = require('./typography-head');

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
  const rel = path.relative(ROOT, file);
  const html = fs.readFileSync(file, 'utf8');
  if (!html.includes('tai-header-logo')) continue;
  const prefix = detectCssPrefix(html) || (rel.includes(path.sep) ? '../'.repeat(rel.split(path.sep).length - 1) : '');
  const next = ensureHeaderLogoInHtml(html, prefix);
  if (next !== html) {
    fs.writeFileSync(file, next);
    updated += 1;
  }
}

console.log(`Updated header logo on ${updated} HTML files.`);
