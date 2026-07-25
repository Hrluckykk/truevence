const fs = require('fs');
const path = require('path');

const partialsDir = path.join(__dirname, 'partials');
const srcDir = path.join(__dirname, 'src');
const outDir = path.join(__dirname, 'dist');

// Load partials
const header = fs.readFileSync(path.join(partialsDir, 'header.html'), 'utf8');
const footer = fs.readFileSync(path.join(partialsDir, 'footer.html'), 'utf8');
const whatsapp = fs.readFileSync(path.join(partialsDir, 'whatsapp.html'), 'utf8');

// Process every HTML file in src/
const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.html'));

for (const file of files) {
  let content = fs.readFileSync(path.join(srcDir, file), 'utf8');
  content = content
    .replace('<!-- INCLUDE_HEADER -->', header)
    .replace('<!-- INCLUDE_FOOTER -->', footer)
    .replace('<!-- INCLUDE_WHATSAPP -->', whatsapp);

  const outPath = path.join(outDir, file);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, content);
  console.log(`Built: ${file}`);
}
console.log('All pages built successfully.');
