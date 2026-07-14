#!/usr/bin/env node
/**
 * Replace legacy white navbar headers with the TravelAI header shell.
 */
const fs = require('fs');
const path = require('path');
const { replaceLegacyHeader } = require('./travelai-header');

const ROOT = path.resolve(__dirname, '..');
const SKIP = new Set(['node_modules', '.git', '.next', 'dist']);

const TARGETS = [
  { file: 'road-trip.html', homeCssHref: 'css/home.css', logoHref: 'index.html', assetPrefix: '', downloadHref: 'index.html#app-downloads' },
];

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

for (const rel of TARGETS) {
  const file = path.join(ROOT, rel.file);
  if (!fs.existsSync(file)) continue;
  const html = fs.readFileSync(file, 'utf8');
  const next = replaceLegacyHeader(html, rel);
  if (next !== html) {
    fs.writeFileSync(file, next);
    updated += 1;
    console.log(`Updated ${rel.file}`);
  }
}

for (const file of walk(ROOT)) {
  if (file.includes(`${path.sep}src${path.sep}`)) continue;
  const rel = path.relative(ROOT, file);
  if (TARGETS.some((t) => t.file === rel)) continue;
  const html = fs.readFileSync(file, 'utf8');
  if (html.includes('tai-header') || !html.includes('download-cta')) continue;
  if (!html.includes('<header')) continue;

  const depth = rel.split(path.sep).length - 1;
  const prefix = depth ? '../'.repeat(depth).slice(0, -1) : '';
  const homeCssHref = `${prefix ? `${prefix}/` : ''}css/home.css`;
  const next = replaceLegacyHeader(html, {
    homeCssHref,
    logoHref: `${prefix ? `${prefix}/` : ''}index.html`,
    assetPrefix: prefix,
    downloadHref: `${prefix ? `${prefix}/` : ''}index.html#app-downloads`,
  });
  if (next !== html) {
    fs.writeFileSync(file, next);
    updated += 1;
    console.log(`Updated ${rel}`);
  }
}

console.log(`Synced TravelAI header on ${updated} HTML files.`);
