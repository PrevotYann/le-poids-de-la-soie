// Props and evidence the GM can hand to a pregen. All are plain "gear" items.
import { stableId } from "../tools/lib/system-catalog.mjs";
import { MID } from "./actors.mjs";

const ITEMS = [
  ["pastille", "Pastille de céramique", "Petite pastille rouge, humide, tombée du moyeu de la charrette. Loin du feu, elle se contracte comme un muscle.", "Preuve : les supports du pouvoir sont matériels et destructibles."],
  ["bracelet", "Bracelet de pression", "Bracelet de contrôle des heures, garni d'une pastille marquée du sang de Shigure. Tant que le réseau fonctionne, sa porteuse devient trop lourde pour marcher.", "Retrait : 1 action sans jet avec la clé de Chiyo, sinon Finesse DD 12 avec un outil. Soutenir la porteuse évite la chute."],
  ["cle", "Clé de Chiyo", "Petite clé de laiton qui ouvre tous les bracelets.", "Retirer un bracelet devient 1 action sans jet."],
  ["notice", "Notice de Gen", "« Trois conduites, trois poids rouges. Atelier, magasin, chaufferie. Fermer la vanne générale dans le sens de la flèche, puis tirer le cliquet vers soi. Ne pas arracher la conduite. Si le poids rouge de la chaufferie casse, tout le circuit cesse de charger. »", "Avec la notice ou Gen, la vanne générale se ferme en 1 action au lieu de 2."],
  ["outils", "Outils de Gen", "Clés plates, burin et maillet de mécanicien.", "Au contact d'un contrepoids et hors menace immédiate : le démonter en 1 action, sans jet."],
  ["registre", "Relevé des sommes dues", "Relevé des retenues sur deux mois, nom par nom, signé de la main de Tamaki.", "Utilisable tel quel au dénouement : aucun calcul nécessaire."],
  ["ordre", "Ordre affiché au portail", "« Jusqu'à restitution de la caisse de paie, aucune personne ne quittera la filature avec les effets de l'établissement. Les chefs d'équipe sont chargés de maintenir les portes fermées. » — Tamaki Minase", "Preuve que la fermeture du portail vient de Tamaki."],
  ["lettre", "Lettre de commande de Shigure", "« Je confirme ma venue après le coucher du soleil. Je demande l'accès aux balances et aux conduites : un établissement qui perd le contrôle de ses poids perd bientôt le contrôle de ses comptes. » — Shigure, acheteur", "Preuve que Shigure a obtenu l'accès aux machines, et à quelles heures."],
  ["caisse", "Caisse de paie", "Lourde caisse cerclée de fer, saisie par Fumi et jamais ouverte. La recette est entière.", "La déplacer exige deux personnes ou un chariot."],
];

export function buildItems() {
  return ITEMS.map(([key, name, description, usage]) => ({
    _id: stableId("item:" + key), name, type: "gear", img: `modules/${MID}/assets/items/${key}.webp`,
    system: { description: `<p>${description}</p><p><strong>En jeu :</strong> ${usage}</p>`, usageNote: usage,
      sourceSection: "Le poids de la soie", activation: "passive", quantity: 1, tags: ["scenario", key] },
    flags: { [MID]: { key } },
  }));
}

export const ITEM_KEYS = ITEMS.map(i => i[0]);
