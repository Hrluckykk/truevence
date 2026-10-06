/* ============================================================
   Truevence — Universal Custom Cursor
   ------------------------------------------------------------
   Self-contained. Injects its own styles and DOM nodes so the
   cursor works on every page regardless of what header partial,
   styles.css, or scripts.js happens to be loaded.

   - Only runs on fine-pointer devices (desktop / laptops).
   - Respects prefers-reduced-motion.
   - Idempotent: safe to load multiple times.
   - Does NOT interfere with any other script's cursor logic
     IF you remove the duplicate from scripts.js. If you don't
     remove it, this file still wins because it runs last.
   ============================================================ */

(function () {
  'use strict';

  // ---------- Guard: only init once per page ----------
  if (window.__truevenceCursorInit) return;
  window.__truevenceCursorInit = true;

  // ---------- Guard: only on fine-pointer devices ----------
  var finePointer = false;
  try {
    finePointer = window.matchMedia('(pointer: fine)').matches;
  } catch (e) {
    finePointer = false;
  }
  if (!finePointer) return;

  // ---------- Guard: respect prefers-reduced-motion ----------
  var reduceMotion = false;
  try {
    reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {
    reduceMotion = false;
  }

  // ---------- Inject styles once ----------
  var STYLE_ID = 'tv-cursor-styles';
  if (!document.getElementById(STYLE_ID)) {
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.tv-cursor-ring, .tv-cursor-core {',
      '  position: fixed !important;',
      '  top: 0 !important;',
      '  left: 0 !important;',
      '  pointer-events: none !important;',
      '  z-index: 2147483647 !important;',
      '  opacity: 0;',
      '  will-change: transform, width, height, opacity;',
      '  transition: opacity .25s ease, width .3s ease, height .3s ease, border-color .3s ease, background-color .3s ease;',
      '}',
      '.tv-cursor-ring {',
      '  width: 32px; height: 32px;',
      '  border: 1.5px solid rgba(124, 58, 237, .55);',
      '  border-radius: 50%;',
      '  background: transparent;',
      '}',
      '.tv-cursor-core {',
      '  width: 6px; height: 6px;',
      '  background: #7C3AED;',
      '  border-radius: 50%;',
      '}',
      'body.tv-cursor-ready .tv-cursor-ring,',
      'body.tv-cursor-ready .tv-cursor-core { opacity: 1; }',
      'body.tv-cursor-active .tv-cursor-ring {',
      '  width: 48px; height: 48px;',
      '  border-color: rgba(124, 58, 237, .9);',
      '}',
      'body.tv-cursor-active .tv-cursor-core {',
      '  background: #A78BFA;',
      '}',
      /* Hide native cursor site-wide while custom cursor is active */
      'body.tv-cursor-on,',
      'body.tv-cursor-on a,',
      'body.tv-cursor-on button,',
      'body.tv-cursor-on input,',
      'body.tv-cursor-on textarea,',
      'body.tv-cursor-on select,',
      'body.tv-cursor-on label,',
      'body.tv-cursor-on [role="button"] { cursor: none !important; }',
      /* Touch devices: make sure nothing weird is left behind */
      '@media (pointer: coarse) {',
      '  .tv-cursor-ring, .tv-cursor-core { display: none !important; }',
      '}',
      /* Reduced motion: fade rather than glide */
      '@media (prefers-reduced-motion: reduce) {',
      '  .tv-cursor-ring, .tv-cursor-core { transition: none !important; }',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  // ---------- Ensure DOM nodes exist ----------
  function ensureNode(className) {
    var el = document.querySelector('.' + className);
    if (el) return el;
    el = document.createElement('div');
    el.className = className;
    el.setAttribute('aria-hidden', 'true');
    document.body.appendChild(el);
    return el;
  }

  // Wait for body to exist if the script is loaded in <head>
  function boot() {
    var ring = ensureNode('tv-cursor-ring');
    var core = ensureNode('tv-cursor-core');

    document.body.classList.add('tv-cursor-on');

    var mx = window.innerWidth / 2;
    var my = window.innerHeight / 2;
    var rx = mx;
    var ry = my;
    var ready = false;

    // Core (dot) follows instantly
    window.addEventListener('mousemove', function (e) {
      mx = e.clientX;
      my = e.clientY;
      core.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
      if (!ready) {
        ready = true;
        document.body.classList.add('tv-cursor-ready');
      }
    }, { passive: true });

    // Ring follows with easing
    if (reduceMotion) {
      // Skip the RAF loop; put the ring where the core is
      window.addEventListener('mousemove', function () {
        ring.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
      }, { passive: true });
    } else {
      (function raf() {
        rx += (mx - rx) * 0.45;
        ry += (my - ry) * 0.45;
        ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
        requestAnimationFrame(raf);
      })();
    }

    // Hover state on interactive elements
    var hoverables = 'a, button, input, textarea, select, label, [role="button"], [data-cursor-hover]';
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest && e.target.closest(hoverables)) {
        document.body.classList.add('tv-cursor-active');
      }
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest && e.target.closest(hoverables)) {
        document.body.classList.remove('tv-cursor-active');
      }
    });

    // Hide cursor when leaving the window, show on re-enter
    window.addEventListener('mouseleave', function () {
      document.body.classList.remove('tv-cursor-ready');
    });
    window.addEventListener('mouseenter', function () {
      document.body.classList.add('tv-cursor-ready');
    });

    // Reposition on resize so the ring doesn't sit somewhere stale
    window.addEventListener('resize', function () {
      rx = mx; ry = my;
    }, { passive: true });

    // Re-ensure nodes on DOM changes (SPA-ish navigation, dynamic content)
    if ('MutationObserver' in window) {
      var mo = new MutationObserver(function () {
        if (!document.querySelector('.tv-cursor-ring')) ensureNode('tv-cursor-ring');
        if (!document.querySelector('.tv-cursor-core')) ensureNode('tv-cursor-core');
      });
      mo.observe(document.body, { childList: true });
    }
  }

  if (document.body) {
    boot();
  } else {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  }
})();
