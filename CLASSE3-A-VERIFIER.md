# Classe 3 : brouillon à vérifier sur la norme

Ce brouillon prépare le lot 11. Il quittera le dépôt une fois intégré à `SPEC.md`. **Rien n'en est codé** tant que l'utilisateur ne l'a pas relu ligne à ligne sur le texte de l'EN 1991-4:2006. Il est écrit de mémoire et reformulé : chaque ligne peut être fausse. Pour chaque point, il faut répondre « exact », « faux, la norme dit… » (reformulé) ou « numéro d'équation : … ».

## A. Vidange à grand excentrement en classe 3 (5.2.4.3)

Méthode du canal d'écoulement en contact avec la paroi, pour un silo circulaire.

1. **Rayons de canal à examiner.** Le rayon du canal vaut r_c = k r, et la norme demande d'examiner plusieurs valeurs de k (de mémoire : 0,25, 0,4 et 0,6). Chaque valeur donne un cas de charge séparé.
2. **Position du canal.** Avec G = r_c / r et η = μ / tan φ_i, l'excentrement du centre du canal vaut e_c = r [η (1 − G) + (1 − η) √(1 − G)].
3. **Géométrie du contact.**
   * demi-angle du contact canal-paroi : cos θ_c = (r² + e_c² − r_c²) / (2 r e_c) ;
   * angle ψ côté matériau : cos ψ = (r² − e_c² − r_c²) / (2 e_c r_c) ;
   * périmètres : U_wc = 2 θ_c r (contact avec la paroi) et U_sc = 2 r_c (π − ψ) (contact avec le matériau immobile), angles en radians ;
   * aire du canal : A_c = (π − ψ) r_c² + θ_c r² − r r_c sin(ψ − θ_c).
4. **Pressions dans le canal.**
   * z_oc = A_c / [K (U_wc μ + U_sc tan φ_i)] ;
   * p_hce(z) = γ K z_oc (1 − e^(−z / z_oc)) et p_wce = μ p_hce.
5. **Zones voisines.**
   * Immobile : p_hse = p_hf et p_wse = p_wf (remplissage).
   * Contrainte élevée, de part et d'autre du canal : p_hae = 2 p_hf − p_hce et p_wae = 2 p_wf − p_wce.
   * Largeur angulaire de la zone de contrainte élevée : **inconnue**. Est-ce θ_c de chaque côté, comme la lecture P4 de la classe 2, ou une autre valeur ?
6. **Propriétés.** μ inférieur et φ_i supérieur (5.2.4.1(4)). K reste à fixer, comme P1 en classe 2. Quel γ : γ_u ?
7. **Questions.**
   * La méthode vaut-elle pour un silo élancé seulement, ou aussi pour un silo intermédiaire ou peu élancé (renvoi de 5.3.4) ?
   * Faut-il la pression dans le canal à toute profondeur, ou seulement jusqu'à une hauteur liée à l'orifice ?

## B. Grand excentrement de remplissage en classe 3 (5.3.3)

Silo peu élancé ou intermédiaire, e_f grand. **Je ne connais pas cette clause assez pour en proposer un brouillon.** Il faut savoir :

* le seuil de déclenchement (e_f > 0,25 d_c ?) ;
* la méthode : pressions d'un canal, répartition dissymétrique du remplissage, ou majoration ;
* les propriétés à employer.

## C. Cas de validation

Une fois A et B confirmés, la séance de conception écrira un cas V7 (V2 en classe 3) calculé à la main par `reference.py`, puis les tests du lot 11.
