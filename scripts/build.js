const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const partialsDir = path.join(rootDir, 'src', 'partials');
const componentsDir = path.join(rootDir, 'src', 'components');
const assetsDir = path.join(rootDir, 'src', 'assets');
const pagesDir = path.join(rootDir, 'src', 'pages');
const publicDir = path.join(rootDir, 'public');

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
  console.warn(`⚠️  Missing file: ${filePath}`);
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
function getHtmlFiles(dir, fileList = []) {
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

for (const filePath of htmlFiles) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
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

  for (const [placeholder, replacement] of Object.entries(replacements)) {
    while (content.includes(placeholder)) {
      content = content.replace(placeholder, replacement);
      replacementsInThisFile++;
      totalReplacements++;
    }
  }

  // Warn if placeholders remain (means we missed a name)
  const remaining = content.match(/<!--\s*INCLUDE_[A-Z_]+\s*-->/g);
  if (remaining) {
    filesWithIssues++;
    console.warn(`⚠️  ${path.relative(pagesDir, filePath)} still has ${remaining.length} un-replaced placeholder(s):`);
    remaining.forEach(m => console.warn(`     ${m}`));
  }

  const relativePath = path.relative(pagesDir, filePath);
  const outPath = path.join(publicDir, relativePath);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, content);
  console.log(`  📄 Built: ${relativePath} (${replacementsInThisFile} replacements)`);
}

// 6. Copy robots.txt + sitemap.xml to public
['robots.txt', 'sitemap.xml'].forEach(file => {
  const src = path.join(rootDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(publicDir, file));
    console.log(`✅ Copied ${file}`);
  }
});

// 7. Copy favicons to public root (so /favicon.ico works)
['favicon.ico', 'favicon-32.png', 'favicon-192.png'].forEach(file => {
  const src = path.join(rootDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(publicDir, file));
    console.log(`✅ Copied ${file}`);
  }
});

console.log(`\n🎉 Build complete! ${htmlFiles.length} pages built.`);
console.log(`📊 Total placeholder replacements: ${totalReplacements}`);
if (filesWithIssues > 0) {
  console.log(`⚠️  ${filesWithIssues} file(s) had un-replaced placeholders — check above.`);
}
