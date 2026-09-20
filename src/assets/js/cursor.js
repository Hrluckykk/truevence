/* ============================================================
   Shared custom cursor — loaded by every page.
   Adds .custom-cursor, .cursor-ready, .cursor-active classes.
   Expects <div class="cursor-ring"></div> and <div class="cursor-core"></div>
   ============================================================ */
(function initCursor () {
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;
  if (!isFinePointer) return;

  const ring = document.querySelector('.cursor-ring');
  const core = document.querySelector('.cursor-core');
  if (!ring || !core) return;

  document.body.classList.add('custom-cursor');

  let mx = window.innerWidth / 2;
  let my = window.innerHeight / 2;
  let rx = mx, ry = my;
  let ready = false;

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    core.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    if (!ready) { ready = true; document.body.classList.add('cursor-ready'); }
  });

  function raf () {
    rx += (mx - rx) * 0.45;
    ry += (my - ry) * 0.45;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    requestAnimationFrame(raf);
  }
  raf();

  const hoverables = 'a, button, input, textarea, label, [data-cursor-hover]';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverables)) document.body.classList.add('cursor-active');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverables)) document.body.classList.remove('cursor-active');
  });
  window.addEventListener('mouseleave', () => document.body.classList.remove('cursor-ready'));
  window.addEventListener('mouseenter', () => document.body.classList.add('cursor-ready'));
})();
