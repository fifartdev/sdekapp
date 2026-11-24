// One-off generator for the PWA icons in public/icons/.
// Run: node scripts/generate-icons.mjs  (uses sharp, which ships with Next)
// The source logo is a wide banner; only its left emblem square (Ο.Σ.Ε.Κ.Α. / H.W.B.F.) is legible
// at icon sizes, so we crop that and centre it on the emblem's own background colour.
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";

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
// Favicon via the Next.js file convention (app/icon.png → <link rel="icon">).
await square(64, 0.86, "../../app/icon.png");

// app/favicon.ico: ICO container holding PNG images (supported by all current browsers).
async function favicon(sizes, file) {
  const pngs = [];
  for (const size of sizes) {
    const art = await emblem().resize({ height: Math.round(size * 0.86) }).toBuffer();
    pngs.push(
      await sharp({ create: { width: size, height: size, channels: 4, background: BG } })
        .composite([{ input: art, gravity: "center" }])
        .flatten({ background: BG })
        .png()
        .toBuffer()
    );
  }
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(pngs.length, 4);
  let offset = 6 + 16 * pngs.length;
  const entries = pngs.map((png, i) => {
    const e = Buffer.alloc(16);
    const size = sizes[i];
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2); // palette
    e.writeUInt8(0, 3); // reserved
    e.writeUInt16LE(1, 4); // colour planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(png.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += png.length;
    return e;
  });
  await writeFile(file, Buffer.concat([header, ...entries, ...pngs]));
}
await favicon([16, 32, 48], "app/favicon.ico");
console.log("icons written to", OUT);
