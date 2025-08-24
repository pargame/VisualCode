#!/usr/bin/env node
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT ? Number(process.env.PORT) : 5000;
const root = path.join(__dirname, '..', 'dist');

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.map': 'application/octet-stream',
  '.txt': 'text/plain; charset=utf-8',
};

function sendFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.end('Internal server error');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.setHeader('Content-Type', mime[ext] || 'application/octet-stream');
    res.statusCode = 200;
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  // Normalize URL and prevent path traversal
  const decodeUrl = decodeURIComponent(req.url.split('?')[0] || '/');
  let reqPath = decodeUrl.replace(/^\/+/, '');

  // Support builds with a base path (example: /VisualCode/). If the
  // built index.html references assets under /VisualCode/assets/...,
  // strip the leading base segment so files are served from dist/.
  if (reqPath.startsWith('VisualCode/')) {
    reqPath = reqPath.replace(/^VisualCode\//, '');
  }
  if (reqPath === 'VisualCode') {
    reqPath = 'index.html';
  }
  if (!reqPath) reqPath = 'index.html';

  const filePath = path.join(root, reqPath);

  // Only serve files under the dist directory
  if (!filePath.startsWith(root)) {
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isFile()) {
      sendFile(filePath, res);
      return;
    }

    // If not found, fallback to index.html (SPA)
    const indexPath = path.join(root, 'index.html');
    fs.stat(indexPath, (ie, istat) => {
      if (!ie && istat.isFile()) {
        sendFile(indexPath, res);
      } else {
        res.statusCode = 404;
        res.end('Not found');
      }
    });
  });
});

server.listen(port, () => {
  console.log(`Preview server started: http://localhost:${port}/`);
  console.log(`Serving directory: ${root}`);
});
