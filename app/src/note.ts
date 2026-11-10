/**
 * Note de calcul (SPEC §8.3). Squelette temporaire de la tache T8.1 : le
 * fichier de test d'acceptation importe ce module des sa collecte.
 */

import type { NoteDeCalcul } from 'aedificium-ui';
import type { ResultatSilo } from '../../src/index';

export function noteDuCalcul(
  r: ResultatSilo,
  cartouche: { projet: string; element: string; date: string }
): NoteDeCalcul {
  void r;
  void cartouche;
  throw new Error('Note de calcul non encore implementee.');
}
