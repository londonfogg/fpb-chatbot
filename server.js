const http = require('http');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const chatHandler = require('./api/chat.js');

const PORT = process.env.PORT || 3000;

// Vercel's Node runtime adds res.status()/res.json() automatically in production.
// Plain http.ServerResponse doesn't have them, so shim them here for local parity.
function addVercelResHelpers(res) {
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (obj) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(obj));
  };
  return res;
}

const server = http.createServer((req, res) => {
  if (req.url === '/api/chat' && req.method === 'POST') {
    addVercelResHelpers(res);
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        req.body = body ? JSON.parse(body) : {};
      } catch (e) {
        req.body = {};
      }
      Promise.resolve(chatHandler(req, res)).catch((err) => {
        console.error('Unhandled error in chatHandler:', err);
        if (!res.headersSent) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Internal server error' }));
        }
      });
    });
    return;
  }

  if (req.url === '/api/chat' && req.method === 'OPTIONS') {
    addVercelResHelpers(res);
    chatHandler(req, res);
    return;
  }

  if (req.url === '/widget/chatbot-widget.js') {
    res.setHeader('Content-Type', 'application/javascript');
    fs.createReadStream(path.join(__dirname, 'widget', 'chatbot-widget.js')).pipe(res);
    return;
  }

  if (req.url === '/' || req.url === '/index.html') {
    res.setHeader('Content-Type', 'text/html');
    fs.createReadStream(path.join(__dirname, 'test.html')).pipe(res);
    return;
  }

  res.statusCode = 404;
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`FPB chatbot local test server running at http://localhost:${PORT}`);
});
