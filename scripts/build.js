const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const partialsDir = path.join(rootDir, 'src', 'partials');
const componentsDir = path.join(rootDir, 'src', 'components');
const assetsDir = path.join(rootDir, 'src', 'assets');
const pagesDir = path.join(rootDir, 'src', 'pages');
const publicDir = path.join(rootDir, 'public');

// 0. Sanity check — Tailwind output must exist
const tailwindOut = path.join(assetsDir, 'css', 'tailwind.css');
if (!fs.existsSync(tailwindOut)) {
  console.error('❌ src/assets/css/tailwind.css is missing.');
  console.error('   Run `npm run build:css` first (or use `npm run build`).');
  process.exit(1);
}

// 1. Clean public directory
if (fs.existsSync(publicDir)) {
  fs.rmSync(publicDir, { recursive: true, force: true });
}
fs.mkdirSync(publicDir, { recursive: true });
console.log('✅ Cleaned public directory');

// 2. Copy assets (CSS, JS, images)
if (fs.existsSync(assetsDir)) {
  fs.cpSync(assetsDir, path.join(publicDir, 'assets'), { recursive: true });
  console.log('✅ Copied assets to public/assets');
}

// 3. Load partials and components
function loadFile(dir, filename) {
  const filePath = path.join(dir, filename);
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, 'utf8');
  }
  console.warn('⚠️  Missing file: ' + filePath);
  return '';
}

const partials = {
  header: loadFile(partialsDir, 'header.html'),
  footer: loadFile(partialsDir, 'footer.html'),
  whatsapp: loadFile(partialsDir, 'whatsapp.html'),
  hero: loadFile(componentsDir, 'hero.html'),
  marquee: loadFile(componentsDir, 'marquee.html'),
  what_we_verify: loadFile(componentsDir, 'what-we-verify.html'),
  process: loadFile(componentsDir, 'process.html'),
  why_us: loadFile(componentsDir, 'why-us.html'),
  industries: loadFile(componentsDir, 'industries.html'),
  blog_scroll: loadFile(componentsDir, 'blog-scroll.html'),
  newsletter: loadFile(componentsDir, 'newsletter.html'),
  faq: loadFile(componentsDir, 'faq.html'),
  cta_banner: loadFile(componentsDir, 'cta-banner.html'),
  contact: loadFile(componentsDir, 'contact.html')
};

// 4. Collect all HTML files from src/pages/ recursively
function getHtmlFiles(dir, fileList) {
  fileList = fileList || [];
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      getHtmlFiles(fullPath, fileList);
    } else if (file.name.endsWith('.html')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const htmlFiles = getHtmlFiles(pagesDir);

// 5. Process each HTML file
let totalReplacements = 0;
let filesWithIssues = 0;
const filesWith404Paths = [];

for (const filePath of htmlFiles) {
  let content = fs.readFileSync(filePath, 'utf8');
  let replacementsInThisFile = 0;

  const replacements = {
    '<!-- INCLUDE_HEADER -->': partials.header,
    '<!-- INCLUDE_FOOTER -->': partials.footer,
    '<!-- INCLUDE_WHATSAPP -->': partials.whatsapp,
    '<!-- INCLUDE_HERO -->': partials.hero,
    '<!-- INCLUDE_MARQUEE -->': partials.marquee,
    '<!-- INCLUDE_WHAT_WE_VERIFY -->': partials.what_we_verify,
    '<!-- INCLUDE_PROCESS -->': partials.process,
    '<!-- INCLUDE_WHY_US -->': partials.why_us,
    '<!-- INCLUDE_INDUSTRIES -->': partials.industries,
    '<!-- INCLUDE_BLOG_SCROLL -->': partials.blog_scroll,
    '<!-- INCLUDE_NEWSLETTER -->': partials.newsletter,
    '<!-- INCLUDE_FAQ -->': partials.faq,
    '<!-- INCLUDE_CTA_BANNER -->': partials.cta_banner,
    '<!-- INCLUDE_CONTACT -->': partials.contact
  };

  for (const key in replacements) {
    if (Object.prototype.hasOwnProperty.call(replacements, key)) {
      const placeholder = key;
      const replacement = replacements[key];
      while (content.indexOf(placeholder) !== -1) {
        content = content.replace(placeholder, replacement);
        replacementsInThisFile++;
        totalReplacements++;
      }
    }
  }

  // Warn if any INCLUDE placeholders remain
  const remaining = content.match(/<!--\s*INCLUDE_[A-Z_]+\s*-->/g);
  if (remaining) {
    filesWithIssues++;
    console.warn('⚠️  ' + path.relative(pagesDir, filePath) + ' still has ' + remaining.length + ' un-replaced placeholder(s):');
    remaining.forEach(function (m) { console.warn('     ' + m); });
  }

  // Detect wrong CSS/JS paths (the 404 cause)
  if (content.indexOf('href="/styles.css"') !== -1) {
    filesWith404Paths.push(path.relative(pagesDir, filePath) + ' → href="/styles.css"');
  }
  if (content.indexOf('href="/assets/styles.css"') !== -1) {
    filesWith404Paths.push(path.relative(pagesDir, filePath) + ' → href="/assets/styles.css"');
  }
  if (content.indexOf('src="/scripts.js"') !== -1) {
    filesWith404Paths.push(path.relative(pagesDir, filePath) + ' → src="/scripts.js"');
  }
  if (content.indexOf('src="/assets/common.js"') !== -1) {
    filesWith404Paths.push(path.relative(pagesDir, filePath) + ' → src="/assets/common.js"');
  }

  const relativePath = path.relative(pagesDir, filePath);
  const outPath = path.join(publicDir, relativePath);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, content);
  console.log('  📄 Built: ' + relativePath + ' (' + replacementsInThisFile + ' replacements)');
}

// 6. Copy robots.txt + sitemap.xml to public
['robots.txt', 'sitemap.xml'].forEach(function (file) {
  const src = path.join(rootDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(publicDir, file));
    console.log('✅ Copied ' + file);
  }
});

// 7. Copy favicons to public root
['favicon.ico', 'favicon-32.png', 'favicon-192.png'].forEach(function (file) {
  const src = path.join(rootDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(publicDir, file));
    console.log('✅ Copied ' + file);
  }
});

// Summary
console.log('\n🎉 Build complete! ' + htmlFiles.length + ' pages built.');
console.log('📊 Total placeholder replacements: ' + totalReplacements);

if (filesWithIssues > 0) {
  console.log('⚠️  ' + filesWithIssues + ' file(s) had un-replaced placeholders — check above.');
}

if (filesWith404Paths.length > 0) {
  console.log('\n🚨 FILES STILL POINTING TO BROKEN PATHS (will 404 at runtime):');
  filesWith404Paths.forEach(function (line) { console.log('   ' + line); });
  console.log('\n   These need their href/src updated to /assets/css/tailwind.css + /assets/css/styles.css and /assets/js/scripts.js');
}
