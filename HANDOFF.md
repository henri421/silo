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
