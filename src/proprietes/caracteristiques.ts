/**
 * Valeurs caracteristiques des proprietes du materiau ensile (SPEC §3.1,
 * EN 1991-4:2006, 4.2.3 et equations 4.1 a 4.6).
 *
 * Le tableau E.1 donne K_m, mu_m et phi_im comme valeurs moyennes et gamma_u
 * comme valeur caracteristique superieure. Les extremes s'en deduisent en
 * divisant ou en multipliant par les coefficients de variation a.
 *
 * Unites : angles en degres, coefficients sans dimension.
 */

import type { Materiau, Parois, ValeursCaracteristiques } from '../model/types';

/**
 * Valeurs caracteristiques inferieures et superieures de K, mu (paroi
 * verticale), mu_h (paroi de tremie) et phi_i. Chaque categorie de paroi est
 * lue sur sa propre entree mu_m (tableau 4.1).
 */
export function valeursCaracteristiques(m: Materiau, parois: Parois): ValeursCaracteristiques {
  const muVerticale = m.mu_m[parois.verticale];
  const muTremie = m.mu_m[parois.tremie];
  return {
    K_inf: m.K_m / m.a_K,
    K_sup: m.K_m * m.a_K,
    mu_inf: muVerticale / m.a_mu,
    mu_sup: muVerticale * m.a_mu,
    mu_h_inf: muTremie / m.a_mu,
    mu_h_sup: muTremie * m.a_mu,
    phi_i_inf: m.phi_im / m.a_phi,
    phi_i_sup: m.phi_im * m.a_phi,
  };
}
