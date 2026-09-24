(() => {
  const cfg = window.SITE_CONFIG || {};
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const $ = (s, c = document) => c.querySelector(s);
  const whatsappUrl = (message = cfg.whatsappMessage || '') =>
    `https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent(message)}`;

  // Links and contact data
  $$('[data-whatsapp]').forEach(a => {
    a.href = whatsappUrl();
    a.target = '_blank';
    a.rel = 'noopener';
  });
  $$('[data-instagram]').forEach(a => a.href = cfg.instagram);
  $$('[data-phone]').forEach(a => {
    a.href = `tel:+${cfg.whatsapp}`;
    a.textContent = cfg.phoneDisplay;
  });

  const mapQuery = encodeURIComponent(cfg.address || '');
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
  const mapFrame = $('#map-frame');
  if (mapFrame) mapFrame.src = `https://www.google.com/maps?q=${mapQuery}&output=embed`;
  const mapsLink = $('#maps-link');
  if (mapsLink) mapsLink.href = mapUrl;
  $$('[data-maps]').forEach(a => a.href = mapUrl);
  const addressText = $('#address-text');
  if (addressText && cfg.address) {
    addressText.innerHTML = cfg.address.replace(' - São Luiz, ', '<br>São Luiz • ');
  }

  // Structured data for local discovery / SEO
  const schema = $('#business-schema');
  if (schema && cfg.businessName) {
    schema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BeautySalon',
      name: cfg.businessName,
      telephone: cfg.whatsapp ? `+${cfg.whatsapp}` : cfg.phoneDisplay,
      sameAs: cfg.instagram ? [cfg.instagram] : [],
      address: {
        '@type': 'PostalAddress',
        ...(cfg.addressParts || {})
      }
    });
  }

  const icons = {
    scissors: '<svg viewBox="0 0 24 24"><circle cx="6" cy="7" r="3"/><circle cx="6" cy="17" r="3"/><path d="M8.6 8.5L20 3M8.6 15.5L20 21M9 12h5"/></svg>',
    spark: '<svg viewBox="0 0 24 24"><path d="M12 2l1.7 5.3L19 9l-5.3 1.7L12 16l-1.7-5.3L5 9l5.3-1.7L12 2zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z"/></svg>',
    drop: '<svg viewBox="0 0 24 24"><path d="M12 2S5.5 9.1 5.5 14.3a6.5 6.5 0 0013 0C18.5 9.1 12 2 12 2z"/><path d="M9 15.5a3.3 3.3 0 003 2"/></svg>',
    wind: '<svg viewBox="0 0 24 24"><path d="M3 8h11c2.8 0 3.1-4 0-4-1.2 0-2 .6-2.4 1.3M3 12h16c3 0 3 4 0 4h-2M3 16h8c3 0 3 4 0 4-1.2 0-2-.5-2.5-1.2"/></svg>',
    face: '<svg viewBox="0 0 24 24"><path d="M12 3a8 8 0 108 8c0-4.4-3.6-8-8-8z"/><path d="M9 10h.01M15 10h.01M9.5 15c1.5 1 3.5 1 5 0"/></svg>',
    star: '<svg viewBox="0 0 24 24"><path d="M12 3l2.5 5.4 5.5.8-4 4 1 5.6-5-2.7-5 2.7 1-5.6-4-4 5.5-.8L12 3z"/></svg>'
  };

  // Services + contextual conversion
  const serviceGrid = $('#service-grid');
  if (serviceGrid && Array.isArray(cfg.services)) {
    serviceGrid.innerHTML = cfg.services.map((s, i) => `
      <article class="service-card reveal" style="--d:${i * 70}ms">
        <div class="service-top"><span class="service-num">${s.number}</span><span class="service-icon">${icons[s.icon] || icons.star}</span></div>
        <h3>${s.title}</h3><p>${s.text}</p>
        <button class="service-more" type="button" data-service-index="${i}" aria-label="Ver detalhes de ${s.title}">Ver detalhes <span>→</span></button>
      </article>
    `).join('');
  }

  const modal = $('#service-modal');
  const modalTitle = $('#service-modal-title');
  const modalDescription = $('#service-modal-description');
  const modalNumber = $('#service-modal-number');
  const modalIcon = $('#service-modal-icon');
  const modalHighlights = $('#service-highlights');
  const modalWhatsApp = $('#service-modal-whatsapp');
  let modalReturnFocus = null;

  const closeServiceModal = () => {
    if (!modal?.classList.contains('is-open')) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    const focusTarget = modalReturnFocus;
    modalReturnFocus = null;
    window.setTimeout(() => focusTarget?.focus(), 180);
  };

  const openServiceModal = (index, trigger) => {
    const service = cfg.services?.[index];
    if (!service || !modal) return;
    modalReturnFocus = trigger || document.activeElement;
    modalTitle.textContent = service.title;
    modalDescription.textContent = service.detail || service.text;
    modalNumber.textContent = service.number;
    modalIcon.innerHTML = icons[service.icon] || icons.star;
    modalHighlights.innerHTML = (service.highlights || []).map(item => `<span>${item}</span>`).join('');
    modalWhatsApp.href = whatsappUrl(service.whatsappMessage || `Olá! Vim pelo site do Espaço Sol e gostaria de saber mais sobre ${service.title}.`);
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    window.requestAnimationFrame(() => $('.service-modal-close', modal)?.focus());
  };

  $$('[data-service-index]').forEach(button => {
    button.addEventListener('click', () => openServiceModal(Number(button.dataset.serviceIndex), button));
  });
  $$('[data-modal-close]').forEach(button => button.addEventListener('click', closeServiceModal));

  // FAQ accordion
  const faqList = $('#faq-list');
  if (faqList && Array.isArray(cfg.faqs)) {
    faqList.innerHTML = cfg.faqs.map((item, i) => `
      <article class="faq-item reveal" style="--d:${i * 55}ms">
        <button class="faq-question" type="button" aria-expanded="false" aria-controls="faq-answer-${i}">
          <span>${String(i + 1).padStart(2, '0')}</span>
          <strong>${item.question}</strong>
          <i aria-hidden="true"></i>
        </button>
        <div class="faq-answer" id="faq-answer-${i}" aria-hidden="true"><div><p>${item.answer}</p></div></div>
      </article>
    `).join('');

    $$('.faq-question', faqList).forEach(button => {
      button.addEventListener('click', () => {
        const item = button.closest('.faq-item');
        const willOpen = !item.classList.contains('is-open');
        $$('.faq-item.is-open', faqList).forEach(openItem => {
          if (openItem !== item) {
            openItem.classList.remove('is-open');
            $('.faq-question', openItem)?.setAttribute('aria-expanded', 'false');
            $('.faq-answer', openItem)?.setAttribute('aria-hidden', 'true');
          }
        });
        item.classList.toggle('is-open', willOpen);
        button.setAttribute('aria-expanded', String(willOpen));
        $('.faq-answer', item)?.setAttribute('aria-hidden', String(!willOpen));
      });
    });
  }

  // Mobile menu
  const navToggle = $('.nav-toggle');
  const nav = $('.main-nav');
  const closeNav = () => {
    document.body.classList.remove('nav-open');
    navToggle?.setAttribute('aria-expanded', 'false');
    navToggle?.setAttribute('aria-label', 'Abrir menu');
  };
  navToggle?.addEventListener('click', () => {
    const open = document.body.classList.toggle('nav-open');
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  });
  $$('.main-nav a').forEach(a => a.addEventListener('click', closeNav));
  window.addEventListener('resize', () => { if (innerWidth > 900) closeNav(); });

  // Keyboard behavior: modal has priority over navigation.
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (modal?.classList.contains('is-open')) closeServiceModal();
      else closeNav();
      return;
    }
    if (e.key === 'Tab' && modal?.classList.contains('is-open')) {
      const focusables = $$('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])', modal)
        .filter(el => el.offsetParent !== null && el.tabIndex >= 0);
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
  });

  // Compact header after scroll
  const header = $('.site-header');
  const onScroll = () => header?.classList.toggle('scrolled', scrollY > 28);
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });

  // Soft reveal motion; all dynamic elements are rendered before observing.
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: .12, rootMargin: '0px 0px -28px' });
    $$('.reveal').forEach(el => io.observe(el));
  } else {
    $$('.reveal').forEach(el => el.classList.add('in-view'));
  }

  const glow = $('.cursor-glow');
  if (glow && matchMedia('(pointer:fine)').matches) {
    addEventListener('pointermove', e => {
      glow.style.transform = `translate3d(${e.clientX - 180}px, ${e.clientY - 180}px, 0)`;
    }, { passive: true });
  }

  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
