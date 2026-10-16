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

// Fonts used above the fold: fetched early so the headline does not jump.
const assets = await fs.readdir(path.join(dist, 'assets'));
const pick = (re) => assets.find((f) => re.test(f));
const fonts = [/^kalam-devanagari-700-normal-.*\.woff2$/, /^martel-latin-800-normal-.*\.woff2$/, /^mukta-latin-400-normal-.*\.woff2$/]
  .map(pick)
  .filter(Boolean)
  .map((f) => `<link rel="preload" href="/assets/${f}" as="font" type="font/woff2" crossorigin />`);
const media = JSON.parse(await fs.readFile(path.join(root, 'src/generated/media.json'), 'utf8'));
const hero = media[site.home.hero.image];
const heroPreload = hero
  ? `<link rel="preload" as="image" imagesrcset="${hero.variants.map((v) => `${v.src} ${v.w}w`).join(', ')}" imagesizes="(min-width: 900px) 580px, 100vw" fetchpriority="high" />`
  : '';

const page = (url) => {
  const { html, head } = render(url);
  const preloads = [...fonts, ...(url === '/' && heroPreload ? [heroPreload] : [])].join('\n    ');
  return template.replace('<!--app-head-->', `${preloads}\n    ${head}`).replace('<!--app-html-->', html);
};

const list = routes();
for (const url of list) {
  const file = path.join(dist, url, 'index.html');
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, page(url));
}
await fs.writeFile(path.join(dist, '404.html'), page('/page-not-found/'));

const base = site.site.url.replace(/\/$/, '');
const day = new Date().toISOString().slice(0, 10); // the day the pages were built
// Sitemap with the photos of each page, so they can appear in image search.
const xml = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const imagesFor = (url) => {
  const files = [];
  if (url === '/') files.push(site.home.hero.image, ...site.products.map((p) => p.image));
  const slug = url.match(/^\/products\/([^/]+)\/$/)?.[1];
  const product = site.products.find((p) => p.slug === slug);
  if (product) files.push(product.image);
  const cat = url.match(/^\/products\/category\/([^/]+)\/$/)?.[1];
  if (cat) files.push(...site.products.filter((p) => p.category === cat).map((p) => p.image));
  if (url === '/products/') files.push(...site.products.map((p) => p.image));
  return [...new Set(files)].filter((f) => media[f]).map((f) => base + media[f].variants[media[f].variants.length - 1].src);
};
const priority = (url) => (url === '/' ? '1.0' : url.startsWith('/products/') ? '0.8' : '0.6');
await fs.writeFile(
  path.join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n` +
    list
      .map(
        (url) =>
          `  <url><loc>${base}${url}</loc><lastmod>${day}</lastmod><priority>${priority(url)}</priority>` +
          imagesFor(url).map((src) => `<image:image><image:loc>${xml(src)}</image:loc></image:image>`).join('') +
          `</url>`,
      )
      .join('\n') +
    `\n</urlset>\n`,
);
// GitHub Pages: serve the files as they are.
await fs.writeFile(path.join(dist, '.nojekyll'), '');
await fs.rm(path.join(root, 'dist-ssr'), { recursive: true, force: true });
console.log(`prerender: ${list.length} pages + 404.html + sitemap.xml`);
