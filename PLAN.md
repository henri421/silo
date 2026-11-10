# Plan d'implémentation de `silo`

**Objectif.** Un outil web hors ligne, publié sur GitHub Pages, qui rend les actions de l'EN 1991-4 sur les parois et le fond d'un silo circulaire ou rectangulaire, avec profils graphiques et fichiers CSV prêts pour un modèle aux éléments finis.

**Architecture.** Noyau pur en TypeScript dans `src/`, sans DOM et sans dépendance de production. Interface dans `app/`, qui ne calcule rien. Primitives communes tirées d'`aedificium-ui` (dépendance Git épinglée sur une étiquette, en `devDependencies`). Même organisation que `charges-climatiques`.

**Pile.** TypeScript strict, Vite, Vitest (+ jsdom pour `tests/app/`), vite-plugin-pwa. Aucune autre dépendance sans accord.

**Règle de chaque lot.** Les tests s'écrivent d'abord, avec les valeurs de `docs/validation/` en dur (tolérance relative 1e−4 sauf mention, ou écart absolu d'au plus 5e−5 puisque les valeurs sont arrondies à 4 décimales). Un lot se termine quand `npm run typecheck`, `npm test` et `npm run build` passent. Ensuite on s'arrête (voir `CLAUDE.md`).

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

- [x] `src/model/` : types `Silo`, `Materiau`, `Exploitation`, `Discretisation` (SPEC §2), avec validation et erreurs nommées (SPEC §11).
- [x] `src/materiaux/bibliotheque.json`, son chargeur et `LISEZMOI.md` (SPEC §3.3). Une valeur sans source bloque.
- [x] `src/norms/en1991-4-recommande.ts` : profil des valeurs recommandées (tableau 2.1, C_h, C_w, b = 0,2, C_b, θ_c, seuils d'excentrement), chacune avec sa clause.
- [x] `src/classement/` : A, U, d_c ; élancement ; classe (avec P5) ; paroi mince ou épaisse ; h_o et h_tp ; limites de 1.1(3).
- [x] `src/proprietes/` : valeurs caractéristiques (4.1 à 4.6) et combinaisons C1, C2, C3, T1, T2, X (SPEC §3.2).
- [x] Tests sur les données de V1 à V4 : A, U, d_c, hc/dc, capacité, classe, K et μ caractéristiques, h_o, h_tp.

### Consignes d'exécution du lot 1 (séance `claude-ds`)

Branche : `lot-1-geometrie`, déjà créée. Les interfaces sont **déjà écrites** par la séance de conception : `src/model/types.ts` (données et résultats) et `src/norms/profil.ts` (type `ProfilSilos`). Les implémenter sans changer leurs signatures ; un manque doit être signalé dans `HANDOFF.md`, pas contourné.

Tests d'acceptation, **à ne jamais modifier** : `tests/fixtures.ts`, `tests/model/valider.test.ts`, `tests/materiaux/bibliotheque.test.ts`, `tests/norms/profil.test.ts`, `tests/classement/geometrie.test.ts`, `tests/classement/classement.test.ts`, `tests/proprietes/proprietes.test.ts`, et ceux du lot 0.

Règles communes : chaque fonction exportée porte un commentaire qui dit ce qu'elle calcule et sa clause ; unités en tête de module ; aucun accent dans le code ; angles en degrés dans les données, convertis en radians à l'usage. Les messages d'erreur sont **en français sans accents**, nomment la grandeur, son unité et, s'il y a lieu, la clause.

**T1.1 Validation** : `src/model/valider.ts`, `export function validerDonnees(d: DonneesSilo): void`.
* Messages imposés (les autres sur le même modèle) :
  * `Le diametre interieur d doit etre un nombre strictement positif (m).`
  * `L epaisseur de paroi t doit etre un nombre strictement positif (m).` (obligatoire pour un silo circulaire)
  * `Le grand cote a doit etre ...`, `Le petit cote b doit etre ...`, `La hauteur de paroi verticale hc doit etre ...` (m) ; `Le silo rectangulaire exige a >= b (m).`
  * Trémie : `L angle de tremie beta doit etre un nombre strictement compris entre 0 et 90 (deg).` ; `Une tremie conique exige un silo circulaire.` ; `Une tremie pyramidale ou en biseau exige un silo rectangulaire.` ; `Une tremie pyramidale carree exige a = b (m).`
  * Excentrements `e_f`, `e_t`, `e_o` : nombres finis positifs ou nuls (m), au plus égaux à d/2 pour un cercle et à a/2 pour un rectangle (le message nomme la grandeur et la limite).
  * Matériau : `gamma_l`, `gamma_u`, `K_m`, `mu_m` de chaque catégorie, `C_op` strictement positifs ; `phi_r` et `phi_im` strictement entre 0 et 90 (deg) ; `a_phi`, `a_K`, `a_mu` au moins égaux à 1. Le message nomme la grandeur.
  * Discrétisation : `dz` strictement positif (m) ; `pointsProfil` entier au moins égal à 101.
* Test : `npx vitest run tests/model/valider.test.ts` (11 tests).

**T1.2 Bibliothèque** : `src/materiaux/bibliotheque.json`, `src/materiaux/bibliotheque.ts`, `src/materiaux/LISEZMOI.md`.
* Format du JSON : `{ "format": "silo-materiaux", "version": 1, "materiaux": [ { "id", "nom", "valeurs": { "<champ>": { "valeur": <nombre>, "source": "<texte>" } } } ] }`, avec les douze champs `gamma_l, gamma_u, phi_r, phi_im, a_phi, K_m, a_K, mu_m_D1, mu_m_D2, mu_m_D3, a_mu, C_op`. Les deux matériaux sont ceux de SPEC §3.3, identifiants `defaut` (nom « Matériau par défaut ») et `sable` (« Sable »), chaque source valant exactement `EN 1991-4:2006, tableau E.1`.
* `materiauxDepuisJson(json: unknown): Materiau[]` : vérifie `format` et `version` (message qui contient `format` ou `version`), chaque champ présent, chaque valeur finie, chaque source non vide après `trim()`. Le message d'erreur nomme le matériau et le champ. `Materiau.sources` reprend les sources par nom de champ.
* `bibliotheque(): Materiau[]` lit le JSON livré (import JSON de TypeScript, `resolveJsonModule` à activer dans `tsconfig.json` si nécessaire) ; `materiauParId(id: string): Materiau` lève une erreur qui nomme l'identifiant inconnu.
* `LISEZMOI.md` : comment ajouter un matériau en relisant le tableau E.1 de son propre exemplaire (une valeur par champ, avec sa source), sans recopier le tableau.
* Test : `npx vitest run tests/materiaux/bibliotheque.test.ts` (10 tests).

**T1.3 Profil recommandé** : `src/norms/profil.ts` (ajouter `verifierProfil`), `src/norms/en1991-4-recommande.ts`.
* `en1991_4Recommande(): ProfilSilos` rend un objet neuf à chaque appel. `nom: 'EN 1991-4, valeurs recommandées'`, `date: '2026-11-10'`, un `perimetre` en une phrase. Valeurs et sources (préfixe `EN 1991-4:2006, ` puis la clause) :

  | Clé | Valeur | Clause |
  |-|-|-|
  | capaciteClasse1 | 100 | tableau 2.1 |
  | capaciteClasse3 | 10000 | tableau 2.1 |
  | capaciteExcentrement | 1000 | tableau 2.1 |
  | excentrementClasse3 | 0.25 | tableau 2.1 |
  | C_h_elance | 1.15 | éq. 5.21 |
  | C_w_elance | 1.1 | éq. 5.22 |
  | C_h_pente | 0.15 | éq. 5.85 |
  | C_w_pente | 0.1 | éq. 5.86 |
  | b_tremie | 0.2 | éq. 6.17 |
  | C_b | 1.0 | 6.1.2(4) |
  | C_b_majore | 1.2 | 6.1.2(5) et (6) |
  | theta_c | 35 | 5.2.4.2 |
  | excentrementGrand | 0.25 | 5.2.4.1(2) |
  | elancementExcentrementRemplissage | 4.0 | 5.2.4.1(2) |
  | minceurParoi | 200 | 5.2.1.4(1) |
  | excentrementPeuElance | 0.1 | 5.3.2.2(4) |

* `verifierProfil(p: ProfilSilos): void` lève une erreur qui nomme la clé si une valeur n'est pas finie ou si une source est vide après `trim()`.
* Test : `npx vitest run tests/norms/profil.test.ts` (6 tests).

**T1.4 Géométrie** : `src/classement/geometrie.ts`.
* `grandeursGeometriques(silo): Geometrie` (SPEC §4.1, `r = d_c / 2`).
* `hauteurTremie(silo): number | null` : `null` pour un fond plat, sinon `(d_c / 2) / tan(beta)` jusqu'à la pointe virtuelle, pour toutes les formes (la pente donnée est la plus forte, 6.1.2(7)).
* `volumeTremie(silo): number` : 0 pour un fond plat ; cône `π r² h_h / 3` ; pyramide `a b h_h / 3` ; biseau `a b h_h / 2`.
* `talus(silo, phi_r_deg): { h_o, h_tp }` : cercle `h_o = r tanφ_r / 3`, `h_tp = r tanφ_r` (éq. 5.77) ; rectangle `h_o = d_c tanφ_r / 4`, `h_tp = d_c tanφ_r / 2` (éq. 5.78).
* Test : `npx vitest run tests/classement/geometrie.test.ts` (7 tests).

**T1.5 Classement** : `src/classement/classement.ts`, `export function classer(d: DonneesSilo, p: ProfilSilos): Classement`.
* Appelle d'abord `validerDonnees(d)` et `verifierProfil(p)`.
* Élancement selon SPEC §4.2. Erreurs, avec `hc/dc` écrit avec deux décimales et une virgule :
  * fond plat et `hc/dc ≤ 0,4` : `hc/dc = 0,35 avec fond plat : magasin de stockage, hors perimetre (EN 1991-4, 5.4).` ;
  * trémie et `hc/dc ≤ 0,4` : `hc/dc = 0,33 avec tremie : cas non tranche par 5.1(2), hors perimetre (point ouvert P6).`
* Limites de 1.1(3), avec `h_b = hc + h_h` (`hc` pour un fond plat), testées dans cet ordre : `d_c < 60 m`, `h_b < 100 m`, `h_b/d_c < 10`. Messages sur le modèle : `d_c = 70,00 m atteint la limite de 60 m (EN 1991-4, 1.1(3)).`, `h_b = 101,00 m atteint la limite de 100 m (EN 1991-4, 1.1(3)).`, `h_b/d_c = 12,50 atteint la limite de 10 (EN 1991-4, 1.1(3)).`
* Capacité `gamma_u (A hc + volumeTremie) / 9,81` en tonnes (P5), avec `const G = 9.81` nommée.
* Classe du tableau 2.1 avec les seuils du profil : 3 si capacité > capaciteClasse3 ; ou capacité > capaciteExcentrement et `e_o/d_c > excentrementClasse3` ; ou capacité > capaciteExcentrement, silo peu élancé et `e_t/d_c > excentrementClasse3` (`e_t` vaut `e_f` s'il est absent). Sinon 1 si capacité < capaciteClasse1, sinon 2. Les comparaisons sont strictes, comme dans SPEC §4.3.
* `classeDeCalcul = max(classeCalculee, classeImposee)` ; `procedures = classeDeCalcul === 3 ? 3 : 2`. `motifsClasse` : au moins une phrase en français accentué qui dit pourquoi ; pour une classe 1, une phrase qui cite `2.5(3)` (« calculée avec les procédures de la classe 2 »).
* `paroi` : `null` pour un rectangle ; `mince` si `d_c / t > minceurParoi`, `epaisse` sinon.
* `h_o`, `h_tp` par `talus(silo, materiau.phi_r)`.
* Test : `npx vitest run tests/classement/classement.test.ts` (22 tests).

**T1.6 Propriétés** : `src/proprietes/caracteristiques.ts` et `src/proprietes/combinaisons.ts`.
* `valeursCaracteristiques(m: Materiau, parois: Parois): ValeursCaracteristiques` selon SPEC §3.1 ; `mu_*` sur `parois.verticale`, `mu_h_*` sur `parois.tremie`.
* `combinaison(id: IdCombinaison, v: ValeursCaracteristiques, m: Materiau): Combinaison`, `gamma = m.gamma_u`, selon SPEC §3.2. Libellés exacts : `C1 pression normale max`, `C2 frottement max`, `C3 charge verticale max`, `T1 trémie remplissage`, `T2 trémie vidange`, `X vidange excentrée`. `mu_h` vaut `mu_h_inf` pour toutes les combinaisons. Valeurs : C1 (K sup, μ inf, φ inf) ; C2 (K sup, μ sup, φ inf) ; C3 (K inf, μ inf, φ sup) ; T1 (K inf, μ inf, φ inf) ; T2 (K sup, μ inf, φ sup ; P2) ; X (K sup, μ inf, φ sup ; P1). Le commentaire de T2 et de X cite le point ouvert appliqué.
* Test : `npx vitest run tests/proprietes/proprietes.test.ts` (8 tests).

**T1.7 Exports et fin de lot.**
* `src/index.ts` réexporte les types de `src/model/types.ts` et `src/norms/profil.ts`, et `validerDonnees`, `bibliotheque`, `materiauParId`, `materiauxDepuisJson`, `en1991_4Recommande`, `verifierProfil`, `grandeursGeometriques`, `hauteurTremie`, `volumeTremie`, `talus`, `classer`, `valeursCaracteristiques`, `combinaison`, en gardant `NORME`.
* `npm run typecheck`, `npm test`, `npm run build` passent. Cocher les cases du lot 1. Section « Ce que l'outil rend » du README : une ligne pour le lot 1 (classement et propriétés, sans pressions encore).

**Décisions laissées à l'exécutant** : le découpage interne en fonctions privées, la formulation des messages non imposés (même modèle), la phrase des motifs de classe.

**Interdit** : modifier les tests, `docs/validation/`, `src/model/types.ts`, les types de `src/norms/profil.ts`, `SPEC.md`, `CLAUDE.md`, `CONVENTIONS.md` ; ajouter une dépendance ; commencer le lot 2 ; pousser.

**Fin du lot** : ajouter à `HANDOFF.md` une section « Lot 1 » (mêmes rubriques que le lot 0), commiter, s'arrêter.

## Lot 2 : parois verticales, cas symétriques

- [x] `src/parois/janssen.ts` (élancés, SPEC §5.1) et `src/parois/janssen-modifie.ts` (SPEC §5.2), avec n_zSk.
- [x] `src/parois/vidange.ts` : C_h et C_w selon l'élancement, la classe et `vidangeParLeHaut` (SPEC §5.3).
- [x] Gestion de `ecoulementEnCheminee` : cas de vidange non applicables avec motif.
- [x] Tests : V1 (z = 1, 5, 10, 20 ; z_o et p_ho des trois combinaisons ; n_zSk), V3 (Y_R, z_V, C_h, C_w), et p_w et n_zSk en C2.

### Consignes d'exécution du lot 2 (séance `claude-ds`)

Branche : `lot-2-parois`, déjà créée. Les types de résultat sont **déjà écrits** dans `src/model/types.ts` (section « Parois verticales ») : `ParametresJanssen`, `ValeursParoi`, `ValeursJanssenModifie`, `CoefficientsVidange`, `EtatParoi`.

Tests d'acceptation, **à ne jamais modifier** : `tests/parois/janssen.test.ts`, `tests/parois/vidange.test.ts`, et tous ceux des lots précédents.

**T2.1 Janssen** : `src/parois/janssen.ts`.
* `parametresJanssen(g: Geometrie, c: Combinaison): ParametresJanssen` : `z_o = A / (K μ U)`, `p_ho = γ K z_o` (éq. 5.3, 5.4).
* `janssen(z: number, g: Geometrie, c: Combinaison): ValeursParoi` selon SPEC §5.1 (éq. 5.1 à 5.7). Erreur qui nomme `z` (m) si `z` n'est pas un nombre fini positif ou nul.
* Test : `npx vitest run tests/parois/janssen.test.ts -t "V1|V2|domaine"`.

**T2.2 Janssen modifié** : `src/parois/janssen-modifie.ts`.
* `exposantN(g, c, h_o, phi_r_deg): number` (éq. 5.76).
* `janssenModifie(z, g, c, h_o, phi_r_deg): ValeursJanssenModifie` selon SPEC §5.2. Pour `z ≤ h_o` : `Y_R = 0`, `p_h = p_w = n_zSk = 0`, `z_V = z` et `p_v = γ z` (choix déclaré : pas de contact paroi, matériau au repos sous le talus ; le commentaire le dit).
* Test : `npx vitest run tests/parois/janssen.test.ts` (12 tests).

**T2.3 Coefficients de vidange** : `src/parois/vidange.ts`, `coefficientsVidange(d: DonneesSilo, cl: Classement, p: ProfilSilos): CoefficientsVidange`.
* Ordre : vidange par le haut (1 ; 1 ; motif citant `5.20 et 5.84`) ; silo peu élancé (1 ; 1 ; motif citant `5.3.2.1(2)`) ; silo intermédiaire (`1 + C_h_pente C_S`, `1 + C_w_pente C_S`, `C_S = hc/dc − 1` ; motif citant `5.85 à 5.87`) ; silo élancé (`C_h_elance`, `C_w_elance` ; motif citant `5.21 et 5.22`). Valeurs lues dans le profil. En v1, `procedures` vaut toujours 2 ou 3 : les deux classes ont les mêmes coefficients.
* Test : `npx vitest run tests/parois/vidange.test.ts -t "coefficients"` (4 tests).

**T2.4 État de la paroi** : `src/parois/symetrique.ts`, `etatParoi(z: number, d: DonneesSilo, cl: Classement, p: ProfilSilos): EtatParoi`.
* Erreur qui nomme `hc` si `z > hc` (et celle de T2.1 si `z < 0`).
* Combinaisons par `valeursCaracteristiques` et `combinaison` du lot 1 : `p_h` en C1, `p_w` et `n_zSk` en C2, `p_v` en C3. Silo élancé : `janssen` ; intermédiaire ou peu élancé : `janssenModifie` avec `cl.h_o` et `d.materiau.phi_r`.
* Vidange : `p_h × C_h`, `p_w × C_w`, `n_zSk × C_w`, `p_v` inchangé. Si `ecoulementEnCheminee` : `vidange = null` et `motifVidange` = « Écoulement en cheminée interne garanti par l'utilisateur : vidange non applicable (5.1(8)). » ; sinon `motifVidange = null`.
* Test : `npx vitest run tests/parois/vidange.test.ts` (14 tests).

**T2.5 Exports et fin de lot.** `src/index.ts` réexporte les nouveaux types et `parametresJanssen`, `janssen`, `exposantN`, `janssenModifie`, `coefficientsVidange`, `etatParoi`. `npm run typecheck`, `npm test`, `npm run build` passent. Cocher les cases du lot 2 ; une ligne « Lot 2 » dans « Ce que l'outil rend » du README.

**Interdit** : modifier les tests, `docs/validation/`, `src/model/types.ts`, `SPEC.md`, `CLAUDE.md`, `CONVENTIONS.md` ; ajouter une dépendance ; commencer le lot 3 ; pousser.

**Fin du lot** : section « Lot 2 » dans `HANDOFF.md`, commit, arrêt.

## Lot 3 : action localisée

- [x] `src/parois/localisee.ts` : C_pf et C_pe avec leurs branches (SPEC §5.4) et la matrice d'applicabilité.
- [x] Formes : non circulaire (0,36), circulaire épaisse (carrés, p/7, z_p), circulaire mince (cosθ, F_pf, z_p), majorations uniformes 5.38 à 5.45 avec leurs conditions.
- [x] Tests : V1 (C_pf, C_pe, majorations), V2 (C_pf, C_pe avec E = 0,667, p_pf et p_pfi, ζ, p_hf,u et p_he,u), V3 (C_pf, C_pe intermédiaire), un cas peu élancé où l'action est nulle avec son motif.

### Consignes d'exécution du lot 3 (séance `claude-ds`)

Branche : `lot-3-localisee`. Types **déjà écrits** dans `src/model/types.ts` (section « Action localisée ») : `FormeLocalisee`, `DefinitionLocalisee`, `ActionLocalisee`, `ValeursLocalisees`. Nouveaux cas de validation : `docs/validation/V5-circulaire-peu-elance.md` (et `v5()` dans `tests/fixtures.ts`). Nouveau point ouvert P7 dans `SPEC.md` §9.

Test d'acceptation, **à ne jamais modifier** : `tests/parois/localisee.test.ts` (20 tests), et tous ceux des lots précédents.

Un seul fichier : `src/parois/localisee.ts`.

**T3.1 Coefficients.**
* `coefficientCpf(d: DonneesSilo, cl: Classement): number` : éq. 5.9 avec `E_f = 2 e_f / d_c`, ramené à 0 s'il est négatif.
* `coefficientCpe(d, cl): number` : `E = 2 max(e_f, e_o) / d_c` ; si `hc/dc ≥ 1,2`, éq. 5.28 ramenée à 0 si négative ; sinon `max(5.28 ; 0,272 C_op (hc/dc − 1 + E) ; 0)` (5.29, 5.30).
* Test : `npx vitest run tests/parois/localisee.test.ts -t "coefficients"` (5 tests).

**T3.2 Définition par cas** : `actionLocalisee(d, cl, p: ProfilSilos): ActionLocalisee`, avec `s = π d_c / 16` (5.12). Règles, à appliquer dans cet ordre, pour le remplissage (coefficient C_pf) puis la vidange (C_pe). Les motifs sont en français accentué et citent les clauses entre parenthèses.
1. **Nulle.** Remplissage d'un silo peu élancé : motif citant `5.3.1.2(3)`. Vidange avec `ecoulementEnCheminee` : motif citant `5.1(8)`. Vidange d'un silo peu élancé avec `e_o < excentrementPeuElance × d_c` : motif citant `5.3.2.2(4)`. Coefficient calculé égal à 0 : motif « coefficient nul (5.9) » ou « (5.28) ». Dans tous ces cas `C = 0`.
2. **Rectangulaire** : `non-circulaire`, motif citant `5.2.1.5` (remplissage) ou `5.2.2.5` (vidange).
3. **Circulaire.** On note `procedures = cl.procedures`, `mince = cl.paroi === 'mince'`, `maintenue = formeMaintenueEnTeteEtEnPied`, `methode = methodeLocalisee ?? 'action-localisee'`.
   * Vidange d'un silo intermédiaire ou peu élancé avec `procedures === 2` (point ouvert **P7**, `pointOuvert: 'P7'`) : `majoration-uniforme` si `maintenue` (motif citant `5.3.2.3` et `5.2.3`), sinon forme localisée selon la paroi (motif citant `5.3.2.3` et `5.2.3(3)`).
   * Sinon, si `procedures === 2` et `methode === 'majoration-uniforme'` : `majoration-uniforme` si `maintenue` (motif citant `5.2.3`), sinon forme localisée selon la paroi avec un motif citant `5.2.3(3)` (« forme non maintenue en tête et en pied »).
   * Forme localisée selon la paroi : `circulaire-epaisse` (motif `5.2.1.3` ou `5.2.2.3`) ; `circulaire-mince` (motif `5.2.1.4` ou `5.2.2.4`), sauf paroi mince **boulonnée** avec `procedures === 2` : `hors-perimetre`, `C = 0`, `pointOuvert: 'P3'`, motif citant `5.2.1.4(4)`.
4. **Position `z_p`** (seulement pour `circulaire-epaisse` et `circulaire-mince`, sinon `null`) : `null` si `procedures === 3` (toute hauteur) ; paroi épaisse `hc / 2` (5.2.1.3(4)) ; paroi mince soudée `min(z_o en C1 ; hc / 2)` (5.16).
5. **`zeta`** pour `majoration-uniforme` sur paroi épaisse : `max(1,0 ; 0,5 + 0,01 d_c / t)` (5.40, 5.41) ; `null` dans tous les autres cas.
* Test : `npx vitest run tests/parois/localisee.test.ts -t "V1|V2|mince|V3|V5|cheminee"`.

**T3.3 Valeurs** : `valeursLocalisees(def: DefinitionLocalisee, a: ActionLocalisee, d: DonneesSilo, v: ValeursParoi): ValeursLocalisees`, où `v` est le résultat symétrique du même cas (`etatParoi(...).remplissage` ou `.vidange`).
* `nulle` ou `hors-perimetre` : tout à 0, `F_p = null`, `p_h_total = v.p_h`, `p_w_total = v.p_w`.
* `non-circulaire` : `p_p = C p_h`, `p_nc = 0,36 p_p`, `p_h_total = p_h + p_nc`.
* `circulaire-epaisse` : `p_p = C p_h`, `p_pi = p_p / 7`, `p_h_total = p_h + p_p` (enveloppe de la zone).
* `circulaire-mince` : `p_p = C p_h`, `F_p = (π/2) s d_c p_p`, `p_h_total = p_h + p_p`.
* `majoration-uniforme` : `p_p = C p_h` (pour information). Paroi épaisse : `p_h_total = p_h (1 + ζ C)`, `p_w_total = p_w`. Paroi mince : `p_h_total = p_h (1 + 0,5 C)`, `p_w_total = p_w (1 + C)` (5.42 à 5.45).
* Dans les autres formes, `p_w_total = p_w`.
* Test : `npx vitest run tests/parois/localisee.test.ts` (20 tests).

**T3.4 Exports et fin de lot.** Réexporter les types et les quatre fonctions depuis `src/index.ts`. `npm run typecheck`, `npm test`, `npm run build` passent. Cocher les cases du lot 3, ligne « Lot 3 » du README.

**Interdit** : modifier les tests, `docs/validation/`, `src/model/types.ts`, `SPEC.md`, `CLAUDE.md`, `CONVENTIONS.md` ; ajouter une dépendance ; commencer le lot 4 ; pousser.

**Fin du lot** : section « Lot 3 » dans `HANDOFF.md`, commit, arrêt.

## Lot 4 : fond et trémie

- [x] `src/fond/transition.ts` : p_vft et C_b (SPEC §6.1).
- [x] `src/fond/fond-plat.ts` : élancé et 6.2.2 avec le facteur d'interpolation de l'éq. 6.13.
- [x] `src/fond/tremie.ts` : classement profond ou peu profond, S, p_v(x) avec le cas limite n = 1, F_f, F_e de Walker, p_n et p_t (SPEC §6.3).
- [x] Tests : V1 (fond plat, C_b = 1,0 et 1,2), V3 (p_vsq), V4 (remplissage et vidange en trois points), cas n = 1, erreur φ_wh > φ_i.

### Consignes d'exécution du lot 4 (séance `claude-ds`)

Branche : `lot-4-fond`. Types **déjà écrits** dans `src/model/types.ts` (section « Fond et trémie ») : `CasFond`, `CoefficientCb`, `PressionTransition`, `FondPlat`, `ProfondeurTremie`, `ParametresTremie`, `PressionsTremie`. Nouveau cas : `docs/validation/V6-tremie-peu-profonde.md` (`v6()` dans `tests/fixtures.ts`).

Test d'acceptation, **à ne jamais modifier** : `tests/fond/fond.test.ts` (16 tests), et tous ceux des lots précédents.

**T4.1 Transition** : `src/fond/transition.ts`.
* `coefficientCb(d: DonneesSilo, p: ProfilSilos): CoefficientCb` : `C_b_majore` si `!faiblementCohesif || engrainementMecanique`, sinon `C_b` ; motif citant `6.1.2(4)` ou `6.1.2(5) et (6)`.
* `pressionTransition(d, cl, p, cas: CasFond): PressionTransition` : `p_vft = C_b × p_v(hc)`, avec `p_v(hc)` par `janssen` (silo élancé) ou `janssenModifie` (sinon). Combinaison : `C3` au remplissage ; à la vidange, `C3` pour un fond plat (6.2.1(2) et 6.2.2(3) : identique au remplissage) ou pour une trémie peu profonde (6.4.3), et `T2` pour une trémie profonde (P2 : K sup, μ inf de la paroi verticale).
* Test : `npx vitest run tests/fond/fond.test.ts -t "C_b|V1"`.

**T4.2 Fond plat** : `src/fond/fond-plat.ts`, `fondPlat(d, cl, p): FondPlat`. Erreur dont le message contient `plat` si le fond n'est pas plat.
* Silo élancé (6.2.1) : `p_v = p_vft` (remplissage), champs de 6.13 à `null`.
* Sinon (6.2.2) : `p_vb = p_vft` (remplissage, C_b compris), `p_vtp = γ h_tp`, `p_vho = γ h_o` (avec γ = `gamma_u`), `facteur = (2 − hc/dc) / (2 − h_tp/dc)`, `p_v = p_vsq = p_vb + (p_vtp − p_vho) × facteur`. Motif citant `6.2.2(4)` (valeur au voisinage du centre) et `6.2.2(3)` (identique à la vidange).
* Test : `npx vitest run tests/fond/fond.test.ts -t "V3"`.

**T4.3 Trémie** : `src/fond/tremie.ts`.
* `classerTremie(d, v: ValeursCaracteristiques): ProfondeurTremie` : profonde si `tanβ < (1 − K_inf) / (2 μ_h,inf)` (éq. 6.1).
* `coefficientS(silo): number` : 2 (conique, pyramidale carrée), 1 (biseau), `1 + b/a` (pyramidale rectangulaire) (6.9 à 6.11). Erreur pour un fond plat.
* `pvTremie(x, h_h, gamma, n, p_vft): number` (éq. 6.7) ; si `|n − 1| < 1e−9`, terme `γ h_h (−(x/h_h) ln(x/h_h))`. Erreur qui nomme `x` (m) si `x ≤ 0` ou `x > h_h` (tolérance 1e−9 sur `h_h`).
* `facteurWalker(beta_deg, mu_h, phi_i_deg): { F_e, epsilon }` (éq. 6.21 à 6.23, `epsilon` en degrés). Si `φ_wh > φ_i` : erreur `phi_wh = 40,8 deg depasse phi_i = 39,2 deg : contact paroi impossible (EN 1991-4, note 1 sous 6.23).` (une décimale, virgule).
* `parametresTremie(d, cl, p, cas): ParametresTremie` selon SPEC §6.3 et le tableau qui y figure, avec `b = b_tremie` du profil, `S = coefficientS`, `h_h = cl.h_h`, `gamma = gamma_u`, `p_vft = pressionTransition(...)`. Profonde : remplissage `combinaison 'T1'`, μ_heff = μ_h,inf, F = F_f (6.17), n (6.18) ; vidange `'T2'`, F = F_e de Walker avec μ_h,inf et φ_i,sup, n par la forme générale 6.8, `epsilon` renseigné. Peu profonde : μ_heff = (1 − K_inf)/(2 tanβ) (6.26), F_f (6.27), n (6.28) ; la vidange rend les mêmes paramètres que le remplissage avec `cas: 'vidange'`, `combinaison: 'T1'` et un motif citant `6.4.3`. `epsilon = null` hors vidange profonde. Motifs citant les clauses.
* `pressionsTremie(t: ParametresTremie, x: number): PressionsTremie` : `p_v = pvTremie(...)`, `p_n = F p_v`, `p_t = μ_heff F p_v`.
* Test : `npx vitest run tests/fond/fond.test.ts` (16 tests).

**T4.4 Exports et fin de lot.** Réexporter les types et les neuf fonctions. `typecheck`, `test`, `build` passent. Cocher le lot 4 ; ligne « Lot 4 » du README, sous forme d'un paragraphe séparé des autres par une ligne vide.

**Interdit** : modifier les tests, `docs/validation/`, `src/model/types.ts`, `SPEC.md`, `CLAUDE.md`, `CONVENTIONS.md` ; ajouter une dépendance ; commencer le lot 5 ; pousser.

**Fin du lot** : section « Lot 4 » dans `HANDOFF.md`, commit, arrêt.

## Lot 5 : vidange à grand excentrement

- [ ] **Avant de coder** : faire confirmer le point ouvert P4 par l'utilisateur.
- [x] `src/parois/excentree.ts` : déclenchement (5.2.4.1, 5.3.4), zones en θ, valeurs (SPEC §5.5) ; erreur explicite en classe 3.
- [x] Tests : V2 aux deux niveaux, déclenchement par e_o et par e_f, classe 3 refusée avec cas symétriques conservés.

### Consignes d'exécution du lot 5 (séance `claude-ds`)

Branche : `lot-5-excentree`. **P4 n'est pas encore confirmé par l'utilisateur** : l'utilisateur a demandé de coder le choix déclaré et de valider l'ensemble à la fin. Le code applique donc P4 tel que déclaré dans SPEC §5.5 et §9, et le cite dans ses commentaires et ses motifs. Types **déjà écrits** dans `src/model/types.ts` (section « Vidange à grand excentrement ») : `DeclenchementExcentree`, `ZoneExcentree`, `ZonesExcentrees`, `ValeursExcentrees`.

Test d'acceptation, **à ne jamais modifier** : `tests/parois/excentree.test.ts` (10 tests), et tous ceux des lots précédents.

Un seul fichier : `src/parois/excentree.ts`.

**T5.1 Déclenchement** : `declenchementExcentree(d, cl, p): DeclenchementExcentree`.
* Silo rectangulaire : `declenche: false`, motif « Vidange à grand excentrement traitée pour les silos circulaires seulement (5.2.4). ».
* `parEo = e_o > excentrementGrand × d_c` ; `parEf = e_f > excentrementGrand × d_c` et `hc/dc > elancementExcentrementRemplissage` ; `declenche = parEo || parEf` (inégalités strictes).
* Motif : cite `5.2.4.1` pour un silo élancé, `5.3.4` pour un silo intermédiaire ou peu élancé, et dit quelle condition déclenche, ou qu'aucune ne le fait.
* La classe n'intervient pas ici. En v1, `procedures` vaut 2 ou 3 : la classe 1 est calculée en classe 2.
* Test : `npx vitest run tests/parois/excentree.test.ts -t "declenchement"` (5 tests).

**T5.2 Zones et valeurs.**
* `zonesExcentrees(d, cl, p): ZonesExcentrees` : erreur dont le message contient `declench` si `declenchementExcentree` rend `declenche: false`. Erreur au message exact `Vidange excentree en classe 3 : methode de 5.2.4.3 non traitee. Les cas symetriques restent rendus.` si `cl.procedures === 3`. Sinon `theta_c` du profil et trois zones `ecoulement [0 ; θ_c]`, `contrainte-elevee [θ_c ; 2 θ_c]`, `immobile [2 θ_c ; 180]`, `pointsOuverts: ['P1', 'P4']`, motif citant `5.2.4.2`, P1 et P4.
* `valeursExcentrees(z, d, cl, p): ValeursExcentrees` : mêmes erreurs. Combinaison `X` du lot 1. `p_hse = p_h`, `p_wse = p_w` par `janssen` (silo élancé) ou `janssenModifie` (sinon), avec la combinaison X ; `p_hae = 2 p_hse`, `p_wae = 2 p_wse` ; `p_hce = p_wce = 0`. Erreur qui nomme `hc` si `z > hc`.
* `pressionsEnTheta(v: ValeursExcentrees, zones: ZonesExcentrees, theta_deg: number): { p_h, p_w }` : `θ` ramené dans `]−180 ; 180]`, puis `|θ| ≤ θ_c` : écoulement ; `θ_c < |θ| ≤ 2 θ_c` : contrainte élevée ; sinon immobile.
* Test : `npx vitest run tests/parois/excentree.test.ts` (10 tests).

**T5.3 Exports et fin de lot.** Réexporter les types et les quatre fonctions. `typecheck`, `test`, `build` passent. Cocher le lot 5, sauf la case « Avant de coder : faire confirmer P4 », qui reste ouverte. Ligne « Lot 5 » du README, en paragraphe séparé, qui dit que P4 reste à confirmer.

**Interdit** : modifier les tests, `docs/validation/`, `src/model/types.ts`, `SPEC.md`, `CLAUDE.md`, `CONVENTIONS.md` ; ajouter une dépendance ; commencer le lot 6 ; pousser.

**Fin du lot** : section « Lot 5 » dans `HANDOFF.md`, commit, arrêt.

## Lot 6 : assemblage des cas et discrétisation

- [x] `src/cas/` : construction de REMP, VID, VID_EXC, FOND_REMP, FOND_VID avec statut, combinaison et motif (SPEC §7).
- [x] `src/discretisation/bandes.ts` : bandes Δz, valeurs haut, bas et constante, cotes Z, contrôle trapèzes contre intégrale exacte.
- [x] Tests : bandes de V1 (bandes 1, 2, 3 et 20, somme, intégrale, écart), dernière bande plus courte quand hc n'est pas multiple de Δz.

### Consignes d'exécution du lot 6 (séance `claude-ds`)

Branche : `lot-6-cas`. Types **déjà écrits** dans `src/model/types.ts` (section « Cas de charge, profils et bandes ») : `IdCas`, `StatutCas`, `PointProfil`, `PointFond`, `CasDeCharge`, `Bande`, `ControleBandes`, `ResultatSilo`.

Test d'acceptation, **à ne jamais modifier** : `tests/cas/calcul.test.ts` (15 tests), et tous ceux des lots précédents.

Fichiers : `src/discretisation/bandes.ts`, `src/cas/` (un ou plusieurs modules, au choix), `src/calcul.ts`. Le lot assemble les fonctions des lots 1 à 5 ; il ne recalcule aucune formule de la norme.

**T6.1 Bandes** : `src/discretisation/bandes.ts`.
* `bandes(cas: IdCas, f: (z: number) => { p_h: number; p_w: number }, hc: number, dz: number, Z_transition: number): Bande[]`. Bornes `z_k = k dz` tant que `k dz < hc`, puis `hc` : la dernière bande est plus courte quand `hc` n'est pas multiple de `dz`. Une borne à moins de `1e-9` de `hc` est confondue avec `hc`. Numéros à partir de 1. `Z = Z_transition + hc − z`. `p_h_haut = f(z_haut).p_h`, `p_h_bas = f(z_bas).p_h`, `p_h_constant = p_h_bas` ; de même pour `p_w`. Erreur explicite si `dz ≤ 0` ou `hc ≤ 0`.
* `controleBandes(cas, b: Bande[], f_h: (z: number) => number, hc: number): ControleBandes`. `sommeTrapezes = Σ (p_h_haut + p_h_bas)/2 × (z_bas − z_haut)`. `integrale` : Simpson composite sur `[0 ; hc]` avec au moins 2 000 intervalles (nombre pair). `ecartRelatif = sommeTrapezes / integrale − 1`, et 0 si `integrale` vaut 0.
* Test : `npx vitest run tests/cas/calcul.test.ts -t "derniere bande"` (2 tests).

**T6.2 Calcul complet** : `calculer(d: DonneesSilo, p: ProfilSilos): ResultatSilo` dans `src/calcul.ts`.
* Commence par `validerDonnees(d)` et `verifierProfil(p)`. Toute erreur de données ou de géométrie hors périmètre (P6 compris) se propage : `calculer` lève.
* Remplit `classement` (`classer`), `caracteristiques`, `combinaisons` (les six, dans l'ordre C1, C2, C3, T1, T2, X), `janssen` (`parametresJanssen` en C1, C2, C3), `vidange` (`coefficientsVidange`), `actionLocalisee`, `C_b` (`coefficientCb`), `excentree` (`declenchementExcentree`), `profil: p.nom`.
* **Grille des profils** : `n = max(101, d.discretisation.pointsProfil)` points `z_i = hc × i / (n − 1)`, plus `h_o` et `z_o` en C1 s'ils sont dans `]0 ; hc[`, plus les bornes des bandes ; triés, doublons à moins de `1e-9` retirés. Le calcul en `z = 10` de V1 doit tomber exactement sur `10` : calculer `hc * i / (n - 1)`, pas une somme de pas.
* **REMP** et **VID** : à chaque `z`, `etatParoi`, puis `valeursLocalisees` avec la définition de remplissage ou de vidange de `actionLocalisee`. `p_h_sym` = p_h symétrique, `p_h_total` et `p_w` = `p_h_total` et `p_w_total` de `valeursLocalisees`, `p_h_loc = p_h_total − p_h_sym`, `p_v` et `n_zSk` symétriques. `localisee` = la définition du cas. Combinaisons : `p_h : C1 ; p_w et n_zSk : C2 ; p_v : C3`.
* **VID_EXC** : si `declenchementExcentree` rend `declenche: false`, statut `non-applicable` avec son motif. Si `zonesExcentrees` lève (classe 3), statut `hors-perimetre`, motif = message de l'erreur (il cite 5.2.4.3), profil vide. Sinon statut `calcule`, `excentree` = les zones, et à chaque `z` : `p_h_sym = p_hse`, `p_h_total = p_hae`, `p_h_loc = p_hae − p_hse`, `p_w = p_wae`, `p_v` et `n_zSk` de la même évaluation symétrique en combinaison X (Janssen ou Janssen modifié selon l'élancement, comme dans `excentree.ts` ; on peut y exporter une fonction auxiliaire sans changer les signatures existantes). Combinaisons : `X`.
* **Écoulement en cheminée** (5.1(8)) : VID, VID_EXC et FOND_VID sont `non-applicable`, motif citant `5.1(8)`, profil et fond vides. REMP et FOND_REMP restent calculés.
* **FOND_REMP**, **FOND_VID** : fond plat, un seul point `{ x: null, Z: Z_transition, p_v: p_vb, p_n: null, p_t: null }` de `fondPlat`, `fondPlat` renseigné. Trémie : `parametresTremie(d, cl, p, 'remplissage' | 'vidange')`, `tremie` renseigné, 50 points `x = h_h × (1 − i/50)` pour `i = 0 … 49`, avec `pressionsTremie` et `Z = Z_transition − (h_h − x)`. Combinaisons : celle de `ParametresTremie.combinaison` pour une trémie, `C3` pour un fond plat.
* **Bandes et contrôles** : pour chaque cas de paroi **calculé** (REMP, VID, VID_EXC), `bandes` avec `f(z)` = (`p_h_total`, `p_w`) évalués directement en `z` (pas interpolés dans le profil), `d.discretisation.dz` et `Z_transition` ; puis `controleBandes` sur `p_h_total`. Aucun bande ni contrôle pour un cas non calculé.
* **Points ouverts appliqués**, triés : `P5` toujours ; `P2` si le fond est une trémie ; `P1` et `P4` si VID_EXC est calculé ; `P3` ou `P7` si `pointOuvert` d'une définition localisée de REMP ou VID les porte.
* Libellés en français accentué (ce sont des chaînes affichées), par exemple « Remplissage symétrique et action localisée ».
* Test : `npx vitest run tests/cas/calcul.test.ts` (15 tests).

**T6.3 Exports et fin de lot.** Réexporter dans `src/index.ts` `calculer`, `bandes`, `controleBandes` et les nouveaux types. `typecheck`, `test`, `build` passent. Cocher le lot 6. Ligne « Lot 6 » du README, en paragraphe séparé.

**Interdit** : modifier les tests, `docs/validation/`, `src/model/types.ts`, `SPEC.md`, `CLAUDE.md`, `CONVENTIONS.md` ; changer la signature d'une fonction des lots précédents ; ajouter une dépendance ; commencer le lot 7 ; pousser.

**Fin du lot** : section « Lot 6 » dans `HANDOFF.md`, commit, arrêt.

## Lot 7 : interface

- [x] Formulaire par blocs (géométrie, fond, matériau, parois, exploitation, discrétisation), au style de `DESIGN.md`. Recalcul en continu, pas de bouton « calculer ».
- [x] Synthèse, liste des cas avec statut, points ouverts appliqués.
- [x] Dessins SVG : élévation avec diagrammes, profils, vue en plan, trémie (SPEC §8.1). Les dessins sont des fonctions pures testées sous jsdom.
- [x] Enregistrement de projet par `aedificium-ui`.

### Consignes d'exécution du lot 7 (séance `claude-ds`)

Branche : `lot-7-interface`. Modèle à suivre, en lecture seule : `../charges-climatiques/app/src/` (`form.ts`, `vue.ts`, `dessin-*.ts`, `main.ts`, `textes.ts`, `style.css`) et son `app/index.html`. On reprend sa structure, ses classes et son usage d'`aedificium-ui` (`brancherFeuilles`, `BlocResultat`, `nombreFr` ou `nombreAffiche`, `lireNombre`, `JETONS`). Le noyau (`src/`) ne change pas : l'interface appelle `calculer`.

Tests d'acceptation, **à ne jamais modifier** : `tests/app/form.test.ts`, `tests/app/vue.test.ts`, `tests/app/dessins.test.ts`, `tests/app/interface.test.ts`, et tous ceux des lots précédents (dont `tests/app/pages.test.ts` et `tests/app/jetons.test.ts`).

Toutes les chaînes affichées passent par `app/src/textes.ts`, en français seulement dans ce lot ; le lot 9 ajoute l'anglais avec les mêmes clés. Pas de tiret cadratin.

**T7.1 Formulaire** : `app/src/form.ts`.
* `CHAMPS` : tableau `as const` des clés, exactement : `forme, d, a, b, t, hc, Z_transition, fond, beta, materiau, gamma_l, gamma_u, phi_r, phi_im, a_phi, K_m, a_K, mu_D1, mu_D2, mu_D3, a_mu, C_op, paroi_verticale, paroi_tremie, faiblement_cohesif, engrainement, e_f, e_t, e_o, vidange_haut, cheminee, forme_maintenue, assemblage, classe_imposee, methode_localisee, dz, points`.
* `ModeleSaisie` : une propriété par clé, mêmes noms. Nombres en `number | null` (`null` pour un champ vide), choix en unions de chaînes, cases à cocher en `boolean`. Le modèle garde toutes les valeurs, même celles des champs masqués, pour qu'un changement de forme ou de fond ne perde pas la saisie.
* `modeleParDefaut()` : V1 (rectangulaire 6 × 4 m, `hc` 20, fond plat, `Z_transition` 0, sable, parois D2 et D2, faiblement cohésif oui, engrènement non, `e_f` 0, `e_t` vide, `e_o` 0, cases décochées, assemblage `soude`, classe imposée vide, méthode `action-localisee`, `dz` 1, 101 points). Champs masqués : `d` 6, `t` 0,2, `beta` 30 ; champs du matériau saisi pré-remplis avec les valeurs du sable.
* `champsDepuisModele(m): Record<string, string>` : nombres à la française (`nombreFr` ou équivalent, sans perte : l'aller-retour champs, modèle, champs est exact), `null` en chaîne vide, booléens en `oui` ou `non`.
* `modeleDepuisChamps(v): { ok: true; modele } | { ok: false; message }` : virgule ou point décimal (`lireNombre`). Un texte illisible ou un champ exigé vide donne un refus dont le message nomme la clé du champ. Exigés selon la saisie : `d` et `t` si circulaire ; `a` et `b` si rectangulaire ; `beta` si le fond n'est pas plat ; les douze valeurs du matériau seulement si `materiau = saisi`. Un champ non exigé illisible ou vide vaut `null` sans refus.
* `donneesDepuisModele(m): DonneesSilo` : ne transmet que les grandeurs pertinentes (`d` et `t` pour un circulaire, `a` et `b` pour un rectangulaire, `beta` pour une trémie ; les autres absentes). `e_t` vide et classe imposée vide sont absents (`undefined`). Matériau : `materiauParId('sable' | 'defaut')` pour la bibliothèque ; pour `saisi`, `id: 'saisi'`, nom « Matériau saisi », et chaque entrée de `sources` vaut `saisie utilisateur`.
* Test : `npx vitest run tests/app/form.test.ts`.

**T7.2 Synthèse** : `app/src/vue.ts`.
* `blocsSynthese(r: ResultatSilo): BlocResultat[]`, six blocs dans l'ordre : Classement (`hc/dc`, élancement, `capacité`, `classe` avec ses motifs), Propriétés caractéristiques (`K`, `μ`, `φ_i`, valeurs inférieure et supérieure), Parois verticales (`z_o`, `p_ho` en C1, `C_h`, `C_w`), Action localisée (`C_pf`, `C_pe`, `s`, forme et motif), Fond (`C_b`, méthode du fond plat ou paramètres de trémie), Cas de charge (une ligne par cas, symbole = identifiant, valeur = « calculé » et ses combinaisons, ou « non applicable : motif », ou « hors périmètre : motif »). Nombres à la française, unités dans la valeur.
* `lignesCas(r): string[][]` : `[identifiant, libellé, statut affiché (calculé, non applicable, hors périmètre), motif ou combinaisons]`.
* `lignesPointsOuverts(r): string[][]` : pour chaque identifiant de `r.pointsOuverts`, `[identifiant, question en une phrase, choix appliqué]`, reformulés depuis SPEC §9 et rangés dans `textes.ts`.
* `messageDErreur(e: unknown): string`, comme dans `charges-climatiques`.
* Test : `npx vitest run tests/app/vue.test.ts`.

**T7.3 Dessins** : `app/src/dessins.ts`, fonctions pures qui rendent une chaîne SVG. Aucune couleur en dur : uniquement des classes et des `var(--…)` des jetons. `NaN` et `undefined` interdits dans la sortie.
* `dessinElevation(r, id: IdCas, avecBandes: boolean)` : silo à l'échelle, talus et `h_o` (texte `h_o`), diagramme de `p_h_total` à gauche et de `p_w` à droite pour le cas ; avec `avecBandes`, un `<rect class="bande">` par bande du cas. Un cas non calculé dessine le silo et affiche « non applicable » ou « hors périmètre » avec le motif.
* `dessinProfils(r, grandeur: 'p_h' | 'p_w' | 'p_v' | 'n_zSk', ids: IdCas[])` : axe `z (m)` vers le bas, un tracé `class="trace trace-<ID>"` par cas calculé (`p_h` = `p_h_total`). REMP en trait plein ; VID et VID_EXC avec `stroke-dasharray` (attribut sur le même élément).
* `dessinPlan(r)` : circulaire : la zone de l'action localisée (`class="zone-localisee"`) et, si VID_EXC est calculé, les secteurs d'écoulement et de contrainte élevée avec leurs angles (`35°`, `70°` pour V2) ; rectangulaire : la majoration uniforme rappelée par son coefficient (texte `0,36`).
* `dessinTremie(r): string | null` : `null` pour un fond plat ; sinon `p_n` et `p_t` le long de la paroi de trémie, tracés `trace-FOND_REMP` et `trace-FOND_VID`.
* Test : `npx vitest run tests/app/dessins.test.ts`.

**T7.4 Page et câblage** : `app/index.html`, `app/src/main.ts`, `app/src/style.css`.
* `<form id="formulaire">` avec six `fieldset` et leurs `legend` : Géométrie, Fond, Matériau, Parois, Exploitation, Discrétisation. Un élément `data-champ="<clé>"` par clé de `CHAMPS`, et aucun autre `data-champ` (les sélecteurs d'affichage, comme le cas de l'élévation ou la grandeur des profils, portent un `data-role`). Les champs non exigés sont masqués selon la forme, le fond et le matériau.
* Zones de résultat `data-role` : `synthese`, `cas`, `points-ouverts`, `elevation`, `profils`, `plan`, `tremie`, `erreur`. La barre `data-role="feuilles"` reste entre `</header>` et `<main`.
* `main.ts` : recalcul à chaque `input` (`addEventListener('input', …)`), sans bouton « calculer ». Une saisie refusée ou une erreur du noyau s'affiche dans la zone `erreur` (`messageDErreur`) et laisse les résultats précédents effacés. `brancherFeuilles` lit `champsDepuisModele` et recharge les champs, comme dans `charges-climatiques`.
* Test : `npx vitest run tests/app/interface.test.ts`.

**T7.5 Fin de lot.** `typecheck`, `test`, `build` passent. Cocher le lot 7. Ligne « Lot 7 » du README, en paragraphe séparé.

**Interdit** : modifier les tests, `docs/validation/`, `src/` (noyau, types compris), `SPEC.md`, `CLAUDE.md`, `CONVENTIONS.md` ; ajouter une dépendance ; commencer le lot 8 ; pousser. Si le noyau semble devoir changer, s'arrêter et le signaler.

**Fin du lot** : section « Lot 7 » dans `HANDOFF.md`, commit, arrêt.

## Lot 8 : exports

- [x] Les cinq CSV de SPEC §8.2, avec bloc d'en-tête et aucune ligne omise.
- [x] JSON versionné, note HTML imprimable, SVG et PNG des graphiques.
- [x] Tests : en-têtes, nombre de lignes, valeurs de V1 dans `bandes.csv`, présence des motifs des cas non applicables.

### Consignes d'exécution du lot 8 (séance `claude-ds`)

Branche : `lot-8-exports`. Modèle, en lecture seule : `../charges-climatiques/app/src/export.ts`, `note.ts` et la partie exports de `main.ts`. Le noyau (`src/`) ne change pas.

Test d'acceptation, **à ne jamais modifier** : `tests/app/export.test.ts` (16 tests), et tous ceux des lots précédents.

**T8.1 CSV** : `app/src/export.ts`.
* Tout passe par `csv()` d'`aedificium-ui` (point-virgule, virgule décimale, BOM, CRLF). Valeurs numériques à 4 décimales fixes (`10,0000`), sauf mention.
* `ENTETES` : objet `as const` avec `profils`, `bandes`, `tremie`, dans l'ordre exact du test.
* Bloc d'en-tête commun, en tête de chaque CSV (au plus 15 lignes avant la ligne d'en-tête de colonnes) : outil `silo` et version de `package.json` si elle est accessible, sinon le nom seul ; date du calcul ; `EN 1991-4:2006` et nom du profil normatif ; données d'entrée résumées (forme, dimensions, hc, fond, matériau) ; combinaisons employées (C1, C2, C3, T1, T2, X avec leur rôle) ; la mention exacte `valeurs caractéristiques, coefficients partiels non appliqués` ; une ligne qui dit que `REMP`, `VID` et `VID_EXC` sont des cas exclusifs les uns des autres (le mot `exclusifs` après les trois identifiants). Puis une ligne vide, puis la ligne d'en-tête de colonnes.
* `csvProfils(r)` : une ligne par (cas, z) pour chaque cas de paroi calculé ; une seule ligne par cas non calculé, avec l'identifiant en première colonne et `non applicable : motif` ou `hors périmètre : motif` dans la colonne suivante. Colonne `combinaison` : les combinaisons du cas.
* `csvBandes(r)` : une ligne par (cas, bande) ; une ligne motivée par cas de paroi non calculé. Pied de fichier, après une ligne vide : pour chaque contrôle, une ligne `contrôle;<cas>;…` avec la somme des trapèzes et l'intégrale en kN/m à 3 décimales (`812,793`) et l'écart relatif en pourcentage à 3 décimales suivi de ` %` (`-0,097 %`).
* `csvTremie(r)` : une ligne par (cas, point) de FOND_REMP et FOND_VID ; `x`, `p_n`, `p_t` vides pour un fond plat ; une ligne motivée par cas non calculé.
* `csvLocalisee(r)` : définition de l'action localisée au remplissage et à la vidange (forme, `C`, `s`, `z_p`, valeurs `p_p`, `p_pi`, `p_nc` à la profondeur `z_p`, avec 4 décimales), et pour un silo circulaire dont VID_EXC est calculé, une ligne par zone `nom;θ min;θ max` en degrés. Le signe négatif de `p_pi` est expliqué par une ligne qui contient « vers l'intérieur » (succion vers l'intérieur du silo). Pour un silo rectangulaire, la majoration uniforme est rappelée avec son coefficient `0,36`.
* `csvSynthese(r)` : `resultatsEnCsv(blocsSynthese(r))`.
* `jsonResultat(r): string` : `JSON.stringify` d'un objet `{ format: 'silo-resultat', version: 1, norme: 'EN 1991-4:2006', mention, profil, date, donnees, classement, cas, bandes, controles, pointsOuverts }`, indenté de deux espaces.
* Test : `npx vitest run tests/app/export.test.ts -t "csv|JSON|en-tete"`, puis le fichier entier à la fin de T8.2.

**T8.2 Note de calcul** : `app/src/note.ts`, `noteDuCalcul(r, cartouche: { projet; element; date }): NoteDeCalcul`.
* Ouvre sur les hypothèses : la mention, l'exclusivité des cas, le choix enveloppe de SPEC §7 (p_h en C1 et p_w en C2 dans le même cas), le profil normatif.
* Puis les blocs de `blocsSynthese`, l'élévation de REMP et de VID, les profils `p_h` et `p_w` (REMP et VID superposés), la vue en plan, la trémie s'il y en a une : au moins trois figures SVG.
* Un bloc par cas avec son statut et son motif, et le tableau des points ouverts appliqués (`lignesPointsOuverts`).
* Test : `npx vitest run tests/app/export.test.ts -t "note"`.

**T8.3 Boutons** : `app/index.html` et `app/src/main.ts`.
* Une zone « Exports » avec sept boutons `data-action="exporter-profils"`, `-bandes`, `-tremie`, `-localisee`, `-synthese`, `-json`, `-note`. Fichiers téléchargés nommés `silo-profils.csv`, etc. ; la note s'ouvre par `ouvrirOuTelecharger` comme dans `charges-climatiques`.
* Sous chaque dessin, un bouton SVG (`svgAutonome` avec les styles du dessin) et un bouton PNG (rendu du SVG autonome dans un `canvas`, puis `toBlob`). Ces boutons portent `data-action="exporter-dessin"` et ne sont pas des `data-champ`.
* Corriger au passage le débordement du bloc « Cas de charge » de la synthèse (texte long dans la colonne des valeurs) : retour à la ligne autorisé dans `style.css`, sans toucher à `vue.ts` au-delà de ce qui est nécessaire.
* Ajouter `app/dev-dist/` à `.gitignore` s'il n'y est pas.
* Test : `npx vitest run tests/app/export.test.ts`.

**T8.4 Fin de lot.** `typecheck`, `test`, `build` passent. Cocher le lot 8. Ligne « Lot 8 » du README, en paragraphe séparé.

**Interdit** : modifier les tests, `docs/validation/`, `src/` (noyau, types compris), `SPEC.md`, `CLAUDE.md`, `CONVENTIONS.md` ; ajouter une dépendance ; commencer le lot 9 ; pousser.

**Fin du lot** : section « Lot 8 » dans `HANDOFF.md`, commit, arrêt.

## Lot 9 : version anglaise, PWA, publication

- [x] Page `app/en/` et textes anglais (sur le modèle de `charges-climatiques`).
- [x] Manifeste et service worker produits pour les deux pages ; installation PWA et fonctionnement hors ligne vérifiés sur ces artefacts (voir `HANDOFF.md`).
- [x] README complet, `docs/validation/` relié, publication GitHub Pages par la CI.
- [x] Dans `WebAedificium` (autre dépôt, branche séparée) : une ligne dans le tableau du README, une entrée dans `OUTILS_EXTERNES` et `MENU`, une icône dans `icones/`.

### Consignes d'exécution du lot 9 (séance `claude-ds`)

Branche : `lot-9-anglais`. Modèle, en lecture seule : `../charges-climatiques` (`app/src/textes.ts` avec `FR`, `EN` et `traducteur`, `app/en/index.html`, `tests/app/anglais.test.ts` et `finitions.test.ts`).

Tests d'acceptation, **à ne jamais modifier** : `tests/app/cas-affichage.ts`, `tests/app/finitions.test.ts` (3 tests), `tests/app/anglais.test.ts` (7 tests), et tous ceux des lots précédents.

**T9.1 Finitions de l'affichage en français.**
* Déplacer de `main.ts` vers `vue.ts` et exporter `rendreBlocs(blocs: readonly BlocResultat[]): string` et `rendreTableau(lignes: readonly string[][], entetes: readonly string[]): string` ; `main.ts` les importe.
* Les symboles et les phrases qui contiennent une notation (`p_h`, `z_o`, `e_o/d_c`, `θ_c`…) passent par `notationHtml` d'`aedificium-ui` : indices en `<sub>`, aucun `_` visible, à l'écran, dans la note et dans le texte des dessins. Dans les SVG, l'indice s'écrit par un `<tspan>` décalé ; la notation brute peut rester dans un attribut (`data-symbole="h_o"`), ce qui garde vrais les tests du lot 7 qui cherchent `h_o`, `p_n` et `p_t` dans la chaîne.
* Nombres affichés : au plus 3 décimales et aucun zéro final inutile (`nombreAffiche` ou équivalent), à l'écran et dans la note. Les CSV gardent leurs 4 décimales fixes : ce sont des données.
* Les motifs du noyau qui s'affichent peuvent être reformulés dans `src/` (**chaînes de message seulement** : ni valeur, ni formule, ni signature, ni type), par exemple `1,10` en `1,1`, à condition que tous les tests restent verts. Toute autre modification de `src/` est interdite.
* Test : `npx vitest run tests/app/finitions.test.ts`.

**T9.2 Textes anglais.**
* `textes.ts` : objet `EN` de même type que `FR` (une clé oubliée est une erreur de compilation), `textes()` rend l'un ou l'autre selon `langueCourante()`.
* Les phrases produites en français par le noyau (motifs, libellés des cas, messages d'erreur, définitions des points ouverts) se traduisent à l'affichage par `traducteur(exactes, regles)` d'`aedificium-ui`, comme dans `charges-climatiques`. Le noyau reste en français.
* Exports en anglais : `csv()` passe seul à la virgule séparatrice ; les nombres des CSV au point décimal ; en-têtes de colonnes anglais exactement comme dans `tests/app/anglais.test.ts`, la mention `characteristic values, partial factors not applied`. `ENTETES` reste lisible comme un objet (`ENTETES.profils`) et rend la langue courante : par exemple des accesseurs `get profils()`. Le test du lot 8, en français, doit rester vert.
* Formulaire : libellés, options et messages de refus en anglais.
* Test : `npx vitest run tests/app/anglais.test.ts -t "affichage en anglais"`.

**T9.3 Page anglaise.** `app/en/index.html` reprend exactement le squelette de `app/index.html` (mêmes `id`, `data-*`, `type`, `value`, `for`, `name`, dans le même ordre), avec les textes en anglais : légendes `Geometry`, `Bottom`, `Material`, `Walls`, `Operation`, `Discretisation`. `main.ts` sert les deux pages. Retirer de `main.ts` et des textes toute mention « page anglaise à construire ». Test : `npx vitest run tests/app/anglais.test.ts`.

**T9.4 PWA, README, publication.**
* Vérifier que `npm run build` produit le manifeste et le service worker pour les deux pages, comme `charges-climatiques` ; noter dans `HANDOFF.md` ce qui a été vérifié et comment.
* README : remplacer « En construction » par l'état réel ; mettre la section « Ce que l'outil rend » en liste à puces (une puce par lot, les lots 0 à 2 ne sont plus collés en un paragraphe) ; ajouter une section « Points ouverts » qui renvoie à `SPEC.md` §9 et dit que P4 et P7 attendent la confirmation de l'utilisateur ; ajouter les fichiers exportés ; retirer « (à la fin du lot 9) » ; dans « Références », remplacer « et son annexe nationale » par une phrase qui dit que seules les valeurs recommandées sont employées, sans annexe nationale.
* Test : `npm run typecheck && npm test && npm run build`.

**T9.5 Fin de lot.** Cocher le lot 9, sauf si une vérification n'a pas pu être faite (le dire). Section « Lot 9 » de `HANDOFF.md`, commit, arrêt.

**Interdit** : modifier les tests, `docs/validation/`, `src/model/types.ts`, les valeurs, formules et signatures de `src/`, `SPEC.md`, `CLAUDE.md`, `CONVENTIONS.md` ; ajouter une dépendance ; pousser ; toucher au dépôt `WebAedificium`.

## Lots ultérieurs, hors v1

- Voie simplifiée de la classe 1 (valeurs moyennes, éq. 5.23, 5.24, 5.88, 5.89, 6.4, 6.6).
- Vidange excentrée de classe 3 (5.2.4.3) et grand excentrement de remplissage (5.3.3).
- Annexe G pour les trémies.
- Bibliothèque de matériaux étendue, au fil de la lecture du tableau E.1 par l'utilisateur.
- Export direct vers un format d'échange de logiciel EF, si l'utilisateur en fournit la spécification.
