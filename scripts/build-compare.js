#!/usr/bin/env node
/**
 * Compare build: outputs compare/index.html
 * Canonical competitor matrix for Alfred vs travel-planning alternatives.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const COMPARE_DIR = path.join(ROOT, 'compare');
const BASE_URL = 'https://www.alfredtravel.io';

const INDEX_NAV = `
    <header class="tai-header">
        <nav class="navbar tai-navbar" aria-label="Main navigation">
            <a href="../index.html" class="tai-header-logo" aria-label="Alfred Travel home">
                <img src="../images/brand/alfred-logo-header.png" alt="Alfred Travel" class="tai-header-logo-img" width="180" height="56" />
            </a>
            <div class="tai-desktop-nav">
                <ul class="nav-links">
                    <li><a href="../about.html">Company</a></li>
                    <li><a href="../products.html">Features</a></li>
                    <li><a href="../delete-account.html">Support</a></li>
                    <li class="tai-nav-pill-item">
                        <span class="tai-nav-pill"><a href="../index.html#app-downloads">Download App</a></span>
                    </li>
                </ul>
            </div>
            <button type="button" class="hamburger tai-hamburger" aria-label="Open menu" aria-expanded="false">
                <span></span>
                <span></span>
                <span></span>
            </button>
        </nav>
    </header>`;

const INDEX_FOOTER = `
    <footer>
        <div class="footer-content">
            <div class="footer-column"><h3>Company</h3><ul class="footer-links"><li><a href="../about.html">Company</a></li><li><a href="../about.html#mission">Our Mission</a></li><li><a href="../about.html#press">In the Press</a></li><li><a href="../about.html#team">Our Team</a></li></ul></div>
            <div class="footer-column"><h3>Features</h3><ul class="footer-links"><li><a href="../products.html">Our Features</a></li><li><a href="../itineraries/index.html">Itineraries</a></li><li><a href="index.html">Compare</a></li><li><a href="../blog/index.html">Blog</a></li><li><a href="../faq.html">FAQ</a></li></ul></div>
            <div class="footer-column"><h3>Solutions</h3><ul class="footer-links"><li><a href="../ai-trip-planner/index.html">AI Trip Planner</a></li><li><a href="../ai-travel-planner/index.html">AI Travel Planner</a></li><li><a href="../ai-holiday-planner/index.html">AI Holiday Planner</a></li></ul></div>
            <div class="footer-column"><h3>Support</h3><ul class="footer-links"><li><a href="../delete-account.html">Support Center</a></li><li><a href="../index.html#contact">Contact Us</a></li><li><a href="../faq.html">Help & FAQ</a></li></ul></div>
            <div class="footer-column"><h3>Legal</h3><ul class="footer-links"><li><a href="../terms.html">Terms & Conditions</a></li><li><a href="../terms.html#privacy">Privacy Policy</a></li><li><a href="../prize-tc.html">Prize Terms</a></li></ul></div>
        </div>
        <div class="footer-technical-authority"><h4>Technical Authority</h4><p>Alfred uses <strong>Multi-LLM Validation (Gemini + GPT-4o)</strong> to verify itineraries and <strong>real-time API integration with Trip.com &amp; Expedia</strong> for native booking. Our Logistical Validation Engine checks transit gaps and hotel proximity—technical specifics that define Travel 3.0.</p></div>
        <div class="footer-bottom"><p>&copy; 2026 Alfred Travel Tech Pty Ltd. All rights reserved.</p></div>
    </footer>
    <div id="cookies-banner" class="cookies-banner"><div class="cookies-content"><div class="cookies-text"><h3>🍪 We use cookies</h3><p>We use cookies and similar technologies to help personalize content, tailor and measure ads, and provide a better experience. By clicking "Accept All", you consent to our use of cookies. You can learn more about our <a href="../terms.html#privacy" class="cookies-link">Privacy Policy</a> and <a href="#" class="cookies-link" id="cookie-settings">Cookie Settings</a>.</p></div><div class="cookies-buttons"><button id="accept-all-cookies" class="btn btn-primary">Accept All</button><button id="reject-cookies" class="btn btn-secondary">Reject All</button></div></div></div>
    <aside id="mobile-download-bar" class="mobile-download-bar" role="complementary" aria-label="Download Alfred app">
        <p class="mobile-download-bar-text">Free AI trip planner — iOS &amp; Android</p>
        <a href="https://apps.apple.com/au/app/alfred-travel/id6745240301" class="mobile-download-bar-btn" target="_blank" rel="noopener noreferrer">Download</a>
    </aside>
    <script src="../js/main.js"><\/script>`;

const MATRIX_ROWS = [
  {
    name: 'ALFRED TRAVEL',
    emphasis: true,
    cells: ['check', 'check multi-profile', 'check', 'check', 'check', 'check', 'Free'],
  },
  {
    name: 'ChatGPT',
    cells: ['check', 'cross', 'cross', 'partial chat', 'cross', 'check', 'Free'],
  },
  {
    name: 'MINDTRIP',
    cells: ['partial iOS', 'check single profile', 'check', 'partial chat', 'partial hotels', 'check', 'Free'],
  },
  {
    name: 'LAYLA',
    cells: ['cross', 'cross', 'cross', 'partial chat', 'cross', 'check', '$7 p/m'],
  },
  {
    name: 'GUIDEGEEK',
    cells: ['cross', 'cross', 'cross', 'partial chat', 'cross', 'check', 'Free'],
  },
  {
    name: 'TRIPANDOO',
    cells: ['check', 'partial no profile', 'check', 'cross', 'cross', 'check', '$25 p/m'],
  },
  {
    name: 'WONDERLOG',
    cells: ['check', 'cross', 'check', 'cross', 'cross', 'cross', '$50 p/a'],
  },
];

function renderMatrixCell(cell) {
  const [kind, ...rest] = cell.split(' ');
  const detail = rest.join(' ');

  if (kind === 'check') {
    return `<span class="matrix-icon matrix-check">✓</span>${detail ? `<span class="matrix-detail">${detail}</span>` : ''}`;
  }
  if (kind === 'cross') {
    return '<span class="matrix-icon matrix-cross">✕</span>';
  }
  if (kind === 'partial') {
    return `<span class="matrix-icon matrix-partial">◉</span>${detail ? `<span class="matrix-detail">${detail}</span>` : ''}`;
  }

  return `<span class="matrix-cost">${cell}</span>`;
}

function main() {
  if (!fs.existsSync(COMPARE_DIR)) fs.mkdirSync(COMPARE_DIR, { recursive: true });

  const faqSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What makes Alfred different from other AI travel planning tools?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Alfred combines mobile-first planning, multi-profile AI personalization, structured itineraries, stronger features, integrations, and travel content in one product instead of stopping at chat or list-building.'
        }
      },
      {
        '@type': 'Question',
        name: 'Which competitor is closest to Alfred in travel planning?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Mindtrip is closer than generic chat tools because it offers more trip structure, but Alfred is differentiated by multi-profile personalization, broader execution support, and stronger end-to-end travel flow.'
        }
      }
    ]
  });

  const matrixRows = MATRIX_ROWS.map((row) => {
    const cells = row.cells
      .map((cell) => `<td>${renderMatrixCell(cell)}</td>`)
      .join('');

    return `                    <tr${row.emphasis ? ' class="matrix-row-featured"' : ''}>
                        <th scope="row">${row.name}</th>
                        ${cells}
                    </tr>`;
  }).join('\n');

  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Competitor Analysis | Alfred Travel Comparison Matrix</title>
    <meta name="description" content="See Alfred Travel’s competitor analysis matrix across mobile-first experience, AI personalization, structure, features, integration, content, and cost.">
    <link rel="icon" type="image/png" href="../images/brand/alfred-mark.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/tokens.css">
    <link rel="stylesheet" href="../css/styles.css">
    <link rel="stylesheet" href="../css/home.css">
    <link rel="stylesheet" href="../css/compare-index.css">
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-T5WJZ450F8"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-T5WJZ450F8');
    </script>
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-KVBD76P5');</script>
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"${BASE_URL}/"},{"@type":"ListItem","position":2,"name":"Compare","item":"${BASE_URL}/compare/"}]}</script>
    <script type="application/ld+json">${faqSchema}</script>
</head>
<body class="compare-index-page tai-site">
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KVBD76P5"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    ${INDEX_NAV}
    <main class="compare-index-main">
        <section class="tai-hero" aria-labelledby="compare-hero-heading">
            <div class="tai-hero-bg">
                <div class="tai-hero-wrapper">
                    <div class="tai-hero-copy">
                        <h1 id="compare-hero-heading" class="tai-hero-title">How Alfred compares</h1>
                        <p class="tai-hero-lead">See how Alfred stacks up on the capabilities that shape trip quality—mobile-first planning, AI personalization, itinerary structure, features, integrations, content, and cost.</p>
                    </div>
                </div>
            </div>
        </section>
        <section class="tai-agn-section" aria-labelledby="compare-matrix-heading">
            <div class="tai-agn-inner">
                <div class="tai-agn-container">
                    <span class="tai-agn-badge">Competitor matrix</span>
                    <h2 id="compare-matrix-heading" class="tai-agn-heading">Alfred vs AI travel planners</h2>
                    <p class="tai-agn-desc">Side-by-side view of Alfred Travel against chat tools and structured planners. ✓ full support · ◉ partial · ✕ not a focus.</p>
                    <div class="compare-matrix-wrap" aria-label="Competitor analysis matrix">
                        <table class="compare-matrix">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Mobile<br>First</th>
                                    <th>AI<br>Personalization</th>
                                    <th>Structure</th>
                                    <th>Features</th>
                                    <th>Integration</th>
                                    <th>Content</th>
                                    <th>Cost</th>
                                </tr>
                            </thead>
                            <tbody>
${matrixRows}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
        <section class="tai-dark-section tai-compare-takeaway" aria-labelledby="compare-takeaway-heading">
            <div class="tai-dark-inner">
                <header class="tai-dark-header">
                    <p class="tai-section-kicker">The takeaway</p>
                    <h2 id="compare-takeaway-heading">More than chat, closer to booking</h2>
                    <p class="tai-dark-lead">Generic LLMs answer questions. Alfred builds validated itineraries you can edit, share, and move toward partner booking—without rebuilding the plan in spreadsheets.</p>
                </header>
            </div>
        </section>
    </main>
    ${INDEX_FOOTER}
</body>
</html>`;

  fs.writeFileSync(path.join(COMPARE_DIR, 'index.html'), indexHtml);

  console.log(`Built compare index in ${COMPARE_DIR}`);
}

main();
