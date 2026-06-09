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
const DESTINATION_OVERRIDES_PATH = path.join(ROOT, 'data', 'destination-overrides.json');
const ITINERARIES_DIR = path.join(ROOT, 'itineraries');
const LANDMARK_IMAGES_DIR = path.join(ROOT, 'images', 'landmark_images');
const BASE_URL = 'https://www.alfredtravel.io';
const SOFTWARE_APPLICATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Alfred Travel',
  operatingSystem: 'iOS, Android, Web',
  applicationCategory: 'TravelApplication',
  offers: {
    '@type': 'Offer',
    price: '0.00',
    priceCurrency: 'USD'
  },
  description: 'Alfred is an AI travel planner for validated itineraries, multi-city travel, and booking-ready execution.',
  featureList: 'AI Trip Planner, Validated Multi-City Planning, Booking-Ready Travel Flow, Google Maps Integration, Loyalty Rewards',
  softwareVersion: '1.0.18'
};

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
            <div class="footer-column"><h3>Features</h3><ul class="footer-links"><li><a href="../products.html">Our Features</a></li><li><a href="index.html">Itineraries</a></li><li><a href="../compare/index.html">Compare</a></li><li><a href="../blog/index.html">Blog</a></li><li><a href="../faq.html">FAQ</a></li></ul></div>
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

const NAV = `
    <header>
        <nav class="navbar" aria-label="Main navigation">
            <div class="logo">
                <a href="../index.html" class="brand-link" aria-label="Alfred Travel home">
                    <img src="../images/Color logo with background.png.png" alt="Alfred Travel" class="logo-image" />
                </a>
            </div>
            <ul class="nav-links">
                <li><a href="../products.html">Features</a></li>
                <li><a href="index.html" aria-current="page">Itineraries</a></li>
                <li><a href="../blog/index.html">Blog</a></li>
                <li><a href="../compare/index.html">Compare</a></li>
                <li><a href="../faq.html">FAQ</a></li>
            </ul>
            <a href="../index.html#app-downloads" class="download-cta" aria-label="Download Alfred on iOS or Android">Download App</a>
            <div class="hamburger"><span></span><span></span><span></span></div>
        </nav>
    </header>`;

const FOOTER = `
    <footer>
        <div class="footer-content">
            <div class="footer-column"><h3>Company</h3><ul class="footer-links"><li><a href="../about.html">About Us</a></li><li><a href="../about.html#mission">Our Mission</a></li><li><a href="../about.html#team">Our Team</a></li><li><a href="../index.html#features">Features</a></li></ul></div>
            <div class="footer-column"><h3>Features</h3><ul class="footer-links"><li><a href="../products.html">Our Features</a></li><li><a href="index.html">Itineraries</a></li><li><a href="../compare/index.html">Compare</a></li><li><a href="../blog/index.html">Blog</a></li><li><a href="../faq.html">FAQ</a></li></ul></div>
            <div class="footer-column"><h3>Solutions</h3><ul class="footer-links"><li><a href="../ai-trip-planner/index.html">AI Trip Planner</a></li><li><a href="../ai-travel-planner/index.html">AI Travel Planner</a></li><li><a href="../ai-holiday-planner/index.html">AI Holiday Planner</a></li></ul></div>
            <div class="footer-column"><h3>Support</h3><ul class="footer-links"><li><a href="../delete-account.html">Support Center</a></li><li><a href="../index.html#contact">Contact Us</a></li><li><a href="../faq.html">Help & FAQ</a></li></ul></div>
            <div class="footer-column"><h3>Legal</h3><ul class="footer-links"><li><a href="../terms.html">Terms & Conditions</a></li><li><a href="../terms.html#privacy">Privacy Policy</a></li><li><a href="../prize-tc.html">Prize Terms</a></li></ul></div>
        </div>
        <div class="footer-technical-authority"><h4>Technical Authority</h4><p>Alfred uses <strong>Multi-LLM Validation (Gemini + GPT-4o)</strong> to verify itineraries and <strong>real-time API integration with Trip.com &amp; Expedia</strong> for native booking. Our Logistical Validation Engine checks transit gaps and hotel proximity—technical specifics that define Travel 3.0.</p></div>
        <div class="footer-bottom"><p>&copy; 2026 Alfred Travel Tech Pty Ltd. All rights reserved.</p></div>
    </footer>
    <div id="cookies-banner" class="cookies-banner"><div class="cookies-content"><div class="cookies-text"><h3>🍪 We use cookies</h3><p>We use cookies and similar technologies. <a href="../terms.html#privacy" class="cookies-link">Privacy Policy</a> · <a href="#" class="cookies-link" id="cookie-settings">Cookie Settings</a>.</p></div><div class="cookies-buttons"><button id="accept-all-cookies" class="btn btn-primary">Accept All</button><button id="reject-cookies" class="btn btn-secondary">Reject All</button></div></div></div>
    <script src="../js/main.js"><\/script>`;

function slugify(name) {
  return name.toLowerCase().replace(/\s+/g, '-');
}

function loadDestinationOverrides() {
  if (!fs.existsSync(DESTINATION_OVERRIDES_PATH)) return {};
  try {
    return JSON.parse(fs.readFileSync(DESTINATION_OVERRIDES_PATH, 'utf8'));
  } catch {
    return {};
  }
}

function loadItineraryContent() {
  const base = JSON.parse(fs.readFileSync(ITINERARY_CONTENT_PATH, 'utf8'));
  const overrides = loadDestinationOverrides();
  for (const [city, data] of Object.entries(overrides)) {
    if (data.itinerary) base[city] = data.itinerary;
  }
  return base;
}

/** Flags for itinerary index cards (Commons images live under images/landmark_images/commons/{slug}.jpg when present). */
const CITY_FLAGS = {
  London: '🇬🇧',
  Paris: '🇫🇷',
  Tokyo: '🇯🇵',
  Kyoto: '🇯🇵',
  Osaka: '🇯🇵',
  'New York': '🇺🇸',
  Barcelona: '🇪🇸',
  Rome: '🇮🇹',
  Bali: '🇮🇩',
  Dubai: '🇦🇪',
  Singapore: '🇸🇬',
  'Hong Kong': '🇭🇰',
  Amsterdam: '🇳🇱',
  Sydney: '🇦🇺',
  'Los Angeles': '🇺🇸',
  Berlin: '🇩🇪',
  Madrid: '🇪🇸',
  Bangkok: '🇹🇭',
  Istanbul: '🇹🇷',
  Lisbon: '🇵🇹',
  Prague: '🇨🇿',
  Vienna: '🇦🇹',
  Seoul: '🇰🇷',
  'San Francisco': '🇺🇸',
  Miami: '🇺🇸',
  Montreal: '🇨🇦',
  Orlando: '🇺🇸',
  'Cape Town': '🇿🇦',
  Marrakech: '🇲🇦',
  Athens: '🇬🇷',
  Florence: '🇮🇹',
  Edinburgh: '🏴',
  Dublin: '🇮🇪',
  Copenhagen: '🇩🇰',
  Oslo: '🇳🇴',
  Stockholm: '🇸🇪',
  Reykjavik: '🇮🇸',
  Phuket: '🇹🇭',
  'Ho Chi Minh City': '🇻🇳',
  Hanoi: '🇻🇳',
  'Kuala Lumpur': '🇲🇾',
  Melbourne: '🇦🇺',
  Auckland: '🇳🇿',
  Queenstown: '🇳🇿',
  'Rio de Janeiro': '🇧🇷',
  'Buenos Aires': '🇦🇷',
  'Mexico City': '🇲🇽',
  Cancun: '🇲🇽',
  Toronto: '🇨🇦',
  Vancouver: '🇨🇦',
  Chicago: '🇺🇸',
  Boston: '🇺🇸',
  'Washington DC': '🇺🇸',
  'Las Vegas': '🇺🇸',
  Zurich: '🇨🇭',
};

const DESTINATION_OVERRIDES = loadDestinationOverrides();

function getCityFlag(destination) {
  return DESTINATION_OVERRIDES[destination]?.flag || CITY_FLAGS[destination] || '✈️';
}

function getLegacyCardImage(destination, index) {
  const override = DESTINATION_OVERRIDES[destination]?.legacyImage;
  if (override) return override;
  return LEGACY_CARD_IMAGE[destination] || FALLBACK_CARD_IMAGES[index % FALLBACK_CARD_IMAGES.length];
}

/** Legacy filenames when no Commons thumbnail has been downloaded yet. */
const LEGACY_CARD_IMAGE = {
  London: 'big_ben.jpg',
  Paris: 'eiffel_tower.jpg',
  Tokyo: 'mount_fuji.jpg',
  Kyoto: 'mount_fuji.jpg',
  Osaka: 'mount_fuji.jpg',
  'New York': 'statue_of_liberty.jpg',
  Barcelona: 'sagrada_família.jpg',
  Rome: 'colosseum.jpg',
  Bali: 'waikiki_beach.jpg',
  Dubai: 'burj_khalifa.jpg',
  Singapore: 'marina_bay_sands.jpg',
  'Hong Kong': 'the_bund.jpg',
  Amsterdam: 'windmills_of_kinderdijk.jpg',
  Sydney: 'sydney_opera_house.jpg',
  'Los Angeles': 'hollywood_sign.jpg',
  Berlin: 'brandenburg_gate.jpg',
  Madrid: 'the_alhambra.jpg',
  Bangkok: 'golden_temple.jpg',
  Istanbul: 'hagia_sophia.jpg',
  Lisbon: 'santuário_de_fátima.jpg',
  Prague: 'old_city_of_dubrovnik.jpg',
  Vienna: 'palace_of_versailles.jpg',
  Seoul: 'terracotta_army.jpg',
  'San Francisco': 'golden_gate_bridge.jpg',
  Miami: 'waikiki_beach.jpg',
  Montreal: 'cn_tower.jpg',
  Orlando: 'waikiki_beach.jpg',
  'Cape Town': 'table_mountain.jpg',
  Marrakech: 'hassan_ii_mosque.jpg',
  Athens: 'acropolis_of_athens.jpg',
  Florence: 'pantheon.jpg',
  Edinburgh: 'buckingham_palace.jpg',
  Dublin: 'stonehenge.jpg',
  Copenhagen: 'little_mermaid_statue.jpg',
  Oslo: 'trolltunga.jpg',
  Stockholm: 'the_gherkin.jpg',
  Reykjavik: 'trolltunga.jpg',
  Phuket: 'waikiki_beach.jpg',
  'Ho Chi Minh City': 'golden_temple.jpg',
  Hanoi: 'golden_temple.jpg',
  'Kuala Lumpur': 'petronas_twin_towers.jpg',
  Melbourne: 'sydney_opera_house.jpg',
  Auckland: 'mount_cook.jpg',
  Queenstown: 'mount_cook.jpg',
  'Rio de Janeiro': 'christ_the_redeemer.jpg',
  'Buenos Aires': 'iguazu_falls.jpg',
  'Mexico City': 'chichen_itza.jpg',
  Cancun: 'tulum_ruins.jpg',
  Toronto: 'cn_tower.jpg',
  Vancouver: 'banff_national_park.jpg',
  Chicago: 'times_square.jpg',
  Boston: 'white_house.jpg',
  'Washington DC': 'white_house.jpg',
  'Las Vegas': 'grand_canyon.jpg',
  Zurich: 'matterhorn.jpg',
};

const FALLBACK_CARD_IMAGES = [
  'big_ben.jpg',
  'eiffel_tower.jpg',
  'colosseum.jpg',
  'mount_fuji.jpg',
  'burj_khalifa.jpg',
  'sydney_opera_house.jpg',
];

function resolveCommonsThumbnail(slug) {
  for (const ext of ['.jpg', '.png']) {
    const rel = `commons/${slug}${ext}`;
    if (fs.existsSync(path.join(LANDMARK_IMAGES_DIR, rel))) return rel;
  }
  return null;
}

function getCardMeta(destination, index) {
  const slug = slugify(destination);
  const commonsRel = resolveCommonsThumbnail(slug);
  if (commonsRel) {
    return {
      image: commonsRel,
      flag: getCityFlag(destination),
    };
  }
  return {
    image: getLegacyCardImage(destination, index),
    flag: getCityFlag(destination),
  };
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

function extractEntitySignals(displayName, itineraryText) {
  const arrivalMatch = itineraryText.match(/Arrive at ([^;\n]+)/i);
  const arrivalGateway = arrivalMatch ? arrivalMatch[1].trim() : `${displayName} airport or station`;

  const transportModePatterns = [
    ['rail', /\brail\b/i],
    ['train', /\btrain\b/i],
    ['metro', /\bmetro\b/i],
    ['tram', /\btram\b/i],
    ['ferry', /\bferry\b/i],
    ['bus', /\bbus\b/i],
    ['taxi', /\btaxi|cab\b/i],
    ['boat', /\bboat\b/i],
    ['rideshare', /\brideshare\b/i],
    ['cable car', /\bcable car\b/i],
  ];
  const transportModes = transportModePatterns
    .filter(([, pattern]) => pattern.test(itineraryText))
    .map(([mode]) => mode);

  const areaMatches = [];
  const areaRegex = /(?:Check-in (?:in|near|at)|lunch in|dinner in)\s+([^;\n]+)/gi;
  let match;
  while ((match = areaRegex.exec(itineraryText)) !== null) {
    areaMatches.push(match[1].trim());
  }
  const neighborhoodHints = [...new Set(areaMatches)].slice(0, 3);

  return {
    arrivalGateway,
    transportModes: transportModes.length ? transportModes : ['train', 'metro'],
    neighborhoodHints: neighborhoodHints.length ? neighborhoodHints : [`central ${displayName}`],
  };
}

function buildPage(displayName, contentMap, index) {
  const slug = slugify(displayName);
  const pageUrl = `${BASE_URL}/itineraries/${slug}.html`;
  const { image } = getCardMeta(displayName, index);

  const travelActionSchema = {
    '@context': 'https://schema.org',
    '@type': 'TravelAction',
    name: `7-Day ${displayName} AI Trip Planner`,
    description: `Validated 7-day itinerary for ${displayName}. AI-generated and logistically verified by Alfred Travel.`,
    target: { '@type': 'Place', name: displayName },
    result: { '@type': 'Trip', name: `7-Day ${displayName} Itinerary` },
  };

  const itineraryText = sampleItinerary(displayName, contentMap);
  const citySignals = extractEntitySignals(displayName, itineraryText);

  const datasetSchema = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `7-Day ${displayName} Validated Itinerary`,
    description: `Structured, AI-validated travel itinerary for ${displayName}. Includes flight gap validation, hotel proximity checks, and multi-LLM confirmation.`,
    url: pageUrl,
    creator: { '@type': 'Organization', name: 'Alfred Travel Tech Pty Ltd', url: BASE_URL },
    keywords: [
      `${displayName} itinerary`,
      `${displayName} neighborhoods`,
      `${displayName} transport`,
      `${citySignals.arrivalGateway}`,
    ],
    variableMeasured: citySignals.transportModes.map((mode) => ({
      '@type': 'PropertyValue',
      name: `${displayName} transport mode`,
      value: mode,
    })),
    distribution: { '@type': 'DataDownload', encodingFormat: 'text/html', contentUrl: pageUrl },
  };
  const faqSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What makes Alfred useful for planning a ${displayName} itinerary?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Alfred helps travelers build a ${displayName} itinerary with route-aware structure from ${citySignals.arrivalGateway}, destination context, and booking-ready planning instead of disconnected recommendations.`
        }
      },
      {
        '@type': 'Question',
        name: `Can Alfred help with a multi-city trip that includes ${displayName} and local transport decisions?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes. Alfred is designed for multi-city and cross-border travel, so ${displayName} can fit into a broader itinerary with clearer sequencing, transport mode choices (${citySignals.transportModes.join(', ')}), and fewer logistics gaps.`
        }
      }
    ]
  });

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
    <link rel="icon" type="image/png" href="../images/brand/alfred-mark.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/tokens.css">
    <link rel="stylesheet" href="../css/styles.css">
    <link rel="stylesheet" href="../css/home.css">
    <link rel="stylesheet" href="../css/itinerary-detail.css">
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
    <script type="application/ld+json">${JSON.stringify(travelActionSchema)}</script>
    <script type="application/ld+json">${JSON.stringify(datasetSchema)}</script>
    <script type="application/ld+json">${faqSchema}</script>
</head>
<body class="itinerary-detail-page tai-site">
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KVBD76P5"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    ${INDEX_NAV}
    <main class="itinerary-detail-main">
        <section class="tai-hero" aria-labelledby="itinerary-hero-heading">
            <div class="tai-hero-bg">
                <div class="tai-hero-wrapper">
                    <div class="tai-hero-copy">
                        <h1 id="itinerary-hero-heading" class="tai-hero-title">${displayName} · 7-day validated itinerary</h1>
                        <p class="tai-hero-lead">Use this ${displayName} plan as a route-aware starting point for a broader trip—practical structure, fewer planning gaps, and a clearer path from itinerary to booking.</p>
                    </div>
                </div>
            </div>
        </section>
        <section class="tai-agn-section" aria-labelledby="itinerary-validation-heading">
            <div class="tai-agn-inner">
                <div class="tai-agn-container">
                    <span class="tai-agn-badge">Logistical validation</span>
                    <h2 id="itinerary-validation-heading" class="tai-agn-heading">Checked before you commit</h2>
                    <p class="tai-agn-desc">Every Alfred itinerary runs through multi-LLM validation for gaps generic planners miss.</p>
                    <div class="tai-itinerary-validation-grid">
                        <div class="tai-itinerary-validation-item"><strong>Flight gaps</strong> Transfer times and connection windows verified.</div>
                        <div class="tai-itinerary-validation-item"><strong>Hotel proximity</strong> Stay location checked against daily activity clusters.</div>
                        <div class="tai-itinerary-validation-item"><strong>Multi-LLM review</strong> Cross-model confirmation on pacing and routing.</div>
                    </div>
                </div>
            </div>
        </section>
        <section class="tai-agn-section tai-itinerary-sample-agn" aria-labelledby="itinerary-sample-heading">
            <div class="tai-agn-inner">
                <div class="tai-agn-container">
                    <span class="tai-agn-badge">Sample plan</span>
                    <h2 id="itinerary-sample-heading" class="tai-agn-heading">3-day preview</h2>
                    <p class="tai-agn-desc">A condensed look at how Alfred structures a ${displayName} trip—arrival gateway, neighborhoods, and daily pacing.</p>
                    <div class="tai-itinerary-sample-wrap">
                        <img src="../images/landmark_images/${image}" alt="${displayName} destination preview" class="tai-itinerary-cover" width="672" height="378" loading="lazy">
                        <pre class="itinerary-sample">${itineraryText}</pre>
                    </div>
                </div>
            </div>
        </section>
        <section class="tai-dark-section tai-itinerary-faq" aria-labelledby="itinerary-faq-heading">
            <div class="tai-dark-inner">
                <header class="tai-dark-header">
                    <p class="tai-section-kicker">Planning notes</p>
                    <h2 id="itinerary-faq-heading">${displayName} trip planning FAQ</h2>
                </header>
                <div class="tai-dark-grid">
                    <article class="tai-dark-card">
                        <h3>Arrival gateway</h3>
                        <p>This plan starts from <strong>${citySignals.arrivalGateway}</strong> and keeps transfer logic practical for the first-day block.</p>
                    </article>
                    <article class="tai-dark-card">
                        <h3>Neighborhoods</h3>
                        <p>This itinerary prioritizes <strong>${citySignals.neighborhoodHints.join(' • ')}</strong> to reduce routing friction.</p>
                    </article>
                    <article class="tai-dark-card">
                        <h3>Local transport</h3>
                        <p>Typical ${displayName} movement in this plan uses <strong>${citySignals.transportModes.join(', ')}</strong> depending on daily sequencing.</p>
                    </article>
                </div>
            </div>
        </section>
        <section class="tai-join-section tai-itinerary-cta" aria-labelledby="itinerary-cta-heading">
            <div class="tai-join-inner">
                <div class="tai-join-copy">
                    <h2 id="itinerary-cta-heading">Build the full 7-day plan in Alfred</h2>
                    <p class="tai-join-lead">Generate, validate, and edit the complete ${displayName} itinerary in the Alfred app.</p>
                    <a href="https://apps.apple.com/au/app/alfred-travel/id6745240301" class="tai-btn-primary" target="_blank" rel="noopener noreferrer">Open in Alfred App</a>
                </div>
            </div>
        </section>
    </main>
    ${INDEX_FOOTER}
</body>
</html>`;
}

function main() {
  const destinations = JSON.parse(fs.readFileSync(DESTINATIONS_PATH, 'utf8'));
  const contentMap = loadItineraryContent();
  if (!fs.existsSync(ITINERARIES_DIR)) fs.mkdirSync(ITINERARIES_DIR, { recursive: true });

  let count = 0;
  for (let i = 0; i < destinations.length; i++) {
    const name = destinations[i];
    const slug = slugify(name);
    const html = buildPage(name, contentMap, i);
    fs.writeFileSync(path.join(ITINERARIES_DIR, `${slug}.html`), html);
    count++;
  }

  // Index page
  const destinationCards = destinations
    .map((name, index) => {
      const slug = slugify(name);
      const { image, flag } = getCardMeta(name, index);

      return `            <a class="destination-card" href="${slug}.html" aria-label="View itinerary for ${name}">
                <div class="destination-card-media">
                    <img src="../images/landmark_images/${image}" alt="${name} itinerary preview" loading="lazy">
                </div>
                <div class="destination-card-body">
                    <h2>${name}</h2>
                    <span class="destination-card-flag" aria-hidden="true">${flag}</span>
                </div>
            </a>`;
    })
    .join('\n');
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Trip Planner Itineraries | ${destinations.length} Destinations - Alfred Travel</title>
    <meta name="description" content="Validated 7-day itineraries for ${destinations.length} top destinations. AI Travel Planner and AI Holiday Planner with flight gaps checked, hotel proximity verified.">
    <link rel="icon" type="image/png" href="../images/brand/alfred-mark.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/tokens.css">
    <link rel="stylesheet" href="../css/styles.css">
    <link rel="stylesheet" href="../css/home.css">
    <link rel="stylesheet" href="../css/itineraries-index.css">
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
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://www.alfredtravel.io/"},{"@type":"ListItem","position":2,"name":"Itineraries","item":"https://www.alfredtravel.io/itineraries/"}]}</script>
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"WebPage","name":"AI Trip Planner Itineraries | Alfred Travel","url":"https://www.alfredtravel.io/itineraries/","description":"Validated 7-day itineraries for top destinations with transit checks and route logic built in.","publisher":{"@type":"Organization","name":"Alfred Travel Tech"}}</script>
</head>
<body class="itineraries-index-page tai-site">
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KVBD76P5"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    ${INDEX_NAV}
    <main class="itineraries-index-main">
        <section class="tai-hero" aria-labelledby="itineraries-hero-heading">
            <div class="tai-hero-bg">
                <div class="tai-hero-wrapper">
                    <div class="tai-hero-copy">
                        <h1 id="itineraries-hero-heading" class="tai-hero-title">Validated trip itineraries</h1>
                        <p class="tai-hero-lead">Browse 7-day plans across ${destinations.length} destinations—structured for practical travel flow, with transit checks and route logic built in.</p>
                    </div>
                </div>
            </div>
        </section>
        <section class="tai-agn-section tai-itineraries-agn" aria-labelledby="itineraries-grid-heading">
            <div class="tai-agn-inner">
                <div class="tai-agn-container">
                    <span class="tai-agn-badge">Destinations</span>
                    <h2 id="itineraries-grid-heading" class="tai-agn-heading">Pick a city to explore</h2>
                    <p class="tai-agn-desc">Index photos are sourced from <a href="https://commons.wikimedia.org/" rel="noopener noreferrer">Wikimedia Commons</a> (<a href="../images/landmark_images/commons/ATTRIBUTION.md">image credits</a>). Open any destination for a sample itinerary and logistical validation notes.</p>
                    <div class="destination-grid" aria-label="Destination itinerary grid">
${destinationCards}
                    </div>
                </div>
            </div>
        </section>
    </main>
    ${INDEX_FOOTER}
</body>
</html>`;
  fs.writeFileSync(path.join(ITINERARIES_DIR, 'index.html'), indexHtml);

  console.log(`Built ${count} itinerary pages + index in ${ITINERARIES_DIR}`);
}

main();
