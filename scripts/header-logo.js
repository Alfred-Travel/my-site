/**
 * TravelAI header logo markup — horizontal mark + wordmark
 */

function headerLogoHtml(href, assetPrefix = '') {
  const p = assetPrefix.endsWith('/') ? assetPrefix : assetPrefix ? `${assetPrefix}/` : '';
  return `<a href="${href}" class="tai-header-logo" aria-label="Alfred Travel home">
                <img src="${p}images/brand/favicon-48.png" alt="" class="tai-header-logo-mark" width="36" height="36" aria-hidden="true" />
                <span class="tai-header-logo-text">Alfred</span>
            </a>`;
}

const LEGACY_HEADER_LOGO =
  /<a href="([^"]+)" class="tai-header-logo"[^>]*>\s*<img src="[^"]*alfred-logo-header\.png"[^>]*>\s*<\/a>/g;

function ensureHeaderLogoInHtml(html, assetPrefix) {
  if (html.includes('tai-header-logo-mark')) return html;
  return html.replace(LEGACY_HEADER_LOGO, (_, href) => headerLogoHtml(href, assetPrefix));
}

module.exports = { headerLogoHtml, ensureHeaderLogoInHtml, LEGACY_HEADER_LOGO };
