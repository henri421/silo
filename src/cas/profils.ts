/**
 * Grille des profils de paroi verticale (SPEC §2.4 et §7).
 *
 * La grille contient les points reguliers z_i = hc i / (n - 1), ou n vaut au
 * moins 101, les points singuliers h_o et z_o en C1 s'ils sont dans ]0 ; hc[,
 * et les bornes des bandes de chargement. Les valeurs sont triees et les
 * doublons a moins de 1e-9 retires. Les points reguliers sont calcules par
 * hc i / (n - 1), jamais par une somme de pas, pour que z = 10 tombe
 * exactement sur 10 dans le cas V1.
 *
 * Unites : longueurs en m.
 */

import type { PointProfil } from '../model/types';
import { bornesBandes } from '../discretisation/bandes';

/** Fleche de hauteur d'un point de profil a une profondeur z. */
const TOLERANCE = 1e-9;

/** Valeurs de paroi a une profondeur, hors z et Z. */
export interface ValeursPointParoi {
  /** Pression normale symetrique du cas (p_hf, p_he ; p_hse pour VID_EXC). */
  p_h_sym: number;
  /** Part localisee ou majoree : p_h_total - p_h_sym. */
  p_h_loc: number;
  p_h_total: number;
  p_w: number;
  p_v: number;
  n_zSk: number;
}

/**
 * Grille des profondeurs z (m) : points reguliers sur [0 ; hc], points
 * singuliers h_o et z_o en C1 dans ]0 ; hc[, et bornes des bandes. Triee et
 * sans doublon a moins de 1e-9.
 */
export function grilleProfils(
  hc: number,
  dz: number,
  pointsProfil: number,
  h_o: number,
  z_o: number,
): number[] {
  const n = Math.max(101, pointsProfil);
  const valeurs: number[] = [];
  for (let i = 0; i < n; i++) {
    // Pas une somme de pas : z = 10 m doit tomber exactement sur 10 (V1).
    valeurs.push((hc * i) / (n - 1));
  }
  for (const singulier of [h_o, z_o]) {
    if (Number.isFinite(singulier) && singulier > 0 && singulier < hc) {
      valeurs.push(singulier);
    }
  }
  valeurs.push(...bornesBandes(hc, dz));

  valeurs.sort((a, b) => a - b);
  const uniques: number[] = [];
  for (const z of valeurs) {
    if (uniques.length === 0 || z - uniques[uniques.length - 1] >= TOLERANCE) {
      uniques.push(z);
    }
  }
  return uniques;
}

/**
 * Profil de paroi verticale sur la grille : chaque point porte sa cote globale
 * Z = Z_transition + hc - z et les valeurs rendues par `evaluer(z)`.
 */
export function construireProfil(
  grille: number[],
  Z_transition: number,
  hc: number,
  evaluer: (z: number) => ValeursPointParoi,
): PointProfil[] {
  return grille.map((z) => ({
    z,
    Z: Z_transition + hc - z,
    ...evaluer(z),
  }));
}
