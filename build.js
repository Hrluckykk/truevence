const fs = require('fs');
const path = require('path');

const partialsDir = path.join(__dirname, 'partials');
const srcDir = path.join(__dirname, 'src');
const publicDir = path.join(__dirname, 'public');

// ===== NEW: Copy assets folder =====
const srcAssetsDir = path.join(srcDir, 'assets');
const publicAssetsDir = path.join(publicDir, 'assets');

if (fs.existsSync(srcAssetsDir)) {
  // Delete existing public/assets if it exists
  if (fs.existsSync(publicAssetsDir)) {
    fs.rmSync(publicAssetsDir, { recursive: true, force: true });
  }
  // Copy entire assets folder
  fs.cpSync(srcAssetsDir, publicAssetsDir, { recursive: true });
  console.log('Copied assets to public/');
}
// ===================================

// Load partials...
let header = '';
let footer = '';
let whatsapp = '';
try {
  header = fs.readFileSync(path.join(partialsDir, 'header.html'), 'utf8');
  footer = fs.readFileSync(path.join(partialsDir, 'footer.html'), 'utf8');
  whatsapp = fs.readFileSync(path.join(partialsDir, 'whatsapp.html'), 'utf8');
} catch (err) {
  console.log('Partial files not found – building without header/footer/whatsapp injection.');
}

// Recursively collect all .html files from src/
function getHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      // Skip the assets folder when collecting HTML files
      if (file.name === 'assets') continue;
      getHtmlFiles(fullPath, fileList);
    } else if (file.name.endsWith('.html')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const htmlFiles = getHtmlFiles(srcDir);

// Process each HTML file
for (const filePath of htmlFiles) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content
    .replace('<!-- INCLUDE_HEADER -->', header)
    .replace('<!-- INCLUDE_FOOTER -->', footer)
    .replace('<!-- INCLUDE_WHATSAPP -->', whatsapp);

  const relativePath = path.relative(srcDir, filePath);
  const outPath = path.join(publicDir, relativePath);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, content);
  console.log(`Built: ${relativePath}`);
}

console.log('All pages built successfully.');
