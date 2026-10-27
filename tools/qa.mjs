// End-to-end check on a disposable Foundry v14 world (soie-qa) with Breathe and Live 0.6.
// Start the server first:  node C:/FoundryVTT-Node-14/main.mjs --dataPath=<repo>/.qa
import fs from "node:fs";
import { chromium } from "playwright";

const URL = process.env.FOUNDRY_QA_URL || "http://localhost:30017";
const MID = "le-poids-de-la-soie";
fs.mkdirSync("test-results", { recursive: true });
const browser = await chromium.launch({ headless: true, channel: process.platform === "win32" ? "msedge" : undefined, args: ["--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const errors = [];
page.on("pageerror", e => errors.push(e.message));
page.on("console", m => { if (m.type() === "error" && !/favicon|Failed to load resource|hardware acceleration|WebGL/.test(m.text())) errors.push(m.text()); });

async function join() {
  await page.goto(URL, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => globalThis.game?.ready || document.querySelector("input[name=username], select[name=userid]"), null, { timeout: 120000 });
  if (await page.locator("input[name=username]").count()) await page.locator("input[name=username]").fill("Gamemaster");
  else if (await page.locator("select[name=userid]").count()) await page.locator("select[name=userid]").selectOption({ label: "Gamemaster" });
  if (await page.locator("button[name=join]").count()) await page.locator("button[name=join]").click();
  await page.waitForFunction(() => game.ready && !canvas.loading, null, { timeout: 180000 });
}

try {
  await join();
  if (await page.evaluate(() => game.world.id) !== "soie-qa") throw new Error("Monde QA « soie-qa » requis");
  if (!await page.evaluate(m => game.modules.get(m)?.active, MID)) {
    await page.evaluate(async m => game.settings.set("core", "moduleConfiguration", { ...game.settings.get("core", "moduleConfiguration"), [m]: true }), MID);
    await page.waitForTimeout(3000);
    await join();
  }
  const report = await page.evaluate(async MID => {
    const checks = [];
    const check = (label, ok, detail = "") => { if (!ok) throw new Error(`ÉCHEC : ${label} ${detail}`); checks.push(label); };
    const info = { version: game.version, system: game.system.version, module: game.modules.get(MID).version };
    check("Foundry 14.368", game.version === "14.368");
    check("Breathe and Live 0.6.0", game.system.version === "0.6.0");

    // Clean previous imports so the run is repeatable.
    for (const coll of [game.combats, game.scenes, game.actors, game.items, game.journal, game.macros]) {
      const ids = coll.filter(d => d.getFlag(MID, "key") || d.combatants).map(d => d.id);
      if (ids.length) await coll.documentClass.deleteDocuments(ids);
    }
    const folderIds = game.folders.filter(f => f.name === "Le poids de la soie" || f.folder?.name === "Le poids de la soie").map(f => f.id);
    if (folderIds.length) await Folder.deleteDocuments(folderIds);
    await game.settings.set(MID, "state", {});

    const pack = game.packs.get(`${MID}.aventure`);
    check("Compendium Adventure présent", pack?.documentName === "Adventure");
    const [adventure] = await pack.getDocuments();
    check("Adventure valide", adventure && !adventure.invalid);
    await adventure.import({ dialog: false });
    await new Promise(r => setTimeout(r, 1500));

    // Every section is filed under a "Le poids de la soie" folder.
    for (const type of ["Actor", "Item", "JournalEntry", "Scene", "Macro"]) {
      const root = game.folders.find(f => f.type === type && f.name === "Le poids de la soie" && !f.folder);
      check(`Dossier racine ${type}`, !!root);
      const coll = game.collections.get(type);
      const docs = coll.filter(d => d.getFlag(MID, "key"));
      const inside = d => { let f = d.folder; while (f) { if (f.id === root.id) return true; f = f.folder; } return false; };
      check(`Tous les ${type} dans le dossier (${docs.length})`, docs.length > 0 && docs.every(inside), docs.filter(d => !inside(d)).map(d => d.name).join(", "));
    }
    const invalid = [...game.actors, ...game.items, ...game.journal, ...game.scenes, ...game.macros].filter(d => d.invalid);
    check("Aucun document invalide", invalid.length === 0, invalid.map(d => d.name).join(", "));

    // Pregens: system-derived resources match the scenario sheets.
    const expected = { aoi: [23, 9, 14], daigo: [24, 8, 12], ren: [21, 12, 15], sayo: [22, 10, 10], isamu: [22, 6, 11] };
    const actor = key => game.actors.find(a => a.getFlag(MID, "key") === key);
    for (const [key, [e, rp, ca]] of Object.entries(expected)) {
      const a = actor(key), r = a.system.resources;
      check(`${a.name} : PV 20, E ${e}, RP ${rp}, CA ${ca}`, r.hp.max === 20 && r.e.max === e && r.rp.max === rp && r.ca === ca, JSON.stringify({ hp: r.hp.max, e: r.e.max, rp: r.rp.max, ca: r.ca }));
      check(`${a.name} : souffle et formes`, a.items.filter(i => i.type === "technique").length >= 2 && a.items.some(i => i.type === "breath"));
    }
    const aoi = actor("aoi");
    check("Aoi : Dextérité 8 (talent compris)", aoi.system.stats.effectiveDerived.dexterite === 8, aoi.system.stats.effectiveDerived.dexterite);
    check("Sayo : Médecine 6 (Intelligence supérieure)", actor("sayo").system.stats.effectiveDerived.medecine === 6, actor("sayo").system.stats.effectiveDerived.medecine);
    check("Isamu : Puissance brute 11", actor("isamu").system.stats.effectiveDerived.puissanceBrute === 11, actor("isamu").system.stats.effectiveDerived.puissanceBrute);
    const goro = actor("goro"), shigure = actor("shigure");
    check("Goro : PV 20, CA 14, RP 4, 1 action", goro.system.resources.hp.max === 20 && goro.system.resources.ca === 14 && goro.system.resources.rp.max === 4 && goro.system.combat.actionEconomy.actionsPerTurn === 1,
      JSON.stringify([goro.system.resources.hp.max, goro.system.resources.ca, goro.system.resources.rp.max]));
    check("Shigure : PV 130, CA 16, 70 BDP, 6 RP, 2 actions", shigure.system.resources.hp.max === 130 && shigure.system.resources.ca === 16 && shigure.system.resources.bdp.value === 70 && shigure.system.resources.rp.value === 6 && shigure.system.combat.actionEconomy.actionsPerTurn === 2,
      JSON.stringify([shigure.system.resources.hp.max, shigure.system.resources.ca, shigure.system.resources.bdp.value, shigure.system.resources.rp.value]));
    for (const w of game.actors.filter(a => a.getFlag(MID, "weight"))) check(`${w.name} : CA 10, PV 12`, w.system.resources.ca === 10 && w.system.resources.hp.max === 12);

    // Scene: grid scale, walls, doors, notes and tokens all resolve.
    const scene = game.scenes.find(s => s.getFlag(MID, "key") === "filature");
    check("Fond de carte sur le niveau", scene.levels.contents[0]?.background.src?.endsWith("filature-minase.webp"));
    check("Scène sans marge (murs alignés sur la carte)", scene.padding === 0, scene.padding);
    check("Grille 1,5 m", scene.grid.distance === 1.5 && scene.grid.size === 100);
    check("Murs et portes", scene.walls.size > 20 && scene.walls.filter(w => w.door).length === 9);
    check("Pastilles A-F liées", scene.notes.size === 6 && scene.notes.every(n => n.entry && n.page));
    check("Tokens liés aux acteurs", scene.tokens.size === 22 && scene.tokens.every(t => t.actor), scene.tokens.size);
    check("Huit captives", scene.tokens.filter(t => t.getFlag(MID, "captive")).length === 8);

    // Every image referenced by the imported content exists.
    const paths = new Set([scene.levels.contents[0]?.background.src, scene.thumb, ...game.actors.map(a => a.img), ...game.actors.map(a => a.prototypeToken.texture.src), ...game.items.map(i => i.img),
      ...game.journal.contents.flatMap(j => j.pages.contents.map(p => p.src).filter(Boolean)), ...scene.notes.map(n => n.texture.src), ...game.actors.contents.flatMap(a => a.items.contents.map(i => i.img))].filter(p => /^(modules|systems|icons)\//.test(p ?? "")));
    const missing = [];
    for (const p of paths) if (!(await fetch(p, { method: "HEAD" })).ok) missing.push(p);
    check(`Images présentes (${paths.size})`, missing.length === 0, missing.join(", "));
    const html = game.journal.map(j => j.pages.map(p => p.text?.content ?? "").join("")).join("");
    for (const src of new Set([...html.matchAll(/src="(modules\/[^"]+)"/g)].map(m => m[1]))) check(`Image de journal ${src.split("/").pop()}`, (await fetch(src, { method: "HEAD" })).ok);
    const enriched = await foundry.applications.ux.TextEditor.implementation.enrichHTML(game.journal.find(j => j.getFlag(MID, "key") === "guide").pages.contents[0].text.content);
    check("Liens @Soie enrichis", enriched.includes("soie-action"));
    check("Liens @UUID résolus", !enriched.includes("content-link broken"));

    await scene.activate();
    await scene.view();
    await new Promise(r => setTimeout(r, 2500));
    return { info, checks };
  }, MID);

  // Gameplay automation on the live canvas.
  const play = await page.evaluate(async MID => {
    const checks = [];
    const check = (label, ok, detail = "") => { if (!ok) throw new Error(`ÉCHEC : ${label} ${detail}`); checks.push(label); };
    const api = game.modules.get(MID).api;
    const notes = [];
    for (const k of ["warn", "error"]) { const original = ui.notifications[k].bind(ui.notifications); ui.notifications[k] = (m, ...a) => { notes.push(m); return original(m, ...a); }; }
    const actor = key => game.actors.find(a => a.getFlag(MID, "key") === key);
    const scene = canvas.scene;
    const tok = key => scene.tokens.find(t => t.actor?.getFlag(MID, "key") === key);

    check("Fond de carte chargé sur le canvas", canvas.primary.background?.texture?.valid && canvas.primary.background.texture.width > 1000, canvas.primary.background?.texture?.width);
    check("Carte calée sur la grille", canvas.dimensions.sceneRect.x === 0 && canvas.dimensions.sceneRect.y === 0, JSON.stringify(canvas.dimensions.sceneRect));

    // System rolls: Aoi's katana against Goro and a Water form against Goro.
    const aoi = actor("aoi"), goro = actor("goro"), shigure = actor("shigure");
    await tok("goro").update({ x: tok("aoi").x + 100, y: tok("aoi").y, hidden: false }, { animate: false }); await new Promise(r => setTimeout(r, 500));
    const combat = await Combat.create({ scene: scene.id, active: true });
    await combat.createEmbeddedDocuments("Combatant", ["aoi", "goro", "shigure"].map((k, i) => ({ tokenId: tok(k).id, sceneId: scene.id, actorId: actor(k).id, initiative: 40 - i * 10 })));
    await combat.startCombat();
    const ready = async a => { for (let i = 0; i < 40 && !(a.system.combat.actionEconomy.remainingActions > 0); i++) await new Promise(r => setTimeout(r, 100)); };
    const formulas = res => [res?.attackRoll?.formula, res?.damageRoll?.formula].join(" | ");
    await ready(aoi);
    const slash = await game.system.api.rollBasicAttack(aoi, { item: aoi.items.find(i => i.name.includes("Katana")), targetToken: tok("goro").object, attackMode: "finesse", targetLimb: "" });
    check("Katana d'Aoi : d20 + 7 en combat (Agilité comprise)", /\+ ?7\b/.test(slash?.attackRoll?.formula), `${formulas(slash)} ${JSON.stringify(slash && Object.keys(slash))} ${notes.join(" ; ")} remaining=${aoi.system.combat.actionEconomy.remainingActions}`);
    await combat.nextTurn(); await ready(goro);
    const morsure = goro.items.find(i => i.name.startsWith("Morsure"));
    const bite = await game.system.api.rollBasicAttack(goro, { item: morsure, targetToken: tok("aoi").object, attackMode: "force", targetLimb: "" });
    check("Morsure de Goro : d20 + 5", /\+ ?5\b/.test(bite?.attackRoll?.formula), formulas(bite));
    const hit = await game.system.api.rollBasicAttack(goro, { item: morsure, targetToken: tok("aoi").object, attackMode: "force", targetLimb: "", forceAutoHit: true, free: true });
    check("Morsure de Goro : 1d4 + 2 dégâts", /1d4 ?\+ ?2/.test(hit?.damageRoll?.formula), formulas(hit));
    await combat.nextRound(); await ready(aoi);
    const surface = aoi.items.find(i => i.name === "Surface de l'eau coupée");
    const e0 = aoi.system.resources.e.value;
    tok("goro").object.setTarget(true, { releaseOthers: true });
    await game.system.api.useTechnique(aoi, surface, { controlledToken: tok("aoi").object });
    check("Forme de Souffle : coût en E payé", aoi.system.resources.e.value === e0 - 3, `${e0} -> ${aoi.system.resources.e.value}`);
    const card = game.messages.contents.findLast(m => m.getFlag("breathe-and-live", "card")?.kind === "technique");
    check("Forme de Souffle : carte de réaction", !!card);
    await combat.delete();
    await aoi.update({ "system.resources.e.value": aoi.system.resources.e.max });

    // Finale automation.
    await api.startFinale();
    const final = await Combat.create({ scene: scene.id, active: true });
    await final.createEmbeddedDocuments("Combatant", [{ tokenId: tok("shigure").id, sceneId: scene.id, actorId: shigure.id }]);
    await final.startCombat();
    for (let i = 0; i < 5; i++) { await final.nextRound(); await new Promise(r => setTimeout(r, 400)); }
    const state = api.getState();
    check("Pression à 4 après quatre fins de round", state.pressure === 4, state.pressure);
    const hana = scene.tokens.find(t => t.getFlag(MID, "captive")?.name === "Hana");
    check("Captives liées : 2 dégâts par fin de round à 4", hana.actor.system.resources.hp.value === 2, hana.actor.system.resources.hp.value);
    const poidsB = game.actors.find(a => a.getFlag(MID, "weight") === "B");
    await poidsB.update({ "system.resources.hp.value": 0 });
    await new Promise(r => setTimeout(r, 500));
    check("Poids B à 0 PV : brisé, atelier libéré", api.getState().broken.B && api.captiveStatus("Hana") === "freed" && api.captiveStatus("Nao") === "bound");
    await api.valveAction(1); await api.valveAction(1);
    await new Promise(r => setTimeout(r, 800));
    check("Vanne fermée en 2 actions : réseau coupé", api.networkCut() && api.captiveStatus("Nao") === "freed");
    check("Arts à distance de Shigure désactivés", shigure.items.filter(i => i.getFlag(MID, "networkArt")).every(i => i.system.activation === "passive"));
    const naoHp = scene.tokens.find(t => t.getFlag(MID, "captive")?.name === "Nao").actor.system.resources.hp.value;
    await final.nextRound(); await new Promise(r => setTimeout(r, 400));
    check("Réseau coupé : plus de dégâts", scene.tokens.find(t => t.getFlag(MID, "captive")?.name === "Nao").actor.system.resources.hp.value === naoHp);
    await shigure.update({ "system.resources.hp.value": 50 });
    await api.healShigure();
    check("Rééquilibrage : +1d8 PV, -2 BDP", shigure.system.resources.hp.value > 50 && shigure.system.resources.hp.value <= 58 && shigure.system.resources.bdp.value === 68);
    await api.toggleSeal([tok("aoi").object]);
    check("Sceau de charge : déplacement 3 m", aoi.system.combat.actionEconomy.movementMeters === 3, aoi.system.combat.actionEconomy.movementMeters);
    await api.toggleSeal([tok("aoi").object]);
    check("Sceau retiré : déplacement 9 m", aoi.system.combat.actionEconomy.movementMeters === 9);
    await final.delete();
    await api.dashboard();
    await new Promise(r => setTimeout(r, 800));
    check("Tableau de bord affiché", !!document.querySelector("#soie-dashboard .soie-captives"));
    return { checks };
  }, MID);

  await page.screenshot({ path: "test-results/01-dashboard.png" });
  await page.evaluate(MID => { foundry.applications.instances.get("soie-dashboard")?.close(); game.journal.find(j => j.getFlag(MID, "key") === "guide").sheet.render({ force: true }); }, MID);
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "test-results/02-guide.png" });
  await page.evaluate(MID => { for (const app of [...foundry.applications.instances.values(), ...Object.values(ui.windows)]) if (app.document || app.id === "soie-dashboard") app.close(); game.actors.find(a => a.getFlag(MID, "key") === "sayo").sheet.render({ force: true }); }, MID);
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "test-results/03-sayo.png" });
  await page.evaluate(MID => { for (const app of [...foundry.applications.instances.values(), ...Object.values(ui.windows)]) if (app.document || app.id === "soie-dashboard") app.close(); game.actors.find(a => a.getFlag(MID, "key") === "shigure").sheet.render({ force: true }); }, MID);
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "test-results/04-shigure.png" });
  await page.evaluate(() => { for (const app of [...foundry.applications.instances.values(), ...Object.values(ui.windows)]) if (app.document || app.id === "soie-dashboard") app.close(); canvas.animatePan({ x: 1800, y: 1200, scale: 0.42, duration: 0 }); });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "test-results/05-scene.png" });

  const result = { ...report, gameplay: play.checks, errors };
  fs.writeFileSync("test-results/qa.json", JSON.stringify(result, null, 2));
  console.log(`OK ${report.checks.length + play.checks.length} vérifications`, JSON.stringify(report.info));
  if (errors.length) console.log("Erreurs navigateur :\n" + errors.join("\n"));
} catch (error) {
  await page.screenshot({ path: "test-results/failure.png" }).catch(() => {});
  console.error(error.message);
  if (errors.length) console.error("Erreurs navigateur :\n" + errors.join("\n"));
  process.exitCode = 1;
} finally {
  await browser.close();
}
