# V5 : silo circulaire peu élancé, vidange par un orifice excentré

Cas reproduit par les tests du lot 3. Valeurs établies par `reference.py`, arrondies à 4 ou 6 décimales. La partie « majoration uniforme » applique le choix déclaré P7.

## Données

| Grandeur | Valeur |
|-|-|
| Section | circulaire, d = 12 m (r = 6 m), paroi t = 0,25 m |
| hc | 10 m |
| Fond | plat |
| Matériau | sable (comme V1), paroi D2 |
| Excentrements | e_f = 0 ; e_o = 2,0 m |

## Classement

* hc/dc = **0,833333** : **peu élancé**.
* Capacité 1 844,6 t ; e_o/d_c = 0,1667 ≤ 0,25 : **classe 2**.
* d_c/t = 48 ≤ 200 : **paroi épaisse** ; ζ = max(1,0 ; 0,5 + 0,48) = **1,0**.
* h_o = 6 tan 39° / 3 = **1,619568 m** ; h_tp = **4,858704 m**.

## Action localisée

* Remplissage : **nulle** pour un silo peu élancé (5.3.1.2(3)).
* Vidange : e_o = 2,0 m ≥ 0,1 d_c = 1,2 m, donc l'action n'est pas nulle (5.3.2.2(4)).
* C_h = C_w = 1,0 (5.3.2.1(2)), donc p_he = p_hf.
* E = 2 × 2,0 / 12 = **0,333333**.
* hc/dc < 1,2 : C_pe = max(5.28 ; 5.30 ; 0) avec 5.28 = **−0,058320** et 5.30 = 0,272 × 0,4 × (0,833333 − 1 + 0,333333) = **0,018133**, d'où **C_pe = 0,018133**.

| z (m) | p_hf = p_he (C1) | p_pe = C_pe p_he | p_pei = p_pe / 7 | p_he,u = p_he (1 + ζ C_pe) |
|-|-|-|-|-|
| 5 | 36,2214 | 0,6568 | 0,0938 | 36,8782 |
| 10 | 64,1415 | 1,1631 | 0,1662 | 65,3046 |

(kPa.)

## Choix déclaré P7

En classe 2, la vidange d'un silo circulaire peu élancé ou intermédiaire relève de 5.3.2.3. Celui-ci est lu comme un renvoi à la majoration uniforme de 5.2.3, avec C_pe à la place de C_pf. Elle ne s'applique que si `formeMaintenueEnTeteEtEnPied` est vrai. Sinon, l'action localisée de 5.2.2.2 à 5.2.2.4 est appliquée, ce qui donne les colonnes p_pe et p_pei.
