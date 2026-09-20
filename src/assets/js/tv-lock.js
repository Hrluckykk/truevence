/* ============================================================
   TRUEVENCE — DEVICE RESOLUTION LOCK
   ------------------------------------------------------------
   Renders the entire site at a fixed design width on every
   device, then scales the whole canvas down proportionally so
   the mobile view is pixel-identical to the desktop view.

   No CSS file needed. No HTML wrapper needed. Self-contained.
   Loaded once per page. Inert on viewports >= design width.
   ============================================================ */
(function () {
  'use strict';

  // ---------- CONFIG ----------
  var DESIGN_WIDTH = 1440;
  var WRAPPER_ID   = 'tv-lock';
  var DEBOUNCE_MS  = 60;

  // ---------- INJECT CSS ----------
  var style = document.createElement('style');
  style.setAttribute('data-tv-lock', '1');
  style.textContent = [
    '#' + WRAPPER_ID + ' {',
    '  width: ' + DESIGN_WIDTH + 'px;',
    '  max-width: ' + DESIGN_WIDTH + 'px;',
    '  min-width: ' + DESIGN_WIDTH + 'px;',
    '  transform-origin: top left;',
    '  will-change: transform;',
    '  position: relative;',
    '}',

    'html.tv-locked, body.tv-locked {',
    '  overflow-x: hidden;',
    '  width: 100%;',
    '}',

    'html.tv-locked .nav-glass,',
    'html.tv-locked header.fixed {',
    '  position: sticky !important;',
    '  top: 0 !important;',
    '  left: 0 !important;',
    '  right: auto !important;',
    '  width: ' + DESIGN_WIDTH + 'px !important;',
    '}',

    'html.tv-locked a[href*="wa.me"],',
    'html.tv-locked #cookieConsent,',
    'html.tv-locked .edge-tags-right {',
    '  position: absolute !important;',
    '}',

    'html.tv-locked a[href*="wa.me"] {',
    '  right: 24px !important;',
    '  bottom: 24px !important;',
    '  top: auto !important;',
    '  left: auto !important;',
    '}',

    'html.tv-locked #cookieConsent {',
    '  left: 0 !important;',
    '  right: 0 !important;',
    '  bottom: 0 !important;',
    '  top: auto !important;',
    '}',

    'html.tv-locked .edge-tags-right {',
    '  right: 0 !important;',
    '  top: 50% !important;',
    '  transform: translateY(-50%) !important;',
    '  left: auto !important;',
    '  bottom: auto !important;',
    '}',

    '@media (pointer: coarse) {',
    '  .cursor-ring, .cursor-core { display: none !important; }',
    '}',

    'html.tv-locked [data-aos] {',
    '  transition-duration: .001ms !important;',
    '  transition-delay: 0ms !important;',
    '  opacity: 1 !important;',
    '  transform: none !important;',
    '}'
  ].join('\n');
  document.head.appendChild(style);

  // ---------- WRAPPER ----------
  function getOrCreateWrapper() {
    var wrap = document.getElementById(WRAPPER_ID);
    if (wrap) return wrap;

    wrap = document.createElement('div');
    wrap.id = WRAPPER_ID;

    var body = document.body;
    var nodes = Array.prototype.slice.call(body.childNodes);

    nodes.forEach(function (node) {
      if (node.nodeType === 1) {
        var tag = node.tagName.toLowerCase();
        if (tag === 'script' || tag === 'style' || tag === 'link' ||
            tag === 'noscript' || tag === 'template') {
          return;
        }
        if (node.hasAttribute && node.hasAttribute('data-tv-lock-ignore')) {
          return;
        }
      }
      wrap.appendChild(node);
    });

    body.appendChild(wrap);
    return wrap;
  }

  // ---------- TRANSFORM ----------
  function applyLock() {
    var wrap = document.getElementById(WRAPPER_ID);
    if (!wrap) return;

    var winW = window.innerWidth;
    var winH = window.innerHeight;
    var root = document.documentElement;
    var body = document.body;

    // Reset so we can measure natural height at the design width.
    wrap.style.transform = 'none';
    wrap.style.height    = 'auto';
    wrap.style.minHeight = '0';

    var naturalHeight = wrap.scrollHeight;

    if (winW >= DESIGN_WIDTH) {
      // Desktop-sized — no lock. Restore natural layout.
      root.classList.remove('tv-locked');
      body.classList.remove('tv-locked');
      return;
    }

    var scale = winW / DESIGN_WIDTH;

    wrap.style.transform = 'scale(' + scale + ')';
    wrap.style.height    = (naturalHeight / scale) + 'px';
    wrap.style.minHeight = (winH / scale) + 'px';

    root.classList.add('tv-locked');
    body.classList.add('tv-locked');

    // Update the meta viewport so the browser doesn't double-scale.
    var vp = document.querySelector('meta[name="viewport"]');
    if (!vp) {
      vp = document.createElement('meta');
      vp.name = 'viewport';
      document.head.appendChild(vp);
    }
    if (!vp.dataset.tvOriginal) {
      vp.dataset.tvOriginal = vp.getAttribute('content') || '';
    }
    vp.setAttribute('content',
      'width=' + DESIGN_WIDTH +
      ', initial-scale=' + scale.toFixed(4) +
      ', minimum-scale=0.1, maximum-scale=10, user-scalable=yes'
    );
  }

  function restoreViewportMeta() {
    var vp = document.querySelector('meta[name="viewport"]');
    if (vp && vp.dataset.tvOriginal !== undefined) {
      vp.setAttribute('content', vp.dataset.tvOriginal);
      delete vp.dataset.tvOriginal;
    }
  }

  // ---------- 100vw PATCH ----------
  function patchVwUnits() {
    if (document.getElementById('tv-lock-vw-patch')) return;
    var css = document.createElement('style');
    css.id = 'tv-lock-vw-patch';
    css.textContent = [
      'html.tv-locked, html.tv-locked body { width: ' + DESIGN_WIDTH + 'px; min-width: ' + DESIGN_WIDTH + 'px; }',
      'html.tv-locked #' + WRAPPER_ID + ' * { max-width: 100vw; }'
    ].join('\n');
    document.head.appendChild(css);
  }

  // ---------- RESIZE ----------
  var resizeTimer = null;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      var winW = window.innerWidth;
      if (winW >= DESIGN_WIDTH) restoreViewportMeta();
      applyLock();
    }, DEBOUNCE_MS);
  }

  // ---------- INIT ----------
  function init() {
    getOrCreateWrapper();
    patchVwUnits();

    requestAnimationFrame(function () {
      applyLock();
      setTimeout(applyLock, 250);
      setTimeout(applyLock, 900);
      setTimeout(applyLock, 2000);
    });

    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('orientationchange', onResize, { passive: true });
    window.addEventListener('load', onResize, { passive: true });

    var wrap = document.getElementById(WRAPPER_ID);
    if (wrap && 'ResizeObserver' in window) {
      var ro = new ResizeObserver(function () {
        if (document.documentElement.classList.contains('tv-locked')) {
          applyLock();
        }
      });
      ro.observe(wrap);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
