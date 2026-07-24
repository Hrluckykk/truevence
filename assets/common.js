// AOS animation init
AOS.init({ duration: 700, once: true, easing: 'ease-out-cubic', offset: 40 });

// Dynamic year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Mobile menu
(function() {
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const iconMenu = document.getElementById('iconMenu');
  let menuOpen = false;

  menuBtn.addEventListener('click', () => {
    menuOpen = !menuOpen;
    mobileMenu.classList.toggle('hidden', !menuOpen);
    menuBtn.setAttribute('aria-expanded', menuOpen);
    iconMenu.innerHTML = menuOpen
      ? '<path d="M6 6l12 12M18 6L6 18"/>'
      : '<path d="M4 7h16M4 12h16M4 17h16"/>';
  });

  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      menuOpen = false;
      mobileMenu.classList.add('hidden');
      menuBtn.setAttribute('aria-expanded', false);
      iconMenu.innerHTML = '<path d="M4 7h16M4 12h16M4 17h16"/>';
    });
  });
})();

// Cookie consent
function acceptCookies() {
  document.getElementById('cookieConsent').style.display = 'none';
  localStorage.setItem('cookieConsent', 'true');
}
if (localStorage.getItem('cookieConsent') === 'true') {
  const el = document.getElementById('cookieConsent');
  if (el) el.remove();
}

// Custom cursor
(function() {
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;
  if (!isFinePointer) return;

  document.body.classList.add('custom-cursor');
  const ring = document.querySelector('.cursor-ring');
  const core = document.querySelector('.cursor-core');
  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;
  let ready = false;

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    core.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    if (!ready) {
      ready = true;
      document.body.classList.add('cursor-ready');
    }
  });

  function raf() {
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
