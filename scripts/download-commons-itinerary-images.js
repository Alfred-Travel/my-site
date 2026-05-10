#!/usr/bin/env node
/**
 * Downloads one landscape-oriented thumbnail per destination from Wikimedia Commons
 * via https://commons.wikimedia.org/w/api.php (generator=search + imageinfo).
 * Saves to images/landmark_images/commons/{slug}.jpg and writes ATTRIBUTION.md.
 *
 * Usage: node scripts/download-commons-itinerary-images.js
 *        node scripts/download-commons-itinerary-images.js --only=montreal
 * Etiquette: https://wikimediafoundation.org/wiki/Policy:User-Agent_policy
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DESTINATIONS_PATH = path.join(ROOT, 'destinations.json');
const OUT_DIR = path.join(ROOT, 'images', 'landmark_images', 'commons');
const ATTRIBUTION_PATH = path.join(OUT_DIR, 'ATTRIBUTION.md');

const API = 'https://commons.wikimedia.org/w/api.php';
const USER_AGENT =
  'AlfredTravelWebsite/1.0 (itinerary thumbnails; +https://www.alfredtravel.io)';

/** When set, fetch this exact File: page (better than search for ambiguous cities). */
const PRECISE_FILE_TITLE = {
  Paris:
    'File:Eiffel Tower and Pont Alexandre III at night.jpg',
};

/**
 * Search phrases for Commons (File namespace). Do not use insource:filetype — it
 * breaks gsrsearch and returns empty results.
 */
const GSRSEARCH_BY_CITY = {
  London: 'Palace of Westminster London',
  Paris: 'Eiffel Tower Paris view',
  Tokyo: 'Shibuya crossing Tokyo',
  Kyoto: 'Kinkaku-ji Kyoto',
  Osaka: 'Osaka Castle Japan',
  'New York': 'Statue of Liberty New York',
  Barcelona: 'Sagrada Familia Barcelona exterior',
  Rome: 'Colosseum Rome Italy',
  Bali: 'Tegallalang rice terrace Bali',
  Dubai: 'Burj Khalifa Dubai',
  Singapore: 'Marina Bay Sands Singapore',
  'Hong Kong': 'Victoria Harbour Hong Kong skyline',
  Amsterdam: 'Amsterdam canal houses',
  Sydney: 'Sydney Opera House',
  'Los Angeles': 'Hollywood Sign Los Angeles',
  Berlin: 'Brandenburg Gate Berlin',
  Madrid: 'Plaza Mayor Madrid Spain',
  Bangkok: 'Wat Arun Bangkok',
  Istanbul: 'Hagia Sophia Istanbul exterior',
  Lisbon: 'Belem Tower Lisbon',
  Prague: 'Charles Bridge Prague',
  Vienna: 'Schonbrunn Palace Vienna',
  Seoul: 'Gyeongbokgung Seoul',
  'San Francisco': 'Golden Gate Bridge',
  Miami: 'South Beach Miami Art Deco',
  Montreal: 'Old Montreal Notre-Dame Basilica',
  Orlando: 'Cinderella Castle Magic Kingdom',
  'Cape Town': 'Table Mountain Cape Town',
  Marrakech: 'Jemaa el-Fnaa Marrakech',
  Athens: 'Parthenon Acropolis Athens',
  Florence: 'Florence Cathedral Duomo',
  Edinburgh: 'Edinburgh Castle',
  Dublin: "Ha'penny Bridge Dublin",
  Copenhagen: 'Nyhavn Copenhagen',
  Oslo: 'Oslo Opera House',
  Stockholm: 'Gamla stan Stockholm waterfront',
  Reykjavik: 'Hallgrimskirkja Reykjavik',
  Phuket: 'Phuket beach Thailand',
  'Ho Chi Minh City': 'Ben Thanh Market Ho Chi Minh',
  Hanoi: 'Hoan Kiem Lake Hanoi',
  'Kuala Lumpur': 'Petronas Towers Kuala Lumpur',
  Melbourne: 'Flinders Street Station Melbourne',
  Auckland: 'Sky Tower Auckland',
  Queenstown: 'Lake Wakatipu Queenstown',
  'Rio de Janeiro': 'Christ the Redeemer Rio de Janeiro',
  'Buenos Aires': 'Obelisk Buenos Aires',
  'Mexico City': 'Zocalo Mexico City Cathedral',
  Cancun: 'Chichen Itza Mexico pyramid',
  Toronto: 'CN Tower Toronto',
  Vancouver: 'Stanley Park Vancouver seawall',
  Chicago: 'Cloud Gate Chicago Millennium Park',
  Boston: 'Boston skyline harbor',
  'Washington DC': 'Lincoln Memorial Washington DC',
  'Las Vegas': 'Las Vegas Strip night',
  Zurich: 'Grossmunster Zurich Limmat',
};

function slugify(name) {
  return name.toLowerCase().replace(/\s+/g, '-');
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function apiSearch(gsrsearch) {
  const u = new URL(API);
  u.searchParams.set('action', 'query');
  u.searchParams.set('format', 'json');
  u.searchParams.set('generator', 'search');
  u.searchParams.set('gsrsearch', gsrsearch);
  u.searchParams.set('gsrnamespace', '6');
  u.searchParams.set('gsrlimit', '20');
  u.searchParams.set('prop', 'imageinfo');
  u.searchParams.set('iiprop', 'url|mime|size|dimensions');
  u.searchParams.set('iiurlwidth', '1280');
  const res = await fetch(u.toString(), {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Commons API HTTP ${res.status}`);
  return res.json();
}

async function apiByExactTitle(fileTitle) {
  const u = new URL(API);
  u.searchParams.set('action', 'query');
  u.searchParams.set('format', 'json');
  u.searchParams.set('titles', fileTitle);
  u.searchParams.set('prop', 'imageinfo');
  u.searchParams.set('iiprop', 'url|mime|size|dimensions');
  u.searchParams.set('iiurlwidth', '1280');
  const res = await fetch(u.toString(), {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Commons API HTTP ${res.status}`);
  return res.json();
}

function scoreCandidate(ii) {
  if (!ii || !ii.thumburl) return -Infinity;
  const mime = (ii.mime || '').toLowerCase();
  if (mime.includes('svg') || mime.includes('djvu')) return -Infinity;
  if (!mime.startsWith('image/')) return -Infinity;
  const w = ii.thumbwidth || 0;
  const h = ii.thumbheight || 0;
  if (w < 640 || h < 360) return -Infinity;
  const ar = w / h;
  const arTarget = 16 / 9;
  const arPenalty = Math.abs(ar - arTarget) * 80;
  const sizeScore = Math.min(w, 1280) * 0.4;
  const portraitPenalty = ar < 1.05 ? 200 : 0;
  const jpegBonus =
    mime.includes('jpeg') || mime.includes('jpg') ? 25 : 0;
  return sizeScore - arPenalty - portraitPenalty + jpegBonus;
}

function pickBestPage(data) {
  const pages = data.query && data.query.pages;
  if (!pages) return null;
  let best = null;
  let bestScore = -Infinity;
  for (const p of Object.values(pages)) {
    if (p.missing) continue;
    const ii = (p.imageinfo && p.imageinfo[0]) || null;
    const s = scoreCandidate(ii);
    if (s > bestScore) {
      bestScore = s;
      best = { title: p.title, ii, pageid: p.pageid };
    }
  }
  return best;
}

async function downloadUrl(url, destPath) {
  const clean = url.split('?')[0];
  const res = await fetch(clean, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new Error(`Download HTTP ${res.status} ${clean}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(destPath, buf);
}

async function main() {
  if (!fs.existsSync(DESTINATIONS_PATH)) {
    console.error('Missing destinations.json');
    process.exit(1);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const onlyRaw = process.argv.find((a) => a.startsWith('--only='));
  const onlySlug = onlyRaw ? onlyRaw.slice('--only='.length).trim().toLowerCase() : '';

  const allDestinations = JSON.parse(fs.readFileSync(DESTINATIONS_PATH, 'utf8'));
  const destinations = onlySlug
    ? allDestinations.filter((c) => slugify(c) === onlySlug)
    : allDestinations;

  if (onlySlug && destinations.length === 0) {
    console.error(`No destination matches --only slug "${onlySlug}"`);
    process.exit(1);
  }

  let attributionRows;
  if (onlySlug && fs.existsSync(ATTRIBUTION_PATH)) {
    attributionRows = fs
      .readFileSync(ATTRIBUTION_PATH, 'utf8')
      .split('\n')
      .filter((line) => {
        if (!line.startsWith('| ') || line.startsWith('| ---')) return true;
        const nameCell = line.split('|')[1]?.trim();
        return !destinations.includes(nameCell);
      });
  } else {
    attributionRows = [
      '# Wikimedia Commons — itinerary index thumbnails',
      '',
      'Images below are fetched from [Wikimedia Commons](https://commons.wikimedia.org/) using the [MediaWiki Action API](https://commons.wikimedia.org/w/api.php). Each file has its own licence on the file page—review before reuse outside this site.',
      '',
      '| Destination | API search used | Commons file page |',
      '| --- | --- | --- |',
    ];
  }

  for (const city of destinations) {
    const slug = slugify(city);
    const gsrsearch =
      GSRSEARCH_BY_CITY[city] || `${city} landmark skyline`;
    const precise = PRECISE_FILE_TITLE[city];
    const queryLabel = precise || gsrsearch;
    process.stdout.write(`${city} … `);
    try {
      const data = precise
        ? await apiByExactTitle(precise)
        : await apiSearch(gsrsearch);
      const picked = pickBestPage(data);
      if (!picked || !picked.ii.thumburl) {
        console.log('no suitable raster thumbnail, skipped');
        attributionRows.push(`| ${city} | \`${queryLabel}\` | (no download) |`);
        await sleep(300);
        continue;
      }
      const mime = (picked.ii.mime || '').toLowerCase();
      const ext = mime.includes('png') ? '.png' : '.jpg';
      const dest = path.join(OUT_DIR, `${slug}${ext}`);
      await downloadUrl(picked.ii.thumburl, dest);
      const filePage = picked.ii.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(picked.title)}`;
      attributionRows.push(
        `| ${city} | \`${String(queryLabel).replace(/`/g, "'")}\` | [${picked.title}](${filePage}) |`
      );
      console.log(`OK → commons/${slug}${ext}`);
    } catch (e) {
      console.log(`ERROR: ${e.message}`);
      attributionRows.push(
        `| ${city} | \`${String(queryLabel).replace(/`/g, "'")}\` | error: ${String(e.message).slice(0, 80)} |`
      );
    }
    await sleep(350);
  }

  fs.writeFileSync(
    ATTRIBUTION_PATH,
    attributionRows.join('\n') + '\n',
    'utf8'
  );
  console.log(`Wrote ${ATTRIBUTION_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
