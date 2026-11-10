# V2 : silo circulaire élancé en béton, vidange à grand excentrement

Cas reproduit par les tests des lots 1, 3 et 5. Valeurs établies par `reference.py`, arrondies à 4 décimales.

> La partie « vidange excentrée » applique les choix déclarés P1 (K supérieur) et P4 (zone à 2 p_hf sur un arc θ_c de chaque côté). Si l'utilisateur infirme P4, cette partie sera complétée avant le lot 5.

## Données

| Grandeur | Valeur |
|-|-|
| Section | circulaire, d = 6 m |
| Paroi | béton, t = 0,20 m, catégorie D2 |
| hc | 18 m |
| Matériau | sable (comme V1) |
| Excentrements | e_f = 0 ; e_o = 2,0 m |
| Méthode localisée | action localisée (et majoration uniforme pour contrôle) |

## Classement

* A = 28,2743 m², U = 18,8496 m, A/U = 1,5 m, d_c = 6 m, hc/dc = 3,0 : **élancé**.
* d_c/t = 30 ≤ 200 : **paroi épaisse**.
* Trémie conique β = 30° : h_h = 3 / tan 30° = **5,1962 m**, volume π × 3² × h_h / 3 = **48,9726 m³**.
* Talus (cône, éq. 5.77) : h_o = 3 tan 39° / 3 = **0,809784 m** ; h_tp = 3 tan 39° = **2,429352 m**.
* Capacité de la partie verticale : 830,1 t. Avec la trémie de V4 (volume 48,9726 m³, soit 79,8737 t), la capacité totale retenue selon P5 vaut **909,9 t** < 1 000 t. Avec e_o/d_c = 0,3333 > 0,25, le silo reste donc en **classe 2**, puisque le critère d'excentrement du tableau 2.1 ne vaut qu'au dessus de 1 000 t.
* e_o > 0,25 d_c = 1,5 m : **vidange à grand excentrement déclenchée** (5.2.4.1(1)).

## Action localisée

* E_f = 0 ; E = 2 × 2,0 / 6 = 0,6667
* C_pf = **0,079818** ; C_pe = 0,42 × 0,4 × (1 + 2 × 0,6667²) × (1 − e^(−3)) = **0,301534**
* s = π × 6 / 16 = **1,1781 m**
* ζ = max(1,0 ; 0,5 + 0,01 × 30) = **1,0**
* C1 : z_o = 7,2573 m, p_ho = 58,0000 kPa

| z (m) | p_hf | p_pf | p_pfi = p_pf/7 | p_he | p_pe | p_pei = p_pe/7 | p_hf,u | p_he,u |
|-|-|-|-|-|-|-|-|-|
| 9 | 41,2180 | 3,2899 | 0,4700 | 47,4007 | 14,2929 | 2,0418 | 44,5080 | 61,6937 |
| 18 | 53,1442 | 4,2419 | 0,6060 | 61,1159 | 18,4285 | 2,6326 | 57,3861 | 79,5444 |

(kPa ; p_pfi et p_pei agissent vers l'intérieur.)

## Vidange à grand excentrement (5.2.4.2, cas séparé)

θ_c = 35° ; μ inférieur ; K supérieur (P1).

| z (m) | p_hce | p_hse | p_hae | p_wse | p_wae |
|-|-|-|-|-|-|
| 9 | 0 | 41,2180 | 82,4361 | 17,0557 | 34,1115 |
| 18 | 0 | 53,1442 | 106,2885 | 21,9907 | 43,9814 |

Zones (P4) : écoulement pour |θ| ≤ 35°, contrainte élevée pour 35° < |θ| ≤ 70°, matériau immobile ailleurs.

## Carte p(z, θ) (lot 10)

Convention : θ en degrés dans [0 ; 360[, mesuré depuis la direction de l'excentrement ; la zone localisée est centrée sur θ = 0 et, pour une paroi épaisse, sur θ = 180°. La valeur de la zone (p_pf ou p_pe) est prise à la profondeur z_p de son centre et reste constante sur la hauteur s. Un nœud placé sur un bord de zone appartient à la zone.

* s = 1,1781 m, s/2 = **0,589049 m** ; demi-angle d'un carré de côté s : s / d_c = π/16 rad = **11,25°**.

Paroi épaisse (t = 0,20 m), classe 2, z_p = hc/2 = 9 m :

| Cas | θ = 0 | θ = 90° |
|-|-|-|
| REMP, z = 9 m | 44,5080 | 40,7480 |
| VID, z = 9 m | 61,6937 | 45,3589 |

Hors de la bande [z_p − s/2 ; z_p + s/2], la pression est symétrique : REMP à z = 18 m, 53,1442 kPa pour tout θ.

Paroi mince soudée (même silo avec t = 0,02 m, d_c/t = 300), classe 2 : z_p = min(z_o ; hc/2) = **7,2573 m** (5.16), p_hf(z_p) = 36,6630 kPa, p_pf = 2,9264 kPa.

| θ | 0 | 60° | 90° | 180° |
|-|-|-|-|-|
| REMP, z = z_p | 39,5894 | 38,1262 | 36,6630 | 33,7366 |

Vidange excentrée (VID_EXC), z = 9 m : 0 pour θ ≤ 35° ou θ ≥ 325° ; 82,4361 kPa pour 35° < θ ≤ 70° ou 290° ≤ θ < 325° ; 41,2180 kPa ailleurs. p_w vaut 34,1115 kPa dans la zone de contrainte élevée.
