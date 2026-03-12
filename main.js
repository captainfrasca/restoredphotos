/* =============================================
   VICTORIAN PHOTO ARCHIVE — main.js
   Before/After Slider · Lightbox · Nav · Filter
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ─── Mobile Nav ─────────────────────────── */
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      toggle.setAttribute('aria-expanded', navLinks.classList.contains('open'));
    });
    document.addEventListener('click', e => {
      if (!e.target.closest('.site-nav')) navLinks.classList.remove('open');
    });
  }

  /* ─── Active Nav Link ────────────────────── */
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === currentPage) a.classList.add('active');
  });

  /* ─── Before / After Sliders ─────────────── */
  document.querySelectorAll('.before-after-container').forEach(initSlider);

  function initSlider(container) {
    const beforeDiv = container.querySelector('.ba-before');
    const handle    = container.querySelector('.ba-handle');
    if (!beforeDiv || !handle) return;

    let dragging = false;
    let pct = 50;

    function setPosition(x) {
      const rect = container.getBoundingClientRect();
      pct = Math.min(100, Math.max(0, ((x - rect.left) / rect.width) * 100));
      beforeDiv.style.width = pct + '%';
      handle.style.left     = pct + '%';
    }

    setPosition(container.getBoundingClientRect().left + container.offsetWidth * 0.5);

    // Mouse
    handle.addEventListener('mousedown',  e => { dragging = true; e.preventDefault(); });
    container.addEventListener('mousedown', e => { dragging = true; setPosition(e.clientX); });
    document.addEventListener('mousemove', e => { if (dragging) setPosition(e.clientX); });
    document.addEventListener('mouseup',   () => { dragging = false; });

    // Touch
    handle.addEventListener('touchstart',  e => { dragging = true; }, { passive: true });
    container.addEventListener('touchstart', e => {
      dragging = true;
      setPosition(e.touches[0].clientX);
    }, { passive: true });
    document.addEventListener('touchmove', e => {
      if (dragging) setPosition(e.touches[0].clientX);
    }, { passive: true });
    document.addEventListener('touchend', () => { dragging = false; });
  }

  /* ─── Lightbox ───────────────────────────── */
  const lightbox   = document.querySelector('.lightbox');
  const lbImg      = document.querySelector('.lightbox-img');
  const lbCaption  = document.querySelector('.lightbox-caption');
  const lbClose    = document.querySelector('.lightbox-close');
  const lbPrev     = document.querySelector('.lightbox-prev');
  const lbNext     = document.querySelector('.lightbox-next');

  if (!lightbox) return;

  let items   = [];
  let current = 0;

  function openLightbox(index) {
    current = index;
    const item = items[current];
    lbImg.src = item.src;
    lbImg.alt = item.alt || '';
    lbCaption.textContent = item.caption || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function showPrev() {
    current = (current - 1 + items.length) % items.length;
    openLightbox(current);
  }

  function showNext() {
    current = (current + 1) % items.length;
    openLightbox(current);
  }

  // Collect lightbox targets
  function collectItems() {
    items = [];
    document.querySelectorAll('[data-lightbox]').forEach((el, i) => {
      const src     = el.dataset.src || el.querySelector('img')?.src || el.src;
      const caption = el.dataset.caption || el.querySelector('.gallery-item-info h4')?.textContent || '';
      const alt     = el.querySelector('img')?.alt || '';
      items.push({ src, caption, alt });
      el.addEventListener('click', () => openLightbox(i));
    });
  }
  collectItems();

  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lbPrev)  lbPrev.addEventListener('click', showPrev);
  if (lbNext)  lbNext.addEventListener('click', showNext);

  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  showPrev();
    if (e.key === 'ArrowRight') showNext();
  });

  /* ─── Gallery Filter ─────────────────────── */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      galleryItems.forEach(item => {
        const show = filter === 'all' || item.dataset.category === filter;
        item.style.display = show ? '' : 'none';
      });
      // Re-collect lightbox items after filter
      collectItems();
    });
  });

  /* ─── Smooth scroll for anchor links ─────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ─── Fade-in on scroll ──────────────────── */
  const fadeEls = document.querySelectorAll('.photo-card, .gallery-item, .process-step, .timeline-entry, .restoration-pair');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08 });

    fadeEls.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(18px)';
      el.style.transition = 'opacity .55s ease, transform .55s ease';
      io.observe(el);
    });
  }

  /* ─── Contact form ────────────────────────── */
  const form = document.querySelector('.archive-contact-form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('[type=submit]');
      const orig = btn.textContent;
      btn.textContent = 'Enquiry Received';
      btn.disabled = true;
      btn.style.background = 'linear-gradient(135deg, #4a8a5a, #5a9a6a)';
      setTimeout(() => {
        btn.textContent = orig;
        btn.disabled = false;
        btn.style.background = '';
        form.reset();
      }, 4000);
    });
  }

});
