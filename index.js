const http = require('http');
const https = require('https');
const url = require('url');

const PORT = process.env.PORT || 3000;
const ALLOWED = ['api.stlouisfed.org'];

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  const target = parsed.query.url;
  if (!target) { res.writeHead(400); return res.end('url required'); }
  let targetUrl;
  try { targetUrl = new URL(target); } catch(e) { res.writeHead(400); return res.end('bad url'); }
  if (!ALLOWED.some(d => targetUrl.hostname.includes(d))) { res.writeHead(403); return res.end('forbidden'); }
  https.get(target, { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' } }, (proxyRes) => {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    proxyRes.pipe(res);
  }).on('error', (e) => { res.writeHead(500); res.end('error: ' + e.message); });
});

server.listen(PORT, () => console.log('Proxy on port ' + PORT));
