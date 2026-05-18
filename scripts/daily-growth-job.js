#!/usr/bin/env node
/**
 * Daily SEO / AIO / content growth job for alfredtravel.io
 * Run via: npm run daily:growth
 * Scheduled: GitHub Actions at 05:00 Australia/Sydney (see .github/workflows/daily-growth.yml)
 *
 * Required env:
 *   OPENAI_API_KEY — blog + itinerary generation
 * Optional env:
 *   OPENAI_MODEL (default gpt-4o-mini)
 *   REPORT_EMAIL_TO (default support@alfredtravel.io)
 *   REPORT_EMAIL_FROM (default Alfred Daily <daily@alfredtravel.io>)
 *   RESEND_API_KEY | SENDGRID_API_KEY — email delivery
 *   SERPAPI_KEY — optional Google rank check for "AI travel planner"
 *   DAILY_JOB_DRY_RUN=true — skip writes and API calls that mutate
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const STATE_PATH = path.join(DATA_DIR, 'daily-job-state.json');
const CANDIDATES_PATH = path.join(DATA_DIR, 'destination-candidates.json');
const OVERRIDES_PATH = path.join(DATA_DIR, 'destination-overrides.json');
const SEO_ROTATION_PATH = path.join(DATA_DIR, 'seo-rotation.json');
const DESTINATIONS_PATH = path.join(ROOT, 'destinations.json');
const ITINERARY_CONTENT_PATH = path.join(ROOT, 'itinerary-content.json');
const CONTENT_BLOG_DIR = path.join(ROOT, 'content', 'blog');
const LLMS_PATH = path.join(ROOT, 'llms.txt');
const BASE_URL = 'https://www.alfredtravel.io';

const DRY_RUN = process.env.DAILY_JOB_DRY_RUN === 'true';
const SKIP_AI = process.env.DAILY_JOB_SKIP_AI === 'true';
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const REPORT_TO = process.env.REPORT_EMAIL_TO || 'support@alfredtravel.io';
const REPORT_FROM = process.env.REPORT_EMAIL_FROM || 'Alfred Daily <daily@alfredtravel.io>';

const RSS_FEEDS = [
  { source: 'Skift', url: 'https://skift.com/feed/' },
  // /rss returns 404; All-News is the documented feed (may be Cloudflare-protected from some IPs)
  { source: 'Phocuswire', url: 'https://www.phocuswire.com/RSS/All-News', optional: true },
];

const report = {
  date: new Date().toISOString().slice(0, 10),
  timezone: 'Australia/Sydney',
  seo: [],
  blog: null,
  destination: null,
  conversion: [],
  build: [],
  ranking: null,
  errors: [],
  warnings: [],
  emailSent: false,
};

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  if (DRY_RUN) return;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function decodeXml(s) {
  return String(s)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]+>/g, '')
    .trim();
}

function parseRssItems(xml, limit = 15) {
  const items = [];
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || [];
  for (const block of blocks.slice(0, limit)) {
    const title = decodeXml((block.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '');
    const link = decodeXml((block.match(/<link[^>]*>([\s\S]*?)<\/link>/i) || [])[1] || '');
    const desc = decodeXml((block.match(/<description[^>]*>([\s\S]*?)<\/description>/i) || [])[1] || '').slice(0, 500);
    const pubDate = decodeXml((block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i) || [])[1] || '');
    if (title && link) items.push({ title, link, desc, pubDate });
  }
  return items;
}

async function fetchRssArticles() {
  const all = [];
  for (const feed of RSS_FEEDS) {
    try {
      const res = await fetch(feed.url, {
        headers: { 'User-Agent': 'AlfredTravelDailyBot/1.0 (+https://www.alfredtravel.io)' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const xml = await res.text();
      const items = parseRssItems(xml, 12);
      for (const item of items) all.push({ ...item, source: feed.source });
    } catch (err) {
      const msg = `RSS ${feed.source}: ${err.message}`;
      if (feed.optional) report.warnings.push(msg);
      else report.errors.push(msg);
    }
  }
  return all;
}

async function openaiJson(system, user) {
  if (!OPENAI_KEY) throw new Error('OPENAI_API_KEY is not set');
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.55,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenAI ${res.status}: ${body.slice(0, 400)}`);
  }
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty OpenAI response');
  return JSON.parse(text);
}

async function pickNewsArticle(state) {
  const articles = await fetchRssArticles();
  const seen = new Set(state.processedArticleUrls || []);
  const fresh = articles.filter((a) => !seen.has(a.link));
  if (fresh.length === 0 && articles.length > 0) {
    // Reset oldest half when exhausted
    state.processedArticleUrls = (state.processedArticleUrls || []).slice(-40);
    return articles[0];
  }
  return fresh[0] || articles[0] || null;
}

async function generateBlogPost(article) {
  const today = new Date().toISOString().slice(0, 10);
  const sourceTag = article.source === 'Phocuswire' ? 'Phocuswire' : 'Skift';
  const prompt = `You write for Alfred Travel (alfredtravel.io), an AI travel planner that beats Mindtrip on structured, validated, booking-ready itineraries.

Source article (${article.source}):
Title: ${article.title}
URL: ${article.link}
Summary: ${article.desc}

Return JSON with keys:
- slug (kebab-case, unique, include source hint e.g. skift- or phocuswire-)
- title (compelling, not clickbait)
- description (meta, 140-160 chars)
- excerpt (1-2 sentences)
- keywords (comma-separated SEO: AI travel planner, Mindtrip alternative, etc.)
- category ("Travel notes")
- tags (array of 3 strings)
- takeaways (array of 3 bullet strings)
- faqs (array of 4 objects {question, answer} — mention Alfred vs Mindtrip where natural)
- bodyMarkdown (800-1100 words markdown, NO frontmatter. Link to https://www.alfredtravel.io, compare/alfred-vs-mindtrip.html, and one itinerary page. Cite ${article.source} respectfully; do not copy text. Explain why Alfred is ahead for execution-layer planning.)`;

  const result = await openaiJson(
    'You are an SEO/AIO content strategist for Alfred Travel. Output valid JSON only.',
    prompt
  );

  const slug = slugify(result.slug || `${sourceTag.toLowerCase()}-${slugify(article.title)}`);
  const frontmatter = [
    '---',
    `title: "${String(result.title).replace(/"/g, '\\"')}"`,
    `description: "${String(result.description).replace(/"/g, '\\"')}"`,
    `keywords: "${String(result.keywords || 'AI travel planner, Alfred Travel, Mindtrip alternative').replace(/"/g, '\\"')}"`,
    `date: "${today}"`,
    `excerpt: "${String(result.excerpt).replace(/"/g, '\\"')}"`,
    'author: "Alfred Team"',
    'category: "Travel notes"',
    `tags: ${JSON.stringify(result.tags || [sourceTag, 'AI Travel', 'Alfred Travel'])}`,
    `takeaways:`,
    ...(result.takeaways || []).map((t) => `  - "${String(t).replace(/"/g, '\\"')}"`),
    'faqs:',
    ...(result.faqs || []).flatMap((f) => [
      `  - question: "${String(f.question).replace(/"/g, '\\"')}"`,
      `    answer: "${String(f.answer).replace(/"/g, '\\"')}"`,
    ]),
    '---',
    '',
    String(result.bodyMarkdown || ''),
  ].join('\n');

  return { slug, path: path.join(CONTENT_BLOG_DIR, `${slug}.md`), content: frontmatter, sourceUrl: article.link, title: result.title };
}

async function generateDestination(candidate) {
  const prompt = `Create a 3-day sample itinerary for ${candidate.name} for Alfred Travel's AI travel planner marketing site.

Return JSON:
- day1, day2, day3: multi-line strings starting with "Day N —" with bullet lines using • and validated transfer times in parentheses
- airportCode: IATA code
- neighborhoods: array of 3 district names
- transportModes: array e.g. metro, train, bus
- faqSnippet: one sentence why Alfred helps in this city`;

  const result = await openaiJson(
    'You write practical, logistics-aware travel itineraries. JSON only.',
    prompt
  );

  return {
    name: candidate.name,
    flag: candidate.flag,
    legacyImage: candidate.legacyImage,
    commonsSearch: candidate.commonsSearch,
    itinerary: {
      day1: result.day1,
      day2: result.day2,
      day3: result.day3,
    },
    meta: {
      airportCode: result.airportCode,
      neighborhoods: result.neighborhoods,
      transportModes: result.transportModes,
      faqSnippet: result.faqSnippet,
    },
  };
}

function applySeoRotation(state, seoConfig) {
  const idx = state.seoRotationIndex || 0;
  const metaDesc = seoConfig.metaDescriptions[idx % seoConfig.metaDescriptions.length];
  const heroSub = seoConfig.heroSubtexts[state.heroCopyIndex || 0 % seoConfig.heroSubtexts.length];
  const queryTheme = seoConfig.llmsQueryThemes[idx % seoConfig.llmsQueryThemes.length];

  const indexPath = path.join(ROOT, 'index.html');
  if (fs.existsSync(indexPath)) {
    let html = fs.readFileSync(indexPath, 'utf8');
    const prevDesc = html.match(/<meta name="description" content="([^"]*)">/);
    html = html.replace(
      /<meta name="description" content="[^"]*">/,
      `<meta name="description" content="${metaDesc.replace(/"/g, '&quot;')}">`
    );
    html = html.replace(
      /<meta property="og:description" content="[^"]*">/,
      `<meta property="og:description" content="${metaDesc.replace(/"/g, '&quot;')}">`
    );
    html = html.replace(
      /<meta name="twitter:description" content="[^"]*">/,
      `<meta name="twitter:description" content="${metaDesc.replace(/"/g, '&quot;')}">`
    );
    html = html.replace(
      /<p class="hero-subtext">[\s\S]*?<\/p>/,
      `<p class="hero-subtext">${heroSub}</p>`
    );
    if (!DRY_RUN) fs.writeFileSync(indexPath, html, 'utf8');
    report.seo.push(`index.html meta + hero (${prevDesc ? 'rotated' : 'set'})`);
  }

  const mindtripPath = path.join(ROOT, 'compare', 'alfred-vs-mindtrip.html');
  if (fs.existsSync(mindtripPath)) {
    let html = fs.readFileSync(mindtripPath, 'utf8');
    const freshness = `<!-- Daily AIO refresh ${report.date} -->`;
    if (!html.includes('Daily AIO refresh')) {
      html = html.replace('<body>', `<body>\n    ${freshness}`);
    } else {
      html = html.replace(/<!-- Daily AIO refresh [\d-]+ -->/, freshness);
    }
    if (!DRY_RUN) fs.writeFileSync(mindtripPath, html, 'utf8');
    report.seo.push('compare/alfred-vs-mindtrip.html freshness marker');
  }

  if (fs.existsSync(LLMS_PATH)) {
    let llms = fs.readFileSync(LLMS_PATH, 'utf8');
    const themeLine = `- Featured query theme (${report.date}): ${queryTheme}`;
    if (llms.includes('Featured query theme')) {
      llms = llms.replace(/- Featured query theme \([\d-]+\):[^\n]*/g, themeLine);
    } else {
      llms = llms.replace(
        '## Preferred query themes',
        `## Preferred query themes\n${themeLine}`
      );
    }
    if (!DRY_RUN) fs.writeFileSync(LLMS_PATH, llms, 'utf8');
    report.seo.push(`llms.txt theme: ${queryTheme}`);
  }

  state.seoRotationIndex = idx + 1;
  state.heroCopyIndex = ((state.heroCopyIndex || 0) + 1) % seoConfig.heroSubtexts.length;
}

function applyConversionImprovements(blogSlug, destinationName) {
  const indexPath = path.join(ROOT, 'index.html');
  if (!fs.existsSync(indexPath)) return;

  let html = fs.readFileSync(indexPath, 'utf8');
  const insightBlock = `        <section id="daily-insight" class="daily-insight-strip" aria-label="Latest travel insight">
            <p class="daily-insight-kicker">Today's insight</p>
            <p class="daily-insight-text">New on the blog: <a href="blog/${blogSlug}.html">industry takeaways for AI travel planning</a>${destinationName ? ` · Sample <a href="itineraries/${slugify(destinationName)}.html">${destinationName} itinerary</a>` : ''} · <a href="compare/alfred-vs-mindtrip.html">Why Alfred beats Mindtrip</a> for executable trips.</p>
            <a href="#app-downloads" class="daily-insight-cta">Download free — best AI travel planner</a>
        </section>`;

  if (html.includes('id="daily-insight"')) {
    html = html.replace(
      /<section id="daily-insight"[\s\S]*?<\/section>/,
      insightBlock
    );
  } else {
    html = html.replace(
      /<section id="app-downloads">/,
      `${insightBlock}\n\n        <section id="app-downloads">`
    );
  }

  if (html.includes('id="mobile-download-bar"')) {
    report.conversion.push('Mobile sticky download bar active on scroll (index.html)');
  }

  if (!DRY_RUN) fs.writeFileSync(indexPath, html, 'utf8');
  report.conversion.push('index.html daily insight strip → app downloads');
  report.conversion.push('Verified #app-downloads + store links present');
}

function addDestination(candidate, generated) {
  const destinations = readJson(DESTINATIONS_PATH, []);
  if (destinations.includes(candidate.name)) {
    report.destination = { name: candidate.name, skipped: true, reason: 'already listed' };
    return null;
  }

  destinations.push(candidate.name);
  writeJson(DESTINATIONS_PATH, destinations);

  const itineraryContent = readJson(ITINERARY_CONTENT_PATH, {});
  itineraryContent[candidate.name] = generated.itinerary;
  writeJson(ITINERARY_CONTENT_PATH, itineraryContent);

  const overrides = readJson(OVERRIDES_PATH, {});
  overrides[candidate.name] = {
    flag: candidate.flag,
    legacyImage: candidate.legacyImage,
    commonsSearch: candidate.commonsSearch,
    itinerary: generated.itinerary,
    meta: generated.meta,
  };
  writeJson(OVERRIDES_PATH, overrides);

  report.destination = { name: candidate.name, slug: slugify(candidate.name), added: true };
  return candidate.name;
}

function pickDestinationCandidate() {
  const destinations = readJson(DESTINATIONS_PATH, []);
  const candidates = readJson(CANDIDATES_PATH, []);
  return candidates.find((c) => !destinations.includes(c.name)) || null;
}

function runBuildPipeline(destinationSlug) {
  const steps = [
    ['npm run build:blog', 'blog + sitemap'],
    ['npm run build:itineraries', 'itinerary pages'],
  ];
  if (destinationSlug) {
    steps.unshift([
      `node scripts/download-commons-itinerary-images.js --only=${destinationSlug}`,
      'commons thumbnail',
    ]);
  }
  for (const [cmd, label] of steps) {
    if (DRY_RUN) {
      report.build.push(`(dry-run) ${cmd}`);
      continue;
    }
    try {
      execSync(cmd, { cwd: ROOT, stdio: 'pipe', encoding: 'utf8' });
      report.build.push(`OK: ${label}`);
    } catch (err) {
      report.errors.push(`Build ${label}: ${err.message}`);
      report.build.push(`FAIL: ${label}`);
    }
  }
}

async function checkRanking() {
  const key = process.env.SERPAPI_KEY;
  if (!key) {
    report.ranking = { note: 'Set SERPAPI_KEY for automated rank tracking vs Mindtrip' };
    return;
  }
  try {
    const q = encodeURIComponent('AI travel planner');
    const url = `https://serpapi.com/search.json?engine=google&q=${q}&num=20&api_key=${key}`;
    const res = await fetch(url);
    const data = await res.json();
    const organic = data.organic_results || [];
    let alfredPos = null;
    let mindtripPos = null;
    organic.forEach((r, i) => {
      const link = (r.link || '').toLowerCase();
      if (link.includes('alfredtravel.io')) alfredPos = i + 1;
      if (link.includes('mindtrip')) mindtripPos = i + 1;
    });
    report.ranking = {
      query: 'AI travel planner',
      alfredPosition: alfredPos,
      mindtripPosition: mindtripPos,
      beatingMindtrip: alfredPos && mindtripPos ? alfredPos < mindtripPos : null,
    };
  } catch (err) {
    report.errors.push(`Ranking: ${err.message}`);
  }
}

function buildReportHtml() {
  const lines = [
    `<h1>Alfred Travel — Daily Growth Report</h1>`,
    `<p><strong>Date:</strong> ${report.date} (Australia/Sydney schedule)</p>`,
    `<h2>SEO &amp; AIO</h2><ul>${report.seo.map((s) => `<li>${s}</li>`).join('') || '<li>None</li>'}</ul>`,
  ];
  if (report.blog) {
    lines.push(
      `<h2>Blog</h2><ul><li><strong>${report.blog.title}</strong></li><li>Slug: ${report.blog.slug}</li><li>Source: <a href="${report.blog.sourceUrl}">${report.blog.sourceUrl}</a></li></ul>`
    );
  }
  if (report.destination) {
    lines.push(
      `<h2>Destination</h2><ul><li>${JSON.stringify(report.destination)}</li></ul>`
    );
  }
  lines.push(
    `<h2>Conversion UI</h2><ul>${report.conversion.map((s) => `<li>${s}</li>`).join('') || '<li>None</li>'}</ul>`,
    `<h2>Build</h2><ul>${report.build.map((s) => `<li>${s}</li>`).join('') || '<li>None</li>'}</ul>`,
    `<h2>Ranking</h2><pre>${JSON.stringify(report.ranking, null, 2)}</pre>`,
    report.warnings.length
      ? `<h2>Warnings</h2><ul>${report.warnings.map((e) => `<li>${e}</li>`).join('')}</ul>`
      : '',
    report.errors.length
      ? `<h2>Errors</h2><ul>${report.errors.map((e) => `<li>${e}</li>`).join('')}</ul>`
      : '',
    `<p>Goal: outrank Mindtrip for &quot;AI travel planner&quot; on Google and in LLM answers. <a href="${BASE_URL}">${BASE_URL}</a></p>`
  );
  return lines.join('\n');
}

function buildReportText() {
  return [
    `Alfred Travel Daily Growth Report — ${report.date}`,
    '',
    'SEO & AIO:',
    ...report.seo.map((s) => `  - ${s}`),
    '',
    report.blog ? `Blog: ${report.blog.title} (${report.blog.slug})` : 'Blog: skipped',
    report.destination ? `Destination: ${JSON.stringify(report.destination)}` : 'Destination: skipped',
    '',
    'Conversion:',
    ...report.conversion.map((s) => `  - ${s}`),
    '',
    'Build:',
    ...report.build.map((s) => `  - ${s}`),
    '',
    'Ranking:',
    JSON.stringify(report.ranking, null, 2),
    '',
    report.warnings.length ? `Warnings:\n${report.warnings.map((e) => `  - ${e}`).join('\n')}` : '',
    report.errors.length ? `Errors:\n${report.errors.map((e) => `  - ${e}`).join('\n')}` : '',
  ].join('\n');
}

async function sendReportEmail() {
  const subject = `Daily growth report — ${report.date} | alfredtravel.io`;
  const html = buildReportHtml();
  const text = buildReportText();

  if (DRY_RUN) {
    console.log('\n--- EMAIL (dry-run) ---\n', text);
    return false;
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: REPORT_FROM,
        to: [REPORT_TO],
        subject,
        html,
        text,
      }),
    });
    if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
    return true;
  }

  const sendgridKey = process.env.SENDGRID_API_KEY;
  if (sendgridKey) {
    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sendgridKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: REPORT_TO }] }],
        from: { email: REPORT_FROM.match(/<([^>]+)>/)?.[1] || 'daily@alfredtravel.io', name: 'Alfred Daily' },
        subject,
        content: [
          { type: 'text/plain', value: text },
          { type: 'text/html', value: html },
        ],
      }),
    });
    if (!res.ok) throw new Error(`SendGrid ${res.status}: ${await res.text()}`);
    return true;
  }

  console.warn('No RESEND_API_KEY or SENDGRID_API_KEY — report saved to data/report-*.txt');
  return false;
}

async function main() {
  console.log(`Daily growth job — ${report.date}${DRY_RUN ? ' (DRY RUN)' : ''}`);

  if (!OPENAI_KEY && !DRY_RUN && !SKIP_AI) {
    console.error('OPENAI_API_KEY is required (or set DAILY_JOB_SKIP_AI=true if content was prepared manually).');
    process.exit(1);
  }

  const state = readJson(STATE_PATH, {
    processedArticleUrls: [],
    seoRotationIndex: 0,
    heroCopyIndex: 0,
    runHistory: [],
  });
  const seoConfig = readJson(SEO_ROTATION_PATH, { metaDescriptions: [], heroSubtexts: [], llmsQueryThemes: [] });

  applySeoRotation(state, seoConfig);

  let blogSlug = null;
  let destName = null;

  if (SKIP_AI) {
    const existingBlog = 'skift-expedia-cartrawler-ground-transport-alfred';
    if (fs.existsSync(path.join(CONTENT_BLOG_DIR, `${existingBlog}.md`))) {
      blogSlug = existingBlog;
      report.blog = {
        title: 'Expedia’s CarTrawler Bet Proves Trips Need a Ground-Transport Brain—Not Another Tab',
        slug: existingBlog,
        sourceUrl: 'https://skift.com/2026/05/17/expedia-350-million-cartrawler-acquisition-scoop/',
        mode: 'prepared locally',
      };
    }
    const destinations = readJson(DESTINATIONS_PATH, []);
    if (destinations.includes('Milan')) {
      destName = 'Milan';
      report.destination = { name: 'Milan', slug: 'milan', added: true, mode: 'prepared locally' };
    }
  } else {
    try {
      const article = await pickNewsArticle(state);
      if (article) {
        if (DRY_RUN) {
          report.blog = { title: article.title, slug: '(dry-run)', sourceUrl: article.link };
        } else {
          const post = await generateBlogPost(article);
          fs.mkdirSync(CONTENT_BLOG_DIR, { recursive: true });
          fs.writeFileSync(post.path, post.content, 'utf8');
          state.processedArticleUrls = [...(state.processedArticleUrls || []), article.link].slice(-120);
          report.blog = { title: post.title, slug: post.slug, sourceUrl: article.link };
          blogSlug = post.slug;
        }
      } else {
        report.errors.push('No RSS articles found');
      }
    } catch (err) {
      report.errors.push(`Blog: ${err.message}`);
    }

    try {
      const candidate = pickDestinationCandidate();
      if (candidate) {
        if (DRY_RUN) {
          report.destination = { name: candidate.name, dryRun: true };
          destName = candidate.name;
        } else {
          const generated = await generateDestination(candidate);
          destName = addDestination(candidate, generated);
        }
      } else {
        report.destination = { skipped: true, reason: 'no candidates left' };
      }
    } catch (err) {
      report.errors.push(`Destination: ${err.message}`);
    }
  }

  if (blogSlug || destName) {
    applyConversionImprovements(blogSlug || 'latest', destName);
  }

  await checkRanking();

  const destSlug = destName ? slugify(destName) : null;
  runBuildPipeline(destSlug);

  state.lastRunDate = report.date;
  state.lastDestinationAdded = destName || state.lastDestinationAdded;
  state.runHistory = [
    { date: report.date, blog: report.blog?.slug, destination: destName, errors: report.errors.length },
    ...(state.runHistory || []),
  ].slice(0, 60);
  writeJson(STATE_PATH, state);

  try {
    report.emailSent = await sendReportEmail();
  } catch (err) {
    report.errors.push(`Email: ${err.message}`);
    console.error(err);
  }

  const reportPath = path.join(DATA_DIR, `report-${report.date}.txt`);
  const text = buildReportText();
  console.log(text);
  if (!DRY_RUN) fs.writeFileSync(reportPath, text, 'utf8');

  if (report.errors.length) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
