import fs from 'fs';
import path from 'path';

const iframeDir = path.resolve('../../cirai-extension/iframe');
const distDir = path.resolve('../../cirai-extension/dist/iframe');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

const files = fs.readdirSync(iframeDir);
for (const file of files) {
  if (file.endsWith('.js') || file.endsWith('.js.map')) {
    const src = path.join(iframeDir, file);
    const dest = path.join(distDir, file);
    fs.copyFileSync(src, dest);
    fs.unlinkSync(src);
    console.log(`Moved ${file} to dist/iframe/`);
  }
}

const indexHtml = fs.readFileSync(path.join(iframeDir, 'index.html'), 'utf-8');
const updatedHtml = indexHtml
  .replace(/\/iframe\/index-([^.]+)\.js/g, '/dist/iframe/index-$1.js');
fs.writeFileSync(path.join(iframeDir, 'index.html'), updatedHtml);
console.log('Updated index.html references');
