/* ============================================================
   TRUEVENCE — DEVICE RESOLUTION LOCK
   ------------------------------------------------------------
   Makes the entire website render at the exact same layout on
   every device. Positions of every element, every section,
   every text block stay pixel-identical regardless of screen
   width. On smaller screens the whole page is scaled down
   proportionally to fit, exactly like a zoomed-out desktop.

   No CSS file needed. No HTML wrappers needed. Self-contained.

   Loaded once per page. Does nothing on desktop >= 1440px.
   ============================================================ */
(function () {
  'use strict';

  // ---------- CONFIG ----------
  var DESIGN_WIDTH = 1440; // baseline layout width
  var WRAPPER_ID   = 'tv-lock';
  var DEBOUNCE_MS  = 60;

  // ---------- INJECT CSS ----------
  var style = document.createElement('style');
  style.setAttribute('data-tv-lock', '1');
  style.textContent = [
    /* The wrapper that holds everything */
    '#' + WRAPPER_ID + ' {',
    '  width: ' + DESIGN_WIDTH + 'px;',
    '  max-width: ' + DESIGN_WIDTH + 'px;',
    '  min-width: ' + DESIGN_WIDTH + 'px;',
    '  transform-origin: top left;',
    '  will-change: transform;',
    '  position: relative;',
    '}',

    /* Kill horizontal scrollbars when locked */
    'html.tv-locked, body.tv-locked {',
    '  overflow-x: hidden;',
    '  width: 100%;',
    '}',

    /* Fixed-position elements are converted to sticky/absolute by JS.
       Ensure they keep working as expected. */
    'html.tv-locked .nav-glass,',
    'html.tv-locked header.fixed {',
    '  position: sticky !important;',
    '  top: 0 !important;',
    '  left: 0 !important;',
    '  right: auto !important;',
    '  width: ' + DESIGN_WIDTH + 'px !important;',
    '}',

    /* Fixed overlays (WhatsApp, cookie banner, edge tags) sit inside
       the scaled space, so pin them to the wrapper rather than
       the viewport. */
    'html.tv-locked a[href*="wa.me"],',
    'html.tv-locked #cookieConsent,',
    'html.tv-locked .edge-tags-right {',
    '  position: absolute !important;',
    '}',

    /* WhatsApp button: pin bottom-right of the design canvas */
    'html.tv-locked a[href*="wa.me"] {',
    '  right: 24px !important;',
    '  bottom: 24px !important;',
    '  top: auto !important;',
    '  left: auto !important;',
    '}',

    /* Cookie banner: full width of the design canvas at the bottom */
    'html.tv-locked #cookieConsent {',
    '  left: 0 !important;',
    '  right: 0 !important;',
    '  bottom: 0 !important;',
    '  top: auto !important;',
    '}',

    /* Edge tag: right side, vertically centered within the canvas */
    'html.tv-locked .edge-tags-right {',
    '  right: 0 !important;',
    '  top: 50% !important;',
    '  transform: translateY(-50%) !important;',
    '  left: auto !important;',
    '  bottom: auto !important;',
    '}',

    /* Hide custom cursor on touch devices */
    '@media (pointer: coarse) {',
    '  .cursor-ring, .cursor-core { display: none !important; }',
    '}',

    /* Disable AOS zoom/fade jitter on scaled layout */
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
      // Leave <script> and <style> alone so they keep functioning.
      if (node.nodeType === 1) {
        var tag = node.tagName.toLowerCase();
        if (tag === 'script' || tag === 'style' || tag === 'link' ||
            tag === 'noscript' || tag === 'template') {
          return;
        }
        // Opt-out hook.
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

    // Fresh each pass so we can compute the natural (unscaled) height.
    wrap.style.transform = 'none';
    wrap.style.height    = 'auto';
    wrap.style.minHeight = '0';

    // Read the natural content height at the design width.
    var naturalHeight = wrap.scrollHeight;

    if (winW >= DESIGN_WIDTH) {
      // Desktop-sized — no lock. Restore natural layout.
      root.classList.remove('tv-locked');
      body.classList.remove('tv-locked');
      return;
    }

    // Compute scale so the design canvas fits the visible width.
    var scale = winW / DESIGN_WIDTH;

    // Apply transform.
    wrap.style.transform = 'scale(' + scale + ')';
    wrap.style.height    = (naturalHeight / scale) + 'px';
    wrap.style.minHeight = (winH / scale) + 'px';

    // Apply lock classes.
    root.classList.add('tv-locked');
    body.classList.add('tv-locked');

    // Update the meta viewport so the browser doesn't try to
    // double-scale or apply its own zoom. This keeps the layout
    // behaving like a desktop window on small devices.
    var vp = document.querySelector('meta[name="viewport"]');
    if (!vp) {
      vp = document.createElement('meta');
      vp.name = 'viewport';
      document.head.appendChild(vp);
    }
    // Only override when locked; otherwise restore the site's original.
    if (!vp.dataset.tvOriginal) {
      vp.dataset.tvOriginal = vp.getAttribute('content') || '';
    }
    vp.setAttribute('content',
      'width=' + DESIGN_WIDTH +
      ', initial-scale=' + scale.toFixed(4) +
      ', minimum-scale=0.1, maximum-scale=10, user-scalable=yes'
    );
  }

  // Restore the original meta viewport if we go back to desktop size.
  function restoreViewportMeta() {
    var vp = document.querySelector('meta[name="viewport"]');
    if (vp && vp.dataset.tvOriginal !== undefined) {
      vp.setAttribute('content', vp.dataset.tvOriginal);
      delete vp.dataset.tvOriginal;
    }
  }

  // ---------- WRAPPER-LEVEL OVERRIDES ----------
  // Ensure sections that rely on 100vw do not break out of the design canvas.
  function patchVwUnits() {
    var css = document.getElementById('tv-lock-vw-patch');
    if (css) return;
    css = document.createElement('style');
    css.id = 'tv-lock-vw-patch';
    css.textContent = [
      'html.tv-locked, html.tv-locked body { width: ' + DESIGN_WIDTH + 'px; min-width: ' + DESIGN_WIDTH + 'px; }',
      'html.tv-locked #' + WRAPPER_ID + ' * { max-width: 100vw; }'
    ].join('\n');
    document.head.appendChild(css);
  }

  // ---------- RESIZE ORCHESTRATION ----------
  var resizeTimer = null;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      var winW = window.innerWidth;
      if (winW >= DESIGN_WIDTH) {
        restoreViewportMeta();
      }
      applyLock();
    }, DEBOUNCE_MS);
  }

  // ---------- INIT ----------
  function init() {
    getOrCreateWrapper();
    patchVwUnits();

    // Apply immediately, then again after fonts/images settle.
    requestAnimationFrame(function () {
      applyLock();
      setTimeout(applyLock, 250);
      setTimeout(applyLock, 900);
      setTimeout(applyLock, 2000);
    });

    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('orientationchange', onResize, { passive: true });
    window.addEventListener('load', onResize, { passive: true });

    // Some of your sections (hero carousel, verify-doc rotation, why-us
    // rotation) change DOM height over time. Watch the wrapper and
    // re-apply so the scaled height stays correct.
    var wrap = document.getElementById(WRAPPER_ID);
    if (wrap && 'ResizeObserver' in window) {
      var ro = new ResizeObserver(function () {
        // Only re-run when locked to avoid thrash on desktop.
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
