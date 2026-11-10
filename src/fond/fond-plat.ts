/**
 * Pression verticale sur un fond plat (SPEC §6.2,
 * EN 1991-4:2006, 6.2.1 et 6.2.2).
 *
 * Silo elance : p_v = p_vft, uniforme, identique au remplissage et a la
 * vidange (6.2.1). Silo peu elance ou intermediaire : interpolation de
 * l'equation 6.13 entre p_vb a la transition et les pressions du talus p_vtp
 * et p_vho (equations 6.14 et 6.15). La valeur obtenue vaut au voisinage du
 * centre du fond (6.2.2(4)) et reste identique au remplissage et a la vidange
 * (6.2.2(3)).
 *
 * Unites : longueurs en m, pressions en kPa (kN/m2), poids volumique en
 * kN/m3.
 *
 * L'outil CONSTATE : ces valeurs sont caracteristiques, les coefficients
 * partiels de l'EN 1990 restent a appliquer.
 */

import type { Classement, DonneesSilo, FondPlat } from '../model/types';
import type { ProfilSilos } from '../norms/profil';
import { pressionTransition } from './transition';

/**
 * Pression verticale du fond plat : uniforme p_vft pour un silo elance
 * (6.2.1), p_vsq au voisinage du centre du fond pour un silo peu elance ou
 * intermediaire (6.2.2, equations 6.13 a 6.15). Le fond doit etre plat.
 */
export function fondPlat(d: DonneesSilo, cl: Classement, p: ProfilSilos): FondPlat {
  if (d.silo.fond !== 'plat') {
    throw new Error(
      `Le fond doit etre plat : un fond ${d.silo.fond} n est pas traite par la methode du fond plat (6.2).`,
    );
  }

  // p_vb = p_vft au remplissage (C3, C_b compris), identique a la vidange.
  const transition = pressionTransition(d, cl, p, 'remplissage');

  if (cl.elancement === 'elance') {
    return {
      methode: '6.2.1',
      p_v: transition.p_vft,
      p_vb: null,
      p_vtp: null,
      p_vho: null,
      facteur: null,
      C_b: transition.C_b,
      motif:
        'Pression verticale uniforme p_v = p_vft sur le fond (6.2.1), ' +
        'identique au remplissage et à la vidange (6.2.1(2)).',
    };
  }

  // Equations 6.14 et 6.15 : pressions du talus, avec gamma_u.
  const gamma = d.materiau.gamma_u;
  const p_vtp = gamma * cl.h_tp;
  const p_vho = gamma * cl.h_o;
  // Facteur d'interpolation de l'equation 6.13.
  const facteur = (2 - d.silo.hc / cl.geometrie.d_c) / (2 - cl.h_tp / cl.geometrie.d_c);
  const p_v = transition.p_vft + (p_vtp - p_vho) * facteur;

  return {
    methode: '6.2.2',
    p_v,
    p_vb: transition.p_vft,
    p_vtp,
    p_vho,
    facteur,
    C_b: transition.C_b,
    motif:
      'Pression verticale p_vsq au voisinage du centre du fond (6.2.2(4)), ' +
      'identique au remplissage et à la vidange (6.2.2(3)).',
  };
}
