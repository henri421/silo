# V3 : silo circulaire d'élancement intermédiaire, fond plat

Cas reproduit par les tests des lots 1, 2, 3 et 4. Valeurs établies par `reference.py`, arrondies à 4 ou 6 décimales.

## Données

| Grandeur | Valeur |
|-|-|
| Section | circulaire, d = 10 m (r = 5 m), paroi t = 0,30 m (d_c/t = 33, épaisse) |
| hc | 15 m |
| Fond | plat |
| Matériau | sable (comme V1), paroi D2 |
| Excentrements | nuls |

## Classement

* A = 78,5398 m², U = 31,4159 m, d_c = 10 m, hc/dc = 1,5 : **intermédiaire**.
* Capacité 1 921,5 t, sans excentrement : **classe 2**.
* h_o = (5/3) tan 39° = **1,3496 m** ; h_tp = 5 tan 39° = **4,0489 m**.
* C_S = 0,5 ; C_h = **1,0750** ; C_w = **1,0500**.
* C_pf = 0,21 × 0,4 × (1 − e^(−0,75)) = **0,044321** ; C_pe = **0,088642** (branche hc/dc ≥ 1,2).

## Janssen modifié, C1

z_o = 12,0954 m ; p_ho = 96,6667 kPa ; n = −(1 + tan 39°)(1 − 1,3496/12,0954) = **−1,607844**.

| z (m) | Y_R | p_hf (kPa) | p_he (kPa) |
|-|-|-|-|
| 1,3496 (= h_o) | 0 | 0 | 0 |
| 2 | 0,090153 | 8,7148 | 9,3684 |
| 5 | 0,375128 | 36,2624 | 38,9821 |
| 10 | 0,613077 | 59,2641 | 63,7089 |
| 15 | 0,732407 | 70,7994 | 76,1093 |

## Frottement et effort vertical, C2

| z (m) | p_wf (kPa) | p_we (kPa) | n_zSk vidange (kN/m) |
|-|-|-|-|
| 5 | 18,0638 | 18,9669 | 40,2892 |
| 15 | 31,7311 | 33,3177 | 320,5423 |

## Fond plat (6.2.2), C3

* z_V(hc) = **8,9537 m** ; p_vb = γ z_V = **143,2587 kPa**
* p_vtp = 16 × 4,0489 = 64,7827 kPa ; p_vho = 16 × 1,3496 = 21,5942 kPa
* Facteur (2 − 1,5) / (2 − 4,0489/10) = **0,313458**
* p_vsq = 143,2587 + (64,7827 − 21,5942) × 0,313458 = **156,7965 kPa**
