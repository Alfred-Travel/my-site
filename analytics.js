(() => {
  const measurementId = 'G-T5WJZ450F8';
  const productionHosts = new Set(['alfredtravel.io', 'www.alfredtravel.io']);

  // Do not send analytics while reviewing local file:// pages or localhost previews.
  if (!productionHosts.has(window.location.hostname)) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: true,
  });

  if (!document.querySelector(`script[src^="https://www.googletagmanager.com/gtag/js?id=${measurementId}"]`)) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);
  }

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link || typeof window.gtag !== 'function') return;

    const url = new URL(link.href, window.location.href);
    if (url.hostname !== 'web.alfredtravel.io') return;

    const eventParams = {
      cta_name: 'plan_a_trip',
      cta_text: link.textContent.trim(),
      link_url: url.href,
      page_path: window.location.pathname,
      cta_location: link.closest('header, main, footer')?.tagName.toLowerCase() || 'unknown',
      campaign_source: new URLSearchParams(window.location.search).get('utm_source') || undefined,
      campaign_medium: new URLSearchParams(window.location.search).get('utm_medium') || undefined,
      campaign_campaign: new URLSearchParams(window.location.search).get('utm_campaign') || undefined,
    };
    window.gtag('event', 'cta_click', eventParams);
    window.gtag('event', 'webapp_screen_view', eventParams);
  });
})();
