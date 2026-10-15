// One-off image optimizer for adding real photos to the site.
//
// Usage:
//   node scripts/optimize-image.mjs <input> <slot-name> <width>x<height>
//
// Example:
//   node scripts/optimize-image.mjs public/images/incoming/lib.jpg hero-academics 1920x900
//
// Output: public/images/site/<slot-name>.webp — cropped to cover the
// slot's aspect ratio, resized to the target width, quality 80. That
// output path is the value to paste into the slot's `src` field
// ("/images/site/hero-academics.webp").
//
// sharp is a devDependency only — this never ships to the browser.

import sharp from "sharp";
import { mkdirSync, existsSync } from "node:fs";
import path from "node:path";

const [input, slotName, sizeArg] = process.argv.slice(2);

if (!input || !slotName || !sizeArg) {
  console.error(
    "Usage: node scripts/optimize-image.mjs <input> <slot-name> <width>x<height>\n" +
      "  e.g. node scripts/optimize-image.mjs public/images/incoming/lib.jpg library 1200x800"
  );
  process.exit(1);
}

const [width, height] = sizeArg.split("x").map(Number);
if (!width || !height) {
  console.error(`Bad size "${sizeArg}" — expected like 1920x900`);
  process.exit(1);
}
if (!existsSync(input)) {
  console.error(`Input not found: ${input}`);
  process.exit(1);
}

const outDir = path.join("public", "images", "site");
mkdirSync(outDir, { recursive: true });
const output = path.join(outDir, `${slotName}.webp`);

await sharp(input)
  .rotate() // honor EXIF orientation — phone photos often carry it
  .resize(width, height, { fit: "cover", position: "attention" })
  .webp({ quality: 80 })
  .toFile(output);

const meta = await sharp(output).metadata();
console.log(`OK  ${output}  ${meta.width}x${meta.height}  src="/images/site/${slotName}.webp"`);
