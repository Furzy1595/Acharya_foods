// Turns the photos in content/media into small web pictures in public/media
// and writes src/generated/media.json (sizes, so the pages never jump while loading).
// Runs before every build; pictures that did not change are skipped.
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.join(root, 'content/media');
const outDir = path.join(root, 'public/media');
const manifestFile = path.join(root, 'src/generated/media.json');
const WIDTHS = [480, 960, 1600];
const SHARE_WIDTH = 1200; // JPEG for link previews (WhatsApp, Facebook)

await fs.mkdir(outDir, { recursive: true });
await fs.mkdir(path.dirname(manifestFile), { recursive: true });

const manifest = {};
const wanted = new Set();
const files = (await fs.readdir(srcDir)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort();

for (const file of files) {
  const src = path.join(srcDir, file);
  const stat = await fs.stat(src);
  const base = path.parse(file).name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const image = sharp(src, { failOn: 'none' }).rotate(); // .rotate() applies the phone's orientation
  const meta = await image.metadata();
  const turned = (meta.orientation ?? 1) >= 5;
  const width = turned ? meta.height : meta.width;
  const height = turned ? meta.width : meta.height;
  const widths = WIDTHS.filter((w) => w <= width);
  if (widths.length === 0) widths.push(width);

  const variants = [];
  for (const w of widths) {
    const name = `${base}-${w}.webp`;
    wanted.add(name);
    variants.push({ w, src: `/media/${name}` });
    const out = path.join(outDir, name);
    if (await fresh(out, stat)) continue;
    await image.clone().resize({ width: w, withoutEnlargement: true }).webp({ quality: 78 }).toFile(out);
  }
  const shareName = `${base}-share.jpg`;
  wanted.add(shareName);
  const shareOut = path.join(outDir, shareName);
  if (!(await fresh(shareOut, stat))) {
    await image.clone().resize({ width: SHARE_WIDTH, height: 630, fit: 'cover', position: 'attention' }).flatten({ background: '#ffffff' }).jpeg({ quality: 82, mozjpeg: true }).toFile(shareOut);
  }
  manifest[file] = { width, height, variants, share: `/media/${shareName}` };
}

// Remove pictures that are no longer in content/media.
for (const f of await fs.readdir(outDir)) if (!wanted.has(f)) await fs.rm(path.join(outDir, f));

await fs.writeFile(manifestFile, JSON.stringify(manifest, null, 2) + '\n');
console.log(`images: ${files.length} photos -> ${wanted.size} files`);

async function fresh(out, srcStat) {
  try {
    return (await fs.stat(out)).mtimeMs >= srcStat.mtimeMs;
  } catch {
    return false;
  }
}
