// Pregens, NPCs and the three counterweights. Values follow the scenario PDF;
// talent bonuses (+6 Dextérité, +3 Intellect…) are NOT baked into the derived
// stats because Breathe and Live 0.6 adds them from the embedded talent items.
import { stableId } from "../tools/lib/system-catalog.mjs";

export const MID = "le-poids-de-la-soie";
const ART = `modules/${MID}/assets`;
const DERIVED = ["athletisme", "puissanceBrute", "dexterite", "equilibre", "precision", "mithridatisme", "endurance", "tolerance",
  "reflexes", "agilite", "rapidite", "ruse", "tromperie", "performance", "intimidation", "perception", "intuition",
  "medecine", "nature", "sciences", "enquete", "survie"];
const derived = values => Object.fromEntries(DERIVED.map((key, i) => [key, values[i] ?? 0]));
const BREATH_KEYS = ["sun", "moon", "flame", "water", "wind", "thunder", "stone", "flower", "mist", "serpent", "sound", "insect", "love", "beast", "ocean", "west", "snow", "custom"];

function token(key, name, { linked = false, disposition = -1, sight = 0, bar2 = "resources.e" } = {}) {
  return {
    name,
    texture: { src: `${ART}/tokens/${key}.webp` },
    actorLink: linked,
    disposition,
    displayName: 30,
    displayBars: 40,
    bar1: { attribute: "resources.hp" },
    bar2: { attribute: bar2 },
    sight: { enabled: sight > 0, range: sight },
    lockRotation: true,
  };
}

const PREGENS = [
  {
    key: "aoi", id: "soi01slayer00001", name: "Aoi Kawatani", breath: "water", breathName: "Souffle de l'Eau",
    age: "22 ans", sex: "Femme", role: "Éclaireuse et secouriste de terrain",
    base: { force: 2, finesse: 5, courage: 3, vitesse: 4, social: 1, intellect: 0 },
    derived: [2, 0, 2, 1, 2, 1, 2, 0, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    talents: ["Agilité et souplesse accrues", "Force physique accrue"], senses: ["Sens olfactif — niveau 1", "Sens auditif — niveau 1"],
    forms: ["Surface de l'eau coupée", "Goutte de pluie perçante", "Éclaboussure d'eau"],
    trainer: "Ona, ancienne pourfendeuse et passeuse ; un fil bleu cousu dans la manche.",
    crow: "Sumi", crowNote: "Sumi annonce la météo comme un ordre militaire. Il vous adore ; c'est un jeune corbeau.",
    kit: "Corde de 9 m",
  },
  {
    key: "daigo", id: "soi02slayer00001", name: "Daigo Aramaki", breath: "flame", breathName: "Souffle de la Flamme",
    age: "26 ans", sex: "Homme", role: "Protecteur et combattant au contact",
    base: { force: 5, finesse: 3, courage: 4, vitesse: 2, social: 0, intellect: 1 },
    derived: [2, 3, 1, 1, 1, 1, 2, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    talents: ["Agilité et souplesse accrues", "Force physique accrue", "Connaissances médicales", "Esprit"], senses: ["Sens auditif — niveau 1"],
    forms: ["Feu Inconscient", "Soleil Levant Brûlant"],
    trainer: "Hozumi, pourfendeur retiré sans titre de Pilier ; une doublure rouge discrète.",
    crow: "Matsu", crowNote: "Matsu s'excuse avant de crier. Il vous adore ; c'est un jeune corbeau.",
    kit: "Petit levier en acier",
  },
  {
    key: "ren", id: "soi03slayer00001", name: "Ren Shibata", breath: "thunder", breathName: "Souffle de la Foudre",
    age: "20 ans", sex: "Homme", role: "Intercepteur et finisseur",
    base: { force: 3, finesse: 4, courage: 1, vitesse: 5, social: 0, intellect: 2 },
    derived: [2, 1, 2, 1, 1, 0, 1, 0, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    talents: ["Agilité et souplesse accrues", "Force physique accrue"], senses: ["Vision — niveau 1", "Sens auditif — niveau 1"],
    forms: ["Coup de tonnerre et éclair", "Foudre de chaleur", "Pluie d'éclairs électriques"],
    trainer: "Senzō, coursier devenu pourfendeur ; un liseré jaune au col.",
    crow: "Koma", crowNote: "Koma compte vos secondes à voix haute. Il vous adore ; c'est un jeune corbeau.",
    kit: "Sifflet et cordelette de signal",
  },
  {
    key: "sayo", id: "soi04slayer00001", name: "Sayo Fujimori", breath: "flower", breathName: "Souffle de la Fleur",
    age: "25 ans", sex: "Femme", role: "Soigneuse et enquêtrice",
    base: { force: 1, finesse: 4, courage: 2, vitesse: 0, social: 3, intellect: 5 },
    derived: [1, 0, 1, 1, 2, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 0, 0, 2, 0],
    talents: ["Agilité et souplesse accrues", "Intelligence supérieure", "Connaissances médicales"], senses: ["Vision — niveau 1"],
    forms: ["Robe de carthame", "Pivoine de la Futilité", "Pêche tourbillonnante"],
    trainer: "Kaya, ancienne pourfendeuse soignante ; une broderie de pétale à l'intérieur du col.",
    crow: "Ito", crowNote: "Ito prononce très doucement les noms propres. Il vous adore ; c'est un jeune corbeau.",
    kit: "Carnet, crayon et petite pince",
  },
  {
    key: "isamu", id: "soi05slayer00001", name: "Isamu Morita", breath: "wind", breathName: "Souffle du Vent",
    age: "28 ans", sex: "Homme", role: "Porte-parole et briseur d'obstacles",
    base: { force: 4, finesse: 3, courage: 2, vitesse: 1, social: 5, intellect: 0 },
    derived: [2, 2, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 0, 2, 1, 1, 1, 0, 0, 0, 0, 0],
    talents: ["Agilité et souplesse accrues", "Force physique accrue", "Intelligence supérieure"], senses: ["Sens auditif — niveau 1"],
    forms: ["Coupe-tourbillon de poussière", "Griffe de Vent Purifiante", "Tempête de poussière montante"],
    trainer: "Eiji, pourfendeur itinérant ; une couture verte au revers du haori.",
    crow: "Bun", crowNote: "Bun répète toujours le dernier engagement entendu. Il vous adore ; c'est un jeune corbeau.",
    kit: "Petit marteau et craie",
  },
];

function pregen(p, catalog) {
  const item = (pack, name, overrides) => catalog.item(pack, name, p.key, overrides);
  const items = [
    item("items-weapons", "Katana Nichirin standard"),
    item("items-weapons", "Pistolet standard"),
    item("items-medical-utility", "Bandage", { _id: stableId(p.key + ":bandage1") }),
    item("items-medical-utility", "Bandage", { _id: stableId(p.key + ":bandage2") }),
    item("items-medical-utility", "Pansement compressif"),
    item("items-medical-utility", "Uniforme du Corps", { system: { equipped: true } }),
    item("breaths-styles", p.breathName),
    ...p.forms.map(name => item("techniques-breaths", name)),
    ...p.talents.map(name => item("progression-features", name)),
    ...p.senses.map(name => item("items-medical-utility", name)),
    {
      _id: stableId(p.key + ":kit"), name: "Matériel de mission", type: "gear", img: "icons/containers/bags/pack-leather-white-tan.webp",
      system: {
        description: `<p>Gourde, lanterne à huile, 6 cartouches de rechange, ${p.kit.toLowerCase()}.</p>`,
        usageNote: `Prêté par le Corps pour la mission : gourde, lanterne, 6 cartouches, ${p.kit.toLowerCase()}.`,
        sourceSection: "Le poids de la soie", activation: "passive", quantity: 1, tags: ["scenario"],
      },
    },
  ];
  const breaths = Object.fromEntries(BREATH_KEYS.map(k => [k, { enabled: k === p.breath }]));
  return {
    _id: p.id, name: p.name, type: "slayer", img: `${ART}/portraits/${p.key}.webp`,
    system: {
      class: { type: "Pourfendeur", rank: "Mizunoto", level: 1, subclass: "Aucune", era: "taisho" },
      stats: { base: p.base, derived: derived(p.derived), remaining: {} },
      resources: { hp: { value: 20, max: 20, healableMax: 20, base: 20, temporary: 0 }, e: { value: 20 + p.base.courage, max: 20 + p.base.courage, temporary: 0 },
        rp: { value: 5 + p.base.vitesse + p.base.intellect, max: 5 + p.base.vitesse + p.base.intellect } },
      creation: {
        statMethod: "array", statArrayApplied: true,
        trainerBackground: "Épéiste ordinaire ; formation talentueuse ; envoyé avec un signe discret.",
        trainerPoints: { axis1: 0, axis2: 2, axis3: 1 }, kasugaiPoints: { axis1: 2, axis2: 1, axis3: 0 },
        kasugaiType: "Corbeau", startingEquipment: "Dotation du Corps (p. 33) et matériel prêté pour la mission.",
        notes: "Prétiré « Le poids de la soie » : série 0-5, 15 points de talents dépensés, aucun Souffle maîtrisé.",
      },
      profile: {
        characterType: "slayer", combatStyle: "breath", favoredBreath: p.breath, primaryWeapon: "Katana Nichirin standard",
        trainerContext: p.trainer, partnerContext: p.crowNote, kasugaiCrow: p.crow, age: p.age, sex: p.sex,
        role: p.role, yen: 0, bag: `Gourde, lanterne, 6 cartouches, ${p.kit.toLowerCase()}.`,
      },
      breaths,
      npc: { role: p.role },
    },
    items,
    prototypeToken: token(p.key, p.name, { linked: true, disposition: 1, sight: 18 }),
    flags: { [MID]: { key: p.key, pregen: true } },
  };
}

const HUMANS = [
  { key: "tamaki", id: "soi01human000001", name: "Tamaki Minase", age: "38 ans", role: "Propriétaire de la filature",
    threat: "« Si cette commande brûle, les salaires de l'hiver brûlent avec elle. »",
    behavior: "Veut sauver l'entreprise sans ressembler à son père. Cède aux faits précis et à un engagement concret sur l'évacuation : donne ses clés, ouvre le portail et signe la restitution devant témoins.",
    loot: "Clés du portail et du bureau" },
  { key: "fumi", id: "soi02human000001", name: "Fumi Natori", age: "27 ans", role: "Déléguée des ouvrières",
    threat: "« La caisse peut attendre. Elles, non. »",
    behavior: "Compte les personnes du regard. Cède à un itinéraire de secours expliqué, pas à l'uniforme. Avec un trajet sûr, elle évacue les libérées sans action des PJ.",
    loot: "Compte des ouvrières (pièce C)" },
  { key: "gen", id: "soi03human000001", name: "Gen Ichikawa", age: "54 ans", role: "Mécanicien",
    threat: "« La machine est honnête. C'est nous qui écrivons les chiffres. »",
    behavior: "A posé les contrepoids en croyant corriger les vibrations. Cède dès qu'on lui demande une procédure plutôt qu'un coupable. Avec lui ou sa notice, la vanne se ferme en 1 action.",
    loot: "Notice (pièce B), outils" },
  { key: "chiyo", id: "soi04human000001", name: "Chiyo Hase", age: "31 ans", role: "Contremaîtresse",
    threat: "« Je leur ai dit que le bracelet prouvait leurs heures. »",
    behavior: "Appelle chaque ouvrière par son nom. Donne sa clé dès qu'on l'aide à soigner les blessées. Avec la clé, retirer un bracelet = 1 action sans jet.",
    loot: "Petite clé des bracelets" },
];

function human(h) {
  return {
    _id: h.id, name: h.name, type: "npcHuman", img: `${ART}/portraits/${h.key}.webp`,
    system: {
      class: { type: "Civil", rank: "", level: 1, subclass: "Aucune", era: "taisho" },
      stats: { base: { force: 0, finesse: 1, courage: 1, vitesse: 1, social: 2, intellect: 2 }, derived: derived([]), remaining: {} },
      resources: { hp: { value: 8, max: 8, healableMax: 8, base: 8, temporary: 0 } },
      profile: { characterType: "npc-human", combatStyle: "variable", age: h.age, role: h.role },
      npc: { role: h.role, threat: h.threat, behavior: h.behavior, loot: h.loot },
    },
    items: [],
    prototypeToken: token(h.key, h.name, { linked: true, disposition: 0 }),
    flags: { [MID]: { key: h.key } },
  };
}

const captive = {
  _id: "soi05human000001", name: "Ouvrière captive", type: "npcHuman", img: `${ART}/portraits/captive.webp`,
  system: {
    class: { type: "Civil", rank: "", level: 1, subclass: "Aucune", era: "taisho" },
    stats: { base: { force: 0, finesse: 0, courage: 1, vitesse: 0, social: 1, intellect: 1 }, derived: derived([]), remaining: {} },
    resources: { hp: { value: 6, max: 6, healableMax: 6, base: 6, temporary: 0 } },
    profile: { characterType: "npc-human", combatStyle: "variable", role: "Ouvrière entravée par un bracelet" },
    npc: { role: "Ouvrière entravée", threat: "PV 6", behavior: "Trop lourde pour marcher tant que le réseau fonctionne. Libérée par son contrepoids brisé, le réseau coupé ou le bracelet retiré ; elle rejoint ensuite la cour sans jet.", loot: "" },
  },
  items: [],
  prototypeToken: token("captive", "Ouvrière", { disposition: 0 }),
  flags: { [MID]: { key: "captive" } },
};

function demonBase({ base, hpBase, bdp, rp, rank, danger, role, threat, behavior, loot }) {
  return {
    class: { type: "Demon", rank, level: 1, subclass: "", era: "taisho" },
    stats: { base, derived: derived([]), remaining: {} },
    resources: { hp: { base: hpBase, value: hpBase + 5 * base.force, max: hpBase + 5 * base.force, healableMax: hpBase + 5 * base.force, temporary: 0 },
      bdp: { value: bdp, max: 10 * base.courage }, rp: { value: rp, max: Math.floor((5 + base.vitesse + base.intellect) / 2) } },
    demonology: { bodyType: "humanoid", baseHpChoice: hpBase, movementType: "biped", movementBase: 9, dangerLevel: danger },
    profile: { characterType: "npc-demon", combatStyle: "bda", role },
    npc: { role, threat, behavior, loot },
  };
}

function bite(owner, hit, damage) {
  return {
    // Named with its profile so it stands apart from the system's generic rank line.
    _id: stableId(owner + ":bite"), name: `Morsure (d20 + ${hit}, 1d4 + ${damage})`, type: "weapon", img: "icons/creatures/abilities/fangs-teeth-bite.webp",
    system: {
      description: `<p>Action, contact (1,5 m) : d20 + ${hit}, 1d4 + ${damage} dégâts.</p>`, usageNote: `d20 + ${hit} contre CA ; 1d4 + ${damage}.`,
      sourceSection: "Le poids de la soie", activation: "action", quantity: 1, tags: ["demon", "natural"],
      damage: "1d4", range: 1.5, category: "melee", weaponFamily: "natural", attackMod: 0, damageMod: 0, properties: [],
      usesAmmo: false, isNichirin: false, canDecapitate: false,
      // Printed profile: the system uses these values instead of the half-stat demon rule.
      attackProfiles: { force: { hit, damage }, finesse: { hit, damage } },
    },
  };
}

function goro() {
  return {
    _id: "soigoro000000001", name: "Goro, démon charognard", type: "npcDemon", img: `${ART}/portraits/goro.webp`,
    system: demonBase({
      base: { force: 3, finesse: 3, courage: 2, vitesse: 4, social: 0, intellect: 0 }, hpBase: 5, bdp: 0, rp: 4, rank: "Demon faible", danger: "moderate",
      role: "Démon opportuniste (sans lien avec Shigure)", threat: "PV 20 · CA 14 · RP 4 · 1 action · Morsure d20 + 5, 1d4 + 2",
      behavior: "Fonce sur un PJ debout, jamais sur une blessée. Dépense au plus 1 RP par round. Aucun soin, aucun art sanguinaire. Version courte : PV 8, RP 1.",
      loot: "Rien ; il n'a pas de pastille",
    }),
    items: [bite("goro", 5, 2)],
    prototypeToken: token("goro", "Goro", { linked: true, bar2: "resources.rp" }),
    flags: { [MID]: { key: "goro" } },
  };
}

function shigure(catalog) {
  const bda = (key, name, extra) => ({
    _id: stableId("shigure:" + key), name, type: "bda", img: `${ART}/items/${key}.webp`,
    system: {
      sourceSection: "Le poids de la soie — profil original", activation: "action", quantity: 1, tags: ["scenario", "shigure", "reseau"],
      demonisationGain: 0, attackStat: "finesse", specialLines: ["Désactivé si le réseau est coupé"],
      automation: { area: "single", unlimitedRange: false, cannotBeDodged: false, cannotBeReactedTo: false, afflictionCondition: "", afflictionIntensity: 0, markAsh: false, noDamage: false, delayedDamageRounds: 0, delayedDamageFormula: "", targetCapBase: 0, targetCapScalePerLevel: 0, summonFormula: "", teleportToBurned: false },
      ...extra,
    },
    flags: { [MID]: { networkArt: true } },
  });
  return {
    _id: "soishigure000001", name: "Shigure, démon peseur", type: "npcDemon", img: `${ART}/portraits/shigure.webp`,
    system: {
      ...demonBase({
        base: { force: 6, finesse: 8, courage: 7, vitesse: 6, social: 4, intellect: 8 }, hpBase: 100, bdp: 70, rp: 6, rank: "Demon eleve", danger: "abnormal",
        role: "Antagoniste — ancien peseur devenu démon", threat: "PV 130 · CA 16 · 6 RP · 70 BDP · 2 actions · initiative d20 + 5",
        behavior: "Commence avec 6 RP (profil de scénario) et n'en récupère pas. Au plus 2 RP par round. Vise celui qui protège une captive ou menace C ; jamais un PJ à terre. À 60 PV : il accuse et marchande. À 25 PV, réseau coupé : il fuit par le quai.",
        loot: "Pastilles de céramique, tablier taché d'encre",
      }),
    },
    items: [
      bite("shigure", 7, 3),
      bda("poids-jete", "Poids jeté", { costBdp: 3, damage: "1d6 + 3", range: 9, rangeText: "9 m",
        description: "<p>Action, 9 m, 3 BDP : d20 + 7 contre CA, 1d6 + 3 dégâts. Cible visible, esquivable.</p>",
        usageNote: "d20 + 7 ; 1d6 + 3 ; 9 m ; esquivable." }),
      bda("sceau", "Sceau de charge", { costBdp: 4, damage: "0", range: 6, rangeText: "6 m",
        description: "<p>Action, 6 m, 4 BDP : d20 + 7 contre CA, aucun dégât. Si la cible est touchée, son déplacement tombe à 3 m jusqu'au retrait du sceau (1 action, elle-même ou un allié). Esquivable.</p><p>Posez ou retirez le sceau depuis le tableau de bord du scénario.</p>",
        usageNote: "d20 + 7 ; aucun dégât ; déplacement 3 m jusqu'au retrait (1 action)." }),
      {
        _id: stableId("shigure:pesee"), name: "Rééquilibrage", type: "demonAbility", img: `${ART}/items/pastille.webp`,
        system: { description: "<p>Action, 2 BDP : Shigure récupère 1d8 PV, une seule fois par round. Valeur fixée pour ce scénario.</p><p>Utilisez le bouton du tableau de bord : il dépense les BDP et lance les dés.</p>",
          usageNote: "1 action, 2 BDP : +1d8 PV, une fois par round (tableau de bord).", sourceSection: "Le poids de la soie — profil original",
          activation: "action", quantity: 1, tags: ["scenario", "shigure"], costBdp: 0, damage: "", range: 0 },
      },
      catalog.item("abilities-demons", "Repousse", "shigure"),
    ],
    // Linked so HP thresholds and the network state follow the single world actor.
    prototypeToken: token("shigure", "Shigure", { linked: true, bar2: "resources.bdp" }),
    flags: { [MID]: { key: "shigure" } },
  };
}

const WEIGHTS = [
  { key: "poids-b", zone: "B", name: "Contrepoids B · Atelier", effect: "Brisé : libère les quatre captives de l'atelier." },
  { key: "poids-e", zone: "E", name: "Contrepoids E · Magasin", effect: "Brisé : libère les quatre captives du magasin." },
  { key: "poids-c", zone: "C", name: "Contrepoids C · Chaufferie", effect: "Brisé : coupe le réseau. Toutes les captives sont libres, la Pression s'arrête et Shigure perd ses arts à distance." },
];

function weight(w) {
  return {
    _id: stableId("actor:" + w.key), name: w.name, type: "npc", img: `${ART}/portraits/${w.key}.webp`,
    system: {
      class: { type: "Objet", rank: "", level: 1, subclass: "", era: "taisho" },
      stats: { base: { force: 0, finesse: 0, courage: 0, vitesse: 0, social: 0, intellect: 0 }, derived: derived([]), remaining: {} },
      resources: { hp: { value: 12, max: 12, healableMax: 12, base: 12, temporary: 0 }, rp: { value: 0, max: 0 } },
      profile: { characterType: "npc", combatStyle: "variable", role: "Support du réseau" },
      npc: { role: "Mécanisme fixe", threat: "CA 10 · PV 12 · aucune réaction",
        behavior: `${w.effect} Au contact et hors menace immédiate, les outils de Gen le démontent en 1 action sans jet. Attaquer un poids ne blesse jamais une captive.`, loot: "" },
    },
    items: [],
    prototypeToken: { ...token(w.key, w.name, { linked: true, disposition: 0, bar2: "" }), displayBars: 50, displayName: 50 },
    flags: { [MID]: { key: w.key, weight: w.zone } },
  };
}

export function buildActors(catalog) {
  const pregens = PREGENS.map(p => pregen(p, catalog));
  return {
    pregens,
    npcs: [...HUMANS.map(human), captive],
    demons: [goro(), shigure(catalog)],
    mechanisms: WEIGHTS.map(weight),
  };
}

export { PREGENS, WEIGHTS };
