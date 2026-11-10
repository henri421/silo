# Compte rendu du lot 0, séance `claude-ds`

Branche `lot-0-squelette`, 2026-11-10. Modèle lu dans `../charges-climatiques` et `../aedificium-ui`, sans y écrire. Aucun test d'acceptation ni fichier de `docs/validation/` n'a été modifié (vérifié par `git diff 7196890 -- tests docs/validation`, sortie vide).

## T0.1 Configuration

**Fichiers modifiés** : `package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts`, `.gitignore`, `.github/workflows/pages.yml`.

**Décisions**
- `package.json` repris à l'identique de `charges-climatiques` (mêmes scripts, mêmes `devDependencies` et versions), avec `"name": "silo"` et `"version": "0.1.0"`. Aucune dépendance ajoutée.
- `aedificium-ui` épinglé sur `github:henri421/aedificium-ui#v1.6.3`, étiquette exigée par le test d'acceptation et cohérente avec la version déclarée dans `../aedificium-ui/package.json`. La liste des étiquettes du dépôt distant n'a pas pu être consultée depuis cette séance (accès limité au dépôt courant) ; c'est le test qui fixe la version.
- `vite.config.ts` identique au modèle, sauf le manifeste imposé (`name`, `short_name`, `description`) et les commentaires `/charges-climatiques/` devenus `/silo/`.
- `.gitignore` repris et complété par `*.pdf`, sous un commentaire qui rappelle l'interdiction du PDF de la norme.
- Workflow `pages.yml` repris à l'identique (types, tests, construction, puis déploiement).

**Points douteux**
- `npm install` signale 12 vulnérabilités dans l'arbre de dépendances (dont 2 critiques) ; aucune n'est corrigée, ce qui aurait demandé de changer des dépendances, interdit par le lot.
- Le script `build` du modèle commence par `rm -rf docs/assets &&` ; il fonctionne ici sous Git Bash et sous la CI Ubuntu, mais pas dans un `cmd.exe` nu.

**Statut des tests**
- `npx vitest run tests/app/configuration.test.ts` : 7 tests passent.

## T0.2 Noyau vide

**Fichiers modifiés** : `src/index.ts`.

**Décisions**
- En-tête de module sur le modèle de `charges-climatiques/src/index.ts`, avec l'objet de l'outil et les unités du noyau (m, kN/m³, kPa, kN/m, angles saisis en degrés).
- Un seul export : `NORME = 'EN 1991-4:2006'`.

**Points douteux** : aucun.

**Statut des tests**
- `npx vitest run tests/index.test.ts` : 1 test passe.

## T0.3 Pages et interface vide

**Fichiers modifiés** : `app/index.html`, `app/en/index.html`, `app/src/main.ts`, `app/src/pwa.ts`, `app/src/textes.ts`, `app/src/style.css`.

**Décisions**
- Structure, barre de la suite, liens de langue et balises d'icône reprises du modèle. Textes imposés repris mot pour mot en français ; traduction anglaise fidèle, avec `characteristic` dans l'avertissement.
- Pied de page : une phrase qui énumère le hors périmètre de `SPEC.md` §10, en français et en anglais.
- `style.css` : bloc `:root` recopié à l'identique de `charges-climatiques`, puis seulement les règles de base utiles à la page vide (corps, barre, en-tête, feuilles, `main`, section, pied de page), toutes en jetons, sans couleur en dur hors de `:root`.
- `main.ts` : `definirLangue(langueDuDocument(document))`, puis `brancherFeuilles` avec un état vide (`lire: () => ({})` et un `charger` sans effet), puis enregistrement du service worker sous la même garde que le modèle. Brancher la barre est possible sans calcul.
- `textes.ts` : seulement `messages.nouvelleVersion`, en français et en anglais, lu au rendu par `textes()`. Aucun tiret cadratin dans les pages ni dans `textes.ts`.

**Points douteux**
- La barre des feuilles est branchée mais la page n'a aucun champ : enregistrer une feuille de projet y stocke un état vide. C'est sans effet de calcul et sera remplacé au lot 7 ; signalé ici pour mémoire.
- Le commentaire du bloc `:root` de `style.css`, recopié à l'identique du modèle, contient un tiret cadratin. C'est un commentaire CSS, pas un texte affiché ni de la documentation ; il est conservé pour respecter la consigne de recopie à l'identique.

**Statut des tests**
- `npx vitest run tests/app/pages.test.ts tests/app/jetons.test.ts` : 10 tests passent.

## T0.4 Vérification d'ensemble

**Fichiers modifiés** : `PLAN.md` (cases du lot 0 cochées), `README.md` (section « Ce que l'outil rend »), `HANDOFF.md`.

**Décisions**
- Section « Ce que l'outil rend » du README : « Lot 0 : squelette publiable, sans calcul. »

**Points douteux** : aucun.

**Statut des tests**
- `npm run typecheck` : passe, aucune erreur.
- `npm test` : 18 tests passent sur 4 fichiers.
- `npm run build` : passe ; `docs/` contient la construction (`index.html`, `en/index.html`, `assets/`, `sw.js`, `workbox-*.js`, `manifest.webmanifest`, les quatre icônes) et `docs/validation/`.
- `git status` après construction : aucun fichier construit suivi ou non suivi.
- `git diff 7196890 -- tests docs/validation` : vide, tests et cas de validation intacts.

## État final

Les trois commandes du lot passent. Trois commits de code ont été faits (`e16a38d`, `852433c`, `36ab3f8`), puis les commits de documentation. Rien n'a été poussé. Le lot 1 n'a pas été commencé.

# Compte rendu du lot 1, séance `claude-ds`

Branche `lot-1-geometrie`, 2026-11-10. Les interfaces `src/model/types.ts` et les types de `src/norms/profil.ts` n'ont pas été modifiés ; seule la fonction `verifierProfil` a été ajoutée à `src/norms/profil.ts`, comme le prévoit T1.3. Aucun test d'acceptation ni fichier de `docs/validation/` n'a été modifié (vérifié par `git diff 4dddb43 -- tests docs/validation src/model/types.ts`, sortie vide).

## T1.1 Validation

**Fichiers modifiés** : `src/model/valider.ts`.

**Décisions**
- `validerDonnees` contrôle dans l'ordre le silo (dimensions, cohérence entre forme et trémie, angle beta), les excentrements (positifs ou nuls, au plus égaux à d/2 ou a/2), le matériau puis la discrétisation.
- Les messages sont en français sans accents, nomment la grandeur et son unité ; les limites d'excentrement sont écrites avec deux décimales et une virgule.
- Les sources du matériau ne sont pas contrôlées ici : c'est le chargeur de la bibliothèque (T1.2) qui bloque une valeur sans source.
- `Z_transition` n'est pas contrôlé : la liste de T1.1 ne le demande pas et aucune grandeur de ce lot ne l'utilise.

**Points douteux**
- Un `Materiau` construit à la main avec une source vide traverse `validerDonnees` et `classer`. La règle « une valeur sans source bloque le calcul » n'est appliquée que par le chargeur de la bibliothèque et par `verifierProfil` pour le profil normatif. Si elle doit aussi valoir pour un matériau saisi directement, la vérification est à ajouter en accord avec la séance de conception.

**Statut des tests**
- `npx vitest run tests/model/valider.test.ts` : 11 tests passent.

## T1.2 Bibliothèque

**Fichiers modifiés** : `src/materiaux/bibliotheque.json`, `src/materiaux/bibliotheque.ts`, `src/materiaux/LISEZMOI.md`, `tsconfig.json` (option `resolveJsonModule`).

**Décisions**
- Le JSON suit le format imposé (`silo-materiaux`, version 1) et ne contient que les deux entrées de SPEC §3.3, avec la source `EN 1991-4:2006, tableau E.1` sur les douze champs.
- `bibliotheque()` repasse par `materiauxDepuisJson` à chaque appel : les objets rendus sont neufs et le contrôle des sources s'applique toujours.
- Une valeur absente, non finie ou sans source bloque tout le chargement ; le message nomme le matériau et le champ.
- `resolveJsonModule` est activé pour que `tsc` accepte l'import du JSON livré. Aucune dépendance n'est ajoutée.

**Points douteux** : aucun.

**Statut des tests**
- `npx vitest run tests/materiaux/bibliotheque.test.ts` : 10 tests passent.

## T1.3 Profil recommandé

**Fichiers modifiés** : `src/norms/profil.ts` (ajout de `verifierProfil`), `src/norms/en1991-4-recommande.ts`.

**Décisions**
- Les seize valeurs et leurs clauses sont celles du tableau de T1.3, recopiées en dur ; la source suit le préfixe `EN 1991-4:2006, `.
- `en1991_4Recommande()` construit un objet littéral à chaque appel, donc un profil neuf.
- `verifierProfil` parcourt les clés de `valeurs` et nomme la clé fautive, pour une valeur non finie comme pour une source vide après `trim()`.
- `nom`, `date` et `perimetre` sont fixés comme demandé ; `verifierProfil` ne les contrôle pas, le PLAN ne demandant que le contrôle des clés de `valeurs`.

**Points douteux** : aucun.

**Statut des tests**
- `npx vitest run tests/norms/profil.test.ts` : 6 tests passent.

## T1.4 Géométrie

**Fichiers modifiés** : `src/classement/geometrie.ts`.

**Décisions**
- `grandeursGeometriques` applique SPEC §4.1 : cercle (A, U, d_c = d, r = d/2), rectangle (A = a b, U = 2 (a + b), d_c = b, r = b/2).
- `hauteurTremie` vaut `(d_c / 2) / tan(beta)` pour toutes les formes de trémie, comme imposé ; la pente saisie est la plus forte (6.1.2(7)).
- `volumeTremie` applique `pi r2 h / 3` pour le cône, `a b h / 3` pour les deux pyramides et `a b h / 2` pour le biseau.
- `talus` applique les équations 5.77 et 5.78, avec `h_tp = 3 h_o` pour le cercle et `h_tp = 2 h_o` pour le rectangle.
- Les fonctions exportées revérifient les dimensions et l'angle qu'elles emploient, pour rester utilisables seules sans produire de valeur non finie.

**Points douteux**
- Pour le biseau, la hauteur est celle de la pointe virtuelle sur le petit côté, conformément au PLAN et au test. Aucune autre lecture géométrique n'a été introduite.

**Statut des tests**
- `npx vitest run tests/classement/geometrie.test.ts` : 7 tests passent.

## T1.5 Classement

**Fichiers modifiés** : `src/classement/classement.ts`.

**Décisions**
- `classer` valide d'abord les données et le profil, puis classe l'élancement selon 5.1(2) et lève les erreurs de 5.4 (fond plat) et P6 (trémie) pour `hc/dc <= 0,4`.
- Les limites de 1.1(3) sont contrôlées dans l'ordre demandé (d_c, h_b, h_b/d_c) et déclenchées dès que la limite est atteinte, ce que disent les messages « atteint la limite ».
- La capacité vaut `gamma_u (A hc + volume de trémie) / 9,81`, avec `G = 9.81` nommée : choix P5.
- La classe du tableau 2.1 emploie les seuils du profil et des comparaisons strictes ; la classe imposée ne peut que relever la classe calculée, et les procédures valent 3 pour une classe 3, 2 sinon.
- Les motifs sont des phrases accentuées, affichées telles quelles ; une classe 1 cite 2.5(3), un relèvement par classe imposée aussi.
- La paroi vaut `mince` si `d_c / t > 200`, `epaisse` sinon, et `null` pour un rectangle ; `h_o` et `h_tp` viennent de `talus(silo, phi_r)`.

**Points douteux**
- Le message de classe 2 cite les excentrements relatifs même quand la capacité dépasse 1 000 t sans remplir le critère d'excentrement ; la phrase reste exacte mais n'énumère pas chaque condition séparément.
- Aucun test ne fixe le texte exact des motifs au-delà des expressions régulières de T1.5 ; leur formulation reste une décision de l'exécutant.

**Statut des tests**
- `npx vitest run tests/classement/classement.test.ts` : 22 tests passent.

## T1.6 Propriétés

**Fichiers modifiés** : `src/proprietes/caracteristiques.ts`, `src/proprietes/combinaisons.ts`.

**Décisions**
- `valeursCaracteristiques` applique SPEC §3.1 : `K_inf = K_m / a_K`, `K_sup = K_m a_K`, de même pour mu et phi_i ; mu et mu_h sont lus sur les catégories de paroi verticale et de trémie.
- `combinaison` couvre les six identifiants avec les libellés imposés ; `mu_h` vaut `mu_h_inf` dans toutes les combinaisons, comme demandé.
- Les points ouverts P1 (K supérieur pour X) et P2 (mu inférieur sur la paroi verticale pour T2) sont cités dans les commentaires des branches correspondantes.

**Points douteux** : aucun.

**Statut des tests**
- `npx vitest run tests/proprietes/proprietes.test.ts` : 8 tests passent.

## T1.7 Exports et fin de lot

**Fichiers modifiés** : `src/index.ts`, `PLAN.md`, `README.md`, `HANDOFF.md`.

**Décisions**
- `src/index.ts` réexporte tous les types de `src/model/types.ts` et de `src/norms/profil.ts`, puis les fonctions demandées, en gardant `NORME`.
- `PLAN.md` : cases du lot 1 cochées. `README.md` : ligne « Lot 1 : géométrie, bibliothèque de matériaux, classement et combinaisons de propriétés, sans pressions encore. »

**Points douteux**
- T1.7 n'a pas de test d'acceptation dédié : les noms réexportés sont couverts par le contrôle de types et la suite complète.

**Statut des tests**
- `npm run typecheck` : passe, aucune erreur.
- `npm test` : 82 tests passent sur 10 fichiers.
- `npm run build` : passe ; `docs/` est reconstruit et `git status` ne montre aucun fichier construit.
- `git diff 4dddb43 -- tests docs/validation src/model/types.ts` : vide, tests, cas de validation et types inchangés.

## État final du lot 1

Les trois commandes du lot passent. Six commits de code ont été faits (T1.1 à T1.6), puis le commit de documentation de fin de lot. Rien n'a été poussé. Le lot 2 n'a pas été commencé.
