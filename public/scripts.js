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
document.querySelectorAll('.mobile-link').forEach(link => {
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

/* ============ VERIFICATION NAV INTERACTIVE ============ */
(function initVerificationNav() {
  const navItems = document.querySelectorAll('.verify-nav-item');
  const bannerImage = document.getElementById('bannerImage');
  const contentIndex = document.querySelector('.content-index');
  const contentLabel = document.querySelector('.content-label');
  const contentHeading = document.querySelector('.verification-content h3');
  const contentDesc = document.querySelector('.verification-content p');
  const checkList = document.querySelector('.check-list');

  if (!navItems.length || !bannerImage) return;

  const verificationData = {
    0: { index: '01', label: 'Aadhaar Verification', heading: 'Confirm who<br>they are', desc: 'We verify Aadhaar details and validate key personal information to ensure the candidate\'s identity is genuine.', checks: ['Aadhaar number validation', 'Name & date of birth check', 'Address verification', 'Document authenticity'] },
    1: { index: '02', label: 'Voter ID Verification', heading: 'Verify voter<br>identity', desc: 'Validate voter ID details against election commission records for authenticity.', checks: ['Voter ID number validation', 'Constituency verification', 'Name match check', 'Document authenticity'] },
    2: { index: '03', label: 'Driving Licence Verification', heading: 'Check driving<br>credentials', desc: 'Verify driving licence details and validity status from transport authorities.', checks: ['DL number validation', 'Validity status check', 'Name & address match', 'Document authenticity'] },
    3: { index: '04', label: 'Employment Verification', heading: 'Validate work<br>history', desc: 'Direct confirmation with past employers on role, tenure, salary and reason for leaving.', checks: ['Previous employer confirmation', 'Role & designation check', 'Tenure validation', 'Salary verification'] },
    4: { index: '05', label: 'Education Verification', heading: 'Verify academic<br>credentials', desc: 'Degree, diploma and marksheet authentication directly from the issuing institution.', checks: ['Degree verification', 'Marksheet validation', 'Institution confirmation', 'Credential authenticity'] },
    5: { index: '06', label: 'Digital Address Verification', heading: 'Confirm digital<br>address', desc: 'Digital confirmation of current residential address through utility and geolocation checks.', checks: ['Digital address check', 'Geolocation verification', 'Utility bill validation', 'Address match confirmation'] },
    6: { index: '07', label: 'Physical Address Verification', heading: 'Verify physical<br>residence', desc: 'Physical field verification of residential address with on-ground confirmation.', checks: ['Field visit conducted', 'Neighborhood verification', 'Residence confirmation', 'Photo evidence captured'] },
    7: { index: '08', label: 'Criminal Court Check', heading: 'Screen legal<br>history', desc: 'Court and police record screening across jurisdictions to flag undisclosed history.', checks: ['Court record search', 'Criminal database check', 'Litigation screening', 'Jurisdiction-wide search'] },
    8: { index: '09', label: 'Police Verification', heading: 'Police clearance<br>certificate', desc: 'Official police verification to confirm no criminal record at the local police station.', checks: ['Police station verification', 'Character certificate check', 'Local record verification', 'Clearance certificate issued'] },
    9: { index: '10', label: 'Drug Test', heading: 'Substance abuse<br>screening', desc: 'Medical screening for substance abuse to ensure workplace safety and compliance.', checks: ['Pre-employment drug test', 'Substance abuse panel', 'Certified lab testing', 'Result documentation'] },
    10: { index: '11', label: 'UAN & Other Checks', heading: 'Validate employment<br>credentials', desc: 'Universal Account Number verification and other employment-related checks.', checks: ['UAN validation', 'PF account verification', 'Previous employer check', 'Employment history validation'] }
  };

  // Preload images
  const imageUrls = [
    'https://pub-23829b735d524cbaa428c0e9534df703.r2.dev/SMBanners/Aadhar_Verification_Banner.png',
    'https://pub-23829b735d524cbaa428c0e9534df703.r2.dev/SMBanners/VoterID_Verification_Banner.png',
    'https://pub-23829b735d524cbaa428c0e9534df703.r2.dev/SMBanners/DL_Verification_Banner.png',
    'https://pub-23829b735d524cbaa428c0e9534df703.r2.dev/SMBanners/Employement_Verification_Banner.png',
    'https://pub-23829b735d524cbaa428c0e9534df703.r2.dev/SMBanners/Education_Verification_Banner.png',
    'https://pub-23829b735d524cbaa428c0e9534df703.r2.dev/SMBanners/Digital_Address_Verification_Banner.png',
    'https://pub-23829b735d524cbaa428c0e9534df703.r2.dev/SMBanners/Physical_Address_Verification.png',
    'https://pub-23829b735d524cbaa428c0e9534df703.r2.dev/SMBanners/Criminal_Court_Check_Banner.png',
    'https://pub-23829b735d524cbaa428c0e9534df703.r2.dev/SMBanners/Police_Verification_Banner.png',
    'https://pub-23829b735d524cbaa428c0e9534df703.r2.dev/SMBanners/Drug_Test_Banner.png',
    'https://pub-23829b735d524cbaa428c0e9534df703.r2.dev/SMBanners/UAN_Verification_Banner.png'
  ];

  imageUrls.forEach(url => {
    const img = new Image();
    img.src = url;
  });

  navItems.forEach(item => {
    item.addEventListener('click', function() {
      // Remove active from all
      navItems.forEach(nav => nav.classList.remove('active'));
      // Add active to clicked
      this.classList.add('active');

      const index = this.getAttribute('data-index');
      const image = this.getAttribute('data-image');
      const data = verificationData[index];

      if (!data) return;

      // Update banner image with fallback
      bannerImage.src = image;
      bannerImage.alt = data.label;
      bannerImage.onerror = function() {
        this.onerror = null;
        this.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22480%22%20height%3D%22400%22%20viewBox%3D%220%200%20480%20400%22%3E%3Crect%20width%3D%22480%22%20height%3D%22400%22%20fill%3D%22%237C3AED%22%2F%3E%3Ctext%20x%3D%22240%22%20y%3D%22200%22%20font-size%3D%2224%22%20fill%3D%22white%22%20text-anchor%3D%22middle%22%20font-family%3D%22Arial%22%3E' + encodeURIComponent(data.label) + '%3C%2Ftext%3E%3C%2Fsvg%3E';
      };

      // Update content
      contentIndex.textContent = data.index;
      contentLabel.textContent = data.label;
      contentHeading.innerHTML = data.heading;
      contentDesc.textContent = data.desc;

      // Update check list
      checkList.innerHTML = data.checks.map(check => 
        '<div class="check"><span class="check-mark">✓</span>' + check + '</div>'
      ).join('');
    });
  });
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

// Check if previously accepted
if (localStorage.getItem('cookieConsent') === 'true') {
  document.getElementById('cookieConsent')?.remove();
}
