/**
 * Contrainte verticale a la transition du fond (SPEC §6.1,
 * EN 1991-4:2006, 6.1.2).
 *
 * p_vft = C_b p_vf(hc) : la pression verticale du materiau a la transition, au
 * remplissage en C3, a la vidange en C3 pour un fond plat ou une tremie peu
 * profonde, et en T2 pour une tremie profonde (point ouvert P2 : mu inferieur
 * sur la paroi verticale, le tableau 3.1 ne le precisant pas).
 *
 * Unites : longueurs en m, pressions en kPa (kN/m2), poids volumique en
 * kN/m3. Le coefficient C_b est sans dimension.
 *
 * L'outil CONSTATE : ces valeurs sont caracteristiques, les coefficients
 * partiels de l'EN 1990 restent a appliquer.
 */

import type {
  CasFond,
  Classement,
  CoefficientCb,
  DonneesSilo,
  IdCombinaison,
  PressionTransition,
} from '../model/types';
import type { ProfilSilos } from '../norms/profil';
import { valeursCaracteristiques } from '../proprietes/caracteristiques';
import { combinaison } from '../proprietes/combinaisons';
import { janssen } from '../parois/janssen';
import { janssenModifie } from '../parois/janssen-modifie';
import { classerTremie } from './tremie';

/** Nombre a la francaise, virgule decimale, nombre fixe de decimales. */
function nombreFr(valeur: number, decimales: number): string {
  return valeur.toFixed(decimales).replace('.', ',');
}

/**
 * Coefficient C_b de la contrainte a la transition (6.1.2(4) a (6)) : 1,0 pour
 * un materiau faiblement cohesif sans engrainement mecanique, 1,2 sinon. La
 * valeur est lue dans le profil normatif, jamais codee en dur.
 */
export function coefficientCb(d: DonneesSilo, p: ProfilSilos): CoefficientCb {
  const majore = !d.parois.faiblementCohesif || d.parois.engrainementMecanique;
  if (majore) {
    const valeur = nombreFr(p.valeurs.C_b_majore.valeur, 1);
    return {
      C_b: p.valeurs.C_b_majore.valeur,
      motif:
        'Matériau non faiblement cohésif ou sujet à engrainement mécanique : ' +
        `C_b = ${valeur} (6.1.2(5) et (6)).`,
    };
  }
  const valeur = nombreFr(p.valeurs.C_b.valeur, 1);
  return {
    C_b: p.valeurs.C_b.valeur,
    motif: `Matériau faiblement cohésif sans engrainement mécanique : C_b = ${valeur} (6.1.2(4)).`,
  };
}

/**
 * Pression verticale a la transition : p_vft = C_b p_vf(hc), avec p_vf(hc) par
 * Janssen pour un silo elance (5.2.1.1) et par Janssen modifie sinon (5.3.1.1).
 *
 * Combinaison de proprietes : C3 au remplissage (6.1.2(2)) ; a la vidange, C3
 * pour un fond plat (6.2.1(2) et 6.2.2(3)) ou une tremie peu profonde (6.4.3),
 * T2 pour une tremie profonde (point ouvert P2).
 */
export function pressionTransition(
  d: DonneesSilo,
  cl: Classement,
  p: ProfilSilos,
  cas: CasFond,
): PressionTransition {
  const v = valeursCaracteristiques(d.materiau, d.parois);
  const cb = coefficientCb(d, p);

  let id: IdCombinaison;
  if (cas === 'remplissage') {
    id = 'C3';
  } else if (d.silo.fond === 'plat' || classerTremie(d, v) === 'peu-profonde') {
    id = 'C3';
  } else {
    // Point ouvert P2 : mu inferieur sur la paroi verticale pour T2.
    id = 'T2';
  }

  const c = combinaison(id, v, d.materiau);
  const vh =
    cl.elancement === 'elance'
      ? janssen(d.silo.hc, cl.geometrie, c)
      : janssenModifie(d.silo.hc, cl.geometrie, c, cl.h_o, d.materiau.phi_r);

  return { p_vft: cb.C_b * vh.p_v, C_b: cb.C_b, combinaison: id };
}
