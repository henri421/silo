/**
 * Bandes de chargement pour le modele aux elements finis (SPEC §8.2,
 * EN 1991-4:2006).
 *
 * Une bande couvre [z_haut ; z_bas] depuis la surface equivalente, avec z
 * positif vers le bas. Les bornes sont k dz tant que k dz < hc, puis hc : la
 * derniere bande est plus courte quand hc n'est pas multiple de dz. Chaque
 * bande porte les pressions a ses deux bornes, evaluees directement en z, et
 * la valeur constante retenue, celle du bas (la plus forte en pratique). Les
 * cotes Z suivent le repere du modele : Z = Z_transition + hc - z.
 *
 * `controleBandes` compare la force horizontale par metre de perimetre obtenue
 * par la somme des trapezes a une integration de Simpson composite de
 * p_h_total sur [0 ; hc].
 *
 * Unites : longueurs en m, pressions en kPa (kN/m2), forces lineiques en kN/m.
 */

import type { Bande, ControleBandes, IdCas } from '../model/types';

/** Deux bornes plus proches que cette valeur sont confondues (m). */
const TOLERANCE = 1e-9;

/** Nombre d'intervalles de Simpson : pair et au moins egal a 2 000. */
const INTERVALLES_SIMPSON = 2000;

/**
 * Bornes z des bandes (m) : k dz tant que k dz < hc, puis hc. Une borne a
 * moins de 1e-9 de hc est confondue avec hc. Leve une erreur si hc ou dz n'est
 * pas un nombre strictement positif.
 */
export function bornesBandes(hc: number, dz: number): number[] {
  if (!Number.isFinite(hc) || hc <= 0) {
    throw new Error(`La hauteur de paroi hc doit etre un nombre strictement positif (m) : ${hc}.`);
  }
  if (!Number.isFinite(dz) || dz <= 0) {
    throw new Error(`La hauteur de bande dz doit etre un nombre strictement positif (m) : ${dz}.`);
  }
  const bornes: number[] = [];
  let k = 0;
  while (k * dz < hc - TOLERANCE) {
    bornes.push(k * dz);
    k++;
  }
  bornes.push(hc);
  return bornes;
}

/**
 * Bandes de chargement d'un cas de paroi verticale. `f` rend p_h et p_w a une
 * profondeur z ; les valeurs des deux bornes sont evaluees directement, jamais
 * interpolees. Les bandes sont numerotees a partir de 1, du haut vers le bas.
 */
export function bandes(
  cas: IdCas,
  f: (z: number) => { p_h: number; p_w: number },
  hc: number,
  dz: number,
  Z_transition: number,
): Bande[] {
  const bornes = bornesBandes(hc, dz);
  const resultat: Bande[] = [];
  for (let i = 0; i < bornes.length - 1; i++) {
    const z_haut = bornes[i];
    const z_bas = bornes[i + 1];
    const haut = f(z_haut);
    const bas = f(z_bas);
    resultat.push({
      cas,
      numero: i + 1,
      z_haut,
      z_bas,
      Z_haut: Z_transition + hc - z_haut,
      Z_bas: Z_transition + hc - z_bas,
      p_h_haut: haut.p_h,
      p_h_bas: bas.p_h,
      // La valeur constante retenue est celle du bas de la bande.
      p_h_constant: bas.p_h,
      p_w_haut: haut.p_w,
      p_w_bas: bas.p_w,
      p_w_constant: bas.p_w,
    });
  }
  return resultat;
}

/**
 * Controle des bandes d'un cas. `sommeTrapezes` est la force horizontale par
 * metre de perimetre obtenue par la somme des trapezes de p_h_total ;
 * `integrale` est la meme force par integration de Simpson composite sur
 * [0 ; hc] avec 2 000 intervalles (nombre pair) ; `ecartRelatif` vaut
 * sommeTrapezes / integrale - 1, et 0 si l'integrale est nulle.
 */
export function controleBandes(
  cas: IdCas,
  b: Bande[],
  f_h: (z: number) => number,
  hc: number,
): ControleBandes {
  let sommeTrapezes = 0;
  for (const bande of b) {
    sommeTrapezes += ((bande.p_h_haut + bande.p_h_bas) / 2) * (bande.z_bas - bande.z_haut);
  }

  // Simpson composite : h/3 [f(0) + f(hc) + 4 somme impaire + 2 somme paire].
  const n = INTERVALLES_SIMPSON;
  const h = hc / n;
  let somme = f_h(0) + f_h(hc);
  for (let i = 1; i < n; i++) {
    somme += (i % 2 === 1 ? 4 : 2) * f_h(i * h);
  }
  const integrale = (h / 3) * somme;

  const ecartRelatif = integrale === 0 ? 0 : sommeTrapezes / integrale - 1;
  return { cas, sommeTrapezes, integrale, ecartRelatif };
}
