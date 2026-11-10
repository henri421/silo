/**
 * Tremie : classement profond ou peu profond et pressions sur la paroi
 * inclinee (SPEC §6.3, EN 1991-4:2006, 6.1 et 6.3 a 6.4).
 *
 * Unites : longueurs en m, pressions en kPa (kN/m2), poids volumique en
 * kN/m3, angles en degres (convertis en radians a l'usage).
 *
 * Tache T4.3 du lot 4 : seules les fonctions deja implementees sont completes ;
 * les autres levent une erreur explicite en attendant leur tache.
 */

import type {
  CasFond,
  Classement,
  DonneesSilo,
  ParametresTremie,
  PressionsTremie,
  ProfondeurTremie,
  Silo,
  ValeursCaracteristiques,
} from '../model/types';
import type { ProfilSilos } from '../norms/profil';

const DEG = Math.PI / 180;

/** Angle beta de la tremie (deg), valide ; erreur pour un fond plat. */
function exigerBeta(silo: Silo): number {
  if (silo.fond === 'plat') {
    throw new Error('Un fond plat n a pas de tremie : beta n est pas defini (6.1).');
  }
  const beta = silo.beta;
  if (beta === undefined || !Number.isFinite(beta) || beta <= 0 || beta >= 90) {
    throw new Error(
      "L angle de tremie beta doit etre un nombre strictement compris entre 0 et 90 (deg).",
    );
  }
  return beta;
}

/**
 * Classement d'une tremie (eq. 6.1) : profonde si
 * tan(beta) < (1 - K_inf) / (2 mu_h,inf), peu profonde sinon.
 */
export function classerTremie(d: DonneesSilo, v: ValeursCaracteristiques): ProfondeurTremie {
  const beta = exigerBeta(d.silo);
  const limite = (1 - v.K_inf) / (2 * v.mu_h_inf);
  return Math.tan(beta * DEG) < limite ? 'profonde' : 'peu-profonde';
}

/** Coefficient de forme S (6.9 a 6.11) ; implemente a la tache T4.3. */
export function coefficientS(silo: Silo): number {
  void silo;
  throw new Error('coefficientS : non implemente (tache T4.3 du lot 4).');
}

/** Pression verticale moyenne p_v(x) (eq. 6.7) ; implementee a la tache T4.3. */
export function pvTremie(
  x: number,
  h_h: number,
  gamma: number,
  n: number,
  p_vft: number,
): number {
  void x;
  void h_h;
  void gamma;
  void n;
  void p_vft;
  throw new Error('pvTremie : non implemente (tache T4.3 du lot 4).');
}

/** Coefficient de Walker F_e et angle epsilon (6.21 a 6.23) ; tache T4.3. */
export function facteurWalker(
  beta_deg: number,
  mu_h: number,
  phi_i_deg: number,
): { F_e: number; epsilon: number } {
  void beta_deg;
  void mu_h;
  void phi_i_deg;
  throw new Error('facteurWalker : non implemente (tache T4.3 du lot 4).');
}

/** Parametres de la tremie (SPEC §6.3) ; implementes a la tache T4.3. */
export function parametresTremie(
  d: DonneesSilo,
  cl: Classement,
  p: ProfilSilos,
  cas: CasFond,
): ParametresTremie {
  void d;
  void cl;
  void p;
  void cas;
  throw new Error('parametresTremie : non implemente (tache T4.3 du lot 4).');
}

/** Pressions p_n et p_t a la cote x ; implementees a la tache T4.3. */
export function pressionsTremie(t: ParametresTremie, x: number): PressionsTremie {
  void t;
  void x;
  throw new Error('pressionsTremie : non implemente (tache T4.3 du lot 4).');
}
