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

# Compte rendu du lot 2, séance `claude-ds`

Branche `lot-2-parois`, 2026-11-10. Aucun test d'acceptation ni fichier de `docs/validation/` n'a été modifié ; `src/model/types.ts` et les types de `src/norms/profil.ts` sont intacts (vérifié par `git diff 1d51236 -- tests docs/validation src/model/types.ts src/norms/profil.ts`, sortie vide). Aucune dépendance ajoutée, rien n'a été poussé.

## T2.1 Janssen

**Fichiers modifiés** : `src/parois/janssen.ts`, `src/parois/janssen-modifie.ts` (squelette seulement, pour permettre le chargement du fichier de test).

**Décisions**
- `parametresJanssen` applique les équations 5.3 et 5.4 : `z_o = A / (K mu U)`, `p_ho = gamma K z_o`.
- `janssen` applique les équations 5.1 à 5.7 : `Y_J = 1 - exp(-z / z_o)`, `p_h`, `p_w`, `p_v` et `n_zSk = mu p_ho (z - z_o Y_J)`.
- `z` non fini ou négatif lève une erreur qui nomme `z` et son unité (m).
- Le squelette `src/parois/janssen-modifie.ts` exporte les signatures de T2.2 avec des corps qui lèvent une erreur, le temps de la tâche.

**Points douteux**
- Le fichier `tests/parois/janssen.test.ts` importe `janssen-modifie` dès sa première ligne. Le test filtré de T2.1 ne peut donc pas se charger sans ce module. Un squelette a été posé pour respecter l'ordre des tâches ; il est remplacé à T2.2.

**Statut des tests**
- `npx vitest run tests/parois/janssen.test.ts -t "V1|V2|domaine"` : 7 tests passent, 5 ignorés.

## T2.2 Janssen modifié

**Fichiers modifiés** : `src/parois/janssen-modifie.ts`.

**Décisions**
- `exposantN` applique l'équation 5.76 : `n = -(1 + tan phi_r) (1 - h_o / z_o)`, avec le `z_o` de la combinaison et `phi_r` en degrés converti en radians.
- `janssenModifie` applique `Y_R` (5.75), `p_h`, `p_w`, `z_V` (5.80), `p_v = gamma z_V` et `n_zSk = mu p_ho (z - z_V)` (5.81).
- Pour `z <= h_o`, `Y_R`, `p_h`, `p_w` et `n_zSk` sont nuls ; le choix déclaré `z_V = z` et `p_v = gamma z` est commenté dans le module.
- `z` non fini ou négatif lève la même erreur que T2.1.

**Points douteux** : aucun. Les valeurs de V3 (Y_R, p_h, p_w, z_V, p_v) concordent avec les valeurs attendues écrites en dur.

**Statut des tests**
- `npx vitest run tests/parois/janssen.test.ts` : 12 tests passent.

## T2.3 Coefficients de vidange

**Fichiers modifiés** : `src/parois/vidange.ts`, `src/parois/symetrique.ts` (squelette seulement, pour permettre le chargement du fichier de test).

**Décisions**
- L'ordre des branches est celui de T2.3 : vidange par le haut (5.20 et 5.84), silo peu élancé (5.3.2.1(2)), silo intermédiaire (5.85 à 5.87, `C_S = hc/dc - 1`), silo élancé (5.21 et 5.22).
- Les valeurs sont lues dans le profil normatif, jamais codées en dur ; le motif affiché reprend les valeurs effectives du profil.
- `C_S` n'est renseigné que pour un silo intermédiaire, `null` sinon, comme le prévoit le type.
- La classe de calcul n'intervient pas : en v1, les classes 2 et 3 suivent les mêmes coefficients, conformément à T2.3.

**Points douteux**
- Même remarque qu'à T2.1 : `tests/parois/vidange.test.ts` importe `symetrique`, d'où le squelette de `src/parois/symetrique.ts`.

**Statut des tests**
- `npx vitest run tests/parois/vidange.test.ts -t "coefficients"` : 4 tests passent, 10 ignorés.

## T2.4 État de la paroi

**Fichiers modifiés** : `src/parois/symetrique.ts`.

**Décisions**
- `etatParoi` lève une erreur qui nomme `hc` si `z > hc` ; les valeurs négatives ou non finies sont refusées par `janssen` ou `janssenModifie`, avec une erreur qui nomme `z`.
- Les combinaisons viennent de `valeursCaracteristiques` et `combinaison` du lot 1 : `p_h` en C1, `p_w` et `n_zSk` en C2, `p_v` en C3, avec l'objet `combinaisons` imposé par le type.
- Un silo élancé suit `janssen`, un silo intermédiaire ou peu élancé suit `janssenModifie` avec `cl.h_o` et `d.materiau.phi_r`.
- À la vidange, `p_h` est multipliée par `C_h`, `p_w` et `n_zSk` par `C_w`, `p_v` reste inchangée.
- Si `ecoulementEnCheminee` est vrai, `vidange` vaut `null` et `motifVidange` porte la phrase imposée citant 5.1(8) ; le remplissage reste rendu.

**Points douteux**
- Le motif de la cheminée interne est une chaîne affichée, avec accents et apostrophe droite, reprise de la phrase de T2.4.

**Statut des tests**
- `npx vitest run tests/parois/vidange.test.ts` : 14 tests passent.

## T2.5 Exports et fin de lot

**Fichiers modifiés** : `src/index.ts`, `PLAN.md` (cases du lot 2 cochées), `README.md` (ligne du lot 2), `HANDOFF.md`.

**Décisions**
- `src/index.ts` réexporte `parametresJanssen`, `janssen`, `exposantN`, `janssenModifie`, `coefficientsVidange` et `etatParoi` ; les types du lot 2 sont déjà réexportés par `export * from './model/types'`.
- `README.md` : ligne « Lot 2 : pressions des parois verticales aux cas symétriques, remplissage et vidange, par Janssen et Janssen modifié. »

**Points douteux**
- Aucun test d'acceptation n'exerce directement les réexports de `src/index.ts` ; ils sont couverts par le typecheck et la suite complète.

**Statut des tests**
- `npm run typecheck` : passe, aucune erreur.
- `npm test` : 108 tests passent sur 12 fichiers.
- `npm run build` : passe ; `git status` ne montre aucun fichier construit.
- `git diff 1d51236 -- tests docs/validation src/model/types.ts src/norms/profil.ts` : vide, tests, cas de validation et types intacts.

## État final du lot 2

Les trois commandes du lot passent. Quatre commits de code ont été faits (`aa3c8be`, `376d980`, `52f532f`, `a7af3c8`), puis le commit de documentation de fin de lot. Rien n'a été poussé. Le lot 3 n'a pas été commencé.

# Compte rendu du lot 3, séance `claude-ds`

Branche `lot-3-localisee`, 2026-11-10. Aucun test d'acceptation ni fichier de `docs/validation/` n'a été modifié ; `src/model/types.ts`, `src/norms/profil.ts`, `SPEC.md`, `CLAUDE.md` et `CONVENTIONS.md` sont intacts (vérifié par `git diff 5034bdd -- tests docs/validation src/model/types.ts src/norms/profil.ts SPEC.md CLAUDE.md CONVENTIONS.md`, sortie vide). Aucune dépendance ajoutée, rien n'a été poussé.

## T3.1 Coefficients

**Fichiers modifiés** : `src/parois/localisee.ts` (création).

**Décisions**
- `coefficientCpf` applique l'éq. 5.9 à 5.11 : `0,21 C_op (1 + 2 E_f^2)(1 - exp(-1,5 (hc/dc - 1)))`, avec `E_f = 2 e_f / d_c`, ramené à 0 s'il est négatif.
- `coefficientCpe` applique l'éq. 5.28 pour `hc/dc >= 1,2`, sinon le maximum des éq. 5.28, 5.30 et 0 (éq. 5.29), avec `E = 2 max(e_f, e_o) / d_c`.
- Les coefficients sont calculés avec les données d'entrée et le classement, sans valeur codée en dur hors les constantes des équations.
- Le fichier de test appelle `actionLocalisee` dès la collecte (constantes de `describe`), donc un squelette neutre a été posé pour T3.1 : sans lui, même les tests de coefficients ne se chargent pas. Ce squelette a été remplacé à T3.2.

**Points douteux** : aucun sur les coefficients ; les cinq valeurs attendues (V1, V2, V3, V5 et C_pf nul) passent.

**Statut des tests**
- `npx vitest run tests/parois/localisee.test.ts -t "coefficients"` : 5 tests passent, 15 ignorés.

## T3.2 Définition par cas

**Fichiers modifiés** : `src/parois/localisee.ts`.

**Décisions**
- Les règles sont appliquées dans l'ordre de T3.2 : nulle, non circulaire, circulaire (point ouvert P7, puis méthode de classe 2, puis forme selon la paroi), position `z_p`, `zeta`.
- Les motifs sont en français accentué et citent les clauses entre parenthèses. P7 est porté par `pointOuvert` sur les deux branches de la vidange d'un silo intermédiaire ou peu élancé de classe 2.
- `z_p` vaut null en classe 3, `hc/2` sur paroi épaisse, `min(z_o en C1 ; hc/2)` sur paroi mince soudée ; `z_o` vient de `parametresJanssen` avec la combinaison C1 du lot 1.
- `zeta` vaut `max(1 ; 0,5 + 0,01 d_c/t)` sur paroi épaisse et null partout ailleurs.
- Le cas de la paroi mince boulonnée de classe 2 rend `hors-perimetre`, `C = 0`, le point ouvert P3 et un motif citant 5.2.1.4(4).

**Points douteux**
- La commande de T3.2 (`-t "V1|V2|mince|V3|V5|cheminee"`) sélectionne aussi des tests qui appellent `valeursLocalisees`, fonction de T3.3, parce que les noms des tests contiennent V1, V2, etc. Elle ne peut donc pas être entièrement verte avant T3.3. Après implémentation de T3.3, elle donne 18 tests passants, 1 ignoré et l'échec d'arrondi décrit à T3.3.

**Statut des tests**
- Après T3.2 seul : `npx vitest run tests/parois/localisee.test.ts -t "V1|V2|mince|V3|V5|cheminee"` : 12 tests passent, 7 échouent (tous sur `valeursLocalisees` non encore implémentée), 1 ignoré.
- Après T3.3 : 18 passent, 1 ignoré, 1 échoue (V1 z = 1, voir T3.3).

## T3.3 Valeurs

**Fichiers modifiés** : `src/parois/localisee.ts`.

**Décisions**
- `valeursLocalisees` applique T3.3 : nulle ou hors périmètre sans valeur ; non circulaire `p_nc = 0,36 p_p` ; paroi épaisse `p_pi = p_p / 7` ; paroi mince `F_p = (pi/2) s d_c p_p` ; majoration uniforme selon la paroi.
- La distinction paroi épaisse ou mince d'une majoration uniforme se fait par `zeta` : il n'est renseigné que sur paroi épaisse (5.40, 5.41), et la branche mince (5.42 à 5.45) n'a pas d'autre marqueur dans les types. La donnée `d` de la signature n'est pas utilisée, la signature étant imposée par le PLAN.

**Point bloquant : test V1, z = 1, p_pf,nc**

- Clause et chaîne de calcul : éq. 5.9 à 5.11 (C_pf), puis 5.2.1.5 (`p_pf,nc = 0,36 p_pf`).
- `C_pf = 0,21 × 0,4 × (1 − e^(−6)) = 0,0837917848`.
- `p_hf(z = 1) = 46,4 × (1 − e^(−1/5,805805)) = 7,341595394 kPa`.
- `p_pf,nc = 0,36 × 0,0837917848 × 7,341595394 = 0,221459537 kPa`.
- Le cas de validation V1 donne `0,2215` : c'est la valeur exacte ci-dessus arrondie à 4 décimales par `reference.py` (`f(x, 4)`), et non une valeur différente.
- Le test compare `0,221459537` à `0,2215` avec `proche` et la tolérance relative 1e−4 : écart `1,83e−4 > 1e−4`. L'arrondi à 4 décimales d'une valeur proche de 0,22 implique une demi-étape relative de `0,00005 / 0,2215 = 2,26e−4` : la tolérance 1e−4 est plus fine que la précision du nombre attendu.
- L'implémentation ne diverge donc pas du cas de validation ; c'est la tolérance du test qui est incompatible avec l'arrondi du cas. Le test et la valeur attendue n'ont pas été modifiés. Les autres valeurs de la même ligne (`p_h_total = 7,5631`, `p_pe,nc = 0,5094`, `p_h_total` à la vidange `= 8,9522`) passent.
- Aucune correction n'a été appliquée, conformément aux consignes. À trancher par la séance de conception : tolérance absolue pour cette valeur, tolérance relative plus large, ou valeur attendue écrite avec plus de décimales.

**Points douteux**
- Le critère de distinction épaisse/mince par `zeta` est un choix d'implémentation commenté dans le module ; il n'est pas imposé par le PLAN.
- Les branches de majoration uniforme sur paroi mince (5.42 à 5.45) ne sont exercées par aucun test d'acceptation ; elles sont implémentées comme le demande T3.3.

**Statut des tests**
- `npx vitest run tests/parois/localisee.test.ts` : 19 tests passent, 1 échoue (V1 z = 1, point bloquant ci-dessus).

## T3.4 Exports et fin de lot

**Non commencée** : arrêt imposé sur T3.3 par le point bloquant ci-dessus. `src/index.ts` ne réexporte pas encore les types et les quatre fonctions du lot 3, les cases du lot 3 de `PLAN.md` ne sont pas cochées et la ligne « Lot 3 » n'est pas ajoutée au `README.md`.

## État final du lot 3

- `npm run typecheck` : passe, aucune erreur.
- `npm test` : 127 tests passent, 1 échoue sur 128 (V1 z = 1, tolérance d'arrondi).
- `npm run build` : passe ; `git status` ne montre aucun fichier construit.
- Tests d'acceptation et cas de validation intacts.
- Le lot 3 est arrêté à T3.3 ; le lot 4 n'a pas été commencé.

### Reprise du lot 3 par la séance de conception

Le test bloquant de T3.3 était faux, non le calcul : la valeur 0,2215 arrondie à 4 décimales ne tenait pas une tolérance relative de 1e−4. `proche()` de `tests/fixtures.ts` accepte désormais un écart absolu de 5e−5 (une demi-unité de la 4ᵉ décimale), règle reportée dans `PLAN.md`. T3.3 passe sans changement de code. T3.4 (réexports, cases, README) a été fait par la séance de conception. `npm test` : 128 tests passent.

# Compte rendu du lot 4, séance `claude-ds`

Branche `lot-4-fond`, 2026-11-10. Aucun test d'acceptation ni fichier de `docs/validation/` n'a été modifié ; `src/model/types.ts`, `src/norms/profil.ts`, `SPEC.md`, `CLAUDE.md` et `CONVENTIONS.md` sont intacts (vérifié par `git diff d2cf051 -- tests docs/validation src/model/types.ts src/norms/profil.ts SPEC.md CLAUDE.md CONVENTIONS.md`, sortie vide). Aucune dépendance ajoutée, rien n'a été poussé.

## T4.1 Transition

**Fichiers modifiés** : `src/fond/transition.ts` (création), `src/fond/tremie.ts` (création, `classerTremie` seulement), `src/fond/fond-plat.ts` (squelette, pour permettre le chargement du fichier de test).

**Décisions**
- `coefficientCb` lit `C_b` et `C_b_majore` dans le profil et rend 1,2 si le matériau n'est pas faiblement cohésif ou s'il est sujet à engrainement mécanique, 1,0 sinon. Les motifs citent 6.1.2(4) et 6.1.2(5) et (6), avec la valeur réellement lue.
- `pressionTransition` applique C3 au remplissage. À la vidange, elle applique C3 pour un fond plat (6.2.1(2) et 6.2.2(3)) ou une trémie peu profonde (6.4.3), et T2 pour une trémie profonde (point ouvert P2). `p_vf(hc)` vient de `janssen` pour un silo élancé et de `janssenModifie` pour un silo intermédiaire ou peu élancé.
- La détermination « profonde ou peu profonde » nécessaire au choix de combinaison est faite par `classerTremie`, implémentée dès T4.1 dans `src/fond/tremie.ts`. C'est un prérequis de la combinaison T2 et la fonction est de toute façon exigée par T4.3.
- `classerTremie` et `pressionTransition` s'importent mutuellement. Le cycle ne porte que sur des appels situés dans des corps de fonctions : les deux modules se chargent sans erreur et les tests passent.

**Points douteux**
- Le fichier de test importe les trois modules du lot dès son chargement : des squelettes pour `fondPlat` et pour les fonctions de trémie ont donc été posés à T4.1, puis remplacés aux tâches suivantes.
- La commande de T4.1, `npx vitest run tests/fond/fond.test.ts -t "C_b|V1"`, sélectionne aussi le test « p_v uniforme » qui appelle `fondPlat` (T4.2). Après T4.1 seul, ce test échoue sur le squelette ; il passe après T4.2.
- Cycle d'imports `transition.ts` et `tremie.ts`, sans effet constaté à l'exécution.

**Statut des tests**
- Après T4.1 seul : `npx vitest run tests/fond/fond.test.ts -t "C_b|V1"` : 3 tests passent, 1 échoue (`fondPlat` non encore implémenté), 12 ignorés.
- Les valeurs attendues de C_b (1,0 et 1,2) et de p_vft de V1 (107,4648 et 128,9578) passent.

## T4.2 Fond plat

**Fichiers modifiés** : `src/fond/fond-plat.ts`.

**Décisions**
- `fondPlat` refuse un fond non plat avec une erreur dont le message contient « plat ».
- Silo élancé (6.2.1) : `p_v = p_vft` au remplissage, C_b compris, termes de 6.13 à `null`, motif citant 6.2.1(2) et l'identité entre remplissage et vidange.
- Silo peu élancé ou intermédiaire (6.2.2) : `p_vb = p_vft`, `p_vtp = gamma_u h_tp`, `p_vho = gamma_u h_o`, `facteur = (2 - hc/dc)/(2 - h_tp/dc)` et `p_v = p_vb + (p_vtp - p_vho) facteur`. Le motif cite 6.2.2(4) pour le voisinage du centre et 6.2.2(3) pour l'identité entre remplissage et vidange.
- Le `C_b` rendu est celui de `pressionTransition` au remplissage.

**Points douteux** : aucun. Les valeurs de V3 (p_vb 143,2587 ; p_vtp 64,7827 ; p_vho 21,5942 ; facteur 0,313458 ; p_v 156,7965) passent.

**Statut des tests**
- Avant implémentation : `npx vitest run tests/fond/fond.test.ts -t "V3"` : 2 tests échouent, l'un sur le squelette, l'autre sur le message qui ne contenait pas « plat ».
- Après T4.2 : `npx vitest run tests/fond/fond.test.ts -t "V3|C_b|V1"` : 6 tests passent, 10 ignorés.

## T4.3 Trémie

**Fichiers modifiés** : `src/fond/tremie.ts`.

**Décisions**
- `classerTremie` applique l'éq. 6.1 : profonde si `tan(beta) < (1 - K_inf) / (2 mu_h,inf)`, peu profonde sinon.
- `coefficientS` applique 6.9 à 6.11 : 2 pour une trémie conique ou pyramidale carrée, 1 pour un biseau, `1 + b/a` pour une pyramidale rectangulaire. Erreur pour un fond plat.
- `pvTremie` applique l'éq. 6.7. Si `|n - 1| < 1e-9`, le premier terme prend la limite `gamma h_h (-(x/h_h) ln(x/h_h))`. Une erreur nomme `x` (m) si `x <= 0` ou si `x > h_h` au-delà de la tolérance 1e-9 sur `h_h`.
- `facteurWalker` applique 6.21 à 6.23 ; `epsilon` est rendu en degrés. Si `phi_wh > phi_i`, l'erreur nomme les deux angles, avec une décimale et une virgule, et cite la note 1 sous 6.23.
- `parametresTremie` : trémie profonde au remplissage avec T1, `F_f` de 6.17 et `n` de 6.18 ; trémie profonde à la vidange avec T2, `F_e` de Walker et `n` par la forme générale 6.8, `epsilon` renseigné ; trémie peu profonde avec `mu_heff` de 6.26, `F_f` de 6.27 et `n` de 6.28, la vidange rendant les mêmes valeurs que le remplissage avec `cas: 'vidange'`, `combinaison: 'T1'` et un motif citant 6.4.3.
- `pressionsTremie` rend `p_n = F p_v` et `p_t = mu_heff F p_v`.
- `p_vft` vient toujours de `pressionTransition`, donc C3 au remplissage, C3 à la vidange d'une trémie peu profonde et T2 à la vidange d'une trémie profonde (P2).

**Points douteux**
- Le cycle d'imports avec `transition.ts` subsiste, pour l'appel à `pressionTransition`.
- La vidange d'une trémie peu profonde porte `combinaison: 'T1'` alors que `p_vft` est calculé en C3 par `pressionTransition`, conformément à T4.1 : 6.4.3 renvoie aux valeurs du remplissage pour la paroi de trémie, tandis que la pression verticale à la transition reste celle prescrite à T4.1.
- Les branches de `coefficientS` pour les pyramides et le biseau sont exercées par le test « S selon la forme », mais aucun cas de validation ne pousse les pressions d'une trémie non conique.

**Statut des tests**
- Avant implémentation : `npx vitest run tests/fond/fond.test.ts` : 9 tests échouent, 7 passent (dont le classement V4 et V6 de la trémie, déjà couvert par `classerTremie`).
- Après T4.3 : `npx vitest run tests/fond/fond.test.ts` : 16 tests passent. Les valeurs de V4 et V6 passent pour le remplissage et la vidange, y compris le cas limite `n = 1` (38,8629 kPa), la valeur `n = 1,5` (29,3934 kPa) et l'erreur `phi_wh > phi_i`.

## T4.4 Exports et fin de lot

**Fichiers modifiés** : `src/index.ts`, `PLAN.md` (cases du lot 4 cochées), `README.md` (paragraphe du lot 4), `HANDOFF.md`.

**Décisions**
- `src/index.ts` réexporte les neuf fonctions du lot : `coefficientCb`, `pressionTransition`, `fondPlat`, `classerTremie`, `coefficientS`, `pvTremie`, `facteurWalker`, `parametresTremie` et `pressionsTremie`. Les types étaient déjà réexportés par `export * from './model/types'`.
- `README.md` : paragraphe « Lot 4 : fond plat (6.2.1 et 6.2.2) et trémie (6.3 et 6.4), avec C_b, p_vft, le classement profond ou peu profond et les pressions p_n et p_t. », séparé du lot 3 par une ligne vide.

**Points douteux**
- Aucun test d'acceptation n'exerce directement les réexports de `src/index.ts` ; ils sont couverts par le contrôle de types et la suite complète.

**Statut des tests**
- `npm run typecheck` : passe, aucune erreur.
- `npm test` : 144 tests passent sur 14 fichiers.
- `npm run build` : passe ; `git status` ne montre aucun fichier construit.
- `git diff d2cf051 -- tests docs/validation src/model/types.ts src/norms/profil.ts SPEC.md CLAUDE.md CONVENTIONS.md` : vide, tests, cas de validation et types intacts.

## État final du lot 4

Les trois commandes du lot passent. Trois commits de code ont été faits (`6b3a8bc` pour T4.1, `baf5c90` pour T4.2, `1e64286` pour T4.3), puis le commit de documentation de fin de lot. Rien n'a été poussé. Le lot 5 n'a pas été commencé.

# Compte rendu du lot 5, séance `claude-ds`

Branche `lot-5-excentree`, 2026-11-10. Aucun test d'acceptation ni fichier de `docs/validation/` n'a été modifié ; `src/model/types.ts`, `src/norms/profil.ts`, `SPEC.md`, `CLAUDE.md` et `CONVENTIONS.md` sont intacts (vérifié par `git diff 085bf5b -- tests docs/validation src/model/types.ts src/norms/profil.ts SPEC.md CLAUDE.md CONVENTIONS.md`, sortie vide). Aucune dépendance ajoutée, rien n'a été poussé. Le point ouvert P4 n'a pas été confirmé par l'utilisateur : le code applique la lecture déclarée dans `SPEC.md` §5.5 et §9, la cite dans ses commentaires et ses motifs, et la case correspondante de `PLAN.md` reste ouverte.

## T5.1 Déclenchement

**Fichiers modifiés** : `src/parois/excentree.ts` (création).

**Décisions**
- Un silo rectangulaire rend `declenche: false`, `parEo` et `parEf` faux, avec le motif imposé « Vidange à grand excentrement traitée pour les silos circulaires seulement (5.2.4). ».
- `parEo = e_o > excentrementGrand d_c` ; `parEf = e_f > excentrementGrand d_c` et `hc/dc > elancementExcentrementRemplissage`. Les deux seuils sont lus dans le profil, les inégalités sont strictes.
- Le motif cite `5.2.4.1(2)` pour un silo élancé et `5.3.4` pour un silo intermédiaire ou peu élancé. Il énonce la ou les conditions qui déclenchent, ou pourquoi aucune ne le fait (comparaisons chiffrées, virgule décimale).
- La classe de calcul n'intervient pas dans le déclenchement ; seul l'élancement choisit la clause citée.
- Le fichier de test importe les quatre fonctions dès son chargement : des squelettes pour `zonesExcentrees`, `valeursExcentrees` et `pressionsEnTheta` ont été posés à T5.1, puis remplacés à T5.2, comme aux lots 2 à 4.

**Points douteux**
- Pour un silo non déclenché, `zonesExcentrees` reprend le motif du déclenchement dans son erreur : « Vidange excentree non declenchee : ... ». C'est exigé par le test (le message doit contenir « declench ») ; pour un rectangle, la phrase est un peu redondante mais exacte.

**Statut des tests**
- Avant implémentation : `npx vitest run tests/parois/excentree.test.ts -t "declenchement"` : échec de chargement, module `src/parois/excentree` absent, 0 test.
- Après implémentation : `npx vitest run tests/parois/excentree.test.ts -t "declenchement"` : 5 tests passent, 5 ignorés.
- `npm run typecheck` : passe.

## T5.2 Zones et valeurs

**Fichiers modifiés** : `src/parois/excentree.ts`.

**Décisions**
- `zonesExcentrees` vérifie d'abord le déclenchement (erreur contenant « declench »), puis refuse la classe 3 avec le message exact de `SPEC.md` §11 citant 5.2.4.3. `theta_c` vient du profil ; les trois zones sont `[0 ; theta_c]` (écoulement), `[theta_c ; 2 theta_c]` (contrainte élevée, P4) et `[2 theta_c ; 180]` (immobile) ; `pointsOuverts` vaut `['P1', 'P4']` et le motif cite 5.2.4.2, P1 et P4.
- `valeursExcentrees` appelle `zonesExcentrees` pour lever les mêmes erreurs, puis vérifie `z > hc` avec un message qui nomme `hc`. Elle construit la combinaison X par `valeursCaracteristiques` et `combinaison`, calcule `p_hse` et `p_wse` par `janssen` (silo élancé) ou `janssenModifie` (sinon), et rend `p_hce = p_wce = 0`, `p_hae = 2 p_hse`, `p_wae = 2 p_wse`.
- `pressionsEnTheta` ramène `theta` dans `]-180 ; 180]`, puis applique les bornes inclusives `|theta| <= theta_c` (écoulement), `<= 2 theta_c` (contrainte élevée), sinon immobile.

**Points douteux**
- `pressionsEnTheta` lève une erreur si l'angle n'est pas fini. Le PLAN ne l'impose pas ; c'est une garde ajoutée au nom de la convention « nommer la grandeur et son unité », sans effet sur les cas de validation.
- La vérification de classe 3 vient après celle du déclenchement : un cas de classe 3 non déclenché reçoit le message de non-déclenchement, non celui de 5.2.4.3. Cet ordre suit celui du PLAN et n'est pas exercé par les tests.
- Dans V2, la combinaison X a les mêmes K et mu que C1 (P1 : K supérieur, mu inférieur), donc `p_hse` égale `p_hf` du cas V2 ; les valeurs attendues à z = 9 m et z = 18 m passent.

**Statut des tests**
- Avant implémentation : `npx vitest run tests/parois/excentree.test.ts` : 5 tests échouent sur les squelettes, 5 passent.
- Après implémentation : `npx vitest run tests/parois/excentree.test.ts` : 10 tests passent.
- `npm run typecheck` : passe.

## T5.3 Exports et fin de lot

**Fichiers modifiés** : `src/index.ts`, `PLAN.md` (cases du lot 5), `README.md` (paragraphe du lot 5), `HANDOFF.md`.

**Décisions**
- `src/index.ts` réexporte `declenchementExcentree`, `zonesExcentrees`, `valeursExcentrees` et `pressionsEnTheta` ; les types du lot sont déjà réexportés par `export * from './model/types'`.
- `PLAN.md` : les cases « `src/parois/excentree.ts` » et « Tests » sont cochées ; la case « Avant de coder : faire confirmer le point ouvert P4 » reste ouverte, P4 n'ayant pas été confirmé.
- `README.md` : paragraphe « Lot 5 » séparé par une ligne vide, qui dit que P4 reste à confirmer par l'utilisateur.

**Points douteux**
- Aucun test d'acceptation n'exerce directement les réexports de `src/index.ts` ; ils sont couverts par le contrôle de types et la suite complète.

**Statut des tests**
- `npm run typecheck` : passe, aucune erreur.
- `npm test` : 154 tests passent sur 15 fichiers.
- `npm run build` : passe ; `git status` ne montre aucun fichier construit.
- `git diff 085bf5b -- tests docs/validation src/model/types.ts src/norms/profil.ts SPEC.md CLAUDE.md CONVENTIONS.md` : vide, tests, cas de validation et fichiers protégés intacts.

## État final du lot 5

Les trois commandes du lot passent. Deux commits de code ont été faits (`1e590ba` pour T5.1, `aaa4b6e` pour T5.2), puis le commit de documentation de fin de lot. Rien n'a été poussé. Le lot 6 n'a pas été commencé. P4 reste à confirmer par l'utilisateur.

# Compte rendu du lot 6, séance `claude-ds`

Branche `lot-6-cas`, 2026-11-10. Aucun test d'acceptation ni fichier de `docs/validation/` n'a été modifié ; `src/model/types.ts`, `src/norms/profil.ts`, `SPEC.md`, `CLAUDE.md` et `CONVENTIONS.md` sont intacts (vérifié par `git diff c76e099 -- tests docs/validation src/model/types.ts src/norms/profil.ts SPEC.md CLAUDE.md CONVENTIONS.md`, sortie vide). Aucune dépendance ajoutée, rien n'a été poussé.

## T6.1 Bandes

**Fichiers modifiés** : `src/discretisation/bandes.ts` (création), `src/calcul.ts` (squelette temporaire, pour permettre le chargement du fichier de test).

**Décisions**
- `bornesBandes` applique `k dz` tant que `k dz < hc`, puis `hc` ; une borne à moins de `1e-9` de `hc` est confondue avec `hc`. La dernière bande est donc plus courte quand `hc` n'est pas multiple de `dz`.
- `bandes` numérote à partir de 1, du haut vers le bas, évalue `f` directement aux deux bornes et retient la valeur du bas comme valeur constante. `Z = Z_transition + hc - z`.
- `controleBandes` somme les trapèzes de `p_h_total` et compare à une intégrale de Simpson composite à 2 000 intervalles (nombre pair). L'écart relatif vaut 0 quand l'intégrale est nulle.
- Erreurs explicites en français sans accents si `hc` ou `dz` n'est pas un nombre strictement positif.

**Points douteux**
- Le fichier de test appelle `calculer` dès la collecte des `describe` (bloc des bandes de V1). Un squelette de `src/calcul.ts` rendant un résultat vide a donc été posé pour que le test filtré de T6.1 puisse se charger. Il a été remplacé intégralement à T6.2 et n'existe plus dans le code final.

**Statut des tests**
- Avant implémentation : `npx vitest run tests/cas/calcul.test.ts -t "derniere bande"` : échec de chargement, module `src/calcul` absent, 0 test.
- Après implémentation : `npx vitest run tests/cas/calcul.test.ts -t "derniere bande"` : 2 tests passent, 13 ignorés.
- `npm run typecheck` : passe.

## T6.2 Calcul complet

**Fichiers modifiés** : `src/calcul.ts`, `src/cas/profils.ts` (création).

**Décisions**
- `calculer` valide les données et le profil, puis assemble `classer`, `valeursCaracteristiques`, les six combinaisons dans l'ordre C1, C2, C3, T1, T2, X, les trois `parametresJanssen`, `coefficientsVidange`, `actionLocalisee`, `coefficientCb` et `declenchementExcentree`. Aucune formule de la norme n'est recalculée dans ce module.
- La grille des profils contient les points `hc i / (n - 1)` avec `n = max(101, pointsProfil)`, `h_o` et `z_o` en C1 dans `]0 ; hc[`, et les bornes des bandes. Elle est triée, les doublons à moins de `1e-9` sont retirés. Les points réguliers sont calculés par multiplication et division, jamais par une somme de pas : `z = 10` de V1 tombe exactement sur 10.
- REMP et VID évaluent `etatParoi` puis `valeursLocalisees` à chaque z. `p_h_sym` est la pression symétrique, `p_h_total` et `p_w` viennent de `valeursLocalisees`, `p_h_loc = p_h_total - p_h_sym`, `p_v` et `n_zSk` sont symétriques.
- VID_EXC : non applicable si le déclenchement est faux (motif de `declenchementExcentree`) ou en écoulement de cheminée ; hors périmètre si `zonesExcentrees` lève pour la classe 3, avec le message de l'erreur et un profil vide ; sinon calculé, avec `p_h_sym = p_hse`, `p_h_total = p_hae`, `p_h_loc = p_hae - p_hse`, `p_w = p_wae`. `p_v` et `n_zSk` viennent d'une évaluation symétrique directe en combinaison X, par `janssen` ou `janssenModifie` selon l'élancement, sans changer la signature d'`excentree.ts`.
- Écoulement en cheminée (5.1(8)) : VID, VID_EXC et FOND_VID sont non applicables avec le motif citant 5.1(8) et des profils vides ; REMP et FOND_REMP restent calculés.
- Fond plat : un seul point `{ x: null, Z: Z_transition, p_v, p_n: null, p_t: null }`. Trémie : `parametresTremie` au remplissage ou à la vidange, puis 50 points `x = h_h (1 - i/50)` pour `i = 0` à 49, avec `Z = Z_transition - (h_h - x)`.
- Bandes et contrôles pour les seuls cas de paroi calculés, avec `f(z)` évalué directement, jamais interpolé dans le profil.
- Points ouverts : P5 toujours ; P2 si le fond est une trémie ; P1 et P4 si VID_EXC est calculé ; P3 ou P7 si une définition localisée de REMP ou VID le porte. Triés.
- Libellés accentués, par exemple « Remplissage symétrique et action localisée ». Chaînes de combinaisons : `p_h : C1 ; p_w et n_zSk : C2 ; p_v : C3` pour REMP et VID, `p_h, p_w, p_v et n_zSk : X` pour VID_EXC, `p_v : C3` pour un fond plat, `p_n et p_t : <combinaison>` pour une trémie.

**Points douteux**
- T6.2 demande pour un fond plat un point de `p_v: p_vb`. Or `p_vb` vaut `null` dans la méthode 6.2.1 d'un silo élancé, et le cas V1 attend `p_v = 107,4648 kPa`, qui est `p_vft`. Le code retient donc `fondPlat(...).p_v`, qui vaut `p_vb` en 6.2.2 et `p_vft` en 6.2.1. Les tests passent sans être modifiés.
- P2 est ajouté dès que le fond est une trémie, y compris peu profonde, lecture littérale de T6.2. Aucun test ne couvre ce cas.
- La combinaison X de VID_EXC fournit aussi `p_v` et `n_zSk`, que le type `ValeursExcentrees` ne porte pas. Le calcul les obtient par une évaluation directe en X dans `calcul.ts`, sans ajouter de fonction exportée à `excentree.ts`.
- Les chaînes de `combinaisons` ne sont fixées par aucun test au-delà de leur présence ; leur formulation reste une décision de l'exécutant.

**Statut des tests**
- La commande de T6.2 n'a pas été lancée avant l'implémentation : le squelette de T6.1 aurait fait échouer les 13 tests restants, ce qui était connu d'avance.
- Après implémentation : `npx vitest run tests/cas/calcul.test.ts` : 15 tests passent.
- `npm test` : 169 tests passent sur 16 fichiers.
- `npm run typecheck` : passe.

## T6.3 Exports et fin de lot

**Fichiers modifiés** : `src/index.ts`, `PLAN.md` (cases du lot 6 cochées), `README.md` (paragraphe du lot 6), `HANDOFF.md`.

**Décisions**
- `src/index.ts` réexporte `calculer`, `bandes` et `controleBandes` ; les types du lot sont déjà réexportés par `export * from './model/types'`.
- `README.md` : paragraphe « Lot 6 » séparé par une ligne vide, qui décrit les cinq cas, leurs statuts et motifs, les profils et les bandes avec leur contrôle.

**Points douteux**
- Aucun test d'acceptation n'exerce directement les réexports de `src/index.ts` ; ils sont couverts par le contrôle de types et la suite complète.

**Statut des tests**
- `npm run typecheck` : passe, aucune erreur.
- `npm test` : 169 tests passent sur 16 fichiers.
- `npm run build` : passe ; `git status` ne montre aucun fichier construit.
- `git diff c76e099 -- tests docs/validation src/model/types.ts src/norms/profil.ts SPEC.md CLAUDE.md CONVENTIONS.md` : vide, tests, cas de validation et fichiers protégés intacts.

## État final du lot 6

Les trois commandes du lot passent. Deux commits de code ont été faits (`2b973c2` pour T6.1, `9fb2315` pour T6.2), puis le commit de documentation de fin de lot. Rien n'a été poussé. Le lot 7 n'a pas été commencé.

# Compte rendu du lot 7, séance `claude-ds`

Branche `lot-7-interface`, 2026-11-10. Aucun test d'acceptation ni fichier de `docs/validation/` n'a été modifié ; `src/` (noyau et types), `app/en/index.html`, `SPEC.md`, `CLAUDE.md`, `CONVENTIONS.md`, `package.json` et `package-lock.json` sont intacts (vérifié par `git diff 21d2c19 -- tests docs/validation src app/en package.json package-lock.json`, sortie vide). Aucune dépendance ajoutée, rien n'a été poussé.

## T7.1 Formulaire

**Fichiers modifiés** : `app/src/form.ts` (création).

**Décisions**
- `CHAMPS` reprend exactement les 37 clés et leur ordre. `ModeleSaisie` porte une propriété par clé : nombres en `number | null`, choix en unions de chaînes, cases en booléen. Toutes les valeurs restent dans le modèle, y compris celles des champs masqués.
- `modeleParDefaut()` décrit V1 (rectangulaire 6 x 4 m, hc 20 m, fond plat, Z_transition 0, sable, parois D2 et D2, faiblement cohésif, pas d'engrènement, e_f et e_o nuls, e_t vide, cases décochées, assemblage soudé, classe imposée vide, méthode action localisée, dz 1, 101 points). Les champs masqués d, t et beta valent 6, 0,2 et 30 ; les douze champs du matériau sont pré-remplis avec les valeurs du sable.
- `champsDepuisModele()` écrit les nombres avec `String(valeur).replace('.', ',')`, ce qui garantit l'aller-retour sans perte de précision, et les booléens en `oui` ou `non`.
- `modeleDepuisChamps()` refuse un texte illisible ou un champ requis vide avec un message qui nomme la clé. Sont requis les champs de base du noyau (hc, Z_transition, e_f, e_o, dz, points), les dimensions de la forme choisie (d et t, ou a et b), beta pour une trémie, et les douze valeurs du matériau seulement si `materiau = saisi`. Les champs masqués vides ou illisibles valent null sans refus.
- `donneesDepuisModele()` ne transmet que les grandeurs pertinentes ; e_t et la classe imposée vides sont omis. Un matériau saisi reçoit `id: 'saisi'`, le nom « Matériau saisi » et une source `saisie utilisateur` sur chacun des douze champs.
- Les grandeurs de base absentes du modèle lèvent une erreur nommant la clé dans `donneesDepuisModele`, plutôt que de produire une valeur par défaut silencieuse.

**Points douteux**
- La phrase du PLAN, « un champ non exigé illisible ou vide vaut null sans refus », est lue comme visant les champs masqués par la forme, le fond ou le matériau. Les grandeurs de base (hc, Z_transition, excentrements, discrétisation) restent exigées : sans elles le noyau ne peut pas calculer, et le test d'acceptation attend le refus de `hc = 'abc'`. Ce point mérite confirmation par la séance de conception.
- Le libellé des messages d'erreur n'est fixé par aucun test au-delà du nom de la clé ; il reste une décision de l'exécutant.

**Statut des tests**
- `npx vitest run tests/app/form.test.ts` : 10 tests passent.

## T7.2 Synthèse

**Fichiers modifiés** : `app/src/vue.ts` (création), `app/src/textes.ts`.

**Décisions**
- `blocsSynthese()` rend les six blocs dans l'ordre demandé. Les symboles imposés (hc/dc, capacité, classe, K, μ, φ_i, z_o, p_ho, C_h, C_w, C_pf, C_pe, s, C_b) viennent de `textes.ts`. Le bloc Classement porte ses motifs en note.
- Les nombres sont affichés par `nombreAffiche`, à la française, avec l'unité dans la valeur (m, t, kPa, degrés).
- `lignesCas()` rend quatre colonnes et les statuts affichés exactement « calculé », « non applicable » et « hors périmètre ». `lignesPointsOuverts()` reprend les questions de SPEC §9 reformulées dans `textes.ts`, avec le choix déclaré.
- La méthode de fond plat est affichée sous forme explicite (« silo élancé (6.2.1) » ou « silo peu élancé ou intermédiaire (6.2.2) »), parce que le test refuse une valeur qui ressemble à un nombre décimal. C'est un libellé d'affichage : la valeur du noyau n'est pas transformée.
- `messageDErreur()` rend le message d'une `Error`, sinon le texte de la valeur ; un texte vide donne un message de repli.

**Points douteux** : aucun.

**Statut des tests**
- `npx vitest run tests/app/vue.test.ts` : 7 tests passent.

## T7.3 Dessins

**Fichiers modifiés** : `app/src/dessins.ts` (création), `app/src/textes.ts`.

**Décisions**
- Les quatre fonctions sont pures et rendent une chaîne SVG complète. Une feuille `<style>` interne rappelle les classes, toutes peintes par des `var(--...)` des jetons : aucune couleur en dur, aucune balise `rgb` ni `rgba`.
- `dessinElevation()` dessine le silo à l'échelle, la surface équivalente, le talus, la cote h_o et les diagrammes de p_h_total à gauche et de p_w à droite. Avec `avecBandes`, chaque bande du cas devient un `<rect class="bande">`. Un cas non calculé affiche son statut et son motif.
- `dessinProfils()` trace z vers le bas, un tracé `trace-<ID>` par cas calculé ; REMP est en trait plein, VID et VID_EXC portent `stroke-dasharray` sur l'élément du tracé.
- `dessinPlan()` dessine la zone localisée d'un circulaire, les secteurs d'écoulement et de contrainte élevée avec leurs angles, et rappelle la majoration 0,36 d'un rectangulaire.
- `dessinTremie()` rend `null` pour un fond plat ; sinon il trace p_n et p_t de FOND_REMP et FOND_VID le long de la paroi, en fonction de x.
- Une coordonnée non finie lève une erreur de dessin au lieu de laisser sortir `NaN` dans le SVG.

**Points douteux**
- Le talus de l'élévation est une illustration simplifiée : son sommet est ramené à la surface équivalente quand h_o moins la demi-hauteur du talus devient négatif. Aucune valeur de calcul n'en dépend.
- La paroi mince et la majoration uniforme d'un silo circulaire sont dessinées en plan par un anneau commun ; seules les formes épaisse et rectangulaire sont distinguées par les tests.
- L'échelle des diagrammes de l'élévation est propre au cas affiché ; elle ne permet pas de comparer deux cas entre eux.

**Statut des tests**
- `npx vitest run tests/app/dessins.test.ts` : 8 tests passent.

## T7.4 Page et câblage

**Fichiers modifiés** : `app/index.html`, `app/src/main.ts`, `app/src/style.css`, `app/src/textes.ts`, `app/src/vue.ts`, `app/src/dessins.ts`.

**Décisions**
- La page porte six `fieldset` avec leurs légendes imposées, exactement un élément `data-champ` par clé de `CHAMPS` et aucun autre. Les sélecteurs d'affichage (cas de l'élévation, grandeur des profils, tracé des bandes) portent un `data-role`.
- Les champs non applicables sont masqués par groupes : circulaire ou rectangulaire, trémie, matériau saisi. Le masquage suit aussi la saisie brute quand un nombre est en cours de frappe et que la lecture échoue.
- Le recalcul part de l'événement `input` du formulaire, sans aucun bouton. Une saisie refusée ou une erreur du noyau affiche le message dans la zone `erreur` et efface tous les résultats, pour qu'un résultat périmé ne reste pas à l'écran.
- La barre des feuilles est branchée sur `champsDepuisModele` et `modeleParDefaut` : une feuille de projet enregistre et recharge le relevé des champs. La page anglaise, encore « Interface under construction », ne porte pas de formulaire ; `main.ts` évite donc de lever une erreur sur cette page en l'absence de `#formulaire`.
- `style.css` reprend les règles de base du modèle, ajoute la grille formulaire et résultats, les tableaux et l'habillage des dessins, uniquement avec les jetons. Le bloc `:root` n'est pas touché.
- Aucun bouton n'est présent sur la page, donc aucun bouton « calculer ».

**Points douteux**
- L'interface est en français seulement ; la page anglaise reste à construire au lot 9, comme prévu par le PLAN.
- Un essai de fumée temporaire sous jsdom, hors du dépôt de tests et supprimé ensuite, a vérifié le chargement de `main.ts`, le calcul de V1, l'effacement sur une saisie refusée, le passage en circulaire avec trémie et e_o = 2 (dessin du plan avec 35° et tracé de trémie), et le refus d'un matériau saisi sans K_m. Cet essai n'est pas conservé dans la suite.
- Le rendu HTML des blocs de synthèse est fait dans `main.ts` ; `vue.ts` reste pur et rend des blocs, conformément au PLAN.

**Statut des tests**
- `npx vitest run tests/app/interface.test.ts` : 7 tests passent.
- `npx vitest run tests/app/pages.test.ts tests/app/jetons.test.ts` : 10 tests passent.

## T7.5 Fin de lot

**Fichiers modifiés** : `PLAN.md` (cases du lot 7 cochées), `README.md` (paragraphe du lot 7), `HANDOFF.md`.

**Décisions**
- `PLAN.md` : les quatre cases du lot 7 sont cochées, y compris l'enregistrement de projet par `aedificium-ui`, branché à T7.4.
- `README.md` : paragraphe « Lot 7 » séparé par une ligne vide, qui décrit le formulaire, la synthèse, les dessins et les feuilles de projet, et rappelle que la page anglaise vient au lot 9.

**Points douteux** : aucun.

**Statut des tests**
- `npm run typecheck` : passe, aucune erreur.
- `npm test` : 201 tests passent sur 20 fichiers.
- `npm run build` : passe ; `git status` ne montre aucun fichier construit.
- `git diff 21d2c19 -- tests docs/validation src app/en package.json package-lock.json` : vide, tests, cas de validation, noyau, page anglaise et dépendances intacts.

## État final du lot 7

Les trois commandes du lot passent. Quatre commits de code ont été faits (`1c642aa` pour T7.1, `51cac20` pour T7.2, `687fcd1` pour T7.3, `cc7c874` pour T7.4), puis le commit de documentation de fin de lot. Rien n'a été poussé. Le lot 8 n'a pas été commencé.

# Compte rendu du lot 8, séance `claude-ds`

Branche `lot-8-exports`, 2026-11-10. Aucun test d'acceptation ni fichier de `docs/validation/` n'a été modifié ; `src/` (noyau et types), `SPEC.md`, `CLAUDE.md`, `CONVENTIONS.md`, `app/en/`, `package.json` et `package-lock.json` sont intacts (vérifié par `git diff ae303e4 --stat -- tests docs/validation src SPEC.md CLAUDE.md CONVENTIONS.md app/en package.json package-lock.json`, sortie vide). Aucune dépendance ajoutée, rien n'a été poussé.

## T8.1 CSV et JSON

**Fichiers modifiés** : `app/src/export.ts` (création), `app/src/dessins.ts` (constante `STYLE_DESSIN` extraite et exportée), `app/src/note.ts` (squelette seulement, pour permettre le chargement du fichier de test).

**Décisions**
- Tout CSV passe par `csv()` d'aedificium-ui : BOM, point-virgule, virgule décimale et CRLF. Les valeurs numériques sortent à 4 décimales fixes (`10,0000`).
- Bloc d'en-tête commun de huit lignes non vides, puis une ligne vide, puis la ligne d'en-tête de colonnes : outil `silo` et version lue dans `package.json` par un import JSON, date ISO du calcul, norme et profil normatif, forme, dimensions, `hc`, fond, matériau, `Z_transition`, combinaisons C1 à X avec leur rôle, mention exacte `valeurs caractéristiques, coefficients partiels non appliqués`, et phrase d'exclusivité `REMP, VID et VID_EXC sont exclusifs les uns des autres.`
- Un cas non calculé sort en une ligne : identifiant en première colonne, `non applicable : motif` ou `hors périmètre : motif` en deuxième. Aucune ligne n'est omise.
- `bandes.csv` ajoute en pied, après une ligne vide, une ligne par contrôle : somme des trapèzes et intégrale en kN/m à 3 décimales, écart relatif en pourcentage à 3 décimales suivi de ` %` (`-0,097 %`). Les lignes de pied commencent par `contrôle`.
- `localisee.csv` lit `p_p`, `p_pi` et `p_nc` à la profondeur `z_p` par `valeursLocalisees` du noyau, à partir du point de profil le plus proche : aucune formule n'est recopiée. Quand `z_p` vaut `null` (paroi non circulaire, classe 3), les valeurs sont lues à mi-hauteur, hauteur où la définition s'applique de toute façon. `p_pi` est écrit avec un signe négatif, et une ligne contenant « vers l'intérieur » explique cette succion. Les angles des zones excentrées sortent en degrés sans décimales inutiles.
- `jsonResultat` rend exactement les clés demandées (`format`, `version`, `norme`, `mention`, `profil`, `date`, `donnees`, `classement`, `cas`, `bandes`, `controles`, `pointsOuverts`), indentées de deux espaces.
- `STYLE_DESSIN` est la feuille de peinture du SVG extraite de `dessins.ts` ; `export.ts` la préfixe des `JETONS` pour l'export autonome. Une seule source de styles, donc pas de dérive entre l'écran et les fichiers.

**Points douteux**
- Le test des zones excentrées exige `contrainte-elevee;35;70` : `35,0000;70,0000` ne correspond pas à son motif. Les angles sont donc affichés par `nombreAffiche`, sans décimales inutiles, alors que les autres colonnes de `localisee.csv` sont à 4 décimales fixes. Aucune valeur n'est modifiée.
- Pour un silo non circulaire, `z_p` est nul et `localisee.csv` lit `p_p` à mi-hauteur. Aucun test d'acceptation ne fixe cette profondeur pour ce cas ; le choix est commenté dans le module.
- Le fichier de test importe `app/src/note` dès sa collecte : un squelette levant une erreur a été posé à T8.1 pour que les tests CSV puissent se charger. Il a été remplacé intégralement à T8.2, comme aux lots précédents.

**Statut des tests**
- Avant implémentation : `npx vitest run tests/app/export.test.ts` : échec de chargement, module `app/src/export` absent, 0 test.
- Après implémentation : `npx vitest run tests/app/export.test.ts -t "csv|JSON|en-tete"` : 14 tests passent, 2 ignorés.
- `npm run typecheck` : passe.

## T8.2 Note de calcul

**Fichiers modifiés** : `app/src/note.ts`.

**Décisions**
- `noteDuCalcul` compose un `NoteDeCalcul` pour `noteDeCalculHtml` ; aucun calcul de la norme n'y est refait.
- La section des hypothèses vient en tête de la note (ordre fixe d'aedificium-ui) : norme et profil normatif, mention exacte, exclusivité de REMP, VID et VID_EXC, et choix enveloppe de SPEC §7 (p_h en C1 et p_w en C2 dans le même cas).
- La section des charges porte un bloc par cas avec son statut et ses combinaisons ou son motif, puis le tableau de `lignesCas`.
- La section des calculs reprend les six blocs de `blocsSynthese`, puis six figures : élévation de REMP, élévation de VID, profils `p_h` et `p_w` avec REMP et VID superposés, vue en plan, et trémie quand le fond en a une. Le tableau des points ouverts appliqués vient ensuite.
- `verifications` reste vide : l'outil constate les actions et ne vérifie rien. Le cartouche porte la norme `EN 1991-4:2006` et l'outil `silo`.

**Points douteux** : aucun. La note n'a ni conclusion ni verdict, conformément à la doctrine.

**Statut des tests**
- Avant implémentation : `npx vitest run tests/app/export.test.ts -t "note"` : 1 test échoue (squelette), 15 ignorés.
- Après implémentation : `npx vitest run tests/app/export.test.ts -t "note"` : 1 test passe, 15 ignorés.
- `npm run typecheck` : passe.

## T8.3 Boutons et affichage

**Fichiers modifiés** : `app/index.html`, `app/src/main.ts`, `app/src/style.css`, `app/src/textes.ts`, `.gitignore`.

**Décisions**
- La page porte une section « Exports » avec sept boutons `data-action="exporter-profils"`, `-bandes`, `-tremie`, `-localisee`, `-synthese`, `-json` et `-note`. Les fichiers téléchargés s'appellent `silo-profils.csv`, `silo-bandes.csv`, `silo-tremie.csv`, `silo-localisee.csv`, `silo-synthese.csv`, `silo-resultat.json` et `silo-note.html`.
- La note s'ouvre par `ouvrirOuTelecharger` ; son cartouche prend un projet fixe `Silo`, l'élément lu sur le `h1` de la page et la date du jour, faute de champs de cartouche dans le formulaire du lot 7.
- Sous chaque dessin, deux boutons `data-action="exporter-dessin"` (un SVG, un PNG) portent `data-dessin` et `data-format` ; ils ne sont pas des `data-champ`. Le SVG part en `svgAutonome(svg, STYLES_DESSIN)`. Le PNG est le rendu du SVG autonome dans un `canvas` (dimensions doubles de son `viewBox`), puis `toBlob`.
- `main.ts` garde les SVG du dernier rendu dans `dessinsCourants` ; une erreur de saisie les efface avec les zones de résultat, pour qu'aucun bouton ne télécharge un dessin périmé.
- Le débordement du bloc « Cas de charge » est corrigé en ajoutant en `main.ts` la classe `bloc-cas` au bloc dont le titre est celui des cas, puis en autorisant le retour à la ligne dans `style.css` (`.bloc-cas .valeur`). `vue.ts` n'est pas modifié.
- Les libellés des boutons passent par `textes.ts` (section `exports`).
- `app/dev-dist/` est ajouté à `.gitignore`.

**Points douteux**
- Le chemin PNG n'est pas exécuté par les tests d'acceptation, qui ne lisent que les chaînes de `index.html` et de `main.ts`. Il dépend du rendu du SVG autonome par le navigateur ; si ce rendu échoue, le bouton PNG ne produit rien, mais l'export SVG reste disponible. Aucun test de fumée sous jsdom n'a été conservé.
- Le cartouche de la note n'a pas de champs de saisie dédiés : le projet est fixe et l'élément vient du titre de la page. Le lot 9 pourra ajouter des champs si la version anglaise en a besoin.

**Statut des tests**
- Avant implémentation : `npx vitest run tests/app/export.test.ts -t "boutons"` : 1 test échoue, l'attribut `data-action` absent de la page, 15 ignorés.
- Après implémentation : `npx vitest run tests/app/export.test.ts -t "boutons"` : 1 test passe ; `npx vitest run tests/app/export.test.ts` : 16 tests passent.
- `npx vitest run tests/app/export.test.ts tests/app/interface.test.ts tests/app/pages.test.ts` : 31 tests passent.
- `npm run typecheck` : passe.

## T8.4 Fin de lot

**Fichiers modifiés** : `PLAN.md` (cases du lot 8 cochées), `README.md` (paragraphe du lot 8), `HANDOFF.md`.

**Décisions**
- `README.md` : paragraphe « Lot 8 » séparé par une ligne vide, qui décrit les cinq CSV, le JSON versionné, la note imprimable et les dessins en SVG autonome et PNG.

**Points douteux** : aucun.

**Statut des tests**
- `npm run typecheck` : passe, aucune erreur.
- `npm test` : 217 tests passent sur 21 fichiers.
- `npm run build` : passe ; `git status` ne montre aucun fichier construit, `app/dev-dist/` est ignoré.
- `git diff ae303e4 --stat -- tests docs/validation src SPEC.md CLAUDE.md CONVENTIONS.md app/en package.json package-lock.json` : sortie vide, tests, cas de validation, noyau, page anglaise et dépendances intacts.

## État final du lot 8

Les trois commandes du lot passent. Trois commits de code ont été faits (`db20288` pour T8.1, `d0011be` pour T8.2, `351e5e8` pour T8.3), puis le commit de documentation de fin de lot. Rien n'a été poussé. Le lot 9 n'a pas été commencé.

# Compte rendu du lot 9, séance `claude-ds`

Branche `lot-9-anglais`, 2026-11-10. Aucun test d'acceptation ni fichier de `docs/validation/` n'a été modifié ; `src/` (noyau et types), `SPEC.md`, `CLAUDE.md`, `CONVENTIONS.md`, `package.json` et `package-lock.json` sont intacts (vérifié par `git diff 5a13307 --stat -- tests docs/validation src SPEC.md CLAUDE.md CONVENTIONS.md package.json package-lock.json`, sortie vide). Aucune dépendance ajoutée, rien n'a été poussé.

## T9.1 Finitions de l'affichage en français

**Fichiers modifiés** : `app/src/vue.ts`, `app/src/main.ts`, `app/src/dessins.ts`, `app/src/note.ts`, `app/src/textes.ts`.

**Décisions**
- `rendreBlocs` et `rendreTableau` passent de `main.ts` à `vue.ts`, qui les exporte ; les deux appliquent `notationHtml` aux symboles, aux libellés, aux valeurs, aux notes et aux en-têtes. `main.ts` les importe.
- Les textes SVG passent par `notationSvg` ; les symboles `h_o`, `p_n` et `p_t` gardent leur notation brute dans un attribut `data-symbole`, ce qui laisse vrais les tests du lot 7.
- Les identifiants de cas (`VID_EXC`, `FOND_REMP`, `FOND_VID`) sont eux aussi notés en indice, donc sans souligné visible.
- `phrase` met en forme les phrases du noyau en français : accents des mots fautifs, apostrophes des élisions, zéros décimaux inutiles. Aucune valeur, formule, signature ni type de `src/` n'a changé ; aucun fichier de `src/` n'a été modifié.
- `messageDErreur` passe par `phrase` ; l'identité exigée par le test du lot 7 pour `hc/dc = 0,35` est conservée.
- Les messages de refus de `form.ts` viennent de `textes()`, ce qui prépare l'anglais.
- Une phrase du noyau non couverte par les règles françaises pourrait encore afficher un accent manquant. Les dix-huit entrées du jeu d'affichage passent.

**Statut des tests**
- `npx vitest run tests/app/finitions.test.ts` : 3 tests passent.
- `npm run typecheck` : passe.

## T9.2 Textes anglais

**Fichiers modifiés** : `app/src/textes.ts`, `app/src/form.ts`, `app/src/export.ts`, `app/src/note.ts`, `app/src/vue.ts`.

**Décisions**
- `textes.ts` porte `FR` et `EN` de même type : une clé oubliée en anglais ne compile pas.
- Les phrases produites en français par le noyau (cas, motifs, combinaisons, erreurs, profil normatif) sont traduites à l'affichage par `traducteur(EXACTES, REGLES)`.
- `ENTETES` devient un objet d'accesseurs `get profils`, `get bandes`, `get tremie`, qui rend la langue courante ; le test du lot 8, en français, reste vert.
- Les CSV suivent `csv()` d'aedificium-ui : point-virgule et virgule décimale en français, virgule et point décimal en anglais, valeurs à 4 décimales fixes dans les deux langues.
- L'en-tête commun, les pieds de `bandes.csv`, la mention, l'exclusivité des cas et les explications de `localisee.csv` passent par `textes()`.
- Les messages de refus de `form.ts` et les noms des matériaux sont bilingues.
- `e_t` s'affiche `eₜ` en anglais : la notation en indice donnerait « et », mot français que `constatsAffichage` signale.
- Les phrases nouvelles non couvertes par les tables ou règles sortiraient en français ; les dix-huit entrées du jeu d'affichage et les messages testés passent.
- Le JSON reste une donnée : seuls la mention et le profil suivent la langue, les libellés internes des cas restent ceux du noyau. Aucun test ne le contrôle.

**Statut des tests**
- `npx vitest run tests/app/anglais.test.ts -t "affichage en anglais"` : 4 tests passent, 3 ignorés (page).
- Après T9.3, `npx vitest run tests/app/anglais.test.ts` : 7 tests passent.

## T9.3 Page anglaise

**Fichiers modifiés** : `app/en/index.html`.

**Décisions**
- La page reprend exactement le squelette de `app/index.html` : mêmes `id`, `data-*`, `type`, `value`, `for` et `name`, dans le même ordre. Seuls les textes, les `aria-label` et le `placeholder` changent.
- Les six légendes sont `Geometry`, `Bottom`, `Material`, `Walls`, `Operation`, `Discretisation` ; le `h1` vaut `Pressures in silos`.
- Le formulaire complet est désormais sur les deux pages ; `main.ts` les sert sans branche particulière.
- Les commentaires qui annonçaient une page anglaise à construire ont été retirés de `main.ts` et des textes.

**Statut des tests**
- `npx vitest run tests/app/anglais.test.ts` : 7 tests passent (squelette, titre, légendes, écran, dessins, note, CSV, messages).

## T9.4 PWA, README, publication

**Fichiers modifiés** : `README.md`, `PLAN.md`.

**Vérifications**
- `npm run build` produit `docs/manifest.webmanifest` et `docs/sw.js`. Le manifeste porte le nom, le nom court, la description, `start_url`, `scope` et `id` à `./`, l'affichage `standalone`, la langue `fr` et les trois icônes.
- Le service worker précache 15 entrées, dont `index.html` et `en/index.html`, les assets JS et CSS, les icônes et le manifeste.
- Aucun essai d'installation dans un navigateur réel n'a été possible (séance sans interface) : le fonctionnement hors ligne est constaté sur la liste de précache du service worker.
- `README.md` : état réel, « Ce que l'outil rend » en liste à puces, fichiers exportés, section « Points ouverts » qui renvoie à SPEC §9 et dit que P4 et P7 attendent la confirmation de l'utilisateur, référence sans annexe nationale.
- Publication : le workflow `pages.yml` date du lot 0 ; aucun push n'a été fait, donc le déploiement effectif par la CI reste à constater après fusion.

**Points douteux**
- L'installation PWA et le fonctionnement hors ligne n'ont pas été essayés dans un navigateur : ils reposent sur les artefacts de construction vérifiés.

**Statut des tests**
- `npm run typecheck` : passe, aucune erreur.
- `npm test` : 227 tests passent sur 23 fichiers.
- `npm run build` : passe ; `git status` ne montre aucun fichier construit.

## T9.5 Fin de lot

**Fichiers modifiés** : `PLAN.md` (cases du lot 9 cochées), `HANDOFF.md`.

**Décisions**
- Les trois cases du lot 9 sont cochées : page anglaise, PWA et README. La vérification PWA est celle du build, précisée ci-dessus.

**Points douteux**
- Aucun test d'acceptation n'exerce les traductions hors du jeu d'affichage ; une phrase nouvelle du noyau devrait être ajoutée aux tables de `textes.ts`.

**Statut des tests**
- `npm run typecheck` : passe, aucune erreur.
- `npm test` : 227 tests passent sur 23 fichiers.
- `npm run build` : passe ; `git status` ne montre aucun fichier construit.
- `git diff 5a13307 --stat -- tests docs/validation src SPEC.md CLAUDE.md CONVENTIONS.md package.json package-lock.json` : sortie vide, tests, cas de validation, noyau et dépendances intacts.

## État final du lot 9

Les trois commandes du lot passent. Trois commits de code ont été faits (`3810072` pour T9.1, `6ddcc12` pour T9.2, `5130641` pour T9.3), puis le commit de documentation de fin de lot. Rien n'a été poussé. Le lot 9 est le dernier lot de la v1 ; l'outil couvre le périmètre de `SPEC.md` et les points ouverts P4 et P7 restent à confirmer par l'utilisateur.

# Compte rendu du lot 10, séance `claude-ds`

Branche `lot-10-carte`, 2026-11-10. Aucun test d'acceptation ni fichier de `docs/validation/` n'a été modifié ; `src/model/types.ts`, `SPEC.md`, `CLAUDE.md`, `CONVENTIONS.md`, `package.json` et `package-lock.json` sont intacts (vérifié par `git diff f9b9b5c --stat -- tests docs/validation src/model/types.ts SPEC.md CLAUDE.md CONVENTIONS.md package.json package-lock.json`, sortie vide). Aucune dépendance ajoutée, rien n'a été poussé.

## T10.1 Noyau

**Fichiers modifiés** : `src/discretisation/carte.ts` (création), `src/index.ts` (réexport de `cartePressions`).

**Décisions**
- `cartePressions` applique l'ordre de T10.1 : contrôle de `pasTheta` (10 par défaut, entier strictement positif diviseur de 360), puis de `z_p` dans [0 ; hc] ; ensuite fond (`FOND_REMP`, `FOND_VID` non applicables), silo rectangulaire (non applicable, renvoi à `profils.csv`), cas non calculé (même statut et même motif que le cas) et définition localisée hors périmètre P3, avant de traiter REMP, VID ou VID_EXC.
- Grille en z : multiples de `dz` dans [0 ; hc], plus 0 et hc, et pour une zone localisée `z_p`, `z_p - s/2` et `z_p + s/2` ramenés dans [0 ; hc]. Grille en θ : multiples du pas, plus les quatre bords des carrés d'une paroi épaisse ou les quatre bords des zones de VID_EXC. Tri et doublons à moins de 1e-9 retirés.
- `p_p = C p_h,sym(z_p)` est constant sur la bande. Paroi épaisse : `p_h + p_p` dans les carrés centrés sur 0 et 180° (bords compris), `p_h - p_p/7` ailleurs dans la bande. Paroi mince : `p_h + p_p cos θ`. Majoration uniforme : `valeursLocalisees` à chaque nœud. Forme nulle : pression symétrique.
- En classe 3, `z_p` vient de l'option ou vaut `hc/2`, `z_pChoisi` est vrai et le motif dit que la norme laisse la zone à toute hauteur et que les autres positions restent à vérifier.
- VID_EXC : `valeursExcentrees` à chaque profondeur, puis `pressionsEnTheta` à chaque angle ; `z_p`, `s` et `demiAngle` sont nuls.
- `Z = Z_transition + hc - z` ; points triés par z puis par θ. Le module assemble les fonctions existantes et ne recalcule aucune formule.

**Points douteux**
- La formulation des motifs n'est fixée par aucun test au-delà de l'expression « toute hauteur ». Les messages d'erreur sont en français sans accents et nomment `hc` ou `360`.
- Une carte `nulle` ou `majoration-uniforme` est de statut `calcule`, sans bande ni position, comme le demande T10.1.
- Le contrôle de `z_p` précède celui du cas : une option hors plage lève même pour un silo rectangulaire ou un fond, conformément à l'ordre imposé.

**Statut des tests**
- Avant implémentation : `npx vitest run tests/discretisation/carte.test.ts` échoue (`cartePressions is not a function`).
- Après implémentation : `npx vitest run tests/discretisation/carte.test.ts` : 14 tests passent.

## T10.2 Export et dessin

**Fichiers modifiés** : `app/src/textes.ts`, `app/src/export.ts`, `app/src/dessins.ts`.

**Décisions**
- `ENTETES.carte` est un accesseur bilingue, comme les autres en-têtes.
- `csvCarte` reprend le bloc d'en-tête commun, ajoute une ligne de repère des angles et une ligne par carte avec `z_p`, `s` et le demi-angle par `nombreAffiche` (d'où `11,25`), puis la ligne de colonnes, les nœuds à 4 décimales fixes et une ligne motivée par carte non calculée.
- `dessinDeveloppe` dessine θ de 0 à 360° en abscisse et z vers le bas, une cellule `rect.cellule` par maille, peinte par `var(--compression)` avec une `fill-opacity` proportionnelle à p_h. Les axes sont légendés par `textes()`, les notations passent par `notationSvg`. Une carte non calculée affiche son cadre, son statut et son motif.
- Les textes nouveaux (titre de la carte, axe θ, en-têtes et rappels de `carte.csv`) existent en français et en anglais.

**Points douteux**
- La teinte d'une maille suit le maximum de ses quatre coins, choix non imposé par le PLAN, qui demande seulement une intensité proportionnelle à p_h.
- La dernière maille angulaire va du dernier angle de la grille à 360°.
- Le motif d'une carte calculée n'est pas écrit dans `carte.csv` : l'en-tête rappelle le repère, `z_p`, `s` et le demi-angle, comme demandé.
- Le développé n'affiche qu'une valeur maximale en kPa comme repère d'échelle, pas une légende graduée.

**Statut des tests**
- Avant implémentation : `npx vitest run tests/app/carte.test.ts -t "carte.csv|developpe"` échoue sur les exports absents.
- Après implémentation : `npx vitest run tests/app/carte.test.ts -t "carte.csv"` : 3 tests passent ; `npx vitest run tests/app/carte.test.ts -t "cellules teintees|carte non calculee|anglais, aucun reste"` : 3 tests passent.

## T10.3 Page

**Fichiers modifiés** : `app/index.html`, `app/en/index.html`, `app/src/main.ts`.

**Décisions**
- Un bloc « Carte p(z, θ) » est ajouté dans la zone des dessins des deux pages, avec `data-role="carte-cas"`, `data-role="carte-pas"` (5, 10, 15, 30, 10 par défaut), `data-role="carte-zp"` et `data-role="developpe"`. Les attributs `id`, `data-*`, `type` et `value` restent identiques d'une page à l'autre, ce que vérifie le test du lot 9.
- `main.ts` calcule d'abord la carte sans option de position. Si elle rend `z_pChoisi`, il lit le champ et recalcule ; sinon il désactive le champ. Une position refusée s'affiche dans la zone du dessin, sans effacer les autres résultats, et l'export retombe sur le pas seul.
- Un bouton `data-action="exporter-carte"` exporte `silo-carte.csv` avec les cartes REMP, VID et VID_EXC au pas et à la position retenus. Sous le dessin, les boutons SVG et PNG sont ceux de `poserDessin`.
- Le libellé de position est écrit `z<sub>p</sub>` pour ne laisser aucun souligné visible, sur les deux pages.

**Points douteux**
- Le champ de position n'a pas d'attribut `disabled` statique : son état est posé au premier rendu.
- L'erreur de position est affichée dans la zone du développé, et non dans la zone d'erreur générale, pour ne pas effacer les autres résultats.
- L'export utilise la dernière position acceptée ; si l'utilisateur tape une position invalide puis exporte, la carte exportée reste celle du pas seul.

**Statut des tests**
- `npx vitest run tests/app/carte.test.ts` : 7 tests passent.
- `npx vitest run tests/app/anglais.test.ts tests/app/carte.test.ts` : 14 tests passent, après correction du libellé `z_p` en indice.
- `npx vitest run tests/app/anglais.test.ts tests/app/interface.test.ts tests/app/pages.test.ts tests/app/export.test.ts tests/app/dessins.test.ts tests/app/finitions.test.ts` : 49 tests passent.

## T10.4 Fin de lot

**Fichiers modifiés** : `PLAN.md` (cases du lot 10 cochées), `README.md` (puce du lot 10, `silo-carte.csv` et `silo-carte.svg` dans les fichiers exportés), `HANDOFF.md`.

**Décisions**
- La puce du lot 10 décrit la carte, le développé et la position choisie en classe 3.

**Points douteux** : aucun.

**Statut des tests**
- `npm run typecheck` : passe, aucune erreur.
- `npm test` : 248 tests passent sur 25 fichiers.
- `npm run build` : passe ; `docs/` est reconstruit et `git status` ne montre aucun fichier construit.
- `git diff f9b9b5c --stat -- tests docs/validation src/model/types.ts SPEC.md CLAUDE.md CONVENTIONS.md package.json package-lock.json` : sortie vide, tests, cas de validation, types protégés et dépendances intacts.

## État final du lot 10

Les trois commandes du lot passent. Trois commits de code ont été faits (`f8c7e92` pour T10.1, `fb25fd8` pour T10.2, `8954f1d` pour T10.3), puis le commit de documentation de fin de lot. Rien n'a été poussé. Le lot 10 est le dernier lot de la v1.

# Compte rendu du lot 11, séance `claude-ds`

Branche `lot-11-classe3`, 2026-11-11. Aucun test d'acceptation ni fichier de `docs/validation/` n'a été modifié par cette séance ; la séance de conception a corrigé trois jeux de conditions de T11.2 au commit `4c3c7cf` (voir T11.2). `src/model/types.ts`, les types de `src/norms/profil.ts`, `SPEC.md`, `CLAUDE.md` et `CONVENTIONS.md` sont intacts (vérifié par `git diff 4c3c7cf --stat -- tests docs/validation src/model/types.ts src/norms/profil.ts SPEC.md CLAUDE.md CONVENTIONS.md`, sortie vide). Aucune dépendance ajoutée, rien n'a été poussé.

## T11.1 Canal d'écoulement

**Fichiers modifiés** : `src/norms/en1991-4-recommande.ts` (`k1_canal`, `k2_canal`, `k3_canal`), `src/parois/canal.ts` (création), `src/parois/excentree.ts` (message de classe 3 exact et fonction auxiliaire `valeursSymetriquesExcentree`), `src/index.ts` (réexports).

**Décisions**
- Le profil porte `k1_canal = 0,25`, `k2_canal = 0,4` et `k3_canal = 0,6`, avec les sources `EN 1991-4:2006, 5.52`, `5.53` et `5.54` ; `verifierProfil` les contrôle par sa boucle générique (valeur finie et source non vide). Aucun contrôle de plage n'a été ajouté à `verifierProfil`, qui n'en a pour aucune grandeur.
- `canalEcoulement` applique, dans l'ordre exigé, les refus de forme (message contenant `circulaire`), de classe (message contenant `classe 3`), de non-déclenchement (message contenant `declench`), puis les refus de géométrie citant 5.2.4.3 (`e_c + r_c <= r`, `|cos theta_c| > 1`, `|cos psi| > 1`).
- `eta = mu / tan phi_i`, `e_c`, `theta_c` et `psi` sont calculés en radians (5.55 à 5.62) ; `psi` vient de la loi des cosinus et sa concordance avec `sin psi = (r / r_c) sin theta_c` est contrôlée à 1e-9 près, avec une erreur qui cite 5.61 si elle échoue. Les angles rendus sont en degrés.
- `p_hce` et `p_wce` sont nuls dans `valeursExcentrees` et portés par `ValeursExcentrees` dans `valeursCanal` ; `zonesCanal` reprend les trois zones avec `theta_c` du canal, `pointsOuverts: ['P1', 'P4']` et un motif qui cite 5.2.4.3 et le rayon `r_c`.
- `valeursSymetriquesExcentree` est extraite de `valeursExcentrees` pour que `canal.ts` et `calcul.ts` réutilisent la même évaluation en combinaison X, sans changer la signature des fonctions existantes.
- Le message de `zonesExcentrees` en classe 3 devient exactement celui du test : `Methode simplifiee de 5.2.4.2 reservee a la classe 2 (5.2.4.1(5)) : en classe 3, voir les cas VID_EXC_1 a VID_EXC_3 (5.2.4.3).`

**Points douteux**
- `valeursCanal` reçoit le profil `p` comme le demande le PLAN, mais n'en a pas besoin : le paramètre est nommé `_p` pour satisfaire `noUnusedParameters`. Sa position et son type sont inchangés.
- `verifierProfil` ne rejette pas une valeur de `k_i` hors de `]0 ; 1[` ; le PLAN mentionne cette plage, mais la fonction n'a aucun contrôle de plage pour les autres clés. Les trois valeurs recommandées sont dans la plage.
- Le contrôle `|cos psi| > 1` n'est pas imposé par le PLAN ; il évite un `NaN` si la géométrie du canal n'a pas de solution, avec un message qui cite 5.2.4.3.

**Statut des tests**
- Avant implémentation : `npx vitest run tests/parois/canal.test.ts tests/parois/excentree.test.ts` : 20 échecs et 1 réussite sur 21, modules `canal` absent et message de classe 3 non conforme.
- Après implémentation : `npx vitest run tests/parois/canal.test.ts tests/parois/excentree.test.ts` : 25 tests passent (15 dans `canal.test.ts`, 10 dans `excentree.test.ts`).

## T11.2 Remplissage excentré

**Fichiers modifiés** : `src/parois/remplissage-excentre.ts` (création), `src/index.ts` (réexports).

**Décisions**
- `remplissageExcentre` vérifie dans l'ordre la forme circulaire, la classe 3 (`cl.procedures`), `hc/dc < 2,0`, puis `e_t > excentrementGrand d_c` ; `e_t` vaut `e_f` s'il n'est pas saisi. Hors déclenchement, `p_ho`, `h_o`, `B`, `K` et `mu` sont nuls et le motif nomme la condition qui manque.
- Déclenché, il applique 5.3.3(4) avec la combinaison C2 (K supérieur, mu supérieur, gamma = gamma_u) et calcule `p_ho`, `h_o` et `B` par 5.93 à 5.96.
- Le type public `RemplissageExcentre` ne porte ni le rayon, ni l'angle de talus, ni gamma. L'objet rendu porte donc trois propriétés supplémentaires, documentées dans un type local non exporté ; `nzSkAdditionnel` les lit par un transtypage et, à défaut, retrouve `r` et phi_r par les relations de 5.93 à 5.96.
- `nzSkAdditionnel` applique 5.92 avec `z_s = z + h_o` et `Z = z_s / B`, et rend 0 hors déclenchement.

**Point bloquant, résolu par la séance de conception**

Le premier passage de cette séance avait signalé deux cas de `conditions manquantes` incompatibles avec `classer` : `variante(v5(), { e_t: 4 })`, qui est de classe 3 par le tableau 2.1, et `variante(v2(), { classeImposee: 3, e_t: 4 })`, dont l'excentrement dépasse `d/2 = 3 m` et que `validerDonnees` refuse. La séance de conception a corrigé les trois jeux incompatibles au commit `4c3c7cf` : V2 sans classe imposée avec `e_t = 2 m` (condition `classe 3` manquante), V2 en classe 3 avec `e_t = 2 m` (condition `2,0` manquante) et V1 en classe 3 avec `e_t = 2 m` (condition `circulaire` manquante). Le quatrième cas, V5 en classe 3 avec `e_t = 2 m`, attend le motif `0,25`. Les valeurs attendues de V8 ne changent pas. Aucune valeur n'a été recalculée par cette séance et le test n'a pas été modifié.

**Statut des tests**
- Avant implémentation : `npx vitest run tests/parois/remplissage-excentre.test.ts -t "declenchement|force"` : 5 échecs sur 5, fonctions absentes.
- Après la correction des tests par la séance de conception : `npx vitest run tests/parois/remplissage-excentre.test.ts` : 6 tests passent. Les valeurs de V8 passent : `p_ho = 86,2069`, `h_o = 0,8998`, `B = 9,8869`, et les quatre forces additionnelles 27,4586 ; 86,4169 ; 224,4511 ; 253,6689 kN/m.

## T11.3 Calcul

**Fichiers modifiés** : `src/calcul.ts`, `src/discretisation/carte.ts`, `src/parois/excentree.ts` (constante `MOTIF_CLASSE3_EXCENTREE` extraite, sans changement de signature).

**Décisions**
- `ResultatSilo.remplissageExcentre` est rempli par `remplissageExcentre`. Dans `REMP`, seul `n_zSk` change : il augmente de `nzSkAdditionnel(z, remplissageExcentre)` à chaque point ; `p_h`, `p_w` et `p_v` restent inchangés. `P8` entre dans `pointsOuverts` quand 5.3.3 est déclenché.
- Un silo circulaire de classe 3 (`cl.procedures === 3`) produit huit cas dans l'ordre `REMP, VID, VID_EXC, VID_EXC_1, VID_EXC_2, VID_EXC_3, FOND_REMP, FOND_VID`. `VID_EXC` est déclaré non applicable avec le message exact de T11.1. Les trois canaux sont non applicables si la vidange excentrée n'est pas déclenchée, non applicables en écoulement en cheminée (5.1(8)), hors périmètre si `canalEcoulement` lève pour une géométrie impossible, et calculés sinon.
- Un cas de canal calculé porte `canal`, `excentree = zonesCanal(canal)` et un profil comme `VID_EXC` : `p_h_sym = p_hse`, `p_h_total = p_hae`, `p_h_loc = p_hae - p_hse`, `p_w = p_wae`, `p_v` et `n_zSk` de l'évaluation symétrique en X par `valeursSymetriquesExcentree`. Chaque canal a ses bandes et son contrôle. Libellé « Vidange excentrée, canal d'écoulement r_c = k_i r », combinaisons `X`.
- Un silo rectangulaire ou de classe 2 garde ses cinq cas ; `canal` vaut `null` partout dans ce cas comme sur REMP, VID et les cas de fond.
- `pointsOuverts` reçoit `P1` et `P4` dès qu'un canal est calculé, et `P8` dès que 5.3.3 est déclenché.
- `cartePressions` accepte `VID_EXC_1` à `VID_EXC_3` : zones de `zonesCanal` et valeurs de `valeursCanal` à chaque nœud, avec les bords `theta_c` et `2 theta_c` dans la grille angulaire.

**Points douteux**
- L'ordre des contrôles d'un `VID_EXC_i` suit le PLAN : non-déclenchement, puis écoulement en cheminée, puis géométrie du canal. Le cas à la fois non déclenché et en écoulement en cheminée n'est pas exercé par les tests.
- Un canal de géométrie impossible rend `hors-perimetre` avec le message de `canalEcoulement` ; aucun cas de validation n'emprunte cette branche.
- La constante `MOTIF_CLASSE3_EXCENTREE` est nouvellement exportée par `excentree.ts` pour que le message exact de T11.1 serve aussi de motif de `VID_EXC` ; aucune signature existante ne change.
- Le type `ValeursExcentrees` ne porte ni `p_v` ni `n_zSk` : le calcul les obtient par `valeursSymetriquesExcentree`, comme le prévoyait le PLAN, sans modifier de fonction existante.

**Statut des tests**
- Avant implémentation : `npx vitest run tests/cas tests/parois/remplissage-excentre.test.ts tests/discretisation` : 7 échecs et 34 réussites sur 41.
- Après implémentation : la même commande donne 41 tests passants sur 4 fichiers.
- Commit de code : `bf9e79c`.

## T11.4 Interface et exports

**Fichiers modifiés** : `app/src/textes.ts`, `app/src/vue.ts`, `app/src/main.ts`, `app/src/export.ts`, `app/src/dessins.ts`.

**Décisions**
- `textes.ts` reçoit les libellés des trois canaux, le bloc « Vidange excentrée, classe 3 », les symboles `r_c` et `Delta n_zSk`, la ligne du pied de paroi, la question et le choix de P8, et un texte d'exclusivité qui cite `VID_EXC_1` à `VID_EXC_3` en classe 3, en français et en anglais. Les nouveaux motifs du noyau (message de classe 3, remplissage excentré déclenché, canaux et leurs erreurs) sont traduits par `EXACTES` et `REGLES`. En anglais, P8 écrit `eₜ` pour ne pas laisser le mot français « et » après la mise en indice.
- `blocsSynthese` ajoute, en classe 3 seulement, un bloc « Vidange excentrée, classe 3 » avec une ligne par canal portant `r_c`, `e_c` et `theta_c`. Quand 5.3.3 est déclenché, le bloc des parois reçoit une ligne `Delta n_zSk` au pied de la paroi et son motif.
- `main.ts` reconstruit les sélecteurs d'élévation et de carte à partir de `r.cas` (tous les cas à l'élévation, les seuls cas de paroi à la carte), en conservant la valeur choisie quand elle reste offerte. Les profils et l'export de la carte itèrent sur les cas de paroi du résultat.
- `export.ts` itère sur `r.cas` pour les profils, les bandes et la trémie. `localisee.csv` liste les zones de chaque cas excentré calculé (VID_EXC ou canaux). L'en-tête commun cite les canaux dans la phrase d'exclusivité en classe 3 ; l'expression du lot 8 reste vraie.
- `identifiantsDeCas` rétablit aussi le souligné des identifiants numérotés (`VID_EXC_1`) ; `idSvg` les rendait déjà tels quels. Les tracés des canaux reçoivent leur classe de peinture.

**Points douteux**
- La phrase d'exclusivité des hypothèses de la note reste celle de REMP, VID et VID_EXC ; seuls les en-têtes CSV devaient citer les canaux, et la note ne les contredit pas puisque VID_EXC y est déclaré non applicable en classe 3.
- `dessinPlan` ne trace pas les secteurs des trois canaux : T11.4 ne le demande pas, et la vue en plan de classe 3 ne montre donc aucune zone excentrée tant que VID_EXC est non applicable.
- Le bloc des canaux est placé après « Cas de charge » ; aucun test ne fixe sa position.
- `csvLocalisee` ajoute les zones des canaux après celles de VID_EXC ; seul le cas V2 de classe 2 est verrouillé par un test.

**Statut des tests**
- `npm run typecheck` : passe, aucune erreur.
- `npx vitest run` : 275 tests passent sur 28 fichiers, dont `tests/app/finitions.test.ts` et `tests/app/anglais.test.ts` qui parcourent V8 et les huit cas de la classe 3.
- Commit de code : `e86831d`.

## T11.5 Fin de lot

**Fichiers modifiés** : `PLAN.md` (cases du lot 11 cochées), `README.md` (puce du lot 11, P8 dans les points ouverts, exclusivité des canaux), `app/index.html` et `app/en/index.html` (pieds de page), `HANDOFF.md`.

**Décisions**
- Le README reçoit une puce « Lot 11 » et la mention de P8 parmi les points ouverts à confirmer. Il ne portait pas de liste hors périmètre : le retrait de la classe 3 concerne donc les pieds de page.
- Les pieds de page des deux langues retirent la vidange excentrée de classe 3 et le grand excentrement de remplissage de la liste hors périmètre, et y ajoutent la trémie compacte à pente variable (5.2.4.3.1(5)), qui reste hors périmètre.

**Points douteux**
- P8 reste à confirmer par l'utilisateur, comme P4 et P7 : le README le dit.

**Statut des tests**
- `npm run typecheck` : passe, aucune erreur.
- `npm test` : 275 tests passent sur 28 fichiers.
- `npm run build` : passe ; le service worker précache 15 entrées, dont les deux pages ; `git status` ne montre aucun fichier construit.
- `git diff 4c3c7cf --stat -- tests docs/validation src/model/types.ts src/norms/profil.ts SPEC.md CLAUDE.md CONVENTIONS.md` : sortie vide, tests, cas de validation, types protégés et consignes intacts.

## État final du lot 11

- Les trois commandes du lot passent : `npm run typecheck`, `npm test` (275 tests, 28 fichiers) et `npm run build`.
- Commits de code de cette reprise : `bf9e79c` pour T11.3 et `e86831d` pour T11.4, puis le commit de documentation de fin de lot. T11.1 et T11.2 avaient été acquis au commit `1e8d68c`, puis les tests de T11.2 ont été corrigés par la séance de conception au commit `4c3c7cf`.
- Aucun test d'acceptation, fichier de `docs/validation/`, type protégé ni dépendance modifié par cette séance ; aucune valeur attendue recalculée ; rien n'a été poussé.
- Le lot 11 est le dernier lot de la v1. P4, P7 et P8 restent à confirmer par l'utilisateur.
