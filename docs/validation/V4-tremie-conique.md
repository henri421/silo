# V4 : trémie conique profonde sous le silo V2

Cas reproduit par les tests du lot 4. Valeurs établies par `reference.py`, arrondies à 4 ou 6 décimales. La partie vidange applique le choix déclaré P2.

## Données

| Grandeur | Valeur |
|-|-|
| Silo | V2 : circulaire, d = 6 m, hc = 18 m, sable, paroi verticale D2 |
| Trémie | conique, β = 30°, pointe virtuelle, S = 2 |
| Paroi de trémie | D2 : μ_h = μ inf = 0,413793 |
| C_b | 1,0 |

## Classement

* h_h = 3 / tan 30° = **5,1962 m**
* tan β = 0,5774 < (1 − 0,405405) / (2 × 0,413793) = **0,7185** : trémie **profonde**.

## Remplissage (T1 : K inf, μ_h inf)

* p_vft = p_vf(18 m) en C3 = **123,9557 kPa**
* F_f = 1 − 0,2 / (1 + 0,5774 / 0,413793) = **0,916502**
* n = 2 × 0,8 × 0,413793 × cot 30° = **1,146737**

| x (m) | p_v | p_nf | p_tf |
|-|-|-|-|
| 5,1962 | 123,9557 | 113,6056 | 47,0092 |
| 2,5981 | 83,3807 | 76,4186 | 31,6215 |
| 1,2990 | 51,3569 | 47,0687 | 19,4767 |

## Vidange (T2 : K sup, μ_h inf, φ_i sup ; P2 : μ inf sur la paroi verticale)

* p_vft = p_vf(18 m) avec K sup et μ inf = **106,3949 kPa**
* φ_i sup = 39,24° ; φ_wh = atan 0,413793 ; ε = **59,6681°**
* F_e = **1,004833**
* n = 2 × (1,004833 × 0,413793 × cot 30° + 1,004833) − 2 = **1,450016**

| x (m) | p_v | p_ne | p_te |
|-|-|-|-|
| 5,1962 | 106,3949 | 106,9091 | 44,2382 |
| 2,5981 | 63,6951 | 64,0029 | 26,4840 |
| 1,2990 | 35,6899 | 35,8623 | 14,8396 |

(kPa)
