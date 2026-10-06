/* ============================================================
   Truevence — Branded Arrow Cursor + Loading Ring
   - Arrow shape recolored to brand violet
   - Dark-purple → black gradient loading ring, always spinning
   - Ring grows & brightens on interactive hover
   - Fine-pointer devices only
   ============================================================ */
(function () {
  'use strict';
  if (window.__tvCursorInit) return;
  window.__tvCursorInit = true;

  var finePointer = false;
  try { finePointer = window.matchMedia('(pointer: fine)').matches; } catch (e) {}
  if (!finePointer) return;

  // Build a CSS-encoded SVG arrow with brand colors
  // 0% #7C3AED (violet) → 100% #0B1230 (ink) via two-tone fill
  var arrowSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">' +
      '<defs>' +
        '<linearGradient id="tvArrowGrad" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0%" stop-color="#A78BFA"/>' +
          '<stop offset="55%" stop-color="#7C3AED"/>' +
          '<stop offset="100%" stop-color="#0B1230"/>' +
        '</linearGradient>' +
        '<filter id="tvArrowShadow" x="-40%" y="-40%" width="180%" height="180%">' +
          '<feDropShadow dx="0" dy="1" stdDeviation="1.2" flood-color="rgba(11,18,48,0.55)"/>' +
        '</filter>' +
      '</defs>' +
      '<path d="M4 3 L4 23 L9.5 17.5 L13.5 25 L16.8 23.4 L12.9 16.1 L20.5 16.1 Z" ' +
        'fill="url(#tvArrowGrad)" stroke="#0B1230" stroke-width="1.2" stroke-linejoin="round" ' +
        'filter="url(#tvArrowShadow)"/>' +
    '</svg>';

  // Convert to data URI for the CSS cursor
  function svgToDataUri(svg) {
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  // Ensure style tag exists
  var STYLE_ID = 'tv-branded-cursor';
  if (!document.getElementById(STYLE_ID)) {
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = [
      /* Hide native cursor everywhere */
      'html, body { cursor: none !important; }',
      'a, button, input, textarea, select, label, [role="button"], [data-cursor-hover] { cursor: none !important; }',

      /* The arrow cursor — pure CSS, follows the pointer via transform on the wrapper */
      '.tv-arrow {',
      '  position: fixed; top: 0; left: 0;',
      '  width: 28px; height: 28px;',
      '  pointer-events: none;',
      '  z-index: 2147483646;',
      '  opacity: 0;',
      '  background-image: url("' + svgToDataUri(arrowSvg) + '");',
      '  background-size: 28px 28px;',
      '  background-repeat: no-repeat;',
      '  transform-origin: 4px 3px;',
      '  will-change: transform;',
      '  transition: opacity .15s ease, transform .12s ease-out;',
      '}',
      'body.cursor-ready .tv-arrow { opacity: 1; }',
      'body.cursor-active .tv-arrow { transform: translate(var(--tv-x), var(--tv-y)) scale(.94); }',

      /* Loading ring — dark purple → black gradient, spinning */
      '.tv-ring {',
      '  position: fixed; top: 0; left: 0;',
      '  width: 34px; height: 34px;',
      '  margin-left: -17px;',
      '  margin-top: -17px;',
      '  pointer-events: none;',
      '  z-index: 2147483645;',
      '  opacity: 0;',
      '  transition: opacity .2s ease, transform .25s cubic-bezier(.2,.8,.2,1);',
      '  transform: rotate(0deg);',
      '  will-change: transform, opacity;',
      '}',
      'body.cursor-ready .tv-ring { opacity: 1; }',
      '.tv-ring::before {',
      '  content: "";',
      '  position: absolute;',
      '  inset: 0;',
      '  border-radius: 50%;',
      '  padding: 2px;',
      '  background: conic-gradient(',
      '    from 0deg,',
      '    #0B1230 0deg,',
      '    #4C1D95 90deg,',
      '    #7C3AED 180deg,',
      '    #1E0B36 270deg,',
      '    #0B1230 360deg',
      '  );',
      '  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);',
      '  -webkit-mask-composite: xor;',
      '          mask-composite: exclude;',
      '  animation: tvRingSpin 1.1s linear infinite;',
      '  filter: drop-shadow(0 0 6px rgba(124,58,237,.55));',
      '}',
      '.tv-ring::after {',
      '  content: "";',
      '  position: absolute;',
      '  inset: 6px;',
      '  border-radius: 50%;',
      '  border: 1px solid rgba(167,139,250,.35);',
      '}',
      'body.cursor-active .tv-ring { transform: scale(1.18); }',
      'body.cursor-active .tv-ring::before { animation-duration: .6s; }',

      '@keyframes tvRingSpin {',
      '  from { transform: rotate(0deg); }',
      '  to   { transform: rotate(360deg); }',
      '}',

      /* Mobile / touch: restore native */
      '@media (pointer: coarse) {',
      '  html, body, a, button, input, textarea, select, label, [role="button"] { cursor: auto !important; }',
      '  .tv-arrow, .tv-ring { display: none !important; }',
      '}',
    ].join('\n');
    document.head.appendChild(s);
  }

  function ensureNode(cls) {
    var el = document.querySelector('.' + cls);
    if (el) return el;
    el = document.createElement('div');
    el.className = cls;
    el.setAttribute('aria-hidden', 'true');
    document.body.appendChild(el);
    return el;
  }

  function boot() {
    var arrow = ensureNode('tv-arrow');
    var ring = ensureNode('tv-ring');

    document.body.classList.add('custom-cursor');

    var mx = -100, my = -100;
    var rx = -100, ry = -100;
    var ready = false;

    window.addEventListener('mousemove', function (e) {
      mx = e.clientX;
      my = e.clientY;

      // Arrow: instant follow
      arrow.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
      arrow.style.setProperty('--tv-x', mx + 'px');
      arrow.style.setProperty('--tv-y', my + 'px');

      if (!ready) { ready = true; document.body.classList.add('cursor-ready'); }
    }, { passive: true });

    // Ring: eased follow
    (function raf() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';
      requestAnimationFrame(raf);
    })();

    var hoverables = 'a, button, input, textarea, select, label, [role="button"], [data-cursor-hover]';
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest && e.target.closest(hoverables)) document.body.classList.add('cursor-active');
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest && e.target.closest(hoverables)) document.body.classList.remove('cursor-active');
    });

    window.addEventListener('mouseleave', function () { document.body.classList.remove('cursor-ready'); });
    window.addEventListener('mouseenter', function () { document.body.classList.add('cursor-ready'); });
  }

  if (document.body) boot();
  else document.addEventListener('DOMContentLoaded', boot, { once: true });
})();
