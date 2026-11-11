# V7 : V2 en classe 3, vidange excentrée par le canal d'écoulement

Cas reproduit par les tests du lot 11. Valeurs établies par `reference.py`, arrondies à 4 décimales.

## Données

Celles de V2 (silo circulaire d = 6 m, t = 0,20 m, hc = 18 m, sable, paroi D2, e_o = 2,0 m), avec la classe imposée à 3.

## Propriétés (5.2.4.1(4), P1)

* μ inférieur = 0,48 / 1,16 = **0,413793** ; φ_i supérieur = 36 × 1,09 = **39,24°** ; K supérieur = 0,45 × 1,11 = **0,4995** ; γ = 16 kN/m³.
* η = μ / tan φ_i = **0,506638** ; r = 3 m.

## Géométrie du canal (5.52 à 5.62)

| k | r_c (m) | e_c (m) | θ_c (°) | ψ (°) | U_wc (m) | U_sc (m) | A_c (m²) | z_oc (m) | p_hco (kPa) |
|-|-|-|-|-|-|-|-|-|-|
| 0,25 | 0,75 | 2,4217 | 10,1656 | 44,9084 | 1,0645 | 3,5367 | 1,6408 | 0,9867 | 7,8860 |
| 0,4 | 1,2 | 2,0584 | 17,2171 | 47,7298 | 1,8030 | 5,5405 | 4,2009 | 1,5955 | 12,7513 |
| 0,6 | 1,8 | 1,5441 | 28,4682 | 52,6034 | 2,9812 | 8,0046 | 9,4679 | 2,4391 | 19,4931 |

ψ vérifie `sin ψ = (r / r_c) sin θ_c` (5.61).

## Pressions (5.63 à 5.70), kPa

| k | z (m) | p_hce | p_wce | p_hse | p_wse | p_hae | p_wae |
|-|-|-|-|-|-|-|-|
| 0,25 | 9 | 7,8851 | 3,2628 | 41,2180 | 17,0557 | 74,5510 | 30,8487 |
| 0,25 | 18 | 7,8860 | 3,2632 | 53,1442 | 21,9907 | 98,4025 | 40,7183 |
| 0,4 | 9 | 12,7060 | 5,2577 | 41,2180 | 17,0557 | 69,7301 | 28,8538 |
| 0,4 | 18 | 12,7511 | 5,2763 | 53,1442 | 21,9907 | 93,5374 | 38,7051 |
| 0,6 | 9 | 19,0062 | 7,8647 | 41,2180 | 17,0557 | 63,4298 | 26,2468 |
| 0,6 | 18 | 19,4809 | 8,0611 | 53,1442 | 21,9907 | 86,8076 | 35,9204 |

p_hse et p_wse sont ceux de V2 (vidange excentrée de classe 2) : même remplissage en combinaison X.

## Zones en θ

Pour k = 0,4 : canal pour θ ≤ 17,2171° (et θ ≥ 342,7829°), contrainte élevée jusqu'à 2 θ_c = 34,4342°, matériau immobile ailleurs.
