const fs = require('fs');
const path = require('path');

/* ------------------------------------------------------------------
   TRUEVENCE — BUILD SCRIPT
   Resolves <!-- INCLUDE_X --> placeholders and {{VARS}}.
   Copies src/assets/ → public/assets/.
   Builds all pages from src/ → public/.

   Folder layout expected:
     /src/index.html
     /src/about.html
     /src/blog.html
     /src/blog/*.html
     /src/assets/css/styles.css
     /src/assets/js/scripts.js
     /partials/head.html
     /partials/header.html
     /partials/footer.html
     /partials/whatsapp.html
     /components/hero.html
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
     /robots.txt
     /sitemap.xml
   ------------------------------------------------------------------ */

const rootDir       = path.join(__dirname, '..');
const srcDir        = path.join(rootDir, 'src');
const partialsDir   = path.join(rootDir, 'partials');
const componentsDir = path.join(rootDir, 'components');
const srcAssetsDir  = path.join(srcDir, 'assets');
const publicDir     = path.join(rootDir, 'public');

/* ---------- 1. Clean public ---------- */
if (fs.existsSync(publicDir)) {
  fs.rmSync(publicDir, { recursive: true, force: true });
}
fs.mkdirSync(publicDir, { recursive: true });
console.log('✅ Cleaned public/');

/* ---------- 2. Copy src/assets → public/assets ---------- */
if (fs.existsSync(srcAssetsDir)) {
  fs.cpSync(srcAssetsDir, path.join(publicDir, 'assets'), { recursive: true });
  console.log('✅ Copied src/assets → public/assets');
} else {
  console.warn('⚠️  src/assets not found — skipping copy');
}

/* ---------- 3. Load partials & components ---------- */
function loadFile(dir, name) {
  const p = path.join(dir, name);
  if (fs.existsSync(p)) return fs.readFileSync(p, 'utf8');
  console.warn('⚠️  Missing: ' + p);
  return '';
}

const partials = {
  head:     loadFile(partialsDir, 'head.html'),
  header:   loadFile(partialsDir, 'header.html'),
  footer:   loadFile(partialsDir, 'footer.html'),
  whatsapp: loadFile(partialsDir, 'whatsapp.html'),
};

const components = {
  hero:           loadFile(componentsDir, 'hero.html'),
  marquee:        loadFile(componentsDir, 'marquee.html'),
  what_we_verify: loadFile(componentsDir, 'what-we-verify.html'),
  process:        loadFile(componentsDir, 'process.html'),
  why_us:         loadFile(componentsDir, 'why-us.html'),
  industries:     loadFile(componentsDir, 'industries.html'),
  blog_scroll:    loadFile(componentsDir, 'blog-scroll.html'),
  newsletter:     loadFile(componentsDir, 'newsletter.html'),
  faq:            loadFile(componentsDir, 'faq.html'),
  cta_banner:     loadFile(componentsDir, 'cta-banner.html'),
  contact:        loadFile(componentsDir, 'contact.html'),
};

/* ---------- 4. Collect all .html in src/ (skip assets/) ---------- */
function collectHtml(dir, list) {
  list = list || [];
  if (!fs.existsSync(dir)) return list;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'assets') continue;
      collectHtml(full, list);
    } else if (entry.name.endsWith('.html')) {
      list.push(full);
    }
  }
  return list;
}

/* ---------- 5. Extract head values from a page ---------- */
function extractHeadValues(content) {
  const grab = (re) => {
    const m = content.match(re);
    return m ? m[1].trim() : '';
  };
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

/* ---------- 6. Fill {{VAR}} in a string ---------- */
function fillVars(str, vars) {
  return str.replace(/\{\{([A-Z_]+)\}\}/g, (_, key) =>
    vars[key] !== undefined ? vars[key] : ''
  );
}

/* ---------- 7. Replacement map ---------- */
const replacements = {
  '<!-- INCLUDE_HEADER -->':         partials.header,
  '<!-- INCLUDE_FOOTER -->':         partials.footer,
  '<!-- INCLUDE_WHATSAPP -->':       partials.whatsapp,
  '<!-- INCLUDE_HERO -->':           components.hero,
  '<!-- INCLUDE_MARQUEE -->':        components.marquee,
  '<!-- INCLUDE_WHAT_WE_VERIFY -->': components.what_we_verify,
  '<!-- INCLUDE_PROCESS -->':        components.process,
  '<!-- INCLUDE_WHY_US -->':         components.why_us,
  '<!-- INCLUDE_INDUSTRIES -->':     components.industries,
  '<!-- INCLUDE_BLOG_SCROLL -->':    components.blog_scroll,
  '<!-- INCLUDE_NEWSLETTER -->':     components.newsletter,
  '<!-- INCLUDE_FAQ -->':            components.faq,
  '<!-- INCLUDE_CTA_BANNER -->':     components.cta_banner,
  '<!-- INCLUDE_CONTACT -->':        components.contact,
};

/* ---------- 8. Build every page ---------- */
const htmlFiles = collectHtml(srcDir);

if (htmlFiles.length === 0) {
  console.error('❌ No HTML files found in src/');
  process.exit(1);
}

let totalReplacements = 0;
const filesWithIssues = [];

for (const filePath of htmlFiles) {
  let content = fs.readFileSync(filePath, 'utf8');
  let replaced = 0;

  /* 8a. Replace <!-- INCLUDE_HEAD --> with filled head.html */
  if (content.indexOf('<!-- INCLUDE_HEAD -->') !== -1) {
    const vars = extractHeadValues(content);
    const headHtml = fillVars(partials.head, vars);
    while (content.indexOf('<!-- INCLUDE_HEAD -->') !== -1) {
      content = content.replace('<!-- INCLUDE_HEAD -->', headHtml);
      replaced++;
    }

    /* 8b. Strip duplicated title/desc/canonical that head.html already added */
    content = content
      .replace(/<title>[\s\S]*?<\/title>\s*(?=<title>)/i, '')
      .replace(/<meta\s+name="description"[^>]*>\s*(?=<meta\s+name="description")/i, '')
      .replace(/<link\s+rel="canonical"[^>]*>\s*(?=<link\s+rel="canonical")/i, '');
  }

  /* 8c. Standard INCLUDE replacements */
  for (const key in replacements) {
    const val = replacements[key];
    while (content.indexOf(key) !== -1) {
      content = content.replace(key, val);
      replaced++;
    }
  }

  totalReplacements += replaced;

  const remaining = content.match(/<!--\s*INCLUDE_[A-Z_]+\s*-->/g);
  if (remaining) {
    filesWithIssues.push({
      file: path.relative(srcDir, filePath),
      placeholders: remaining,
    });
  }

  const rel = path.relative(srcDir, filePath);
  const out = path.join(publicDir, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, content);
  console.log('  📄 Built: ' + rel + ' (' + replaced + ' replacements)');
}

/* ---------- 9. Copy robots.txt + sitemap.xml ---------- */
['robots.txt', 'sitemap.xml'].forEach(function (file) {
  const src = path.join(rootDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(publicDir, file));
    console.log('✅ Copied ' + file);
  }
});

/* ---------- 10. Copy favicons ---------- */
['favicon.ico', 'favicon-32.png', 'favicon-192.png'].forEach(function (file) {
  const src = path.join(rootDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(publicDir, file));
    console.log('✅ Copied ' + file);
  }
});

/* ---------- Summary ---------- */
console.log('\n🎉 Build complete! ' + htmlFiles.length + ' pages built.');
console.log('📊 Total placeholder replacements: ' + totalReplacements);

if (filesWithIssues.length > 0) {
  console.log('\n⚠️  Files still containing un-replaced placeholders:');
  filesWithIssues.forEach(function (item) {
    console.log('   ' + item.file);
    item.placeholders.forEach(function (p) {
      console.log('     ' + p);
    });
  });
}
