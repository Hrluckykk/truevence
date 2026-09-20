const fs = require('fs');
const path = require('path');

/* ------------------------------------------------------------------
   TRUEVENCE — BUILD SCRIPT
   Resolves <!-- INCLUDE_X --> placeholders + {{VARS}} in all pages.
   Copies assets to /public.

   Folder layout expected:
     /partials/header.html
     /partials/footer.html
     /partials/whatsapp.html
     /partials/head.html          (with {{TITLE}}, {{DESC}}, {{CANONICAL}} etc.)
     /components/hero.html        (optional homepage sections)
     /components/marquee.html
     /components/what-we-verify.html
     /components/process.html
     /components/why-us.html
     /components/industries.html
     /components/blog-scroll.html
     /components/newsletter.html
     /components/faq.html
     /components/cta-banner.html
     /components/contact.html
     /pages/index.html
     /pages/blog/what-is-background-verification.html
     /assets/css/styles.css
     /assets/js/scripts.js
   ------------------------------------------------------------------ */

const rootDir       = __dirname;
const partialsDir   = path.join(rootDir, 'partials');
const componentsDir = path.join(rootDir, 'components');
const assetsDir     = path.join(rootDir, 'assets');
const pagesDir      = path.join(rootDir, 'pages');
const publicDir     = path.join(rootDir, 'public');

/* 1. Clean public directory */
if (fs.existsSync(publicDir)) fs.rmSync(publicDir, { recursive: true, force: true });
fs.mkdirSync(publicDir, { recursive: true });
console.log('✅ Cleaned public directory');

/* 2. Copy assets (CSS, JS, images) to /public/assets */
if (fs.existsSync(assetsDir)) {
  fs.cpSync(assetsDir, path.join(publicDir, 'assets'), { recursive: true });
  console.log('✅ Copied assets to public/assets');
} else {
  console.warn('⚠️  No /assets directory found — skipping copy.');
}

/* 3. Load all partials + components as strings */
function loadFile(dir, filename) {
  const filePath = path.join(dir, filename);
  if (fs.existsSync(filePath)) return fs.readFileSync(filePath, 'utf8');
  console.warn('⚠️  Missing file: ' + filePath);
  return '';
}

const partials = {
  header:   loadFile(partialsDir, 'header.html'),
  footer:   loadFile(partialsDir, 'footer.html'),
  whatsapp: loadFile(partialsDir, 'whatsapp.html'),
};

const components = {
  hero:            loadFile(componentsDir, 'hero.html'),
  marquee:         loadFile(componentsDir, 'marquee.html'),
  what_we_verify:  loadFile(componentsDir, 'what-we-verify.html'),
  process:         loadFile(componentsDir, 'process.html'),
  why_us:          loadFile(componentsDir, 'why-us.html'),
  industries:      loadFile(componentsDir, 'industries.html'),
  blog_scroll:     loadFile(componentsDir, 'blog-scroll.html'),
  newsletter:      loadFile(componentsDir, 'newsletter.html'),
  faq:             loadFile(componentsDir, 'faq.html'),
  cta_banner:      loadFile(componentsDir, 'cta-banner.html'),
  contact:         loadFile(componentsDir, 'contact.html'),
};

const headTemplate = loadFile(partialsDir, 'head.html');

/* 4. Collect all HTML files recursively from /pages */
function getHtmlFiles(dir, fileList) {
  fileList = fileList || [];
  if (!fs.existsSync(dir)) return fileList;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) getHtmlFiles(full, fileList);
    else if (entry.name.endsWith('.html')) fileList.push(full);
  }
  return fileList;
}

/* 5. Extract a page's own <head> values (title, desc, canonical, og) */
function extractHeadValues(content) {
  const grab = (re) => { const m = content.match(re); return m ? m[1].trim() : ''; };
  return {
    TITLE:     grab(/<title>([\s\S]*?)<\/title>/i),
    DESC:      grab(/<meta\s+name="description"\s+content="([^"]*)"/i),
    CANONICAL: grab(/<link\s+rel="canonical"\s+href="([^"]*)"/i),
    OG_TITLE:  grab(/<meta\s+property="og:title"\s+content="([^"]*)"/i),
    OG_DESC:   grab(/<meta\s+property="og:description"\s+content="([^"]*)"/i),
    OG_URL:    grab(/<meta\s+property="og:url"\s+content="([^"]*)"/i),
    OG_TYPE:   grab(/<meta\s+property="og:type"\s+content="([^"]*)"/i) || 'website',
    OG_IMAGE:  grab(/<meta\s+property="og:image"\s+content="([^"]*)"/i),
  };
}

/* 6. Fill {{VAR}} placeholders inside a string */
function fillVars(str, vars) {
  return str.replace(/\{\{([A-Z_]+)\}\}/g, (_, key) => vars[key] !== undefined ? vars[key] : '');
}

/* 7. Build replacements map */
const replacements = {
  '<!-- INCLUDE_HEADER -->':       partials.header,
  '<!-- INCLUDE_FOOTER -->':       partials.footer,
  '<!-- INCLUDE_WHATSAPP -->':     partials.whatsapp,
  '<!-- INCLUDE_HERO -->':         components.hero,
  '<!-- INCLUDE_MARQUEE -->':      components.marquee,
  '<!-- INCLUDE_WHAT_WE_VERIFY -->': components.what_we_verify,
  '<!-- INCLUDE_PROCESS -->':      components.process,
  '<!-- INCLUDE_WHY_US -->':       components.why_us,
  '<!-- INCLUDE_INDUSTRIES -->':   components.industries,
  '<!-- INCLUDE_BLOG_SCROLL -->':  components.blog_scroll,
  '<!-- INCLUDE_NEWSLETTER -->':   components.newsletter,
  '<!-- INCLUDE_FAQ -->':          components.faq,
  '<!-- INCLUDE_CTA_BANNER -->':   components.cta_banner,
  '<!-- INCLUDE_CONTACT -->':      components.contact,
};

/* 8. Build each page */
const htmlFiles = getHtmlFiles(pagesDir);
let totalReplacements = 0;
const filesWithIssues = [];

for (const filePath of htmlFiles) {
  let content = fs.readFileSync(filePath, 'utf8');
  let replaced = 0;

  /* 8a. If page uses <!-- INCLUDE_HEAD -->, swap in head.html with vars filled */
  if (content.indexOf('<!-- INCLUDE_HEAD -->') !== -1) {
    const vars = extractHeadValues(content);
    const headHtml = fillVars(headTemplate, vars);
    while (content.indexOf('<!-- INCLUDE_HEAD -->') !== -1) {
      content = content.replace('<!-- INCLUDE_HEAD -->', headHtml);
      replaced++;
    }

    /* 8b. Strip duplicate <title>, <meta description>, canonical, OG, twitter
           that were already injected from head.html (avoid duplicates) */
    content = content
      .replace(/<title>[\s\S]*?<\/title>\s*(?=<title>)/i, '')
      .replace(/<meta\s+name="description"[^>]*>\s*(?=<meta\s+name="description")/i, '')
      .replace(/<link\s+rel="canonical"[^>]*>\s*(?=<link\s+rel="canonical")/i, '');
  }

  /* 8c. Standard INCLUDE replacements (repeat until gone in case of nesting) */
  for (const key in replacements) {
    const val = replacements[key];
    while (content.indexOf(key) !== -1) {
      content = content.replace(key, val);
      replaced++;
    }
  }

  totalReplacements += replaced;

  const remaining = content.match(/<!--\s*INCLUDE_[A-Z_]+\s*-->/g);
  if (remaining) filesWithIssues.push({ file: path.relative(pagesDir, filePath), placeholders: remaining });

  const rel = path.relative(pagesDir, filePath);
  const out = path.join(publicDir, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, content);
  console.log('  📄 Built: ' + rel + ' (' + replaced + ' replacements)');
}

/* 9. Copy robots.txt + sitemap.xml to public */
['robots.txt', 'sitemap.xml'].forEach((file) => {
  const src = path.join(rootDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(publicDir, file));
    console.log('✅ Copied ' + file);
  }
});

/* 10. Copy favicons to public root */
['favicon.ico', 'favicon-32.png', 'favicon-192.png'].forEach((file) => {
  const src = path.join(rootDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(publicDir, file));
    console.log('✅ Copied ' + file);
  }
});

/* Summary */
console.log('\n🎉 Build complete! ' + htmlFiles.length + ' pages built.');
console.log('📊 Total placeholder replacements: ' + totalReplacements);

if (filesWithIssues.length > 0) {
  console.log('\n⚠️  Files still containing un-replaced placeholders:');
  filesWithIssues.forEach(({ file, placeholders }) => {
    console.log('   ' + file);
    placeholders.forEach((p) => console.log('     ' + p));
  });
}
