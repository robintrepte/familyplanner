#!/usr/bin/env node
/**
 * Generates favicon and app icons from the same heart used in the header
 * (Lucide Heart, fill pink-500 #ec4899). Run: node scripts/generate-favicons.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// Lucide Heart path (same as header <Heart />), pink-500 = #ec4899
const HEART_PATH =
  "M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5";
const FILL = "#ec4899";

const sizes = [
  { name: "favicon-16x16.png", size: 16 },
  { name: "favicon-32x32.png", size: 32 },
  { name: "apple-touch-icon.png", size: 180 },
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
];

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path fill="${FILL}" d="${HEART_PATH}" />
</svg>
`;

async function main() {
  const appDir = path.join(ROOT, "src", "app");
  const publicDir = path.join(ROOT, "public");
  const publicIconsDir = path.join(publicDir, "icons");

  if (!fs.existsSync(appDir)) fs.mkdirSync(appDir, { recursive: true });
  if (!fs.existsSync(publicIconsDir)) fs.mkdirSync(publicIconsDir, { recursive: true });

  const buffer = Buffer.from(svg.trim());

  // Generate PNGs (app/ for apple-touch only; public/ for the rest so they're served at /)
  let png16Buffer;
  let png32Buffer;

  for (const { name, size } of sizes) {
    const outPath =
      name === "apple-touch-icon.png"
        ? path.join(appDir, name)
        : name.startsWith("icon-")
          ? path.join(publicIconsDir, name)
          : path.join(publicDir, name);
    await sharp(buffer)
      .resize(size, size)
      .png()
      .toFile(outPath);
    console.log("Wrote", outPath);

    if (name === "favicon-16x16.png") png16Buffer = await fs.promises.readFile(outPath);
    if (name === "favicon-32x32.png") png32Buffer = await fs.promises.readFile(outPath);
  }

  // Build favicon.ico (16 + 32) and write to app dir
  const icoBuffer = await pngToIco([png16Buffer, png32Buffer]);
  const icoPath = path.join(appDir, "favicon.ico");
  fs.writeFileSync(icoPath, icoBuffer);
  console.log("Wrote", icoPath);

  console.log("\nDone. Icons match the header heart (Lucide Heart, pink-500).");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
