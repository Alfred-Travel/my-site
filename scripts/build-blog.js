#!/usr/bin/env node
/**
 * Blog build: reads _posts/*.md, outputs blog/index.html and blog/[slug].html
 * Uses gray-matter for frontmatter and marked for markdown-to-HTML (remark/rehype pipeline optional).
 * Injects BlogPosting + BreadcrumbList JSON-LD and "Key Logistical Takeaways" callout.
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const ROOT = path.resolve(__dirname, '..');
const POSTS_DIR = path.join(ROOT, '_posts');
const CONTENT_BLOG_DIR = path.join(ROOT, 'content', 'blog');
const BLOG_DIR = path.join(ROOT, 'blog');
const DESTINATIONS_PATH = path.join(ROOT, 'destinations.json');
const BASE_URL = 'https://www.alfredtravel.io';
const SOFTWARE_APPLICATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Alfred Travel',
  operatingSystem: 'iOS, Android, Web',
  applicationCategory: 'TravelApplication',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '150'
  },
  offers: {
    '@type': 'Offer',
    price: '0.00',
    priceCurrency: 'USD'
  },
  description: 'Alfred is an AI travel planner for validated itineraries, multi-city travel, and booking-ready execution.',
  featureList: 'AI Trip Planner, Validated Multi-City Planning, Booking-Ready Travel Flow, Google Maps Integration, Loyalty Rewards',
  softwareVersion: '1.0.18'
};

// Deterministic "random" date for itinerary before 2026-03-02 (based on destination name)
function itineraryDate(destination) {
  if (destination === 'London') return '2026-03-02';
  const start = new Date('2025-01-01').getTime();
  const end = new Date('2026-03-01').getTime();
  const range = end - start;
  let hash = 0;
  for (let i = 0; i < destination.length; i++) hash = ((hash << 5) - hash) + destination.charCodeAt(i);
  const offset = Math.abs(hash) % range;
  const d = new Date(start + offset);
  return d.toISOString().slice(0, 10);
}

function slugify(name) {
  return name.toLowerCase().replace(/\s+/g, '-');
}

const NAV = `
    <header>
        <nav class="navbar">
            <div class="logo">
                <a href="../index.html"><img src="../images/Color logo with background.png.png" alt="Alfred - The Leading AI Trip Planner and AI Holiday Planner App" class="logo-image" /></a>
            </div>
            <ul class="nav-links">
                <li><a href="../index.html">Home</a></li>
                <li><a href="../about.html">About Us</a></li>
                <li><a href="../products.html">Our Features</a></li>
                <li><a href="index.html" class="nav-blog-active">Blog</a></li>
                <li><a href="../faq.html">FAQ</a></li>
                <li><a href="../faq.html#tutorials">Tutorials</a></li>
                <li><a href="../delete-account.html">Support</a></li>
            </ul>
            <a href="../index.html#app-downloads" class="download-cta" aria-label="Download the AI Holiday Planner">Download App</a>
            <div class="hamburger"><span></span><span></span><span></span></div>
        </nav>
    </header>`;

const FOOTER = `
    <footer>
        <div class="footer-content">
            <div class="footer-column"><h3>Company</h3><ul class="footer-links"><li><a href="../about.html">About Us</a></li><li><a href="../about.html#mission">Our Mission</a></li><li><a href="../about.html#team">Our Team</a></li><li><a href="../index.html#features">Features</a></li></ul></div>
            <div class="footer-column"><h3>Features</h3><ul class="footer-links"><li><a href="../products.html">Our Features</a></li><li><a href="../itineraries/index.html">Itineraries</a></li><li><a href="../compare/index.html">Compare</a></li><li><a href="index.html">Blog</a></li><li><a href="../faq.html">FAQ</a></li></ul></div>
            <div class="footer-column"><h3>Solutions</h3><ul class="footer-links"><li><a href="../ai-trip-planner/index.html">AI Trip Planner</a></li><li><a href="../ai-travel-planner/index.html">AI Travel Planner</a></li><li><a href="../ai-holiday-planner/index.html">AI Holiday Planner</a></li></ul></div>
            <div class="footer-column"><h3>Support</h3><ul class="footer-links"><li><a href="../delete-account.html">Support Center</a></li><li><a href="mailto:support@alfredtravel.io">Contact Us</a></li><li><a href="../faq.html">Help & FAQ</a></li><li><a href="../index.html#app-downloads">Download App</a></li></ul></div>
            <div class="footer-column"><h3>Legal</h3><ul class="footer-links"><li><a href="../terms.html">Terms & Conditions</a></li><li><a href="../terms.html#privacy">Privacy Policy</a></li><li><a href="../prize-tc.html">Prize Terms</a></li><li><a href="../delete-account.html">Account Deletion</a></li></ul></div>
        </div>
        <div class="footer-bottom"><p>&copy; 2026 Alfred Travel Tech Pty Ltd. All rights reserved.</p></div>
    </footer>
    <div id="cookies-banner" class="cookies-banner"><div class="cookies-content"><div class="cookies-text"><h3>🍪 We use cookies</h3><p>We use cookies and similar technologies. <a href="../terms.html#privacy" class="cookies-link">Privacy Policy</a> · <a href="#" class="cookies-link" id="cookie-settings">Cookie Settings</a>.</p></div><div class="cookies-buttons"><button id="accept-all-cookies" class="btn btn-primary">Accept All</button><button id="reject-cookies" class="btn btn-secondary">Reject All</button></div></div></div>
    <script src="../js/main.js"><\/script>`;

function mdToHtml(md) {
  return marked.parse(md, { async: false });
}

function escapeJson(str) {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

function blogPostingSchema(post, slug) {
  const desc = post.data.description || post.data.title;
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.data.title,
    description: desc,
    datePublished: post.data.date || new Date().toISOString().slice(0, 10),
    author: { '@type': 'Person', name: post.data.author || 'Alfred Team' },
    publisher: { '@type': 'Organization', name: 'Alfred Travel Tech Pty Ltd', url: BASE_URL },
    url: `${BASE_URL}/blog/${slug}.html`
  };
}

function faqPageSchema(faqs) {
  if (!faqs || !Array.isArray(faqs) || faqs.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

function breadcrumbSchema(post, slug) {
  const category = post.data.category || 'AI Travel Logistics';
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${BASE_URL}/blog/` },
      { '@type': 'ListItem', position: 3, name: category, item: `${BASE_URL}/blog/?category=${encodeURIComponent(category)}` },
      { '@type': 'ListItem', position: 4, name: post.data.title, item: `${BASE_URL}/blog/${slug}.html` }
    ]
  };
}

function takeawaysHtml(takeaways) {
  if (!takeaways || !Array.isArray(takeaways) || takeaways.length === 0) return '';
  const items = takeaways.map(t => `<li>${escapeHtml(t)}</li>`).join('\n');
  return `<aside class="blog-takeaways-callout" aria-label="Key takeaways">
    <h3 class="blog-takeaways-title">Key takeaways</h3>
    <ul class="blog-takeaways-list">${items}</ul>
  </aside>`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildPost(slug, post, contentHtml) {
  const takeaways = post.data.takeaways || [];
  const schemaBlog = JSON.stringify(blogPostingSchema(post, slug), null, 2);
  const schemaBreadcrumb = JSON.stringify(breadcrumbSchema(post, slug), null, 2);
  const schemaSoftware = JSON.stringify(SOFTWARE_APPLICATION_SCHEMA, null, 2);
  const faqSchemaObj = faqPageSchema(post.data.faqs);
  const schemaFaq = faqSchemaObj ? `\n    <script type="application/ld+json">\n${JSON.stringify(faqSchemaObj)}\n    </script>` : '';
  const keywordsMeta = post.data.keywords
    ? `\n    <meta name="keywords" content="${escapeHtml(post.data.keywords)}">`
    : '';
  const category = post.data.category || 'AI Travel Logistics';

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(post.data.title)} | Alfred Travel Blog</title>
    <meta name="description" content="${escapeHtml(post.data.description || post.data.title)}">${keywordsMeta}
    <link rel="canonical" href="${BASE_URL}/blog/${slug}.html">
    <link rel="icon" type="image/png" href="../images/Color logo with background.png.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <script type="application/ld+json">\n${schemaSoftware}\n    </script>
    <script type="application/ld+json">\n${schemaBlog}\n    </script>
    <script type="application/ld+json">\n${schemaBreadcrumb}\n    </script>${schemaFaq}
</head>
<body class="blog-page">
${NAV}
    <main class="blog-main">
        <article class="blog-article">
            <nav class="blog-breadcrumb" aria-label="Breadcrumb">Home &rarr; <a href="index.html">Blog</a> &rarr; ${escapeHtml(category)} &rarr; <span>${escapeHtml(post.data.title)}</span></nav>
            <header class="blog-article-header">
                <p class="blog-meta"><time datetime="${post.data.date || ''}">${post.data.date || ''}</time> &middot; ${escapeHtml(post.data.author || 'Alfred Team')} &middot; ${escapeHtml(category)}</p>
                <h1 class="blog-article-title">${escapeHtml(post.data.title)}</h1>
            </header>
            ${takeawaysHtml(takeaways)}
            <div class="blog-article-body">${contentHtml}</div>
        </article>
    </main>
${FOOTER}
</body>
</html>`;
}

function buildIndex(posts, destinations) {
  const blogItems = posts.map(p => ({
    date: p.data.date || '',
    title: p.data.title,
    href: `${p.slug}.html`,
    meta: `${escapeHtml(p.data.author || 'Alfred Team')} &middot; ${escapeHtml(p.data.category || 'AI Travel Logistics')}`,
    excerpt: (p.data.description || p.data.title).slice(0, 160)
  }));

  const itineraryItems = (destinations || []).map(name => ({
    date: itineraryDate(name),
    title: `AI Travel Planner for ${name}`,
    href: `../itineraries/${slugify(name)}.html`,
    meta: 'Alfred Team &middot; Destination Itinerary',
    excerpt: `7-day validated itinerary for ${name}. Flight gaps checked, hotel proximity verified, multi-LLM confirmed.`
  }));

  const allItems = [...blogItems, ...itineraryItems]
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .map(item => `<li class="blog-index-item">
        <a href="${item.href}" class="blog-index-link">
          <h2 class="blog-index-title">${escapeHtml(item.title)}</h2>
          <p class="blog-index-meta">${escapeHtml(item.date)} &middot; ${item.meta}</p>
          <p class="blog-index-excerpt">${escapeHtml(item.excerpt)}</p>
        </a>
      </li>`)
    .join('\n');

  const schemaSoftware = JSON.stringify(SOFTWARE_APPLICATION_SCHEMA, null, 2);
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blog | AI Travel Logistics Authority - Alfred Travel</title>
    <meta name="description" content="Alfred Travel Blog: authority content on AI trip planning, itinerary validation, multi-city routing, and booking-ready travel execution.">
    <link rel="canonical" href="${BASE_URL}/blog/">
    <link rel="icon" type="image/png" href="../images/Color logo with background.png.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <script type="application/ld+json">\n${schemaSoftware}\n    </script>
</head>
<body class="blog-page">
${NAV}
    <main class="blog-main">
        <div class="blog-index">
            <header class="blog-index-header">
                <h1 class="blog-index-heading">Blog</h1>
                <p class="blog-index-tagline">#1 authority in AI travel logistics. Cross-border planning, itinerary validation, and the science of trip planning.</p>
                </header>
            <ol class="blog-index-list" start="1">\n${allItems}\n            </ol>
        </div>
    </main>
${FOOTER}
</body>
</html>`;
}

// Run
if (!fs.existsSync(POSTS_DIR)) {
  fs.mkdirSync(POSTS_DIR, { recursive: true });
  console.log('Created _posts/');
}
if (!fs.existsSync(BLOG_DIR)) {
  fs.mkdirSync(BLOG_DIR, { recursive: true });
  console.log('Created blog/');
}

// Collect .md from both _posts and content/blog (content moat)
const postDirs = [POSTS_DIR];
if (fs.existsSync(CONTENT_BLOG_DIR)) postDirs.push(CONTENT_BLOG_DIR);
const allFiles = [];
for (const dir of postDirs) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
  for (const file of files) allFiles.push({ dir, file });
}
const posts = [];
for (const { dir, file } of allFiles) {
  const slug = path.basename(file, '.md');
  const raw = fs.readFileSync(path.join(dir, file), 'utf8');
  const parsed = matter(raw);
  const contentHtml = mdToHtml(parsed.content);
  // Use excerpt as description if description missing (content/blog posts)
  if (!parsed.data.description && parsed.data.excerpt) parsed.data.description = parsed.data.excerpt;
  posts.push({ slug, data: parsed.data, content: parsed.content, contentHtml });
}

// Sort by date desc
posts.sort((a, b) => (b.data.date || '').localeCompare(a.data.date || ''));

for (const p of posts) {
  const outPath = path.join(BLOG_DIR, `${p.slug}.html`);
  fs.writeFileSync(outPath, buildPost(p.slug, p, p.contentHtml), 'utf8');
  console.log('Wrote blog/' + p.slug + '.html');
}

let destinations = [];
if (fs.existsSync(DESTINATIONS_PATH)) {
  destinations = JSON.parse(fs.readFileSync(DESTINATIONS_PATH, 'utf8'));
}
fs.writeFileSync(path.join(BLOG_DIR, 'index.html'), buildIndex(posts, destinations), 'utf8');
console.log('Wrote blog/index.html');

// Build sitemap.xml
const staticUrls = [
  { loc: BASE_URL + '/', changefreq: 'weekly', priority: '1.0' },
  { loc: BASE_URL + '/ai-trip-planner/', changefreq: 'weekly', priority: '0.9' },
  { loc: BASE_URL + '/ai-travel-planner/', changefreq: 'weekly', priority: '0.9' },
  { loc: BASE_URL + '/ai-holiday-planner/', changefreq: 'weekly', priority: '0.9' },
  { loc: BASE_URL + '/about.html', changefreq: 'monthly', priority: '0.9' },
  { loc: BASE_URL + '/products.html', changefreq: 'monthly', priority: '0.9' },
  { loc: BASE_URL + '/road-trip.html', changefreq: 'monthly', priority: '0.9' },
  { loc: BASE_URL + '/faq.html', changefreq: 'monthly', priority: '0.9' },
  { loc: BASE_URL + '/blog/', changefreq: 'daily', priority: '0.9' },
  { loc: BASE_URL + '/terms.html', changefreq: 'monthly', priority: '0.5' },
  { loc: BASE_URL + '/delete-account.html', changefreq: 'monthly', priority: '0.5' },
  { loc: BASE_URL + '/prize-tc.html', changefreq: 'monthly', priority: '0.5' }
];
const blogUrls = posts.map(p => ({
  loc: BASE_URL + '/blog/' + p.slug + '.html',
  lastmod: (p.data.date || '').slice(0, 10) || new Date().toISOString().slice(0, 10),
  changefreq: 'monthly',
  priority: '0.7'
}));
const itineraryUrls = destinations.map(name => ({
  loc: BASE_URL + '/itineraries/' + slugify(name) + '.html',
  changefreq: 'weekly',
  priority: '0.8'
}));
const compareUrls = [
  { loc: BASE_URL + '/compare/', changefreq: 'weekly', priority: '0.7' },
  { loc: BASE_URL + '/compare/alfred-vs-mindtrip.html', changefreq: 'weekly', priority: '0.75' },
];
const extraItineraryUrls = [];
const nextAppUrls = [
  { loc: BASE_URL + '/mindtrip-alternative', changefreq: 'weekly', priority: '0.84' },
];
const sitemapLines = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...staticUrls.map(u => `  <url><loc>${u.loc}</loc><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`),
  ...blogUrls.map(u => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`),
  ...itineraryUrls.map(u => `  <url><loc>${u.loc}</loc><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`),
  ...extraItineraryUrls.map(u => `  <url><loc>${u.loc}</loc><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`),
  ...compareUrls.map(u => `  <url><loc>${u.loc}</loc><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`),
  ...nextAppUrls.map(u => `  <url><loc>${u.loc}</loc><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`),
  '</urlset>'
];
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemapLines.join('\n') + '\n', 'utf8');
console.log('Wrote sitemap.xml');
console.log('Blog build complete.');
