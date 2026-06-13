#!/usr/bin/env node
/**
 * Replace Inter Google Fonts links with typography.css across static HTML.
 */

const fs = require('fs');
const path = require('path');
const { ensureTypographyInHtml, detectCssPrefix } = require('./typography-head');

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

  let html = fs.readFileSync(file, 'utf8');
  const needsTokens = !html.includes('tokens.css');
  const needsTypo = !html.includes('css/typography.css');
  if (!html.includes('Inter') && !needsTokens && !needsTypo) continue;

  const prefix = detectCssPrefix(html) || (rel.includes(path.sep) ? '../'.repeat(rel.split(path.sep).length - 1) : '');
  const next = ensureTypographyInHtml(html, prefix);
  if (next !== html) {
    fs.writeFileSync(file, next);
    updated += 1;
  }
}

console.log(`Updated ${updated} HTML files with typography.css.`);
