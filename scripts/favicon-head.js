/**
 * Standard Alfred favicon <head> fragments for static HTML and build scripts.
 */

function faviconHead(cssPrefix = '') {
  const p = cssPrefix.endsWith('/') ? cssPrefix : cssPrefix ? `${cssPrefix}/` : '';
  return `    <link rel="icon" type="image/png" sizes="16x16" href="${p}images/brand/favicon-16.png">
    <link rel="icon" type="image/png" sizes="32x32" href="${p}images/brand/favicon-32.png">
    <link rel="icon" type="image/png" sizes="48x48" href="${p}images/brand/favicon-48.png">
    <link rel="icon" type="image/png" sizes="512x512" href="${p}images/brand/favicon.png">
    <link rel="apple-touch-icon" sizes="180x180" href="${p}images/brand/apple-touch-icon.png">`;
}

const LEGACY_ICON_LINK =
  /<link rel="icon"[^>]*href="[^"]*(?:alfred-mark|Color logo with background|alfred-logo)[^"]*"[^>]*>\s*/gi;

const EXISTING_FAVICON_BLOCK =
  /(\s*<link rel="icon" type="image\/png" sizes="32x32" href="[^"]*favicon-32\.png">\s*<link rel="icon" type="image\/png" sizes="512x512" href="[^"]*favicon\.png">\s*<link rel="apple-touch-icon" sizes="180x180" href="[^"]*apple-touch-icon\.png">)/;

function ensureFaviconInHtml(html, cssPrefix) {
  let out = html.replace(LEGACY_ICON_LINK, '');
  const block = faviconHead(cssPrefix);

  if (EXISTING_FAVICON_BLOCK.test(out)) {
    return out.replace(EXISTING_FAVICON_BLOCK, `\n${block}`);
  }

  if (!out.includes('favicon-32.png')) {
    const charsetMatch = out.match(/<meta charset="[^"]*">/i);
    if (charsetMatch) {
      const insertAt = charsetMatch.index + charsetMatch[0].length;
      out = out.slice(0, insertAt) + '\n' + block + out.slice(insertAt);
    } else {
      out = out.replace(/<head>/i, `<head>\n${block}`);
    }
  }

  return out;
}

module.exports = { faviconHead, ensureFaviconInHtml, LEGACY_ICON_LINK };
