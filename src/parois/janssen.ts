/**
 * Parois verticales d'un silo elance : pression de Janssen (SPEC §5.1,
 * EN 1991-4:2006, 5.2.1.1 et equations 5.1 a 5.7).
 *
 * Unites : longueurs en m, aires en m2, pressions en kPa (kN/m2), effort
 * vertical n_zSk en kN/m, poids volumique en kN/m3. Les coefficients K et mu
 * sont sans dimension et viennent de la combinaison de proprietes choisie.
 *
 * L'outil CONSTATE : ces valeurs sont caracteristiques, les coefficients
 * partiels de l'EN 1990 restent a appliquer.
 */

import type { Combinaison, Geometrie, ParametresJanssen, ValeursParoi } from '../model/types';

/**
 * Parametres de Janssen d'une combinaison de proprietes (eq. 5.3 et 5.4) :
 * z_o = A / (K mu U) en m, p_ho = gamma K z_o en kPa.
 */
export function parametresJanssen(g: Geometrie, c: Combinaison): ParametresJanssen {
  const z_o = g.A / (c.K * c.mu * g.U);
  const p_ho = c.gamma * c.K * z_o;
  return { z_o, p_ho };
}

/**
 * Pressions et effort vertical a la profondeur z sous la surface equivalente,
 * pour un silo elance au remplissage (5.2.1.1, eq. 5.1 a 5.7) :
 * Y_J = 1 - exp(-z / z_o), p_h = p_ho Y_J, p_w = mu p_h,
 * p_v = (p_ho / K) Y_J et n_zSk = mu p_ho (z - z_o Y_J).
 *
 * z est une profondeur en m, positive ou nulle depuis la surface equivalente.
 */
export function janssen(z: number, g: Geometrie, c: Combinaison): ValeursParoi {
  if (!Number.isFinite(z) || z < 0) {
    throw new Error(`La profondeur z doit etre un nombre fini positif ou nul (m) : ${z}.`);
  }
  const { z_o, p_ho } = parametresJanssen(g, c);
  const Y_J = 1 - Math.exp(-z / z_o);
  const p_h = p_ho * Y_J;
  const p_w = c.mu * p_h;
  const p_v = (p_ho / c.K) * Y_J;
  const n_zSk = c.mu * p_ho * (z - z_o * Y_J);
  return { p_h, p_w, p_v, n_zSk };
}
