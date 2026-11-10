/**
 * Vidange a grand excentrement d'un silo circulaire (SPEC §5.5,
 * EN 1991-4:2006, 5.2.4 et 5.3.4).
 *
 * Unites : longueurs en m, pressions en kPa (kN/m2), efforts lineiques en
 * kN/m, angles en degres. La combinaison X applique mu inferieur et phi_i
 * superieur (5.2.4.1(4)) et, choix declare P1, K superieur (coherent avec C1).
 *
 * La zone de contrainte elevee a 2 p_hf est lue comme un arc theta_c de chaque
 * cote de la zone d'ecoulement (figure 5.5c) : c'est le point ouvert P4, code
 * tel que declare dans SPEC §5.5 et §9, et cite dans les motifs.
 *
 * L'outil CONSTATE : ces valeurs sont caracteristiques, les coefficients
 * partiels de l'EN 1990 restent a appliquer.
 */

import type {
  Classement,
  DeclenchementExcentree,
  DonneesSilo,
  ValeursExcentrees,
  ZonesExcentrees,
} from '../model/types';
import type { ProfilSilos } from '../norms/profil';

/** Nombre a la francaise, virgule decimale, nombre fixe de decimales. */
function nombreFr(valeur: number, decimales: number): string {
  return valeur.toFixed(decimales).replace('.', ',');
}

/**
 * Conditions de declenchement de la vidange a grand excentrement (5.2.4.1(2),
 * 5.3.4). Traitee pour les silos circulaires seulement ; un silo rectangulaire
 * rend `declenche: false` avec son motif.
 *
 * parEo = e_o > excentrementGrand d_c ; parEf = e_f > excentrementGrand d_c
 * avec hc/dc > elancementExcentrementRemplissage. Les inegalites sont strictes.
 * La classe de calcul n'intervient pas ici : en v1, procedures vaut 2 ou 3.
 */
export function declenchementExcentree(
  d: DonneesSilo,
  cl: Classement,
  p: ProfilSilos,
): DeclenchementExcentree {
  if (d.silo.forme !== 'circulaire') {
    return {
      declenche: false,
      parEo: false,
      parEf: false,
      motif: 'Vidange à grand excentrement traitée pour les silos circulaires seulement (5.2.4).',
    };
  }

  const { d_c } = cl.geometrie;
  const { e_f, e_o } = d.exploitation;
  const seuil = p.valeurs.excentrementGrand.valeur;
  const limite = seuil * d_c;
  const seuilElancement = p.valeurs.elancementExcentrementRemplissage.valeur;

  const eoDepasse = e_o > limite;
  const efDepasse = e_f > limite;
  const elanceSuffisant = cl.hc_dc > seuilElancement;
  const parEo = eoDepasse;
  const parEf = efDepasse && elanceSuffisant;
  const declenche = parEo || parEf;

  // 5.2.4.1 pour un silo elance, 5.3.4 pour un silo intermediaire ou peu elance.
  const clause = cl.elancement === 'elance' ? '5.2.4.1(2)' : '5.3.4';
  const seuilFr = nombreFr(seuil, 2);
  const limiteFr = nombreFr(limite, 2);
  const eoFr = nombreFr(e_o, 2);
  const efFr = nombreFr(e_f, 2);
  const hcDcFr = nombreFr(cl.hc_dc, 2);

  let motif: string;
  if (declenche) {
    const causes: string[] = [];
    if (parEo) {
      causes.push(`e_o = ${eoFr} m > ${seuilFr} d_c = ${limiteFr} m`);
    }
    if (parEf) {
      causes.push(
        `e_f = ${efFr} m > ${seuilFr} d_c = ${limiteFr} m avec hc/dc = ${hcDcFr} > ` +
          `${nombreFr(seuilElancement, 1)}`,
      );
    }
    motif = `Vidange à grand excentrement déclenchée par ${causes.join(' et ')} (EN 1991-4, ${clause}).`;
  } else {
    const raisons: string[] = [];
    if (!parEo) {
      raisons.push(`e_o = ${eoFr} m ne dépasse pas ${seuilFr} d_c = ${limiteFr} m`);
    }
    if (!parEf) {
      if (!efDepasse) {
        raisons.push(`e_f = ${efFr} m ne dépasse pas ${seuilFr} d_c = ${limiteFr} m`);
      } else {
        raisons.push(
          `hc/dc = ${hcDcFr} n'est pas supérieur à ${nombreFr(seuilElancement, 1)} ` +
            `malgré e_f = ${efFr} m > ${seuilFr} d_c = ${limiteFr} m`,
        );
      }
    }
    motif = `Vidange à grand excentrement non déclenchée : ${raisons.join(' ; ')} (EN 1991-4, ${clause}).`;
  }

  return { declenche, parEo, parEf, motif };
}

/**
 * Zones en theta de la vidange excentree (5.2.4.2) : ecoulement, contrainte
 * elevee et materiau immobile. Squelette de la tache T5.2, remplace ensuite.
 */
export function zonesExcentrees(_d: DonneesSilo, _cl: Classement, _p: ProfilSilos): ZonesExcentrees {
  throw new Error('zonesExcentrees : non implemente (tache T5.2 du lot 5).');
}

/**
 * Valeurs de la vidange excentree a la profondeur z, combinaison X. Squelette
 * de la tache T5.2, remplace ensuite.
 */
export function valeursExcentrees(
  _z: number,
  _d: DonneesSilo,
  _cl: Classement,
  _p: ProfilSilos,
): ValeursExcentrees {
  throw new Error('valeursExcentrees : non implemente (tache T5.2 du lot 5).');
}

/**
 * Pressions de la vidange excentree pour un angle theta donne. Squelette de la
 * tache T5.2, remplace ensuite.
 */
export function pressionsEnTheta(
  _v: ValeursExcentrees,
  _zones: ZonesExcentrees,
  _theta_deg: number,
): { p_h: number; p_w: number } {
  throw new Error('pressionsEnTheta : non implemente (tache T5.2 du lot 5).');
}
