const fs = require('fs');
const path = require('path');

const partialsDir = path.join(__dirname, 'partials');
const srcDir = path.join(__dirname, 'src');
const publicDir = path.join(__dirname, 'public');
const outDir = path.join(__dirname, 'dist');

// Load partials
const header = fs.readFileSync(path.join(partialsDir, 'header.html'), 'utf8');
const footer = fs.readFileSync(path.join(partialsDir, 'footer.html'), 'utf8');
const whatsapp = fs.readFileSync(path.join(partialsDir, 'whatsapp.html'), 'utf8');

// Recursively collect all .html files from src/
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

const htmlFiles = getHtmlFiles(srcDir);

// Process each HTML file
for (const filePath of htmlFiles) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content
    .replace('<!-- INCLUDE_HEADER -->', header)
    .replace('<!-- INCLUDE_FOOTER -->', footer)
    .replace('<!-- INCLUDE_WHATSAPP -->', whatsapp);

  const relativePath = path.relative(srcDir, filePath);
  const outPath = path.join(outDir, relativePath);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, content);
  console.log(`Built: ${relativePath}`);
}

// Copy public/ to dist/ (static assets like CSS, JS, images)
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyDir(publicDir, outDir);
console.log('Static assets copied.');
console.log('All pages built successfully.');
