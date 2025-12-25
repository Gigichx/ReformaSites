// Reforma Sites - Interazioni principali
// Mobile-first, no dipendenze esterne

(function() {
  'use strict';

  // Helpers
  const qs = (sel, ctx=document) => ctx.querySelector(sel);
  const qsa = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

  // ================================
  // Menu Mobile (Hamburger)
  // ================================
  const menuToggle = qs('#menuToggle');
  const navMenu = qs('#navMenu');
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navMenu.classList.toggle('open');
    });

    // Chiudi al click su un link
    qsa('.nav-link', navMenu).forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        menuToggle.classList.remove('active');
      });
    });
  }

  // ================================
  // Header on scroll & Back-to-top
  // ================================
  const header = qs('#header');
  const backToTop = qs('#backToTop');
  const toggleScrollUI = () => {
    const scrolled = window.scrollY > 10;
    if (header) header.classList.toggle('scrolled', scrolled);
    if (backToTop) backToTop.classList.toggle('show', window.scrollY > 600);
  };
  window.addEventListener('scroll', toggleScrollUI);
  window.addEventListener('load', toggleScrollUI);
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ================================
  // Evidenziazione nav in base alla sezione
  // ================================
  const sections = ['home','produzioni','eventi','progetti','chi-siamo','contatti']
    .map(id => qs('#' + id))
    .filter(Boolean);
  const navLinks = qsa('.nav-link');

  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0.01 });

  sections.forEach(sec => sectionObserver.observe(sec));

  // ================================
  // Carosello Eventi in Evidenza
  // ================================
  const track = qs('#carouselTrack');
  const prevBtn = qs('#prevBtn');
  const nextBtn = qs('#nextBtn');
  const dotsContainer = qs('#carouselDots');
  if (track && prevBtn && nextBtn && dotsContainer) {
    const slides = qsa('.event-card', track);

    let currentIndex = 0;
    const slidesPerView = () => {
      if (window.innerWidth < 768) return 1;
      if (window.innerWidth < 992) return 2;
      return 3;
    };

    const pageCount = () => Math.max(1, Math.ceil(slides.length / slidesPerView()));

    const renderDots = () => {
      const pages = pageCount();
      dotsContainer.innerHTML = '';
      for (let i = 0; i < pages; i++) {
        const dot = document.createElement('span');
        dot.className = 'carousel-dot' + (i === currentIndex ? ' active' : '');
        dot.addEventListener('click', () => goTo(i));
        dotsContainer.appendChild(dot);
      }
    };

    const update = () => {
      const gap = parseFloat(getComputedStyle(track).gap) || 0;
      const card = slides[0];
      const cardWidth = card ? card.getBoundingClientRect().width : 0;
      const view = slidesPerView();
      const offset = (cardWidth + gap) * currentIndex * view;
      track.style.transform = `translateX(${-offset}px)`;
      renderDots();
    };

    const goTo = (page) => {
      const pages = pageCount();
      // loop infinito
      currentIndex = ((page % pages) + pages) % pages;
      update();
    };

    prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
    nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

    window.addEventListener('resize', () => {
      // Recalcola e mantiene la pagina corrente in range
      goTo(currentIndex);
    });

    // Auto-play (pausa su hover)
    let autoPlay = setInterval(() => goTo(currentIndex + 1), 6000);
    const container = prevBtn.parentElement;
    container.addEventListener('mouseenter', () => clearInterval(autoPlay));
    container.addEventListener('mouseleave', () => autoPlay = setInterval(() => goTo(currentIndex + 1), 6000));

    update();
  }

  // ================================
  // Tabs Produzioni
  // ================================
  const tabButtons = qsa('.tab-btn');
  const tabContents = qsa('.tab-content');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      tabButtons.forEach(b => b.classList.toggle('active', b === btn));
      tabContents.forEach(c => c.classList.toggle('active', c.id === tab));
    });
  });

  // ================================
  // Filtri Eventi
  // ================================
  const filterBtns = qsa('.filter-btn');
  const eventiGrid = qs('#eventiGrid');
  if (eventiGrid && filterBtns.length) {
    const items = qsa('.evento-item', eventiGrid);
    filterBtns.forEach(b => {
      b.addEventListener('click', () => {
        const f = b.getAttribute('data-filter');
        filterBtns.forEach(x => x.classList.toggle('active', x === b));
        items.forEach(it => {
          const cat = it.getAttribute('data-category');
          const show = (f === 'tutti') || (cat === f);
          it.classList.toggle('hidden', !show);
        });
      });
    });
  }

  // ================================
  // Gallery: filtri + lightbox con swipe
  // ================================
  const galleryGrid = qs('#galleryGrid');
  const galleryFilterBtns = qsa('.gallery-filter-btn');
  const lightbox = qs('#lightbox');
  const lightboxImg = qs('#lightboxImg');
  const lightboxCaption = qs('#lightboxCaption');
  const lightboxClose = qs('.lightbox-close');

  if (galleryGrid) {
    const gItems = qsa('.gallery-item', galleryGrid);

    // Filtri
    galleryFilterBtns.forEach(b => {
      b.addEventListener('click', () => {
        const f = b.getAttribute('data-filter-gallery');
        galleryFilterBtns.forEach(x => x.classList.toggle('active', x === b));
        gItems.forEach(it => {
          const cat = it.getAttribute('data-category-gallery');
          const show = (f === 'tutti') || (cat === f);
          it.style.display = show ? '' : 'none';
        });
      });
    });

    // Lightbox
    let currentIndex = 0;
    const visibleItems = () => gItems.filter(it => it.style.display !== 'none');

    const openLightbox = (idx) => {
      const items = visibleItems();
      const el = items[idx];
      if (!el) return;
      const img = qs('img', el);
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || '';
      lightboxCaption.textContent = img.alt || '';
      lightbox.classList.add('open');
      currentIndex = idx;
    };

    const closeLightbox = () => {
      lightbox.classList.remove('open');
      lightboxImg.src = '';
      lightboxCaption.textContent = '';
    };

    const next = () => {
      const items = visibleItems();
      if (!items.length) return;
      currentIndex = (currentIndex + 1) % items.length;
      openLightbox(currentIndex);
    };
    const prev = () => {
      const items = visibleItems();
      if (!items.length) return;
      currentIndex = (currentIndex - 1 + items.length) % items.length;
      openLightbox(currentIndex);
    };

    gItems.forEach((it, idx) => it.addEventListener('click', () => openLightbox(idx)));
    lightboxClose && lightboxClose.addEventListener('click', closeLightbox);
    lightbox && lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    });

    // Swipe su touch
    let startX = 0;
    lightbox && lightbox.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; });
    lightbox && lightbox.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) dx < 0 ? next() : prev();
    });
  }

  // ================================
  // Lazy loading migliorato (IntersectionObserver fallback su loading="lazy")
  // ================================
  const lazyImgs = qsa('img[loading="lazy"]');
  if ('IntersectionObserver' in window && lazyImgs.length) {
    const lazyObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          // se avessimo data-src potremmo swapparlo; qui lasciamo nativo
          lazyObs.unobserve(img);
        }
      });
    }, { rootMargin: '200px' });
    lazyImgs.forEach(img => lazyObs.observe(img));
  }

  // ================================
  // Animazioni on-scroll (reveal)
  // ================================
  const revealEls = qsa('.reveal');
  if (revealEls.length) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });
    revealEls.forEach(el => obs.observe(el));
  }

  // ================================
  // Validazione Form Contatti
  // ================================
  const contactForm = qs('#contactForm');
  const formMessage = qs('#formMessage');
  if (contactForm) {
    const validateEmail = (email) => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email);

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(contactForm);
      const nome = data.get('nome').trim();
      const email = data.get('email').trim();
      const telefono = data.get('telefono').trim();
      const motivo = data.get('motivo');
      const messaggio = data.get('messaggio').trim();
      const privacy = qs('#privacy').checked;

      let errors = [];
      if (!nome) errors.push('Nome richiesto.');
      if (!email || !validateEmail(email)) errors.push('Email non valida.');
      if (!motivo) errors.push('Seleziona il motivo del contatto.');
      if (!messaggio) errors.push('Inserisci un messaggio.');
      if (!privacy) errors.push('Devi accettare la Privacy Policy.');

      if (errors.length) {
        formMessage.textContent = errors.join(' ');
        formMessage.className = 'form-message error';
        return;
      }

      // Simulazione invio (potrebbe essere sostituito con fetch verso backend)
      setTimeout(() => {
        formMessage.textContent = 'Grazie! Messaggio inviato correttamente.';
        formMessage.className = 'form-message success';
        contactForm.reset();
      }, 500);
    });
  }

})();
