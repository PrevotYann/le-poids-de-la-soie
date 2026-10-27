# Versions

## 2.1.0

- Nouvelle direction artistique inspirée des visuels d'origine : douze personnages redessinés dans le style anime de Kimetsu no Yaiba, avec leurs portraits et tokens assortis.
- Couverture, bannière, huit icônes d'objets et contrepoids B/C/E réillustrés ; lettres des contrepoids lisibles à l'intérieur des tokens.
- Carte de la filature repeinte, miniature et plan légendé actualisés. Dimensions de toutes les images, échelle, murs, neuf portes et placements conservés.
- Pièces à remettre, PDF et pastilles de zones conservés à l'identique. Les chemins d'images restent les mêmes : les mondes déjà importés utilisent aussi les nouveaux visuels.
- `npm run art` dérive les tokens et miniatures des nouvelles illustrations sans les remplacer par les anciens dessins procéduraux ; prompts archivés dans `tools/art/prompts.json`.
- Publication automatique de la version du manifeste lors de son changement sur `main`, avec création du tag, archive installable, manifeste Foundry, notes et somme SHA-256. Déclenchement par tag et relance manuelle également disponibles ; une version déjà publiée est conservée.
- Vérification avant publication des versions, URLs, dimensions, transparence, références du compendium et intégrité des fichiers de l'archive.

## 2.0.0

**Foundry VTT 14 et Breathe and Live 0.6.**

- Une seule aventure à importer : chaque onglet (acteurs, objets, journaux, scène, macros) reçoit un dossier « Le poids de la soie ». Les acteurs sont rangés en Prétirés, Habitants, Démons et Contrepoids.
- Prétirés reconstruits avec les données du système 0.6 : formes de Souffle, katana, pistolet, soins, uniforme, talents (Agilité, Force, Intelligence supérieure, Connaissances médicales, Esprit) et sens. Les bonus de talents sont désormais calculés par la fiche, en combat comme hors combat.
- Goro et Shigure : PV, CA, RP, BDP et actions conformes au scénario avec les formules du système ; morsures avec profil imprimé (d20 + 5 et d20 + 7) ; Poids jeté et Sceau de charge comme arts sanguinaires.
- Les trois contrepoids sont des acteurs ciblables (CA 10, 12 PV) ; leur nommage suit le scénario (B, E, C).
- Battlemap illustrée de la filature, à l'échelle du système (1,5 m par case), avec murs, neuf portes, éclairages, tokens placés et pastilles A-F liées aux lieux.
- Tableau de bord MJ : Pression automatique en fin de round, poids brisés, vanne, engagements, captives, soin d'1d8 et sceau de Shigure, alertes à 60 et 25 PV, arts à distance désactivés quand le réseau est coupé.
- Journaux réécrits : démarrage rapide, une page par scène avec textes à lire et tableaux de décisions, lieux, branches et épilogue, règles, aide des joueurs, identités des prétirés, pièces à remettre illustrées.
- Portraits, tokens, icônes, pièces à remettre et couverture originaux.
- Mises à jour automatiques via les releases GitHub.
- Supprimé : les cinq compendiums de la 1.x et les objets « PDF » (les PDF restent dans le journal Documents imprimables).

## 1.0.0

Première version pour Foundry VTT 12 : prétirés, PNJ, journaux, objets, macros et scène schématique.
