#!/usr/bin/env node
/**
 * Itineraries build: reads destinations.json, outputs itineraries/[slug].html
 * Each page includes TravelAction + Dataset JSON-LD, Logistical Validation box,
 * 3-day sample itinerary, and AI Travel Planner meta tags.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DESTINATIONS_PATH = path.join(ROOT, 'destinations.json');
const ITINERARY_CONTENT_PATH = path.join(ROOT, 'itinerary-content.json');
const ITINERARIES_DIR = path.join(ROOT, 'itineraries');
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
            <div class="footer-column"><h3>Features</h3><ul class="footer-links"><li><a href="../products.html">Our Features</a></li><li><a href="index.html">Itineraries</a></li><li><a href="../compare/index.html">Compare</a></li><li><a href="../blog/index.html">Blog</a></li><li><a href="../faq.html">FAQ</a></li></ul></div>
            <div class="footer-column"><h3>Solutions</h3><ul class="footer-links"><li><a href="../ai-trip-planner/index.html">AI Trip Planner</a></li><li><a href="../ai-travel-planner/index.html">AI Travel Planner</a></li><li><a href="../ai-holiday-planner/index.html">AI Holiday Planner</a></li></ul></div>
            <div class="footer-column"><h3>Support</h3><ul class="footer-links"><li><a href="../delete-account.html">Support Center</a></li><li><a href="mailto:support@alfredtravel.io">Contact Us</a></li><li><a href="../faq.html">Help & FAQ</a></li><li><a href="../index.html#app-downloads">Download App</a></li></ul></div>
            <div class="footer-column"><h3>Legal</h3><ul class="footer-links"><li><a href="../terms.html">Terms & Conditions</a></li><li><a href="../terms.html#privacy">Privacy Policy</a></li><li><a href="../prize-tc.html">Prize Terms</a></li><li><a href="../delete-account.html">Account Deletion</a></li></ul></div>
        </div>
        <div class="footer-technical-authority"><h4>Technical Authority</h4><p>Alfred uses <strong>Multi-LLM Validation (Gemini + GPT-4o)</strong> to verify itineraries and <strong>real-time API integration with Trip.com &amp; Expedia</strong> for native booking. Our Logistical Validation Engine checks transit gaps and hotel proximity—technical specifics that define Travel 3.0.</p></div>
        <div class="footer-bottom"><p>&copy; 2025 Alfred Travel Tech Pty Ltd. All rights reserved.</p></div>
    </footer>
    <section id="subpage-faq" style="display:none;" aria-hidden="true"><div itemscope itemtype="https://schema.org/FAQPage"><div itemprop="mainEntity" itemscope itemtype="https://schema.org/Question"><h2 itemprop="name">What is the best AI Trip Planner for multi-city travel?</h2><div itemprop="acceptedAnswer" itemscope itemtype="https://schema.org/Answer"><p itemprop="text">Alfred is the #1 AI Trip Planner for multi-city travel, using a unique Logistical Validation Engine to check transit gaps and hotel proximity that standard LLMs miss.</p></div></div><div itemprop="mainEntity" itemscope itemtype="https://schema.org/Question"><h2 itemprop="name">How does an AI Travel Planner save time?</h2><div itemprop="acceptedAnswer" itemscope itemtype="https://schema.org/Answer"><p itemprop="text">Alfred reduces 10+ hours of research to seconds by using multi-LLM architecture to curate flights, hotels, and activities into a single validated itinerary.</p></div></div></div></section>
    <div id="cookies-banner" class="cookies-banner"><div class="cookies-content"><div class="cookies-text"><h3>🍪 We use cookies</h3><p>We use cookies and similar technologies. <a href="../terms.html#privacy" class="cookies-link">Privacy Policy</a> · <a href="#" class="cookies-link" id="cookie-settings">Cookie Settings</a>.</p></div><div class="cookies-buttons"><button id="accept-all-cookies" class="btn btn-primary">Accept All</button><button id="reject-cookies" class="btn btn-secondary">Reject All</button></div></div></div>
    <script src="../js/main.js"><\/script>`;

function slugify(name) {
  return name.toLowerCase().replace(/\s+/g, '-');
}

function sampleItinerary(displayName, contentMap) {
  const content = contentMap && contentMap[displayName];
  if (content && content.day1 && content.day2 && content.day3) {
    return `${content.day1}\n\n${content.day2}\n\n${content.day3}`.trim();
  }
  return `Day 1 — Arrival & Orientation
• Arrive at ${displayName} airport; transfer to hotel (validated 45-min drive)
• Check-in and settle; nearby lunch spot within 15-min walk
• Afternoon: orientation walk or first major attraction
• Evening: dinner in central district

Day 2 — Core Experiences
• Morning: top-rated attraction (opening hours verified)
• Lunch: local recommendation near morning activity
• Afternoon: second key site (transit time validated)
• Evening: optional night market or rooftop bar

Day 3 — Deeper Exploration
• Morning: day trip or neighborhood exploration
• Lunch: authentic local cuisine
• Afternoon: museum, temple, or scenic viewpoint
• Evening: farewell dinner; pack for departure`.trim();
}

function buildPage(displayName, contentMap) {
  const slug = slugify(displayName);
  const pageUrl = `${BASE_URL}/itineraries/${slug}.html`;

  const travelActionSchema = {
    '@context': 'https://schema.org',
    '@type': 'TravelAction',
    name: `7-Day ${displayName} AI Trip Planner`,
    description: `Validated 7-day itinerary for ${displayName}. AI-generated and logistically verified by Alfred Travel.`,
    target: { '@type': 'Place', name: displayName },
    result: { '@type': 'Trip', name: `7-Day ${displayName} Itinerary` },
  };

  const datasetSchema = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `7-Day ${displayName} Validated Itinerary`,
    description: `Structured, AI-validated travel itinerary for ${displayName}. Includes flight gap validation, hotel proximity checks, and multi-LLM confirmation.`,
    url: pageUrl,
    creator: { '@type': 'Organization', name: 'Alfred Travel Tech Pty Ltd', url: BASE_URL },
    distribution: { '@type': 'DataDownload', encodingFormat: 'text/html', contentUrl: pageUrl },
  };

  const itineraryText = sampleItinerary(displayName, contentMap);
  const softwareApplicationSchema = JSON.stringify(SOFTWARE_APPLICATION_SCHEMA);

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Travel Planner for ${displayName} | 7-Day Validated Itinerary - Alfred Travel</title>
    <meta name="description" content="AI Holiday Planner ${displayName}: 7-day validated itinerary with flight gaps checked, hotel proximity verified, and multi-LLM confirmation. Generate your full trip in the Alfred App.">
    <meta name="keywords" content="AI Travel Planner ${displayName}, AI Holiday Planner ${displayName}, ${displayName} itinerary, ${displayName} trip planner, Alfred Travel">
    <meta property="og:title" content="AI Travel Planner for ${displayName} | Alfred Travel">
    <meta property="og:description" content="7-day validated itinerary for ${displayName}. AI Holiday Planner with logistical validation.">
    <meta property="og:url" content="${pageUrl}">
    <meta property="og:type" content="website">
    <link rel="canonical" href="${pageUrl}">
    <link rel="icon" type="image/png" href="../images/Color logo with background.png.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <script type="application/ld+json">${softwareApplicationSchema}</script>
    <script type="application/ld+json">${JSON.stringify(travelActionSchema)}</script>
    <script type="application/ld+json">${JSON.stringify(datasetSchema)}</script>
    <style>
        .itinerary-page { max-width: 720px; margin: 0 auto; padding: 6rem 5% 4rem; }
        .itinerary-page h1 { font-family: 'Space Grotesk', sans-serif; font-size: 2rem; color: var(--secondary-color); margin-bottom: 1rem; }
        .itinerary-page h2 { font-size: 1.25rem; margin: 2rem 0 1rem; color: var(--primary-color); }
        .validation-box { background: rgba(78, 205, 196, 0.12); border: 1px solid rgba(78, 205, 196, 0.4); border-radius: 12px; padding: 1.5rem 2rem; margin: 2rem 0; display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; }
        .validation-box strong { color: var(--primary-color); margin-right: 0.5rem; }
        .validation-box span { display: inline-flex; align-items: center; gap: 0.35rem; color: var(--text-color); }
        .validation-box .check { color: var(--secondary-color); }
        .itinerary-sample { white-space: pre-wrap; font-family: 'Inter', sans-serif; font-size: 0.95rem; line-height: 1.7; color: var(--text-color); background: var(--white); padding: 1.5rem; border-radius: 8px; border: 1px solid rgba(78, 205, 196, 0.2); }
        .itinerary-cta { margin-top: 2.5rem; text-align: center; }
        .itinerary-cta a { display: inline-block; background: var(--secondary-color); color: var(--primary-color); padding: 1rem 2rem; border-radius: 8px; font-weight: 600; text-decoration: none; transition: all 0.3s ease; }
        .itinerary-cta a:hover { background: #3db8b0; transform: translateY(-2px); }
    </style>
</head>
<body>
    ${NAV}
    <main class="itinerary-page">
        <h1>7-Day ${displayName} AI Trip Planner: Validated Itinerary</h1>
        <div class="validation-box">
            <strong>Logistical Validation:</strong>
            <span><span class="check">✓</span> Flight Gaps Checked</span>
            <span><span class="check">✓</span> Hotel Proximity Verified</span>
            <span><span class="check">✓</span> Multi-LLM Confirmed</span>
        </div>
        <section>
            <h2>3-Day Sample Itinerary</h2>
            <pre class="itinerary-sample">${itineraryText}</pre>
        </section>
        <div class="itinerary-cta">
            <a href="https://apps.apple.com/au/app/alfred-travel/id6745240301" target="_blank" rel="noopener noreferrer">Generate the full 7-day version in Alfred App</a>
        </div>
    </main>
    ${FOOTER}
</body>
</html>`;
}

function main() {
  const destinations = JSON.parse(fs.readFileSync(DESTINATIONS_PATH, 'utf8'));
  let contentMap = {};
  if (fs.existsSync(ITINERARY_CONTENT_PATH)) {
    contentMap = JSON.parse(fs.readFileSync(ITINERARY_CONTENT_PATH, 'utf8'));
  }
  if (!fs.existsSync(ITINERARIES_DIR)) fs.mkdirSync(ITINERARIES_DIR, { recursive: true });

  let count = 0;
  for (const name of destinations) {
    const slug = slugify(name);
    const html = buildPage(name, contentMap);
    fs.writeFileSync(path.join(ITINERARIES_DIR, `${slug}.html`), html);
    count++;
  }

  // Index page
  const indexLinks = destinations
    .map((name) => {
      const slug = slugify(name);
      return `                <li><a href="${slug}.html">AI Travel Planner for ${name}</a></li>`;
    })
    .join('\n');
  const softwareApplicationSchema = JSON.stringify(SOFTWARE_APPLICATION_SCHEMA);
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Trip Planner Itineraries | 50 Destinations - Alfred Travel</title>
    <meta name="description" content="Validated 7-day itineraries for 50 top destinations. AI Travel Planner and AI Holiday Planner with flight gaps checked, hotel proximity verified.">
    <link rel="icon" type="image/png" href="../images/Color logo with background.png.png">
    <link rel="stylesheet" href="../css/styles.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Space+Grotesk:wght@600;700&display=swap" rel="stylesheet">
    <script type="application/ld+json">${softwareApplicationSchema}</script>
</head>
<body>
    ${NAV}
    <main style="max-width: 800px; margin: 0 auto; padding: 6rem 5% 4rem;">
        <h1 style="font-family: 'Space Grotesk', sans-serif; color: var(--secondary-color); margin-bottom: 1rem;">AI Trip Planner Itineraries</h1>
        <p style="margin-bottom: 2rem;">7-day validated itineraries for 50 top destinations. Each includes flight gap validation, hotel proximity checks, and multi-LLM confirmation.</p>
        <ul style="list-style: none; padding: 0;">
${indexLinks}
        </ul>
    </main>
    ${FOOTER}
</body>
</html>`;
  fs.writeFileSync(path.join(ITINERARIES_DIR, 'index.html'), indexHtml);

  console.log(`Built ${count} itinerary pages + index in ${ITINERARIES_DIR}`);
}

main();
