// TRUEVENCE — BUILD SCRIPT (scripts/build.js)
// Sources:  src/pages/**/*.html
// Uses:     src/partials/*.html, src/components/*.html
// Copies:   src/assets/  ->  public/assets/
// Output:   public/**  (src/pages/ prefix stripped)

const fs = require('fs');
const path = require('path');

const rootDir       = path.join(__dirname, '..');
const pagesDir      = path.join(rootDir, 'src', 'pages');
const partialsDir   = path.join(rootDir, 'src', 'partials');
const componentsDir = path.join(rootDir, 'src', 'components');
const assetsDir     = path.join(rootDir, 'src', 'assets');
const publicDir     = path.join(rootDir, 'public');

// ---------- 1. Clean public ----------
if (fs.existsSync(publicDir)) {
  fs.rmSync(publicDir, { recursive: true, force: true });
}
fs.mkdirSync(publicDir, { recursive: true });
console.log('Cleaned public/');

// ---------- 2. Copy src/assets -> public/assets ----------
if (fs.existsSync(assetsDir)) {
  fs.cpSync(assetsDir, path.join(publicDir, 'assets'), { recursive: true });
  console.log('Copied src/assets -> public/assets');
} else {
  console.warn('src/assets not found - skipping');
}

// ---------- 3. Load partials & components ----------
function loadFile(dir, name) {
  const p = path.join(dir, name);
  if (fs.existsSync(p)) return fs.readFileSync(p, 'utf8');
  console.warn('Missing: ' + p);
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

// ---------- 4. Walk src/pages recursively ----------
function collectHtml(dir, list) {
  list = list || [];
  if (!fs.existsSync(dir)) return list;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collectHtml(full, list);
    else if (entry.name.endsWith('.html')) list.push(full);
  }
  return list;
}

// ---------- 5. Extract head values from a page ----------
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

function fillVars(str, vars) {
  return str.replace(/\{\{([A-Z_]+)\}\}/g, (_, key) =>
    vars[key] !== undefined ? vars[key] : ''
  );
}

// ---------- 6. Replacement map ----------
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

// ---------- 7. Build every page ----------
const htmlFiles = collectHtml(pagesDir);

if (htmlFiles.length === 0) {
  console.error('NO HTML FILES FOUND in ' + pagesDir);
  console.error('Check that src/pages/ exists and contains .html files.');
  process.exit(1);
}

let totalReplacements = 0;
const filesWithIssues = [];

for (const filePath of htmlFiles) {
  let content = fs.readFileSync(filePath, 'utf8');
  let replaced = 0;

  // 7a. Replace INCLUDE_HEAD with filled head.html
  if (content.indexOf('<!-- INCLUDE_HEAD -->') !== -1) {
    const vars = extractHeadValues(content);
    const headHtml = fillVars(partials.head, vars);

    while (content.indexOf('<!-- INCLUDE_HEAD -->') !== -1) {
      content = content.replace('<!-- INCLUDE_HEAD -->', headHtml);
      replaced++;
    }

    const seen = { title: 0, desc: 0, canonical: 0 };
    content = content.replace(/<title>[\s\S]*?<\/title>/gi, (m) => {
      seen.title++;
      return seen.title === 1 ? m : '';
    });
    content = content.replace(/<meta\s+name="description"[^>]*>/gi, (m) => {
      seen.desc++;
      return seen.desc === 1 ? m : '';
    });
    content = content.replace(/<link\s+rel="canonical"[^>]*>/gi, (m) => {
      seen.canonical++;
      return seen.canonical === 1 ? m : '';
    });
  }

  // 7b. Replace all other INCLUDE markers
  for (const key in replacements) {
    const val = replacements[key];
    while (content.indexOf(key) !== -1) {
      content = content.replace(key, val);
      replaced++;
    }
  }

  totalReplacements += replaced;

  // 7c. Warn on leftovers
  const remaining = content.match(/<!--\s*INCLUDE_[A-Z_]+\s*-->/g);
  if (remaining) {
    filesWithIssues.push({
      file: path.relative(pagesDir, filePath),
      placeholders: remaining,
    });
  }

  // 7d. Write output — strip src/pages/ prefix
  const rel = path.relative(pagesDir, filePath);
  const out = path.join(publicDir, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, content);
  console.log('  ' + rel + '  (' + replaced + ' replacements)');
}

// ---------- 8. Copy robots.txt + sitemap.xml ----------
['robots.txt', 'sitemap.xml'].forEach(function (f) {
  const src = path.join(rootDir, f);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(publicDir, f));
    console.log('Copied ' + f);
  } else {
    console.warn('Missing at root: ' + f);
  }
});

// ---------- 9. Copy favicons ----------
// Copies into both:
//   public/favicon-*.png         (root)
//   public/assets/favicon-*.png  (matches head.html references)
const faviconNames = ['favicon.ico', 'favicon-32.png', 'favicon-192.png'];
const faviconDirs = [rootDir, path.join(assetsDir, 'images')];

for (const name of faviconNames) {
  let copied = false;
  for (const dir of faviconDirs) {
    const src = path.join(dir, name);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(publicDir, name));
      const assetsTarget = path.join(publicDir, 'assets', name);
      fs.mkdirSync(path.dirname(assetsTarget), { recursive: true });
      fs.copyFileSync(src, assetsTarget);
      console.log('Copied ' + name + ' (from ' + path.relative(rootDir, src) + ')');
      copied = true;
      break;
    }
  }
  if (!copied) console.warn('Favicon not found: ' + name);
}

// ---------- Summary ----------
console.log('');
console.log('Build complete. ' + htmlFiles.length + ' pages, ' + totalReplacements + ' replacements.');

if (filesWithIssues.length > 0) {
  console.log('');
  console.log('Files still containing un-replaced placeholders:');
  filesWithIssues.forEach(function (item) {
    console.log('   ' + item.file);
    item.placeholders.forEach(function (p) { console.log('     ' + p); });
  });
}
