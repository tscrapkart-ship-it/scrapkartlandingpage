/* ===================================================================
   ScrapKart Main Landing — Interaction Layer
   - Splash dismiss (always shows on page load — no sessionStorage gate)
   - Lenis smooth scroll
   - Top scroll progress bar
   - IntersectionObserver reveals
   - Stat counter animation (Indian numbering)
   - Sticky-nav frosted glass on scroll
   - World-card cursor spotlight
   - In-page anchor smooth scroll via Lenis
   ================================================================ */

(function () {
  'use strict';

  // Mark JS-ready immediately so CSS can switch reveal targets to hidden state.
  document.documentElement.classList.add('js-ready');

  // Schedule splash dismiss right away — runs even before DOMContentLoaded fires.
  scheduleSplashDismiss();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Defensive runner — a failure in one setup can never block the others.
  // This is the difference between the hamburger working and not working.
  function safe(label, fn) {
    try { fn(); } catch (err) {
      // eslint-disable-next-line no-console
      if (window.console) console.warn('[scrapkart] ' + label + ' failed', err);
    }
  }

  function init() {
    // Critical UX first — these MUST run, even if the nice-to-haves explode below.
    safe('mobile-menu', setupMobileMenu);
    safe('nav-scroll',  setupNavScroll);
    safe('anchor',      setupAnchorScroll);

    // Animation/polish layer — failures here are harmless.
    safe('lenis',       setupLenis);
    safe('reveal',      setupRevealObserver);
    safe('counters',    setupStatCounters);
    safe('progress',    setupScrollProgress);
    safe('spotlight',   setupCardSpotlight);
  }

  // ------------------------------------------------------------------
  // Splash — dismiss after a beat. Always shows on page load.
  // ------------------------------------------------------------------
  function scheduleSplashDismiss() {
    setTimeout(function () {
      document.documentElement.classList.add('splash-done');
      // remove from DOM after the fade-out completes
      setTimeout(function () {
        const el = document.getElementById('splash');
        if (el && el.parentNode) el.parentNode.removeChild(el);
      }, 1100);
    }, 1500);
  }

  // ------------------------------------------------------------------
  // Lenis smooth scroll
  // ------------------------------------------------------------------
  let lenisInstance = null;

  function setupLenis() {
    if (typeof window.Lenis === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    lenisInstance = new window.Lenis({
      duration: 1.15,
      easing: function (t) { return 1 - Math.pow(1 - t, 3); },
      smoothWheel: true,
      syncTouch: false,
      gestureOrientation: 'vertical',
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    function raf(time) {
      if (lenisInstance) lenisInstance.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // ------------------------------------------------------------------
  // In-page anchor links — route through Lenis when available
  // ------------------------------------------------------------------
  function setupAnchorScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        const href = link.getAttribute('href');
        if (!href || href === '#') return;

        const isTop = href === '#top';
        const target = isTop ? null : document.querySelector(href);
        if (!isTop && !target) return;

        e.preventDefault();

        if (lenisInstance) {
          lenisInstance.scrollTo(isTop ? 0 : target, { offset: -64 });
        } else if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });
  }

  // ------------------------------------------------------------------
  // Top scroll progress bar
  // ------------------------------------------------------------------
  function setupScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;

    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
        bar.style.width = progress.toFixed(2) + '%';
        ticking = false;
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ------------------------------------------------------------------
  // Reveal observer
  // ------------------------------------------------------------------
  function setupRevealObserver() {
    const targets = document.querySelectorAll('.reveal');
    if (!targets.length || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    const observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          const delay = Math.min(i * 70, 280);
          setTimeout(function () { entry.target.classList.add('is-visible'); }, delay);
          obs.unobserve(entry.target);
        }
      });
    }, {
      // Lenient: any pixel of the element entering the viewport triggers the reveal.
      // Tighter rules occasionally left elements stuck invisible on small screens.
      rootMargin: '0px',
      threshold: 0.01
    });

    targets.forEach(function (el) { observer.observe(el); });

    // Safety net: if anything is still hidden after a beat, force-reveal it.
    // Prevents content from being stranded at opacity:0 if the observer mis-fires.
    setTimeout(function () {
      targets.forEach(function (el) {
        if (!el.classList.contains('is-visible')) {
          el.classList.add('is-visible');
        }
      });
    }, 1200);
  }

  // ------------------------------------------------------------------
  // Stat counters — Indian numbering format
  // ------------------------------------------------------------------
  function setupStatCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    const formatINR = new Intl.NumberFormat('en-IN');

    function formatValue(value, target) {
      if (target >= 10000000) {
        const cr = value / 10000000;
        return cr >= 1
          ? cr.toFixed(cr >= 10 ? 0 : 1) + ' Cr'
          : formatINR.format(Math.round(value));
      }
      if (target >= 100000) {
        const l = value / 100000;
        return l.toFixed(l >= 10 ? 0 : 1) + ' L';
      }
      return formatINR.format(Math.round(value));
    }

    function animate(el) {
      const target = parseFloat(el.dataset.target) || 0;
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      const duration = 1600;
      const start = performance.now();

      function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

      function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(progress);
        const value = target * eased;
        el.textContent = prefix + formatValue(value, target) + suffix;
        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          el.textContent = prefix + formatValue(target, target) + suffix;
        }
      }
      requestAnimationFrame(tick);
    }

    if (!('IntersectionObserver' in window)) {
      counters.forEach(animate);
      return;
    }

    const observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animate(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function (c) { observer.observe(c); });
  }

  // ------------------------------------------------------------------
  // Sticky nav — fade in the bottom hairline once scrolled
  // ------------------------------------------------------------------
  function setupNavScroll() {
    const nav = document.getElementById('nav');
    if (!nav) return;

    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        if (window.scrollY > 40) nav.classList.add('is-scrolled');
        else nav.classList.remove('is-scrolled');
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ------------------------------------------------------------------
  // Mobile menu — hamburger toggle + drawer open/close
  // ------------------------------------------------------------------
  function setupMobileMenu() {
    const toggle = document.getElementById('nav-toggle');
    const menu = document.getElementById('mobile-menu');
    if (!toggle || !menu) return;

    function open() {
      toggle.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close menu');
      menu.classList.add('is-open');
      menu.setAttribute('aria-hidden', 'false');
      document.documentElement.classList.add('menu-open');
      if (lenisInstance && typeof lenisInstance.stop === 'function') lenisInstance.stop();
    }

    function close() {
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
      menu.classList.remove('is-open');
      menu.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('menu-open');
      if (lenisInstance && typeof lenisInstance.start === 'function') lenisInstance.start();
    }

    toggle.addEventListener('click', function () {
      if (toggle.classList.contains('is-open')) close();
      else open();
    });

    // Close on any link click inside the drawer
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        // small delay so the smooth scroll target is captured before we close
        setTimeout(close, 80);
      });
    });

    // Escape closes
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.classList.contains('is-open')) close();
    });

    // Close if user resizes back to desktop while open
    let resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (window.innerWidth >= 768 && toggle.classList.contains('is-open')) close();
      }, 200);
    });
  }

  // ------------------------------------------------------------------
  // World card spotlight — cursor-aware radial gradient
  // ------------------------------------------------------------------
  function setupCardSpotlight() {
    if (window.matchMedia('(hover: none)').matches) return;

    const cards = document.querySelectorAll('.world-card');
    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mx', x + '%');
        card.style.setProperty('--my', y + '%');
      });
    });
  }
})();
