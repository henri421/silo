/**
 * Parois verticales d'un silo peu elance ou intermediaire : Janssen modifie
 * (SPEC §5.2, EN 1991-4:2006, 5.3.1.1 et equations 5.71 a 5.81).
 *
 * Ce module est implemente a la tache T2.2 ; les signatures sont posees ici
 * pour que le fichier de test du lot 2 puisse etre charge des la tache T2.1.
 */

import type { Combinaison, Geometrie, ValeursJanssenModifie } from '../model/types';

/** Exposant n de l'eq. 5.76 (implementation a T2.2). */
export function exposantN(
  _g: Geometrie,
  _c: Combinaison,
  _h_o: number,
  _phi_r_deg: number,
): number {
  throw new Error('exposantN : implementation prevue a la tache T2.2.');
}

/** Janssen modifie (implementation a T2.2). */
export function janssenModifie(
  _z: number,
  _g: Geometrie,
  _c: Combinaison,
  _h_o: number,
  _phi_r_deg: number,
): ValeursJanssenModifie {
  throw new Error('janssenModifie : implementation prevue a la tache T2.2.');
}
