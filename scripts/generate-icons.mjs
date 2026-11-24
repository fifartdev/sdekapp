// One-off generator for the PWA icons in public/icons/.
// Run: node scripts/generate-icons.mjs  (uses sharp, which ships with Next)
// The source logo is a wide banner; only its left emblem square (Ο.Σ.Ε.Κ.Α. / H.W.B.F.) is legible
// at icon sizes, so we crop that and centre it on the emblem's own background colour.
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const SRC = "public/logo-oseka.png";
const OUT = "public/icons";
const EMBLEM = { left: 0, top: 0, width: 84, height: 90 };
const BG = "#215aa7"; // emblem background (sampled from the logo)

const emblem = () => sharp(SRC).extract(EMBLEM);

async function square(size, ratio, file) {
  const art = await emblem()
    .resize({ height: Math.round(size * ratio), kernel: "lanczos3" })
    .toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: BG } })
    .composite([{ input: art, gravity: "center" }])
    .flatten({ background: BG })
    .png()
    .toFile(`${OUT}/${file}`);
}

// Monochrome status-bar badge: the emblem's white strokes as white on transparent.
async function badge(size, file) {
  const art = emblem().resize({ height: Math.round(size * 0.9) });
  const { data, info } = await art.raw().ensureAlpha().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0; i < info.width * info.height; i++) {
    const [r, g, b] = [data[i * 4], data[i * 4 + 1], data[i * 4 + 2]];
    const whiteness = Math.min(r, g, b);
    out.set([255, 255, 255, whiteness > 150 ? 255 : 0], i * 4);
  }
  const white = await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: white, gravity: "center" }])
    .png()
    .toFile(`${OUT}/${file}`);
}

await mkdir(OUT, { recursive: true });
await square(192, 0.86, "icon-192.png");
await square(512, 0.86, "icon-512.png");
await square(512, 0.62, "maskable-512.png");
await square(180, 0.86, "apple-touch-icon.png");
await badge(96, "badge-96.png");
console.log("icons written to", OUT);
