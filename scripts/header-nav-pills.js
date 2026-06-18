/**
 * TravelAI header nav CTA — Start Exploring pill only (Download App lives in hero)
 */

const WEB_LOGIN_URL = 'https://web.alfredtravel.io';
const EXPLORE_LABEL = 'Start Exploring';

function explorePillHtml() {
  return `<li class="tai-nav-pill-item">
                        <span class="tai-nav-pill"><a href="${WEB_LOGIN_URL}">${EXPLORE_LABEL}</a></span>
                    </li>`;
}

/** @deprecated Header no longer includes Download App; kept for build script compatibility */
function downloadAppPillHtml() {
  return '';
}

function navPillsHtml() {
  return explorePillHtml();
}

const NAV_PILL_ITEMS =
  /(?:<li class="tai-nav-pill-item">\s*<span class="tai-nav-pill">[\s\S]*?<\/span>\s*<\/li>\s*)+/g;

const EXPLORE_PILL_LINK =
  /<span class="tai-nav-pill"><a href="[^"]*"[^>]*>(?:Web Login|Start Exploring)<\/a><\/span>/g;

function ensureNavPillsInHtml(html) {
  if (!html.includes('tai-nav-pill') && !html.includes('tai-desktop-nav')) return html;

  html = html.replace(
    EXPLORE_PILL_LINK,
    `<span class="tai-nav-pill"><a href="${WEB_LOGIN_URL}">${EXPLORE_LABEL}</a></span>`
  );

  if (html.includes('tai-nav-pill')) {
    html = html.replace(NAV_PILL_ITEMS, `${navPillsHtml()}\n                    `);
  } else if (html.includes('tai-desktop-nav') && !html.includes(EXPLORE_LABEL)) {
    html = html.replace(
      /(<div class="tai-desktop-nav">[\s\S]*?<ul class="nav-links">[\s\S]*?)(<\/ul>)/,
      `$1                    ${navPillsHtml()}\n                    $2`
    );
  }

  return html;
}

module.exports = {
  WEB_LOGIN_URL,
  EXPLORE_LABEL,
  explorePillHtml,
  webLoginPillHtml: explorePillHtml,
  downloadAppPillHtml,
  navPillsHtml,
  ensureNavPillsInHtml,
  NAV_PILL_ITEMS,
};
