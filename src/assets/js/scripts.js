(function () {
  'use strict';

  if (typeof AOS !== 'undefined') {
    AOS.init({ duration: 700, once: true, easing: 'ease-out-cubic', offset: 40 });
  }

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  window.acceptCookies = function () {
    var banner = document.getElementById('cookieConsent');
    if (banner) banner.style.display = 'none';
    try { localStorage.setItem('cookieConsent', 'true'); } catch (e) {}
  };

  try {
    if (localStorage.getItem('cookieConsent') === 'true') {
      var banner = document.getElementById('cookieConsent');
      if (banner) banner.remove();
    }
  } catch (e) {}

  document.querySelectorAll('[data-accept-cookies]').forEach(function (btn) {
    btn.addEventListener('click', window.acceptCookies);
  });

  var menuBtn = document.getElementById('menuBtn');
  var mobileMenu = document.getElementById('mobileMenu');
  var iconMenu = document.getElementById('iconMenu');
  var menuOpen = false;

  if (menuBtn && mobileMenu && iconMenu) {
    menuBtn.addEventListener('click', function () {
      menuOpen = !menuOpen;
      mobileMenu.classList.toggle('hidden', !menuOpen);
      menuBtn.setAttribute('aria-expanded', String(menuOpen));
      iconMenu.innerHTML = menuOpen
        ? '<path d="M6 6l12 12M18 6L6 18"/>'
        : '<path d="M4 7h16M4 12h16M4 17h16"/>';
    });

    document.querySelectorAll('.mobile-link').forEach(function (link) {
      link.addEventListener('click', function () {
        menuOpen = false;
        mobileMenu.classList.add('hidden');
        menuBtn.setAttribute('aria-expanded', 'false');
        iconMenu.innerHTML = '<path d="M4 7h16M4 12h16M4 17h16"/>';
      });
    });
  }

  var mobileProductsBtn = document.getElementById('mobileProductsBtn');
  var mobileProductsMenu = document.getElementById('mobileProductsMenu');
  var mobileProductsArrow = document.getElementById('mobileProductsArrow');
  if (mobileProductsBtn && mobileProductsMenu && mobileProductsArrow) {
    mobileProductsBtn.addEventListener('click', function () {
      mobileProductsMenu.classList.toggle('hidden');
      mobileProductsArrow.classList.toggle('rotate-180');
    });
  }

  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    if (!q) return;
    q.addEventListener('click', function () {
      item.classList.toggle('open');
    });
  });

  document.querySelectorAll('.call-btn').forEach(function (wrap) {
    var label = wrap.querySelector('.call-label');
    if (label) {
      label.addEventListener('click', function () {
        wrap.classList.add('revealed');
      });
    }
    wrap.addEventListener('mouseleave', function () {
      wrap.classList.remove('revealed');
    });
  });

  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    var formNote = document.getElementById('formNote');
    var submitButton = contactForm.querySelector('button[type="submit"]');
    var originalButton = submitButton ? submitButton.innerHTML : '';

    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (!contactForm.reportValidity()) return;
      var data = new FormData(contactForm);
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = 'Submitting...';
      }
      if (formNote) {
        formNote.classList.add('hidden');
        formNote.textContent = '';
      }

      try {
        var response = await fetch('https://truevence-backend.mamta-neschecks.workers.dev/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name: data.get('name'),
            company: data.get('company'),
            email: data.get('email'),
            phone: data.get('phone'),
            message: data.get('message')
          })
        });
        var result = await response.json();
        if (response.ok && result.success) {
          contactForm.reset();
          if (formNote) {
            formNote.textContent = 'Request submitted – we will get back to you soon.';
            formNote.classList.remove('hidden');
          }
        } else {
          throw new Error((result && result.error) || 'Submission failed');
        }
      } catch (err) {
        if (formNote) {
          formNote.textContent = 'Something went wrong. Please email us at Contact@truevence.in';
          formNote.classList.remove('hidden');
        }
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.innerHTML = originalButton;
        }
      }
    });
  }

  /* ---- ADDED: generic quote form handler for blog/service pages ---- */
  document.querySelectorAll('form#quoteForm, form.quote-form').forEach(function (form) {
    var note = form.querySelector('#quoteNote, .quote-note');
    var btn = form.querySelector('button[type="submit"]');
    var original = btn ? btn.innerHTML : '';

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;

      if (btn) { btn.disabled = true; btn.innerHTML = 'Submitting...'; }
      if (note) { note.classList.add('hidden'); note.textContent = ''; }

      var locationEl = form.querySelector('#qLocation');
      var locationValue = locationEl && locationEl.value ? ' — Location: ' + locationEl.value : '';
      var rawMessage = (form.querySelector('#qMessage') || {}).value || 'Website enquiry';

      try {
        var response = await fetch('https://truevence-backend.mamta-neschecks.workers.dev/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name: (form.querySelector('#qName')    || {}).value || '',
            email:     (form.querySelector('#qEmail')   || {}).value || '',
            phone:     (form.querySelector('#qPhone')   || {}).value || '',
            company:   (form.querySelector('#qCompany') || {}).value || '',
            message:   (rawMessage + locationValue).trim()
          })
        });
        var result = await response.json();
        if (response.ok && result.success) {
          form.reset();
          if (note) {
            note.textContent = 'Thank you! We\'ll get back to you shortly.';
            note.classList.remove('hidden');
          }
        } else {
          throw new Error((result && result.error) || 'Submission failed');
        }
      } catch (err) {
        if (note) {
          note.textContent = 'Something went wrong. Please email us at Contact@truevence.in';
          note.classList.remove('hidden');
        }
      } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = original; }
      }
    });
  });
  /* ---- END ADDED ---- */

  (function initCursor() {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    var ring = document.querySelector('.cursor-ring');
    var core = document.querySelector('.cursor-core');
    if (!ring || !core) return;

    document.body.classList.add('custom-cursor');
    var mx = window.innerWidth / 2, my = window.innerHeight / 2;
    var rx = mx, ry = my;
    var ready = false;

    window.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      core.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
      if (!ready) { ready = true; document.body.classList.add('cursor-ready'); }
    });

    (function raf() {
      rx += (mx - rx) * 0.45;
      ry += (my - ry) * 0.45;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
      requestAnimationFrame(raf);
    })();

    var hoverables = 'a, button, input, textarea, label, [data-cursor-hover]';
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest(hoverables)) document.body.classList.add('cursor-active');
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest(hoverables)) document.body.classList.remove('cursor-active');
    });
    window.addEventListener('mouseleave', function () { document.body.classList.remove('cursor-ready'); });
    window.addEventListener('mouseenter', function () { document.body.classList.add('cursor-ready'); });
  })();

})();
