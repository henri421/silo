/**
 * Donnees d'entree du calcul des actions dans un silo (SPEC §2).
 *
 * Unites : longueurs en m, poids volumique en kN/m3, angles en DEGRES a la
 * saisie (convertis en radians dans les modules de calcul), excentrements en m.
 *
 * Ce fichier fixe l'interface publique du noyau : il est ecrit par la seance
 * de conception. L'executant ne le modifie pas sans le signaler.
 */

export type Forme = 'circulaire' | 'rectangulaire';

/** Fond plat (pente < 5 deg) ou forme de tremie (SPEC §2.1, §6.3). */
export type TypeFond = 'plat' | 'conique' | 'pyramidale-carree' | 'pyramidale-rectangulaire' | 'biseau';

/** Categorie de surface de paroi, tableau 4.1. D4 est hors perimetre. */
export type CategorieParoi = 'D1' | 'D2' | 'D3';

/** Classe d'evaluation des actions, tableau 2.1. */
export type Classe = 1 | 2 | 3;

export interface Silo {
  forme: Forme;
  /** Diametre interieur (m), silo circulaire. */
  d?: number;
  /** Grand cote interieur (m), silo rectangulaire, a >= b. */
  a?: number;
  /** Petit cote interieur (m), silo rectangulaire. */
  b?: number;
  /** Epaisseur de paroi (m). Obligatoire pour un silo circulaire (classement mince ou epaisse). */
  t?: number;
  /** Hauteur de paroi verticale, de la surface equivalente a la transition (m). */
  hc: number;
  fond: TypeFond;
  /** Demi-angle d'ouverture de la tremie depuis la verticale (deg), ou pente la plus forte d'une pyramide. */
  beta?: number;
  /** Cote globale de la transition dans le repere du modele EF (m). */
  Z_transition: number;
}

/** Une valeur du tableau E.1 (ou d'essai) et sa provenance. */
export interface ValeurMateriau {
  valeur: number;
  source: string;
}

export interface Materiau {
  /** Identifiant stable, sans accent (`sable`, `defaut`). */
  id: string;
  /** Nom affiche. */
  nom: string;
  /** Poids volumique inferieur (kN/m3), estimation des volumes seulement. */
  gamma_l: number;
  /** Poids volumique superieur (kN/m3), valeur caracteristique des charges. */
  gamma_u: number;
  /** Angle de talus naturel (deg). */
  phi_r: number;
  /** Angle de frottement interne moyen (deg). */
  phi_im: number;
  a_phi: number;
  /** Rapport de pression lateral moyen. */
  K_m: number;
  a_K: number;
  /** Coefficient de frottement de paroi moyen, par categorie de paroi. */
  mu_m: Record<CategorieParoi, number>;
  a_mu: number;
  /** Coefficient de reference de l'action localisee. */
  C_op: number;
  /** Provenance de chaque grandeur ci-dessus, par nom de champ (`mu_m_D2` pour mu_m.D2). */
  sources: Record<string, string>;
}

export interface Parois {
  /** Categorie de la paroi verticale. */
  verticale: CategorieParoi;
  /** Categorie de la paroi de tremie (ignoree avec un fond plat). */
  tremie: CategorieParoi;
  /** Faux pour un materiau cohesif (cas d'un sable humide) : C_b = 1,2 (6.1.2). */
  faiblementCohesif: boolean;
  /** Vrai si le materiau est sujet a engrainement mecanique : C_b = 1,2 (6.1.2). */
  engrainementMecanique: boolean;
}

export type Assemblage = 'soude' | 'boulonne';
export type MethodeLocalisee = 'action-localisee' | 'majoration-uniforme';

export interface Exploitation {
  /** Excentrement maximal du sommet du talus au remplissage (m). */
  e_f: number;
  /** Excentrement du sommet du talus silo plein (m). Egal a e_f s'il est absent. */
  e_t?: number;
  /** Excentrement de l'orifice de vidange (m). */
  e_o: number;
  vidangeParLeHaut: boolean;
  ecoulementEnCheminee: boolean;
  formeMaintenueEnTeteEtEnPied: boolean;
  /** Assemblage d'une paroi mince ; `soude` s'il est absent. */
  assemblage?: Assemblage;
  /** Ne peut que relever la classe calculee (2.5(3)). */
  classeImposee?: Classe;
  /** Silo circulaire de classe 2 ; `action-localisee` s'il est absent. */
  methodeLocalisee?: MethodeLocalisee;
}

export interface Discretisation {
  /** Hauteur des bandes de chargement (m). */
  dz: number;
  /** Nombre minimal de points des profils continus sur hc (au moins 101). */
  pointsProfil: number;
}

export interface DonneesSilo {
  silo: Silo;
  materiau: Materiau;
  parois: Parois;
  exploitation: Exploitation;
  discretisation: Discretisation;
}

// ---------------------------------------------------------------------------
// Resultats du classement (lot 1, SPEC §3 et §4)
// ---------------------------------------------------------------------------

export type Elancement = 'elance' | 'intermediaire' | 'peu-elance';

export interface Geometrie {
  /** Aire de la section interieure (m2). */
  A: number;
  /** Perimetre interieur (m). */
  U: number;
  /** Dimension caracteristique : d, ou b pour un rectangle (m). */
  d_c: number;
  /** Rayon equivalent d_c / 2 (m). */
  r: number;
}

export interface Classement {
  geometrie: Geometrie;
  hc_dc: number;
  elancement: Elancement;
  /** Hauteur de tremie jusqu'a la pointe virtuelle (m) ; null pour un fond plat. */
  h_h: number | null;
  /** Volume de tremie (m3) ; 0 pour un fond plat. */
  volumeTremie: number;
  /** Hauteur totale h_b = hc + h_h (m), pour les limites de 1.1(3). */
  h_b: number;
  /** Capacite (t), gamma_u et tremie comprise (choix P5). */
  capacite: number;
  classeCalculee: Classe;
  /** max(classe calculee, classe imposee). */
  classeDeCalcul: Classe;
  /** Procedures appliquees : 2 pour une classe 1 ou 2 (2.5(3)), 3 sinon. */
  procedures: 2 | 3;
  /** Phrases qui justifient la classe, affichees telles quelles. */
  motifsClasse: string[];
  /** Paroi d'un silo circulaire ; null pour un silo rectangulaire. */
  paroi: 'mince' | 'epaisse' | null;
  /** Profondeur du contact le plus haut sous la surface equivalente (m), 5.77 ou 5.78. */
  h_o: number;
  /** Hauteur totale du talus (m). */
  h_tp: number;
}

export interface ValeursCaracteristiques {
  K_inf: number;
  K_sup: number;
  /** mu de la paroi verticale. */
  mu_inf: number;
  mu_sup: number;
  /** mu de la paroi de tremie. */
  mu_h_inf: number;
  mu_h_sup: number;
  /** phi_i en degres. */
  phi_i_inf: number;
  phi_i_sup: number;
}

export type IdCombinaison = 'C1' | 'C2' | 'C3' | 'T1' | 'T2' | 'X';

export interface Combinaison {
  id: IdCombinaison;
  /** Libelle affiche, celui de SPEC §3.2 (`C1 pression normale max`...). */
  libelle: string;
  /** Poids volumique de calcul gamma_u (kN/m3). */
  gamma: number;
  K: number;
  /** mu de la paroi verticale. */
  mu: number;
  /** mu de la paroi de tremie. */
  mu_h: number;
  /** phi_i en degres. */
  phi_i: number;
}
