// Removes the white BACKGROUND from a logo image while preserving white
// content inside the artwork (the JOLNHS seal's shield and text).
//
// Method: flood-fill transparency inward from the image edges — only
// white-connected-to-the-border becomes transparent, so interior white
// (part of the seal design) survives untouched.
//
// Usage:
//   node scripts/remove-white-bg.mjs <input> <output> [threshold]

import sharp from "sharp";
import path from "node:path";
import { mkdirSync } from "node:fs";

const [input, output, thresholdArg] = process.argv.slice(2);
if (!input || !output) {
  console.error(
    "Usage: node scripts/remove-white-bg.mjs <input> <output> [threshold]\n" +
      "  e.g. node scripts/remove-white-bg.mjs public/images/logo-jolnhs.png public/images/logo-jolnhs-transparent.webp"
  );
  process.exit(1);
}
const THRESHOLD = thresholdArg ? Number(thresholdArg) : 235;

const { data, info } = await sharp(input)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width: w, height: h } = info;
const isNearWhite = (i) =>
  data[i] >= THRESHOLD && data[i + 1] >= THRESHOLD && data[i + 2] >= THRESHOLD;

// BFS flood fill from every near-white border pixel.
const queue = [];
const visited = new Uint8Array(w * h);
const push = (x, y) => {
  const p = y * w + x;
  if (x < 0 || y < 0 || x >= w || y >= h || visited[p]) return;
  if (!isNearWhite(p * 4)) return;
  visited[p] = 1;
  queue.push(p);
};

for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }

let removed = 0;
while (queue.length) {
  const p = queue.pop();
  data[p * 4 + 3] = 0; // alpha → transparent
  removed++;
  const x = p % w;
  const y = (p / w) | 0;
  push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1);
}

mkdirSync(path.dirname(output), { recursive: true });
await sharp(data, { raw: { width: w, height: h, channels: 4 } })
  .webp({ quality: 95 })
  .toFile(output);

console.log(
  `OK  ${output}  ${w}x${h}  cleared ${removed} background pixels ` +
  `(${(removed / (w * h) * 100).toFixed(1)}% of image)`
);
