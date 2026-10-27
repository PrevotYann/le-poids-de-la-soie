// Offline release gate: artwork sizes, preserved handouts and actual pack paths.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import sharp from "sharp";
import { ClassicLevel } from "classic-level";
import { GRID, MAP, DOORS, wallSegments } from "../src/layout.mjs";

const json = file => JSON.parse(fs.readFileSync(file, "utf8"));
const manifest = json("module.json");
const dimensions = json("tools/art/dimensions.json");
const files = fs.readdirSync("assets", { recursive: true }).filter(f => f.endsWith(".webp")).map(f => f.replaceAll("\\", "/"));
assert.deepEqual(files.sort(), Object.keys(dimensions).sort(), "Inventaire des images modifié");
for (const [file, expected] of Object.entries(dimensions)) {
  const actual = await sharp(`assets/${file}`).metadata();
  for (const key of ["width", "height", "hasAlpha"]) assert.equal(actual[key], expected[key], `${file} : ${key}`);
  if (file.startsWith("tokens/")) {
    const { data, info } = await sharp(`assets/${file}`).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    assert.equal(data[3], 0, `${file} : coin transparent requis`);
    assert.equal(data[((info.height / 2 * info.width + info.width / 2) * 4) + 3], 255, `${file} : centre opaque requis`);
  }
}
for (const [file, expected] of Object.entries(json("tools/art/preserved.json"))) {
  assert.equal(crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex"), expected, `${file} devait rester inchangé`);
}

const pack = manifest.packs.find(p => p.type === "Adventure");
// ClassicLevel recovers logs and rewrites its manifest even when only reading.
// Inspect a disposable copy so validation never changes the shipped compendium.
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "soie-pack-"));
const db = new ClassicLevel(scratch, { valueEncoding: "json", createIfMissing: false });
let adventures;
try {
  fs.cpSync(pack.path, scratch, { recursive: true, filter: src => !/(^|[\\/])(LOCK|LOG|LOG\.old)$/.test(src) });
  await db.open();
  adventures = (await db.iterator().all()).filter(([key]) => key.startsWith("!adventures!")).map(([, value]) => value);
} finally {
  try { await db.close(); } finally {
    assert.equal(path.dirname(scratch), path.resolve(os.tmpdir()));
    assert.ok(path.basename(scratch).startsWith("soie-pack-"));
    fs.rmSync(scratch, { recursive: true, force: true });
  }
}
assert.equal(adventures.length, 1);
const [adventure] = adventures;
assert.equal(adventure.flags[manifest.id].version, manifest.version, "Reconstruire le compendium pour cette version");
const prefix = `modules/${manifest.id}/`;
const paths = new Set();
function walk(node) {
  if (typeof node === "string") {
    for (const match of node.matchAll(/modules\/le-poids-de-la-soie\/(?:assets|resources)\/[^\s"'<>]+/g)) paths.add(match[0]);
  } else if (node && typeof node === "object") Object.values(node).forEach(walk);
}
walk(adventure);
walk(manifest);
for (const file of paths) assert.ok(fs.existsSync(file.slice(prefix.length)), `Référence absente : ${file}`);
const asset = file => `${prefix}assets/${file}`;
assert.equal(adventure.actors.length, 15);
for (const actor of adventure.actors) {
  const key = actor.flags[manifest.id].key;
  assert.equal(actor.img, asset(`portraits/${key}.webp`));
  assert.equal(actor.prototypeToken.texture.src, asset(`tokens/${key}.webp`));
}
assert.equal(adventure.img, asset("art/cover.webp"));
assert.equal(adventure.scenes.length, 1);
const [scene] = adventure.scenes;
assert.equal(scene.width, MAP.w * GRID);
assert.equal(scene.height, MAP.h * GRID);
assert.equal(scene.padding, 0);
assert.equal(scene.grid.size, GRID);
assert.equal(scene.grid.distance, 1.5);
assert.equal(scene.levels[0].background.src, asset("maps/filature-minase.webp"));
assert.equal(scene.thumb, asset("maps/filature-minase-thumb.webp"));
assert.deepEqual(scene.walls.map(w => w.c), [...wallSegments(), ...DOORS.map(d => d.c)].map(c => c.map(v => v * GRID)));
assert.equal(scene.tokens.length, 22);
for (const token of scene.tokens) {
  const actor = adventure.actors.find(a => a._id === token.actorId);
  assert.ok(actor, `Acteur du token absent : ${token.name}`);
  assert.equal(token.texture.src, actor.prototypeToken.texture.src);
}
for (const file of files) assert.ok(paths.has(asset(file)), `Image inutilisée dans le module : ${file}`);
console.log(`${files.length} images : dimensions et alpha conservés ; ${paths.size} références présentes ; 15 acteurs et scène alignée ; handouts inchangés`);
