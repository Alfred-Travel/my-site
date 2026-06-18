/**
 * Shared TravelAI header shell (logo + nav links + Download App / Start Exploring pills)
 */
const { headerLogoHtml } = require('./header-logo');
const { navPillsHtml } = require('./header-nav-pills');

const DEFAULT_LINKS = [
  { href: 'about.html', label: 'Company' },
  { href: 'products.html', label: 'Features' },
  { href: 'delete-account.html', label: 'Support' },
];

function travelAiHeaderHtml({
  logoHref = 'index.html',
  assetPrefix = '',
  downloadHref = '#app-downloads',
  links = DEFAULT_LINKS,
} = {}) {
  const prefix = assetPrefix && !assetPrefix.endsWith('/') ? `${assetPrefix}/` : assetPrefix;
  const navItems = links
    .map((link) => {
      const href = link.href.startsWith('http') || link.href.startsWith('#')
        ? link.href
        : `${prefix}${link.href}`;
      const current = link.active ? ' aria-current="page"' : '';
      return `<li><a href="${href}"${current}>${link.label}</a></li>`;
    })
    .join('\n                    ');

  return `    <header class="tai-header">
        <nav class="navbar tai-navbar" aria-label="Main navigation">
            ${headerLogoHtml(logoHref, assetPrefix)}
            <div class="tai-desktop-nav">
                <ul class="nav-links">
                    ${navItems}
                    ${navPillsHtml(downloadHref)}
                </ul>
            </div>
            <button type="button" class="hamburger tai-hamburger" aria-label="Open menu" aria-expanded="false">
                <span></span>
                <span></span>
                <span></span>
            </button>
        </nav>
    </header>`;
}

const LEGACY_HEADER =
  /<header(?:\s[^>]*)?>[\s\S]*?<\/nav>\s*<\/header>/;

function ensureHomeCssLink(html, cssHref) {
  if (html.includes('home.css')) return html;
  return html.replace(
    /(<link rel="stylesheet" href="[^"]*\/css\/styles\.css">)/,
    `$1\n    <link rel="stylesheet" href="${cssHref}">`
  );
}

function ensureTaiSiteBodyClass(html) {
  return html.replace(/<body([^>]*)>/, (match, attrs) => {
    if (attrs.includes('tai-site')) return match;
    const cls = attrs.match(/class="([^"]*)"/);
    if (cls) {
      return `<body${attrs.replace(/class="([^"]*)"/, `class="$1 tai-site"`)}>`;
    }
    return `<body class="tai-site"${attrs}>`;
  });
}

function replaceLegacyHeader(html, options) {
  if (!LEGACY_HEADER.test(html) || html.includes('tai-header')) return html;
  let next = html.replace(LEGACY_HEADER, travelAiHeaderHtml(options));
  next = ensureHomeCssLink(next, options.homeCssHref || 'css/home.css');
  next = ensureTaiSiteBodyClass(next);
  return next;
}

module.exports = {
  travelAiHeaderHtml,
  replaceLegacyHeader,
  LEGACY_HEADER,
};
