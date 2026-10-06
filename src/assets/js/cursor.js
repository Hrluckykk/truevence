/* ============================================================
   Truevence — Investigative Cursor (magnifying glass)
   - Follows the pointer with a subtle ease
   - Rotates slightly on hover so it reads as "scanning"
   - Scales up on interactive elements
   - Only runs on fine-pointer devices
   ============================================================ */
(function () {
  'use strict';
  if (window.__tvCursorInit) return;
  window.__tvCursorInit = true;

  var finePointer = false;
  try { finePointer = window.matchMedia('(pointer: fine)').matches; } catch (e) {}
  if (!finePointer) return;

  function ensureNode(id, cls, html) {
    var el = document.getElementById(id);
    if (el) return el;
    el = document.createElement('div');
    el.id = id;
    el.className = cls;
    el.setAttribute('aria-hidden', 'true');
    if (html) el.innerHTML = html;
    document.body.appendChild(el);
    return el;
  }

  function boot() {
    // Outer wrapper that follows the pointer
    var wrap = ensureNode('tvCursorWrap', 'tv-cursor-wrap');

    // SVG magnifying glass
    wrap.innerHTML = [
      '<svg class="tv-cursor-svg" viewBox="0 0 40 40" width="40" height="40" fill="none" xmlns="http://www.w3.org/2000/svg">',
        // glass handle
        '<line class="tv-cursor-handle" x1="27" y1="27" x2="37" y2="37" stroke="url(#gHandle)" stroke-width="2.4" stroke-linecap="round"/>',
        // glass lens
        '<circle class="tv-cursor-lens" cx="17" cy="17" r="11" stroke="url(#gLens)" stroke-width="1.8" fill="rgba(124,58,237,0.08)"/>',
        // inner shine
        '<circle class="tv-cursor-shine" cx="13" cy="13" r="3.2" fill="rgba(255,255,255,0.55)"/>',
        // small crosshair inside lens (investigation vibe)
        '<line class="tv-cursor-cross" x1="17" y1="12" x2="17" y2="14.5" stroke="rgba(124,58,237,0.75)" stroke-width="1" stroke-linecap="round"/>',
        '<line class="tv-cursor-cross" x1="17" y1="19.5" x2="17" y2="22" stroke="rgba(124,58,237,0.75)" stroke-width="1" stroke-linecap="round"/>',
        '<line class="tv-cursor-cross" x1="12" y1="17" x2="14.5" y2="17" stroke="rgba(124,58,237,0.75)" stroke-width="1" stroke-linecap="round"/>',
        '<line class="tv-cursor-cross" x1="19.5" y1="17" x2="22" y2="17" stroke="rgba(124,58,237,0.75)" stroke-width="1" stroke-linecap="round"/>',
        // gradients
        '<defs>',
          '<linearGradient id="gHandle" x1="27" y1="27" x2="37" y2="37" gradientUnits="userSpaceOnUse">',
            '<stop offset="0" stop-color="#7C3AED"/>',
            '<stop offset="1" stop-color="#4C1D95"/>',
          '</linearGradient>',
          '<linearGradient id="gLens" x1="6" y1="6" x2="28" y2="28" gradientUnits="userSpaceOnUse">',
            '<stop offset="0" stop-color="#A78BFA"/>',
            '<stop offset="1" stop-color="#7C3AED"/>',
          '</linearGradient>',
        '</defs>',
      '</svg>'
    ].join('');

    document.body.classList.add('custom-cursor');

    var mx = window.innerWidth / 2, my = window.innerHeight / 2;
    var rx = mx, ry = my;
    var ready = false;

    window.addEventListener('mousemove', function (e) {
      mx = e.clientX;
      my = e.clientY;
      if (!ready) { ready = true; document.body.classList.add('cursor-ready'); }
    }, { passive: true });

    // Eased follow for the whole magnifier
    (function raf() {
      rx += (mx - rx) * 0.22;
      ry += (my - ry) * 0.22;
      // offset so the lens center sits on the pointer, not the SVG corner
      wrap.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-45%,-45%)';
      requestAnimationFrame(raf);
    })();

    var hoverables = 'a, button, input, textarea, select, label, [role="button"], [data-cursor-hover]';
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest && e.target.closest(hoverables)) {
        document.body.classList.add('cursor-active');
      }
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest && e.target.closest(hoverables)) {
        document.body.classList.remove('cursor-active');
      }
    });

    window.addEventListener('mouseleave', function () { document.body.classList.remove('cursor-ready'); });
    window.addEventListener('mouseenter', function () { document.body.classList.add('cursor-ready'); });
    window.addEventListener('resize', function () { rx = mx; ry = my; }, { passive: true });
  }

  if (document.body) boot();
  else document.addEventListener('DOMContentLoaded', boot, { once: true });
})();
