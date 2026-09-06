const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const partialsDir = path.join(rootDir, 'src', 'partials');
const assetsDir = path.join(rootDir, 'src', 'assets');
const pagesDir = path.join(rootDir, 'src', 'pages');
const publicDir = path.join(rootDir, 'public');

// 1. Clean public directory
if (fs.existsSync(publicDir)) {
  fs.rmSync(publicDir, { recursive: true, force: true });
}
fs.mkdirSync(publicDir, { recursive: true });
console.log('✅ Cleaned public directory');

// 2. Copy assets
if (fs.existsSync(assetsDir)) {
  fs.cpSync(assetsDir, path.join(publicDir, 'assets'), { recursive: true });
  console.log('✅ Copied assets to public/assets');
}

// 3. Load partials
let header = '';
let footer = '';
let whatsapp = '';
try {
  header = fs.readFileSync(path.join(partialsDir, 'header.html'), 'utf8');
  footer = fs.readFileSync(path.join(partialsDir, 'footer.html'), 'utf8');
  whatsapp = fs.readFileSync(path.join(partialsDir, 'whatsapp.html'), 'utf8');
  console.log('✅ Loaded partials');
} catch (err) {
  console.log('⚠️  Partial files not found – building without injection');
}

// 4. Recursively collect all HTML files from src/pages/
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
for (const filePath of htmlFiles) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content
    .replace('<!-- INCLUDE_HEADER -->', header)
    .replace('<!-- INCLUDE_FOOTER -->', footer)
    .replace('<!-- INCLUDE_WHATSAPP -->', whatsapp);

  const relativePath = path.relative(pagesDir, filePath);
  const outPath = path.join(publicDir, relativePath);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, content);
  console.log(`  📄 Built: ${relativePath}`);
}

// 6. Copy robots.txt to public
const robotsSrc = path.join(rootDir, 'robots.txt');
if (fs.existsSync(robotsSrc)) {
  fs.copyFileSync(robotsSrc, path.join(publicDir, 'robots.txt'));
  console.log('✅ Copied robots.txt');
}

console.log(`\n🎉 Build complete! ${htmlFiles.length} pages built.`);
