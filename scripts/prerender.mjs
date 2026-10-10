// Last step of "npm run build": writes one finished HTML file per page
// (so every address works on GitHub Pages and search engines read real text),
// plus 404.html and sitemap.xml.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const { render, routes } = await import(pathToFileURL(path.join(root, 'dist-ssr/entry-server.js')).href);
const site = JSON.parse(await fs.readFile(path.join(root, 'content/site.json'), 'utf8'));
const template = await fs.readFile(path.join(dist, 'index.html'), 'utf8');

const page = (url) => {
  const { html, head } = render(url);
  return template.replace('<!--app-head-->', head).replace('<!--app-html-->', html);
};

const list = routes();
for (const url of list) {
  const file = path.join(dist, url, 'index.html');
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, page(url));
}
await fs.writeFile(path.join(dist, '404.html'), page('/page-not-found/'));

const base = site.site.url.replace(/\/$/, '');
const day = new Date(site.publishedAt).toISOString().slice(0, 10);
await fs.writeFile(
  path.join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    list.map((url) => `  <url><loc>${base}${url}</loc><lastmod>${day}</lastmod></url>`).join('\n') +
    `\n</urlset>\n`,
);
// GitHub Pages: serve the files as they are.
await fs.writeFile(path.join(dist, '.nojekyll'), '');
await fs.rm(path.join(root, 'dist-ssr'), { recursive: true, force: true });
console.log(`prerender: ${list.length} pages + 404.html + sitemap.xml`);
