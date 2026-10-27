// Derive tokens, thumbnails, banner and labeled plan from the committed 2.1 art.
// The generated paintings are masters: never replace them with the legacy SVGs.
// Usage: node tools/art.mjs [map|people|objects]
import fs from "node:fs";
import sharp from "sharp";
import { tokenFrom } from "./art/common.mjs";
import { GRID, ZONES } from "../src/layout.mjs";

const only = process.argv[2];
if (only && !["map", "people", "objects"].includes(only)) throw new Error(`Groupe inconnu : ${only}`);
const rings = {
  aoi: "#2f6f9f", daigo: "#c2462a", ren: "#d7a321", sayo: "#d06a8c", isamu: "#5f9b6a",
  tamaki: "#8a6a2f", fumi: "#8a6a2f", gen: "#8a6a2f", chiyo: "#8a6a2f",
  captive: "#8f2f2f", goro: "#6b1f2a", shigure: "#7a1f1f",
};

if (!only || only === "people") {
  for (const [key, ring] of Object.entries(rings)) {
    await tokenFrom(fs.readFileSync(`assets/portraits/${key}.webp`), `tokens/${key}.webp`, ring,
      { focus: { left: 64, top: 16, size: 384 } });
  }
  console.log("12 tokens dérivés des nouveaux portraits (400 × 400, alpha conservé)");
}

if (!only || only === "objects") {
  for (const zone of "BCE") {
    // Keep the letter inside the circular crop so it is readable on the canvas.
    const badge = Buffer.from(`<svg width="512" height="512"><circle cx="380" cy="380" r="50" fill="#f3ead4" stroke="#231a16" stroke-width="6"/>
      <text x="380" y="403" text-anchor="middle" font-family="Georgia, serif" font-size="68" font-weight="700" fill="#231a16">${zone}</text></svg>`);
    const portrait = await sharp("tools/art/counterweight.webp").composite([{ input: badge }]).webp({ quality: 92 }).toBuffer();
    const key = `poids-${zone.toLowerCase()}`;
    fs.writeFileSync(`assets/portraits/${key}.webp`, portrait);
    await tokenFrom(portrait, `tokens/${key}.webp`, "#4a4f55");
  }
  await sharp("assets/art/cover.webp").resize(480, 270).webp({ quality: 85 }).toFile("assets/art/cover-thumb.webp");
  await sharp("assets/art/cover.webp").extract({ left: 0, top: 280, width: 1920, height: 480 })
    .resize(1600, 400).webp({ quality: 90 }).toFile("assets/art/banner.webp");
  console.log("Contrepoids B/C/E, miniature et bannière dérivés ; pièces à remettre conservées");
}

if (!only || only === "map") {
  await sharp("assets/maps/filature-minase.webp").resize(300, 200).webp({ quality: 85 }).toFile("assets/maps/filature-minase-thumb.webp");
  const labels = Object.entries(ZONES).map(([key, zone]) => {
    const x = (zone.x0 + zone.x1) / 2 * GRID / 2;
    const y = (zone.y0 + 1.1) * GRID / 2;
    return `<rect x="${x - 165}" y="${y - 35}" width="330" height="60" rx="10" fill="#f6efe1" fill-opacity="0.9" stroke="#7a2e2e" stroke-width="3"/>
      <text x="${x}" y="${y + 9}" font-family="Georgia, serif" font-size="39" font-weight="700" text-anchor="middle" fill="#1f2a30">${key} · ${zone.name}</text>`;
  }).join("");
  const overlay = Buffer.from(`<svg width="1800" height="1200"><rect width="1800" height="1200" fill="#000" opacity="0.15"/>${labels}</svg>`);
  await sharp("assets/maps/filature-minase.webp").resize(1800, 1200).composite([{ input: overlay }])
    .webp({ quality: 90 }).toFile("assets/maps/filature-minase-plan.webp");
  console.log("Miniature et plan dérivés (300 × 200 / 1800 × 1200) ; géométrie de scène conservée");
}
