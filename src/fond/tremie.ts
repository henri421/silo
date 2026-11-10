/**
 * Tremie : classement profond ou peu profond, coefficient de forme et
 * pressions sur la paroi inclinee (SPEC §6.3, EN 1991-4:2006, 6.1 et 6.3 a
 * 6.4).
 *
 * La tremie est profonde si tan(beta) < (1 - K_inf) / (2 mu_h,inf) (eq. 6.1).
 * La pression verticale moyenne suit l'equation 6.7, avec la forme limite en
 * logarithme quand n vaut 1. La profondeur commande les facteurs F_f et F_e
 * (Walker, equations 6.17 a 6.23 et 6.26 a 6.28) et les combinaisons T1 ou T2.
 *
 * Unites : longueurs en m, pressions en kPa (kN/m2), poids volumique en
 * kN/m3, angles en degres (convertis en radians a l'usage).
 *
 * L'outil CONSTATE : ces valeurs sont caracteristiques, les coefficients
 * partiels de l'EN 1990 restent a appliquer.
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
import { grandeursGeometriques } from '../classement/geometrie';
import { valeursCaracteristiques } from '../proprietes/caracteristiques';
import { pressionTransition } from './transition';

const DEG = Math.PI / 180;

/** Nombre a la francaise, virgule decimale, nombre fixe de decimales. */
function nombreFr(valeur: number, decimales: number): string {
  return valeur.toFixed(decimales).replace('.', ',');
}

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

/**
 * Coefficient de forme S (6.9 a 6.11) : 2 pour une tremie conique ou
 * pyramidale carree, 1 pour un biseau, 1 + b/a pour une pyramidale
 * rectangulaire. Erreur pour un fond plat.
 */
export function coefficientS(silo: Silo): number {
  switch (silo.fond) {
    case 'plat':
      throw new Error(
        'Le coefficient de forme S ne s applique qu a une tremie, pas a un fond plat (6.9 a 6.11).',
      );
    case 'conique':
    case 'pyramidale-carree':
      return 2;
    case 'biseau':
      return 1;
    case 'pyramidale-rectangulaire':
      // S = 1 + b/a (6.11) ; grandeursGeometriques valide a et b.
      grandeursGeometriques(silo);
      return 1 + (silo.b as number) / (silo.a as number);
  }
}

/**
 * Pression verticale moyenne p_v a la cote x dans la tremie (eq. 6.7) :
 * p_v = gamma h_h / (n - 1) ((x/h_h) - (x/h_h)^n) + p_vft (x/h_h)^n.
 * Si |n - 1| < 1e-9, le premier terme prend sa limite
 * gamma h_h (-(x/h_h) ln(x/h_h)) : precaution declaree et testee.
 *
 * x est une cote en m depuis la pointe virtuelle, dans ]0 ; h_h].
 */
export function pvTremie(
  x: number,
  h_h: number,
  gamma: number,
  n: number,
  p_vft: number,
): number {
  if (!Number.isFinite(h_h) || h_h <= 0) {
    throw new Error(
      `La hauteur de tremie h_h doit etre un nombre strictement positif (m) : ${h_h}.`,
    );
  }
  if (!Number.isFinite(x) || x <= 0 || x > h_h + 1e-9) {
    throw new Error(
      `La cote x doit etre un nombre strictement positif (m) et au plus egal a h_h = ${h_h} m : ${x}.`,
    );
  }
  const u = x / h_h;
  const un = Math.pow(u, n);
  if (Math.abs(n - 1) < 1e-9) {
    return gamma * h_h * (-u * Math.log(u)) + p_vft * un;
  }
  return ((gamma * h_h) / (n - 1)) * (u - un) + p_vft * un;
}

/**
 * Facteur F_e de Walker et angle epsilon (equations 6.21 a 6.23) :
 * phi_wh = atan(mu_h), epsilon = phi_wh + asin(sin(phi_wh) / sin(phi_i)),
 * F_e = (1 + sin(phi_i) cos(epsilon)) / (1 - sin(phi_i) cos(2 beta + epsilon)).
 * epsilon est rendu en degres. Erreur si phi_wh depasse phi_i (note 1 sous
 * 6.23).
 */
export function facteurWalker(
  beta_deg: number,
  mu_h: number,
  phi_i_deg: number,
): { F_e: number; epsilon: number } {
  const phi_wh = Math.atan(mu_h);
  const phi_i = phi_i_deg * DEG;
  if (phi_wh > phi_i) {
    throw new Error(
      `phi_wh = ${nombreFr(phi_wh / DEG, 1)} deg depasse phi_i = ${nombreFr(phi_i_deg, 1)} deg : ` +
        'contact paroi impossible (EN 1991-4, note 1 sous 6.23).',
    );
  }
  const epsilon = phi_wh + Math.asin(Math.sin(phi_wh) / Math.sin(phi_i));
  const numerateur = 1 + Math.sin(phi_i) * Math.cos(epsilon);
  const denominateur = 1 - Math.sin(phi_i) * Math.cos(2 * beta_deg * DEG + epsilon);
  return { F_e: numerateur / denominateur, epsilon: epsilon / DEG };
}

/**
 * Parametres d'une tremie pour un cas, selon SPEC §6.3 :
 * - profonde au remplissage (6.3.2) : T1, mu_heff = mu_h,inf, F_f (6.17),
 *   n = S (1 - b) mu_heff cot(beta) (6.18) ;
 * - profonde a la vidange (6.3.3) : T2, F_e de Walker avec mu_h,inf et
 *   phi_i,sup, n par la forme generale 6.8 ;
 * - peu profonde (6.4) : mu_heff = (1 - K_inf) / (2 tan(beta)) (6.26), F_f
 *   (6.27) et n (6.28) ; la vidange rend les memes valeurs que le
 *   remplissage (6.4.3), avec la combinaison T1.
 *
 * p_vft vient de `pressionTransition` : C3 au remplissage, C3 a la vidange
 * d'une tremie peu profonde, T2 a la vidange d'une tremie profonde (P2).
 */
export function parametresTremie(
  d: DonneesSilo,
  cl: Classement,
  p: ProfilSilos,
  cas: CasFond,
): ParametresTremie {
  const S = coefficientS(d.silo);
  const beta = exigerBeta(d.silo);
  if (cl.h_h === null) {
    throw new Error('Une tremie exige une hauteur h_h jusqu a la pointe virtuelle (m) (6.1).');
  }
  const h_h = cl.h_h;
  const tanBeta = Math.tan(beta * DEG);
  const cotBeta = 1 / tanBeta;
  const b = p.valeurs.b_tremie.valeur;
  const gamma = d.materiau.gamma_u;
  const v = valeursCaracteristiques(d.materiau, d.parois);
  const profondeur = classerTremie(d, v);
  const p_vft = pressionTransition(d, cl, p, cas).p_vft;

  if (profondeur === 'profonde') {
    if (cas === 'remplissage') {
      // 6.3.2 : mu_heff = mu_h, F_f de 6.17, n de 6.18.
      const mu_heff = v.mu_h_inf;
      const F = 1 - b / (1 + tanBeta / mu_heff);
      const n = S * (1 - b) * mu_heff * cotBeta;
      return {
        cas,
        profondeur,
        combinaison: 'T1',
        h_h,
        gamma,
        S,
        mu_heff,
        F,
        n,
        p_vft,
        epsilon: null,
        motif:
          'Trémie profonde au remplissage : F_f de l équation 6.17 et n de l équation 6.18 ' +
          '(6.3.2).',
      };
    }
    // 6.3.3 : F_e de Walker (6.21 a 6.23), n par la forme generale 6.8.
    // Point ouvert P2 : mu inferieur sur la paroi verticale pour p_vft.
    const w = facteurWalker(beta, v.mu_h_inf, v.phi_i_sup);
    const mu_heff = v.mu_h_inf;
    const F = w.F_e;
    const n = S * (F * mu_heff * cotBeta + F) - 2;
    return {
      cas,
      profondeur,
      combinaison: 'T2',
      h_h,
      gamma,
      S,
      mu_heff,
      F,
      n,
      p_vft,
      epsilon: w.epsilon,
      motif:
        'Trémie profonde à la vidange : F_e de Walker (6.21 à 6.23) et n de la forme générale ' +
        'de l équation 6.8 (6.3.3, point ouvert P2).',
    };
  }

  // 6.4 : tremie peu profonde, memes valeurs au remplissage et a la vidange.
  const mu_heff = (1 - v.K_inf) / (2 * tanBeta);
  const F = 1 - b / (1 + tanBeta / mu_heff);
  const n = S * (1 - b) * mu_heff * cotBeta;
  const motif =
    cas === 'vidange'
      ? 'Trémie peu profonde à la vidange : mêmes valeurs qu au remplissage (6.4.3).'
      : 'Trémie peu profonde au remplissage : mu_heff de 6.26, F_f de 6.27 et n de 6.28 (6.4.2).';
  return {
    cas,
    profondeur,
    combinaison: 'T1',
    h_h,
    gamma,
    S,
    mu_heff,
    F,
    n,
    p_vft,
    epsilon: null,
    motif,
  };
}

/**
 * Pressions a la cote x : p_v par l'equation 6.7, p_n = F p_v et
 * p_t = mu_heff F p_v (SPEC §6.3).
 */
export function pressionsTremie(t: ParametresTremie, x: number): PressionsTremie {
  const p_v = pvTremie(x, t.h_h, t.gamma, t.n, t.p_vft);
  const p_n = t.F * p_v;
  const p_t = t.mu_heff * t.F * p_v;
  return { x, p_v, p_n, p_t };
}
