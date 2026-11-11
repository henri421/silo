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
  ValeursParoi,
  ZonesExcentrees,
} from '../model/types';
import type { ProfilSilos } from '../norms/profil';
import { valeursCaracteristiques } from '../proprietes/caracteristiques';
import { combinaison } from '../proprietes/combinaisons';
import { janssen } from './janssen';
import { janssenModifie } from './janssen-modifie';

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
 * Zones en theta de la vidange excentree, methode simplifiee de la classe 2
 * (5.2.4.2) : ecoulement sur |theta| <= theta_c, contrainte elevee a 2 p_hf
 * sur l'arc theta_c suivant (P4), materiau immobile ailleurs.
 *
 * Leve une erreur si la vidange excentree n'est pas declenchee, et une erreur
 * explicite nommant 5.2.4.3 pour une classe 3, dont la methode est hors
 * perimetre en v1 : les cas symetriques restent rendus.
 */
export function zonesExcentrees(d: DonneesSilo, cl: Classement, p: ProfilSilos): ZonesExcentrees {
  const det = declenchementExcentree(d, cl, p);
  if (!det.declenche) {
    throw new Error(`Vidange excentree non declenchee : ${det.motif}`);
  }
  if (cl.procedures === 3) {
    throw new Error(
      'Methode simplifiee de 5.2.4.2 reservee a la classe 2 (5.2.4.1(5)) : en classe 3, voir les cas VID_EXC_1 a VID_EXC_3 (5.2.4.3).',
    );
  }

  const theta_c = p.valeurs.theta_c.valeur;
  const thetaFr = nombreFr(theta_c, 0);
  return {
    theta_c,
    zones: [
      { nom: 'ecoulement', thetaMin: 0, thetaMax: theta_c },
      { nom: 'contrainte-elevee', thetaMin: theta_c, thetaMax: 2 * theta_c },
      { nom: 'immobile', thetaMin: 2 * theta_c, thetaMax: 180 },
    ],
    pointsOuverts: ['P1', 'P4'],
    motif:
      `Méthode simplifiée de 5.2.4.2, classe 2 : écoulement sur |theta| <= ${thetaFr}°, ` +
      `contrainte élevée à 2 p_hf sur un arc de ${thetaFr}° de chaque côté de l'écoulement ` +
      '(P4 : étendue à confirmer), matériau immobile au-delà. ' +
      'K supérieur (P1), mu inférieur et phi_i supérieur (5.2.4.1(4)).',
  };
}

/**
 * Valeurs symetriques du remplissage a la profondeur z en combinaison X :
 * Janssen pour un silo elance, Janssen modifie sinon. La combinaison X
 * applique mu inferieur, phi_i superieur (5.2.4.1(4)) et K superieur (P1).
 *
 * Fonction auxiliaire partagee par la vidange excentree de classe 2 et par les
 * canaux d'ecoulement de classe 3. Elle ne verifie ni le declenchement ni la
 * classe : c'est l'affaire de ses appelants.
 */
export function valeursSymetriquesExcentree(
  z: number,
  d: DonneesSilo,
  cl: Classement,
): ValeursParoi {
  const v = valeursCaracteristiques(d.materiau, d.parois);
  const cx = combinaison('X', v, d.materiau);
  return cl.elancement === 'elance'
    ? janssen(z, cl.geometrie, cx)
    : janssenModifie(z, cl.geometrie, cx, cl.h_o, d.materiau.phi_r);
}

/**
 * Valeurs de la vidange excentree a la profondeur z, combinaison X : materiau
 * immobile p_hse et p_wse (Janssen ou Janssen modifie selon l'elancement),
 * contrainte elevee p_hae = 2 p_hse et p_wae = 2 p_wse, ecoulement nul.
 *
 * Leve les memes erreurs que `zonesExcentrees`, et une erreur nommant hc si
 * z depasse la hauteur de paroi verticale.
 */
export function valeursExcentrees(
  z: number,
  d: DonneesSilo,
  cl: Classement,
  p: ProfilSilos,
): ValeursExcentrees {
  // Memes conditions d'application que les zones (declenchement, classe 3).
  zonesExcentrees(d, cl, p);
  if (z > d.silo.hc) {
    throw new Error(
      `La profondeur z = ${z} m depasse la hauteur de paroi verticale hc = ${d.silo.hc} m.`,
    );
  }

  const base = valeursSymetriquesExcentree(z, d, cl);

  const p_hse = base.p_h;
  const p_wse = base.p_w;
  return {
    z,
    combinaison: 'X',
    p_hce: 0,
    p_wce: 0,
    p_hse,
    p_wse,
    p_hae: 2 * p_hse,
    p_wae: 2 * p_wse,
  };
}

/**
 * Pressions de la vidange excentree a l'angle theta (deg), mesure depuis l'axe
 * de l'excentrement, cote orifice. theta est ramene dans ]-180 ; 180] :
 * |theta| <= theta_c : ecoulement (nul) ; jusqu'a 2 theta_c : contrainte
 * elevee ; sinon materiau immobile (5.2.4.2, P4).
 */
export function pressionsEnTheta(
  v: ValeursExcentrees,
  zones: ZonesExcentrees,
  theta_deg: number,
): { p_h: number; p_w: number } {
  if (!Number.isFinite(theta_deg)) {
    throw new Error(`L angle theta doit etre un nombre fini (deg) : ${theta_deg}.`);
  }
  let theta = theta_deg % 360;
  if (theta <= -180) theta += 360;
  if (theta > 180) theta -= 360;
  const absTheta = Math.abs(theta);

  if (absTheta <= zones.theta_c) return { p_h: v.p_hce, p_w: v.p_wce };
  if (absTheta <= 2 * zones.theta_c) return { p_h: v.p_hae, p_w: v.p_wae };
  return { p_h: v.p_hse, p_w: v.p_wse };
}
