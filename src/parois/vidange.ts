/**
 * Coefficients de vidange symetrique des parois verticales (SPEC §5.3,
 * EN 1991-4:2006, 5.2.2.1 et 5.3.2.1).
 *
 * C_h et C_w majorent les pressions du remplissage a la vidange selon
 * l'elancement, la classe de calcul et la vidange par le haut. Les valeurs
 * sont lues dans le profil normatif, jamais codees en dur.
 *
 * Unites : coefficients sans dimension ; C_S = hc/dc - 1 est sans dimension.
 */

import type { Classement, CoefficientsVidange, DonneesSilo } from '../model/types';
import type { ProfilSilos } from '../norms/profil';

/** Nombre a la francaise, virgule decimale, nombre fixe de decimales. */
function nombreFr(valeur: number, decimales: number): string {
  return valeur.toFixed(decimales).replace('.', ',');
}

/**
 * Coefficients de vidange symetrique C_h et C_w (5.20 a 5.22, 5.84 a 5.87).
 * L'ordre des branches est celui de la specification : vidange par le haut,
 * silo peu elance, silo intermediaire, silo elance. En v1, les classes 2 et 3
 * suivent les memes coefficients : `procedures` ne change rien ici.
 */
export function coefficientsVidange(
  d: DonneesSilo,
  cl: Classement,
  p: ProfilSilos,
): CoefficientsVidange {
  if (d.exploitation.vidangeParLeHaut) {
    return {
      C_h: 1,
      C_w: 1,
      C_S: null,
      motif: 'Vidange par le haut : C_h = C_w = 1,0 (EN 1991-4, 5.20 et 5.84).',
    };
  }
  if (cl.elancement === 'peu-elance') {
    return {
      C_h: 1,
      C_w: 1,
      C_S: null,
      motif: 'Silo peu élancé : C_h = C_w = 1,0 (EN 1991-4, 5.3.2.1(2)).',
    };
  }
  if (cl.elancement === 'intermediaire') {
    const C_S = cl.hc_dc - 1;
    const penteH = p.valeurs.C_h_pente.valeur;
    const penteW = p.valeurs.C_w_pente.valeur;
    return {
      C_h: 1 + penteH * C_S,
      C_w: 1 + penteW * C_S,
      C_S,
      motif:
        `Silo intermédiaire : C_h = 1 + ${nombreFr(penteH, 2)} C_S et ` +
        `C_w = 1 + ${nombreFr(penteW, 2)} C_S, avec C_S = hc/dc - 1 (EN 1991-4, 5.85 à 5.87).`,
    };
  }
  const C_h = p.valeurs.C_h_elance.valeur;
  const C_w = p.valeurs.C_w_elance.valeur;
  return {
    C_h,
    C_w,
    C_S: null,
    motif: `Silo élancé : C_h = ${nombreFr(C_h, 2)} et C_w = ${nombreFr(C_w, 2)} (EN 1991-4, 5.21 et 5.22).`,
  };
}
