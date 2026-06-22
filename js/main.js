/**
 * main.js
 * Handles: sticky header, mobile menu, scroll reveal,
 * active nav link tracking, back-to-top button, footer year.
 */
(function () {
  'use strict';

  /* ── Utilities ─────────────────────────────────────────────────── */
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Footer year ───────────────────────────────────────────────── */
  var yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ── Header scroll state ────────────────────────────────────────── */
  var header = document.getElementById('site-header');

  function onHeaderScroll() {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 10);
  }
  onHeaderScroll();
  window.addEventListener('scroll', onHeaderScroll, { passive: true });

  /* ── Mobile menu ────────────────────────────────────────────────── */
  var toggle     = document.getElementById('nav-toggle');
  var mobileMenu = document.getElementById('mobile-menu');

  function closeMenu() {
    if (!toggle || !mobileMenu) return;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.classList.remove('is-open');
    mobileMenu.setAttribute('data-state', 'closed');
  }

  function openMenu() {
    toggle.setAttribute('aria-expanded', 'true');
    toggle.classList.add('is-open');
    mobileMenu.setAttribute('data-state', 'open');
  }

  if (toggle && mobileMenu) {
    toggle.addEventListener('click', function () {
      var isOpen = toggle.getAttribute('aria-expanded') === 'true';
      if (isOpen) { closeMenu(); } else { openMenu(); }
    });

    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });

    document.addEventListener('click', function (e) {
      if (
        mobileMenu.getAttribute('data-state') === 'open' &&
        !mobileMenu.contains(e.target) &&
        !toggle.contains(e.target)
      ) { closeMenu(); }
    });
  }

  /* ── Active nav link via IntersectionObserver ───────────────────── */
  var navLinks = document.querySelectorAll('[data-nav-link]');
  var sections = document.querySelectorAll('main section[id], footer[id]');

  if ('IntersectionObserver' in window && sections.length) {
    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.getAttribute('id');
          navLinks.forEach(function (link) {
            var match = link.getAttribute('href') === '#' + id;
            link.classList.toggle('is-active', match);
            if (match) {
              link.setAttribute('aria-current', 'true');
            } else {
              link.removeAttribute('aria-current');
            }
          });
        });
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    );
    sections.forEach(function (s) { navObserver.observe(s); });
  }

  /* ── Scroll Reveal ──────────────────────────────────────────────── */
  var revealItems = document.querySelectorAll('[data-reveal]');

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach(function (el) { el.classList.add('visible'); });
  } else {
    revealItems.forEach(function (el) {
      var delay = el.getAttribute('data-reveal-delay');
      if (delay) el.style.setProperty('--reveal-delay', delay + 'ms');
    });

    var revealObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealItems.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ── Back to top ────────────────────────────────────────────────── */
  var backBtn = document.getElementById('back-to-top');

  function onScrollBTT() {
    if (!backBtn) return;
    backBtn.classList.toggle('visible', window.scrollY > 600);
  }
  onScrollBTT();
  window.addEventListener('scroll', onScrollBTT, { passive: true });

  if (backBtn) {
    backBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ── Card glow spotlight (pointer tracking) ─────────────────────── */
  var isTouchDevice = window.matchMedia('(hover: none)').matches;

  if (!prefersReducedMotion && !isTouchDevice) {
    document.querySelectorAll('.work-card').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--gx', ((e.clientX - r.left) / r.width * 100) + '%');
        card.style.setProperty('--gy', ((e.clientY - r.top)  / r.height * 100) + '%');
        card.style.setProperty('--glow-opacity', '1');
      });
      card.addEventListener('pointerleave', function () {
        card.style.setProperty('--glow-opacity', '0');
      });
    });
  }

  /* ── Smooth scroll for all anchor links ─────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });

})();

  /* ── Work section filter ─────────────────────────────────────────── */
  var filterBar   = document.getElementById('work-filter-bar');
  var workCards   = document.querySelectorAll('.work-card[data-filter]');
  var filterBtns  = document.querySelectorAll('.filter-btn');

  function applyFilter(selected) {
    filterBtns.forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-filter') === selected);
    });

    workCards.forEach(function (card) {
      var match = selected === 'all' || card.getAttribute('data-filter') === selected;
      if (match) {
        card.removeAttribute('data-hidden');
        card.style.animation = 'fadeSlideIn 0.3s var(--ease) both';
      } else {
        card.setAttribute('data-hidden', 'true');
        card.style.animation = '';
      }
    });
  }

  if (filterBar) {
    filterBar.addEventListener('click', function (e) {
      var btn = e.target.closest('.filter-btn');
      if (!btn) return;
      applyFilter(btn.getAttribute('data-filter'));
    });
  }
