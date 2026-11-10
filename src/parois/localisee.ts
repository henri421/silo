/**
 * Action localisee sur les parois verticales (SPEC §5.4,
 * EN 1991-4:2006, 5.2.1.2 a 5.2.3 et 5.3.1.2 a 5.3.2.3).
 *
 * Le module rend, pour le remplissage et pour la vidange :
 * - les coefficients C_pf (eq. 5.9 a 5.11) et C_pe (eq. 5.28 a 5.30) ;
 * - la forme retenue et son motif : non circulaire, circulaire epaisse ou
 *   mince, majoration uniforme, action nulle ou hors perimetre ;
 * - les valeurs a une profondeur, pour la meme combinaison que le cas
 *   symetrique correspondant (p_h en C1).
 *
 * Unites : longueurs en m, pressions en kPa (kN/m2), effort total F_p en kN.
 * Les excentrements sont en m et les angles de materiau en degres.
 *
 * L'outil CONSTATE : ces valeurs sont caracteristiques, les coefficients
 * partiels de l'EN 1990 restent a appliquer.
 */

import type {
  ActionLocalisee,
  Classement,
  DefinitionLocalisee,
  DonneesSilo,
  ValeursLocalisees,
  ValeursParoi,
} from '../model/types';
import type { ProfilSilos } from '../norms/profil';

/**
 * Coefficient C_pf de l'action localisee au remplissage (eq. 5.9 a 5.11) :
 * C_pf = 0,21 C_op (1 + 2 E_f^2) (1 - exp(-1,5 (hc/dc - 1))),
 * avec E_f = 2 e_f / d_c. Ramene a 0 s'il est negatif.
 */
export function coefficientCpf(d: DonneesSilo, cl: Classement): number {
  const E_f = (2 * d.exploitation.e_f) / cl.geometrie.d_c;
  const c =
    0.21 *
    d.materiau.C_op *
    (1 + 2 * E_f * E_f) *
    (1 - Math.exp(-1.5 * (cl.hc_dc - 1)));
  return Math.max(0, c);
}

/**
 * Coefficient C_pe de l'action localisee a la vidange (eq. 5.28 a 5.30).
 * E = 2 max(e_f, e_o) / d_c. Pour hc/dc >= 1,2, on applique l'eq. 5.28 ; sinon
 * on retient le maximum de l'eq. 5.28, de l'eq. 5.30 et de 0 (eq. 5.29).
 */
export function coefficientCpe(d: DonneesSilo, cl: Classement): number {
  const E = (2 * Math.max(d.exploitation.e_f, d.exploitation.e_o)) / cl.geometrie.d_c;
  const c528 =
    0.42 *
    d.materiau.C_op *
    (1 + 2 * E * E) *
    (1 - Math.exp(-1.5 * (cl.hc_dc - 1)));
  if (cl.hc_dc >= 1.2) {
    return Math.max(0, c528);
  }
  const c530 = 0.272 * d.materiau.C_op * (cl.hc_dc - 1 + E);
  return Math.max(c528, c530, 0);
}

/**
 * Squelette neutre de definition, le temps de la tache T3.1 : le fichier de
 * test appelle `actionLocalisee` des la collecte, avant tout test filtre.
 */
function definitionEnAttente(): DefinitionLocalisee {
  return { forme: 'nulle', C: 0, motif: 'Definition a venir (tache T3.2).', pointOuvert: null, zeta: null, z_p: null };
}

/**
 * Definition de l'action localisee pour le remplissage et pour la vidange,
 * avec s = pi d_c / 16 (eq. 5.12).
 *
 * Squelette de la tache T3.1 : rend une definition neutre. Remplace a T3.2.
 */
export function actionLocalisee(d: DonneesSilo, cl: Classement, p: ProfilSilos): ActionLocalisee {
  void d;
  void p;
  return {
    E_f: 0,
    E: 0,
    s: (Math.PI * cl.geometrie.d_c) / 16,
    d_c: cl.geometrie.d_c,
    remplissage: definitionEnAttente(),
    vidange: definitionEnAttente(),
  };
}

/**
 * Valeurs de l'action localisee a une profondeur, a partir du resultat
 * symetrique du meme cas.
 */
export function valeursLocalisees(
  def: DefinitionLocalisee,
  a: ActionLocalisee,
  d: DonneesSilo,
  v: ValeursParoi,
): ValeursLocalisees {
  void def;
  void a;
  void d;
  void v;
  throw new Error('valeursLocalisees : implementation a venir (tache T3.3).');
}
