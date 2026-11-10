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

// ---------------------------------------------------------------------------
// Parois verticales, cas symetriques (lot 2, SPEC §5.1 a §5.3)
// ---------------------------------------------------------------------------

/** z_o (m) et p_ho (kPa) d'une combinaison, eq. 5.3 et 5.4 (ou 5.73, 5.74). */
export interface ParametresJanssen {
  z_o: number;
  p_ho: number;
}

/** Valeurs a une profondeur z : pressions en kPa, effort vertical n_zSk en kN/m. */
export interface ValeursParoi {
  p_h: number;
  p_w: number;
  p_v: number;
  n_zSk: number;
}

export interface ValeursJanssenModifie extends ValeursParoi {
  /** Fonction de forme Y_R (eq. 5.75), 0 au dessus de h_o. */
  Y_R: number;
  /** Profondeur equivalente z_V (m) de p_vf = gamma z_V (eq. 5.80), z au dessus de h_o. */
  z_V: number;
}

export interface CoefficientsVidange {
  C_h: number;
  C_w: number;
  /** C_S = hc/dc - 1 pour un silo intermediaire, null sinon. */
  C_S: number | null;
  /** Clause appliquee, affichee telle quelle. */
  motif: string;
}

/** Etat de la paroi verticale a une profondeur z, cas symetriques. */
export interface EtatParoi {
  z: number;
  /** p_h en C1, p_w et n_zSk en C2, p_v en C3. */
  remplissage: ValeursParoi;
  /** Vidange symetrique ; null si elle est non applicable. */
  vidange: ValeursParoi | null;
  /** Motif quand la vidange est non applicable, null sinon. */
  motifVidange: string | null;
  combinaisons: { p_h: 'C1'; p_w: 'C2'; n_zSk: 'C2'; p_v: 'C3' };
}

// ---------------------------------------------------------------------------
// Action localisee (lot 3, SPEC §5.4)
// ---------------------------------------------------------------------------

/**
 * Forme de l'action localisee retenue pour un cas.
 * `nulle` : coefficient pris egal a 0 avec son motif.
 * `hors-perimetre` : cas non traite en v1 (P3), avec la clause.
 */
export type FormeLocalisee =
  | 'nulle'
  | 'non-circulaire'
  | 'circulaire-epaisse'
  | 'circulaire-mince'
  | 'majoration-uniforme'
  | 'hors-perimetre';

export interface DefinitionLocalisee {
  forme: FormeLocalisee;
  /** C_pf (remplissage) ou C_pe (vidange) ; 0 si la forme est `nulle` ou `hors-perimetre`. */
  C: number;
  /** Clauses appliquees, en francais accentue, affichees telles quelles. */
  motif: string;
  /** Point ouvert de SPEC §9 applique, sinon null. */
  pointOuvert: 'P3' | 'P7' | null;
  /** Coefficient zeta d'une majoration uniforme sur paroi epaisse (5.40, 5.41), sinon null. */
  zeta: number | null;
  /** Position simplifiee du centre de la zone (m, profondeur z) en classe 2 ; null = toute hauteur. */
  z_p: number | null;
}

export interface ActionLocalisee {
  /** E_f = 2 e_f / d_c (5.10). */
  E_f: number;
  /** E = 2 e / d_c avec e = max(e_f, e_o) (5.29). */
  E: number;
  /** Hauteur de la zone s = pi d_c / 16 (m), eq. 5.12. */
  s: number;
  d_c: number;
  remplissage: DefinitionLocalisee;
  vidange: DefinitionLocalisee;
}

/** Valeurs localisees a une profondeur, pour un cas. Pressions en kPa, effort en kN. */
export interface ValeursLocalisees {
  /** p_pf ou p_pe = C p_h, vers l'exterieur (0 si nulle). */
  p_p: number;
  /** p_pfi ou p_pei = p_p / 7, vers l'interieur, en valeur absolue (paroi epaisse seulement, sinon 0). */
  p_pi: number;
  /** 0,36 p_p pour une paroi non circulaire, sinon 0. */
  p_nc: number;
  /** Effort total F_p = (pi/2) s d_c p_p pour une paroi mince (5.15), sinon null. */
  F_p: number | null;
  /** Pression normale du cas, action localisee ou majoration comprise (enveloppe). */
  p_h_total: number;
  /** Frottement du cas, majoration de paroi mince comprise. */
  p_w_total: number;
}

// ---------------------------------------------------------------------------
// Fond et tremie (lot 4, SPEC §6)
// ---------------------------------------------------------------------------

export type CasFond = 'remplissage' | 'vidange';

export interface CoefficientCb {
  C_b: number;
  motif: string;
}

export interface PressionTransition {
  /** p_vft = C_b p_vf(hc) (kPa), 6.1.2. */
  p_vft: number;
  C_b: number;
  /** Combinaison de proprietes employee pour p_vf(hc). */
  combinaison: IdCombinaison;
}

export interface FondPlat {
  /** `6.2.1` (silo elance) ou `6.2.2` (peu elance ou intermediaire). */
  methode: '6.2.1' | '6.2.2';
  /** Pression verticale de calcul (kPa) : uniforme en 6.2.1, p_vsq au voisinage du centre en 6.2.2. */
  p_v: number;
  /** Termes de 6.13 a 6.15 (kPa) ; null en 6.2.1. */
  p_vb: number | null;
  p_vtp: number | null;
  p_vho: number | null;
  /** Facteur d'interpolation (2 - hc/dc)/(2 - h_tp/dc) de 6.13 ; null en 6.2.1. */
  facteur: number | null;
  C_b: number;
  /** Phrase affichee : clause, et rappel qu'elle vaut au remplissage comme a la vidange. */
  motif: string;
}

export type ProfondeurTremie = 'profonde' | 'peu-profonde';

export interface ParametresTremie {
  cas: CasFond;
  profondeur: ProfondeurTremie;
  /** Combinaison des proprietes de paroi de tremie : T1 au remplissage, T2 a la vidange. */
  combinaison: 'T1' | 'T2';
  /** Hauteur de la pointe virtuelle a la transition (m). */
  h_h: number;
  gamma: number;
  S: number;
  /** mu_h (profonde) ou mu_heff (peu profonde). */
  mu_heff: number;
  /** F_f ou F_e. */
  F: number;
  n: number;
  p_vft: number;
  /** Angle epsilon de Walker (deg), vidange d'une tremie profonde ; null sinon. */
  epsilon: number | null;
  motif: string;
}

/** Pressions a la cote x de la tremie (kPa). */
export interface PressionsTremie {
  x: number;
  p_v: number;
  p_n: number;
  p_t: number;
}
