# silo

Actions des matériaux ensilés sur les parois et les fonds des silos selon l'**EN 1991-4:2006** : silos circulaires et rectangulaires, élancés, d'élancement intermédiaire ou peu élancés, à fond plat ou à trémie. Les pressions sont rendues **cas par cas et niveau par niveau**, en graphiques et en fichiers CSV prêts pour un modèle aux éléments finis.

Fait partie de la suite [Aedificium web](https://henri421.github.io/WebAedificium/).
Page publiée : <https://henri421.github.io/silo/> (à la fin du lot 9).

> **Aide au calcul. Cet outil constate, il ne prescrit pas.** Toutes les valeurs sont caractéristiques : les coefficients partiels et les combinaisons de l'EN 1990 restent à appliquer dans le logiciel de calcul. Les propriétés des matériaux viennent du tableau E.1 ou d'essais ; un matériau qui n'y est pas clairement assimilable relève d'essais (4.2.3(2)). Le domaine de la norme est limité aux matériaux à écoulement libre (1.1(4)).

## État

En construction. Le périmètre visé est décrit dans [`SPEC.md`](SPEC.md) et l'avancement dans [`PLAN.md`](PLAN.md). Cette section « Ce que l'outil rend » est complétée à la fin de chaque lot.

## Ce que l'outil rend

Lot 0 : squelette publiable, sans calcul.
Lot 1 : géométrie, bibliothèque de matériaux, classement et combinaisons de propriétés, sans pressions encore.

## Choix de modélisation déclarés

* Les pressions normales sont calculées avec la combinaison « pression normale maximale » (K supérieur, μ inférieur) et le frottement avec la combinaison « frottement maximal » (K et μ supérieurs). Les associer dans un même cas de charge est un choix enveloppe.
* Les cas de remplissage, de vidange et de vidange excentrée sont exclusifs l'un de l'autre.
* Une classe 1 est calculée avec les procédures de la classe 2 (2.5(3)).
* Les lectures de la norme non tranchées par son texte sont listées en [`SPEC.md` §9](SPEC.md) ; chacune est affichée dans l'interface et la note quand elle intervient.

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

EN 1991-4:2006, *Actions sur les structures. Partie 4 : silos et réservoirs*, et son annexe nationale. EN 1990 pour les combinaisons, hors périmètre de ce dépôt.

## Licence

MIT, voir [LICENSE](LICENSE), sans garantie d'aucune sorte.
