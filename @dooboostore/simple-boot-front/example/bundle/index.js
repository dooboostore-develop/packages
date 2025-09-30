const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3001;

const bundleMap = {
  'dooboostore-simple-boot-front.esm.js': '../../dist/esm-bundle/dooboostore-simple-boot-front.esm.js',
  'dooboostore-simple-boot-front.umd.js': '../../dist/umd-bundle/dooboostore-simple-boot-front.umd.js'
};

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json'
};

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return mimeTypes[ext] || 'application/octet-stream';
}

function serveFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
      return;
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  if (pathname === '/dooboostore-simple-boot-front.esm.js') {
    const bundlePath = path.resolve(__dirname, bundleMap['dooboostore-simple-boot-front.esm.js']);
    serveFile(res, bundlePath, 'application/javascript');
    return;
  }

  if (pathname === '/dooboostore-simple-boot-front.umd.js') {
    const bundlePath = path.resolve(__dirname, bundleMap['dooboostore-simple-boot-front.umd.js']);
    serveFile(res, bundlePath, 'application/javascript');
    return;
  }

  if (pathname === '/') {
    const indexPath = path.join(__dirname, 'index.html');
    serveFile(res, indexPath, 'text/html');
    return;
  }

  const filePath = path.join(__dirname, pathname);
  const contentType = getContentType(filePath);
  serveFile(res, filePath, contentType);
});

server.listen(PORT, () => {
  console.log(`🚀 Simple Boot Front server at http://localhost:${PORT}`);
  console.log(`📦 ESM: http://localhost:${PORT}/dooboostore-simple-boot-front.esm.js`);
  console.log(`📦 UMD: http://localhost:${PORT}/dooboostore-simple-boot-front.umd.js`);
  console.log(`🌐 Examples:`);
  console.log(`   - ESM: http://localhost:${PORT}/esm.html`);
  console.log(`   - UMD: http://localhost:${PORT}/umd.html`);
});


