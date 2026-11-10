# Plan d'implémentation de `silo`

**Objectif.** Un outil web hors ligne, publié sur GitHub Pages, qui rend les actions de l'EN 1991-4 sur les parois et le fond d'un silo circulaire ou rectangulaire, avec profils graphiques et fichiers CSV prêts pour un modèle aux éléments finis.

**Architecture.** Noyau pur en TypeScript dans `src/`, sans DOM et sans dépendance de production. Interface dans `app/`, qui ne calcule rien. Primitives communes tirées d'`aedificium-ui` (dépendance Git épinglée sur une étiquette, en `devDependencies`). Même organisation que `charges-climatiques`.

**Pile.** TypeScript strict, Vite, Vitest (+ jsdom pour `tests/app/`), vite-plugin-pwa. Aucune autre dépendance sans accord.

**Règle de chaque lot.** Les tests s'écrivent d'abord, avec les valeurs de `docs/validation/` en dur (tolérance relative 1e−4 sauf mention). Un lot se termine quand `npm run typecheck`, `npm test` et `npm run build` passent. Ensuite on s'arrête (voir `CLAUDE.md`).

## Lot 0 : squelette

- [x] Cloner `charges-climatiques` à côté et en reprendre `package.json` (nom, scripts), `tsconfig.json`, `vite.config.ts` (racine `app`, sortie `docs`, page anglaise `app/en/`, PWA avec nom et icône propres), `.gitignore` et `.github/workflows/pages.yml`.
- [x] Ajouter `aedificium-ui` à la dernière étiquette publiée (lire la liste des étiquettes du dépôt `henri421/aedificium-ui`).
- [x] Créer `src/index.ts`, `app/index.html` avec la barre commune et le lien vers le hub, `app/src/main.ts`, `app/src/style.css` (jetons d'`aedificium-ui`).
- [x] Icône SVG propre au silo (un cylindre en élévation avec un diagramme de pression), dans le style des icônes de `WebAedificium/icones/`.
- [x] Un test qui vérifie que le `:root` de la feuille de style concorde avec `JETONS`, comme dans `assemblages-ec3`.
- [x] La CI passe sur une page vide.

### Consignes d'exécution du lot 0 (séance `claude-ds`)

Branche : `lot-0-squelette`, déjà créée. Modèle : `../charges-climatiques`, déjà cloné à côté de ce dépôt ; ne pas le recloner. L'icône (`app/public/icone.svg` et les trois PNG) est déjà fournie : ne pas la redessiner.

Tests d'acceptation, déjà écrits, **à ne jamais modifier** : `tests/index.test.ts`, `tests/app/configuration.test.ts`, `tests/app/pages.test.ts`, `tests/app/jetons.test.ts`.

**T0.1 Configuration.**
Fichiers : `package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts`, `.gitignore`, `.github/workflows/pages.yml`.
* Reprendre ceux de `charges-climatiques` : mêmes scripts et mêmes `devDependencies` (versions comprises), avec `"name": "silo"`, `"version": "0.1.0"`. Aucune autre dépendance.
* `vite.config.ts` identique, sauf le manifeste : `name: 'Silos, pressions des matériaux ensilés selon l EN 1991-4'`, `short_name: 'Silos'`, `description: 'Pressions des matériaux ensilés sur les parois et les fonds des silos, profils et fichiers CSV pour un modèle aux éléments finis, selon l EN 1991-4.'`. Les commentaires citant `/charges-climatiques/` deviennent `/silo/`.
* `.gitignore` : ajouter une ligne `*.pdf` (le PDF de la norme ne doit jamais entrer dans le dépôt).
* Puis `npm install`.
* Test : `npx vitest run tests/app/configuration.test.ts`. Attendu : 7 tests passent.

**T0.2 Noyau vide** (dépend de T0.1).
Fichier : `src/index.ts`. En-tête de module sur le modèle de `charges-climatiques/src/index.ts` (objet de l'outil, unités du noyau : m, kN/m³, kPa, kN/m, angles en degrés en entrée), et un seul export : `export const NORME = 'EN 1991-4:2006';`.
* Test : `npx vitest run tests/index.test.ts`. Attendu : 1 test passe.

**T0.3 Pages et interface vide** (dépend de T0.1).
Fichiers : `app/index.html`, `app/en/index.html`, `app/src/main.ts`, `app/src/pwa.ts`, `app/src/textes.ts`, `app/src/style.css`.
* Les deux pages reprennent la structure de celles de `charges-climatiques` : `<head>` identique (sauf le titre), barre commune `nav.barre` avec `Aedificium &middot; Actions`, lien vers le hub et lien de langue, `<header>` avec `h1`, `p.sous-titre` et `p.avertissement`, `div.feuilles[data-role="feuilles"]`, un `<main>` qui ne contient qu'une section `#saisie` portant le paragraphe « Interface en construction. » (en anglais : « Interface under construction. »), un `<footer>` qui liste le hors périmètre de `SPEC.md` §10 en une phrase, puis le script.
* Textes imposés. Titre : `Pressions dans les silos, EN 1991-4` (en anglais : `Pressures in silos, EN 1991-4`). `h1` : `Pressions dans les silos` (en anglais : `Pressures in silos`). Sous-titre : « Actions des matériaux ensilés sur les parois et les fonds des silos circulaires et rectangulaires (EN 1991-4:2006), rendues cas par cas et niveau par niveau. » Avertissement : « Aide au calcul. Toutes les valeurs sont caractéristiques : les coefficients partiels et les combinaisons de l'EN 1990 restent à appliquer. » En anglais, traduire fidèlement ; le mot `characteristic` doit figurer dans l'avertissement.
* Aucun tiret cadratin dans les pages ni dans `textes.ts`.
* `style.css` : le bloc `:root` recopié **à l'identique** de celui de `charges-climatiques` (il doit concorder avec `JETONS`), puis seulement les règles de base utiles à cette page vide (corps, barre, en-tête, feuilles, main, footer), sans aucune couleur en dur hors de `:root`.
* `main.ts` : importe `style.css`, appelle `definirLangue(langueDuDocument())` d'`aedificium-ui`, branche la barre des feuilles par `brancherFeuilles` comme dans `charges-climatiques` si c'est possible sans calcul (sinon, laisser un commentaire et le signaler dans `HANDOFF.md`), puis appelle `enregistrerServiceWorker()`.
* `pwa.ts` : copie de celui de `charges-climatiques`. `textes.ts` : seulement `messages.nouvelleVersion` en français et en anglais, sur le modèle de `textes()` de `charges-climatiques`.
* Tests : `npx vitest run tests/app/pages.test.ts tests/app/jetons.test.ts`. Attendu : 10 tests passent.

**T0.4 Vérification d'ensemble** (dépend de T0.1 à T0.3).
* `npm run typecheck`, `npm test`, `npm run build` passent tous les trois ; `docs/` ne contient alors que la construction et `docs/validation/`, et `git status` ne montre aucun fichier construit.
* Cocher les cases du lot 0 ci-dessus. Dans `README.md`, section « Ce que l'outil rend », écrire : « Lot 0 : squelette publiable, sans calcul. »
* Commits petits, en français, avec l'identité locale déjà configurée. Ne pas pousser.

**Décisions laissées à l'exécutant** : le détail des règles CSS de base, le libellé exact de la phrase du pied de page et la traduction anglaise, dans le respect des textes imposés.

**Interdit** : modifier les tests ou `docs/validation/`, ajouter une dépendance, toucher à `SPEC.md`, `CLAUDE.md` ou `CONVENTIONS.md`, commencer le lot 1, pousser.

**Fin du lot** : écrire `HANDOFF.md` (fichiers modifiés, décisions, points douteux, statut des tests avec les commandes lancées), puis s'arrêter.

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
