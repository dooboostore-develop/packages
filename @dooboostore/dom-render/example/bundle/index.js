const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;

// Bundle mapping - map bundle requests to actual dist files
const bundleMap = {
  'dooboostore-dom-render.esm.js': '../../dist/esm-bundle/dooboostore-dom-render.esm.js',
  'dooboostore-dom-render.umd.js': '../../dist/umd-bundle/dooboostore-dom-render.umd.js'
};

// MIME types
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
  
  // Handle bundle requests
  if (pathname === '/dooboostore-dom-render.esm.js') {
    const bundlePath = path.resolve(__dirname, bundleMap['dooboostore-dom-render.esm.js']);
    serveFile(res, bundlePath, 'application/javascript');
    return;
  }
  
  if (pathname === '/dooboostore-dom-render.umd.js') {
    const bundlePath = path.resolve(__dirname, bundleMap['dooboostore-dom-render.umd.js']);
    serveFile(res, bundlePath, 'application/javascript');
    return;
  }
  
  // Serve index.html for root path
  if (pathname === '/') {
    const indexPath = path.join(__dirname, 'index.html');
    serveFile(res, indexPath, 'text/html');
    return;
  }
  
  // Serve other files (HTML, CSS, etc.)
  const filePath = path.join(__dirname, pathname);
  const contentType = getContentType(filePath);
  
  serveFile(res, filePath, contentType);
});

server.listen(PORT, () => {
  console.log(`🚀 Bundle examples server running at http://localhost:${PORT}`);
  console.log(`📁 Serving from: ${__dirname}`);
  console.log(`📦 ESM Bundle: http://localhost:${PORT}/dooboostore-dom-render.esm.js`);
  console.log(`📦 UMD Bundle: http://localhost:${PORT}/dooboostore-dom-render.umd.js`);
  console.log(`🌐 Examples:`);
  console.log(`   - ESM: http://localhost:${PORT}/esm.html`);
  console.log(`   - UMD: http://localhost:${PORT}/umd.html`);
});
