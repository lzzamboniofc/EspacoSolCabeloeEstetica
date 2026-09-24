(() => {
  const cfg = window.SITE_CONFIG || {};
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const $ = (s, c = document) => c.querySelector(s);

  const waUrl = `https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent(cfg.whatsappMessage || '')}`;
  $$('[data-whatsapp]').forEach(a => { a.href = waUrl; a.target = '_blank'; a.rel = 'noopener'; });
  $$('[data-instagram]').forEach(a => a.href = cfg.instagram);
  $$('[data-phone]').forEach(a => { a.href = `tel:+${cfg.whatsapp}`; a.textContent = cfg.phoneDisplay; });

  const mapQuery = encodeURIComponent(cfg.address);
  const mapFrame = $('#map-frame');
  if (mapFrame) mapFrame.src = `https://www.google.com/maps?q=${mapQuery}&output=embed`;
  const mapsLink = $('#maps-link');
  if (mapsLink) mapsLink.href = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
  const addressText = $('#address-text');
  if (addressText) addressText.innerHTML = cfg.address.replace(' - São Luiz, ', '<br>São Luiz • ');

  const icons = {
    scissors: '<svg viewBox="0 0 24 24"><circle cx="6" cy="7" r="3"/><circle cx="6" cy="17" r="3"/><path d="M8.6 8.5L20 3M8.6 15.5L20 21M9 12h5"/></svg>',
    spark: '<svg viewBox="0 0 24 24"><path d="M12 2l1.7 5.3L19 9l-5.3 1.7L12 16l-1.7-5.3L5 9l5.3-1.7L12 2zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z"/></svg>',
    drop: '<svg viewBox="0 0 24 24"><path d="M12 2S5.5 9.1 5.5 14.3a6.5 6.5 0 0013 0C18.5 9.1 12 2 12 2z"/><path d="M9 15.5a3.3 3.3 0 003 2"/></svg>',
    wind: '<svg viewBox="0 0 24 24"><path d="M3 8h11c2.8 0 3.1-4 0-4-1.2 0-2 .6-2.4 1.3M3 12h16c3 0 3 4 0 4h-2M3 16h8c3 0 3 4 0 4-1.2 0-2-.5-2.5-1.2"/></svg>',
    face: '<svg viewBox="0 0 24 24"><path d="M12 3a8 8 0 108 8c0-4.4-3.6-8-8-8z"/><path d="M9 10h.01M15 10h.01M9.5 15c1.5 1 3.5 1 5 0"/></svg>',
    star: '<svg viewBox="0 0 24 24"><path d="M12 3l2.5 5.4 5.5.8-4 4 1 5.6-5-2.7-5 2.7 1-5.6-4-4 5.5-.8L12 3z"/></svg>'
  };

  const serviceGrid = $('#service-grid');
  if (serviceGrid && Array.isArray(cfg.services)) {
    serviceGrid.innerHTML = cfg.services.map((s, i) => `
      <article class="service-card reveal" style="--d:${i * 70}ms">
        <div class="service-top"><span class="service-num">${s.number}</span><span class="service-icon">${icons[s.icon] || icons.star}</span></div>
        <h3>${s.title}</h3><p>${s.text}</p>
        <a href="${waUrl}" target="_blank" rel="noopener" aria-label="Consultar ${s.title} pelo WhatsApp">Consultar <span>↗</span></a>
      </article>
    `).join('');
  }

  const navToggle = $('.nav-toggle');
  const nav = $('.main-nav');
  const closeNav = () => { document.body.classList.remove('nav-open'); navToggle?.setAttribute('aria-expanded', 'false'); };
  navToggle?.addEventListener('click', () => {
    const open = document.body.classList.toggle('nav-open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  $$('.main-nav a').forEach(a => a.addEventListener('click', closeNav));
  window.addEventListener('resize', () => { if (innerWidth > 900) closeNav(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeNav(); });

  const header = $('.site-header');
  const onScroll = () => header?.classList.toggle('scrolled', scrollY > 28);
  onScroll(); addEventListener('scroll', onScroll, { passive: true });

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); }
    });
  }, { threshold: .14, rootMargin: '0px 0px -40px' });
  $$('.reveal').forEach(el => io.observe(el));

  const glow = $('.cursor-glow');
  if (glow && matchMedia('(pointer:fine)').matches) {
    addEventListener('pointermove', e => {
      glow.style.transform = `translate3d(${e.clientX - 180}px, ${e.clientY - 180}px, 0)`;
    }, { passive: true });
  }

  $('#year').textContent = new Date().getFullYear();
})();
