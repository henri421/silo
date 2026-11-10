/**
 * Geometrie du silo : aires, perimetres, tremie et talus (SPEC §4.1 et §4.5).
 *
 * Unites : longueurs en m, aires en m2, volumes en m3, angles en degres.
 * L'angle de talus naturel phi_r est converti en radians a l'usage.
 */

import type { Geometrie, Silo } from '../model/types';

const DEG = Math.PI / 180;

/** Nombre fini et strictement positif, sinon erreur nommant la grandeur. */
function exigerPositif(valeur: number | undefined, nom: string, unite: string): number {
  if (valeur === undefined || !Number.isFinite(valeur) || valeur <= 0) {
    throw new Error(`${nom} doit etre un nombre strictement positif (${unite}).`);
  }
  return valeur;
}

/** Angle strictement compris entre 0 et 90 degres, sinon erreur nommant la grandeur. */
function exigerAngle(valeur: number | undefined, nom: string): number {
  if (valeur === undefined || !Number.isFinite(valeur) || valeur <= 0 || valeur >= 90) {
    throw new Error(`${nom} doit etre un nombre strictement compris entre 0 et 90 (deg).`);
  }
  return valeur;
}

/**
 * Aire A, perimetre U et dimension caracteristique d_c de la section
 * interieure (SPEC §4.1) : le diametre pour un cercle, le petit cote b pour un
 * rectangle (plus grand cercle inscrit, 1.5). r vaut d_c / 2.
 */
export function grandeursGeometriques(silo: Silo): Geometrie {
  if (silo.forme === 'circulaire') {
    const d = exigerPositif(silo.d, 'Le diametre interieur d', 'm');
    return { A: (Math.PI * d * d) / 4, U: Math.PI * d, d_c: d, r: d / 2 };
  }
  const a = exigerPositif(silo.a, 'Le grand cote a', 'm');
  const b = exigerPositif(silo.b, 'Le petit cote b', 'm');
  return { A: a * b, U: 2 * (a + b), d_c: b, r: b / 2 };
}

/**
 * Hauteur h_h de la tremie jusqu'a la pointe virtuelle (m), ou null pour un
 * fond plat. La pente saisie est la plus forte, ce qui couvre les pyramides
 * rectangulaires (6.1.2(7)) : h_h = (d_c / 2) / tan(beta).
 */
export function hauteurTremie(silo: Silo): number | null {
  if (silo.fond === 'plat') return null;
  const beta = exigerAngle(silo.beta, "L angle de tremie beta");
  return grandeursGeometriques(silo).d_c / 2 / Math.tan(beta * DEG);
}

/**
 * Volume de la tremie (m3) : 0 pour un fond plat, cone pi r2 h / 3, pyramide
 * a b h / 3, biseau a b h / 2 (SPEC §4.3 et §6.3).
 */
export function volumeTremie(silo: Silo): number {
  const h_h = hauteurTremie(silo);
  if (h_h === null) return 0;
  if (silo.forme === 'circulaire') {
    const r = (silo.d as number) / 2;
    return (Math.PI * r * r * h_h) / 3;
  }
  const a = silo.a as number;
  const b = silo.b as number;
  if (silo.fond === 'biseau') return (a * b * h_h) / 2;
  return (a * b * h_h) / 3;
}

/**
 * Talus : profondeur h_o du point de contact le plus haut sous la surface
 * equivalente, et hauteur totale h_tp (SPEC §4.5). Cercle : h_o = r tan(phi_r)
 * / 3 et h_tp = 3 h_o (eq. 5.77). Rectangle : h_o = d_c tan(phi_r) / 4 et
 * h_tp = 2 h_o (eq. 5.78).
 */
export function talus(silo: Silo, phi_r_deg: number): { h_o: number; h_tp: number } {
  const phi = exigerAngle(phi_r_deg, 'L angle de talus naturel phi_r');
  const g = grandeursGeometriques(silo);
  const tangente = Math.tan(phi * DEG);
  if (silo.forme === 'circulaire') {
    const h_o = (g.r * tangente) / 3;
    return { h_o, h_tp: 3 * h_o };
  }
  const h_o = (g.d_c * tangente) / 4;
  return { h_o, h_tp: 2 * h_o };
}
