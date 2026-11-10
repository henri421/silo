/**
 * Etat des parois verticales aux cas symetriques (SPEC §5.6, lot 2).
 *
 * Ce module est implemente a la tache T2.4 ; la signature est posee ici pour
 * que le fichier de test du lot 2 puisse etre charge des la tache T2.3.
 */

import type { Classement, DonneesSilo, EtatParoi } from '../model/types';
import type { ProfilSilos } from '../norms/profil';

/** Etat de la paroi a la profondeur z (implementation a T2.4). */
export function etatParoi(
  _z: number,
  _d: DonneesSilo,
  _cl: Classement,
  _p: ProfilSilos,
): EtatParoi {
  throw new Error('etatParoi : implementation prevue a la tache T2.4.');
}
