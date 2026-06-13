/**
 * Shared typography `<head>` fragments for static HTML and build scripts.
 * Fonts load via css/typography.css (@import Satoshi + Cormorant Garamond).
 */

function typographyPreconnect() {
  return `    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preconnect" href="https://api.fontshare.com" crossorigin>`;
}

function typographyStylesheet(cssPrefix = '') {
  const p = cssPrefix.endsWith('/') ? cssPrefix : cssPrefix ? `${cssPrefix}/` : '';
  return `    <link rel="stylesheet" href="${p}css/typography.css">`;
}

function typographyHead(cssPrefix = '') {
  return `${typographyPreconnect()}\n${typographyStylesheet(cssPrefix)}`;
}

const INTER_FONT_LINK =
  /<link[^>]*href="https:\/\/fonts\.googleapis\.com\/css2\?family=Inter[^"]*"[^>]*>\s*/gi;

const FONTSHARE_PRECONNECT =
  '<link rel="preconnect" href="https://api.fontshare.com" crossorigin>';

function ensureTypographyInHtml(html, cssPrefix) {
  let out = html.replace(INTER_FONT_LINK, '');

  if (!out.includes('tokens.css')) {
    const tokensLink = `    <link rel="stylesheet" href="${cssPrefix}css/tokens.css">`;
    const stylesMatch = out.match(/<link rel="stylesheet" href="[^"]*css\/styles\.css"[^>]*>/);
    if (stylesMatch) {
      out = out.replace(stylesMatch[0], `${tokensLink}\n${stylesMatch[0]}`);
    } else {
      const typoIdx = out.indexOf('css/typography.css');
      if (typoIdx >= 0) {
        out = out.replace(
          /(<link rel="stylesheet" href="[^"]*css\/typography\.css"[^>]*>)/,
          `${tokensLink}\n$1`
        );
      }
    }
  }

  if (!out.includes('css/typography.css')) {
    const typoLink = typographyStylesheet(cssPrefix);
    const stylesheetRe = /(<link rel="stylesheet" href="[^"]+\.css"[^>]*>)/g;
    let lastMatch;
    let match;
    while ((match = stylesheetRe.exec(out)) !== null) {
      lastMatch = match;
    }
    if (lastMatch) {
      const insertAt = lastMatch.index + lastMatch[0].length;
      out = out.slice(0, insertAt) + '\n' + typoLink + out.slice(insertAt);
    } else if (out.includes('fonts.gstatic.com" crossorigin>')) {
      out = out.replace(
        /(<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com" crossorigin>)/,
        `$1\n${typoLink}`
      );
    }
  }

  if (!out.includes('api.fontshare.com')) {
    out = out.replace(
      /(<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com" crossorigin>)/,
      `$1\n    ${FONTSHARE_PRECONNECT}`
    );
  }

  return out;
}

function detectCssPrefix(html) {
  const m = html.match(/href="(\.\.\/)*css\/tokens\.css"/);
  if (!m) return '';
  const full = m[0].match(/href="([^"]+)"/)[1];
  return full.replace(/css\/tokens\.css$/, '');
}

module.exports = {
  typographyPreconnect,
  typographyStylesheet,
  typographyHead,
  ensureTypographyInHtml,
  detectCssPrefix,
  INTER_FONT_LINK,
};
