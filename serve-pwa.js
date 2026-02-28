const http = require('http');
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, 'dist');
const PORT = 9090;

const MIME = {
  '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff': 'font/woff',
  '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.map': 'application/json',
};

http.createServer((req, res) => {
  let url = req.url.split('?')[0];
  let filePath = path.join(DIST, url);
  
  // Try exact file
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
    return;
  }
  
  // Try with .html extension
  if (fs.existsSync(filePath + '.html')) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(filePath + '.html').pipe(res);
    return;
  }
  
  // Try index.html in directory
  const indexPath = path.join(filePath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(indexPath).pipe(res);
    return;
  }
  
  // Fallback to index.html (SPA)
  res.writeHead(200, { 'Content-Type': 'text/html' });
  fs.createReadStream(path.join(DIST, 'index.html')).pipe(res);
}).listen(PORT, '0.0.0.0', () => {
  console.log(`PWA serving on http://0.0.0.0:${PORT}`);
});
