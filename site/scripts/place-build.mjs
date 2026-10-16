// Copies the finished website (site/dist) to the top folder of the repository, where
// GitHub Pages ("Deploy from a branch: main / root") serves it. Files placed by the
// previous build are listed in .published-files and removed first, so a page that no
// longer exists disappears from the site too. Nothing else at the top is touched.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const dist = path.join(repo, 'site/dist');
const listFile = path.join(repo, '.published-files');
const KEEP = new Set(['.git', '.github', '.gitignore', '.published-files', 'site', 'docs', 'README.md', 'LICENSE']);

if (!fs.existsSync(path.join(dist, 'index.html'))) throw new Error('site/dist is missing: run "npm run build" in site/ first');

const previous = fs.existsSync(listFile) ? fs.readFileSync(listFile, 'utf8').split('\n').filter(Boolean) : [];
for (const entry of previous) {
  if (KEEP.has(entry) || entry.includes('..') || entry.includes('/')) continue;
  fs.rmSync(path.join(repo, entry), { recursive: true, force: true });
}

const placed = [];
for (const entry of fs.readdirSync(dist)) {
  if (KEEP.has(entry)) throw new Error(`the build contains "${entry}", which would overwrite the repository's own ${entry}`);
  fs.cpSync(path.join(dist, entry), path.join(repo, entry), { recursive: true });
  placed.push(entry);
}
fs.writeFileSync(listFile, placed.sort().join('\n') + '\n');
console.log(`placed ${placed.length} items at the top of the repository: ${placed.join(', ')}`);
