/**
 * Etat des parois verticales aux cas symetriques de remplissage et de vidange
 * (SPEC §5.6, EN 1991-4:2006, 5.1 a 5.3).
 *
 * Chaque pression vient de sa propre combinaison de proprietes du tableau 3.1 :
 * p_h en C1, p_w et n_zSk en C2, p_v en C3. A la vidange, C_h majore p_h,
 * C_w majore p_w et n_zSk ; p_v n'est pas majoree (5.2.2.1 et 5.3.2.1).
 *
 * Unites : longueurs en m, pressions en kPa (kN/m2), effort vertical n_zSk en
 * kN/m. Les angles de materiau sont en degres.
 */

import type {
  Classement,
  Combinaison,
  DonneesSilo,
  EtatParoi,
  ValeursParoi,
} from '../model/types';
import type { ProfilSilos } from '../norms/profil';
import { valeursCaracteristiques } from '../proprietes/caracteristiques';
import { combinaison } from '../proprietes/combinaisons';
import { janssen } from './janssen';
import { janssenModifie } from './janssen-modifie';
import { coefficientsVidange } from './vidange';

/**
 * Valeurs de paroi au remplissage pour une combinaison, selon l'elancement.
 * Un silo elance suit Janssen (5.2.1.1) ; un silo intermediaire ou peu elance
 * suit Janssen modifie (5.3.1.1) avec h_o du classement.
 */
function valeursRemplissage(
  z: number,
  d: DonneesSilo,
  cl: Classement,
  c: Combinaison,
): ValeursParoi {
  if (cl.elancement === 'elance') {
    return janssen(z, cl.geometrie, c);
  }
  return janssenModifie(z, cl.geometrie, c, cl.h_o, d.materiau.phi_r);
}

/**
 * Etat de la paroi verticale a la profondeur z : remplissage et vidange
 * symetriques. z doit etre compris entre 0 et hc (m).
 *
 * La vidange est declaree non applicable, avec son motif, quand l'utilisateur
 * garantit un ecoulement en cheminee interne (5.1(8)). Le remplissage reste
 * rendu dans tous les cas.
 */
export function etatParoi(
  z: number,
  d: DonneesSilo,
  cl: Classement,
  p: ProfilSilos,
): EtatParoi {
  if (z > d.silo.hc) {
    throw new Error(
      `La profondeur z = ${z} m depasse la hauteur de paroi verticale hc = ${d.silo.hc} m.`,
    );
  }

  const v = valeursCaracteristiques(d.materiau, d.parois);
  const c1 = combinaison('C1', v, d.materiau);
  const c2 = combinaison('C2', v, d.materiau);
  const c3 = combinaison('C3', v, d.materiau);

  const enC1 = valeursRemplissage(z, d, cl, c1);
  const enC2 = valeursRemplissage(z, d, cl, c2);
  const enC3 = valeursRemplissage(z, d, cl, c3);

  const remplissage: ValeursParoi = {
    p_h: enC1.p_h,
    p_w: enC2.p_w,
    n_zSk: enC2.n_zSk,
    p_v: enC3.p_v,
  };

  let vidange: ValeursParoi | null = null;
  let motifVidange: string | null = null;
  if (d.exploitation.ecoulementEnCheminee) {
    // 5.1(8) : ecoulement en cheminee interne garanti par l'utilisateur.
    motifVidange =
      "Écoulement en cheminée interne garanti par l'utilisateur : vidange non applicable (5.1(8)).";
  } else {
    const k = coefficientsVidange(d, cl, p);
    vidange = {
      p_h: enC1.p_h * k.C_h,
      p_w: enC2.p_w * k.C_w,
      n_zSk: enC2.n_zSk * k.C_w,
      p_v: enC3.p_v,
    };
  }

  return {
    z,
    remplissage,
    vidange,
    motifVidange,
    combinaisons: { p_h: 'C1', p_w: 'C2', n_zSk: 'C2', p_v: 'C3' },
  };
}
