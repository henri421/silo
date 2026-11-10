/**
 * Calcul complet d'un silo (SPEC §7), squelette de la tache T6.1.
 *
 * Ce module est remplace a la tache T6.2 par l'assemblage des fonctions du
 * noyau ; il existe ici pour permettre le chargement du fichier de test du
 * lot 6 pendant l'implementation des bandes.
 */

import type { DonneesSilo, ResultatSilo } from './model/types';
import type { ProfilSilos } from './norms/profil';

/** Squelette : rend un resultat vide, sans aucun calcul. */
export function calculer(d: DonneesSilo, p: ProfilSilos): ResultatSilo {
  void d;
  void p;
  return { cas: [], bandes: [], controles: [], pointsOuverts: [] } as unknown as ResultatSilo;
}
