# Spécification : actions dans les silos selon l'EN 1991-4:2006

## 0. Objet

L'outil calcule les valeurs **caractéristiques** des actions exercées par un matériau particulaire ensilé :
* sur les parois verticales d'un silo circulaire ou rectangulaire (carré compris) ;
* sur son fond plat ou sa trémie.

Pour chaque cas de charge, il rend des profils en fonction de la profondeur, des graphiques et des fichiers CSV. Ces fichiers sont conçus pour charger un modèle aux éléments finis : pression par bandes de hauteur réglable, cotes dans le repère du modèle.

Les coefficients partiels et les combinaisons d'actions relèvent de l'EN 1990. Ils sont hors de ce dépôt. Le dimensionnement de la structure (béton armé, acier) est hors périmètre.

Chaque formule ci-dessous porte son numéro d'équation ou de clause dans l'EN 1991-4:2006. Les clauses sont reformulées, jamais recopiées.

## 1. Unités, repères et signes

**Unités du noyau.** Longueurs en m, poids volumique en kN/m³, pressions en kPa (kN/m²), efforts linéiques en kN/m, angles saisis en degrés et convertis en radians dans le noyau. Les unités sont déclarées en tête de chaque module. Conformément à `CONVENTIONS.md`, l'écart par rapport au millimètre est déclaré une fois dans le README, comme le fait `charges-climatiques`.

**Repères.**

| Symbole | Origine et sens | Usage |
|-|-|-|
| `z` | Surface équivalente (figure 1.1a), positif vers le bas | Parois verticales |
| `x` | Pointe (réelle ou virtuelle) de la trémie, positif vers le haut | Trémie, éq. 6.7 |
| `Z` | Cote globale du modèle aux éléments finis, positive vers le haut. `Z = Z_transition + hc − z` | Exports |
| `θ` | Angle en plan, depuis l'axe de l'excentrement | Silos circulaires |

**Signes.** Une pression normale est positive quand elle pousse la paroi vers l'extérieur du silo. Un frottement de paroi est positif vers le bas sur les parois verticales et vers la pointe dans la trémie. L'action localisée vers l'intérieur `p_pfi` et `p_pei` est donc **négative** dans les exports, avec une colonne qui le rappelle.

## 2. Données d'entrée

### 2.1 Géométrie

* Forme : `circulaire` (diamètre intérieur `d`) ou `rectangulaire` (côtés intérieurs `a ≥ b` ; un carré est un rectangle avec `a = b`).
* `t` : épaisseur de paroi, utilisée seulement pour le classement paroi mince ou épaisse d'un silo circulaire.
* `hc` : hauteur de paroi verticale, de la surface équivalente à la transition (figure 1.1a). L'interface affiche `h_o` et la hauteur du talus `h_tp` pour aider à positionner la surface équivalente (§4.5).
* Fond : `plat` (pente α < 5°), ou trémie `conique`, `pyramidale carrée`, `pyramidale rectangulaire` ou `en biseau`. Pour une trémie, on saisit `β` (demi-angle d'ouverture, ou pente la plus forte pour une pyramide, §6.1.2(7)) ; `h_h` se déduit de la géométrie jusqu'à la pointe virtuelle.
* `Z_transition` : cote globale de la transition, pour les exports.

### 2.2 Matériau et parois

* Matériau : choix dans la bibliothèque (§3.3) ou saisie libre de `γ_u`, `φ_r`, `φ_im`, `a_φ`, `K_m`, `a_K`, `μ_m` (par catégorie de paroi), `a_μ`, `C_op`.
* Catégorie de paroi verticale `D1`, `D2` ou `D3`, et catégorie de paroi de trémie séparée (tableau 4.1 ; D4 hors périmètre).
* `faiblementCohesif` : booléen. S'il est faux, `C_b = 1,2` (6.1.2(5) et (6)). L'interface rappelle que c'est le cas d'un sable humide.
* `engrainementMecanique` : booléen, même effet sur `C_b`.

### 2.3 Exploitation

* `e_f` : excentrement maximal du sommet du talus au remplissage. `e_t` : excentrement du sommet du talus silo plein, égal à `e_f` par défaut. `e_o` : excentrement de l'orifice de vidange (figure 1.1b).
* `vidangeParLeHaut` : si vrai, `C_h = C_w = 1,0` (éq. 5.20 et 5.84).
* `ecoulementEnCheminee` : si l'utilisateur garantit un écoulement en cheminée interne (5.1(8)), les cas de vidange sont déclarés non applicables avec ce motif, et les cas de remplissage avec action localisée sont conservés.
* `formeMaintenueEnTeteEtEnPied` : condition de 5.2.3(3) pour substituer une majoration uniforme à l'action localisée d'un silo circulaire.
* `assemblage` pour une paroi mince : `soude` ou `boulonne` (5.2.1.4(3) et (4)).
* `classeImposee` : facultative. Elle ne peut que relever la classe calculée (2.5(3)), jamais l'abaisser.
* `methodeLocalisee` pour un silo circulaire de classe 2 : `action localisee` ou `majoration uniforme`.

### 2.4 Discrétisation

* `Δz` : hauteur des bandes de chargement, 1 m par défaut.
* Nombre de points des profils continus : au moins 101 sur `hc`, plus les points singuliers (`h_o`, `z_o`, sommets de bandes).

## 3. Matériau

### 3.1 Valeurs caractéristiques (4.2.3, éq. 4.1 à 4.6)

Le tableau E.1 donne `γ_u` comme valeur caractéristique supérieure, et `K_m`, `μ_m`, `φ_im` comme **moyennes**. On en déduit :

| Grandeur | Inférieure | Supérieure |
|-|-|-|
| K | K_m / a_K | K_m · a_K |
| μ | μ_m / a_μ | μ_m · a_μ |
| φ_i | φ_im / a_φ | φ_im · a_φ |

`γ_l` du tableau ne sert qu'à estimer un volume (note b du tableau E.1). Le noyau ne l'utilise pas pour les charges.

### 3.2 Combinaisons de propriétés (tableau 3.1)

Chaque grandeur extrême s'obtient avec sa propre combinaison. Le noyau calcule chaque cas avec la combinaison du tableau et l'**affiche à côté du résultat**.

| Combinaison | μ (paroi verticale) | K | φ_i | Sert à |
|-|-|-|-|-|
| `C1 pression normale max` | inférieure | supérieure | inférieure | `p_h` des parois verticales, action localisée |
| `C2 frottement max` | supérieure | supérieure | inférieure | `p_w` et `n_zSk` |
| `C3 charge verticale max` | inférieure | inférieure | supérieure | `p_v` au fond, `p_vft` de la trémie au remplissage |
| `T1 trémie remplissage` | μ_h inférieure | inférieure | inférieure | Trémie au remplissage |
| `T2 trémie vidange` | μ_h inférieure | supérieure | supérieure | Trémie à la vidange (voir le point ouvert P2) |
| `X vidange excentrée` | inférieure | voir P1 | supérieure | 5.2.4.1(4) |

### 3.3 Bibliothèque livrée

Seules deux entrées sont livrées. Elles sont lues sur le tableau E.1 (EN 1991-4:2006, annexe E) :

| Matériau | γ_l | γ_u | φ_r | φ_im | a_φ | K_m | a_K | μ_m D1 | μ_m D2 | μ_m D3 | a_μ | C_op |
|-|-|-|-|-|-|-|-|-|-|-|-|-|
| Matériau par défaut | 6,0 | 22,0 | 40 | 35 | 1,3 | 0,50 | 1,5 | 0,32 | 0,39 | 0,50 | 1,40 | 1,0 |
| Sable | 14,0 | 16,0 | 39 | 36 | 1,09 | 0,45 | 1,11 | 0,38 | 0,48 | 0,57 | 1,16 | 0,4 |

La bibliothèque est un fichier JSON, `src/materiaux/bibliotheque.json`. Chaque valeur porte sa source (`EN 1991-4:2006, tableau E.1`). Une valeur sans source bloque le calcul, sur le modèle de `profilDepuisJson` dans `charges-climatiques`. Un `LISEZMOI.md` dans le même dossier explique comment l'utilisateur ajoute un matériau depuis son exemplaire de la norme.

## 4. Classement

### 4.1 Grandeurs géométriques

| | Circulaire | Rectangulaire |
|-|-|-|
| A | π d² / 4 | a · b |
| U | π d | 2 (a + b) |
| d_c | d | b (plus grand cercle inscrit, 1.5) |

### 4.2 Élancement (5.1(2))

* `hc/dc ≥ 2,0` : élancé ;
* `1,0 < hc/dc < 2,0` : intermédiaire ;
* `0,4 < hc/dc ≤ 1,0` : peu élancé ;
* `hc/dc ≤ 0,4` avec fond plat : magasin de stockage, **hors périmètre** (5.4), erreur explicite ;
* `hc/dc ≤ 0,4` avec trémie : point ouvert P6, erreur explicite ;
* fond ventilé : hors périmètre (5.1(3), 5.5).

Les limites de 1.1(3) sont contrôlées : `h_b/d_c < 10`, `h_b < 100 m`, `d_c < 60 m`. En dehors, le noyau lève une erreur.

### 4.3 Classe d'évaluation d'actions (tableau 2.1)

La capacité vaut `γ_u · V / g`, en tonnes, où V est le volume ensilé (partie verticale jusqu'à la surface équivalente, plus la trémie), avec g = 9,81 m/s². Le choix de γ_u (et non γ_l) est déclaré dans le README.

* AAC 3 : capacité > 10 000 t ; ou capacité > 1 000 t avec `e_o/d_c > 0,25` ; ou capacité > 1 000 t, silo peu élancé et `e_t/d_c > 0,25`.
* AAC 1 : capacité < 100 t.
* AAC 2 : tous les autres cas.

La **classe de calcul** vaut `max(classe calculée, classe imposée)`. En v1, une classe 1 est calculée selon les procédures de la classe 2, ce que permet 2.5(3), et l'interface l'affiche avec ce motif. La voie simplifiée propre à la classe 1, avec valeurs moyennes et éq. 5.23, 5.24, 5.88, 5.89 et 6.4, est un lot ultérieur.

### 4.4 Paroi d'un silo circulaire

Paroi mince si `d_c/t > 200`, épaisse sinon (5.2.1.4(1) et 1.5).

### 4.5 Surface équivalente et talus

* `h_o`, profondeur du point de contact le plus haut sous la surface équivalente : `r tanφ_r / 3` pour un silo circulaire (éq. 5.77) ; `d_c tanφ_r / 4` pour un silo rectangulaire (éq. 5.78).
* `h_tp`, hauteur totale du talus : `r tanφ_r` (cône) et `d_c tanφ_r / 2` (prisme), soit 3 h_o et 2 h_o.

## 5. Parois verticales

### 5.1 Remplissage, silo élancé (5.2.1.1, éq. 5.1 à 5.7)

```
z_o  = A / (K μ U)
p_ho = γ K z_o
Y_J(z) = 1 − exp(−z / z_o)
p_hf = p_ho Y_J        p_wf = μ p_hf        p_vf = (p_ho / K) Y_J
n_zSk = μ p_ho (z − z_o Y_J)
```

### 5.2 Remplissage, silo peu élancé ou intermédiaire (5.3.1.1, éq. 5.71 à 5.81)

```
n = −(1 + tanφ_r)(1 − h_o / z_o)
Y_R(z) = 1 − ((z − h_o)/(z_o − h_o) + 1)^n          pour z > h_o, 0 au dessus
p_hf = p_ho Y_R        p_wf = μ p_hf
z_V = h_o − (z_o − h_o − (z + z_o − 2 h_o)^(n+1) / (z_o − h_o)^n) / (n + 1)
p_vf = γ z_V           n_zSk = μ p_ho (z − z_V)
```

`z_o` et `p_ho` sont ceux du §5.1. Au dessus de `h_o`, il n'y a pas de contact et les pressions de paroi sont nulles.

### 5.3 Vidange symétrique (5.2.2.1 et 5.3.2.1)

`p_he = C_h p_hf`, `p_we = C_w p_wf`, `n_zSk,e = C_w n_zSk`.

| Situation | C_h | C_w | Source |
|-|-|-|-|
| Vidange par le haut, toute classe | 1,0 | 1,0 | 5.20, 5.84 |
| Élancé, classe 2 ou 3 | 1,15 | 1,10 | 5.21, 5.22 |
| Intermédiaire, classe 2 ou 3 | 1 + 0,15 C_S | 1 + 0,10 C_S | 5.85 à 5.87, avec C_S = hc/dc − 1 |
| Peu élancé | 1,0 | 1,0 | 5.3.2.1(2) |

### 5.4 Action localisée

**Coefficients.** `E_f = 2 e_f / d_c` et `E = 2 e / d_c`, avec `e = max(e_f, e_o)`.

```
C_pf = 0,21 C_op (1 + 2 E_f²)(1 − exp(−1,5 (hc/dc − 1))), ramené à 0 s'il est négatif      (5.9 à 5.11)
C_pe = 0,42 C_op (1 + 2 E²)(1 − exp(−1,5 (hc/dc − 1)))          si hc/dc ≥ 1,2         (5.28)
C_pe = max(5.28 ; 0,272 C_op (hc/dc − 1 + E) ; 0)                 si hc/dc < 1,2         (5.29, 5.30)
p_pf = C_pf p_hf        p_pe = C_pe p_he        s = π d_c / 16                          (5.8, 5.27, 5.12)
```

**Quand elle s'applique.** On note « nulle » un coefficient pris égal à 0 avec son motif.

| Élancement | Remplissage | Vidange |
|-|-|-|
| Élancé | C_pf selon 5.9 | C_pe selon 5.28 |
| Intermédiaire | C_pf selon 5.9 (5.3.1.2(5)) | classe 2 : majoration uniforme 5.3.2.3 ; classe 3 : 5.2.2.2 à 5.2.2.5 |
| Peu élancé | nulle (5.3.1.2(3)) | nulle si e_o < 0,1 d_c (5.3.2.2(4)) ; sinon classe 2 : 5.3.2.3, classe 3 : 5.2.2.2 à 5.2.2.5 |

**Forme selon la paroi.**

* *Non circulaire* (5.2.1.5 et 5.2.2.5) : majoration uniforme `p_pf,nc = 0,36 p_pf` et `p_pe,nc = 0,36 p_pe`, sur toute la hauteur. C'est la seule forme en v1. Les tirants internes (5.7.2) et la redistribution des parois souples (5.7.1(2)) sont hors périmètre.
* *Circulaire, paroi épaisse* (5.2.1.3 et 5.2.2.3) : vers l'extérieur, `p_pf` sur deux carrés opposés de côté s ; vers l'intérieur, `p_pfi = p_pf / 7` sur le reste de la circonférence dans la même bande. Le noyau rend le profil `p_pf(z)` à toute hauteur, la position simplifiée `z_p = hc / 2` en classe 2 (5.2.1.3(4)), et la géométrie des zones en plan pour le dessin. Même chose à la vidange avec `p_pe` et `p_pei = p_pe / 7`.
* *Circulaire, paroi mince* (5.2.1.4 et 5.2.2.4) : `p_pfs(θ) = p_pf cosθ` sur la hauteur s, et effort total `F_pf = (π/2) s d_c p_pf` (éq. 5.15). Position : `z_p = min(z_o ; 0,5 hc)` pour une paroi soudée de classe 2 (5.16), n'importe quelle hauteur sinon. Le cas boulonné de classe 2 est le point ouvert P3.
* *Majoration uniforme d'un silo circulaire* (5.2.3), classe 2 seulement et seulement si `formeMaintenueEnTeteEtEnPied` est vrai :
  * paroi épaisse : `p_hf,u = p_hf (1 + ζ C_pf)` et `p_he,u = p_he (1 + ζ C_pe)`, avec `ζ = max(1,0 ; 0,5 + 0,01 d_c/t)` (5.38 à 5.41) ;
  * paroi mince : `p_hf,u = p_hf (1 + 0,5 C_pf)`, `p_wf,u = p_wf (1 + C_pf)`, `p_he,u = p_he (1 + 0,5 C_pe)`, `p_we,u = p_we (1 + C_pe)` (5.42 à 5.45).

  Si la condition n'est pas remplie, l'option est grisée avec le motif.

### 5.5 Vidange à grand excentrement, silo circulaire (5.2.4 et 5.3.4)

**Déclenchement.** Classe 2 ou 3, et l'une des deux conditions :
* `e_o > 0,25 d_c` ;
* `e_f > 0,25 d_c` avec `hc/dc > 4,0` (silo élancé seulement).

C'est un **cas de charge séparé**, jamais cumulé avec le symétrique et le localisé (5.1(7)).

**Classe 2, méthode simplifiée de 5.2.4.2.** `θ_c = 35°`. La zone d'écoulement couvre l'arc `|θ| ≤ θ_c`, côté orifice. Les pressions sont :

| Zone | p_h | p_w |
|-|-|-|
| Écoulement, `\|θ\| ≤ θ_c` | 0 | 0 |
| Contrainte locale élevée, `θ_c < \|θ\| ≤ 2 θ_c` (figure 5.5c, à confirmer : voir P4) | 2 p_hf | 2 p_wf |
| Matériau immobile, ailleurs | p_hf | p_wf |

Propriétés : μ inférieur et φ_i supérieur (5.2.4.1(4)) ; pour K, voir P1.

**Classe 3, méthode de 5.2.4.3.** Hors périmètre en v1. Le noyau lève une erreur nommant 5.2.4.3 et rend quand même les cas symétriques, clairement séparés.

Le grand excentrement de remplissage d'un silo peu élancé ou intermédiaire de classe 3 (5.3.3) est hors périmètre en v1, avec une erreur explicite.

### 5.6 Résultat par niveau

Pour chaque z : `p_h`, `p_w`, `p_v`, `n_zSk`, les majorations ou les valeurs localisées, et la combinaison de propriétés employée.

### 5.7 Carte p(z, θ) d'un silo circulaire

Pour charger un modèle en coque, chaque cas de paroi d'un silo circulaire se rend aussi en grille de nœuds (z, θ), avec p_h et p_w.

* **Repère.** θ en degrés dans [0 ; 360[, mesuré depuis la direction de l'excentrement (orifice ou point de remplissage). La zone localisée est centrée sur θ = 0. La norme permet de la placer à toute position sur la circonférence : le modèle EF la fait tourner s'il le faut.
* **Grille.** En z : les multiples de Δz, 0, hc, la profondeur z_p du centre de la zone et les bords de sa bande. En θ : les multiples du pas angulaire (diviseur de 360, 10° par défaut) et les bords des zones. Un nœud sur un bord de zone appartient à la zone.
* **REMP et VID.** Hors de la bande [z_p − s/2 ; z_p + s/2], la pression symétrique. Dans la bande, avec p_p (p_pf ou p_pe) pris à la profondeur z_p et constant sur s :
  * paroi épaisse : p_h + p_p sur deux carrés opposés centrés sur 0 et 180°, de demi-angle s / d_c (en radians) ; p_h − p_p/7 sur le reste de la bande ;
  * paroi mince : p_h + p_p cos θ ;
  * majoration uniforme : p_h,u et p_w,u, sans variation en θ, sur toute la hauteur ;
  * action nulle : la pression symétrique ;
  * hors périmètre (P3) : la carte est hors périmètre avec le même motif.
* **Position z_p.** Celle de la norme quand elle est fixée (5.2.1.3(4), 5.16). En classe 3, la norme laisse la zone à toute hauteur : la carte la place à la profondeur choisie par l'utilisateur, hc/2 par défaut, et le dit dans son motif. Les autres positions restent à vérifier.
* **VID_EXC.** Les zones et les valeurs de §5.5 à chaque nœud, avec p_w.
* **Non applicable.** Silo rectangulaire (la majoration ne varie pas en θ : profils.csv suffit) et tout cas non calculé, avec son motif.

## 6. Fond et trémie

### 6.1 Contrainte à la transition (6.1.2(2) à (6))

`p_vft = C_b p_vf(z = hc)`, calculé avec la combinaison C3 pour le remplissage. `C_b = 1,0` en classe 2 et 3, ou `1,2` si le matériau n'est pas faiblement cohésif ou s'il est sujet à engrainement mécanique (6.3 et 6.5). Les valeurs de classe 1 (1,3 et 1,6) appartiennent au lot de la classe 1.

### 6.2 Fond plat

* Silo élancé : `p_v = p_vft`, uniforme, identique à la vidange (6.2.1).
* Silo peu élancé ou intermédiaire (6.2.2) :

  ```
  p_vsq = p_vb + Δp_sq (2,0 − hc/dc) / (2,0 − h_tp/dc)                (6.13)
  Δp_sq = p_vtp − p_vho        p_vtp = γ h_tp        p_vho = γ z_V(h_o) = γ h_o      (6.14, 6.15, 5.79)
  ```

  `p_vb` est `p_vft` (C3). L'outil précise que `p_vsq` vaut au voisinage du centre du fond (6.2.2(4)), et qu'il est identique au remplissage et à la vidange (6.2.2(3)).

### 6.3 Trémie

**Classement (éq. 6.1).** La trémie est profonde si `tanβ < (1 − K_inf) / (2 μ_h,inf)`, peu profonde sinon, et c'est un fond plat si α < 5°.

**Coefficient de forme (6.9 à 6.11).** S = 2 pour une trémie conique ou pyramidale carrée, S = 1 en biseau, S = 1 + b/a pour une trémie pyramidale rectangulaire.

**Contrainte verticale moyenne (6.7, 6.8).**

```
p_v(x) = γ h_h / (n − 1) · ((x/h_h) − (x/h_h)^n) + p_vft (x/h_h)^n
n = S (F μ_heff cotβ + F) − 2         (forme générale 6.8)
```

Si `|n − 1| < 1e−9`, on utilise la limite `γ h_h · (−(x/h_h) ln(x/h_h))` pour le premier terme. Cette précaution est déclarée et testée.

| | μ_heff | F | n | p_n | p_t |
|-|-|-|-|-|-|
| Profonde, remplissage (6.3.2) | μ_h (6.16) | `F_f = 1 − b / (1 + tanβ/μ_h)`, b = 0,2 (6.17) | `S (1 − b) μ_h cotβ` (6.18) | `F_f p_v` | `μ_h F_f p_v` |
| Profonde, vidange (6.3.3) | μ_h | `F_e` de Walker (6.21 à 6.23), ci-dessous | forme 6.8 avec F = F_e | `F_e p_v` | `μ_h F_e p_v` |
| Peu profonde, remplissage (6.4.2) | `(1 − K) / (2 tanβ)` (6.26) | `1 − b / (1 + tanβ/μ_heff)` (6.27) | `S (1 − b) μ_heff cotβ` (6.28) | `F_f p_v` | `μ_heff F_f p_v` |
| Peu profonde, vidange (6.4.3) | identique au remplissage | | | | |

Coefficient de Walker :

```
φ_wh = atan(μ_h)
ε = φ_wh + asin(sin φ_wh / sin φ_i)
F_e = (1 + sin φ_i cos ε) / (1 − sin φ_i cos(2β + ε))
```

Si `φ_wh > φ_i`, le noyau lève une erreur (note 1 sous 6.23).

La méthode alternative de l'annexe G et l'expression d'Enstad (G.10) sont hors périmètre en v1.

## 7. Cas de charge produits

Chaque cas porte un identifiant stable, un libellé, la combinaison de propriétés, un statut (`calcule`, `non applicable` avec motif, ou `hors perimetre` avec la clause) et ses profils.

| Identifiant | Contenu |
|-|-|
| `REMP` | Remplissage symétrique et action localisée (ou majoration uniforme) |
| `VID` | Vidange symétrique et action localisée (ou majoration uniforme) |
| `VID_EXC` | Vidange à grand excentrement (circulaire), cas séparé |
| `FOND_REMP`, `FOND_VID` | Fond plat ou trémie, remplissage et vidange |

Les cas `REMP` et `VID` sont **exclusifs** l'un de l'autre, et `VID_EXC` l'est des deux. Les exports le rappellent en tête, parce que c'est exactement ce que l'utilisateur doit reproduire dans son logiciel (groupe de charges exclusives).

Le frottement de paroi est rendu avec la combinaison C2, à côté de la pression normale calculée en C1. Associer les deux dans le même cas de charge est un choix enveloppe, déclaré dans le README et la note.

## 8. Sorties

### 8.1 Écran

* **Synthèse.** Classement (élancement, classe de calcul avec motif, paroi mince ou épaisse, trémie profonde ou non), valeurs caractéristiques des propriétés, z_o, p_ho, C_h, C_w, C_pf, C_pe, s, C_b, et liste des cas avec leur statut.
* **Élévation du silo en SVG.** Silo à l'échelle, surface équivalente, talus, h_o, et diagrammes de p_h à gauche et p_w à droite pour le cas choisi. Les bandes Δz sont tracées sur demande.
* **Profils.** Graphiques p_h(z), p_w(z), p_v(z) et n_zSk(z), avec z vers le bas. On peut superposer REMP et VID, et le cas symétrique seul ou avec l'action localisée.
* **Vue en plan.** Pour un silo circulaire : zones de l'action localisée (deux carrés, ou distribution en cosθ) et zones de la vidange excentrée. Pour un silo rectangulaire : la majoration uniforme.
* **Trémie.** p_n et p_t le long de la paroi inclinée, en fonction de x.
* **Tableaux** repliables avec toutes les valeurs.

Les graphiques suivent `DESIGN.md` : les nombres en monoespace, aucune couleur codée en dur, les jetons lus via `aedificium-ui`, les deux cas distingués par le trait (plein pour REMP, tirets pour VID) et pas seulement par la couleur. Chaque graphique s'exporte en SVG autonome (`svgAutonome`) et en PNG.

### 8.2 CSV

Les fichiers passent par `csv()` d'`aedificium-ui` : point-virgule et virgule décimale en français (virgule et point en anglais), BOM, fins de ligne CRLF. **Aucune ligne n'est omise** : un cas non applicable sort avec son motif. Chaque fichier commence par un bloc d'en-tête : outil et version, date, norme, données d'entrée, combinaisons, et la mention « valeurs caractéristiques, coefficients partiels non appliqués ».

1. `profils.csv` : une ligne par (cas, z). Colonnes : `cas ; z [m] ; Z [m] ; p_h sym [kPa] ; p_h localisee ou majoree [kPa] ; p_h total [kPa] ; p_w [kPa] ; p_v [kPa] ; n_zSk [kN/m] ; combinaison`.
2. `bandes.csv` : une ligne par (cas, bande), pour la saisie dans le modèle. Colonnes : `cas ; bande ; z haut ; z bas ; Z haut ; Z bas ; p_h haut ; p_h bas ; p_h constant (valeur du bas) ; p_w haut ; p_w bas ; p_w constant`. En pied de fichier : force horizontale totale par mètre de périmètre, somme des trapèzes, intégrale exacte et écart relatif.
3. `tremie.csv` : une ligne par (cas, x). Colonnes : `cas ; x [m] ; Z [m] ; p_v ; p_n ; p_t`.
4. `localisee.csv` (circulaire) : position, dimensions et valeurs des zones de l'action localisée, et zones de la vidange excentrée en angle θ.
5. `synthese.csv` : les blocs de la synthèse, par `resultatsEnCsv`.
6. `carte.csv` (silo circulaire) : une ligne par (cas, z, θ). Colonnes : `cas ; z [m] ; Z [m] ; θ [°] ; p_h [kPa] ; p_w [kPa]`. Le bloc d'en-tête rappelle le repère des angles, z_p, s et le demi-angle des carrés (§5.7).

### 8.3 Autres sorties

* **JSON structuré** : tous les cas, profils et métadonnées. Le format est versionné, pour un futur module de combinaisons EN 1990 et un éventuel import dans un logiciel EF.
* **Note de calcul HTML imprimable** par `noteDeCalculHtml` : hypothèses, classement, formules avec leurs clauses, valeurs, graphiques, points ouverts appliqués et réserves.
* **Projet** : enregistrement et chargement par `projets` d'`aedificium-ui`, comme dans les autres outils.

## 9. Points ouverts : lectures de la norme à trancher

Chacun est codé selon le choix déclaré ici, affiché dans l'interface et la note, et testé.

| N° | Question | Choix déclaré en v1 |
|-|-|-|
| P1 | La clause 5.2.4.1(4) fixe μ inférieur et φ_i supérieur pour la vidange excentrée, mais pas K. | K supérieur (cohérent avec C1 pour p_h). Le cas V2 l'utilise. |
| P2 | Pour `p_vft` de la trémie à la vidange, le tableau 3.1 donne K supérieur et μ_h inférieur. Il ne précise pas μ pour la paroi verticale. | μ inférieur pour la paroi verticale. Le cas V4 l'utilise. |
| P3 | Paroi mince boulonnée de classe 2 : 5.2.1.4(4) demande une majoration « dans une proportion uniforme » sans en donner la valeur. | Non traité : statut hors périmètre, avec la clause. |
| P4 | Étendue de la zone à `2 p_hf` en vidange excentrée : lue comme un arc θ_c de chaque côté de la zone d'écoulement (figure 5.5c). | À confirmer par l'utilisateur sur la figure avant le lot 5. Si la lecture est infirmée, le cas de validation V2 sera complété. |
| P5 | Capacité pour le tableau 2.1 : γ_u ou γ_l, volume de trémie compris ou non. | γ_u, trémie comprise (la classe la plus haute). |
| P6 | Silo à trémie avec `hc/dc ≤ 0,4` : 5.1(2) ne le range pas clairement parmi les silos peu élancés. | Non traité : erreur explicite qui cite P6 et 5.1(2), à confirmer par l'utilisateur. |
| P7 | Vidange d'un silo circulaire intermédiaire ou peu élancé de classe 2 : 5.3.2.3 renvoie à une majoration uniforme sans que la spécification en donne la forme. | Lue comme la majoration uniforme de 5.2.3 avec C_pe, seulement si `formeMaintenueEnTeteEtEnPied` est vrai ; sinon l'action localisée de 5.2.2.2 à 5.2.2.4. Le cas V5 l'utilise. À confirmer par l'utilisateur. |

## 10. Hors périmètre en v1

Chacun lève une erreur explicite qui nomme la clause :
* magasins de stockage (5.4) ;
* silos à air insufflé, fluidisation (5.5, 6.5) ;
* effets thermiques (5.6) ;
* silos rectangulaires à tirants (5.7.2) et redistribution des parois souples (5.7.1(2)) ;
* paroi ondulée D4 (D.2) ;
* vidange excentrée de classe 3 (5.2.4.3) et grand excentrement de remplissage de classe 3 (5.3.3) ;
* voie simplifiée de la classe 1 (lot ultérieur) ;
* méthode alternative des trémies (annexe G) et expression d'Enstad ;
* explosions de poussières (annexe H) ;
* sections autres que circulaires ou rectangulaires (hexagonales, polygonales) ;
* dimensionnement de la structure.

## 11. Messages d'erreur

Chaque erreur nomme la grandeur, son unité et la clause. Exemples :
* `Le diametre interieur d doit etre un nombre strictement positif (m).`
* `hc/dc = 0,35 avec fond plat : magasin de stockage, hors perimetre (EN 1991-4, 5.4).`
* `phi_wh = 41,2 deg depasse phi_i = 39,2 deg : contact paroi impossible (EN 1991-4, note 1 sous 6.23).`
* `Vidange excentree en classe 3 : methode de 5.2.4.3 non traitee. Les cas symetriques restent rendus.`
