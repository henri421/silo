# V6 : trémie conique peu profonde sous le silo V3

Cas reproduit par les tests du lot 4. Valeurs établies par `reference.py`, arrondies à 4 ou 6 décimales.

## Données

| Grandeur | Valeur |
|-|-|
| Silo | V3 : circulaire, d = 10 m, hc = 15 m, sable, paroi verticale D2 |
| Trémie | conique, β = 60°, pointe virtuelle, S = 2 |
| Paroi de trémie | D2 : μ_h = μ inf = 0,413793 |
| C_b | 1,0 |

## Classement

* h_h = 5 / tan 60° = **2,8868 m**.
* tan β = 1,7321 ≥ (1 − 0,405405) / (2 × 0,413793) = 0,7185 : trémie **peu profonde**.

## Remplissage (6.4.2), K inf

* p_vft = γ z_V(hc) en C3 (silo intermédiaire, V3) = **143,2587 kPa**.
* μ_heff = (1 − 0,405405) / (2 tan 60°) = **0,171645**.
* F_f = 1 − 0,2 / (1 + tan 60° / μ_heff) = **0,981967**.
* n = 2 × 0,8 × μ_heff × cot 60° = **0,158559**.

| x (m) | p_v | p_nf | p_tf |
|-|-|-|-|
| 2,8868 | 143,2587 | 140,6753 | 24,1462 |
| 1,4434 | 150,0809 | 147,3745 | 25,2961 |
| 0,7217 | 145,3268 | 142,7061 | 24,4947 |

(kPa.)

## Vidange (6.4.3)

Identique au remplissage.

## Cas limite n = 1 de l'éq. 6.7

Avec h_h = 4 m, γ = 10 kN/m³, p_vft = 50 kPa et x = 2 m : p_v = **38,8629 kPa** pour n = 1 (forme limite en logarithme), et **29,3934 kPa** pour n = 1,5.
