# V1 : silo rectangulaire élancé, sable, vidange centrée

Cas reproduit par les tests des lots 1, 2, 3, 4 et 6. Valeurs établies indépendamment par `reference.py` et recoupées par un classeur Excel. Les nombres sont arrondis à 4 décimales ; tolérance relative des tests 1e−4.

## Données

| Grandeur | Valeur |
|-|-|
| Section | rectangulaire, a = 6 m, b = 4 m |
| hc | 20 m (depuis la surface équivalente) |
| Fond | plat |
| Matériau | sable, tableau E.1 : γ_u = 16 kN/m³, φ_r = 39°, K_m = 0,45, a_K = 1,11, μ_m (D2) = 0,48, a_μ = 1,16, C_op = 0,4 |
| Paroi | D2 (béton brut de décoffrage) |
| Excentrements | e_f = e_o = 0 |

## Classement

* A = 24 m², U = 20 m, A/U = 1,2 m, d_c = 4 m, hc/dc = 5,0 : **élancé**.
* Capacité de la partie verticale : 24 × 20 × 16 / 9,81 = **782,9 t** : **classe 2**.
* K sup = 0,4995 ; K inf = 0,405405 ; μ sup = 0,5568 ; μ inf = 0,413793.

## Janssen

| Combinaison | K | μ | z_o (m) | p_ho (kPa) |
|-|-|-|-|-|
| C1 | 0,4995 | 0,413793 | 5,8058 | 46,4000 |
| C2 | 0,4995 | 0,5568 | 4,3147 | 34,4828 |
| C3 | 0,405405 | 0,413793 | 7,1533 | 46,4000 |

## Action localisée (non circulaire, majoration uniforme)

* C_pf = 0,21 × 0,4 × 1 × (1 − e^(−6)) = **0,083792**
* C_pe = 0,42 × 0,4 × 1 × (1 − e^(−6)) = **0,167584**
* s = π × 4 / 16 = 0,7854 m
* C_h = 1,15 ; C_w = 1,10

## Pressions normales (C1, kPa)

| z (m) | p_hf | p_pf,nc | p_hf + p_pf,nc | p_he | p_pe,nc | p_he + p_pe,nc |
|-|-|-|-|-|-|-|
| 1 | 7,3416 | 0,2215 | 7,5631 | 8,4428 | 0,5094 | 8,9522 |
| 5 | 26,7890 | 0,8081 | 27,5971 | 30,8073 | 1,8586 | 32,6659 |
| 10 | 38,1114 | 1,1496 | 39,2610 | 43,8281 | 2,6442 | 46,4722 |
| 20 | 44,9194 | 1,3550 | 46,2744 | 51,6573 | 3,1165 | 54,7738 |

## Frottement et effort vertical (C2)

| z (m) | p_wf (kPa) | p_we (kPa) | n_zSk remplissage (kN/m) | n_zSk vidange (kN/m) |
|-|-|-|-|-|
| 1 | 3,9719 | 4,3691 | 2,0626 | 2,2689 |
| 5 | 13,1741 | 14,4915 | 39,1583 | 43,0742 |
| 10 | 17,3088 | 19,0396 | 117,3186 | 129,0504 |
| 20 | 19,0137 | 20,9151 | 301,9623 | 332,1585 |

## Fond plat (C3)

* p_vf(hc) = 46,4 / 0,405405 × (1 − e^(−20/7,1533)) = **107,4648 kPa**
* C_b = 1,0 : p_v = **107,4648 kPa**
* C_b = 1,2 (matériau non faiblement cohésif, cas d'un sable humide) : p_v = **128,9578 kPa**

## Bandes de 1 m, cas VID (p_he + p_pe,nc, kPa)

| Bande | z haut | z bas | p haut | p bas |
|-|-|-|-|-|
| 1 | 0 | 1 | 0,0000 | 8,9522 |
| 2 | 1 | 2 | 8,9522 | 16,4879 |
| 3 | 2 | 3 | 16,4879 | 22,8313 |
| 20 | 19 | 20 | 54,4344 | 54,7738 |

Contrôle : somme des trapèzes **812,793 kN/m**, intégrale exacte `C_h (1 + 0,36 C_pe) p_ho (hc − z_o (1 − e^(−hc/z_o)))` = **813,578 kN/m**, écart **−0,097 %**.
