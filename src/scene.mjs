// The Minase mill battlemap: walls and doors from src/layout.mjs, lights, zone
// pins linked to the journal and the starting tokens.
import { stableId } from "../tools/lib/system-catalog.mjs";
import { GRID, MAP, ZONES, DOORS, POI, wallSegments } from "./layout.mjs";
import { MID, PREGENS, WEIGHTS } from "./actors.mjs";
import { ZONE_PAGE } from "./journals.mjs";

const ART = `modules/${MID}/assets`;
const px = v => Math.round(v * GRID);
const NORMAL = 20;

export const SCENE_ID = "soiscene00000001";
const LEVEL_ID = "defaultLevel0000";
export const CAPTIVES = [
  ["Hana", "B", 16.5, 6.5], ["Miyo", "B", 18.5, 7.5], ["Kinu", "B", 20.5, 7.5], ["Setsu", "B", 22.5, 6.5],
  ["Nao", "E", 16.5, 17.5], ["Toki", "E", 18.5, 16.5], ["Yae", "E", 20.5, 16.5], ["Ritsu", "E", 22.5, 17.5],
];

function tokenAt(key, actor, [cx, cy], extra = {}) {
  const proto = actor.prototypeToken;
  return {
    _id: stableId("token:" + key), actorId: actor._id, x: px(cx - 0.5), y: px(cy - 0.5), width: 1, height: 1,
    name: proto.name, texture: proto.texture, actorLink: proto.actorLink, disposition: proto.disposition,
    displayName: proto.displayName, displayBars: proto.displayBars, bar1: proto.bar1, bar2: proto.bar2,
    sight: proto.sight, lockRotation: true, hidden: false, ...extra,
  };
}

function light(key, [cx, cy], bright, dim, color, animation = null, alpha = 0.45) {
  return { _id: stableId("light:" + key), x: px(cx), y: px(cy), config: { bright, dim, color, alpha, animation: animation ? { type: animation, speed: 3, intensity: 3 } : { type: null } } };
}

export function buildScene(actors) {
  const byKey = Object.fromEntries([...actors.pregens, ...actors.npcs, ...actors.demons, ...actors.mechanisms].map(a => [a.flags[MID].key, a]));
  const walls = [
    ...wallSegments().map(c => ({ _id: stableId("wall:" + c.join(",")), c: c.map(px), move: NORMAL, sight: NORMAL, light: NORMAL, sound: NORMAL, door: 0, ds: 0 })),
    ...DOORS.map(d => ({ _id: stableId("door:" + d.key), c: d.c.map(px), move: NORMAL, sight: NORMAL, light: NORMAL, sound: NORMAL, door: 1, ds: d.state === "locked" ? 2 : 0 })),
  ];
  const lights = [
    light("cour1", [4.2, 4.2], 3, 9, "#ffb766", "torch"), light("cour2", [11.8, 10.8], 3, 9, "#ffb766", "torch"),
    light("atelier1", [16, 4], 4, 10, "#ffd9a0"), light("atelier2", [22, 9], 4, 10, "#ffd9a0"),
    light("foyer", POI.boiler, 4, 12, "#ff7b2e", "fire", 0.6),
    light("bureau", [6.5, 15], 3, 9, "#ffd28a", "torch"),
    light("magasin1", [16, 15], 3, 9, "#ffd9a0"), light("magasin2", [22, 21], 3, 9, "#ffd9a0"),
    light("quai", [27, 14], 3, 9, "#bcd2ff"), light("riviere", [34.5, 18], 2, 8, "#8fb4ff", null, 0.25),
  ];
  const notes = Object.entries(ZONES).map(([key, z]) => ({
    _id: stableId("note:" + key), ...ZONE_PAGE(key), x: px(z.x0 + 1.2), y: px(z.y0 + 1.2),
    texture: { src: `${ART}/icons/zone-${key.toLowerCase()}.webp` }, iconSize: 64, text: `${key} · ${z.name}`, fontSize: 28, textAnchor: 1, global: false,
  }));
  const tokens = [
    ...PREGENS.map((p, i) => tokenAt(p.key, byKey[p.key], [1.5, 4.5 + i])),
    tokenAt("tamaki", byKey.tamaki, [4.5, 6.5]),
    tokenAt("fumi", byKey.fumi, [5.5, 7.5]),
    tokenAt("chiyo", byKey.chiyo, POI.infirmary),
    tokenAt("gen", byKey.gen, [28.5, 6.5]),
    tokenAt("goro", byKey.goro, [1.5, 20.5], { hidden: true }),
    tokenAt("shigure", byKey.shigure, [30.5, 18.5], { hidden: true }),
    ...WEIGHTS.map(w => tokenAt(w.key, byKey[w.key], { B: POI.weightB, E: POI.weightE, C: POI.weightC }[w.zone])),
    ...CAPTIVES.map(([name, zone, cx, cy]) => tokenAt("captive:" + name, byKey.captive, [cx, cy],
      { name, flags: { [MID]: { captive: { name, zone } } } })),
  ];
  return {
    _id: SCENE_ID, name: "Filature Minase", navigation: true, navName: "Filature Minase",
    // Foundry 14 keeps the background on the scene's Level; v14's default level id keeps placeables attached.
    levels: [{ _id: LEVEL_ID, name: "Rez-de-chaussée", elevation: { bottom: 0, top: null },
      background: { src: `${ART}/maps/filature-minase.webp`, color: "#11181b" }, textures: { fit: "fill" } }],
    initialLevel: LEVEL_ID,
    thumb: `${ART}/maps/filature-minase-thumb.webp`,
    // No padding: placeable coordinates then match the painted map pixel for pixel.
    width: px(MAP.w), height: px(MAP.h), padding: 0,
    initial: { x: px(MAP.w / 2), y: px(MAP.h / 2), scale: 0.45 },
    grid: { type: 1, size: GRID, distance: 1.5, units: "m", color: "#000000", alpha: 0.15 },
    tokenVision: true,
    fog: { exploration: false },
    environment: { darknessLevel: 0.55, globalLight: { enabled: false } },
    walls, lights, notes, tokens,
    flags: { [MID]: { key: "filature" } },
  };
}

export function buildMacros(journals) {
  const api = `game.modules.get("${MID}")?.api`;
  const macro = (key, name, img, command) => ({ _id: stableId("macro:" + key), name, type: "script", scope: "global", img, command, flags: { [MID]: { key } } });
  return [
    macro("dashboard", "Soie · Tableau de bord", "icons/tools/scribal/ink-quill-pink.webp", `${api}.dashboard();`),
    macro("guide", "Soie · Guide du MJ", "icons/sundries/books/book-red-exclamation.webp", `${api}.openGuide();`),
    macro("handout", "Soie · Montrer une pièce", "icons/sundries/scrolls/scroll-rolled-white.webp", `${api}.showHandout();`),
    macro("seal", "Soie · Sceau de charge (cibles)", "icons/magic/symbols/runes-star-pentagon-orange.webp", `${api}.toggleSeal();`),
  ];
}
