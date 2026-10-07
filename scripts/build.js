// TRUEVENCE — BUILD SCRIPT (scripts/build.js)
// Sources:  src/pages/**/*.html
// Uses:     src/partials/*.html   (header, footer, whatsapp)
// Copies:   src/assets/  ->  public/assets/
// Output:   public/**  (src/pages/ prefix stripped)

const fs = require('fs');
const path = require('path');

const rootDir     = path.join(__dirname, '..');
const pagesDir    = path.join(rootDir, 'src', 'pages');
const partialsDir = path.join(rootDir, 'src', 'partials');
const assetsDir   = path.join(rootDir, 'src', 'assets');
const publicDir   = path.join(rootDir, 'public');

// Ensure CSS output dir exists before Tailwind CLI runs
fs.mkdirSync(path.join(publicDir, 'assets', 'css'), { recursive: true });

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

// ---------- 3. Load partials ----------
function loadFile(dir, name) {
  const p = path.join(dir, name);
  if (fs.existsSync(p)) return fs.readFileSync(p, 'utf8');
  console.warn('Missing: ' + p);
  return '';
}

const partials = {
  header:   loadFile(partialsDir, 'header.html'),
  footer:   loadFile(partialsDir, 'footer.html'),
  whatsapp: loadFile(partialsDir, 'whatsapp.html'),
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

// ---------- 5. Replacement map (partials only) ----------
const replacements = {
  '<!-- INCLUDE_HEADER -->':   partials.header,
  '<!-- INCLUDE_FOOTER -->':   partials.footer,
  '<!-- INCLUDE_WHATSAPP -->': partials.whatsapp,
};

// ---------- 6. Build every page ----------
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

  // Replace partial markers
  for (const key in replacements) {
    const val = replacements[key];
    while (content.indexOf(key) !== -1) {
      content = content.replace(key, val);
      replaced++;
    }
  }

  totalReplacements += replaced;

  // Warn on leftovers
  const remaining = content.match(/<!--\s*INCLUDE_[A-Z_]+\s*-->/g);
  if (remaining) {
    filesWithIssues.push({
      file: path.relative(pagesDir, filePath),
      placeholders: remaining,
    });
  }

  // Write output — strip src/pages/ prefix
  const rel = path.relative(pagesDir, filePath);
  const out = path.join(publicDir, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, content);
  console.log('  ' + rel + '  (' + replaced + ' replacements)');
}

// ---------- 7. Copy robots.txt + sitemap.xml ----------
['robots.txt', 'sitemap.xml'].forEach(function (f) {
  const src = path.join(rootDir, f);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(publicDir, f));
    console.log('Copied ' + f);
  } else {
    console.warn('Missing at root: ' + f);
  }
});

// ---------- 8. Copy favicons ----------
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
