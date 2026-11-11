/**
 * Grand excentrement de remplissage d'un silo circulaire peu elance ou
 * intermediaire de classe 3 (SPEC §5.5 bis, EN 1991-4:2006, 5.3.3).
 *
 * Quand il est declenche, le remplissage excentre ajoute une force verticale
 * de compression par unite de longueur de circonference, sur toute la
 * circonference, a celle du remplissage symetrique (5.3.3(2), (3) et (6)).
 * Il ne change ni p_h ni p_w.
 *
 * Proprietes : K et mu superieurs (5.3.3(4)), soit la combinaison C2, et
 * gamma = gamma_u. Les equations 5.92 a 5.96 sont lues selon le point ouvert
 * P8 : (e_t / r) est un facteur, phi_r est l'angle de talus, et
 * z_s = z + h_o,e.
 *
 * Unites : longueurs en m, pressions en kPa, efforts lineiques en kN/m,
 * angles en degres dans les donnees et en radians dans les calculs.
 */

import type { Classement, DonneesSilo, RemplissageExcentre } from '../model/types';
import type { ProfilSilos } from '../norms/profil';
import { valeursCaracteristiques } from '../proprietes/caracteristiques';
import { combinaison } from '../proprietes/combinaisons';

/** Conversion degres vers radians et inverse. */
const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

/**
 * Donnees de calcul de 5.92 qui ne figurent pas dans le type public
 * `RemplissageExcentre` : rayon, angle de talus et poids volumique. Elles sont
 * portees par l'objet rendu, sans changer le type public.
 */
type RemplissageComplet = RemplissageExcentre & {
  gamma?: number;
  phi_r?: number;
  r?: number;
};

/** Nombre a la francaise, virgule decimale, nombre fixe de decimales. */
function nombreFr(valeur: number, decimales: number): string {
  return valeur.toFixed(decimales).replace('.', ',');
}

/**
 * Grand excentrement de remplissage (5.3.3). Conditions cumulatives : silo
 * circulaire, classe 3, hc/dc < 2,0, et e_t > 0,25 d_c (e_t vaut e_f s'il
 * n'est pas saisi). Hors declenchement, le motif nomme la condition qui
 * manque et les grandeurs de 5.93 a 5.96 sont nulles.
 */
export function remplissageExcentre(
  d: DonneesSilo,
  cl: Classement,
  p: ProfilSilos,
): RemplissageExcentre {
  const e_t = d.exploitation.e_t ?? d.exploitation.e_f;
  const v = valeursCaracteristiques(d.materiau, d.parois);
  const c2 = combinaison('C2', v, d.materiau);
  const r = cl.geometrie.d_c / 2;
  const vide = (motif: string): RemplissageComplet => ({
    declenche: false,
    motif,
    e_t,
    p_ho: null,
    h_o: null,
    B: null,
    K: null,
    mu: null,
    gamma: c2.gamma,
    phi_r: d.materiau.phi_r,
    r,
  });

  if (d.silo.forme !== 'circulaire') {
    return vide(
      'Grand excentrement de remplissage : méthode de 5.3.3 traitée pour les silos circulaires seulement.',
    );
  }
  if (cl.procedures !== 3) {
    return vide(
      'Grand excentrement de remplissage de 5.3.3 réservé à la classe 3 (2.5(3)) : ' +
        `classe de calcul ${cl.classeDeCalcul}.`,
    );
  }
  const seuilElancement = 2.0;
  if (!(cl.hc_dc < seuilElancement)) {
    return vide(
      'Grand excentrement de remplissage de 5.3.3 non applicable : ' +
        `hc/dc = ${nombreFr(cl.hc_dc, 2)} n'est pas inférieur à ${nombreFr(seuilElancement, 1)} (5.3.3(1)).`,
    );
  }
  const seuilExcentrement = p.valeurs.excentrementGrand.valeur;
  const limite = seuilExcentrement * cl.geometrie.d_c;
  if (!(e_t > limite)) {
    return vide(
      'Grand excentrement de remplissage de 5.3.3 non déclenché : ' +
        `e_t = ${nombreFr(e_t, 2)} m ne dépasse pas ${nombreFr(seuilExcentrement, 2)} d_c = ` +
        `${nombreFr(limite, 2)} m (5.3.3(1)).`,
    );
  }

  // Proprietes de 5.3.3(4) : K et mu superieurs, gamma = gamma_u (C2).
  const K = c2.K;
  const mu = c2.mu;
  const phi = d.materiau.phi_r * RAD;

  // Grandeurs de 5.93 a 5.96.
  const p_ho = (c2.gamma * r) / (2 * mu);
  const rapport = e_t / r;
  const h_o = (r * Math.tan(phi) * (1 - rapport * rapport)) / 3;
  const B = r / (2 * mu * K) - h_o;

  const resultat: RemplissageComplet = {
    declenche: true,
    motif:
      'Grand excentrement de remplissage déclenché (5.3.3) : force verticale additionnelle ' +
      'Δn_zSk sur toute la circonférence (5.92 à 5.96, point ouvert P8).',
    e_t,
    p_ho,
    h_o,
    B,
    K,
    mu,
    gamma: c2.gamma,
    phi_r: d.materiau.phi_r,
    r,
  };
  return resultat;
}

/**
 * Force verticale additionnelle de 5.92 a la profondeur z (kN/m), avec
 * z_s = z + h_o,e et Z = z_s / B (point ouvert P8). Nulle hors declenchement.
 */
export function nzSkAdditionnel(z: number, re: RemplissageExcentre): number {
  if (
    !re.declenche ||
    re.p_ho === null ||
    re.h_o === null ||
    re.B === null ||
    re.K === null ||
    re.mu === null
  ) {
    return 0;
  }
  const complet = re as RemplissageComplet;
  const r = complet.r ?? 2 * re.mu * re.K * (re.B + re.h_o);
  const phi_r =
    complet.phi_r ??
    Math.atan((3 * re.h_o) / (r * (1 - (re.e_t / r) * (re.e_t / r)))) * DEG;
  const phi = phi_r * RAD;
  const z_s = z + re.h_o;
  const Z = z_s / re.B;
  return (
    0.04 * re.p_ho * z_s * Math.tan(phi) * (re.e_t / r) * (6 + 7 * Z - Z * Z)
  );
}
