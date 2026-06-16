/**
 * TravelAI header nav CTAs — Web Login + Download App pills
 */

const WEB_LOGIN_URL = 'https://web.alfredtravel.io';

function webLoginPillHtml() {
  return `<li class="tai-nav-pill-item">
                        <span class="tai-nav-pill"><a href="${WEB_LOGIN_URL}">Web Login</a></span>
                    </li>`;
}

function downloadAppPillHtml(downloadHref) {
  return `<li class="tai-nav-pill-item">
                        <span class="tai-nav-pill"><a href="${downloadHref}">Download App</a></span>
                    </li>`;
}

function navPillsHtml(downloadHref = '#app-downloads') {
  return `${downloadAppPillHtml(downloadHref)}
                    ${webLoginPillHtml()}`;
}

const NAV_PILLS_BLOCK =
  /<li class="tai-nav-pill-item">[\s\S]*?<\/li>\s*(?:<li class="tai-nav-pill-item">[\s\S]*?<\/li>\s*)?/;

function ensureNavPillsInHtml(html) {
  if (!html.includes('tai-nav-pill')) return html;

  html = html.replace(
    /<span class="tai-nav-pill"><a href="[^"]*"[^>]*>Web Login<\/a><\/span>/g,
    `<span class="tai-nav-pill"><a href="${WEB_LOGIN_URL}">Web Login</a></span>`
  );

  const downloadMatch = html.match(
    /<li class="tai-nav-pill-item">\s*<span class="tai-nav-pill"><a href="([^"]*)">Download App<\/a><\/span>\s*<\/li>/
  );
  const downloadHref = downloadMatch ? downloadMatch[1] : '#app-downloads';

  if (html.includes('Web Login')) {
    return html.replace(NAV_PILLS_BLOCK, `${navPillsHtml(downloadHref)}\n                    `);
  }

  return html.replace(
    /<li class="tai-nav-pill-item">\s*<span class="tai-nav-pill"><a href="([^"]*)">Download App<\/a><\/span>\s*<\/li>/,
    (_, href) => navPillsHtml(href)
  );
}

module.exports = {
  WEB_LOGIN_URL,
  webLoginPillHtml,
  downloadAppPillHtml,
  navPillsHtml,
  ensureNavPillsInHtml,
  NAV_PILLS_BLOCK,
};
