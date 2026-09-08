// Rasterize the Stub mark into the PNG sizes browsers and platforms want.
// Run: npm run icons
//
//  favicon-*.png        the rounded-tile mark, for browser tabs
//  apple-touch-icon.png  full-bleed, square, opaque; iOS rounds it itself
//  icon-maskable-512.png art inside the maskable safe zone, for Android
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Resvg } from "@resvg/resvg-js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// the ticket: bone body with deep waist notches and a maroon tear-off stub
const TICKET = `
  <defs><clipPath id="t"><path d="M84 132h344a30 30 0 0 1 30 30v20a80 80 0 1 0 0 160v20a30 30 0 0 1-30 30H84a30 30 0 0 1-30-30v-20a80 80 0 1 0 0-160v-20a30 30 0 0 1 30-30Z"/></clipPath></defs>
  <g clip-path="url(#t)">
    <rect x="36" y="120" width="440" height="272" fill="#F2ECE1"/>
    <rect x="316" y="120" width="160" height="272" fill="#B34156"/>
    <rect x="304" y="120" width="12" height="272" fill="#151412"/>
  </g>`;

const rounded = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" rx="120" fill="#151412"/>${TICKET}</svg>`;

// square, edge-to-edge background; `scale` shrinks the art to leave a margin
const squared = (scale) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" fill="#151412"/><g transform="translate(256 256) scale(${scale}) translate(-256 -256)">${TICKET}</g></svg>`;

const targets = [
  ["favicon-32.png", 32, rounded],
  ["favicon-192.png", 192, rounded],
  ["favicon-512.png", 512, rounded],
  ["apple-touch-icon.png", 180, squared(0.82)],
  ["icon-maskable-512.png", 512, squared(0.6)],
];

for (const [name, size, svg] of targets) {
  const png = new Resvg(svg, { fitTo: { mode: "width", value: size } }).render().asPng();
  writeFileSync(join(root, "public", name), png);
  console.log(`wrote public/${name} (${size}px)`);
}
