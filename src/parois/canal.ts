/**
 * Canal d'ecoulement de la vidange a grand excentrement en classe 3
 * (SPEC §5.5, EN 1991-4:2006, 5.2.4.3 et 5.3.4).
 *
 * Le rayon du canal vaut r_c = k_i r, avec les valeurs recommandees k_1, k_2
 * et k_3 du profil normatif (5.52 a 5.54). La position du canal, son angle de
 * contact theta_c et l'angle psi sont donnes par 5.55 a 5.62 ; les pressions
 * du canal, du materiau immobile et de la zone voisine par 5.63 a 5.70.
 *
 * La combinaison X applique mu inferieur, phi_i superieur (5.2.4.1(4)) et,
 * choix declare P1, K superieur. La zone de contrainte elevee a 2 p_hf est
 * lue comme un arc theta_c de chaque cote du canal (figure 5.5c, point ouvert
 * P4).
 *
 * Unites : longueurs en m, pressions en kPa (kN/m2), angles en degres dans les
 * resultats et en radians dans les calculs. L'outil CONSTATE : ces valeurs sont
 * caracteristiques, les coefficients partiels de l'EN 1990 restent a appliquer.
 */

import type {
  CanalEcoulement,
  Classement,
  DonneesSilo,
  ValeursExcentrees,
  ZonesExcentrees,
} from '../model/types';
import type { ProfilSilos } from '../norms/profil';
import { valeursCaracteristiques } from '../proprietes/caracteristiques';
import { combinaison } from '../proprietes/combinaisons';
import { declenchementExcentree, valeursSymetriquesExcentree } from './excentree';

/** Conversion radians vers degres. */
const DEG = 180 / Math.PI;

/** Tolerance du controle de concordance des deux expressions de psi (5.61). */
const TOLERANCE = 1e-9;

/** Nombre a la francaise, virgule decimale, nombre fixe de decimales. */
function nombreFr(valeur: number, decimales: number): string {
  return valeur.toFixed(decimales).replace('.', ',');
}

/**
 * Geometrie et pressions de reference du canal d'ecoulement d'indice i
 * (1, 2 ou 3), pour un silo circulaire de classe 3 dont la vidange excentree
 * est declenchee (5.52 a 5.66).
 *
 * Erreurs, dans cet ordre : silo non circulaire ; classe autre que 3 ; vidange
 * excentree non declenchee ; canal qui ne touche pas la paroi ou dont
 * l'angle de contact n'existe pas (geometrie hors perimetre, 5.2.4.3).
 */
export function canalEcoulement(
  d: DonneesSilo,
  cl: Classement,
  p: ProfilSilos,
  i: 1 | 2 | 3,
): CanalEcoulement {
  if (d.silo.forme !== 'circulaire') {
    throw new Error(
      "La methode du canal d ecoulement ne s applique qu aux silos circulaires (EN 1991-4, 5.2.4.3).",
    );
  }
  if (cl.procedures !== 3) {
    throw new Error(
      'La methode du canal d ecoulement de 5.2.4.3 est reservee a la classe 3 (5.2.4.1(5)).',
    );
  }
  const det = declenchementExcentree(d, cl, p);
  if (!det.declenche) {
    throw new Error(`Vidange excentree non declenchee : ${det.motif}`);
  }
  if (i !== 1 && i !== 2 && i !== 3) {
    throw new Error(`L indice de canal i doit valoir 1, 2 ou 3 : ${i}.`);
  }

  const v = valeursCaracteristiques(d.materiau, d.parois);
  const cx = combinaison('X', v, d.materiau);
  const mu = cx.mu;
  const K = cx.K;
  const phi = (cx.phi_i * Math.PI) / 180;
  const r = cl.geometrie.d_c / 2;

  const cle = i === 1 ? 'k1_canal' : i === 2 ? 'k2_canal' : 'k3_canal';
  const k = p.valeurs[cle].valeur;
  const r_c = k * r;
  const G = r_c / r;

  // Position du canal (5.55 a 5.57) : eta = mu / tan phi_i.
  const eta = mu / Math.tan(phi);
  const e_c = r * (eta * (1 - G) + (1 - eta) * Math.sqrt(1 - G));

  // Contact avec la paroi : e_c + r_c <= r ou |cos theta_c| > 1 (5.58).
  if (e_c + r_c <= r) {
    throw new Error(
      `Canal ${i} (k = ${nombreFr(k, 2)}) sans contact avec la paroi : ` +
        `e_c + r_c = ${nombreFr(e_c + r_c, 4)} m <= r = ${nombreFr(r, 4)} m ` +
        '(EN 1991-4, 5.2.4.3).',
    );
  }
  const cosTheta = (r * r + e_c * e_c - r_c * r_c) / (2 * r * e_c);
  if (Math.abs(cosTheta) > 1) {
    throw new Error(
      `Canal ${i} (k = ${nombreFr(k, 2)}) : cos theta_c = ${nombreFr(cosTheta, 4)} ` +
        "n'est pas dans [-1 ; 1], geometrie hors perimetre (EN 1991-4, 5.2.4.3).",
    );
  }
  const theta_c = Math.acos(cosTheta);

  // Psi par la loi des cosinus, puis controle de 5.61 : sin psi =
  // (r / r_c) sin theta_c. Les deux expressions doivent concorder.
  const cosPsi = (r * r - e_c * e_c - r_c * r_c) / (2 * e_c * r_c);
  if (Math.abs(cosPsi) > 1) {
    throw new Error(
      `Canal ${i} (k = ${nombreFr(k, 2)}) : cos psi = ${nombreFr(cosPsi, 4)} ` +
        "n'est pas dans [-1 ; 1], geometrie hors perimetre (EN 1991-4, 5.2.4.3).",
    );
  }
  const psi = Math.acos(cosPsi);
  const sinAttendu = (r / r_c) * Math.sin(theta_c);
  if (Math.abs(Math.sin(psi) - sinAttendu) > TOLERANCE) {
    throw new Error(
      `Canal ${i} (k = ${nombreFr(k, 2)}) : les deux expressions de psi ne concordent pas ` +
        `(sin psi = ${Math.sin(psi)}, attendu ${sinAttendu}) : EN 1991-4, 5.61.`,
    );
  }

  // Perimetres et aire (5.59, 5.60, 5.62), puis canal (5.63 a 5.66).
  const U_wc = 2 * theta_c * r;
  const U_sc = 2 * r_c * (Math.PI - psi);
  const A_c =
    (Math.PI - psi) * r_c * r_c +
    theta_c * r * r -
    r * r_c * Math.sin(psi - theta_c);
  const z_oc = A_c / (K * (U_wc * mu + U_sc * Math.tan(phi)));
  const p_hco = cx.gamma * K * z_oc;

  return {
    indice: i,
    k,
    r_c,
    G,
    eta,
    e_c,
    theta_c: theta_c * DEG,
    psi: psi * DEG,
    U_wc,
    U_sc,
    A_c,
    z_oc,
    p_hco,
  };
}

/**
 * Valeurs du cas du canal a la profondeur z, combinaison X : canal p_hce et
 * p_wce (5.63, 5.64), materiau immobile p_hse et p_wse (5.67, 5.68), zone
 * voisine p_hae = 2 p_hse - p_hce et p_wae = mu p_hae (5.69, 5.70).
 *
 * Leve une erreur nommant hc si z depasse la hauteur de paroi verticale.
 */
export function valeursCanal(
  z: number,
  d: DonneesSilo,
  cl: Classement,
  _p: ProfilSilos,
  c: CanalEcoulement,
): ValeursExcentrees {
  if (z > d.silo.hc) {
    throw new Error(
      `La profondeur z = ${z} m depasse la hauteur de paroi verticale hc = ${d.silo.hc} m.`,
    );
  }
  const v = valeursCaracteristiques(d.materiau, d.parois);
  const cx = combinaison('X', v, d.materiau);
  const base = valeursSymetriquesExcentree(z, d, cl);

  const p_hce = c.p_hco * (1 - Math.exp(-z / c.z_oc));
  const p_wce = cx.mu * p_hce;
  const p_hse = base.p_h;
  const p_wse = base.p_w;
  const p_hae = 2 * p_hse - p_hce;
  const p_wae = cx.mu * p_hae;

  return {
    z,
    combinaison: 'X',
    p_hce,
    p_wce,
    p_hse,
    p_wse,
    p_hae,
    p_wae,
  };
}

/**
 * Zones en theta du canal, comme pour la methode simplifiee : ecoulement sur
 * |theta| <= theta_c, contrainte elevee a 2 p_hf sur l'arc theta_c suivant
 * (P4), materiau immobile ailleurs (5.2.4.3, figure 5.5c).
 */
export function zonesCanal(c: CanalEcoulement): ZonesExcentrees {
  const thetaFr = nombreFr(c.theta_c, 4);
  return {
    theta_c: c.theta_c,
    zones: [
      { nom: 'ecoulement', thetaMin: 0, thetaMax: c.theta_c },
      { nom: 'contrainte-elevee', thetaMin: c.theta_c, thetaMax: 2 * c.theta_c },
      { nom: 'immobile', thetaMin: 2 * c.theta_c, thetaMax: 180 },
    ],
    pointsOuverts: ['P1', 'P4'],
    motif:
      `Canal d'écoulement de 5.2.4.3, rayon r_c = ${nombreFr(c.r_c, 3)} m ` +
      `(k = ${nombreFr(c.k, 2)}, indice ${c.indice}) : écoulement sur |theta| <= ${thetaFr}°, ` +
      `contrainte élevée à 2 p_hf sur un arc de ${thetaFr}° de chaque côté du canal ` +
      '(P4 : étendue à confirmer), matériau immobile au-delà. ' +
      'K supérieur (P1), mu inférieur et phi_i supérieur (5.2.4.1(4)).',
  };
}
