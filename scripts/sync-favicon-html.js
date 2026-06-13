#!/usr/bin/env node
/**
 * Standardize favicon links across static HTML to Alfred logo emblem assets.
 */

const fs = require('fs');
const path = require('path');
const { ensureFaviconInHtml } = require('./favicon-head');
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
  const rel = path.relative(ROOT, file);
  if (rel.startsWith('src' + path.sep)) continue;

  const html = fs.readFileSync(file, 'utf8');
  const prefix = detectCssPrefix(html) || (rel.includes(path.sep) ? '../'.repeat(rel.split(path.sep).length - 1) : '');
  const next = ensureFaviconInHtml(html, prefix);
  if (next !== html) {
    fs.writeFileSync(file, next);
    updated += 1;
  }
}

console.log(`Updated favicon on ${updated} HTML files.`);
