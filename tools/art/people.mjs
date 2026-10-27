// Ink-and-wash bust portraits for the pregens, NPCs and demons, plus their tokens.
import sharp from "sharp";
import { rng, f, mix, inkFilter, paperDefs, paperRect, svg, render, tokenFrom, noiseFilter } from "./common.mjs";

const INK = "#231a16";
const SKIN = { light: "#f2d3b6", warm: "#e8bf98", tan: "#d9a77c", pale: "#efe6dc", demon: "#9fa592" };

/* ---------- background motifs, one per breath or role ---------- */
function motif(kind, color, r) {
  const g = [];
  if (kind === "water") for (let row = 0; row < 7; row++) for (let i = -1; i < 8; i++) {
    const x = i * 80 + (row % 2) * 40, y = 70 + row * 66;
    g.push(`<path d="M${x - 40} ${y} a40 40 0 0 1 80 0 M${x - 26} ${y} a26 26 0 0 1 52 0 M${x - 12} ${y} a12 12 0 0 1 24 0" fill="none" stroke="${color}" stroke-width="5"/>`);
  }
  if (kind === "flame") for (let i = 0; i < 9; i++) {
    const x = r.range(0, 512), y = r.range(260, 520), s = r.range(0.6, 1.3);
    g.push(`<path transform="translate(${f(x)} ${f(y)}) scale(${f(s)})" d="M0 0 C -40 -40 -10 -80 -20 -140 C 20 -100 40 -70 30 -30 C 50 -50 50 -80 45 -100 C 80 -50 60 0 0 0Z" fill="${color}"/>`);
  }
  if (kind === "thunder") for (let i = 0; i < 6; i++) {
    const x = r.range(-20, 500), y = r.range(-20, 300);
    g.push(`<path transform="translate(${f(x)} ${f(y)})" d="M0 0 L40 70 L18 74 L60 150 L8 86 L30 82 Z" fill="${color}"/>`);
  }
  if (kind === "flower") for (let i = 0; i < 14; i++) {
    const x = r.range(0, 512), y = r.range(0, 512), a = r.range(0, 360), s = r.range(0.6, 1.4);
    g.push(`<g transform="translate(${f(x)} ${f(y)}) rotate(${f(a)}) scale(${f(s)})">${[0, 72, 144, 216, 288].map(t => `<ellipse rx="9" ry="18" cy="-16" transform="rotate(${t})" fill="${color}"/>`).join("")}<circle r="5" fill="${mix(color, "#ffffff", 0.5)}"/></g>`);
  }
  if (kind === "wind") for (let i = 0; i < 8; i++) {
    const x = r.range(-40, 480), y = r.range(20, 480), s = r.range(0.7, 1.4);
    g.push(`<path transform="translate(${f(x)} ${f(y)}) scale(${f(s)})" d="M0 0 C 60 -10 110 10 120 40 C 125 65 100 80 80 70 C 65 62 70 42 88 45" fill="none" stroke="${color}" stroke-width="7" stroke-linecap="round"/>`);
  }
  if (kind === "silk") for (let i = 0; i < 18; i++) {
    const y = r.range(0, 512);
    g.push(`<path d="M-10 ${f(y)} C 160 ${f(y + r.range(-60, 60))}, 340 ${f(y + r.range(-60, 60))}, 522 ${f(y + r.range(-40, 40))}" stroke="${color}" stroke-width="${f(r.range(1, 3))}" fill="none"/>`);
  }
  if (kind === "scale") {
    g.push(`<g fill="none" stroke="${color}" stroke-width="8"><line x1="256" y1="40" x2="256" y2="470"/><line x1="70" y1="110" x2="442" y2="110"/><path d="M70 110 L30 230 M70 110 L110 230 M442 110 L402 230 M442 110 L482 230"/><path d="M20 230 Q70 280 120 230 M392 230 Q442 280 492 230"/></g>`);
  }
  if (kind === "blood") for (let i = 0; i < 16; i++) g.push(`<circle cx="${f(r.range(0, 512))}" cy="${f(r.range(0, 512))}" r="${f(r.range(4, 26))}" fill="${color}"/>`);
  return g.join("");
}

/* ---------- hair styles: back layer (behind head) and front layer ---------- */
const HAIR = {
  ponytail: {
    back: `M170 262 C158 140 210 78 256 78 C302 78 354 140 342 262 C336 300 326 322 318 332 L194 332 C186 322 176 300 170 262Z
      M322 112 C392 140 410 270 380 430 C366 388 356 312 330 222Z`,
    front: `M182 206 C178 138 212 96 256 94 C304 94 336 138 330 206 C320 176 304 152 290 140 C286 166 272 180 258 186 C262 166 258 150 250 138 C236 166 218 182 198 188 C204 172 206 160 204 150 C194 166 188 186 182 206Z`,
    shine: "M214 118 C232 106 262 102 284 110",
  },
  spiky: {
    back: `M176 206 C166 122 214 74 256 72 C304 72 352 122 336 206Z`,
    front: `M180 204 L170 150 L196 160 L188 110 L222 136 L226 84 L252 124 L270 78 L282 126 L312 92 L310 140 L342 128 L326 176 L346 190 L330 206 C318 168 296 150 270 150 C240 150 206 160 180 204Z`,
    shine: "M226 112 L246 132 M276 106 L270 132",
  },
  messy: {
    back: `M176 214 C166 130 214 80 256 78 C302 78 350 130 338 214Z`,
    front: `M182 208 C176 160 186 120 214 102 L208 84 L236 96 L246 70 L264 94 L290 76 L292 102 L322 98 L316 122 C334 140 336 176 330 208 C326 190 318 172 306 162 L300 180 L288 160 L276 184 L268 156 L254 186 L246 158 L232 184 L226 160 L210 182 L204 162 C194 174 186 190 182 208Z`,
    shine: "M232 104 C250 96 272 96 290 104",
  },
  bun: {
    back: `M176 226 C164 140 210 92 256 90 C302 90 348 140 336 226 C332 250 326 262 320 268 L192 268 C186 262 180 250 176 226Z M256 70 m-44 0 a44 40 0 1 0 88 0 a44 40 0 1 0 -88 0`,
    front: `M184 214 C178 146 214 104 256 102 C298 102 334 146 328 214 C318 168 290 132 262 128 C240 150 214 168 196 176 C190 186 186 200 184 214Z`,
    shine: "M232 70 C246 56 270 56 282 66 M226 116 C240 108 256 106 270 108",
  },
  slick: {
    back: `M178 210 C170 128 214 84 256 82 C300 82 344 128 334 210 C330 240 324 254 318 262 L194 262 C188 254 182 240 178 210Z`,
    front: `M184 200 C182 140 216 98 256 96 C300 96 332 136 328 200 C320 168 300 140 270 130 C250 126 226 132 214 150 C230 146 242 150 248 160 C228 158 206 170 196 186 C190 190 186 196 184 200Z`,
    shine: "M224 110 C246 100 276 100 300 116 M232 124 C252 116 276 118 296 130",
  },
  scarf: {
    back: `M178 220 C170 150 210 108 256 106 C302 106 342 150 334 220Z`,
    front: `M172 196 C170 120 214 82 258 82 C304 82 346 122 340 196 C320 170 290 158 256 158 C222 158 192 170 172 196Z M330 168 C360 170 380 200 372 236 C356 220 344 206 330 200Z M336 190 C364 210 368 252 352 280 C344 252 334 226 324 206Z`,
    shine: "M216 104 C240 92 274 92 298 104",
    fill2: true,
  },
  bald: {
    back: `M184 228 C178 200 180 178 186 168 L196 168 L196 230Z M328 228 C334 200 332 178 326 168 L316 168 L316 230Z`,
    front: `M186 186 C186 168 192 156 200 150 L204 196 Z M326 186 C326 168 320 156 312 150 L308 196Z`,
    shine: "",
  },
  tied: {
    back: `M178 222 C168 140 212 92 256 90 C300 90 344 140 334 222 C330 244 324 256 318 262 L194 262 C188 256 182 244 178 222Z M300 250 m-30 0 a30 28 0 1 0 60 0 a30 28 0 1 0 -60 0`,
    front: `M184 210 C180 146 214 102 256 100 C298 100 332 146 328 210 C320 166 292 128 258 122 L256 140 L254 122 C220 128 192 166 184 210Z`,
    shine: "M222 112 C234 104 248 102 254 104 M262 104 C276 102 290 106 300 114",
  },
  loose: {
    back: `M168 300 C150 150 206 84 256 84 C306 84 362 150 344 300 C340 340 330 370 322 380 L190 380 C182 370 172 340 168 300Z`,
    front: `M180 236 C172 150 212 100 256 98 C300 98 340 150 332 236 C326 200 316 170 298 150 C290 176 272 190 256 194 C268 176 270 156 262 140 C246 166 222 188 196 196 C204 180 206 166 202 156 C190 176 184 206 180 236Z M196 196 C190 240 192 280 200 310 C186 280 182 240 186 210Z`,
    shine: "M220 114 C240 104 270 104 292 114",
  },
  wild: {
    back: `M150 300 L160 220 L130 200 L168 170 L140 120 L190 120 L186 70 L228 96 L250 50 L270 94 L312 62 L314 112 L366 102 L344 152 L386 170 L350 202 L374 248 L344 250 L360 310 L310 270 L200 270 L170 320Z`,
    front: `M182 202 L176 160 L200 168 L196 128 L224 150 L234 112 L254 146 L272 108 L282 148 L310 124 L310 162 L336 158 L330 202 C316 176 294 166 262 166 C232 166 200 176 182 202Z`,
    shine: "",
  },
  parted: {
    back: `M176 230 C166 140 212 88 256 86 C302 86 346 140 336 230 C334 262 330 286 324 300 L188 300 C182 286 178 262 176 230Z`,
    front: `M184 210 C180 140 216 98 260 96 C304 96 334 140 328 210 C326 180 318 156 306 140 C290 132 268 128 244 132 C226 140 212 156 204 172 C196 184 188 196 184 210Z M244 132 C232 150 218 168 206 186 C214 166 226 146 244 132Z`,
    shine: "M264 106 C282 104 300 110 312 122",
  },
};

/* ---------- faces ---------- */
function eyes(p) {
  const { iris = "#3b2a20", lid = 1, demon = false, brow = 0, browW = 4.5, age = 0 } = p;
  const eye = (cx, side) => {
    const shape = `M${cx - 24 * side} 222 Q${cx} ${202 + (1 - lid) * 9} ${cx + 24 * side} 220 Q${cx + 2 * side} ${235} ${cx - 22 * side} 225Z`;
    const id = `eye${cx}`;
    return `<clipPath id="${id}"><path d="${shape}"/></clipPath>
      <path d="${shape}" fill="#fbf7f0"/>
      <g clip-path="url(#${id})"><circle cx="${cx + side}" cy="221" r="12.5" fill="${iris}"/><circle cx="${cx + side}" cy="221" r="12.5" fill="none" stroke="${mix(iris, "#000000", 0.5)}" stroke-width="2"/>
      ${demon ? `<ellipse cx="${cx + side}" cy="221" rx="2.6" ry="9" fill="#0b0505"/>` : `<circle cx="${cx + side}" cy="221" r="5.5" fill="#120c09"/>`}
      <circle cx="${cx + side - 4}" cy="216" r="3.4" fill="#ffffff" opacity="0.95"/><path d="${shape}" fill="none" stroke="#000" stroke-opacity="0.18" stroke-width="10" transform="translate(0 -6)"/></g>
      <path d="M${cx - 25 * side} 223 Q${cx} ${205 + (1 - lid) * 8} ${cx + 25 * side} 219" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M${cx + 25 * side} 219 l${4 * side} -4" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
      ${age ? `<path d="M${cx + 22 * side} 232 q${8 * side} 2 ${12 * side} -4 M${cx - 10 * side} 234 q${10 * side} 4 ${22 * side} 0" stroke="${INK}" stroke-width="1.6" fill="none" opacity="0.55"/>` : ""}
      <path d="M${cx - 22 * side} ${198 - brow * side * 0} Q${cx} ${190 - brow * 4} ${cx + 24 * side} ${196 + brow * 6}" fill="none" stroke="${INK}" stroke-width="${browW}" stroke-linecap="round"/>`;
  };
  return eye(226, -1) + eye(286, 1);
}

function mouth(kind) {
  return {
    calm: `<path d="M242 281 Q256 286 270 281" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    smile: `<path d="M238 279 Q256 292 274 279" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    firm: `<path d="M240 283 L272 283" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`,
    worried: `<path d="M242 286 Q256 278 270 286" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M248 288 Q256 292 264 288" stroke="#b05050" stroke-width="2" fill="none" opacity="0.5"/>`,
    open: `<path d="M240 278 Q256 300 272 278 Q256 284 240 278Z" fill="#5a1f1f" stroke="${INK}" stroke-width="2.5"/>`,
    fangs: `<path d="M232 276 Q256 306 280 276 Q256 284 232 276Z" fill="#3a0d0d" stroke="${INK}" stroke-width="3"/><path d="M240 279 l4 11 l4 -10 M264 279 l4 10 l4 -11" fill="#fffbe8" stroke="${INK}" stroke-width="1.2"/>`,
    thin: `<path d="M236 280 Q256 288 276 276" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M276 276 l5 -3" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>`,
  }[kind];
}

/* ---------- clothes ---------- */
const BODY = "M-10 540 L4 476 C22 424 116 394 204 370 L308 370 C396 394 490 424 508 476 L522 540Z";
function slayerClothes(haori, pattern, r) {
  return `<clipPath id="haori"><path d="${BODY}"/></clipPath>
    <path d="${BODY}" fill="${haori}"/>
    <g clip-path="url(#haori)" opacity="0.55">${pattern ? motif(pattern, mix(haori, "#ffffff", 0.55), r) : ""}</g>
    <path d="${BODY}" fill="url(#cloth)"/>
    <path d="M196 370 L316 370 L304 512 L208 512Z" fill="#17171c"/>
    <path d="M196 370 L176 512 L206 512 L214 384Z M316 370 L336 512 L306 512 L298 384Z" fill="${mix(haori, "#000000", 0.25)}"/>
    <path d="M222 336 L290 336 L304 374 L208 374Z" fill="#101015" stroke="${INK}" stroke-width="3"/>
    <path d="M256 374 L256 512" stroke="#2a2a33" stroke-width="2"/>${[400, 440, 480].map(y => `<circle cx="256" cy="${y}" r="5" fill="#c9b27a" stroke="#4a3d1a" stroke-width="1.5"/>`).join("")}
    <path d="${BODY}" fill="none" stroke="${INK}" stroke-width="4"/>`;
}
function kimono(color, under = "#efe9dc", { apron = null, tasuki = null, pattern = null } = {}, r) {
  return `<clipPath id="haori"><path d="${BODY}"/></clipPath>
    <path d="${BODY}" fill="${color}"/>
    ${pattern ? `<g clip-path="url(#haori)" opacity="0.4">${motif(pattern, mix(color, "#ffffff", 0.5), r)}</g>` : ""}
    <path d="${BODY}" fill="url(#cloth)"/>
    <path d="M214 352 L256 440 L298 352 L284 352 L256 414 L228 352Z" fill="${under}" stroke="${INK}" stroke-width="2.5"/>
    <path d="M198 372 L256 470 M314 372 L256 470" stroke="${INK}" stroke-width="3.5" fill="none"/>
    ${apron ? `<path d="M150 512 C160 470 190 450 220 446 L292 446 C322 450 352 470 362 512Z" fill="${apron}" stroke="${INK}" stroke-width="3"/>` : ""}
    ${tasuki ? `<path d="M120 420 L392 500 M392 420 L120 500" stroke="${tasuki}" stroke-width="12" opacity="0.9"/>` : ""}
    <path d="${BODY}" fill="none" stroke="${INK}" stroke-width="4"/>`;
}

/* ---------- characters ---------- */
const PEOPLE = {
  aoi: { accent: "#2f6f9f", motif: "water", skin: SKIN.light, hair: "ponytail", hairColor: "#1d2433", iris: "#2f5e86", mouth: "calm", brow: 0.2,
    clothes: r => slayerClothes("#2f5d8a", "water", r), ring: "#2f6f9f",
    prop: `<path d="M150 470 C170 450 190 452 200 470" stroke="#5fa8e0" stroke-width="5" fill="none"/>` },
  daigo: { accent: "#b23a1e", motif: "flame", skin: SKIN.tan, hair: "spiky", hairColor: "#4a1f12", iris: "#5a2a14", mouth: "firm", brow: -0.6, browW: 6.5, jaw: true,
    clothes: r => slayerClothes("#8f2a1c", "flame", r), ring: "#c2462a" },
  ren: { accent: "#d7a321", motif: "thunder", skin: SKIN.light, hair: "messy", hairColor: "#7a5a2c", iris: "#8a6a1a", mouth: "open", brow: 0.5,
    clothes: r => slayerClothes("#c7962a", "thunder", r), ring: "#d7a321",
    extra: `<path d="M222 340 L290 340" stroke="#f2cf4a" stroke-width="5"/>` },
  sayo: { accent: "#d06a8c", motif: "flower", skin: SKIN.light, hair: "bun", hairColor: "#2a1c22", iris: "#5a3a4a", mouth: "smile", brow: 0.3,
    clothes: r => slayerClothes("#c9798f", "flower", r), ring: "#d06a8c",
    extra: `<path d="M296 62 L352 30" stroke="#d9c38a" stroke-width="5" stroke-linecap="round"/><g transform="translate(352 30)">${[0, 72, 144, 216, 288].map(t => `<ellipse rx="7" ry="13" cy="-11" transform="rotate(${t})" fill="#f2a7bd" stroke="${INK}" stroke-width="1.5"/>`).join("")}<circle r="5" fill="#ffe07a"/></g>` },
  isamu: { accent: "#5f9b6a", motif: "wind", skin: SKIN.warm, hair: "slick", hairColor: "#141414", iris: "#3a3a2a", mouth: "thin", brow: -0.2, stubble: true,
    clothes: r => slayerClothes("#5f8f62", "wind", r), ring: "#5f9b6a",
    prop: `<g transform="translate(380 452)"><circle r="20" fill="#c9a54a" stroke="${INK}" stroke-width="3"/><rect x="-6" y="-6" width="12" height="12" fill="none" stroke="${INK}" stroke-width="2.5"/></g><path d="M352 470 C362 448 376 444 392 448" stroke="${SKIN.warm}" stroke-width="22" stroke-linecap="round" fill="none"/>` },
  tamaki: { accent: "#6a3f6e", motif: "silk", skin: SKIN.light, hair: "bun", hairColor: "#1b1416", iris: "#3a2a2a", mouth: "firm", brow: -0.3, age: 1,
    clothes: r => kimono("#4b2d55", "#f1ead9", { pattern: "silk" }, r) + `<path d="M120 500 L392 500" stroke="#c9a54a" stroke-width="26"/><path d="M120 500 L392 500" stroke="#7a5a1a" stroke-width="3" stroke-dasharray="14 10"/>`, ring: "#8a6a2f",
    extra: `<path d="M298 56 L350 40 M300 66 L348 62" stroke="#c9a54a" stroke-width="4" stroke-linecap="round"/>` },
  fumi: { accent: "#365a7a", motif: "silk", skin: SKIN.warm, hair: "scarf", hairColor: "#2a1f1a", scarf: "#3d5f7f", iris: "#3a2a1a", mouth: "firm", brow: -0.5,
    clothes: r => kimono("#2f4560", "#e9e2d0", { apron: "#d8cfb8", tasuki: "#8a2e2e" }, r), ring: "#8a6a2f" },
  gen: { accent: "#7a5a3a", motif: "silk", skin: SKIN.tan, hair: "bald", hairColor: "#9a9690", iris: "#3a2a1a", mouth: "calm", brow: 0.1, age: 2, mustache: true,
    clothes: r => kimono("#6b5238", "#d9cfb8", { apron: "#4a3a2a" }, r), ring: "#8a6a2f",
    extra: `<path d="M180 160 C210 150 300 150 332 160" stroke="#3a2a1a" stroke-width="10" fill="none"/><g>${[222, 290].map(x => `<circle cx="${x}" cy="152" r="21" fill="#7d9aa8" stroke="#3a2a1a" stroke-width="6"/><circle cx="${x - 6}" cy="146" r="6" fill="#e8f4f8" opacity="0.8"/>`).join("")}</g>` },
  chiyo: { accent: "#3d6b4f", motif: "silk", skin: SKIN.light, hair: "tied", hairColor: "#24180f", iris: "#3a2a1a", mouth: "worried", brow: 0.6,
    clothes: r => kimono("#355c45", "#efe9dc", { apron: "#e6dfcc" }, r), ring: "#8a6a2f",
    prop: `<path d="M240 452 Q256 476 272 452" stroke="#7a5a1a" stroke-width="3" fill="none"/><g transform="translate(256 486) rotate(20)"><circle r="9" fill="none" stroke="#c9a54a" stroke-width="4"/><rect x="-2.5" y="8" width="5" height="22" fill="#c9a54a"/><rect x="0" y="22" width="9" height="4" fill="#c9a54a"/></g>` },
  captive: { accent: "#8f2f2f", motif: "silk", skin: SKIN.light, hair: "loose", hairColor: "#1e1612", iris: "#3a2a1a", mouth: "worried", brow: 0.9, lid: 0.7,
    clothes: r => kimono("#8a8170", "#e9e2d0", { tasuki: "#5a4a3a" }, r), ring: "#8f2f2f",
    prop: `<path d="M120 512 C130 480 150 462 176 456 L210 470 L190 512Z" fill="${SKIN.pale}" stroke="${INK}" stroke-width="3"/><rect x="148" y="474" width="58" height="22" rx="6" fill="#5a3a22" stroke="${INK}" stroke-width="3" transform="rotate(-24 177 485)"/><circle cx="177" cy="485" r="9" fill="#d42a2a" stroke="#3a0505" stroke-width="2"/><circle cx="177" cy="485" r="22" fill="#ff3030" opacity="0.25"/>` },
  goro: { accent: "#5b1f2a", motif: "blood", skin: SKIN.demon, hair: "wild", hairColor: "#2a2a24", iris: "#d42020", demon: true, mouth: "fangs", brow: -1, browW: 6, veins: true,
    clothes: r => kimono("#4a4436", "#6a6250", { tasuki: "#2a2620" }, r), ring: "#6b1f2a",
    extra: `<path d="M204 112 L192 70 L218 104Z M308 112 L322 70 L296 104Z" fill="#d9d2b8" stroke="${INK}" stroke-width="3"/>` },
  shigure: { accent: "#7a1f1f", motif: "scale", skin: "#ece4dc", hair: "parted", hairColor: "#0f0d0e", iris: "#c41a24", demon: true, mouth: "thin", brow: -0.1, lid: 0.75, marks: true,
    clothes: r => kimono("#1f1d24", "#d8d2c6", { apron: "#f4f1ea" }, r), ring: "#7a1f1f",
    prop: `<g transform="translate(372 452)"><path d="M-30 30 C -40 -10 -10 -24 6 -18 L 30 10 C 40 30 20 46 -30 30Z" fill="#ece4dc" stroke="${INK}" stroke-width="3"/><path d="M6 -18 C 12 -26 22 -26 26 -16 L 30 10" fill="#0c0b0c"/><g transform="translate(-6 -36)"><rect x="-18" y="-14" width="36" height="30" rx="5" fill="#3a3c40" stroke="${INK}" stroke-width="3"/><rect x="-8" y="-22" width="16" height="10" rx="3" fill="none" stroke="${INK}" stroke-width="3"/><circle r="6" fill="#c41a24"/></g></g>` },
};

function portrait(key) {
  const p = PEOPLE[key];
  const r = rng("portrait:" + key);
  const hair = HAIR[p.hair];
  const skinShade = mix(p.skin, "#6a3a2a", 0.28);
  const defs = `${paperDefs("paper", "#efe4cc", r.int(1, 99))}${inkFilter("ink", 2.2, 0.035, r.int(1, 50))}${inkFilter("brush", 14, 0.02, r.int(1, 50))}
    ${noiseFilter("hairtex", { freq: "0.9 0.02", octaves: 2, seed: r.int(1, 99), dark: "#000000", light: "#ffffff" })}
    <radialGradient id="faceShade" cx="40%" cy="38%" r="70%"><stop offset="0.55" stop-color="${p.skin}" stop-opacity="0"/><stop offset="1" stop-color="${skinShade}" stop-opacity="0.85"/></radialGradient>
    <linearGradient id="cloth" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0.35"/><stop offset="0.45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.4"/></linearGradient>
    <linearGradient id="hairShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.18"/><stop offset="1" stop-color="#000" stop-opacity="0.35"/></linearGradient>
    <clipPath id="frame"><rect width="512" height="512"/></clipPath>`;
  const face = `M186 206 C186 256 200 292 230 312 Q256 326 282 312 C312 292 326 256 326 206 C326 140 296 110 256 110 C216 110 186 140 186 206Z`;
  const jaw = p.jaw ? `M186 206 C186 262 196 296 226 316 Q256 330 286 316 C316 296 326 262 326 206 C326 140 296 110 256 110 C216 110 186 140 186 206Z` : face;
  const body = [
    paperRect("paper", 512, 512, "#efe4cc"),
    `<g opacity="0.22">${motif(p.motif, p.accent, r)}</g>`,
    `<path d="M256 56 m-196 170 a196 186 0 1 0 392 0 a196 186 0 1 0 -392 0" fill="none" stroke="${p.accent}" stroke-width="42" stroke-linecap="round" stroke-dasharray="1050 140" transform="rotate(${r.int(0, 360)} 256 242)" opacity="0.8" filter="url(#brush)"/>`,
    `<g transform="translate(256 300) scale(1.2) translate(-256 -262)">`,
    `<ellipse cx="270" cy="470" rx="250" ry="60" fill="#000" opacity="0.18" filter="url(#brush)"/>`,
    `<g filter="url(#ink)">`,
    `<path d="${hair.back}" fill="${p.hairColor}" stroke="${INK}" stroke-width="3.5"/>`,
    `<path d="M228 296 L228 352 Q256 366 284 352 L284 296Z" fill="${p.skin}" stroke="${INK}" stroke-width="3"/><path d="M228 300 Q256 336 284 300 L284 318 Q256 346 228 318Z" fill="${skinShade}" opacity="0.7"/>`,
    p.clothes(r),
    `<path d="M182 222 q-14 -2 -12 18 q2 18 16 18Z M330 222 q14 -2 12 18 q-2 18 -16 18Z" fill="${p.skin}" stroke="${INK}" stroke-width="3"/>`,
    `<path d="${jaw}" fill="${p.skin}"/><path d="${jaw}" fill="url(#faceShade)"/>`,
    p.veins ? `<path d="M196 190 q10 20 4 40 M318 186 q-12 22 -4 44 M210 250 q12 10 8 26" stroke="#5b2a3a" stroke-width="2.5" fill="none" opacity="0.7"/>` : "",
    p.marks ? `<circle cx="208" cy="258" r="9" fill="none" stroke="#7a1f1f" stroke-width="3"/><circle cx="208" cy="258" r="3" fill="#7a1f1f"/><circle cx="304" cy="258" r="9" fill="none" stroke="#7a1f1f" stroke-width="3"/><circle cx="304" cy="258" r="3" fill="#7a1f1f"/>` : "",
    `<ellipse cx="214" cy="256" rx="16" ry="8" fill="#e2848a" opacity="${p.demon ? 0 : 0.28}"/><ellipse cx="298" cy="256" rx="16" ry="8" fill="#e2848a" opacity="${p.demon ? 0 : 0.28}"/>`,
    eyes({ iris: p.iris, lid: p.lid ?? 1, demon: p.demon, brow: p.brow ?? 0, browW: p.browW ?? 4.5, age: p.age ?? 0 }),
    `<path d="M258 232 C254 246 250 254 252 258 Q256 262 262 259" fill="none" stroke="${mix(skinShade, INK, 0.4)}" stroke-width="2.5" stroke-linecap="round"/>`,
    mouth(p.mouth),
    p.stubble ? `<path d="${jaw}" fill="none"/><path d="M214 290 Q256 330 298 290 L296 304 Q256 336 216 304Z" fill="#3a3330" opacity="0.18"/>` : "",
    p.mustache ? `<path d="M234 272 Q246 262 256 268 Q266 262 278 272 Q268 276 256 272 Q244 276 234 272Z" fill="#a9a59c" stroke="${INK}" stroke-width="2"/>` : "",
    p.age > 1 ? `<path d="M214 180 q42 -10 84 0 M220 170 q36 -8 72 0" stroke="${INK}" stroke-width="1.5" fill="none" opacity="0.4"/>` : "",
    `<path d="${jaw}" fill="none" stroke="${INK}" stroke-width="3.5"/>`,
    `<path d="${hair.front}" fill="${p.hair === "scarf" ? p.scarf : p.hairColor}" stroke="${INK}" stroke-width="3.5"/>`,
    `<path d="${hair.front}" fill="url(#hairShade)"/>`,
    `<clipPath id="hf"><path d="${hair.front}"/></clipPath><g clip-path="url(#hf)" opacity="0.45">${Array.from({ length: 14 }, (_, i) => { const x = 170 + i * 13 + r.range(-4, 4); return `<path d="M256 70 Q${f(x + r.range(-20, 20))} 120 ${f(x)} ${f(r.range(170, 230))}" stroke="${mix(p.hair === "scarf" ? p.scarf : p.hairColor, "#ffffff", 0.25)}" stroke-width="1.6" fill="none"/>`; }).join("")}</g>`,
    p.hair === "scarf" ? `<path d="M214 104 C240 92 274 92 298 104" stroke="${mix(p.scarf, "#ffffff", 0.4)}" stroke-width="4" fill="none" stroke-dasharray="8 8"/>` : "",
    hair.shine ? `<path d="${hair.shine}" stroke="#ffffff" stroke-opacity="0.35" stroke-width="5" fill="none" stroke-linecap="round"/>` : "",
    p.extra ?? "",
    `</g></g>`,
    p.prop ? `<g transform="translate(0 -46)" filter="url(#ink)">${p.prop}</g>` : "",
    `<rect width="512" height="512" fill="none" stroke="${INK}" stroke-width="10"/>`,
  ];
  return svg(512, 512, defs, `<g clip-path="url(#frame)">${body.join("")}</g>`);
}

export async function buildPeople(keys = Object.keys(PEOPLE)) {
  for (const key of keys) {
    const file = await render(portrait(key), `portraits/${key}.webp`, { quality: 90 });
    // Token: crop on the face (head spans roughly x 150-362, y 60-330).
    await tokenFrom(await sharp(file).png().toBuffer(), `tokens/${key}.webp`, PEOPLE[key].ring, { focus: { left: 96, top: 46, size: 320 } });
  }
}

export async function contactSheet(file) {
  const keys = Object.keys(PEOPLE);
  const tiles = await Promise.all(keys.map(async k => ({ input: await sharp(`assets/portraits/${k}.webp`).resize(256, 256).toBuffer(), left: (keys.indexOf(k) % 6) * 256, top: Math.floor(keys.indexOf(k) / 6) * 256 })));
  await sharp({ create: { width: 256 * 6, height: 512, channels: 3, background: "#222" } }).composite(tiles).png().toFile(file);
}

export { PEOPLE };
