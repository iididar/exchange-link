const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;
const DIST_DIR = path.join(ROOT_DIR, 'dist');

const PUBLIC_FILES = [
  'index.html',
  'style.css',
  'script.js',
  'manifest.json',
  'NRT-Reg.ttf',
  'IMG_6071.JPG',
  'IMG_6140.jpg',
  'IMG_6165.JPG',
  'rates.json',
  '_headers'
];

// Clean and create dist directory
if (fs.existsSync(DIST_DIR)) {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
}
fs.mkdirSync(DIST_DIR, { recursive: true });

// Copy public assets
for (const file of PUBLIC_FILES) {
  const src = path.join(ROOT_DIR, file);
  const dest = path.join(DIST_DIR, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied: ${file}`);
  } else {
    console.warn(`Warning: Missing ${file}`);
  }
}

console.log('Build completed successfully: dist/ is ready for Cloudflare Pages deployment.');
