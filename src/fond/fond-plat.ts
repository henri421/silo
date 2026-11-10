/**
 * Pression verticale sur un fond plat (SPEC §6.2,
 * EN 1991-4:2006, 6.2.1 et 6.2.2).
 *
 * Unites : longueurs en m, pressions en kPa (kN/m2), poids volumique en
 * kN/m3.
 *
 * Tache T4.2 du lot 4 : fonction a implementer.
 */

import type { Classement, DonneesSilo, FondPlat } from '../model/types';
import type { ProfilSilos } from '../norms/profil';

/** Pression verticale du fond plat (6.2.1 ou 6.2.2) ; implementee a la tache T4.2. */
export function fondPlat(d: DonneesSilo, cl: Classement, p: ProfilSilos): FondPlat {
  void d;
  void cl;
  void p;
  throw new Error('fondPlat : non implemente (tache T4.2 du lot 4).');
}
