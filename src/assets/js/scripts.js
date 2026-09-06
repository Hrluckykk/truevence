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
if (menuBtn) {
  menuBtn.addEventListener('click', () => {
    menuOpen = !menuOpen;
    mobileMenu.classList.toggle('hidden', !menuOpen);
    menuBtn.setAttribute('aria-expanded', menuOpen);
    iconMenu.innerHTML = menuOpen
      ? '<path d="M6 6l12 12M18 6L6 18"/>'
      : '<path d="M4 7h16M4 12h16M4 17h16"/>';
  });
}
document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    menuOpen = false;
    mobileMenu.classList.add('hidden');
    menuBtn.setAttribute('aria-expanded', false);
    iconMenu.innerHTML = '<path d="M4 7h16M4 12h16M4 17h16"/>';
  });
});

/* Mobile products submenu */
const mobileProductsBtn = document.getElementById('mobileProductsBtn');
const mobileProductsMenu = document.getElementById('mobileProductsMenu');
const mobileProductsArrow = document.getElementById('mobileProductsArrow');
if (mobileProductsBtn) {
  mobileProductsBtn.addEventListener('click', () => {
    mobileProductsMenu.classList.toggle('hidden');
    mobileProductsArrow.classList.toggle('rotate-180');
  });
}

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
      const response = await fetch('https://truevence-backend.mamta-neschecks.workers.dev/api/contact', {
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

      const result = await response.json();

      if (response.ok && result.success) {
        form.reset();
        formNote.textContent = 'Request submitted – we will get back to you soon.';
        formNote.classList.remove('hidden');
      } else {
        throw new Error(result.error || 'Submission failed');
      }
    } catch (error) {
      formNote.textContent = 'Something went wrong. Please email us directly at Contact@truevence.in';
      formNote.classList.remove('hidden');
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = originalButton;
    }
  });
}

/* ============ WHAT WE VERIFY INTERACTIVE ============ */
(function initVerifySection() {
  const verifyData = {
    identity: {
      index: '01',
      label: 'IDENTITY VERIFICATION',
      title: 'Confirm who<br>they are',
      copy: 'We verify government-issued identity documents and validate key personal details to ensure the candidate\'s identity is genuine.',
      checks: ['PAN verification', 'Aadhaar verification', 'Name & date of birth validation', 'Identity document checks'],
      image: 'https://pub-23829b735d524cbaa428c0e9534df703.r2.dev/Aadhar_Verification_Banner.png',
      link: '/products/aadhaar-verification'
    },
    employment: {
      index: '02',
      label: 'EMPLOYMENT VERIFICATION',
      title: 'Confirm where<br>they\'ve worked',
      copy: 'We validate employment history with previous employers to establish a candidate\'s professional experience and employment claims.',
      checks: ['Employer verification', 'Designation verification', 'Employment tenure', 'Exit details'],
      image: 'https://pub-23829b735d524cbaa428c0e9534df703.r2.dev/Employement_Verification_Banner.png',
      link: '/products/employment-verification'
    },
    education: {
      index: '03',
      label: 'EDUCATION VERIFICATION',
      title: 'Validate what<br>they\'ve studied',
      copy: 'We verify academic qualifications against available institutional records to validate the candidate\'s educational claims.',
      checks: ['Degree verification', 'Institution verification', 'Course verification', 'Graduation details'],
      image: 'https://pub-23829b735d524cbaa428c0e9534df703.r2.dev/Education_Verification_Banner.png',
      link: '/products/education-verification'
    },
    address: {
      index: '04',
      label: 'ADDRESS VERIFICATION',
      title: 'Confirm where<br>they live',
      copy: 'We verify current and permanent addresses through digital and physical verification methods.',
      checks: ['Current address verification', 'Permanent address verification', 'Digital address checks', 'Physical verification'],
      image: 'https://pub-23829b735d524cbaa428c0e9534df703.r2.dev/Digital_Address_Verification_Banner.png',
      link: '/products/address-verification'
    },
    criminal: {
      index: '05',
      label: 'CRIMINAL VERIFICATION',
      title: 'Check relevant<br>legal records',
      copy: 'We conduct relevant criminal and court record checks to identify information that may require further review.',
      checks: ['Court record checks', 'Criminal record searches', 'Police verification', 'Relevant adverse records'],
      image: 'https://pub-23829b735d524cbaa428c0e9534df703.r2.dev/Criminal_Court_Check_Banner.png',
      link: '/products/criminal-court-check'
    },
    reference: {
      index: '06',
      label: 'REFERENCE VERIFICATION',
      title: 'Validate their<br>professional story',
      copy: 'We connect with professional references to validate a candidate\'s experience, conduct and professional history.',
      checks: ['Professional references', 'Employment references', 'Role validation', 'Reference feedback'],
      image: 'https://pub-23829b735d524cbaa428c0e9534df703.r2.dev/Police_Verification_Banner.png',
      link: '/products/professional-reference-check'
    },
    credit: {
      index: '07',
      label: 'CREDIT VERIFICATION',
      title: 'Understand their<br>financial history',
      copy: 'Where applicable, credit verification helps organisations assess relevant financial history and risk indicators.',
      checks: ['Credit history', 'Financial information', 'Risk indicators', 'Relevant credit checks'],
      image: 'https://pub-23829b735d524cbaa428c0e9534df703.r2.dev/UAN_Verification_Banner.png',
      link: '/products/global-database-screening'
    },
    digital: {
      index: '08',
      label: 'DIGITAL & OTHERS',
      title: 'Go beyond the<br>standard checks',
      copy: 'Additional verification services help organisations build a more complete picture of the candidate.',
      checks: ['Drug test verification', 'UAN verification', 'Additional checks', 'Custom verification'],
      image: 'https://pub-23829b735d524cbaa428c0e9534df703.r2.dev/Drug_Test_Banner.png',
      link: '/products/digital-kyc'
    }
  };

  const menuItems = document.querySelectorAll('.verify-menu-item');
  const verifyInfo = document.getElementById('verifyInfo');
  const verifyIndex = document.getElementById('verifyIndex');
  const verifyLabel = document.getElementById('verifyLabel');
  const verifyTitle = document.getElementById('verifyTitle');
  const verifyCopy = document.getElementById('verifyCopy');
  const verifyChecks = document.getElementById('verifyChecks');
  const verifyImage = document.getElementById('verifyImage');
  const verifyLink = document.getElementById('verifyLink');

  if (!menuItems.length || !verifyInfo) return;

  let currentCategory = 'identity';

  function setImage(imageUrl) {
    const imgElement = verifyImage.querySelector('.verify-image-square');
    if (imgElement) {
      imgElement.src = imageUrl;
    } else {
      verifyImage.innerHTML = '<img src="' + imageUrl + '" class="verify-image-square" alt="Verification image">';
    }
  }

  function updateVerification(category) {
    if (!verifyData[category] || category === currentCategory) return;
    currentCategory = category;
    const data = verifyData[category];

    menuItems.forEach(item => {
      item.classList.toggle('active', item.dataset.category === category);
    });

    verifyInfo.classList.add('changing');
    setImage(data.image);

    setTimeout(function() {
      verifyIndex.textContent = data.index;
      verifyLabel.textContent = data.label;
      verifyTitle.innerHTML = data.title;
      verifyCopy.textContent = data.copy;

      verifyChecks.innerHTML = '';
      data.checks.forEach(function(check) {
        const li = document.createElement('li');
        li.className = 'verify-check';
        li.innerHTML = '<span class="verify-check-mark">✓</span> ' + check;
        verifyChecks.appendChild(li);
      });

      if (verifyLink && data.link) {
        verifyLink.href = data.link;
      }

      verifyInfo.classList.remove('changing');
    }, 200);
  }

  menuItems.forEach(function(item) {
    item.addEventListener('mouseenter', function() {
      updateVerification(this.dataset.category);
    });
    item.addEventListener('click', function() {
      updateVerification(this.dataset.category);
    });
  });

  setImage(verifyData.identity.image);
  if (verifyLink) {
    verifyLink.href = verifyData.identity.link;
  }
})();

/* Custom cursor */
(function initCursor(){
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;
  if (!isFinePointer) return;
  document.body.classList.add('custom-cursor');
  const ring = document.querySelector('.cursor-ring');
  const core = document.querySelector('.cursor-core');
  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;
  let ready = false;

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    core.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    if (!ready) { ready = true; document.body.classList.add('cursor-ready'); }
  });

  function raf(){
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

function acceptCookies() {
  document.getElementById('cookieConsent').style.display = 'none';
  localStorage.setItem('cookieConsent', 'true');
}

if (localStorage.getItem('cookieConsent') === 'true') {
  document.getElementById('cookieConsent')?.remove();
}
