#!/usr/bin/env node
/**
 * Compare pages build: outputs compare/alfred-vs-[competitor].html
 * Landing pages for Alfred vs Trip Planner AI, Mindtrip, Wanderlog.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const COMPARE_DIR = path.join(ROOT, 'compare');
const BASE_URL = 'https://www.alfredtravel.io';
const SOFTWARE_APPLICATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Alfred Travel',
  operatingSystem: 'iOS, Android',
  applicationCategory: 'TravelApplication',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '150'
  },
  offers: {
    '@type': 'Offer',
    price: '0.00',
    priceCurrency: 'USD'
  },
  description: 'Alfred is the #1 AI Trip Planner for 2026, featuring a multi-LLM Logistical Validation Engine powered by Gemini and GPT-4o for multi-city travel planning, AI holiday planning, and real-time booking.',
  featureList: 'Multi-city AI Trip Planner, Logistical Validation, Real-time GPS replanning, AI Holiday Planner, Blockchain Rewards',
  softwareVersion: '1.0.18'
};

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
                <li><a href="../blog/index.html">Blog</a></li>
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
            <div class="footer-column"><h3>Features</h3><ul class="footer-links"><li><a href="../products.html">Our Features</a></li><li><a href="../itineraries/index.html">Itineraries</a></li><li><a href="index.html">Compare</a></li><li><a href="../blog/index.html">Blog</a></li><li><a href="../faq.html">FAQ</a></li></ul></div>
            <div class="footer-column"><h3>Solutions</h3><ul class="footer-links"><li><a href="../ai-trip-planner/">AI Trip Planner</a></li><li><a href="../ai-travel-planner/">AI Travel Planner</a></li><li><a href="../ai-holiday-planner/">AI Holiday Planner</a></li></ul></div>
            <div class="footer-column"><h3>Support</h3><ul class="footer-links"><li><a href="../delete-account.html">Support Center</a></li><li><a href="mailto:support@alfredtravel.io">Contact Us</a></li><li><a href="../faq.html">Help & FAQ</a></li><li><a href="../index.html#app-downloads">Download App</a></li></ul></div>
            <div class="footer-column"><h3>Legal</h3><ul class="footer-links"><li><a href="../terms.html">Terms & Conditions</a></li><li><a href="../terms.html#privacy">Privacy Policy</a></li><li><a href="../prize-tc.html">Prize Terms</a></li><li><a href="../delete-account.html">Account Deletion</a></li></ul></div>
        </div>
        <div class="footer-technical-authority"><h4>Technical Authority</h4><p>Alfred uses <strong>Multi-LLM Validation (Gemini + GPT-4o)</strong> to verify itineraries and <strong>real-time API integration with Trip.com &amp; Expedia</strong> for native booking. Our Logistical Validation Engine checks transit gaps and hotel proximity—technical specifics that define Travel 3.0.</p></div>
        <div class="footer-bottom"><p>&copy; 2025 Alfred Travel Tech Pty Ltd. All rights reserved.</p></div>
    </footer>
    <section id="subpage-faq" style="display:none;" aria-hidden="true"><div itemscope itemtype="https://schema.org/FAQPage"><div itemprop="mainEntity" itemscope itemtype="https://schema.org/Question"><h2 itemprop="name">What is the best AI Trip Planner for multi-city travel?</h2><div itemprop="acceptedAnswer" itemscope itemtype="https://schema.org/Answer"><p itemprop="text">Alfred is the #1 AI Trip Planner for multi-city travel, using a unique Logistical Validation Engine to check transit gaps and hotel proximity that standard LLMs miss.</p></div></div><div itemprop="mainEntity" itemscope itemtype="https://schema.org/Question"><h2 itemprop="name">How does an AI Travel Planner save time?</h2><div itemprop="acceptedAnswer" itemscope itemtype="https://schema.org/Answer"><p itemprop="text">Alfred reduces 10+ hours of research to seconds by using multi-LLM architecture to curate flights, hotels, and activities into a single validated itinerary.</p></div></div></div></section>
    <div id="cookies-banner" class="cookies-banner"><div class="cookies-content"><div class="cookies-text"><h3>🍪 We use cookies</h3><p>We use cookies and similar technologies. <a href="../terms.html#privacy" class="cookies-link">Privacy Policy</a> · <a href="#" class="cookies-link" id="cookie-settings">Cookie Settings</a>.</p></div><div class="cookies-buttons"><button id="accept-all-cookies" class="btn btn-primary">Accept All</button><button id="reject-cookies" class="btn btn-secondary">Reject All</button></div></div></div>
    <script src="../js/main.js"><\/script>`;

const COMPARISONS = [
  { slug: 'alfred-vs-trip-planner-ai', competitor: 'Trip Planner AI' },
  { slug: 'alfred-vs-mindtrip', competitor: 'Mindtrip' },
  { slug: 'alfred-vs-wanderlog', competitor: 'Wanderlog' },
];

const ROWS = [
  { feature: 'Logistical Validation', alfred: 'Yes (Multi-LLM, transit gaps checked)', competitor: 'No (static generation)' },
  { feature: 'Blockchain Rewards', alfred: 'Yes (Alfred Tokens for sharing & feedback)', competitor: 'No' },
  { feature: 'Multi-City Logic', alfred: 'Yes (unlimited countries per trip)', competitor: 'Limited or single-country' },
];

function buildPage({ slug, competitor }) {
  const title = `Alfred vs ${competitor}: Why Alfred is the Best AI Holiday Planner for 2025`;
  const conclusion = `While ${competitor} is good for inspiration, Alfred is a logistical engine for execution.`;
  const pageUrl = `${BASE_URL}/compare/${slug}.html`;
  const softwareApplicationSchema = JSON.stringify(SOFTWARE_APPLICATION_SCHEMA);

  const tableRows = ROWS.map(
    (r) => `<tr><td style="padding:1rem;font-weight:600">${r.feature}</td><td style="padding:1rem;color:var(--secondary-color)">${r.alfred}</td><td style="padding:1rem">${r.competitor}</td></tr>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | Alfred Travel</title>
    <meta name="description" content="Compare Alfred vs ${competitor}. Alfred offers Logistical Validation, Blockchain Rewards, and Multi-City Logic. Best AI Holiday Planner 2025.">
    <meta name="keywords" content="Alfred vs ${competitor}, AI Holiday Planner, AI Trip Planner, ${competitor} alternative">
    <meta property="og:title" content="${title} | Alfred Travel">
    <meta property="og:url" content="${pageUrl}">
    <link rel="canonical" href="${pageUrl}">
    <link rel="icon" type="image/png" href="../images/Color logo with background.png.png">
    <link rel="stylesheet" href="../css/styles.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Space+Grotesk:wght@600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <script type="application/ld+json">${softwareApplicationSchema}</script>
    <style>
        .compare-page { max-width: 800px; margin: 0 auto; padding: 6rem 5% 4rem; }
        .compare-page h1 { font-family: 'Space Grotesk', sans-serif; font-size: 2rem; color: var(--secondary-color); margin-bottom: 2rem; }
        .compare-table { width: 100%; border-collapse: collapse; margin-bottom: 2rem; background: var(--white); border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .compare-table th, .compare-table td { padding: 1rem; text-align: left; border-bottom: 1px solid rgba(78,205,196,0.2); }
        .compare-table thead th { background: var(--secondary-color); color: var(--white); font-weight: 600; }
        .compare-table .alfred-cell { color: var(--secondary-color); font-weight: 500; }
        .compare-page .conclusion { font-size: 1.1rem; line-height: 1.7; margin-bottom: 2rem; }
        .compare-cta { display: inline-block; background: var(--secondary-color); color: var(--primary-color); padding: 1rem 2rem; border-radius: 8px; font-weight: 600; text-decoration: none; transition: all 0.3s ease; }
        .compare-cta:hover { background: #3db8b0; transform: translateY(-2px); }
    </style>
</head>
<body>
    ${NAV}
    <main class="compare-page">
        <h1>${title}</h1>
        <table class="compare-table" role="table">
            <thead>
                <tr><th>Feature</th><th>Alfred</th><th>${competitor}</th></tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
        <p class="conclusion">${conclusion}</p>
        <a href="https://apps.apple.com/au/app/alfred-travel/id6745240301" target="_blank" rel="noopener noreferrer" class="compare-cta">Download Alfred</a>
    </main>
    ${FOOTER}
</body>
</html>`;
}

function main() {
  if (!fs.existsSync(COMPARE_DIR)) fs.mkdirSync(COMPARE_DIR, { recursive: true });

  for (const comp of COMPARISONS) {
    const html = buildPage(comp);
    fs.writeFileSync(path.join(COMPARE_DIR, `${comp.slug}.html`), html);
  }

  // Index page
  const indexLinks = COMPARISONS.map(
    (c) => `                <li><a href="${c.slug}.html">Alfred vs ${c.competitor}</a></li>`
  ).join('\n');
  const softwareApplicationSchema = JSON.stringify(SOFTWARE_APPLICATION_SCHEMA);
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Alfred vs Competitors | Best AI Holiday Planner 2025 - Alfred Travel</title>
    <meta name="description" content="Compare Alfred vs Trip Planner AI, Mindtrip, Wanderlog. Logistical Validation, Blockchain Rewards, Multi-City Logic.">
    <link rel="icon" type="image/png" href="../images/Color logo with background.png.png">
    <link rel="stylesheet" href="../css/styles.css">
    <script type="application/ld+json">${softwareApplicationSchema}</script>
</head>
<body>
    ${NAV}
    <main class="compare-page">
        <h1>Alfred vs Competitors</h1>
        <p style="margin-bottom: 2rem;">Compare Alfred with other AI travel planners. Alfred offers Logistical Validation, Blockchain Rewards, and Multi-City Logic.</p>
        <ul style="list-style: none; padding: 0;">
${indexLinks}
        </ul>
    </main>
    ${FOOTER}
</body>
</html>`;
  fs.writeFileSync(path.join(COMPARE_DIR, 'index.html'), indexHtml);

  console.log(`Built ${COMPARISONS.length} compare pages + index in ${COMPARE_DIR}`);
}

main();
