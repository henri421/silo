/**
 * Combinaisons de proprietes du tableau 3.1 (SPEC §3.2, EN 1991-4:2006).
 *
 * Chaque grandeur extreme (K, mu, phi_i) s'obtient avec sa propre combinaison.
 * Le gamma de calcul est gamma_u, valeur caracteristique superieure.
 *
 * Les points ouverts appliques sont cites dans le code : P1 pour K de la
 * vidange excentree (5.2.4.1(4) ne fixe pas K), P2 pour mu de la paroi
 * verticale a la vidange d'une tremie (tableau 3.1 ne le precise pas).
 *
 * Unites : angles en degres, poids volumique en kN/m3, coefficients sans
 * dimension.
 */

import type { Combinaison, IdCombinaison, Materiau, ValeursCaracteristiques } from '../model/types';

/**
 * Combinaison de proprietes d'identifiant `id`, avec gamma_u du materiau.
 * Les libelles sont ceux affiches par l'outil (SPEC §3.2).
 */
export function combinaison(id: IdCombinaison, v: ValeursCaracteristiques, m: Materiau): Combinaison {
  const gamma = m.gamma_u;
  switch (id) {
    case 'C1':
      // C1 pression normale maximale : K superieur, mu inferieur, phi_i inferieur.
      return { id, libelle: 'C1 pression normale max', gamma, K: v.K_sup, mu: v.mu_inf, mu_h: v.mu_h_inf, phi_i: v.phi_i_inf };
    case 'C2':
      // C2 frottement maximal : K superieur, mu superieur, phi_i inferieur.
      return { id, libelle: 'C2 frottement max', gamma, K: v.K_sup, mu: v.mu_sup, mu_h: v.mu_h_inf, phi_i: v.phi_i_inf };
    case 'C3':
      // C3 charge verticale maximale : K inferieur, mu inferieur, phi_i superieur.
      return { id, libelle: 'C3 charge verticale max', gamma, K: v.K_inf, mu: v.mu_inf, mu_h: v.mu_h_inf, phi_i: v.phi_i_sup };
    case 'T1':
      // T1 tremie au remplissage : K inferieur, mu inferieur, phi_i inferieur.
      return { id, libelle: 'T1 trémie remplissage', gamma, K: v.K_inf, mu: v.mu_inf, mu_h: v.mu_h_inf, phi_i: v.phi_i_inf };
    case 'T2':
      // T2 tremie a la vidange : K superieur, mu inferieur, phi_i superieur.
      // Point ouvert P2 : mu inferieur pour la paroi verticale, faute de prescription.
      return { id, libelle: 'T2 trémie vidange', gamma, K: v.K_sup, mu: v.mu_inf, mu_h: v.mu_h_inf, phi_i: v.phi_i_sup };
    case 'X':
      // X vidange excentree : mu inferieur et phi_i superieur (5.2.4.1(4)).
      // Point ouvert P1 : K superieur, coherent avec C1.
      return { id, libelle: 'X vidange excentrée', gamma, K: v.K_sup, mu: v.mu_inf, mu_h: v.mu_h_inf, phi_i: v.phi_i_sup };
    default:
      throw new Error(`Combinaison inconnue : ${String(id)}.`);
  }
}
