/**
 * TravelAI header logo — mint mark + Alfred wordmark (horizontal)
 */

function headerLogoHtml(href, assetPrefix = '') {
  const p = assetPrefix.endsWith('/') ? assetPrefix : assetPrefix ? `${assetPrefix}/` : '';
  return `<a href="${href}" class="tai-header-logo" aria-label="Alfred Travel home">
                <img src="${p}images/brand/alfred-header-mark.png" srcset="${p}images/brand/alfred-header-mark@2x.png 2x" alt="" class="tai-header-logo-mark" width="36" height="36" decoding="async" aria-hidden="true" />
                <span class="tai-header-logo-text">Alfred</span>
            </a>`;
}

const HEADER_LOGO_BLOCK =
  /<a href="([^"]+)" class="tai-header-logo"[\s\S]*?<\/a>/;

function ensureHeaderLogoInHtml(html, assetPrefix) {
  if (!html.includes('tai-header-logo')) return html;
  return html.replace(HEADER_LOGO_BLOCK, (_, href) => headerLogoHtml(href, assetPrefix));
}

module.exports = { headerLogoHtml, ensureHeaderLogoInHtml, HEADER_LOGO_BLOCK };
