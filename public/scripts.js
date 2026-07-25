// Initialize AOS
AOS.init({ duration: 700, once: true, easing: 'ease-out-cubic', offset: 40 });
document.getElementById('year').textContent = new Date().getFullYear();

/* FAQ accordion */
document.querySelectorAll('.faq-item').forEach((item) => {
  item.querySelector('.faq-q').addEventListener('click', () => {
    item.classList.toggle('open');
  });
});

/* Call buttons */
document.querySelectorAll('.call-btn').forEach((wrap) => {
  const label = wrap.querySelector('.call-label');
  label.addEventListener('click', () => {
    wrap.classList.add('revealed');
  });
  wrap.addEventListener('mouseleave', () => {
    wrap.classList.remove('revealed');
  });
});

/* Mobile menu */
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
document.querySelectorAll('.mobile-link').forEach((link) => {
  link.addEventListener('click', () => {
    menuOpen = false;
    mobileMenu.classList.add('hidden');
    menuBtn.setAttribute('aria-expanded', false);
    iconMenu.innerHTML = '<path d="M4 7h16M4 12h16M4 17h16"/>';
  });
});

/* Contact form */
const form = document.getElementById('contactForm');
if (form) {
  const formNote = document.getElementById('formNote');
  const submitButton = form.querySelector('button[type="submit"]');
  const originalButton = submitButton.innerHTML;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    submitButton.disabled = true;
    submitButton.innerHTML = 'Submitting...';
    formNote.classList.add('hidden');
    formNote.textContent = '';

    try {
      const response = await fetch(
        'https://truevence-backend.mamta-neschecks.workers.dev/api/contact',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name: data.get('name'),
            company: data.get('company'),
            email: data.get('email'),
            phone: data.get('phone'),
            message: data.get('message'),
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        form.reset();
        formNote.textContent =
          'Request submitted – we will get back to you soon.';
        formNote.classList.remove('hidden');
      } else {
        throw new Error(result.error || 'Submission failed');
      }
    } catch (error) {
      formNote.textContent =
        'Something went wrong. Please email us directly at Contact@truevence.in';
      formNote.classList.remove('hidden');
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = originalButton;
    }
  });
}

/* Custom cursor */
(function initCursor() {
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;
  if (!isFinePointer) return;
  document.body.classList.add('custom-cursor');
  const ring = document.querySelector('.cursor-ring');
  const core = document.querySelector('.cursor-core');
  let mx = window.innerWidth / 2,
    my = window.innerHeight / 2;
  let rx = mx,
    ry = my;
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

  const hoverables =
    'a, button, input, textarea, label, [data-cursor-hover]';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverables))
      document.body.classList.add('cursor-active');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverables))
      document.body.classList.remove('cursor-active');
  });
  window.addEventListener('mouseleave', () =>
    document.body.classList.remove('cursor-ready')
  );
  window.addEventListener('mouseenter', () =>
    document.body.classList.add('cursor-ready')
  );
})();

function acceptCookies() {
  document.getElementById('cookieConsent').style.display = 'none';
  localStorage.setItem('cookieConsent', 'true');
}

// Check if previously accepted
if (localStorage.getItem('cookieConsent') === 'true') {
  document.getElementById('cookieConsent')?.remove();
}
