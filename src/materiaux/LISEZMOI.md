# Ajouter un matériau à la bibliothèque

La bibliothèque livrée ne contient que deux entrées, le « matériau par défaut » et le « sable », lues sur le tableau E.1 de l'EN 1991-4:2006. Les autres matériaux s'ajoutent ici, après lecture du tableau E.1 dans votre propre exemplaire de la norme.

## Marche à suivre

1. Ouvrir `bibliotheque.json` et copier une entrée existante.
2. Donner un identifiant stable, sans accent ni espace (`ble`, `ciment`), et un nom affiché.
3. Renseigner les douze champs ci-dessous, un par grandeur, en les lisant sur le tableau E.1.
4. Écrire pour chaque valeur sa source : la norme, le tableau et, si besoin, la note ou la ligne lue.
5. Laisser le champ `format` à `silo-materiaux` et le champ `version` à `1`.

## Les douze champs

| Champ | Grandeur | Unité |
|-|-|-|
| `gamma_l` | poids volumique inférieur | kN/m³ |
| `gamma_u` | poids volumique supérieur, valeur caractéristique des charges | kN/m³ |
| `phi_r` | angle de talus naturel | degré |
| `phi_im` | angle de frottement interne moyen | degré |
| `a_phi` | coefficient de variation de `phi_i` | sans dimension |
| `K_m` | rapport de pression latéral moyen | sans dimension |
| `a_K` | coefficient de variation de `K` | sans dimension |
| `mu_m_D1` | coefficient de frottement de paroi moyen, catégorie D1 | sans dimension |
| `mu_m_D2` | coefficient de frottement de paroi moyen, catégorie D2 | sans dimension |
| `mu_m_D3` | coefficient de frottement de paroi moyen, catégorie D3 | sans dimension |
| `a_mu` | coefficient de variation de `mu` | sans dimension |
| `C_op` | coefficient de référence de l'action localisée | sans dimension |

## Règle de blocage

Une valeur sans source, une valeur non finie ou un champ absent empêche le chargement de toute la bibliothèque : le message d'erreur nomme le matériau et le champ en cause. Aucune valeur ne doit être devinée ni recopiée d'un autre matériau.

## Droits

Le texte de la norme est sous licence. Ne recopiez pas le tableau E.1 dans ce dépôt : saisissez seulement les valeurs du matériau que vous étudiez, avec leur provenance.
