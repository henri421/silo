/**
 * Parois verticales d'un silo peu elance ou intermediaire : Janssen modifie
 * (SPEC §5.2, EN 1991-4:2006, 5.3.1.1 et equations 5.71 a 5.81).
 *
 * Unites : longueurs en m, aires en m2, pressions en kPa (kN/m2), effort
 * vertical n_zSk en kN/m, poids volumique en kN/m3. phi_r est en degres.
 *
 * Au dessus de h_o, le materiau n'a pas de contact avec la paroi : les
 * pressions de paroi et l'effort vertical sont nuls. Le choix declare est de
 * prendre z_V = z et p_v = gamma z, materiau au repos sous le talus.
 */

import type {
  Combinaison,
  Geometrie,
  ValeursJanssenModifie,
} from '../model/types';
import { parametresJanssen } from './janssen';

/** Conversion degres vers radians. */
const PI_SUR_180 = Math.PI / 180;

/**
 * Exposant n de la fonction de forme Y_R (eq. 5.76) :
 * n = -(1 + tan(phi_r)) (1 - h_o / z_o).
 * phi_r est l'angle de talus naturel, en degres ; z_o est celui de Janssen
 * pour la combinaison c (eq. 5.73).
 */
export function exposantN(g: Geometrie, c: Combinaison, h_o: number, phi_r_deg: number): number {
  const { z_o } = parametresJanssen(g, c);
  return -(1 + Math.tan(phi_r_deg * PI_SUR_180)) * (1 - h_o / z_o);
}

/**
 * Pressions et effort vertical a la profondeur z, pour un silo peu elance ou
 * intermediaire au remplissage (5.3.1.1, eq. 5.71 a 5.81) :
 * Y_R = 1 - ((z - h_o) / (z_o - h_o) + 1)^n pour z > h_o, 0 au dessus ;
 * p_h = p_ho Y_R, p_w = mu p_h ;
 * z_V = h_o - (z_o - h_o - (z + z_o - 2 h_o)^(n+1) / (z_o - h_o)^n) / (n + 1),
 * p_v = gamma z_V et n_zSk = mu p_ho (z - z_V).
 *
 * z est une profondeur en m, positive ou nulle depuis la surface equivalente.
 */
export function janssenModifie(
  z: number,
  g: Geometrie,
  c: Combinaison,
  h_o: number,
  phi_r_deg: number,
): ValeursJanssenModifie {
  if (!Number.isFinite(z) || z < 0) {
    throw new Error(`La profondeur z doit etre un nombre fini positif ou nul (m) : ${z}.`);
  }
  const { z_o, p_ho } = parametresJanssen(g, c);
  if (z <= h_o) {
    // Pas de contact paroi : choix declare, materiau au repos sous le talus.
    return { Y_R: 0, z_V: z, p_h: 0, p_w: 0, p_v: c.gamma * z, n_zSk: 0 };
  }
  const n = exposantN(g, c, h_o, phi_r_deg);
  const Y_R = 1 - Math.pow((z - h_o) / (z_o - h_o) + 1, n);
  const p_h = p_ho * Y_R;
  const p_w = c.mu * p_h;
  const z_V =
    h_o -
    (z_o - h_o - Math.pow(z + z_o - 2 * h_o, n + 1) / Math.pow(z_o - h_o, n)) / (n + 1);
  const p_v = c.gamma * z_V;
  const n_zSk = c.mu * p_ho * (z - z_V);
  return { Y_R, z_V, p_h, p_w, p_v, n_zSk };
}
