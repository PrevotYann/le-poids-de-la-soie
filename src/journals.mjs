// Journal entries. Text is French, kept short: one page per scene, read-aloud
// boxes, and a table of what each choice changes. @Soie[action]{label} links are
// enriched by scripts/module.mjs into buttons for the GM.
import { stableId } from "../tools/lib/system-catalog.mjs";
import { MID, PREGENS } from "./actors.mjs";

const ART = `modules/${MID}/assets`;
const PDF = `modules/${MID}/resources/handouts`;
const A = (id, label) => `@UUID[Actor.${id}]{${label}}`;
const ID = {
  tamaki: "soi01human000001", fumi: "soi02human000001", gen: "soi03human000001", chiyo: "soi04human000001", captive: "soi05human000001",
  goro: "soigoro000000001", shigure: "soishigure000001",
};
export const JOURNAL_IDS = {
  guide: stableId("journal:guide"), zones: stableId("journal:zones"), players: stableId("journal:players"),
  pregens: stableId("journal:pregens"), handouts: stableId("journal:handouts"), pdf: stableId("journal:pdf"),
};
const P = (journal, key) => stableId(`page:${journal}:${key}`);
const pageLink = (journal, key, label) => `@UUID[JournalEntry.${JOURNAL_IDS[journal]}.JournalEntryPage.${P(journal, key)}]{${label}}`;
const read = text => `<blockquote class="soie-read">${text}</blockquote>`;
const tip = text => `<aside class="soie-tip">${text}</aside>`;
const table = (head, rows) => `<table class="soie-table"><thead><tr>${head.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
const wrap = html => `<div class="soie-journal">${html}</div>`;

const GUIDE = [
  ["start", "Démarrage rapide", `
<img class="soie-banner" src="${ART}/art/banner.webp" alt="">
<h1>Le poids de la soie</h1>
<p class="soie-lead">One-shot de 3 à 4 heures pour cinq pourfendeurs Mizunoto (rang 1). Ère Taishō, vallée fictive, personnages originaux.</p>
${read("À la filature, on pèse tout : les cocons, les ballots, les rations. Cette nuit, quelqu'un a décidé de peser ce que vaut une vie.")}
<h2>L'essentiel en cinq lignes</h2>
<ol>
<li>Tamaki, la propriétaire, retient des salaires et a fait fermer le portail : les ouvrières sont en grève.</li>
<li>Shigure, un démon qui se fait passer pour un acheteur, a marqué de son sang <strong>trois contrepoids</strong> (B, E, C) et <strong>huit bracelets</strong>.</li>
<li>Les huit porteuses deviennent trop lourdes pour marcher. Il veut que Tamaki <em>désigne publiquement</em> celles à sacrifier.</li>
<li>Le pouvoir passe par des <strong>objets matériels</strong> : briser C ou fermer la vanne libère tout le monde.</li>
<li>Les PJ gagnent en écoutant les humains autant qu'en surveillant les lames.</li>
</ol>
<h2>Préparer (15 minutes)</h2>
<ol>
<li>Lire cette page, puis ${pageLink("guide", "s4", "Scène 4")} et ${pageLink("guide", "rules", "Règles et arbitrages")}.</li>
<li>Activer la scène <em>Filature Minase</em> et donner les fiches : chaque joueur reçoit la propriété d'un prétiré.</li>
<li>Montrer aux joueurs le journal <em>Aide des joueurs</em> et <em>Prétirés</em>.</li>
<li>Ouvrir le @Soie[dashboard]{tableau de bord du scénario} : il suit la Pression, les poids, la vanne et les captives.</li>
</ol>
<h2>Séquence</h2>
${table(["Étape", "3 h", "4 h", "But"], [
  ["Accueil et personnages", "15 min", "20 min", "Expliquer E, RP et la mort à 0 PV."],
  [pageLink("guide", "s1", "1 · Un poids impossible"), "20 min", "25 min", "Sauvetage de la charrette, puis Goro."],
  [pageLink("guide", "s2", "2 · Les comptes de la nuit"), "30 min", "45 min", "Trois lieux, quatre conclusions."],
  [pageLink("guide", "s3", "3 · La paie et la porte"), "20 min", "30 min", "Chantage ; obtenir des engagements concrets."],
  ["Pause", "5 min", "10 min", "Poser figurines, Pression et poids."],
  [pageLink("guide", "s4", "4 · La pesée des vivants"), "70 min", "85 min", "Combattre et libérer."],
  [pageLink("guide", "end", "Épilogue"), "20 min", "25 min", "Paie, preuves, une décision par PJ."],
])}
<h2>Objectifs des PJ</h2>
<p>Évacuer les huit captives · couper le réseau · neutraliser Shigure et garder les preuves · décider comment les salaires seront rendus. Sauver la filature est possible, mais sa rentabilité n'est jamais une obligation morale des PJ.</p>`],

  ["truth", "Ce qui s'est passé", `
<h1>Ce qui s'est passé</h1>
<h2>Le démon n'a pas inventé le conflit</h2>
<p>La filature Minase emploie vingt-quatre ouvrières. Depuis deux mois, ${A(ID.tamaki, "Tamaki")} retient une part des salaires pour payer une chaudière neuve. ${A(ID.fumi, "Fumi")} a organisé un arrêt de travail et fait placer la caisse de paie au magasin. Tamaki a ordonné de fermer le portail jusqu'à restitution de la caisse : elle voulait garder la recette, elle a enfermé des personnes.</p>
<h2>Le projet de Shigure</h2>
<p>Depuis trois nuits, ${A(ID.shigure, "Shigure")} visite la filature comme acheteur et propose du charbon à crédit. Ancien peseur, il choisissait jadis les chiffres qui évitaient aux puissants de regarder leurs victimes. Il veut obtenir de Tamaki un ordre explicite sacrifiant huit ouvrières « pour sauver la soie », puis manger celles qu'elle aura désignées. Il prétend révéler la vérité des humains ; il fabrique les circonstances qui lui donnent raison.</p>
<h2>Son art sanguinaire</h2>
<p>Des pastilles de céramique enduites de son sang alourdissent ce qu'elles touchent. Trois contrepoids font circuler l'effet par la vapeur ; huit bracelets de « contrôle des heures » en portent. Le pouvoir ne lit ni les pensées ni les contrats : il agit sur des <strong>supports physiques que les PJ peuvent détruire</strong>.</p>
<h2>Chronologie</h2>
${table(["Quand", "Événement"], [
  ["Il y a deux mois", "Retenues sur salaire ; Tamaki cache l'endettement."],
  ["Il y a trois nuits", "Shigure entre comme acheteur ; Gen pose les contrepoids à sa demande."],
  ["La veille", "Deux vérificateurs des poids sont tués, os broyés. Gen garde un éclat rouge."],
  ["Ce soir, 22 h", "Grève, caisse saisie, portail fermé. Les pourfendeurs arrivent."],
  ["Fin de la scène 3", "Shigure révèle ses huit captives et exige un choix public."],
])}`],

  ["npcs", "Les PNJ en un coup d'œil", `
<h1>Les PNJ</h1>
<p>Un désir, un geste, une phrase suffisent. Ne jouez pas un débat entre PNJ : posez une question à un PJ, puis faites agir quelqu'un.</p>
${table(["PNJ", "Joue-le ainsi", "Il ou elle cède…", "Ce que ça rapporte"], [
  [`${A(ID.tamaki, "Tamaki Minase")}<br><small>propriétaire, 38 ans</small>`, "Remet sa manche en place avant une mauvaise nouvelle. « Si cette commande brûle, les salaires de l'hiver brûlent avec elle. »", "Aux faits précis et à un engagement concret sur l'évacuation. Jamais à la flatterie.", "Clés, portail ouvert, ordre signé ; signe la restitution des salaires si on l'exige devant témoins."],
  [`${A(ID.fumi, "Fumi Natori")}<br><small>déléguée, 27 ans</small>`, "Phrases courtes, mains qui comptent les personnes. « La caisse peut attendre. Elles, non. »", "À un itinéraire de secours expliqué, pas à l'uniforme.", "Positions des huit captives ; évacue les libérées sans action des PJ."],
  [`${A(ID.gen, "Gen Ichikawa")}<br><small>mécanicien, 54 ans</small>`, "Pose la paume sur le bois pour sentir les vibrations. « La machine est honnête. C'est nous qui écrivons les chiffres. »", "Dès qu'on lui demande une procédure plutôt qu'un coupable.", "Vanne en 1 action au lieu de 2 ; outils pour démonter un poids."],
  [`${A(ID.chiyo, "Chiyo Hase")}<br><small>contremaîtresse, 31 ans</small>`, "Appelle chaque ouvrière par son nom. « Je leur ai dit que le bracelet prouvait leurs heures. »", "Immédiatement si une PJ l'aide à soigner les blessées.", "Clé des bracelets : retrait en 1 action sans jet."],
  [`${A(ID.shigure, "Shigure")}<br><small>démon peseur</small>`, "Voix douce, tablier propre, pouces noirs comme l'encre. « Une balance ne fait que rendre un verdict. »", "Jamais. Il négocie pour gagner du temps.", "Il ment : les trois poids peuvent être brisés et les huit femmes sauvées."],
])}
${tip("Chiyo a aussi falsifié des horaires pour qu'une collègue malade soit payée. Elle ne défendra pas Tamaki au prix d'une autre vie. Gen a installé les poids en croyant corriger les vibrations : il veut réparer, mais redoute un nouvel accident.")}
<p>Shigure ne crie qu'une fois : quand quelqu'un sacrifie un bien auquel il tient pour aider un inconnu. Son passé explique ses images ; il ne l'excuse pas et aucun discours ne le délivre.</p>`],

  ["s1", "Scène 1 · Un poids impossible", `
<h1>1 · Un poids impossible <small>20-25 min</small></h1>
${read("Le portail est fermé. Derrière les barreaux, une femme rit de peur : sa brouette vient de s'enfoncer dans la terre sans qu'on la touche. Plus loin, deux ouvrières tentent de retenir une charrette. Les roues tournent encore. Les essieux, eux, plient.")}
<p>Le corbeau crie : <em>« Deux morts aux os broyés ! Filature Minase ! Protégez les vivantes et trouvez le démon ! »</em> Il est 22 h. Seize ouvrières sont dans la cour, huit autres à l'intérieur. Fumi réclame l'ouverture, Tamaki veut d'abord récupérer la caisse.</p>
<h2>Le premier sauvetage : chacun agit une fois</h2>
<p>Deux ouvrières risquent d'être écrasées par une charrette de charbon touchée par une pastille. Demandez à chaque PJ, à tour de rôle : <strong>« Que fais-tu pour qu'elles puissent sortir ? »</strong></p>
<ul>
<li><strong>Sans jet :</strong> ouvrir avec les clés de Tamaki, faire levier à deux, couper le harnais côté libre, guider les badauds.</li>
<li><strong>Sous pression :</strong> Force DD 12 pour soulever seul ; Dextérité DD 12 pour se glisser sous le timon ; Sciences DD 10 pour trouver un appui.</li>
<li>Un succès crée une issue ; un second geste la sécurise.</li>
<li><strong>Échec :</strong> le PJ recule devant l'essieu qui casse ; personne ne meurt sur un seul jet. Si tout le groupe tarde, la charrette tombe sur une jambe : la victime reste consciente et devra être portée.</li>
</ul>
<p>La @UUID[Item.${stableId("item:pastille")}]{pastille rouge} tombée du moyeu se remarque automatiquement.</p>
<h2>Petit combat d'apprentissage : Goro</h2>
<p>${A(ID.goro, "Goro")}, un démon charognard sans lien avec Shigure, profite du portail ouvert pour foncer sur la foule (token caché sur la route, au sud). Fumi fait reculer les civils.</p>
${table(["Goro", "Valeurs"], [["Défense", "PV 20 · CA 14 · RP 4 (au plus 1 par round) · 1 action · 9 m"], ["Morsure", "d20 + 5, contact, 1d4 + 2"], ["Conduite", "Attaque un PJ debout, jamais une blessée. Aucun soin."], ["Version courte", "Déjà blessé : PV 8, RP 1."]])}
${tip("Profitez-en pour enseigner : faire annoncer une esquive (1 RP) avant les dégâts ; rappeler qu'une forme de Souffle touche sans jet d'attaque ; montrer qu'il faut une frappe Nichirin à la tête pour décapiter. Ensuite, les survivantes désignent les trois lieux à examiner.")}`],

  ["s2", "Scène 2 · Les comptes de la nuit", `
<h1>2 · Les comptes de la nuit <small>30-45 min</small></h1>
<p>Proposez les trois lieux ensemble. Les PJ peuvent se séparer ; changez de groupe après une découverte ou deux minutes. <strong>Examiner le lieu ou parler à la personne donne l'indice essentiel.</strong> Les jets apportent un avantage, jamais l'autorisation de continuer.</p>
<h2>Le bureau (D) · Tamaki et le registre</h2>
<p>Visible : avis de retenues, @UUID[Item.${stableId("item:ordre")}]{ordre de fermeture signé}, contrat de charbon à crédit et @UUID[Item.${stableId("item:lettre")}]{lettre de Shigure}. Question utile : « Qui a autorisé cet acheteur à toucher aux machines ? » Tamaki finit par avouer.</p>
<p><strong>Enquête DD 12 :</strong> le @UUID[Item.${stableId("item:registre")}]{relevé des sommes dues}, utilisable au dénouement. <em>Échec :</em> Tamaki le retrouve, mais exige de savoir ce que les PJ en feront.</p>
<h2>La chaufferie (C) · Gen et les poids</h2>
<p>Visible : trois conduites ajoutées, chacune scellée de rouge ; un éclat de céramique humide se contracte loin du feu. Gen ferme une petite vanne d'essai : un seau alourdi retrouve son poids normal.</p>
<p><strong>Sciences DD 12 :</strong> repérer les trois écrous utiles ; au final, la vanne se fermera en 1 action même sans Gen. <em>Échec :</em> Gen rédige la @UUID[Item.${stableId("item:notice")}]{notice}, qui reste disponible. Il signale les passages B-C et C-F.</p>
<h2>L'infirmerie de la cour (A) · Chiyo et Fumi</h2>
<p>Visible : sous les bracelets, la peau porte un cercle de pression, pas une morsure. Les deux morts avaient le même cercle.</p>
<p><strong>Médecine DD 10 :</strong> caler le membre avant de desserrer le bracelet, sans dommage. <em>Échec :</em> une survivante prévient que la dernière porteuse est tombée ; l'information est acquise. Chiyo donne la @UUID[Item.${stableId("item:cle")}]{clé}, Fumi le @UUID[Item.${stableId("item:caisse")}]{compte} et les positions des huit captives. Traitée en complice, Chiyo pose la clé devant eux et demande qu'on la juge plus tard.</p>
<h2>Les quatre conclusions indispensables</h2>
${table(["Conclusion", "Comment les PJ l'apprennent"], [
  ["La vapeur entretient le pouvoir.", "Démonstration de Gen ; le seau s'allège quand la conduite fuit."],
  ["Les supports sont matériels et destructibles.", "Pastille de la charrette, bracelet, éclat conservé."],
  ["Huit femmes restent prisonnières.", "Fumi connaît les postes ; Chiyo donne noms et lieux."],
  ["Shigure est l'acheteur nocturne.", "Contrat et lettre du bureau ; même description par Gen et Tamaki."],
])}
${tip("<strong>Relance à 30 minutes :</strong> un sifflement couvre les voix, le quai se ferme, les manomètres de Gen tremblent. Passez à la scène 3 même si un lieu n'a pas été visité : son témoin vient chercher les PJ et apporte l'information.")}`],

  ["s3", "Scène 3 · La paie et la porte", `
<h1>3 · La paie et la porte <small>20-30 min</small></h1>
${read("Le verrou du quai claque. Dans la vapeur se dessine un homme au tablier blanc. Il tient un petit poids entre deux doigts. À chacun de ses pas, quelque chose craque sous le plancher. « Madame Minase. Votre commande, ou vos ouvrières ? Il faudra bien qu'une personne responsable tranche. »")}
<p>Shigure soulève une pastille : une ouvrière de l'atelier s'affaisse sous son propre poids. Il désigne les trois contrepoids ; la filature vibre en cadence. <strong>Dites-le clairement :</strong> il n'y a pas de dilemme magique ; la prison a des supports accessibles. La vapeur cache ses mouvements, elle ne rend pas les PJ impuissants.</p>
<h2>Laisser les joueurs interrompre</h2>
<p>Shigure laisse les humains s'accuser quelques phrases. Demandez : <strong>« Qui interromps-tu, et que lui demandes-tu de faire maintenant ? »</strong> Une preuve ou un plan concret convainc un allié. Pour une demande risquée sans preuve : Intuition ou Performance DD 12 ; un échec appelle une contrepartie, pas un refus définitif.</p>
${table(["Engagement obtenu", "Effet au final (cochez-le dans le tableau de bord)"], [
  ["Fumi reçoit un trajet sûr vers la cour", "Les libérées rejoignent la cour en fin de round, sans action des PJ."],
  ["Gen guide la manœuvre ou reçoit une escorte", "La vanne générale se ferme en 1 action au lieu de 2."],
  ["Chiyo remet sa clé et montre le geste", "Retirer un bracelet : 1 action sans jet ; la personne est soutenue."],
  ["Tamaki donne ses clés et ouvre le portail", "La cour devient une sortie. Sinon : Force DD 12 ou outils, et 1 action."],
])}
<h2>Une réponse au chantage, pas une bonne réponse imposée</h2>
<p>Les PJ peuvent exiger le paiement, évacuer, détruire la soie ou attaquer. Tamaki peut reconnaître sa faute sans être pardonnée ; Fumi ne troque pas ses camarades contre la caisse. <strong>Les PNJ n'imposent aucun sacrifice</strong> : ils demandent de l'aide et savent travailler ensemble.</p>
<ul>
<li><strong>Si les PJ attaquent pendant le discours :</strong> le combat commence avec les positions réelles, sans attaque gratuite.</li>
<li><strong>S'ils négocient :</strong> Shigure libère une ouvrière contre un ballot de soie jeté dans la chaudière (une action de chacun au combat). Cela ne garantit rien pour les autres.</li>
</ul>
${tip("<strong>Transition :</strong> dès qu'un PJ touche un poids, protège une captive ou refuse le marché, Shigure attaque. Les seize autres ouvrières sont dans la cour ; aucune victime anonyme ne s'ajoute.")}`],

  ["s4", "Scène 4 · La pesée des vivants", `
<h1>4 · La pesée des vivants <small>70-85 min</small></h1>
<h2>Mise en place</h2>
<ol>
<li>Révéler Shigure au quai (F). Les PJ choisissent une zone accessible depuis leur dernière scène.</li>
<li>Quatre captives dans l'atelier (B), quatre dans le magasin (E), à 3 m de leur poids.</li>
<li>Montrer les trois contrepoids et la vanne. Annoncer les règles de Pression <em>avant</em> le premier tour.</li>
<li>Lancer le combat, puis @Soie[finale]{démarrer le final} : le module avance la Pression à chaque fin de round.</li>
</ol>
<h2>Pression 0 → 4 (règle annoncée aux joueurs)</h2>
${table(["Pression", "Ce que voient les PJ"], [["1", "Les bracelets vibrent."], ["2", "Les genoux plient."], ["3", "Les captives peinent à parler."], ["4", "Chaque captive encore liée subit 2 dégâts à chaque fin de round (6 PV chacune)."]])}
<p>À chaque fin de round où le réseau fonctionne, la Pression monte d'un cran. Sans aucune aide, les premières morts surviennent à la fin du round 6 : le danger est lisible, pas un piège du MJ. <strong>Réseau coupé</strong> (C brisé, vanne fermée ou Shigure mort) : la jauge se fige, plus aucun dégât.</p>
<h2>Libérer et évacuer</h2>
${table(["Action", "Résolution"], [
  ["Briser un contrepoids", "CA 10, 12 PV, aucune réaction. Attaque de base ou Souffle. Viser un poids ne blesse jamais une captive."],
  ["Démonter un contrepoids", "Au contact, hors menace immédiate, avec les outils de Gen : 1 action sans jet."],
  ["Effet d'un poids brisé", "B : libère l'atelier. E : libère le magasin. C : coupe le réseau, libère tout le monde et prive Shigure de ses deux arts à distance."],
  ["Fermer la vanne (en C)", "2 actions cumulées sans jet ; 1 seule avec Gen ou sa notice. Même effet que briser C, sans détruire les machines."],
  ["Retirer un bracelet", "1 action sans jet avec la clé ; sinon Finesse DD 12 avec un outil. Échec : action perdue, rien ne blesse."],
  ["Évacuer", "Avec Fumi et un passage libre : cour atteinte en fin de round. Sinon un PJ guide un groupe de quatre en 1 action."],
])}
<h2>Shigure</h2>
${table(["Profil", "PV 130 · CA 16 · 6 RP (au plus 2 par round, aucune récupération) · 70 BDP · 2 actions · 9 m · initiative d20 + 5"], [
  ["Morsure", "Action, contact : d20 + 7, 1d4 + 3."],
  ["Poids jeté", "Action, 9 m, 3 BDP : d20 + 7, 1d6 + 3. Esquivable."],
  ["Sceau de charge", "Action, 6 m, 4 BDP : d20 + 7, aucun dégât ; déplacement 3 m jusqu'au retrait (1 action). @Soie[seal]{Poser/retirer le sceau sur les cibles}."],
  ["Rééquilibrage", "Action, 2 BDP : +1d8 PV, une fois par round. @Soie[heal]{Lancer le soin de Shigure}."],
  ["Repousse", "Action, 4 BDP : restaure un membre, pas de PV. Rien après une décapitation Nichirin."],
])}
<p><strong>Tactique.</strong> Round 1 : il avance de F vers C et vise le premier PJ qui approche des commandes ; il mord au contact. Ensuite : une action contre qui protège une captive, une contre qui menace C. Il ne frappe pas un PJ à terre, ni deux fois le même PJ dans son tour sauf s'il est seul à portée. Il ne dépense pas de RP contre une technique impossible à esquiver.</p>
<p><strong>À 60 PV :</strong> son tablier craque, des marques de poids apparaissent sur sa peau ; il accuse les ouvrières de coûter trop cher et propose de livrer Tamaki. Aucun bonus. <strong>À 25 PV, réseau coupé :</strong> il fuit vers F — 1 action pour ouvrir les volets, 1 action au tour suivant pour sauter. Les PJ voient ses intentions et peuvent le suivre, le bloquer ou le frapper. Le module vous prévient à ces seuils.</p>
<h2>Trois plans qui doivent fonctionner</h2>
${table(["Plan des PJ", "Résolution"], [
  ["Un groupe combat, un autre ferme la vanne", "L'assaut occupe Shigure. Pas besoin d'une « provocation » réussie pour accéder à C."],
  ["On brise les poids et on évacue", "Chaque groupe libéré réduit le danger. Les objets ne peuvent pas esquiver."],
  ["On abat Shigure tout de suite", "Possible : sa mort dissipe tout le réseau. Aucun second corps, aucune dernière immunité."],
])}
${tip("<strong>Dernier coup :</strong> laissez son auteur décrire la frappe, puis une image courte : Shigure essaie de ramasser ses poids, mais ses doigts tombent en poussière avant de les atteindre. Pas de confession obligatoire.")}`],

  ["end", "Branches et épilogue", `
<h1>Branches et épilogue</h1>
<h2>Quand les joueurs changent le plan</h2>
${table(["Ils…", "Réponse"], [
  ["coupent le réseau dès l'enquête", "Récompensez-les : aucun otage au final. Shigure défend sa fuite, pas un piège recréé."],
  ["évacuent avant le chantage", "Les bracelets pèsent déjà sur huit femmes ; elles expliquent le problème sans jet."],
  ["détruisent la chaudière", "Annoncez d'abord un jet de vapeur brûlante (1d6, esquivable) dans C. Le réseau cesse, l'outil de travail est perdu."],
  ["brûlent la filature", "Précisez d'abord captives, sorties et fumée. Zone en flammes : 1d4 dégâts à la fin du tour d'un occupant. Le feu ne blesse pas le démon magiquement."],
  ["appellent le Corps", "Le corbeau part ; des Kakushi accueilleront les évacuées. Aucun Pilier n'arrive pour gagner le combat."],
  ["capturent Tamaki", "Elle remet les clés ; Fumi exige d'abord le secours. Le Corps ne tient pas tribunal."],
  ["attendent l'aube", "Les captives sont menacées bien avant. Après leur sauvetage, Shigure cherche une sortie obscure : jouez sa fuite comme au final."],
])}
<h2>Tenir le temps</h2>
<p>Version courte : à 1 h 10, réunissez les indices par Gen et Chiyo ; à 1 h 30, lancez le final ; à 2 h 35, si le combat traîne, annoncez la fuite et jouez deux rounds de poursuite. Ne réduisez jamais ses PV en secret, n'ajoutez ni renfort ni second boss.</p>
<h2>Quatre issues, sans note de moralité</h2>
${table(["Issue", "Ce qui reste à jouer"], [
  ["Démon mort, huit femmes sauvées", "Fumi réclame la paie ; Tamaki peut signer devant toutes. Gen arrête les machines sans danger."],
  ["Survivantes, outil de travail détruit", "La caisse permet une aide immédiate. Qui soutient la reconstruction, et sous quelle direction ?"],
  ["Démon en fuite, femmes sauvées", "Victoire du secours, menace non terminée. Le rapport dit ce qui s'est passé, sans inventer une victoire totale."],
  ["Victimes parmi les huit", "Nommez chaque victime et confiez son annonce à un volontaire. Les survivantes ne remercient pas automatiquement."],
])}
<h2>Tour d'épilogue (une minute chacun)</h2>
<p><strong>Aoi</strong> choisit une promesse · <strong>Daigo</strong> une responsabilité · <strong>Ren</strong> une personne qu'il attend · <strong>Sayo</strong> une parole qu'elle écoute · <strong>Isamu</strong> une preuve qu'il transmet.</p>
<p>Questions de clôture : qui reste pour témoigner ? Qui transmet le registre ? Qui aide Gen à arrêter la machine ? Tamaki rend-elle l'argent en reconnaissant sa faute ou sous contrainte ? Que demandent les ouvrières pour reprendre le travail ? <strong>La dernière parole revient à une survivante, puis aux PJ.</strong></p>`],

  ["rules", "Règles et arbitrages", `
<h1>Règles et arbitrages</h1>
<p>Les fiches Breathe and Live 0.6 calculent PV, E, CA, RP et les bonus de talents (en combat : +3 Force, Finesse ou Intellect). Les jets se lancent depuis la fiche ; les formes de Souffle et les attaques ouvrent une carte de réaction pour la cible.</p>
${table(["Règle", "À la table"], [
  ["Jets", "Stat de base : d20 + (valeur − 1). Stat dérivée : d20 + score. Les talents sont ajoutés par la fiche."],
  ["Tour", "Déplacement 9 m + 1 action (Shigure : 2). Soigner, manipuler une machine ou récupérer sont des actions."],
  ["Attaque de base", "d20 + Force ou Finesse contre CA, égalité suffisante. Pas de coût d'endurance."],
  ["Forme de Souffle", "1 action, coût en E payé même si esquivée, touche sans jet sauf esquive permise."],
  ["Esquive", "1 RP : esquive automatique d'une attaque esquivable. Sans RP : évitement d20 + Finesse strictement supérieur au jet ; s'il échoue, plus de RP sur cette attaque."],
  ["Récupération", "1 action hors Concentration : +1d8 E. Aucun PV. Les RP reviennent après 8 h de repos seulement."],
  ["Soins", "1 action au contact + 1 consommable. Connaissances médicales : option 1d6 + 2, sans cumul."],
  ["À zéro", "0 E : aucune attaque, récupération obligatoire ; deux rounds sans récupérer = inconscience. 0 PV : mort selon le livre."],
])}
<h2>Conventions de la soirée</h2>
<p>Le livre laisse ces points ouverts ; annoncez-les avant de jouer et appliquez-les aux PJ comme aux PNJ.</p>
${table(["Point", "Convention"], [
  ["Initiative", "d20 + Vitesse − 1, ordre décroissant ; égalité : Vitesse brute, puis PJ."],
  ["Concentration intégrale", "Activer ou arrêter gratuitement sur son tour ; maintien 1 E à la fin du tour. À 0 E, elle cesse."],
  ["Endurance", "Coût payé à l'annonce. Jamais de réserve négative. Entre deux scènes sûres, 5 min suffisent à remplir E."],
  ["Charge de la Foudre", "Tour N : annoncer la cible et payer. Tour N+1 : libérer. Une attaque contre le chargeur l'interrompt, même esquivée ; coût perdu."],
  ["Porter secours (2 RP)", "Une personne à 1,5 m est tirée au contact du sauveteur, hors de l'attaque. Ne libère pas un bracelet."],
  ["Décapitation", "Annoncer la tête avant les dégâts : une frappe Nichirin qui ramène à 0 PV décapite. Sinon le démon est inerte ; l'achever demande 1 action au contact."],
  ["Membres", "Membre démoniaque : 20 % des PV max en un coup ciblé (Goro 4, Shigure 26). Ne pas cibler les membres des humains ici."],
  ["Blessure grave", "Une blessure de 13+ réduit le plafond de soin de 2 PV pour ce scénario."],
])}
${tip("<strong>Variante facultative,</strong> à convenir avant la partie : à 0 PV, un PJ est mourant jusqu'à la fin de son prochain tour ; un soin le sauve. Sans accord explicite, gardez la mort immédiate du livre.")}`],

  ["module", "Utiliser le module", `
<h1>Utiliser le module</h1>
<h2>Après l'import</h2>
<p>Tout le contenu est rangé dans un dossier <strong>Le poids de la soie</strong> dans chaque onglet (acteurs, objets, journaux, scènes, macros). Les tokens de la scène pointent déjà vers les acteurs importés.</p>
<ul>
<li>Donnez à chaque joueur la propriété (Propriétaire) de son prétiré.</li>
<li>Goro et Shigure sont cachés sur la scène : révélez-les au bon moment.</li>
<li>Les pastilles de la carte (A à F) ouvrent la description de chaque zone.</li>
</ul>
<h2>Le tableau de bord</h2>
<p>@Soie[dashboard]{Ouvrir le tableau de bord} (aussi dans les macros et les réglages du module). Il suit :</p>
<ul>
<li>la jauge de <strong>Pression</strong>, avancée automatiquement à chaque fin de round une fois le final démarré ;</li>
<li>les <strong>trois contrepoids</strong> : un poids ramené à 0 PV sur la scène est marqué brisé et libère sa zone ;</li>
<li>la <strong>vanne</strong> (1 ou 2 actions selon la procédure de Gen) et les <strong>engagements</strong> obtenus en scène 3 ;</li>
<li>les <strong>huit captives</strong> : PV, bracelet retiré, évacuée ;</li>
<li>Shigure : soin d'1d8, sceau de charge, alertes à 60 et 25 PV. Ses deux arts à distance sont désactivés quand le réseau est coupé.</li>
</ul>
<h2>Montrer les pièces aux joueurs</h2>
<p>Ouvrez le journal <em>Pièces à remettre</em> et utilisez le bouton « Montrer aux joueurs » de la page voulue, ou la macro <em>Montrer une pièce</em>.</p>
<h2>Documents imprimables</h2>
<p>Les PDF d'origine (dossier MJ, cinq prétirés, aides) sont dans le journal <em>Documents imprimables</em>. En cas d'écart, les fiches et journaux Foundry font foi : ils suivent les règles du système 0.6.</p>`],
];

const ZONES = [
  ["A", "A · Cour", "Sortie et civils. Portail fermé sur ordre de Tamaki (verrouillé sur la carte).", "Charrette alourdie (scène 1), infirmerie improvisée de Chiyo, seize ouvrières.", "Refuge hors de portée du réseau. Fumi y accueille les rescapées. Pas de brouillard."],
  ["B", "B · Atelier", "Bassines à cocons, dévidoirs et passerelle à 3 m de haut.", "Poids B sur sa conduite ; la soie vibre en cadence.", "Quatre captives (Hana, Miyo, Kinu, Setsu) et le poids B. Monter sur la passerelle coûte 3 m de déplacement. Les établis coupent une ligne d'attaque."],
  ["C", "C · Chaufferie", "Chaudière, foyer, vanne générale.", "Gen démontre la vanne d'essai ; éclat de céramique.", "Poids C et vanne générale. Détruire la chaudière est possible mais dangereux (vapeur 1d6) ; fermer la vanne suffit."],
  ["D", "D · Bureau", "Papiers, coffre et registre.", "Ordre signé, contrat de charbon, lettre de Shigure, relevé des sommes dues.", "Tamaki peut en rapporter les preuves sans escorte une fois la cour sûre. Aucun ennemi caché."],
  ["E", "E · Magasin", "Ballots de soie, paniers de cocons, caisse de paie.", "Fumi y a fait déposer la caisse, jamais ouverte.", "Quatre captives (Nao, Toki, Yae, Ritsu) et le poids E. Déplacer la caisse exige deux personnes ou un chariot."],
  ["F", "F · Quai", "Volets sur la rivière, verrouillés de l'intérieur.", "Le quai se ferme au moment de la relance.", "Départ de Shigure. Ouvrir les volets : 1 action. L'aube ne survient pas pendant le combat."],
];

const HANDOUTS = [
  ["ordre", "A · Ordre affiché au portail", "Remettre au bureau, ou dès qu'un PJ lit l'ordre. L'écriture et la signature sont authentiques."],
  ["notice", "B · Notice de Gen", "Remettre après la démonstration de la chaufferie. Elle donne l'avantage prévu pour la vanne."],
  ["compte", "C · Le compte des ouvrières", "Remettre en parlant à Fumi. Entourez les noms des femmes libérées ; ne distribuez pas de liste de victimes préétablie."],
  ["lettre", "D · Lettre de commande", "Remettre au bureau. Aucun code caché : son intérêt tient à l'autorisation et aux horaires."],
];
const HANDOUT_TEXT = {
  ordre: "Jusqu'à restitution de la caisse de paie, aucune personne ne quittera la filature avec les effets de l'établissement. Les chefs d'équipe sont chargés de maintenir les portes fermées.<br><em>Tamaki Minase</em>",
  notice: "Trois conduites, trois poids rouges. Atelier, magasin, chaufferie. Fermer la vanne générale dans le sens de la flèche, puis tirer le cliquet vers soi. Ne pas arracher la conduite. Si le poids rouge de la chaufferie casse, tout le circuit cesse de charger.",
  compte: "Vingt-quatre à l'appel. Seize dans la cour.<br>Atelier : Hana, Miyo, Kinu, Setsu.<br>Magasin : Nao, Toki, Yae, Ritsu.<br>La caisse est entière. Ce qui manque est dans les salaires, pas dans nos poches.<br><em>Fumi</em>",
  lettre: "Je confirme ma venue après le coucher du soleil. Je demande l'accès aux balances et aux conduites : un établissement qui perd le contrôle de ses poids perd bientôt le contrôle de ses comptes.<br><em>Shigure, acheteur</em>",
};

const PREGEN_TEXT = {
  aoi: ["Tu t'accroupis pour parler aux blessés ; tu observes les sorties avant les visages.", "D'abord, on vous sort de là.",
    "Tu transportais des marchandises sur une rivière de montagne. Un démon a attaqué une embarcation ; tu as sauvé les passagers en abandonnant une cargaison qui appartenait à ta famille. Ton père t'a reproché la perte, puis a vendu sa barque pour payer ton apprentissage, sans jamais expliquer ce geste. Tu écris des lettres que tu n'envoies pas.",
    "Montrer que protéger une personne ne se résume pas à vaincre ce qui la menace.", "Tu te méfies des promesses que personne ne chiffre, mais tu ne sais pas toujours les contester avec tact.",
    "Daigo a réparé le fourreau que tu avais fendu en servant de levier : tu lui dois un service. Ren te laisse choisir le chemin quand sa hâte l'emporte : rappelle-lui cet accord sans le ridiculiser.",
    "Atteins d'abord la personne ou le mécanisme qu'on ne peut pas rejoindre facilement. Surface est économique ; Goutte passe les réactions d'un démon ; Éclaboussure permet de combattre sur des appuis précaires."],
  daigo: ["Tu plies soigneusement ta veste avant un travail salissant.", "Dis-moi ce qui doit tenir. Je le tiendrai.",
    "Fils d'un fabricant de briques, tu aimais le travail qui laisse une trace. Quand le four familial a attiré un démon, tu as voulu sauver le bâtiment avant les employés ; une ouvrière t'a ramené dehors de force. Tu vis avec des gens capables de te rappeler exactement ce que tu as fait.",
    "Apprendre à protéger sans décider à la place des autres.", "Tu deviens autoritaire quand quelqu'un refuse une consigne de sécurité. Tu peux l'admettre, puis demander ce qui lui manque pour te suivre.",
    "Aoi t'a appris à déplacer un blessé sans lui faire plus mal. Sayo t'a interdit de plaisanter pour couper court aux récits de douleur : tu essaies de l'écouter jusqu'au bout.",
    "Place-toi près des personnes exposées et garde des RP pour les tirer à couvert. Feu Inconscient est ton attaque fiable. Tes soins restent une action, même avec ton talent médical."],
  ren: ["Tu vérifies deux fois le nœud de tes sandales.", "Donnez-moi un signal clair. Je partirai à ce moment-là.",
    "Apprenti messager, tu as porté une demande de secours plus vite que personne lors d'une attaque nocturne ; mais le chemin derrière toi était coupé et ceux qui t'attendaient ont dû se sauver seuls. Ils ont survécu ; leur absence de reproches est plus dure qu'une accusation.",
    "Être utile au bon endroit, pas seulement arriver le premier.", "Tu pars avant d'avoir entendu la fin d'une phrase. Demande parfois à un camarade de te dire quand attendre.",
    "Aoi peut t'arrêter d'un signe convenu. Isamu t'a appris à demander le nom d'une personne avant de lui donner un ordre ; tu lui demandes de parler quand tes mots deviennent trop brusques.",
    "Une charge doit être protégée : annonce-la et demande à un allié de couper la ligne de vue. Toute attaque dirigée contre toi l'interrompt, même esquivée. Foudre de chaleur est immédiate si attendre coûte trop cher."],
  sayo: ["Tu demandes la permission avant de toucher une blessure.", "Montrez-moi où cela commence, pas seulement où cela fait mal.",
    "Tu assistais une sage-femme et connais la peur des familles qui ne peuvent pas payer un soin. Un patient que tu avais cru ivre portait les premières blessures d'une attaque démoniaque. Il a survécu ; tu gardes le souvenir de ton jugement trop rapide.",
    "Que les blessés soient entendus autant que soignés.", "Tu transformes une confidence en problème à résoudre. Demande parfois : « Tu veux une solution, ou que je reste ? »",
    "Daigo te prête sa force quand un soin exige de déplacer quelqu'un ; tu sais qu'il a peur de mal faire. Isamu t'aide à distinguer une explication d'une excuse ; tu lui confies les preuves que tu trouves.",
    "Ta CA est faible : garde tes réactions et reste près d'un couvert. Ta Médecine rend les consommables précieux. Pivoine coûte cher ; Pêche est économique au contact."],
  isamu: ["Tu tiens une pièce entre deux doigts sans la faire tourner.", "Qui a donné son accord, exactement ?",
    "Tu tenais les comptes d'une troupe de théâtre ambulante. Un soir, un notable a utilisé tes belles phrases pour ne pas payer les machinistes. Tu as rendu ta part et quitté la troupe. Ton apprentissage de pourfendeur a été talentueux ; ta formation scolaire, presque inexistante.",
    "Que les engagements puissent être vérifiés.", "Tu sais séduire une salle, mais tu confonds parfois parler au nom des autres et leur laisser la parole. Avant une promesse, demande qui devra en supporter le coût.",
    "Ren t'écoute quand tu demandes une seconde de silence. Sayo retrouve ce que tu ne sais pas déchiffrer ; tu l'aides à mettre ses observations en mots que chacun comprend.",
    "Fais parler les témoins, puis transforme l'accord en action utile. Tes formes coûtent peu, mais tu n'as que 6 RP : ne te place pas seul au milieu du danger."],
};

function pregenPage(p) {
  const [gesture, quote, story, want, flaw, links, advice] = PREGEN_TEXT[p.key];
  return wrap(`<div class="soie-pregen"><img src="${ART}/portraits/${p.key}.webp" alt="${p.name}">
<div><h1>${p.name}</h1><p class="soie-lead">${p.age} · ${p.role} · ${p.breathName}</p>
<p>${gesture} <em>« ${quote} »</em></p></div></div>
<p>${story}</p>
<p><strong>Tu veux :</strong> ${want}<br><strong>Ton travers :</strong> ${flaw}</p>
<h2>Liens</h2><p>${links}</p>
<h2>Conseil de jeu</h2><p>${advice}</p>
<p><small>Formation : ${p.trainer} Corbeau : ${p.crow}.</small></p>`);
}

const PLAYER_PAGES = [
  ["mission", "Mission et tour de jeu", `
<img class="soie-banner" src="${ART}/art/banner.webp" alt="">
<h1>Aide des pourfendeurs</h1>
<p>Deux personnes ont été retrouvées mortes à la filature Minase, les os broyés. Le Corps vous envoie <strong>protéger les vivants et identifier la menace</strong>. Vous êtes cinq pourfendeurs qui ont déjà voyagé ensemble.</p>
<h2>Annoncer une action</h2>
<p>Dites ce que vous cherchez à obtenir, puis comment : « Je cale son bras avant d'ouvrir le bracelet » plutôt que « Je fais Médecine ». Une action évidente et sans risque ne demande pas de jet. Le MJ annonce la difficulté et la conséquence avant un jet risqué.</p>
${table(["Situation", "Que faire ?"], [
  ["Votre tour", "Déplacement 9 m + 1 action. Parler brièvement est libre ; soigner, ouvrir un mécanisme ou récupérer prend l'action."],
  ["Attaque de base", "Depuis la fiche : d20 + bonus contre CA ; égal ou supérieur, les dégâts sont lancés."],
  ["Forme de Souffle", "Depuis la fiche : payer l'E indiquée, pas de jet d'attaque, la cible peut esquiver sauf mention contraire."],
  ["Esquive", "1 RP par attaque esquivable, avant les dégâts. Sans RP : évitement d20 + Finesse, strictement supérieur au jet."],
  ["Porter secours", "2 RP : tirer vers vous une personne à 1,5 m, hors d'une attaque."],
  ["Récupérer", "Hors Concentration, 1 action = +1d8 E. Aucun PV."],
  ["Soigner", "1 action au contact et un consommable de la fiche."],
])}
<h2>Trois réserves différentes</h2>
<p><strong>PV</strong> : les blessures ; à 0, mort selon le livre sauf variante annoncée. <strong>E</strong> : l'effort ; à 0, pas d'attaque et récupération obligatoire. <strong>RP</strong> : les défenses immédiates ; elles reviennent après huit heures de repos, pas après un combat.</p>
<p><small>Conventions : Concentration activée ou arrêtée gratuitement sur son tour, maintien 1 E en fin de tour. Initiative d20 + Vitesse − 1. Une frappe Nichirin annoncée à la tête décapite si elle ramène le démon à 0 PV.</small></p>`],
  ["team", "Plan public et rôles", `
<h1>Agir ensemble dans la filature</h1>
<img src="${ART}/maps/filature-minase-plan.webp" alt="Plan de la filature Minase">
<p>A · Cour (sortie) — B · Atelier — C · Chaufferie — D · Bureau — E · Magasin — F · Quai sur la rivière. Les murs bloquent les attaques, même à très longue portée.</p>
${table(["Personnage", "Demandez-lui de…"], [
  ["Aoi · Eau", "chercher un trajet sûr, atteindre les appuis difficiles, repérer un bruit ou une odeur."],
  ["Daigo · Flamme", "tenir un passage, déplacer un obstacle, protéger une personne au contact."],
  ["Ren · Foudre", "intercepter une fuite, préparer une frappe puissante — protégez-le pendant sa charge."],
  ["Sayo · Fleur", "examiner une blessure, soigner, comprendre les indices."],
  ["Isamu · Vent", "faire préciser un engagement, écouter les témoins, rompre un obstacle."],
])}
<p>Annoncez votre intention pendant le tour précédent. Dites « je récupère » avant d'épuiser votre endurance. Demandez ce qui menace une personne avant de frapper près d'elle.</p>
<p>Vous n'êtes pas obligés de tout résoudre seuls : les habitants savent ouvrir les portes, conduire leurs machines et s'entraider. Donnez-leur une tâche concrète. Si une description devient inconfortable, demandez une pause ou une version moins détaillée.</p>`],
];

const PDFS = [
  ["mj", "Dossier MJ (14 p.)", "01_Le_poids_de_la_soie_Scenario_MJ.pdf"],
  ["aidemj", "Aide MJ (3 p.)", "04_Le_poids_de_la_soie_Aide_MJ.pdf"],
  ["pregens", "Cinq prétirés (10 p.)", "02_Le_poids_de_la_soie_Cinq_personnages.pdf"],
  ["aidepj", "Aide PJ (2 p.)", "03_Le_poids_de_la_soie_Aide_PJ.pdf"],
];

const OBSERVER = { default: 2 };
const text = (journal, key, name, html, sort) => ({ _id: P(journal, key), name, type: "text", sort, title: { show: false, level: 1 }, text: { format: 1, content: wrap(html) }, flags: { [MID]: { key } } });

export function buildJournals() {
  const sorted = (list, fn) => list.map((entry, i) => fn(entry, (i + 1) * 100000));
  return [
    { _id: JOURNAL_IDS.guide, name: "Le poids de la soie — Guide du MJ", sort: 100000,
      pages: sorted(GUIDE, ([key, name, html], sort) => text("guide", key, name, html, sort)), flags: { [MID]: { key: "guide" } } },
    { _id: JOURNAL_IDS.zones, name: "Filature Minase — lieux", sort: 200000,
      pages: sorted(ZONES, ([key, name, what, investigation, finale], sort) => text("zones", key, name,
        `<h1>${name}</h1><p class="soie-lead">${what}</p><h2>Pendant l'enquête</h2><p>${investigation}</p><h2>Pendant le final</h2><p>${finale}</p>`, sort)),
      flags: { [MID]: { key: "zones" } } },
    { _id: JOURNAL_IDS.handouts, name: "Pièces à remettre", sort: 300000,
      pages: sorted(HANDOUTS, ([key, name, gm], sort) => ({
        _id: P("handouts", key), name, type: "image", sort, src: `${ART}/handouts/${key}.webp`,
        image: { caption: HANDOUT_TEXT[key].replace(/<br>/g, " — ").replace(/<\/?em>/g, "") },
        title: { show: true, level: 1 }, flags: { [MID]: { key, gmNote: gm } },
      })), flags: { [MID]: { key: "handouts" } } },
    { _id: JOURNAL_IDS.players, name: "Aide des joueurs", sort: 400000, ownership: OBSERVER,
      pages: sorted(PLAYER_PAGES, ([key, name, html], sort) => text("players", key, name, html, sort)), flags: { [MID]: { key: "players" } } },
    { _id: JOURNAL_IDS.pregens, name: "Prétirés — qui êtes-vous ?", sort: 500000, ownership: OBSERVER,
      pages: sorted(PREGENS, (p, sort) => ({ _id: P("pregens", p.key), name: p.name, type: "text", sort, title: { show: false, level: 1 },
        text: { format: 1, content: pregenPage(p) }, flags: { [MID]: { key: p.key } } })), flags: { [MID]: { key: "pregens" } } },
    { _id: JOURNAL_IDS.pdf, name: "Documents imprimables", sort: 600000,
      pages: sorted(PDFS, ([key, name, file], sort) => ({ _id: P("pdf", key), name, type: "pdf", sort, src: `${PDF}/${file}`, title: { show: true, level: 1 } })),
      flags: { [MID]: { key: "pdf" } } },
  ];
}

export const ZONE_PAGE = key => ({ entryId: JOURNAL_IDS.zones, pageId: P("zones", key) });
export const HANDOUT_PAGES = HANDOUTS.map(([key, name]) => ({ key, name, journal: JOURNAL_IDS.handouts, page: P("handouts", key) }));
