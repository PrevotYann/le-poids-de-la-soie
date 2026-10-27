// Item icons, counterweight tokens, zone pins, paper handouts and cover art.
import sharp from "sharp";
import { rng, f, mix, inkFilter, paperDefs, paperRect, svg, render, tokenFrom, noiseFilter, shadowFilter } from "./common.mjs";

const INK = "#231a16";
const RED = "#b3191f";
const common = `${inkFilter("ink", 1.8, 0.05, 4)}${shadowFilter("drop", 6, 4, 7, 0.55)}
  <radialGradient id="seal" r="55%" cx="40%" cy="35%"><stop offset="0" stop-color="#ff7a6a"/><stop offset="0.5" stop-color="${RED}"/><stop offset="1" stop-color="#4a0609"/></radialGradient>
  <radialGradient id="iron" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="#9097a0"/><stop offset="0.55" stop-color="#3d434a"/><stop offset="1" stop-color="#15181b"/></radialGradient>
  <radialGradient id="brass" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="#fbe39a"/><stop offset="0.55" stop-color="#c9a24a"/><stop offset="1" stop-color="#6a4a12"/></radialGradient>
  <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9a6b3e"/><stop offset="1" stop-color="#5a3518"/></linearGradient>
  <radialGradient id="redglow" r="50%"><stop offset="0" stop-color="#ff3030" stop-opacity="0.6"/><stop offset="1" stop-color="#ff0000" stop-opacity="0"/></radialGradient>
  <radialGradient id="bg" r="75%"><stop offset="0" stop-color="#3a3029"/><stop offset="1" stop-color="#14100d"/></radialGradient>`;
const lines = (x, y, w, n, gap, r, color = INK) => Array.from({ length: n }, (_, i) => {
  let d = `M${x} ${y + i * gap}`; let cx = x;
  while (cx < x + w * r.range(0.7, 1)) { const step = r.range(10, 22); d += ` q${f(step / 2)} ${f(r.range(-5, 5))} ${f(step)} 0`; cx += step; }
  return `<path d="${d}" stroke="${color}" stroke-width="2.4" fill="none" opacity="0.8"/>`;
}).join("");

const ICONS = {
  pastille: r => `<circle cx="128" cy="128" r="90" fill="url(#redglow)"/><g filter="url(#drop)"><ellipse cx="128" cy="134" rx="64" ry="58" fill="url(#seal)" stroke="${INK}" stroke-width="5"/>
    <ellipse cx="128" cy="134" rx="40" ry="36" fill="none" stroke="#5a0a0d" stroke-width="3" opacity="0.7"/><path d="M104 108 q22 -16 46 -4" stroke="#ffd6cc" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.8"/>
    <path d="M150 150 l14 10 l-6 14 l12 8" stroke="#3a0305" stroke-width="3" fill="none"/><path d="M118 190 q-4 22 4 34 q8 -12 2 -34" fill="#8a0d12" stroke="${INK}" stroke-width="2.5"/></g>`,
  bracelet: r => `<g filter="url(#drop)"><ellipse cx="128" cy="134" rx="86" ry="62" fill="none" stroke="#3d2614" stroke-width="30"/><ellipse cx="128" cy="134" rx="86" ry="62" fill="none" stroke="#7a4f2a" stroke-width="22"/>
    <ellipse cx="128" cy="134" rx="86" ry="62" fill="none" stroke="#a87445" stroke-width="3" stroke-dasharray="8 8"/><rect x="98" y="168" width="60" height="38" rx="6" fill="url(#brass)" stroke="${INK}" stroke-width="4"/>
    <circle cx="128" cy="187" r="12" fill="url(#seal)" stroke="${INK}" stroke-width="3"/><circle cx="128" cy="187" r="30" fill="url(#redglow)"/></g>`,
  cle: r => `<g filter="url(#drop)" transform="rotate(-35 128 128)"><circle cx="128" cy="60" r="34" fill="none" stroke="url(#brass)" stroke-width="16"/><circle cx="128" cy="60" r="34" fill="none" stroke="${INK}" stroke-width="3"/>
    <rect x="120" y="92" width="16" height="122" rx="4" fill="url(#brass)" stroke="${INK}" stroke-width="3"/><path d="M136 176 h26 v14 h-12 v10 h14 v14 h-28Z" fill="url(#brass)" stroke="${INK}" stroke-width="3"/></g>
    <path d="M76 70 C 40 90 40 140 60 170" stroke="${RED}" stroke-width="6" fill="none"/><path d="M52 166 l8 30 l10 -28Z" fill="${RED}"/>`,
  notice: r => `<g filter="url(#drop)"><path d="M54 30 L196 22 L206 226 L60 234Z" fill="#f1e8d2" stroke="${INK}" stroke-width="4"/>
    ${[[92, 84], [160, 84], [126, 150]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="18" fill="none" stroke="${INK}" stroke-width="4"/><circle cx="${x}" cy="${y}" r="7" fill="${RED}"/>`).join("")}
    <path d="M110 84 H142 M92 102 L118 136 M160 102 L134 136" stroke="${INK}" stroke-width="3" fill="none"/><path d="M150 178 a20 20 0 1 1 -10 -18" stroke="${RED}" stroke-width="5" fill="none"/><path d="M136 152 l10 10 l4 -14z" fill="${RED}"/>
    ${lines(74, 196, 110, 2, 14, r)}</g>`,
  outils: r => `<g filter="url(#drop)"><g transform="rotate(40 128 128)"><rect x="118" y="50" width="22" height="170" rx="6" fill="url(#wood)" stroke="${INK}" stroke-width="4"/><rect x="88" y="30" width="80" height="40" rx="6" fill="url(#iron)" stroke="${INK}" stroke-width="4"/></g>
    <g transform="rotate(-40 128 128)"><rect x="120" y="70" width="18" height="150" rx="5" fill="url(#iron)" stroke="${INK}" stroke-width="4"/><path d="M104 40 a26 26 0 1 0 50 0 l-10 0 l0 18 l-30 0 l0 -18Z" fill="url(#iron)" stroke="${INK}" stroke-width="4"/></g></g>`,
  registre: r => `<g filter="url(#drop)"><path d="M28 70 L128 58 L228 70 L228 210 L128 198 L28 210Z" fill="#5a2a1e" stroke="${INK}" stroke-width="4"/>
    <path d="M38 66 L128 54 L128 190 L38 202Z" fill="#f3ead4" stroke="${INK}" stroke-width="3"/><path d="M218 66 L128 54 L128 190 L218 202Z" fill="#ece2c8" stroke="${INK}" stroke-width="3"/>
    ${[60, 84, 108].map(x => `<path d="M${x} 74 V194" stroke="#8a2e2e" stroke-width="1.5" opacity="0.6"/>`).join("")}${lines(46, 84, 70, 6, 16, r)}${lines(140, 80, 66, 6, 16, r)}
    <path d="M128 54 V198" stroke="${INK}" stroke-width="4"/><path d="M170 54 V20 l10 10 l10 -10 V60" fill="${RED}" stroke="${INK}" stroke-width="2"/></g>`,
  ordre: r => `<g filter="url(#drop)"><rect x="50" y="24" width="156" height="208" fill="#f3ead4" stroke="${INK}" stroke-width="4"/>
    ${Array.from({ length: 6 }, (_, i) => `<path d="M${180 - i * 22} 44 v${f(r.range(110, 150))}" stroke="${INK}" stroke-width="5" stroke-dasharray="${f(r.range(8, 16))} 6" opacity="0.85"/>`).join("")}
    <rect x="70" y="170" width="44" height="44" rx="4" fill="none" stroke="${RED}" stroke-width="5"/><path d="M80 182 h24 M80 194 h24 M92 176 v32" stroke="${RED}" stroke-width="4"/></g>`,
  lettre: r => `<g filter="url(#drop)"><path d="M30 84 L226 64 L232 196 L36 216Z" fill="#efe4c8" stroke="${INK}" stroke-width="4"/><path d="M30 84 L132 150 L226 64" fill="none" stroke="${INK}" stroke-width="3"/>
    <path d="M60 210 C 100 150 160 150 200 196" stroke="${RED}" stroke-width="5" fill="none"/><circle cx="132" cy="150" r="18" fill="url(#seal)" stroke="${INK}" stroke-width="3"/>
    <path d="M124 146 h16 M132 140 v14" stroke="#ffd0c8" stroke-width="3"/></g>`,
  caisse: r => `<g filter="url(#drop)"><path d="M34 100 L222 100 L222 214 L34 214Z" fill="url(#wood)" stroke="${INK}" stroke-width="5"/><path d="M34 100 C 34 50 222 50 222 100Z" fill="#7a4f2a" stroke="${INK}" stroke-width="5"/>
    ${[66, 128, 190].map(x => `<path d="M${x} 62 V214" stroke="#2c2c2c" stroke-width="12"/>`).join("")}<path d="M34 140 H222" stroke="#2c2c2c" stroke-width="8"/>
    <rect x="114" y="128" width="28" height="34" rx="4" fill="url(#brass)" stroke="${INK}" stroke-width="3"/><circle cx="128" cy="142" r="4" fill="${INK}"/></g>`,
  "poids-jete": r => `${[0, 1, 2].map(i => `<path d="M${30 + i * 8} ${150 + i * 26} H${120 - i * 10}" stroke="#d9cfb8" stroke-width="${8 - i * 2}" stroke-linecap="round" opacity="${0.7 - i * 0.2}"/>`).join("")}
    <circle cx="160" cy="160" r="80" fill="url(#redglow)"/><g filter="url(#drop)"><path d="M118 112 L202 112 L216 214 L104 214Z" fill="url(#iron)" stroke="${INK}" stroke-width="5"/><rect x="136" y="80" width="48" height="32" rx="8" fill="none" stroke="${INK}" stroke-width="10"/>
    <circle cx="160" cy="166" r="20" fill="url(#seal)" stroke="${INK}" stroke-width="3"/></g>`,
  sceau: r => `<circle cx="128" cy="128" r="110" fill="url(#redglow)"/><g filter="url(#drop)"><circle cx="128" cy="128" r="84" fill="none" stroke="${RED}" stroke-width="12"/><circle cx="128" cy="128" r="62" fill="none" stroke="${RED}" stroke-width="4"/>
    <path d="M100 96 L156 96 L168 166 L88 166Z" fill="${RED}"/><rect x="114" y="74" width="28" height="22" rx="6" fill="none" stroke="${RED}" stroke-width="7"/>
    ${Array.from({ length: 12 }, (_, i) => { const a = i / 12 * 6.283; return `<circle cx="${f(128 + Math.cos(a) * 100)}" cy="${f(128 + Math.sin(a) * 100)}" r="7" fill="none" stroke="#4a4f55" stroke-width="4"/>`; }).join("")}</g>`,
};

async function icon(key) {
  const r = rng("icon:" + key);
  const body = `<rect width="256" height="256" fill="url(#bg)"/><rect width="256" height="256" filter="url(#bgtex)" opacity="0.25" style="mix-blend-mode:screen"/>
    <g filter="url(#ink)">${ICONS[key](r)}</g><rect x="3" y="3" width="250" height="250" fill="none" stroke="#7a5a2f" stroke-width="6"/>`;
  return render(svg(256, 256, common + noiseFilter("bgtex", { freq: "0.03", octaves: 4, seed: 5, dark: "#000000", light: "#6a5a4a" }), body), `items/${key}.webp`, { quality: 90 });
}

async function weightToken(zone) {
  const body = `<rect width="512" height="512" fill="#5a5146"/><rect width="512" height="512" filter="url(#stone)" opacity="0.8"/>
    <circle cx="256" cy="256" r="200" fill="url(#redglow)"/>
    <g filter="url(#drop)"><rect x="96" y="96" width="320" height="320" fill="none" stroke="#2a2622" stroke-width="30"/><path d="M96 96 L416 416 M416 96 L96 416" stroke="#2a2622" stroke-width="14" opacity="0.7"/>
    <circle cx="256" cy="256" r="122" fill="url(#iron)" stroke="#0e0f10" stroke-width="10"/><circle cx="256" cy="256" r="86" fill="none" stroke="#6c737b" stroke-width="6"/>
    <circle cx="256" cy="256" r="48" fill="url(#seal)" stroke="#2b0507" stroke-width="6"/><path d="M234 236 q22 -18 44 0" stroke="#ffd6cc" stroke-width="6" fill="none" opacity="0.7"/></g>
    <circle cx="410" cy="410" r="62" fill="#f3ead4" stroke="${INK}" stroke-width="7"/><text x="410" y="436" font-family="Palatino Linotype, Georgia, serif" font-size="78" font-weight="700" text-anchor="middle" fill="${INK}">${zone}</text>`;
  const file = await render(svg(512, 512, common + noiseFilter("stone", { freq: "0.05", octaves: 4, seed: 9, dark: "#3a3631", light: "#8a847a" }), body), `portraits/poids-${zone.toLowerCase()}.webp`);
  await tokenFrom(await sharp(file).png().toBuffer(), `tokens/poids-${zone.toLowerCase()}.webp`, "#4a4f55");
}

async function zoneIcon(letter) {
  const body = `<circle cx="64" cy="64" r="58" fill="#7a2e2e" stroke="#f3ead4" stroke-width="6"/><circle cx="64" cy="64" r="48" fill="none" stroke="#c9a54a" stroke-width="2"/>
    <text x="64" y="87" font-family="Palatino Linotype, Georgia, serif" font-size="64" font-weight="700" text-anchor="middle" fill="#f3ead4">${letter}</text>`;
  return render(svg(128, 128, "", body), `icons/zone-${letter.toLowerCase()}.webp`, { quality: 92 });
}

/* ---------- paper handouts ---------- */
const HANDOUTS = {
  ordre: { title: "AVIS", lines: ["Jusqu'à restitution de la caisse de paie,", "aucune personne ne quittera la filature", "avec les effets de l'établissement.", "", "Les chefs d'équipe sont chargés", "de maintenir les portes fermées."], sign: "Tamaki Minase", stamp: true, font: "Palatino Linotype" },
  notice: { title: "Vanne générale", lines: ["Trois conduites, trois poids rouges.", "Atelier, magasin, chaufferie.", "Fermer la vanne générale dans", "le sens de la flèche, puis tirer", "le cliquet vers soi.", "Ne pas arracher la conduite.", "Si le poids rouge de la chaufferie", "casse, tout le circuit cesse de charger."], sign: "Gen", diagram: true, font: "Segoe Print" },
  compte: { title: "Compte des ouvrières", lines: ["Vingt-quatre à l'appel. Seize dans la cour.", "", "Atelier : Hana, Miyo, Kinu, Setsu.", "Magasin : Nao, Toki, Yae, Ritsu.", "", "La caisse est entière. Ce qui manque", "est dans les salaires, pas dans nos poches."], sign: "Fumi", font: "Ink Free" },
  lettre: { title: "Madame Minase,", lines: ["Je confirme ma venue", "après le coucher du soleil.", "Je demande l'accès aux balances", "et aux conduites : un établissement", "qui perd le contrôle de ses poids", "perd bientôt le contrôle", "de ses comptes."], sign: "Shigure, acheteur", seal: true, font: "Segoe Script" },
};

async function handout(key) {
  const h = HANDOUTS[key], r = rng("handout:" + key), W = 1000, H = 1300;
  const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const defs = paperDefs("paper", "#ece0c4", r.int(1, 99)) + common + inkFilter("ragged", 10, 0.02, r.int(1, 50)) +
    `<radialGradient id="age" r="70%"><stop offset="0.6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#5a3a12" stop-opacity="0.45"/></radialGradient>`;
  const text = h.lines.map((line, i) => `<text x="110" y="${330 + i * 74}" font-family="${h.font}, Georgia, serif" font-size="${{ "Palatino Linotype": 46, "Ink Free": 46, "Segoe Print": 38, "Segoe Script": 40 }[h.font]}" fill="#1d1712">${esc(line)}</text>`).join("");
  const body = `<rect width="${W}" height="${H}" fill="#1b1612"/>
    <g filter="url(#ragged)"><rect x="40" y="40" width="${W - 80}" height="${H - 80}" fill="#ece0c4"/></g>
    <g clip-path="url(#sheet)">${paperRect("paper", W, H, "#ece0c4")}<rect width="${W}" height="${H}" fill="url(#age)"/>
      ${Array.from({ length: 5 }, () => `<circle cx="${f(r.range(100, 900))}" cy="${f(r.range(100, 1200))}" r="${f(r.range(20, 70))}" fill="#a07a3a" opacity="0.08"/>`).join("")}</g>
    <text x="${W / 2}" y="210" font-family="${h.font === "Palatino Linotype" ? "Palatino Linotype" : h.font}, Georgia, serif" font-size="68" font-weight="700" text-anchor="middle" fill="#1d1712">${esc(h.title)}</text>
    <path d="M140 250 H860" stroke="#1d1712" stroke-width="3" opacity="0.6"/>${text}
    ${h.diagram ? `<g transform="translate(600 960)" stroke="#1d1712" stroke-width="5" fill="none"><circle cx="0" cy="0" r="40"/><circle cx="160" cy="0" r="40"/><circle cx="80" cy="150" r="40"/><path d="M40 0 H120 M20 35 L60 115 M140 35 L100 115"/><circle cx="0" cy="0" r="14" fill="${RED}" stroke="none"/><circle cx="160" cy="0" r="14" fill="${RED}" stroke="none"/><circle cx="80" cy="150" r="14" fill="${RED}" stroke="none"/><path d="M-120 140 a60 60 0 1 1 30 50" stroke="${RED}" stroke-width="7"/><path d="M-100 196 l18 -30 l18 22z" fill="${RED}" stroke="none"/></g>` : ""}
    <text x="${W - 120}" y="${H - 170}" font-family="Segoe Script, Georgia, serif" font-size="50" text-anchor="end" fill="#1d1712">${esc(h.sign)}</text>
    ${h.stamp ? `<g transform="translate(${W - 230} ${H - 330}) rotate(-6)" opacity="0.85"><rect width="130" height="130" rx="10" fill="none" stroke="${RED}" stroke-width="10"/><text x="65" y="92" font-family="Yu Mincho, MS Mincho, serif" font-size="78" text-anchor="middle" fill="${RED}">皆瀬</text></g>` : ""}
    ${h.seal ? `<g transform="translate(170 ${H - 220})"><circle r="56" fill="url(#seal)" stroke="#3a0305" stroke-width="5"/><path d="M-20 -14 L20 -14 L28 26 L-28 26Z" fill="#3a0305" opacity="0.8"/><rect x="-10" y="-30" width="20" height="16" rx="4" fill="none" stroke="#3a0305" stroke-width="5" opacity="0.8"/></g>` : ""}`;
  return render(svg(W, H, defs + `<clipPath id="sheet"><rect x="40" y="40" width="${W - 80}" height="${H - 80}"/></clipPath>`, body), `handouts/${key}.webp`, { quality: 88 });
}

/* ---------- cover and banner ---------- */
function coverArt(W, H) {
  const r = rng("cover");
  const s = H / 1080;
  const g = H * 0.74;
  const defs = common + inkFilter("brush", 10, 0.015, 8) + noiseFilter("cloud", { freq: "0.003 0.01", octaves: 5, seed: 21, dark: "#0e1620", light: "#3a4a5e", contrast: 1.4 }) +
    `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1119"/><stop offset="0.75" stop-color="#25344a"/><stop offset="1" stop-color="#4a2c2c"/></linearGradient>
     <radialGradient id="moon" r="50%"><stop offset="0" stop-color="#fff8e0"/><stop offset="0.6" stop-color="#f1e2b0" stop-opacity="0.6"/><stop offset="1" stop-color="#f1e2b0" stop-opacity="0"/></radialGradient>
     <radialGradient id="window" r="50%"><stop offset="0" stop-color="#ffd27a"/><stop offset="1" stop-color="#ff8a2a" stop-opacity="0"/></radialGradient>
     <linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16202c"/><stop offset="1" stop-color="#07090c"/></linearGradient>
     <filter id="soften" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${f(14 * s)}"/></filter>`;
  const mx = W * 0.68;
  const mill = `M${mx - 560 * s} ${g} V${g - 220 * s} L${mx - 420 * s} ${g - 320 * s} L${mx - 120 * s} ${g - 320 * s} L${mx + 10 * s} ${g - 220 * s} V${g - 250 * s} L${mx + 150 * s} ${g - 370 * s} L${mx + 440 * s} ${g - 370 * s} L${mx + 580 * s} ${g - 250 * s} V${g}Z`;
  const windows = Array.from({ length: 10 }, (_, i) => [mx - 500 * s + i * 112 * s, g - 175 * s]);
  const body = [
    `<rect width="${W}" height="${H}" fill="url(#sky)"/><rect width="${W}" height="${g}" filter="url(#cloud)" opacity="0.5" style="mix-blend-mode:screen"/>`,
    `<circle cx="${W * 0.86}" cy="${H * 0.19}" r="${190 * s}" fill="url(#moon)"/><circle cx="${W * 0.86}" cy="${H * 0.19}" r="${80 * s}" fill="#fff6dc"/>`,
    `<g filter="url(#soften)" opacity="0.5">${Array.from({ length: 8 }, (_, i) => `<circle cx="${f(mx + 307 * s + i * 34 * s + r.range(-20, 20) * s)}" cy="${f(g - 580 * s - i * 62 * s)}" r="${f((46 + i * 16) * s)}" fill="#b9c0c8"/>`).join("")}</g>`,
    `<rect x="${mx + 280 * s}" y="${g - 560 * s}" width="${54 * s}" height="${200 * s}" fill="#0c0a0a"/><rect x="${mx + 272 * s}" y="${g - 572 * s}" width="${70 * s}" height="${18 * s}" fill="#0c0a0a"/>`,
    `<path d="${mill}" fill="#100d0c"/><path d="M${mx - 420 * s} ${g - 320 * s} L${mx - 120 * s} ${g - 320 * s} M${mx + 150 * s} ${g - 370 * s} L${mx + 440 * s} ${g - 370 * s}" stroke="#3a3030" stroke-width="${4 * s}"/>`,
    ...windows.map(([x, y]) => `<circle cx="${f(x + 23 * s)}" cy="${f(y + 31 * s)}" r="${f(80 * s)}" fill="url(#window)" opacity="0.3"/><rect x="${f(x)}" y="${f(y)}" width="${f(46 * s)}" height="${f(62 * s)}" fill="#ffc46a" opacity="${f(r.range(0.6, 0.95) * 100) / 100}"/><path d="M${f(x + 23 * s)} ${f(y)} v${f(62 * s)} M${f(x)} ${f(y + 31 * s)} h${f(46 * s)}" stroke="#3a2412" stroke-width="${f(3 * s)}"/>`),
    `<rect y="${g}" width="${W}" height="${H - g}" fill="url(#water)"/>`,
    ...windows.map(([x]) => `<rect x="${f(x + 6 * s)}" y="${f(g + 14 * s)}" width="${f(34 * s)}" height="${f(120 * s)}" fill="#ffb04a" opacity="0.22" filter="url(#soften)"/>`),
    ...Array.from({ length: 26 }, () => `<path d="M${f(r.range(0, W))} ${f(r.range(g + 10 * s, H))} h${f(r.range(30, 120) * s)}" stroke="#6a7f96" stroke-width="${f(2 * s)}" opacity="0.35"/>`),
    `<path d="M0 ${g + 4 * s} C ${W * 0.1} ${g - 40 * s}, ${W * 0.24} ${g - 46 * s}, ${W * 0.34} ${g + 4 * s}Z" fill="#090707"/>`,
    `<g transform="translate(${W * 0.2} ${g - 26 * s}) scale(${1.25 * s})" fill="#090707"><circle cx="0" cy="-244" r="19"/><path d="M8 -258 C 30 -250 40 -224 34 -196 C 28 -214 18 -230 6 -236Z"/>
      <path d="M-30 -222 L30 -222 C46 -200 52 -170 58 -130 L74 -40 L-66 -40 L-50 -130 C-46 -170 -44 -200 -30 -222Z"/><path d="M-40 -40 L-46 0 L-10 0 L-2 -28 L6 0 L42 0 L44 -40Z"/>
      <path d="M34 -204 L74 -124" stroke="#090707" stroke-width="16" stroke-linecap="round"/><path d="M76 -122 L132 -14" stroke="#c9ced4" stroke-width="4"/><path d="M70 -132 L82 -114" stroke="#090707" stroke-width="10"/></g>`,
    ...Array.from({ length: 8 }, () => `<path d="M-50 ${f(H * r.range(0.08, 0.7))} C ${f(W * 0.3)} ${f(H * r.range(0, 0.8))}, ${f(W * 0.6)} ${f(H * r.range(0, 0.8))}, ${f(W + 50)} ${f(H * r.range(0.05, 0.7))}" stroke="${mix(RED, "#ff8080", r.range(0, 0.4))}" stroke-width="${f(r.range(1.5, 3.5) * s)}" fill="none" opacity="${f(r.range(0.4, 0.75) * 100) / 100}"/>`),
    `<g transform="translate(${W * 0.4} 0) scale(${s})"><g stroke="#e9dcc0" stroke-width="7" fill="none" stroke-linecap="round" filter="url(#brush)"><path d="M0 0 V 230"/><path d="M-230 250 L 230 210"/>
      <path d="M-230 250 L-280 400 M-230 250 L-180 400 M230 210 L180 330 M230 210 L280 330"/><path d="M-300 400 Q-230 450 -160 400 M160 330 Q230 380 300 330"/></g>
      <g filter="url(#drop)"><path d="M-262 352 L-198 352 L-190 404 L-270 404Z" fill="url(#iron)"/><circle cx="-230" cy="380" r="15" fill="url(#seal)"/>${[0, 1, 2].map(i => `<ellipse cx="${206 + i * 24}" cy="324" rx="11" ry="14" fill="#f2ead8" stroke="${INK}" stroke-width="3"/>`).join("")}</g></g>`,
    `<text x="${W - 80 * s}" y="${H * 0.87}" font-family="Palatino Linotype, Georgia, serif" font-size="${118 * s}" font-weight="700" fill="#f3ead4" text-anchor="end" letter-spacing="${3 * s}">Le poids de la soie</text>`,
    `<path d="M${W - 80 * s} ${H * 0.87 + 26 * s} h${-700 * s}" stroke="${RED}" stroke-width="${6 * s}"/>`,
    `<text x="${W - 80 * s}" y="${H * 0.87 + 82 * s}" font-family="Palatino Linotype, Georgia, serif" font-size="${40 * s}" font-style="italic" fill="#d9cdb2" text-anchor="end">Breathe and Live · un one-shot Kimetsu no Yaiba</text>`,
  ];
  return svg(W, H, defs, body.join(""));
}

export async function buildObjects() {
  for (const key of Object.keys(ICONS)) await icon(key);
  for (const zone of ["B", "E", "C"]) await weightToken(zone);
  for (const letter of "ABCDEF") await zoneIcon(letter);
  for (const key of Object.keys(HANDOUTS)) await handout(key);
  await render(coverArt(1920, 1080), "art/cover.webp", { quality: 86 });
  await render(coverArt(1920, 1080), "art/cover-thumb.webp", { width: 480, height: 270, quality: 80 });
  // Wide banner for journal headers: same scene, title kept, cropped band.
  const banner = await sharp(Buffer.from(coverArt(1920, 1080))).extract({ left: 0, top: 560, width: 1920, height: 480 }).resize(1600, 400).webp({ quality: 84 }).toFile("assets/art/banner.webp");
  return banner;
}
