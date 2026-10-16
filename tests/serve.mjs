// A tiny stand-in for GitHub Pages: serves ./dist, folder addresses get their index.html,
// unknown addresses get 404.html. Used by the tests and for looking at a build.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.woff2': 'font/woff2', '.woff': 'font/woff', '.xml': 'application/xml', '.txt': 'text/plain' };

export function serveDist(port = 0) {
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let file = path.join(dist, url);
    if (!file.startsWith(dist)) return res.writeHead(403).end();
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
      if (!url.endsWith('/')) return res.writeHead(301, { Location: url + '/' }).end();
      file = path.join(file, 'index.html');
    }
    if (!fs.existsSync(file)) {
      res.writeHead(404, { 'Content-Type': TYPES['.html'] });
      return res.end(fs.readFileSync(path.join(dist, '404.html')));
    }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(port, '127.0.0.1', () => resolve({ server, url: `http://127.0.0.1:${server.address().port}` })));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { url } = await serveDist(Number(process.argv[2] ?? 4173));
  console.log(url);
}
