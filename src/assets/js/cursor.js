/* ============================================================
   Truevence — Professional Custom Cursor
   Scoped: only runs on fine-pointer (mouse/trackpad) devices.
   Nodes: .cursor-ring (outer halo) + .cursor-core (dot).
   ============================================================ */
(function () {
  'use strict';
  if (window.__tvCursorInit) return;
  window.__tvCursorInit = true;

  var finePointer = false;
  try { finePointer = window.matchMedia('(pointer: fine)').matches; } catch (e) {}
  if (!finePointer) return;

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
    var ring = ensureNode('cursor-ring');
    var core = ensureNode('cursor-core');

    document.body.classList.add('custom-cursor');

    var mx = window.innerWidth / 2, my = window.innerHeight / 2;
    var rx = mx, ry = my;
    var ready = false;

    window.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      core.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
      if (!ready) { ready = true; document.body.classList.add('cursor-ready'); }
    }, { passive: true });

    (function raf() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
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
    window.addEventListener('resize', function () { rx = mx; ry = my; }, { passive: true });
  }

  if (document.body) boot();
  else document.addEventListener('DOMContentLoaded', boot, { once: true });
})();
