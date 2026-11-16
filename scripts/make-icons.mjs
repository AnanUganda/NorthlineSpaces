// One-off: renders the PNG icons from the Northline mark. Re-run if the mark changes:
//   node scripts/make-icons.mjs
import sharp from "sharp";
const mark = (fill, star) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="6 4 96 96">
  <path fill="${fill}" d="M12 24h17v66H12z"/>
  <path fill="${fill}" d="M12 24h18l58 54v12H70L12 36z"/>
  <path fill="${fill}" d="M71 56h17v34H71z"/>
  <path fill="${star}" d="M80 8l4.2 15.8L100 28l-15.8 4.2L80 48l-4.2-15.8L60 28l15.8-4.2z"/>
</svg>`;
const ink = "#161412", bronze = "#8a6742", linen = "#f3f0eb";
// 32px tab icon: transparent background
await sharp(Buffer.from(mark(ink, bronze))).resize(32, 32).png().toFile("public/favicon-32.png");
// 180px home-screen icon: mark centered on linen with breathing room
const inner = await sharp(Buffer.from(mark(ink, bronze))).resize(124, 124).png().toBuffer();
await sharp({ create: { width: 180, height: 180, channels: 4, background: linen } })
  .composite([{ input: inner, gravity: "center" }])
  .png()
  .toFile("public/apple-touch-icon.png");
console.log("icons written");
