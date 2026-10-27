// Top-down battlemap of the Minase silk mill, painted from src/layout.mjs so the
// art lines up with the Foundry walls and doors.
import { GRID as S, MAP, ZONES, DOORS, POI, wallSegments } from "../../src/layout.mjs";
import { rng, f, mix, noiseFilter, shadowFilter, svg, render } from "./common.mjs";

const W = MAP.w * S, H = MAP.h * S;
const R = rng("filature-minase");
const P = v => v * S;

const defs = [
  noiseFilter("grass", { freq: "0.012", octaves: 5, seed: 11, dark: "#2c3a22", light: "#6f7f45", contrast: 1.4 }),
  noiseFilter("earth", { freq: "0.03", octaves: 5, seed: 12, dark: "#6b5236", light: "#b39468", contrast: 1.3 }),
  noiseFilter("road", { freq: "0.05 0.012", octaves: 4, seed: 13, dark: "#5d4a33", light: "#a88d64", contrast: 1.3 }),
  noiseFilter("water", { freq: "0.006 0.03", octaves: 4, seed: 14, dark: "#16313f", light: "#3f7486", contrast: 1.5 }),
  noiseFilter("stone", { freq: "0.08", octaves: 3, seed: 15, dark: "#6e6a62", light: "#a9a397", contrast: 1.2 }),
  noiseFilter("grain", { freq: "0.002 0.09", octaves: 3, seed: 16, dark: "#000000", light: "#ffffff", contrast: 1.6 }),
  noiseFilter("grime", { freq: "0.004", octaves: 5, seed: 17, dark: "#2a2016", light: "#ffffff", contrast: 1 }),
  noiseFilter("weave", { freq: "0.6 0.02", octaves: 1, seed: 18, dark: "#000000", light: "#ffffff" }),
  shadowFilter("shadow", 7, 6, 9, 0.5), shadowFilter("soft", 4, 3, 4, 0.35), shadowFilter("wallshadow", 10, 10, 14, 0.55),
  `<filter id="blur8"><feGaussianBlur stdDeviation="8"/></filter><filter id="blur20"><feGaussianBlur stdDeviation="20"/></filter>`,
  `<radialGradient id="iron" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#7d8288"/><stop offset="0.6" stop-color="#3a3f45"/><stop offset="1" stop-color="#1c1f22"/></radialGradient>`,
  `<radialGradient id="copper" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#e3a46a"/><stop offset="0.55" stop-color="#a5602f"/><stop offset="1" stop-color="#5a3016"/></radialGradient>`,
  `<radialGradient id="glow" r="50%"><stop offset="0" stop-color="#ffd27a" stop-opacity="0.95"/><stop offset="0.4" stop-color="#ff8a2a" stop-opacity="0.6"/><stop offset="1" stop-color="#ff5a00" stop-opacity="0"/></radialGradient>`,
  `<radialGradient id="seal" r="50%"><stop offset="0" stop-color="#ff6b5a"/><stop offset="0.5" stop-color="#b3191f"/><stop offset="1" stop-color="#5a0a0d"/></radialGradient>`,
  `<radialGradient id="redglow" r="50%"><stop offset="0" stop-color="#ff2a2a" stop-opacity="0.55"/><stop offset="1" stop-color="#ff0000" stop-opacity="0"/></radialGradient>`,
  `<radialGradient id="vignette" r="75%"><stop offset="0.6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.45"/></radialGradient>`,
  `<linearGradient id="pipe" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c98b57"/><stop offset="0.45" stop-color="#8a4f26"/><stop offset="1" stop-color="#3d210f"/></linearGradient>`,
  `<linearGradient id="bale" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbf5e6"/><stop offset="1" stop-color="#cdbf9f"/></linearGradient>`,
].join("");

const out = [];
const clip = (id, x0, y0, x1, y1) => `<clipPath id="${id}"><rect x="${P(x0)}" y="${P(y0)}" width="${P(x1 - x0)}" height="${P(y1 - y0)}"/></clipPath>`;
let clips = "";

/* ---------- ground ---------- */
out.push(`<rect width="${W}" height="${H}" filter="url(#grass)"/>`);
for (let i = 0; i < 260; i++) out.push(`<circle cx="${f(R.range(0, W))}" cy="${f(R.range(0, H))}" r="${f(R.range(6, 26))}" fill="${R.pick(["#3b4a2a", "#55663a", "#2e3b22"])}" opacity="0.35"/>`);
// road along the west side, with cart ruts
out.push(`<path d="M0 0 H${P(2.9)} V${H} H0Z" filter="url(#road)"/>`);
for (const x of [0.8, 2.1]) out.push(`<path d="M${P(x)} 0 C ${P(x + 0.15)} ${P(8)}, ${P(x - 0.15)} ${P(16)}, ${P(x)} ${H}" stroke="#3e301f" stroke-width="16" fill="none" opacity="0.35" filter="url(#blur8)"/>`);
out.push(`<path d="M${P(2.9)} 0 V${H}" stroke="#4f5d33" stroke-width="22" opacity="0.7" filter="url(#blur8)"/>`);
// river to the east
const bank = Array.from({ length: 25 }, (_, i) => `${f(P(33.3 + Math.sin(i * 1.7) * 0.18 + R.range(-0.08, 0.08)))} ${f(P(i))}`).join(" L");
out.push(`<path d="M${bank} L${W} ${H} L${W} 0Z" fill="#7b6a4c"/>`);
const water = Array.from({ length: 25 }, (_, i) => `${f(P(33.7 + Math.sin(i * 1.3) * 0.2 + R.range(-0.06, 0.06)))} ${f(P(i))}`).join(" L");
out.push(`<path d="M${water} L${W} ${H} L${W} 0Z" filter="url(#water)"/>`);
for (let i = 0; i < 70; i++) { const x = R.range(P(34), W - 20), y = R.range(0, H); out.push(`<path d="M${f(x)} ${f(y)} q ${f(R.range(20, 40))} -6 ${f(R.range(50, 90))} 0" stroke="#9cc3cf" stroke-width="3" fill="none" opacity="${f(R.range(0.15, 0.4) * 100) / 100}"/>`); }

/* ---------- floors ---------- */
const zone = k => ZONES[k];
// A: packed earth with gravel
{ const z = zone("A"); out.push(`<rect x="${P(z.x0)}" y="${P(z.y0)}" width="${P(z.x1 - z.x0)}" height="${P(z.y1 - z.y0)}" filter="url(#earth)"/>`);
  for (let i = 0; i < 500; i++) out.push(`<circle cx="${f(R.range(P(z.x0), P(z.x1)))}" cy="${f(R.range(P(z.y0), P(z.y1)))}" r="${f(R.range(1.5, 5))}" fill="${R.pick(["#8d7a5d", "#5e4b33", "#c2ad86"])}" opacity="0.7"/>`);
  for (let i = 0; i < 6; i++) out.push(`<ellipse cx="${f(R.range(P(4), P(12)))}" cy="${f(R.range(P(2), P(11)))}" rx="${f(R.range(40, 110))}" ry="${f(R.range(20, 50))}" fill="#3d4a52" opacity="0.35" filter="url(#blur8)"/>`); }

function planks(key, z, dir = "h", base = "#8a6440", width = 0.45) {
  const id = "clip-" + key; clips += clip(id, z.x0, z.y0, z.x1, z.y1);
  const g = [`<g clip-path="url(#${id})">`];
  const [a0, a1, b0, b1] = dir === "h" ? [z.y0, z.y1, z.x0, z.x1] : [z.x0, z.x1, z.y0, z.y1];
  for (let a = a0; a < a1; a += width) {
    let b = b0 - R.range(0, 2);
    while (b < b1) {
      const len = R.range(2, 4.5), c = mix(base, R.pick(["#000000", "#ffffff", "#5a3a1a"]), R.range(0.02, 0.16));
      const [x, y, w, h] = dir === "h" ? [P(b), P(a), P(len), P(width)] : [P(a), P(b), P(width), P(len)];
      g.push(`<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${c}" stroke="#2b1c10" stroke-width="2.2"/>`);
      b += len;
    }
  }
  g.push(`<rect x="${P(z.x0)}" y="${P(z.y0)}" width="${P(z.x1 - z.x0)}" height="${P(z.y1 - z.y0)}" filter="url(#grain)" opacity="0.13" style="mix-blend-mode:multiply"/></g>`);
  return g.join("");
}
out.push(planks("B", zone("B"), "h", "#9a7048"));
out.push(planks("E", zone("E"), "h", "#8f6a45"));
out.push(planks("F", zone("F"), "v", "#6e5a44", 0.55));
// C: stone flags
{ const z = zone("C"); clips += clip("clip-C", z.x0, z.y0, z.x1, z.y1);
  const g = [`<g clip-path="url(#clip-C)"><rect x="${P(z.x0)}" y="${P(z.y0)}" width="${P(z.x1 - z.x0)}" height="${P(z.y1 - z.y0)}" filter="url(#stone)"/>`];
  for (let y = z.y0; y < z.y1; y += 1.25) for (let x = z.x0 - (y % 2.5 ? 0.6 : 0); x < z.x1; x += R.range(1.1, 1.7))
    g.push(`<rect x="${f(P(x) + 3)}" y="${f(P(y) + 3)}" width="${f(P(R.range(1.0, 1.6)) - 6)}" height="${f(P(1.25) - 6)}" rx="6" fill="${mix("#8e897f", R.pick(["#000000", "#ffffff"]), R.range(0, 0.18))}" opacity="0.55" stroke="#3c3934" stroke-width="3"/>`);
  g.push(`<ellipse cx="${P(29.5)}" cy="${P(5)}" rx="${P(4)}" ry="${P(3.2)}" fill="#1c1a17" opacity="0.35" filter="url(#blur20)"/></g>`);
  out.push(g.join("")); }
// D: tatami office with a wooden border
{ const z = zone("D"); clips += clip("clip-D", z.x0, z.y0, z.x1, z.y1);
  const g = [`<g clip-path="url(#clip-D)"><rect x="${P(z.x0)}" y="${P(z.y0)}" width="${P(z.x1 - z.x0)}" height="${P(z.y1 - z.y0)}" fill="#6d4c30"/>`];
  const mats = [];
  for (let y = 13; y < 22.8; y += 1.2) for (let x = 3.6; x < 12.4; x += 2.4) mats.push([x, y, 2.4, 1.2]);
  for (const [x, y, w, h] of mats) {
    if (x + w > 12.6 || y + h > 22.8) continue;
    g.push(`<rect x="${P(x)}" y="${P(y)}" width="${P(w)}" height="${P(h)}" fill="${mix("#b7ad6d", "#8f8a4f", R.range(0, 0.4))}" stroke="#1d1a12" stroke-width="3"/>`);
    g.push(`<rect x="${P(x)}" y="${P(y)}" width="${P(w)}" height="${P(h)}" filter="url(#weave)" opacity="0.08"/>`);
    g.push(`<path d="M${P(x)} ${P(y) + 5} h${P(w)} M${P(x)} ${P(y + h) - 5} h${P(w)}" stroke="#23231d" stroke-width="9" opacity="0.85"/>`);
  }
  g.push(`</g>`); out.push(g.join("")); }

/* ---------- furniture helpers ---------- */
const crate = (cx, cy, s = 0.8, rot = 0) => `<g transform="translate(${P(cx)} ${P(cy)}) rotate(${rot})" filter="url(#soft)"><rect x="${-P(s) / 2}" y="${-P(s) / 2}" width="${P(s)}" height="${P(s)}" fill="#9a7444" stroke="#3a2412" stroke-width="4"/>
  <path d="M${-P(s) / 2} ${-P(s) / 2} L${P(s) / 2} ${P(s) / 2} M${P(s) / 2} ${-P(s) / 2} L${-P(s) / 2} ${P(s) / 2}" stroke="#5c3d1d" stroke-width="5"/><rect x="${-P(s) / 2 + 6}" y="${-P(s) / 2 + 6}" width="${P(s) - 12}" height="${P(s) - 12}" fill="none" stroke="#c49b62" stroke-width="2" opacity="0.6"/></g>`;
const barrel = (cx, cy, r = 0.4) => `<g filter="url(#soft)"><circle cx="${P(cx)}" cy="${P(cy)}" r="${P(r)}" fill="#7a5230" stroke="#2c1b0d" stroke-width="4"/><circle cx="${P(cx)}" cy="${P(cy)}" r="${P(r) * 0.78}" fill="none" stroke="#3e3e3e" stroke-width="5"/><circle cx="${P(cx)}" cy="${P(cy)}" r="${P(r) * 0.55}" fill="#8d6239"/></g>`;
const bale = (cx, cy, w = 1.1, h = 0.8, rot = 0) => `<g transform="translate(${P(cx)} ${P(cy)}) rotate(${rot})" filter="url(#soft)"><rect x="${-P(w) / 2}" y="${-P(h) / 2}" width="${P(w)}" height="${P(h)}" rx="16" fill="url(#bale)" stroke="#7d6e52" stroke-width="3"/>
  <path d="M${-P(w) / 4} ${-P(h) / 2} v${P(h)} M${P(w) / 4} ${-P(h) / 2} v${P(h)}" stroke="#8a5a2b" stroke-width="5"/><path d="M${-P(w) / 2 + 10} ${-6} q ${P(w) / 4} 8 ${P(w) / 2} 0" stroke="#bfb08e" stroke-width="2" fill="none"/></g>`;
const basket = (cx, cy, r = 0.38) => `<g filter="url(#soft)"><circle cx="${P(cx)}" cy="${P(cy)}" r="${P(r)}" fill="#a37c45" stroke="#4e3418" stroke-width="4"/><circle cx="${P(cx)}" cy="${P(cy)}" r="${P(r) * 0.8}" fill="none" stroke="#6f4f26" stroke-width="2" stroke-dasharray="6 5"/>
  ${Array.from({ length: 9 }, () => `<ellipse cx="${f(P(cx) + R.range(-0.22, 0.22) * S)}" cy="${f(P(cy) + R.range(-0.22, 0.22) * S)}" rx="7" ry="10" transform="rotate(${f(R.range(0, 180))} ${f(P(cx))} ${f(P(cy))})" fill="#f7f2df" stroke="#b8ab88" stroke-width="1.5"/>`).join("")}</g>`;
const coal = (cx, cy, rx, ry, n = 60) => `<g filter="url(#soft)"><ellipse cx="${P(cx)}" cy="${P(cy)}" rx="${P(rx)}" ry="${P(ry)}" fill="#151515"/>${Array.from({ length: n }, () => { const a = R.range(0, 6.28), d = Math.sqrt(R()); const x = P(cx) + Math.cos(a) * d * P(rx) * 0.9, y = P(cy) + Math.sin(a) * d * P(ry) * 0.9, s = R.range(5, 12);
  return `<path d="M${f(x)} ${f(y - s)} l${f(s)} ${f(s * 0.6)} l${f(-s * 0.4)} ${f(s)} l${f(-s)} ${f(-s * 0.5)}Z" fill="${R.pick(["#2a2a2a", "#3a3a3a", "#1f1f1f", "#4a4a4a"])}"/>`; }).join("")}</g>`;
const lantern = (cx, cy) => `<circle cx="${P(cx)}" cy="${P(cy)}" r="${P(0.9)}" fill="url(#glow)" opacity="0.55"/><g filter="url(#soft)"><circle cx="${P(cx)}" cy="${P(cy)}" r="17" fill="#f3d9a0" stroke="#5a2b14" stroke-width="3"/><path d="M${P(cx) - 17} ${P(cy)} h34 M${P(cx)} ${P(cy) - 17} v34" stroke="#b5532b" stroke-width="2"/><circle cx="${P(cx)}" cy="${P(cy)}" r="5" fill="#2b1a10"/></g>`;
const bench = (x, y, w, h) => `<g filter="url(#shadow)"><rect x="${P(x)}" y="${P(y)}" width="${P(w)}" height="${P(h)}" fill="#6b4626" stroke="#2a180a" stroke-width="4"/><rect x="${P(x)}" y="${P(y)}" width="${P(w)}" height="${P(h)}" filter="url(#grain)" opacity="0.18" style="mix-blend-mode:multiply"/></g>`;

function reelingMachine(cx, cy) {
  // Basin of hot water with cocoons, plus the reel drum behind it.
  const g = [`<g filter="url(#shadow)">`, `<rect x="${P(cx - 1.1)}" y="${P(cy - 0.55)}" width="${P(2.2)}" height="${P(1.1)}" rx="8" fill="#5e3f22" stroke="#24150a" stroke-width="4"/>`];
  g.push(`<circle cx="${P(cx - 0.5)}" cy="${P(cy)}" r="${P(0.38)}" fill="url(#copper)" stroke="#3b1f0c" stroke-width="3"/><circle cx="${P(cx - 0.5)}" cy="${P(cy)}" r="${P(0.29)}" fill="#6d8c8c"/>`);
  for (let i = 0; i < 7; i++) g.push(`<ellipse cx="${f(P(cx - 0.5) + R.range(-17, 17))}" cy="${f(P(cy) + R.range(-17, 17))}" rx="6" ry="8.5" fill="#fbf8ec" stroke="#a89f80" stroke-width="1.2"/>`);
  g.push(`<rect x="${P(cx + 0.05)}" y="${P(cy - 0.42)}" width="${P(0.9)}" height="${P(0.84)}" rx="6" fill="#b88a55" stroke="#3b2410" stroke-width="3"/>`);
  for (let i = 0; i < 6; i++) g.push(`<line x1="${f(P(cx + 0.1) + i * 14)}" y1="${P(cy - 0.4)}" x2="${f(P(cx + 0.1) + i * 14)}" y2="${P(cy + 0.4)}" stroke="#f4ecd5" stroke-width="3" opacity="0.8"/>`);
  g.push(`<path d="M${P(cx - 0.3)} ${P(cy)} L${P(cx + 0.1)} ${P(cy - 0.1)}" stroke="#fffbe8" stroke-width="1.5" opacity="0.9"/></g>`);
  return g.join("");
}

function counterweight(cx, cy, label) {
  const x = P(cx), y = P(cy);
  return `<circle cx="${x}" cy="${y}" r="${P(1.2)}" fill="url(#redglow)"/>
  <g filter="url(#shadow)"><rect x="${x - 58}" y="${y - 58}" width="116" height="116" fill="none" stroke="#2d2a26" stroke-width="12"/>
  <path d="M${x - 58} ${y - 58} L${x + 58} ${y + 58} M${x + 58} ${y - 58} L${x - 58} ${y + 58}" stroke="#2d2a26" stroke-width="6" opacity="0.6"/>
  <circle cx="${x}" cy="${y}" r="40" fill="url(#iron)" stroke="#111" stroke-width="4"/><circle cx="${x}" cy="${y}" r="27" fill="none" stroke="#5c6066" stroke-width="3"/>
  <circle cx="${x}" cy="${y}" r="15" fill="url(#seal)" stroke="#2b0507" stroke-width="2.5"/><path d="M${x - 6} ${y - 4} q 6 -6 12 0" stroke="#ffd0c8" stroke-width="2" fill="none" opacity="0.8"/></g>`;
}

const pipe = (d, w = 18) => `<path d="${d}" stroke="#1d120a" stroke-width="${w + 6}" fill="none" stroke-linejoin="round" filter="url(#soft)"/><path d="${d}" stroke="url(#pipe)" stroke-width="${w}" fill="none" stroke-linejoin="round"/><path d="${d}" stroke="#e8b585" stroke-width="3" fill="none" opacity="0.5" stroke-linejoin="round" transform="translate(0 -4)"/>`;
const sealRing = (cx, cy) => `<circle cx="${P(cx)}" cy="${P(cy)}" r="15" fill="url(#seal)" stroke="#2b0507" stroke-width="3"/>`;

/* ---------- A · cour ---------- */
out.push(`<g filter="url(#shadow)"><g transform="translate(${P(POI.cart[0])} ${P(POI.cart[1])}) rotate(-12)">
  <rect x="-115" y="-62" width="230" height="124" fill="#7b5a36" stroke="#2c1a0b" stroke-width="5"/>${[-70, -25, 20, 65].map(x => `<line x1="${x}" y1="-60" x2="${x}" y2="60" stroke="#4f3519" stroke-width="3"/>`).join("")}
  <rect x="-60" y="-80" width="60" height="18" fill="#2b2b2b" stroke="#111" stroke-width="3"/><rect x="-60" y="62" width="60" height="18" fill="#2b2b2b" stroke="#111" stroke-width="3"/>
  <path d="M115 -40 L215 -30 M115 40 L215 30" stroke="#5c3d1d" stroke-width="10" stroke-linecap="round"/><path d="M200 -32 L205 32" stroke="#5c3d1d" stroke-width="7"/></g></g>`);
out.push(coal(POI.cart[0] - 0.25, POI.cart[1] - 0.05, 0.85, 0.42, 70));
out.push(`<circle cx="${P(POI.cart[0] - 0.45)}" cy="${P(POI.cart[1] + 0.75)}" r="9" fill="url(#seal)" stroke="#2b0507" stroke-width="2"/>`); // the fallen pastille
out.push(`<g filter="url(#shadow)"><circle cx="${P(POI.well[0])}" cy="${P(POI.well[1])}" r="${P(0.75)}" fill="#7d786d" stroke="#3a3731" stroke-width="5"/>${Array.from({ length: 12 }, (_, i) => { const a = i / 12 * 6.283; return `<line x1="${f(P(POI.well[0]) + Math.cos(a) * 50)}" y1="${f(P(POI.well[1]) + Math.sin(a) * 50)}" x2="${f(P(POI.well[0]) + Math.cos(a) * 75)}" y2="${f(P(POI.well[1]) + Math.sin(a) * 75)}" stroke="#4a463f" stroke-width="3"/>`; }).join("")}
  <circle cx="${P(POI.well[0])}" cy="${P(POI.well[1])}" r="${P(0.48)}" fill="#0f1a20"/><rect x="${P(POI.well[0] - 0.95)}" y="${P(POI.well[1]) - 7}" width="${P(1.9)}" height="14" fill="#5a3b1d" stroke="#24150a" stroke-width="3"/></g>`);
// improvised infirmary: futons and a basin
for (const [x, y, c] of [[4.2, 9, "#c9c3b0"], [5.6, 9, "#b9c6c9"], [7.0, 9, "#cfc1b0"], [8.4, 9.2, "#c4c9b6"]]) out.push(`<g filter="url(#soft)"><rect x="${P(x)}" y="${P(y)}" width="${P(1.1)}" height="${P(2.1)}" rx="10" fill="${c}" stroke="#5a5546" stroke-width="3"/><rect x="${P(x) + 6}" y="${P(y + 0.8)}" width="${P(1.1) - 12}" height="${P(1.2)}" rx="8" fill="${mix(c, "#27676b", 0.45)}"/><rect x="${P(x) + 14}" y="${P(y) + 10}" width="${P(1.1) - 28}" height="28" rx="10" fill="#efe9da"/></g>`);
out.push(`<circle cx="${P(9.9)}" cy="${P(10.3)}" r="26" fill="#6b4a2a" stroke="#2a180a" stroke-width="3" filter="url(#soft)"/><circle cx="${P(9.9)}" cy="${P(10.3)}" r="18" fill="#7f9ea2"/>`);
out.push(barrel(11.9, 2.1), barrel(12.3, 3.0, 0.35), crate(12.2, 6.0, 0.7, 8), crate(11.6, 5.5, 0.6, -10), lantern(4.2, 4.2), lantern(11.8, 10.8));
// a pine in the yard corner
out.push(`<g filter="url(#shadow)">${[[0, 0, 95], [-50, 30, 70], [45, 35, 72], [10, -45, 70], [-35, -30, 60]].map(([dx, dy, r]) => `<circle cx="${P(4.4) + dx}" cy="${P(2.2) + dy}" r="${r}" fill="${R.pick(["#2f4a2b", "#35532f", "#2a4126"])}" stroke="#16220f" stroke-width="3"/>`).join("")}
  ${Array.from({ length: 40 }, () => `<circle cx="${f(P(4.4) + R.range(-110, 110))}" cy="${f(P(2.2) + R.range(-90, 100))}" r="${f(R.range(6, 16))}" fill="#4f6f3d" opacity="0.6"/>`).join("")}</g>`);

/* ---------- B · atelier ---------- */
// catwalk 3 m up along the north wall, with a ladder down at its west end
{ const c = POI.catwalk; out.push(`<rect x="${P(c.x0) + 14}" y="${P(c.y1) + 4}" width="${P(c.x1 - c.x0)}" height="34" fill="#000" opacity="0.35" filter="url(#blur8)"/>
  <g filter="url(#shadow)"><rect x="${P(c.x0)}" y="${P(c.y0)}" width="${P(c.x1 - c.x0)}" height="${P(c.y1 - c.y0)}" fill="#7e5a35" stroke="#2b190a" stroke-width="4"/>
  ${Array.from({ length: Math.round((c.x1 - c.x0) * 3) }, (_, i) => `<line x1="${f(P(c.x0) + i * 33)}" y1="${P(c.y0)}" x2="${f(P(c.x0) + i * 33)}" y2="${P(c.y1)}" stroke="#4d3218" stroke-width="2"/>`).join("")}
  <line x1="${P(c.x0)}" y1="${P(c.y1) - 5}" x2="${P(c.x1)}" y2="${P(c.y1) - 5}" stroke="#3a240f" stroke-width="9"/>
  ${Array.from({ length: 12 }, (_, i) => `<rect x="${f(P(c.x0) + 20 + i * ((P(c.x1 - c.x0) - 40) / 11)) - 6}" y="${P(c.y1) - 12}" width="12" height="14" fill="#2a1a0c"/>`).join("")}
  <rect x="${P(13.6)}" y="${P(2.6)}" width="${P(0.7)}" height="${P(1.3)}" fill="none" stroke="#4a2f16" stroke-width="7"/>${[0.3, 0.6, 0.9, 1.2].map(d => `<line x1="${P(13.6)}" y1="${P(2.6 + d)}" x2="${P(14.3)}" y2="${P(2.6 + d)}" stroke="#4a2f16" stroke-width="6"/>`).join("")}</g>`); }
for (const x of [15.6, 18.4, 21.2, 23.2]) out.push(reelingMachine(x, 9.6));
for (const x of [15.6, 18.4, 21.2, 23.2]) out.push(`<rect x="${P(x - 0.5)}" y="${P(10.4)}" width="${P(1)}" height="${P(0.35)}" rx="6" fill="#5b3b1f" stroke="#24150a" stroke-width="3" filter="url(#soft)"/>`); // stools
out.push(bench(14.2, 4.6, 2.2, 0.7), bench(22.0, 4.6, 2.4, 0.7));
for (const [x, y] of [[14.6, 4.95], [15.4, 4.95], [22.5, 4.95], [23.5, 4.95]]) out.push(`<circle cx="${P(x)}" cy="${P(y)}" r="13" fill="#f2ead2" stroke="#9c8f6b" stroke-width="2"/><circle cx="${P(x)}" cy="${P(y)}" r="5" fill="#8a6a3a"/>`); // silk skeins
out.push(basket(14.6, 11.3), basket(24.3, 11.2), basket(17.0, 11.4, 0.32));

/* ---------- C · chaufferie ---------- */
{ const [bx, by] = POI.boiler;
  out.push(`<circle cx="${P(bx)}" cy="${P(by + 1.9)}" r="${P(2.2)}" fill="url(#glow)" opacity="0.65"/>
  <g filter="url(#shadow)"><rect x="${P(bx - 2.3)}" y="${P(by - 1.5)}" width="${P(4.6)}" height="${P(3)}" rx="${P(1.4)}" fill="url(#iron)" stroke="#0e0f10" stroke-width="6"/>
  ${[-1.4, -0.45, 0.5, 1.45].map(dx => `<line x1="${P(bx + dx)}" y1="${P(by - 1.45)}" x2="${P(bx + dx)}" y2="${P(by + 1.45)}" stroke="#24272a" stroke-width="7"/>${Array.from({ length: 9 }, (_, i) => `<circle cx="${P(bx + dx) - 9}" cy="${f(P(by - 1.25) + i * 31)}" r="3.5" fill="#9aa0a6"/>`).join("")}`).join("")}
  <rect x="${P(bx - 0.7)}" y="${P(by + 1.35)}" width="${P(1.4)}" height="${P(0.6)}" rx="6" fill="#2a1a10" stroke="#0e0f10" stroke-width="5"/><rect x="${P(bx - 0.55)}" y="${P(by + 1.45)}" width="${P(1.1)}" height="${P(0.38)}" rx="4" fill="#ff8a2a"/><rect x="${P(bx - 0.4)}" y="${P(by + 1.5)}" width="${P(0.8)}" height="${P(0.25)}" rx="4" fill="#ffd27a"/>
  <circle cx="${P(bx + 1.6)}" cy="${P(by - 0.9)}" r="${P(0.45)}" fill="#1a1b1d" stroke="#555a60" stroke-width="6"/><circle cx="${P(bx + 1.6)}" cy="${P(by - 0.9)}" r="${P(0.25)}" fill="#050505"/>
  ${[[-1.6, -1.0], [-1.0, -1.1]].map(([dx, dy]) => `<circle cx="${P(bx + dx)}" cy="${P(by + dy)}" r="16" fill="#e8e1cf" stroke="#2a2a2a" stroke-width="4"/><line x1="${P(bx + dx)}" y1="${P(by + dy)}" x2="${P(bx + dx) + 9}" y2="${P(by + dy) - 8}" stroke="#a11" stroke-width="3"/>`).join("")}</g>`);
  out.push(coal(26.4, 2.4, 1.0, 0.8, 90), `<path d="M${P(26.2)} ${P(3.6)} l${P(0.9)} ${P(0.5)}" stroke="#6b4626" stroke-width="9" stroke-linecap="round"/><path d="M${P(27.1)} ${P(4.1)} l26 18 l-22 12z" fill="#7a7f85" stroke="#222" stroke-width="2"/>`);
  out.push(crate(32.3, 11.3, 0.7), barrel(26.0, 11.3)); }
// valve manifold with the big hand-wheel
{ const [vx, vy] = POI.valve;
  out.push(pipe(`M${P(31.2)} ${P(6)} V${P(11.4)}`, 22), `<g filter="url(#shadow)"><circle cx="${P(vx)}" cy="${P(vy)}" r="${P(0.62)}" fill="none" stroke="#9b1c1c" stroke-width="12"/><circle cx="${P(vx)}" cy="${P(vy)}" r="${P(0.62)}" fill="none" stroke="#e05050" stroke-width="3" opacity="0.6"/>
  ${[0, 1, 2, 3, 4, 5].map(i => { const a = i * Math.PI / 3; return `<line x1="${P(vx)}" y1="${P(vy)}" x2="${f(P(vx) + Math.cos(a) * 58)}" y2="${f(P(vy) + Math.sin(a) * 58)}" stroke="#9b1c1c" stroke-width="7"/>`; }).join("")}<circle cx="${P(vx)}" cy="${P(vy)}" r="13" fill="url(#iron)" stroke="#111" stroke-width="3"/></g>
  <path d="M${P(vx + 0.75)} ${P(vy - 0.55)} a 55 55 0 0 1 0 ${P(1.1)}" stroke="#f2e2c0" stroke-width="5" fill="none"/><path d="M${P(vx + 0.75) - 12} ${P(vy + 0.55) - 4} l14 12 l6 -18z" fill="#f2e2c0"/>`); }

/* ---------- pipes: the three sealed conduits ---------- */
const [bx, by] = POI.boiler;
out.push(pipe(`M${P(bx - 2.3)} ${P(by - 0.6)} H${P(24.4)} V${P(3.2)} H${P(POI.weightB[0] + 0.7)} V${P(POI.weightB[1])}`));
out.push(pipe(`M${P(bx - 1.0)} ${P(by + 1.5)} V${P(POI.weightC[1] - 0.2)} H${P(POI.weightC[0] + 0.75)}`));
out.push(pipe(`M${P(bx + 1.2)} ${P(by + 1.5)} V${P(10.8)} H${P(32.5)} V${P(20.6)} H${P(24.3)} V${P(POI.weightE[1] + 0.1)} H${P(POI.weightE[0] + 0.75)}`));
out.push(sealRing(POI.weightB[0] + 1.6, 3.2), sealRing(POI.weightC[0] + 1.5, POI.weightC[1] - 0.2), sealRing(POI.weightE[0] + 2.4, POI.weightE[1] + 0.1));

/* ---------- D · bureau ---------- */
{ const [dx, dy] = POI.desk;
  out.push(`<g filter="url(#shadow)"><rect x="${P(dx - 1.3)}" y="${P(dy - 0.6)}" width="${P(2.6)}" height="${P(1.2)}" rx="6" fill="#3d2414" stroke="#160b04" stroke-width="5"/>
  <rect x="${P(dx - 1.3)}" y="${P(dy - 0.6)}" width="${P(2.6)}" height="${P(1.2)}" filter="url(#grain)" opacity="0.2" style="mix-blend-mode:screen"/></g>
  ${[[-0.8, -0.2, -8], [-0.3, 0.05, 6], [0.25, -0.25, -3]].map(([x, y, r]) => `<rect x="${P(dx + x)}" y="${P(dy + y)}" width="46" height="60" fill="#f1ead8" stroke="#7a705c" stroke-width="1.5" transform="rotate(${r} ${P(dx + x)} ${P(dy + y)})"/>`).join("")}
  <rect x="${P(dx + 0.65)}" y="${P(dy - 0.4)}" width="44" height="26" rx="4" fill="#1b1b1b"/><circle cx="${P(dx + 0.85)}" cy="${P(dy - 0.27)}" r="7" fill="#0a0a0a"/>
  <rect x="${P(dx + 0.55)}" y="${P(dy + 0.1)}" width="72" height="34" fill="#6b3d1f" stroke="#200f05" stroke-width="2"/>${Array.from({ length: 5 }, (_, i) => `<line x1="${P(dx + 0.55) + 8 + i * 14}" y1="${P(dy + 0.1) + 3}" x2="${P(dx + 0.55) + 8 + i * 14}" y2="${P(dy + 0.1) + 31}" stroke="#c8a26a" stroke-width="2"/><circle cx="${P(dx + 0.55) + 8 + i * 14}" cy="${P(dy + 0.1) + 11}" r="4" fill="#2a1a0c"/><circle cx="${P(dx + 0.55) + 8 + i * 14}" cy="${P(dy + 0.1) + 24}" r="4" fill="#2a1a0c"/>`).join("")}
  <rect x="${P(dx - 0.4)}" y="${P(dy + 0.75)}" width="54" height="54" rx="10" fill="#7a2e2e" stroke="#2a0e0e" stroke-width="3" filter="url(#soft)"/>`);
  // shelves along the west wall with ledgers
  out.push(`<g filter="url(#shadow)"><rect x="${P(3.2)}" y="${P(13.4)}" width="${P(0.6)}" height="${P(6)}" fill="#4a2c16" stroke="#1a0d05" stroke-width="4"/>${Array.from({ length: 22 }, (_, i) => `<rect x="${P(3.25)}" y="${f(P(13.5) + i * 26.5)}" width="${P(0.5)}" height="22" fill="${R.pick(["#5e2a1e", "#2b3d4f", "#6d5a2b", "#3a4a2a", "#7a6a50"])}" stroke="#140a04" stroke-width="1.5"/>`).join("")}</g>`);
  const [sx, sy] = POI.safe;
  out.push(`<g filter="url(#shadow)"><rect x="${P(sx - 0.55)}" y="${P(sy - 0.55)}" width="${P(1.1)}" height="${P(1.1)}" rx="6" fill="url(#iron)" stroke="#0b0b0b" stroke-width="5"/><circle cx="${P(sx)}" cy="${P(sy)}" r="16" fill="#b08d3a" stroke="#2b2003" stroke-width="3"/><line x1="${P(sx)}" y1="${P(sy)}" x2="${P(sx) + 10}" y2="${P(sy) - 8}" stroke="#2b2003" stroke-width="3"/></g>`);
  // the office scale (balance) on a stand and a folding screen
  out.push(`<g filter="url(#shadow)"><rect x="${P(10.4)}" y="${P(14.0)}" width="${P(1.6)}" height="${P(0.7)}" fill="#3a2414" stroke="#140a04" stroke-width="4"/><line x1="${P(10.6)}" y1="${P(14.35)}" x2="${P(11.8)}" y2="${P(14.35)}" stroke="#b08d3a" stroke-width="5"/><circle cx="${P(10.65)}" cy="${P(14.35)}" r="14" fill="#c9a24a" stroke="#4a3505" stroke-width="2"/><circle cx="${P(11.75)}" cy="${P(14.35)}" r="14" fill="#c9a24a" stroke="#4a3505" stroke-width="2"/></g>
  <g filter="url(#shadow)"><path d="M${P(8.4)} ${P(20.4)} l${P(0.9)} ${P(0.4)} l${P(0.9)} ${P(-0.4)} l${P(0.9)} ${P(0.4)}" stroke="#2a1a0c" stroke-width="16" fill="none"/><path d="M${P(8.4)} ${P(20.4)} l${P(0.9)} ${P(0.4)} l${P(0.9)} ${P(-0.4)} l${P(0.9)} ${P(0.4)}" stroke="#e7dcc0" stroke-width="10" fill="none"/></g>`);
  out.push(`<rect x="${P(5.6)}" y="${P(17.1)}" width="44" height="44" rx="8" fill="#6a3b5a" stroke="#2a1020" stroke-width="3" filter="url(#soft)"/>`, lantern(6.5, 15.0)); }

/* ---------- E · magasin ---------- */
for (let i = 0; i < 9; i++) out.push(bale(14.0 + i * 1.15, 12.8, 1.05, 0.75, R.range(-4, 4)));
for (let i = 0; i < 7; i++) out.push(bale(14.0 + i * 1.15, 13.65, 1.05, 0.75, R.range(-4, 4)));
for (let j = 0; j < 5; j++) out.push(bale(13.85, 15.2 + j * 0.85, 0.75, 0.8, R.range(-4, 4)));
for (let j = 0; j < 3; j++) out.push(bale(24.3, 14.6 + j * 0.85, 0.85, 0.8, R.range(-4, 4)));
for (const [x, y] of [[15.2, 21.5], [16.1, 22.3], [17.0, 21.6], [15.4, 22.4]]) out.push(basket(x, y));
out.push(bench(19.6, 22.1, 2.6, 0.6));
{ const [px_, py_] = POI.paybox; out.push(`<g filter="url(#shadow)" transform="rotate(-6 ${P(px_)} ${P(py_)})"><rect x="${P(px_ - 0.6)}" y="${P(py_ - 0.4)}" width="${P(1.2)}" height="${P(0.8)}" rx="6" fill="#5b3a1e" stroke="#1d1007" stroke-width="5"/>
  <path d="M${P(px_ - 0.6)} ${P(py_ - 0.15)} h${P(1.2)} M${P(px_ - 0.6)} ${P(py_ + 0.15)} h${P(1.2)}" stroke="#2a2a2a" stroke-width="8"/><rect x="${P(px_) - 9}" y="${P(py_) - 12}" width="18" height="22" rx="3" fill="#b08d3a" stroke="#2b2003" stroke-width="2"/></g>`); }

/* ---------- F · quai ---------- */
{ const p = POI.pier;
  out.push(`<g filter="url(#shadow)"><rect x="${P(p.x0)}" y="${P(p.y0)}" width="${P(p.x1 - p.x0)}" height="${P(p.y1 - p.y0)}" fill="#5f4c38" stroke="#22180d" stroke-width="4"/>${Array.from({ length: Math.round((p.y1 - p.y0) * 2.2) }, (_, i) => `<line x1="${P(p.x0)}" y1="${f(P(p.y0) + i * 45)}" x2="${P(p.x1)}" y2="${f(P(p.y0) + i * 45)}" stroke="#2e2215" stroke-width="3"/>`).join("")}
  ${[[p.x1 - 0.1, p.y0 + 0.1], [p.x1 - 0.1, p.y1 - 0.1], [p.x1 - 0.1, (p.y0 + p.y1) / 2]].map(([x, y]) => `<circle cx="${P(x)}" cy="${P(y)}" r="14" fill="#3b2a1a" stroke="#120a04" stroke-width="3"/>`).join("")}</g>
  <g filter="url(#shadow)" transform="rotate(4 ${P(35.2)} ${P(23)})"><path d="M${P(34.6)} ${P(21.6)} q ${P(0.6)} -${P(0.3)} ${P(1.2)} 0 v ${P(2.3)} q -${P(0.6)} ${P(0.6)} -${P(1.2)} 0z" fill="#6d4a2a" stroke="#22140a" stroke-width="4"/><path d="M${P(34.75)} ${P(22.2)} h${P(0.9)} M${P(34.75)} ${P(23.1)} h${P(0.9)}" stroke="#3b2414" stroke-width="6"/></g>
  <path d="M${P(p.x1 - 0.1)} ${P(p.y1 - 0.1)} C ${P(35.6)} ${P(21.4)}, ${P(35.3)} ${P(21.5)}, ${P(35.2)} ${P(21.8)}" stroke="#c9b48a" stroke-width="3" fill="none"/>`); }
for (const [x, y, s, r] of [[26.0, 13.0, 0.8, 5], [26.8, 13.1, 0.7, -8], [26.3, 13.8, 0.75, 12], [31.8, 22.2, 0.8, 0], [32.4, 21.4, 0.6, 15]]) out.push(crate(x, y, s, r));
out.push(barrel(30.9, 22.3), barrel(30.1, 22.4, 0.35), barrel(26.0, 22.2));
out.push(`<g filter="url(#soft)">${[0, 1, 2, 3, 4].map(i => `<circle cx="${P(28.2)}" cy="${P(21.9)}" r="${10 + i * 7}" fill="none" stroke="#b79b6a" stroke-width="5"/>`).join("")}</g>`);
out.push(`<g filter="url(#shadow)"><rect x="${P(27.0)}" y="${P(15.0)}" width="${P(1.8)}" height="${P(0.9)}" rx="6" fill="#7a5a36" stroke="#2c1a0b" stroke-width="4"/>${[0, 1].map(i => `<circle cx="${P(27.3 + i * 1.2)}" cy="${P(15.95)}" r="13" fill="#2b2b2b"/>`).join("")}<path d="M${P(28.8)} ${P(15.45)} h${P(0.7)}" stroke="#5c3d1d" stroke-width="8" stroke-linecap="round"/></g>`);
out.push(bale(29.5, 17.6, 1.0, 0.75, 20), bale(30.2, 18.6, 1.0, 0.75, -12));

/* ---------- walls, doors and shadows ---------- */
const segs = wallSegments();
const outerYard = s => (s[0] === 3 && s[2] === 3 && s[3] <= 12) || (s[1] === 1 && s[3] === 1 && s[2] <= 13);
const wallPath = list => list.map(([x0, y0, x1, y1]) => `M${P(x0)} ${P(y0)} L${P(x1)} ${P(y1)}`).join(" ");
out.push(`<path d="${wallPath(segs)}" stroke="#000" stroke-width="30" opacity="0.5" filter="url(#wallshadow)"/>`);
// stone perimeter of the yard
out.push(`<path d="${wallPath(segs.filter(outerYard))}" stroke="#4d4a44" stroke-width="30" stroke-linecap="square"/><path d="${wallPath(segs.filter(outerYard))}" stroke="#8e897e" stroke-width="18" stroke-dasharray="34 6" stroke-linecap="butt"/>`);
// timber and plaster walls of the buildings
const timber = segs.filter(s => !outerYard(s));
out.push(`<path d="${wallPath(timber)}" stroke="#20150c" stroke-width="26" stroke-linecap="square"/><path d="${wallPath(timber)}" stroke="#d9cfb7" stroke-width="12" stroke-linecap="butt"/>`);
for (const [x0, y0, x1, y1] of timber) { const len = Math.hypot(x1 - x0, y1 - y0); for (let t = 0; t <= len; t += 2) { const x = x0 + (x1 - x0) * t / len, y = y0 + (y1 - y0) * t / len; out.push(`<rect x="${P(x) - 13}" y="${P(y) - 13}" width="26" height="26" fill="#2a1a0e"/>`); } }
for (const d of DOORS) {
  const [x0, y0, x1, y1] = d.c.map(P), vertical = x0 === x1;
  if (d.key === "portail") out.push(`<g filter="url(#shadow)"><rect x="${x0 - 16}" y="${y0}" width="32" height="${y1 - y0}" fill="#5a3a1b" stroke="#1d1007" stroke-width="5"/>${[0.25, 0.5, 0.75].map(t => `<line x1="${x0 - 16}" y1="${y0 + (y1 - y0) * t}" x2="${x0 + 16}" y2="${y0 + (y1 - y0) * t}" stroke="#1d1007" stroke-width="4"/>`).join("")}<rect x="${x0 - 22}" y="${(y0 + y1) / 2 - 30}" width="44" height="60" fill="none" stroke="#3a3a3a" stroke-width="7"/><rect x="${x0 - 30}" y="${y0 - 14}" width="60" height="28" fill="#4d4a44"/><rect x="${x0 - 30}" y="${y1 - 14}" width="60" height="28" fill="#4d4a44"/></g>`);
  else if (d.key === "volets") out.push(`<g filter="url(#shadow)"><rect x="${x0 - 13}" y="${y0}" width="26" height="${y1 - y0}" fill="#4e3a26" stroke="#1d1007" stroke-width="4"/>${Array.from({ length: 16 }, (_, i) => `<line x1="${x0 - 13}" y1="${y0 + i * 25}" x2="${x0 + 13}" y2="${y0 + i * 25 + 10}" stroke="#2a1d10" stroke-width="3"/>`).join("")}<rect x="${x0 - 18}" y="${(y0 + y1) / 2 - 6}" width="36" height="12" fill="#2b2b2b"/></g>`);
  else out.push(vertical
    ? `<rect x="${x0 - 9}" y="${y0 + 4}" width="18" height="${y1 - y0 - 8}" fill="#b98d57" stroke="#2a1a0c" stroke-width="4"/><rect x="${x0 - 14}" y="${y0 - 4}" width="28" height="12" fill="#20150c"/><rect x="${x0 - 14}" y="${y1 - 8}" width="28" height="12" fill="#20150c"/>`
    : `<rect x="${x0 + 4}" y="${y0 - 9}" width="${x1 - x0 - 8}" height="18" fill="#b98d57" stroke="#2a1a0c" stroke-width="4"/><rect x="${x0 - 4}" y="${y0 - 14}" width="12" height="28" fill="#20150c"/><rect x="${x1 - 8}" y="${y0 - 14}" width="12" height="28" fill="#20150c"/>`);
}

/* ---------- counterweights on top of everything inside ---------- */
out.push(counterweight(...POI.weightB), counterweight(...POI.weightE), counterweight(...POI.weightC));

/* ---------- atmosphere ---------- */
out.push(`<rect width="${W}" height="${H}" filter="url(#grime)" opacity="0.18" style="mix-blend-mode:multiply"/>`);
out.push(`<rect width="${W}" height="${H}" fill="url(#vignette)"/>`);

export async function buildMap() {
  const markup = svg(W, H, defs + clips, out.join(""));
  await render(markup, "maps/filature-minase.webp", { quality: 86 });
  await render(markup, "maps/filature-minase-thumb.webp", { width: 300, height: 200, quality: 80 });
  // Labeled plan for the players' aid and the GM.
  const labels = Object.entries(ZONES).map(([k, z]) => {
    const cx = P((z.x0 + z.x1) / 2), cy = P(z.y0 + 1.1);
    return `<g><rect x="${cx - 330}" y="${cy - 70}" width="660" height="120" rx="20" fill="#f6efe1" opacity="0.88" stroke="#7a2e2e" stroke-width="6"/>
      <text x="${cx}" y="${cy + 18}" font-family="Palatino Linotype, Georgia, serif" font-size="78" font-weight="700" text-anchor="middle" fill="#1f2a30">${k} · ${z.name}</text></g>`;
  }).join("");
  const plan = svg(W, H, defs + clips, out.join("") + `<rect width="${W}" height="${H}" fill="#000" opacity="0.15"/>` + labels);
  await render(plan, "maps/filature-minase-plan.webp", { width: 1800, height: 1200, quality: 84 });
}
