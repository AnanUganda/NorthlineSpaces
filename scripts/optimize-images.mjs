// Pre-builds responsive WebP versions of every image in src/assets/images into
// public/img/, plus the 1200x630 social share card. Pages are server-rendered on
// Wix hosting, which doesn't run Astro's on-the-fly /_image service, so images
// are optimized ahead of time and served as plain static files.
// Runs automatically before `npm run build` and `npm run dev` (prebuild/predev).
import sharp from "sharp";
import { readdir, mkdir, stat } from "node:fs/promises";
import path from "node:path";

const SRC = "src/assets/images";
const OUT = "public/img";
export const WIDTHS = [400, 800, 1200, 1600, 2400];

const fresh = async (out, src) => {
  try {
    return (await stat(out)).mtimeMs >= (await stat(src)).mtimeMs;
  } catch {
    return false;
  }
};

await mkdir(OUT, { recursive: true });
let made = 0;
for (const file of await readdir(SRC)) {
  if (!/\.(jpe?g|png|webp)$/i.test(file)) continue;
  const src = path.join(SRC, file);
  const name = file.replace(/\.[^.]+$/, "");
  const { width } = await sharp(src).metadata();
  for (const w of WIDTHS.filter((w) => w <= width).concat(width < WIDTHS[0] ? [width] : [])) {
    const out = path.join(OUT, `${name}-${w}.webp`);
    if (await fresh(out, src)) continue;
    await sharp(src).resize({ width: w }).webp({ quality: 72 }).toFile(out);
    made++;
  }
}

// Social share card from the hero render.
const og = path.join(OUT, "og-default.jpg");
const ogSrc = path.join(SRC, "hero-driveway.jpg");
if (!(await fresh(og, ogSrc))) {
  await sharp(ogSrc).resize(1200, 630, { fit: "cover" }).jpeg({ quality: 78 }).toFile(og);
  made++;
}
console.log(`[images] ${made} optimized file(s) written to ${OUT}`);
