# V8 : V5 en classe 3, remplissage à grand excentrement

Cas reproduit par les tests du lot 11. Valeurs établies par `reference.py`, arrondies à 4 décimales. Applique le point ouvert P8 : e_t/r est l'exposant de tan φ_r (lecture confirmée par l'utilisateur le 2026-11-11).

## Données

Celles de V5 (silo circulaire d = 12 m, t = 0,25 m, hc = 10 m, fond plat, sable, paroi D2), avec la classe imposée à 3 et **e_t = 4 m**.

* hc/dc = 0,833 < 2,0 ; e_t = 4 m > 0,25 d_c = 3 m : **5.3.3 déclenché**.

## Propriétés (5.3.3(4))

K supérieur = **0,4995** ; μ supérieur = 0,48 × 1,16 = **0,5568** ; φ_r = 39° ; γ = 16 kN/m³ ; r = 6 m.

## Grandeurs (5.93 à 5.96)

* p_ho = γ r / (2 μ) = **86,2069 kPa**
* h_o,e = r tan φ_r [1 − (e_t/r)²] / 3 = **0,8998 m**
* B = r / (2 μ K) − h_o,e = **9,8869 m**

## Force verticale additionnelle (5.92), kN/m

| z_s (m) | z = z_s − h_o,e (m) | Z | Δn_zSk |
|-|-|-|-|
| 2 | 1,1002 | 0,202288 | 44,1888 |
| 5 | 4,1002 | 0,505720 | 139,0700 |
| 10 | 9,1002 | 1,011441 | 361,2074 |
| 10,8998 | 10 (= hc) | 1,102446 | 408,2273 |
