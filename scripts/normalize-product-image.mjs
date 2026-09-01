#!/usr/bin/env node
// Normalize product shots onto one shared canvas so every item renders at a
// consistent scale. Trims the surrounding empty space, then re-places the
// subject on a fixed transparent square at a fixed fill ratio.
//
//   node scripts/normalize-product-image.mjs in.png [more.png ...]
//   node scripts/normalize-product-image.mjs --canvas 1600 --fill 0.86 in.png

import { basename, dirname, extname, join } from "node:path";
import sharp from "sharp";

const args = process.argv.slice(2);
const readFlag = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  if (index === -1) return fallback;
  const value = Number(args[index + 1]);
  args.splice(index, 2);
  return Number.isFinite(value) ? value : fallback;
};

const canvas = readFlag("canvas", 1600);
const fill = readFlag("fill", 0.86);
const inputs = args.filter((arg) => !arg.startsWith("--"));

if (!inputs.length) {
  console.error("Usage: node scripts/normalize-product-image.mjs [--canvas 1600] [--fill 0.86] <image...>");
  process.exit(1);
}

const box = Math.round(canvas * fill);

for (const input of inputs) {
  const before = await sharp(input).metadata();

  // trim() crops away a uniform border, transparent or solid, so the subject's
  // own bounding box is all that survives.
  const subject = await sharp(input)
    .ensureAlpha()
    .trim({ threshold: 1 })
    .resize({ width: box, height: box, fit: "inside", withoutEnlargement: false })
    .toBuffer();

  const output = join(dirname(input), `${basename(input, extname(input))}.normalized.png`);
  await sharp({
    create: { background: { alpha: 0, b: 0, g: 0, r: 0 }, channels: 4, height: canvas, width: canvas },
  })
    .composite([{ gravity: "center", input: subject }])
    .png({ compressionLevel: 9 })
    .toFile(output);

  const after = await sharp(output).metadata();
  const trimmed = await sharp(subject).metadata();
  console.log(
    `${basename(input)}  ${before.width}x${before.height}` +
      `  ->  subject ${trimmed.width}x${trimmed.height}` +
      `  ->  ${after.width}x${after.height}  (${(100 * Math.max(trimmed.width, trimmed.height) / canvas).toFixed(0)}% fill)`,
  );
  console.log(`   ${output}`);
}
