// Le poids de la soie — runtime for Foundry v14 and Breathe and Live 0.6.
// The GM dashboard tracks the finale (Pression, counterweights, valve, captives)
// and the hooks below keep it in sync with what happens on the scene.
const MID = "le-poids-de-la-soie";
const { ApplicationV2, DialogV2 } = foundry.applications.api;

const CAPTIVES = { Hana: "B", Miyo: "B", Kinu: "B", Setsu: "B", Nao: "E", Toki: "E", Yae: "E", Ritsu: "E" };
const ZONES = { B: "Atelier", E: "Magasin", C: "Chaufferie" };
const PRESSURE_TEXT = ["Le réseau est calme.", "Les bracelets vibrent.", "Les genoux plient.", "Les captives peinent à parler.",
  "Chaque captive encore liée subit 2 dégâts à chaque fin de round."];
const DEALS = {
  fumi: ["Fumi a un trajet sûr", "Les libérées rejoignent la cour en fin de round, sans action."],
  gen: ["Procédure de Gen", "Gen présent, sa notice ou les écrous repérés : vanne en 1 action."],
  chiyo: ["Clé de Chiyo", "Retirer un bracelet : 1 action sans jet."],
  tamaki: ["Portail ouvert par Tamaki", "La cour est une sortie. Sinon Force DD 12 ou outils, 1 action."],
};
const SEAL_IMG = `modules/${MID}/assets/items/sceau.webp`;

const defaultState = () => ({
  finale: false, pressure: 0, valve: 0, broken: { B: false, E: false, C: false },
  deals: { fumi: false, gen: false, chiyo: false, tamaki: false },
  captives: Object.fromEntries(Object.keys(CAPTIVES).map(name => [name, "bound"])),
  healRound: null, processedRound: null, alerts: {},
});

/* -------------------------------------------- */
/*  State                                       */
/* -------------------------------------------- */

export function getState() {
  return foundry.utils.mergeObject(defaultState(), game.settings.get(MID, "state") ?? {}, { inplace: false });
}

async function setState(patch) {
  if (!game.user.isGM) throw new Error("Seul le MJ peut modifier l'état du scénario.");
  const next = foundry.utils.mergeObject(getState(), patch, { inplace: false });
  await game.settings.set(MID, "state", next);
  return next;
}

const byKey = key => game.actors.find(a => a.getFlag(MID, "key") === key);
const shigure = () => byKey("shigure");
const mill = () => game.scenes.find(s => s.getFlag(MID, "key") === "filature");
const captiveTokens = () => mill()?.tokens.filter(t => t.getFlag(MID, "captive")) ?? [];
const valveNeeded = state => (state.deals.gen ? 1 : 2);
const isActiveGM = () => game.users.activeGM?.isSelf;

export function networkCut(state = getState()) {
  const hp = shigure()?.system.resources.hp.value;
  return state.broken.C || state.valve >= valveNeeded(state) || (Number.isFinite(hp) && hp <= 0);
}

/** "bound", "freed" (still in the room) or "safe" (evacuated to the yard). */
export function captiveStatus(name, state = getState()) {
  if (state.captives[name] === "safe") return "safe";
  if (state.captives[name] === "freed" || networkCut(state) || state.broken[CAPTIVES[name]]) return "freed";
  return "bound";
}

async function post(content, { gmOnly = false } = {}) {
  return ChatMessage.create({
    content: `<div class="soie-chat">${content}</div>`,
    speaker: { alias: "Le poids de la soie" },
    whisper: gmOnly ? ChatMessage.getWhisperRecipients("GM") : [],
  });
}

/* -------------------------------------------- */
/*  Finale actions                              */
/* -------------------------------------------- */

export async function startFinale() {
  await setState({ finale: true, pressure: 0 });
  await post(`<h3>La pesée des vivants</h3><p><strong>Pression 0/4.</strong> À chaque fin de round où le réseau fonctionne, elle monte d'un cran.
    À 4, chaque captive encore liée subit 2 dégâts par fin de round (6 PV chacune).</p>
    <p>Briser le contrepoids C ou fermer la vanne coupe le réseau. Briser B ou E libère les quatre captives de la zone.</p>`);
  dashboard();
}

export async function endRound() {
  const state = getState();
  if (networkCut(state)) return post(`<p>Fin de round : réseau coupé, la Pression reste à ${state.pressure}/4.</p>`);
  const pressure = Math.min(4, state.pressure + 1);
  await setState({ pressure });
  const lines = [`<p><strong>Pression ${pressure}/4</strong> — ${PRESSURE_TEXT[pressure]}</p>`];
  if (pressure === 4) {
    for (const token of captiveTokens()) {
      const { name } = token.getFlag(MID, "captive");
      const hp = token.actor?.system.resources.hp.value ?? 0;
      if (captiveStatus(name) !== "bound" || hp <= 0) continue;
      const next = Math.max(0, hp - 2);
      await token.actor.update({ "system.resources.hp.value": next });
      lines.push(`<p>${name} (${ZONES[CAPTIVES[name]]}) : ${next} PV${next === 0 ? " — elle ne se relève pas." : ""}</p>`);
    }
  }
  return post(lines.join(""));
}

export async function breakWeight(zone, broken = true) {
  const before = networkCut();
  const state = await setState({ broken: { [zone]: broken } });
  if (!broken) return;
  const cut = !before && networkCut(state);
  await post(zone === "C" || cut
    ? `<p><strong>Le contrepoids de la ${ZONES.C.toLowerCase()} se brise.</strong> Les pulsations s'arrêtent : le réseau est coupé, les huit captives sont libres et Shigure perd ses arts à distance.</p>`
    : `<p><strong>Le contrepoids ${zone} (${ZONES[zone]}) se brise.</strong> Les quatre captives de la zone se relèvent.</p>`);
}

export async function valveAction(delta = 1) {
  const before = networkCut();
  const state = getState();
  const next = await setState({ valve: Math.max(0, Math.min(valveNeeded(state), state.valve + delta)) });
  if (!before && networkCut(next)) await post("<p><strong>La vanne générale se ferme.</strong> La vapeur retombe : le réseau est coupé, les huit captives sont libres et Shigure perd ses arts à distance.</p>");
}

export async function setCaptive(name, status) {
  await setState({ captives: { [name]: status } });
}

export async function healShigure() {
  const demon = shigure();
  if (!demon) return ui.notifications.warn("Shigure n'est pas dans le monde : importez l'aventure.");
  const state = getState();
  const roundKey = game.combat ? `${game.combat.id}:${game.combat.round}` : null;
  if (roundKey && state.healRound === roundKey) return ui.notifications.warn("Rééquilibrage déjà utilisé ce round.");
  const { hp, bdp } = demon.system.resources;
  if (bdp.value < 2) return ui.notifications.warn("Shigure n'a plus assez de BDP (2 requis).");
  const roll = await new Roll("1d8").evaluate();
  const next = Math.min(hp.max, hp.value + roll.total);
  await demon.update({ "system.resources.hp.value": next, "system.resources.bdp.value": bdp.value - 2 });
  await roll.toMessage({ speaker: ChatMessage.getSpeaker({ actor: demon }), flavor: `Rééquilibrage : +${next - hp.value} PV (2 BDP). Une fois par round.` });
  await setState({ healRound: roundKey });
}

export async function toggleSeal(tokens = [...game.user.targets]) {
  if (!tokens.length) tokens = canvas.tokens?.controlled ?? [];
  if (!tokens.length) return ui.notifications.warn("Ciblez ou sélectionnez le token touché par le Sceau de charge.");
  for (const token of tokens) {
    const actor = token.actor;
    if (!actor) continue;
    const seal = actor.effects.find(e => e.getFlag(MID, "seal"));
    if (seal) {
      await seal.delete();
      await post(`<p>${token.name} se libère du Sceau de charge.</p>`);
    } else {
      await actor.createEmbeddedDocuments("ActiveEffect", [{
        name: "Sceau de charge", img: SEAL_IMG, description: "<p>Déplacement réduit à 3 m. Retrait : 1 action (soi-même ou un allié).</p>",
        system: { changes: [{ key: "system.combat.actionEconomy.movementMeters", type: "override", value: 3 }] },
        flags: { [MID]: { seal: true } },
      }]);
      await post(`<p><strong>${token.name}</strong> est marqué du Sceau de charge : déplacement 3 m jusqu'à ce qu'on le retire (1 action).</p>`);
    }
  }
}

export async function announce() {
  const state = getState();
  const free = Object.keys(CAPTIVES).filter(n => captiveStatus(n, state) !== "bound");
  await post(`<p><strong>Pression ${state.pressure}/4</strong> — ${networkCut(state) ? "réseau coupé" : PRESSURE_TEXT[state.pressure]}</p>
    <p>Captives libres : ${free.length ? free.join(", ") : "aucune"}.</p>`);
}

export async function reset() {
  const ok = await DialogV2.confirm({ window: { title: "Réinitialiser le scénario" },
    content: "<p>Remettre la Pression à 0, réparer les contrepoids, rendre leurs PV aux captives et retirer les sceaux ?</p>" });
  if (!ok) return;
  await game.settings.set(MID, "state", defaultState());
  for (const actor of game.actors.filter(a => a.getFlag(MID, "weight"))) await actor.update({ "system.resources.hp.value": 12 });
  for (const token of captiveTokens()) await token.actor?.update({ "system.resources.hp.value": 6 });
  for (const actor of game.actors) {
    const seals = actor.effects.filter(e => e.getFlag(MID, "seal")).map(e => e.id);
    if (seals.length) await actor.deleteEmbeddedDocuments("ActiveEffect", seals);
  }
  ui.notifications.info("Le poids de la soie : état réinitialisé.");
}

/** Shigure's two ranged arts become passive (chat text only) while the network is cut. */
async function syncNetworkArts() {
  const demon = shigure();
  if (!demon || !isActiveGM()) return;
  const cut = networkCut();
  const updates = [];
  for (const item of demon.items.filter(i => i.getFlag(MID, "networkArt"))) {
    const disabled = item.system.activation === "passive";
    if (cut && !disabled) updates.push({ _id: item.id, "system.activation": "passive", [`flags.${MID}.description`]: item.system.description,
      "system.description": `<p><strong>Réseau coupé :</strong> ${item.name} est inutilisable pour le reste de la soirée.</p>` });
    else if (!cut && disabled) updates.push({ _id: item.id, "system.activation": "action", "system.description": item.getFlag(MID, "description") ?? item.system.description });
  }
  if (updates.length) await demon.updateEmbeddedDocuments("Item", updates);
}

/* -------------------------------------------- */
/*  Documents and handouts                      */
/* -------------------------------------------- */

const journal = key => game.journal.find(j => j.getFlag(MID, "key") === key);

export async function openImporter() {
  const pack = game.packs.get(`${MID}.aventure`);
  const [adventure] = (await pack?.getDocuments()) ?? [];
  if (!adventure) return ui.notifications.error("Compendium de l'aventure introuvable.");
  return adventure.sheet.render({ force: true });
}

export function openGuide() {
  const guide = journal("guide");
  if (!guide) return openImporter();
  return guide.sheet.render({ force: true });
}

export async function showHandout(key) {
  const entry = journal("handouts");
  if (!entry) return ui.notifications.warn("Importez d'abord l'aventure.");
  const pages = entry.pages.contents.sort((a, b) => a.sort - b.sort);
  if (!key) {
    key = await DialogV2.prompt({
      window: { title: "Montrer une pièce aux joueurs" },
      content: `<select name="page" autofocus>${pages.map(p => `<option value="${p.getFlag(MID, "key")}">${p.name}</option>`).join("")}</select>
        ${pages.map(p => `<p class="hint"><strong>${p.name}</strong> : ${p.getFlag(MID, "gmNote") ?? ""}</p>`).join("")}`,
      ok: { label: "Montrer", callback: (event, button) => button.form.elements.page.value },
      rejectClose: false,
    });
    if (!key) return;
  }
  const page = pages.find(p => p.getFlag(MID, "key") === key);
  if (!page) return;
  const popout = new foundry.applications.apps.ImagePopout({ src: page.src, caption: page.image?.caption, window: { title: page.name } });
  await popout.render({ force: true });
  return popout.shareImage();
}

/* -------------------------------------------- */
/*  Dashboard                                   */
/* -------------------------------------------- */

class SoieDashboard extends ApplicationV2 {
  static DEFAULT_OPTIONS = {
    id: "soie-dashboard",
    classes: ["soie-dashboard"],
    window: { title: "Le poids de la soie — tableau de bord", icon: "fas fa-scale-balanced", resizable: true },
    position: { width: 560, height: "auto" },
    actions: {
      finale: () => startFinale(),
      endRound: () => endRound(),
      pressure: (event, target) => setState({ pressure: Number(target.dataset.value) }),
      valve: (event, target) => valveAction(Number(target.dataset.delta)),
      captive: (event, target) => setCaptive(target.dataset.name, target.dataset.status),
      heal: () => healShigure(),
      seal: () => toggleSeal(),
      announce: () => announce(),
      handout: () => showHandout(),
      guide: () => openGuide(),
      reset: () => reset(),
    },
  };

  async _renderHTML() {
    const state = getState();
    const cut = networkCut(state);
    const weights = game.actors.filter(a => a.getFlag(MID, "weight"));
    const demon = shigure();
    const tokens = Object.fromEntries(captiveTokens().map(t => [t.getFlag(MID, "captive").name, t]));
    const STATUS = { bound: "Liée", freed: "Libre", safe: "En sécurité" };
    const pressure = [0, 1, 2, 3, 4].map(v => `<button type="button" data-action="pressure" data-value="${v}" class="${v <= state.pressure ? "on" : ""}" title="${PRESSURE_TEXT[v]}">${v}</button>`).join("");
    const valve = Array.from({ length: valveNeeded(state) }, (_, i) => `<span class="dot ${i < state.valve ? "on" : ""}"></span>`).join("");
    const html = `
      <header class="soie-dash-status">
        <span class="badge ${state.finale ? "on" : ""}">${state.finale ? "Final en cours" : "Final non démarré"}</span>
        <span class="badge ${cut ? "ok" : "danger"}">${cut ? "Réseau coupé" : "Réseau actif"}</span>
        ${state.finale ? "" : `<button type="button" data-action="finale"><i class="fas fa-play"></i> Démarrer le final</button>`}
      </header>
      <section><h3>Pression</h3>
        <div class="soie-pressure">${pressure}<button type="button" data-action="endRound" title="La fin de round est automatique en combat une fois le final démarré."><i class="fas fa-forward-step"></i> Fin de round</button></div>
        <p class="hint">${cut ? "Réseau coupé : la jauge est figée, plus aucun dégât." : PRESSURE_TEXT[state.pressure]}</p>
      </section>
      <section><h3>Contrepoids</h3><div class="soie-grid">
        ${weights.map(a => { const zone = a.getFlag(MID, "weight"); const hp = a.system.resources.hp;
          return `<label class="soie-card ${state.broken[zone] ? "done" : ""}"><input type="checkbox" data-weight="${zone}" ${state.broken[zone] ? "checked" : ""}>
            <strong>${zone} · ${ZONES[zone]}</strong><span>${hp.value}/${hp.max} PV</span></label>`; }).join("") || "<p class='hint'>Contrepoids non importés.</p>"}
      </div>
      <div class="soie-row"><strong>Vanne générale</strong> ${valve} <span>${Math.min(state.valve, valveNeeded(state))}/${valveNeeded(state)} action(s)</span>
        <button type="button" data-action="valve" data-delta="1">+1 action</button><button type="button" data-action="valve" data-delta="-1" title="Annuler">−</button></div>
      </section>
      <section><h3>Engagements (scène 3)</h3><div class="soie-deals">
        ${Object.entries(DEALS).map(([key, [label, hint]]) => `<label title="${hint}"><input type="checkbox" data-deal="${key}" ${state.deals[key] ? "checked" : ""}> ${label}</label>`).join("")}
      </div></section>
      <section><h3>Captives</h3><table class="soie-captives"><tbody>
        ${Object.entries(CAPTIVES).map(([name, zone]) => { const status = captiveStatus(name, state); const hp = tokens[name]?.actor?.system.resources.hp.value;
          return `<tr class="${status}"><td>${name}</td><td>${zone}</td><td>${hp ?? "—"} PV</td><td>${STATUS[status]}</td><td>
            ${status === "bound" ? `<button type="button" data-action="captive" data-name="${name}" data-status="freed" title="${state.deals.chiyo ? "1 action, sans jet (clé)" : "Finesse DD 12 avec un outil"}">Retirer le bracelet</button>` : ""}
            ${status === "freed" ? `<button type="button" data-action="captive" data-name="${name}" data-status="safe">Évacuée</button>` : ""}
            ${status === "safe" ? `<button type="button" data-action="captive" data-name="${name}" data-status="bound" title="Annuler">↺</button>` : ""}</td></tr>`; }).join("")}
      </tbody></table></section>
      <section><h3>Shigure</h3>
        ${demon ? `<div class="soie-row"><span>${demon.system.resources.hp.value}/${demon.system.resources.hp.max} PV · ${demon.system.resources.bdp.value} BDP · ${demon.system.resources.rp.value} RP</span>
          <button type="button" data-action="heal"><i class="fas fa-heart-pulse"></i> Rééquilibrage (1d8)</button>
          <button type="button" data-action="seal"><i class="fas fa-anchor"></i> Sceau sur les cibles</button></div>` : "<p class='hint'>Shigure n'est pas importé.</p>"}
      </section>
      <footer class="soie-row">
        <button type="button" data-action="announce"><i class="fas fa-bullhorn"></i> Annoncer</button>
        <button type="button" data-action="handout"><i class="fas fa-scroll"></i> Pièce à montrer</button>
        <button type="button" data-action="guide"><i class="fas fa-book"></i> Guide</button>
        <button type="button" data-action="reset"><i class="fas fa-rotate-left"></i> Réinitialiser</button>
      </footer>`;
    const div = document.createElement("div");
    div.className = "soie-dash";
    div.innerHTML = html;
    return div;
  }

  _replaceHTML(result, content) {
    content.replaceChildren(result);
  }

  _onRender(context, options) {
    super._onRender?.(context, options);
    for (const input of this.element.querySelectorAll("input[data-weight]")) input.addEventListener("change", () => breakWeight(input.dataset.weight, input.checked));
    for (const input of this.element.querySelectorAll("input[data-deal]")) input.addEventListener("change", () => setState({ deals: { [input.dataset.deal]: input.checked } }));
  }
}

let dashboardApp;
export function dashboard() {
  if (!game.user.isGM) return ui.notifications.warn("Le tableau de bord est réservé au MJ.");
  dashboardApp ??= new SoieDashboard();
  return dashboardApp.render({ force: true });
}
const refresh = foundry.utils.debounce(() => { if (dashboardApp?.rendered) dashboardApp.render(); }, 100);

class DashboardMenu extends ApplicationV2 {
  async render() { dashboard(); return this; }
}

/* -------------------------------------------- */
/*  Hooks                                       */
/* -------------------------------------------- */

const ACTIONS = { dashboard, finale: startFinale, seal: () => toggleSeal(), heal: healShigure, guide: openGuide, import: openImporter, handout: () => showHandout() };

Hooks.once("init", () => {
  game.settings.register(MID, "state", { scope: "world", config: false, type: Object, default: defaultState(),
    onChange: () => { refresh(); syncNetworkArts(); } });
  game.settings.register(MID, "welcomeVersion", { scope: "world", config: false, type: String, default: "" });
  game.settings.registerMenu(MID, "dashboard", { name: "Tableau de bord du scénario", label: "Ouvrir", hint: "Pression, contrepoids, vanne, captives et Shigure.",
    icon: "fas fa-scale-balanced", type: DashboardMenu, restricted: true });

  // @Soie[action]{label} in journals becomes a GM action link.
  CONFIG.TextEditor.enrichers.push({
    pattern: /@Soie\[(\w+)\]\{([^}]+)\}/g,
    enricher: match => {
      const link = document.createElement("a");
      link.className = "soie-action";
      link.dataset.soieAction = match[1];
      link.innerHTML = `<i class="fas fa-scale-balanced"></i> ${foundry.utils.escapeHTML(match[2])}`;
      return link;
    },
  });
  document.addEventListener("click", event => {
    const link = event.target.closest?.("a.soie-action");
    if (!link) return;
    event.preventDefault();
    if (!game.user.isGM) return ui.notifications.warn("Action réservée au MJ.");
    ACTIONS[link.dataset.soieAction]?.();
  });
});

Hooks.once("ready", async () => {
  game.modules.get(MID).api = { dashboard, getState, networkCut, captiveStatus, startFinale, endRound, breakWeight, valveAction,
    setCaptive, healShigure, toggleSeal, announce, reset, showHandout, openGuide, openImporter };
  if (!isActiveGM()) return;
  const version = game.modules.get(MID).version;
  if (game.settings.get(MID, "welcomeVersion") === version) return;
  await game.settings.set(MID, "welcomeVersion", version);
  if (mill()) return ui.notifications.info(`Le poids de la soie ${version} est prêt. Macro « Soie · Tableau de bord » pour le final.`);
  const go = await DialogV2.confirm({
    window: { title: "Le poids de la soie" },
    content: `<p>Importer l'aventure maintenant ? Tout sera rangé dans un dossier « Le poids de la soie » (acteurs, objets, journaux, scène, macros).</p>`,
    yes: { label: "Importer" }, no: { label: "Plus tard" }, rejectClose: false,
  });
  if (go) openImporter();
});

Hooks.on("updateCombat", (combat, changed, options) => {
  if (!isActiveGM() || !("round" in changed) || changed.round < 2 || options.direction === -1) return;
  const state = getState();
  if (!state.finale || combat.scene?.id !== mill()?.id) return;
  const key = `${combat.id}:${changed.round}`;
  if (state.processedRound === key) return;
  setState({ processedRound: key }).then(() => endRound());
});

Hooks.on("updateActor", async (actor, changed) => {
  refresh();
  if (!isActiveGM() || !foundry.utils.hasProperty(changed, "system.resources.hp.value")) return;
  const hp = actor.system.resources.hp.value;
  const zone = actor.getFlag(MID, "weight");
  if (zone && hp <= 0 && !getState().broken[zone]) return breakWeight(zone);
  if (actor.getFlag(MID, "key") !== "shigure") return;
  const state = getState();
  const once = async (key, html, gmOnly = true) => {
    if (state.alerts[key]) return;
    await setState({ alerts: { [key]: true } });
    await post(html, { gmOnly });
  };
  if (hp <= 0) {
    await once("dead", "<p>Shigure essaie de ramasser ses poids, mais ses doigts tombent en poussière avant de les atteindre. <strong>Le réseau se dissipe.</strong></p>", false);
    return syncNetworkArts();
  }
  if (hp <= 25 && networkCut(state)) await once("flee", "<p><strong>Shigure (≤ 25 PV, réseau coupé) tente de fuir :</strong> il gagne le quai, ouvre les volets (1 action), puis saute à son tour suivant (1 action). Les PJ voient son intention.</p>");
  else if (hp <= 60) await once("sixty", "<p><strong>Shigure (≤ 60 PV) :</strong> son tablier craque, des marques de poids apparaissent sur sa peau. Il accuse les ouvrières de coûter trop cher et propose de livrer Tamaki. Aucun bonus.</p>");
});

for (const hook of ["updateToken", "createActiveEffect", "deleteActiveEffect"]) Hooks.on(hook, () => refresh());
