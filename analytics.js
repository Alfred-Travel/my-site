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

  function createHandoffId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }

    return 'handoff-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
  }

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link || typeof window.gtag !== 'function') return;

    const url = new URL(link.href, window.location.href);
    if (url.hostname !== 'web.alfredtravel.io') return;

    const query = new URLSearchParams(window.location.search);
    const handoffId = createHandoffId();
    url.searchParams.set('handoff_id', handoffId);
    url.searchParams.set('source_page', window.location.pathname);
    url.searchParams.set('cta_name', 'plan_a_trip');
    for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
      const value = query.get(key);
      if (value) url.searchParams.set(key, value);
    }

    const eventParams = {
      cta_name: 'plan_a_trip',
      cta_text: link.textContent.trim(),
      link_url: url.href,
      page_path: window.location.pathname,
      cta_location: link.closest('header, main, footer')?.tagName.toLowerCase() || 'unknown',
      handoff_id: handoffId,
      campaign_source: query.get('utm_source') || undefined,
      campaign_medium: query.get('utm_medium') || undefined,
      campaign_campaign: query.get('utm_campaign') || undefined,
      campaign_content: query.get('utm_content') || undefined,
      campaign_term: query.get('utm_term') || undefined,
    };

    // Preserve the existing public-site event for continuity while adding the
    // dedicated handoff event required for public-to-authenticated joins.
    window.gtag('event', 'cta_click', eventParams);
    window.gtag('event', 'openwebapp', eventParams);
  });
})();
