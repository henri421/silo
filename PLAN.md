# Plan d'implémentation de `pressions-silos`

**Objectif.** Un outil web hors ligne, publié sur GitHub Pages, qui rend les actions de l'EN 1991-4 sur les parois et le fond d'un silo circulaire ou rectangulaire, avec profils graphiques et fichiers CSV prêts pour un modèle aux éléments finis.

**Architecture.** Noyau pur en TypeScript dans `src/`, sans DOM et sans dépendance de production. Interface dans `app/`, qui ne calcule rien. Primitives communes tirées d'`aedificium-ui` (dépendance Git épinglée sur une étiquette, en `devDependencies`). Même organisation que `charges-climatiques`.

**Pile.** TypeScript strict, Vite, Vitest (+ jsdom pour `tests/app/`), vite-plugin-pwa. Aucune autre dépendance sans accord.

**Règle de chaque lot.** Les tests s'écrivent d'abord, avec les valeurs de `docs/validation/` en dur (tolérance relative 1e−4 sauf mention). Un lot se termine quand `npm run typecheck`, `npm test` et `npm run build` passent. Ensuite on s'arrête (voir `CLAUDE.md`).

## Lot 0 : squelette

- [ ] Cloner `charges-climatiques` à côté et en reprendre `package.json` (nom, scripts), `tsconfig.json`, `vite.config.ts` (racine `app`, sortie `docs`, page anglaise `app/en/`, PWA avec nom et icône propres), `.gitignore` et `.github/workflows/pages.yml`.
- [ ] Ajouter `aedificium-ui` à la dernière étiquette publiée (lire la liste des étiquettes du dépôt `henri421/aedificium-ui`).
- [ ] Créer `src/index.ts`, `app/index.html` avec la barre commune et le lien vers le hub, `app/src/main.ts`, `app/src/style.css` (jetons d'`aedificium-ui`).
- [ ] Icône SVG propre au silo (un cylindre en élévation avec un diagramme de pression), dans le style des icônes de `WebAedificium/icones/`.
- [ ] Un test qui vérifie que le `:root` de la feuille de style concorde avec `JETONS`, comme dans `assemblages-ec3`.
- [ ] La CI passe sur une page vide.

## Lot 1 : géométrie, matériau, classement

- [ ] `src/model/` : types `Silo`, `Materiau`, `Exploitation`, `Discretisation` (SPEC §2), avec validation et erreurs nommées (SPEC §11).
- [ ] `src/materiaux/bibliotheque.json`, son chargeur et `LISEZMOI.md` (SPEC §3.3). Une valeur sans source bloque.
- [ ] `src/norms/en1991-4-recommande.ts` : profil des valeurs recommandées (tableau 2.1, C_h, C_w, b = 0,2, C_b, θ_c, seuils d'excentrement), chacune avec sa clause.
- [ ] `src/classement/` : A, U, d_c ; élancement ; classe (avec P5) ; paroi mince ou épaisse ; h_o et h_tp ; limites de 1.1(3).
- [ ] `src/proprietes/` : valeurs caractéristiques (4.1 à 4.6) et combinaisons C1, C2, C3, T1, T2, X (SPEC §3.2).
- [ ] Tests sur les données de V1 à V4 : A, U, d_c, hc/dc, capacité, classe, K et μ caractéristiques, h_o, h_tp.

## Lot 2 : parois verticales, cas symétriques

- [ ] `src/parois/janssen.ts` (élancés, SPEC §5.1) et `src/parois/janssen-modifie.ts` (SPEC §5.2), avec n_zSk.
- [ ] `src/parois/vidange.ts` : C_h et C_w selon l'élancement, la classe et `vidangeParLeHaut` (SPEC §5.3).
- [ ] Gestion de `ecoulementEnCheminee` : cas de vidange non applicables avec motif.
- [ ] Tests : V1 (z = 1, 5, 10, 20 ; z_o et p_ho des trois combinaisons ; n_zSk), V3 (Y_R, z_V, C_h, C_w), et p_w et n_zSk en C2.

## Lot 3 : action localisée

- [ ] `src/parois/localisee.ts` : C_pf et C_pe avec leurs branches (SPEC §5.4) et la matrice d'applicabilité.
- [ ] Formes : non circulaire (0,36), circulaire épaisse (carrés, p/7, z_p), circulaire mince (cosθ, F_pf, z_p), majorations uniformes 5.38 à 5.45 avec leurs conditions.
- [ ] Tests : V1 (C_pf, C_pe, majorations), V2 (C_pf, C_pe avec E = 0,667, p_pf et p_pfi, ζ, p_hf,u et p_he,u), V3 (C_pf, C_pe intermédiaire), un cas peu élancé où l'action est nulle avec son motif.

## Lot 4 : fond et trémie

- [ ] `src/fond/transition.ts` : p_vft et C_b (SPEC §6.1).
- [ ] `src/fond/fond-plat.ts` : élancé et 6.2.2 avec le facteur d'interpolation de l'éq. 6.13.
- [ ] `src/fond/tremie.ts` : classement profond ou peu profond, S, p_v(x) avec le cas limite n = 1, F_f, F_e de Walker, p_n et p_t (SPEC §6.3).
- [ ] Tests : V1 (fond plat, C_b = 1,0 et 1,2), V3 (p_vsq), V4 (remplissage et vidange en trois points), cas n = 1, erreur φ_wh > φ_i.

## Lot 5 : vidange à grand excentrement

- [ ] **Avant de coder** : faire confirmer le point ouvert P4 par l'utilisateur.
- [ ] `src/parois/excentree.ts` : déclenchement (5.2.4.1, 5.3.4), zones en θ, valeurs (SPEC §5.5) ; erreur explicite en classe 3.
- [ ] Tests : V2 aux deux niveaux, déclenchement par e_o et par e_f, classe 3 refusée avec cas symétriques conservés.

## Lot 6 : assemblage des cas et discrétisation

- [ ] `src/cas/` : construction de REMP, VID, VID_EXC, FOND_REMP, FOND_VID avec statut, combinaison et motif (SPEC §7).
- [ ] `src/discretisation/bandes.ts` : bandes Δz, valeurs haut, bas et constante, cotes Z, contrôle trapèzes contre intégrale exacte.
- [ ] Tests : bandes de V1 (bandes 1, 2, 3 et 20, somme, intégrale, écart), dernière bande plus courte quand hc n'est pas multiple de Δz.

## Lot 7 : interface

- [ ] Formulaire par blocs (géométrie, fond, matériau, parois, exploitation, discrétisation), au style de `DESIGN.md`. Recalcul en continu, pas de bouton « calculer ».
- [ ] Synthèse, liste des cas avec statut, points ouverts appliqués.
- [ ] Dessins SVG : élévation avec diagrammes, profils, vue en plan, trémie (SPEC §8.1). Les dessins sont des fonctions pures testées sous jsdom.
- [ ] Enregistrement de projet par `aedificium-ui`.

## Lot 8 : exports

- [ ] Les cinq CSV de SPEC §8.2, avec bloc d'en-tête et aucune ligne omise.
- [ ] JSON versionné, note HTML imprimable, SVG et PNG des graphiques.
- [ ] Tests : en-têtes, nombre de lignes, valeurs de V1 dans `bandes.csv`, présence des motifs des cas non applicables.

## Lot 9 : version anglaise, PWA, publication

- [ ] Page `app/en/` et textes anglais (sur le modèle de `charges-climatiques`).
- [ ] Installation PWA et fonctionnement hors ligne vérifiés.
- [ ] README complet, `docs/validation/` relié, publication GitHub Pages par la CI.
- [ ] Dans `WebAedificium` (autre dépôt, branche séparée) : une ligne dans le tableau du README, une entrée dans `OUTILS_EXTERNES` et `MENU`, une icône dans `icones/`.

## Lots ultérieurs, hors v1

- Voie simplifiée de la classe 1 (valeurs moyennes, éq. 5.23, 5.24, 5.88, 5.89, 6.4, 6.6).
- Vidange excentrée de classe 3 (5.2.4.3) et grand excentrement de remplissage (5.3.3).
- Annexe G pour les trémies.
- Bibliothèque de matériaux étendue, au fil de la lecture du tableau E.1 par l'utilisateur.
- Export direct vers un format d'échange de logiciel EF, si l'utilisateur en fournit la spécification.
