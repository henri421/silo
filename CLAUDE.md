# Instructions pour Claude Code : dépôt `pressions-silos`

Ce dépôt doit devenir l'outil de la suite [Aedificium web](https://henri421.github.io/WebAedificium/) qui calcule les **actions des matériaux ensilés sur les parois et les fonds des silos selon l'EN 1991-4:2006**. Il produit des profils de pression en fonction de la profondeur, des graphiques et des fichiers CSV prêts à charger un modèle aux éléments finis (SCIA Engineer ou autre).

## Ordre de lecture, avant toute ligne de code

1. `CONVENTIONS.md` : conventions de la suite. Identique dans chaque dépôt, il ne se modifie pas ici.
2. `SPEC.md` : ce que l'outil calcule, avec chaque formule et sa clause.
3. `PLAN.md` : les lots, dans l'ordre. On en exécute un seul à la fois.
4. `docs/validation/` : les cas résolus à la main. Ce sont les contrats numériques des tests.
5. Le dépôt de référence pour la structure : <https://github.com/henri421/charges-climatiques>. Il faut le cloner et le lire avant le lot 0, puis reprendre sa pile, sa configuration Vite et PWA, son workflow, sa page anglaise et son usage d'`aedificium-ui` plutôt que de les réinventer.
6. Pour l'identité graphique : `DESIGN.md` de <https://github.com/henri421/WebAedificium>. Les jetons ne se recopient pas à la main : ils viennent d'`aedificium-ui` (`JETONS`).

## Règles qui ne se discutent pas

**Doctrine.** L'outil constate et ne prescrit pas. Il rend des actions, jamais un ferraillage ni une épaisseur. Un cas sans objet est déclaré « non applicable » avec son motif, jamais omis. Un cas hors périmètre lève une erreur explicite qui nomme la clause non traitée ; on ne glisse jamais vers une configuration voisine.

**Valeurs de référence.** Les valeurs attendues des tests sont celles de `docs/validation/*.md`, recopiées **en dur**. Un test ne les recalcule jamais. `docs/validation/reference.py` est un calcul indépendant en Python : il ne doit être ni importé ni traduit en TypeScript. Si l'implémentation et un cas de validation divergent, on ne touche pas au cas pour le faire passer. On s'arrête et on signale l'écart, avec la clause et le calcul intermédiaire en cause.

**Norme.** Le texte de l'EN 1991-4 est sous licence. Le PDF ne doit **jamais** entrer dans le dépôt, et aucune clause ne se recopie mot pour mot dans le code ni dans la documentation : on cite le numéro de clause ou d'équation et on reformule. Les seules valeurs de matériaux livrées sont celles du « sable » et du « matériau par défaut » du tableau E.1, données dans `SPEC.md` §3.3. Les autres matériaux s'ajouteront comme fichiers de données, chaque valeur avec sa source, après lecture du tableau par l'utilisateur.

**Annexe nationale.** Aucune valeur nationale n'est codée. Les valeurs sont les valeurs recommandées de la norme (tableau 2.1, Ch, Cw, Cb, etc.), chacune avec sa source, dans un profil du même type que `ec1Recommande()` de `charges-climatiques`.

**Points ouverts.** `SPEC.md` §9 liste les lectures de la norme qui ne sont pas tranchées. Elles ne se règlent jamais par une hypothèse silencieuse. Si un lot en dépend, on code le choix déclaré dans la spécification, on l'affiche dans l'interface et la note, et on le signale dans le résumé du lot. Si aucun choix n'est déclaré, on s'arrête et on pose la question.

**Langue et style.** Code en français sans accents (identifiants, commentaires) ; README, chaînes affichées et documentation en français accentué. Dans toute la documentation et les textes affichés, on n'utilise ni le tiret cadratin ni les doubles ou triples tirets comme ponctuation : on écrit des phrases complètes. Dans les tableaux Markdown, la ligne de séparation s'écrit `|-|-|`.

## Commandes

```bash
npm install
npm run typecheck
npm test
npm run dev
npm run build
```

Un lot n'est terminé que si `typecheck`, `test` et `build` passent tous les trois.

## Manière de travailler

Une branche par lot (`lot-1-geometrie`, etc.), des commits petits et nommés en français (`feat: profils Janssen pour silos elances`). Pour chaque fonction du noyau, on écrit d'abord le test avec la valeur du cas de validation, puis le code. À la fin de chaque lot :

1. Cocher les cases du lot dans `PLAN.md`.
2. Mettre à jour la section « Ce que l'outil rend » du `README.md`.
3. Écrire un résumé de quelques lignes : ce qui a été fait, ce qui est déclaré non applicable ou hors périmètre, les points ouverts rencontrés.
4. S'arrêter et attendre l'accord avant le lot suivant.

Identité Git anonyme (`henri421`), configurée localement dans le dépôt. On ne pousse que si l'utilisateur le demande.
