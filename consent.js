// Shared analytics consent for alfredtravel.io (AB-347).
// Stores the choice in the shared `at_consent` cookie (also read by web.alfredtravel.io).
// No localStorage. analytics.js only loads Google Analytics once this reports "granted".
(() => {
  const NAME = 'at_consent';
  const MAX_AGE = 60 * 60 * 24 * 365; // about 12 months
  const host = window.location.hostname;
  const isAlfredHost = host === 'alfredtravel.io' || host.endsWith('.alfredtravel.io');

  function read() {
    const match = document.cookie.split(/;\s*/).find((part) => part.startsWith(NAME + '='));
    const value = match ? decodeURIComponent(match.slice(NAME.length + 1)) : null;
    return value === 'granted' || value === 'denied' ? value : null;
  }

  function write(value) {
    let cookie = `${NAME}=${value}; Path=/; Max-Age=${MAX_AGE}; SameSite=Lax`;
    if (isAlfredHost) cookie += '; Domain=.alfredtravel.io';
    if (window.location.protocol === 'https:') cookie += '; Secure';
    document.cookie = cookie;
    window.dispatchEvent(new CustomEvent('at-consent-change', { detail: value }));
  }

  window.atConsent = { read, write, open: () => show() };

  const style = document.createElement('style');
  style.textContent = `
.at-consent{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:1000;width:min(680px,calc(100% - 24px));padding:18px 20px;border:1px solid var(--alfred-border,rgba(57,205,187,.22));border-radius:18px;background:var(--alfred-charcoal-2,#171c1c);color:var(--alfred-muted,#9db4c6);box-shadow:0 18px 40px rgba(0,0,0,.45);font:400 14px/1.5 Inter,ui-sans-serif,system-ui,sans-serif}
.at-consent[hidden]{display:none}
.at-consent h2{margin:0 0 6px;color:var(--alfred-ivory,#ffffd9);font-size:16px;font-weight:700}
.at-consent p{margin:0}
.at-consent a{color:var(--alfred-mint,#39cdbb);text-decoration:underline}
.at-consent-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}
.at-consent-actions button{border:1px solid var(--alfred-border,rgba(57,205,187,.22));border-radius:999px;padding:9px 16px;font:600 14px/1 inherit;font-family:inherit;color:var(--alfred-ivory,#ffffd9);background:rgba(255,255,255,.04);cursor:pointer}
.at-consent-actions .at-consent-accept{color:var(--alfred-charcoal,#101111);background:var(--alfred-mint,#39cdbb);border-color:var(--alfred-mint,#39cdbb)}
.cookie-settings-link{cursor:pointer}
.at-consent-footer{padding:18px;text-align:center;font:400 13px/1.4 Inter,ui-sans-serif,system-ui,sans-serif}
.at-consent-footer a{color:var(--alfred-muted,#9db4c6)}`;
  document.head.appendChild(style);

  let banner;
  function build() {
    const termsHref = new URL('/terms.html#privacy', window.location.href).pathname + '#privacy';
    banner = document.createElement('section');
    banner.className = 'at-consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie settings');
    banner.innerHTML = `<h2>Cookies on Alfred</h2><p>We use analytics cookies (Google Analytics) to understand how our site is used and to improve it. They're only turned on if you accept. You can change your mind any time with Cookie Settings. See our <a href="${termsHref}">Privacy Policy</a>.</p><div class="at-consent-actions"><button type="button" class="at-consent-reject">Reject</button><button type="button" class="at-consent-accept">Accept</button></div>`;
    banner.querySelector('.at-consent-accept').addEventListener('click', () => { write('granted'); hide(); });
    banner.querySelector('.at-consent-reject').addEventListener('click', () => { write('denied'); hide(); });
    document.body.appendChild(banner);
  }
  function show() { if (!banner) build(); banner.hidden = false; }
  function hide() { if (banner) banner.hidden = true; }

  function wireSettingsLinks() {
    if (!document.querySelector('[data-cookie-settings]')) {
      let container = document.querySelector('.v2-footer-support .v2-footer-links') || document.querySelector('footer');
      if (!container) {
        // Pages without a site footer (e.g. investor pages) get a minimal one.
        container = document.createElement('footer');
        container.className = 'at-consent-footer';
        document.body.appendChild(container);
      }
      {
        const a = document.createElement('a');
        a.href = '#cookie-settings';
        a.className = 'cookie-settings-link';
        a.setAttribute('data-cookie-settings', '');
        a.textContent = 'Cookie Settings';
        container.appendChild(a);
      }
    }
    document.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-cookie-settings]');
      if (!trigger) return;
      event.preventDefault();
      show();
    });
  }

  function init() {
    wireSettingsLinks();
    if (!read()) show();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
