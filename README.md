# silo

Actions des matériaux ensilés sur les parois et les fonds des silos selon l'**EN 1991-4:2006** : silos circulaires et rectangulaires, élancés, d'élancement intermédiaire ou peu élancés, à fond plat ou à trémie. Les pressions sont rendues **cas par cas et niveau par niveau**, en graphiques et en fichiers CSV prêts pour un modèle aux éléments finis.

Fait partie de la suite [Aedificium web](https://henri421.github.io/WebAedificium/).
Page publiée : <https://henri421.github.io/silo/>, version française et version anglaise.

> **Aide au calcul. Cet outil constate, il ne prescrit pas.** Toutes les valeurs sont caractéristiques : les coefficients partiels et les combinaisons de l'EN 1990 restent à appliquer dans le logiciel de calcul. Les propriétés des matériaux viennent du tableau E.1 ou d'essais ; un matériau qui n'y est pas clairement assimilable relève d'essais (4.2.3(2)). Le domaine de la norme est limité aux matériaux à écoulement libre (1.1(4)).

## État

L'outil couvre le périmètre v1 décrit dans [`SPEC.md`](SPEC.md). La version française et la version anglaise sont publiées par la CI sur GitHub Pages ; l'application s'installe et fonctionne hors ligne. L'avancement lot par lot est consigné dans [`PLAN.md`](PLAN.md) et [`HANDOFF.md`](HANDOFF.md).

## Ce que l'outil rend

- Lot 0 : squelette publiable, sans calcul.
- Lot 1 : géométrie, bibliothèque de matériaux, classement et combinaisons de propriétés, sans pressions encore.
- Lot 2 : pressions des parois verticales aux cas symétriques, remplissage et vidange, par Janssen et Janssen modifié.
- Lot 3 : action localisée (C_pf, C_pe) et ses formes : majoration 0,36 des parois non circulaires, zones des parois circulaires épaisses ou minces, majoration uniforme de 5.2.3, avec les cas nuls et hors périmètre motivés.
- Lot 4 : fond plat (6.2.1 et 6.2.2) et trémie (6.3 et 6.4), avec C_b, p_vft, le classement profond ou peu profond et les pressions p_n et p_t.
- Lot 5 : vidange à grand excentrement des silos circulaires (5.2.4.2 et 5.3.4), avec le déclenchement, les zones en θ et les valeurs en combinaison X.
- Lot 6 : calcul complet des cinq cas de charge (REMP, VID, VID_EXC, FOND_REMP, FOND_VID), avec leur statut, leurs motifs et leurs profils, puis les bandes de chargement et leur contrôle par la somme des trapèzes et l'intégrale de Simpson.
- Lot 7 : interface de saisie par blocs, avec recalcul continu et sans bouton de calcul, synthèse des grandeurs, liste des cas avec leur statut et points ouverts appliqués, dessins SVG de l'élévation, des profils, de la vue en plan et de la trémie, et enregistrement de la saisie comme feuille de projet par `aedificium-ui`.
- Lot 8 : exports du calcul, avec les cinq fichiers CSV et leur bloc d'en-tête, le JSON versionné, la note de calcul HTML imprimable, et les dessins téléchargeables en SVG autonome et en PNG.
- Lot 9 : version anglaise de l'interface et des exports, application installable et fonctionnement hors ligne par le manifeste et le service worker communs aux deux pages.
- Lot 10 : carte p(z, θ) des parois verticales d'un silo circulaire pour les modèles en coque, avec le développé de la paroi en SVG et l'export `silo-carte.csv`. La zone localisée est centrée sur θ = 0 ; en classe 3, sa profondeur z_p est choisie par l'utilisateur et le motif le rappelle.

### Fichiers exportés

- `silo-profils.csv` : une ligne par cas et par profondeur, avec les pressions, l'effort vertical et la combinaison.
- `silo-bandes.csv` : une ligne par cas et par bande de hauteur, avec le contrôle par la somme des trapèzes et l'intégrale.
- `silo-tremie.csv` : les pressions p_n et p_t le long de la paroi de trémie, ou la pression du fond plat.
- `silo-localisee.csv` : la définition de l'action localisée et les zones en angle de la vidange excentrée.
- `silo-carte.csv` : une ligne par cas, profondeur et angle, avec p_h et p_w, pour un silo circulaire.
- `silo-synthese.csv` : les blocs de la synthèse.
- `silo-resultat.json` : le résultat structuré et versionné, avec les données d'entrée, les cas, les bandes et les points ouverts appliqués.
- `silo-note.html` : la note de calcul imprimable, avec ses figures.
- Les dessins s'exportent aussi en `silo-elevation.svg`, `silo-profils.svg`, `silo-plan.svg`, `silo-tremie.svg`, `silo-carte.svg` et leurs PNG.

## Points ouverts

Les lectures de la norme non tranchées par son texte sont listées en [`SPEC.md` §9](SPEC.md) et affichées dans l'interface et dans la note quand elles interviennent. Deux attendent encore la confirmation de l'utilisateur : P4, étendue de la zone portée à deux fois la pression de paroi en vidange excentrée, et P7, forme de la majoration uniforme à la vidange d'un silo circulaire intermédiaire ou peu élancé de classe 2.

## Choix de modélisation déclarés

* Les pressions normales sont calculées avec la combinaison « pression normale maximale » (K supérieur, μ inférieur) et le frottement avec la combinaison « frottement maximal » (K et μ supérieurs). Les associer dans un même cas de charge est un choix enveloppe.
* Les cas de remplissage, de vidange et de vidange excentrée sont exclusifs l'un de l'autre.
* Une classe 1 est calculée avec les procédures de la classe 2 (2.5(3)).
* Les lectures de la norme non tranchées par son texte sont listées en [`SPEC.md` §9](SPEC.md) ; chacune est affichée dans l'interface et la note quand elle intervient (voir « Points ouverts »).

## Développement

```bash
npm install
npm run typecheck
npm test
npm run dev
```

Noyau pur dans `src/` (unités : m, kN/m³, kPa, kN/m), interface dans `app/`, primitives communes tirées de [`aedificium-ui`](https://github.com/henri421/aedificium-ui).
Cas résolus à la main : [`docs/validation/`](docs/validation/).
Conventions de la suite : [`CONVENTIONS.md`](CONVENTIONS.md).

## Références

EN 1991-4:2006, *Actions sur les structures. Partie 4 : silos et réservoirs*. Seules les valeurs recommandées de la norme sont employées : aucune annexe nationale n'est codée. EN 1990 pour les combinaisons, hors périmètre de ce dépôt.

## Licence

MIT, voir [LICENSE](LICENSE), sans garantie d'aucune sorte.
