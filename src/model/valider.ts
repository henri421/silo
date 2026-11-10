/**
 * Validation des donnees d'entree d'un silo (SPEC §2 et §11).
 *
 * Unites : longueurs en m, angles en degres, poids volumique en kN/m3.
 *
 * Chaque erreur nomme la grandeur fautive, son unite et, s'il y a lieu, la
 * clause. Les messages sont en francais sans accents, comme les identifiants.
 */

import type { CategorieParoi, DonneesSilo, Materiau, Silo } from './types';

const CATEGORIES: CategorieParoi[] = ['D1', 'D2', 'D3'];

/** Nombre fini et strictement positif, sinon erreur nommant la grandeur. */
function exigerPositif(valeur: number, nom: string, unite: string): void {
  if (!Number.isFinite(valeur) || valeur <= 0) {
    throw new Error(`${nom} doit etre un nombre strictement positif (${unite}).`);
  }
}

/** Angle strictement compris entre 0 et 90 degres, sinon erreur nommant la grandeur. */
function exigerAngle(valeur: number, nom: string): void {
  if (!Number.isFinite(valeur) || valeur <= 0 || valeur >= 90) {
    throw new Error(`${nom} doit etre un nombre strictement compris entre 0 et 90 (deg).`);
  }
}

/** Nombre fini au moins egal a 1, sinon erreur nommant la grandeur. */
function exigerAuMoinsUn(valeur: number, nom: string): void {
  if (!Number.isFinite(valeur) || valeur < 1) {
    throw new Error(`${nom} doit etre un nombre au moins egal a 1.`);
  }
}

/** Nombre a la francaise, deux decimales, sans zeros de fin. */
function nombreFr(valeur: number): string {
  return valeur.toFixed(2).replace('.', ',').replace(/,?0+$/, '') || '0';
}

/** Geometrie du silo : dimensions positives, et dimensions de tremie coherentes avec la forme. */
function validerSilo(silo: Silo): void {
  if (silo.forme === 'circulaire') {
    exigerPositif(silo.d as number, 'Le diametre interieur d', 'm');
    exigerPositif(silo.t as number, "L epaisseur de paroi t", 'm');
  } else {
    exigerPositif(silo.a as number, 'Le grand cote a', 'm');
    exigerPositif(silo.b as number, 'Le petit cote b', 'm');
    if ((silo.a as number) < (silo.b as number)) {
      throw new Error('Le silo rectangulaire exige a >= b (m).');
    }
  }
  exigerPositif(silo.hc, 'La hauteur de paroi verticale hc', 'm');

  if (silo.fond === 'plat') return;
  if (silo.fond === 'conique' && silo.forme !== 'circulaire') {
    throw new Error('Une tremie conique exige un silo circulaire.');
  }
  if (silo.fond !== 'conique' && silo.forme !== 'rectangulaire') {
    throw new Error('Une tremie pyramidale ou en biseau exige un silo rectangulaire.');
  }
  if (silo.fond === 'pyramidale-carree' && silo.a !== silo.b) {
    throw new Error('Une tremie pyramidale carree exige a = b (m).');
  }
  exigerAngle(silo.beta as number, "L angle de tremie beta");
}

/** Excentrements : positifs ou nuls, et contenus dans le rayon interieur (figure 1.1b). */
function validerExploitation(d: DonneesSilo): void {
  const { silo, exploitation } = d;
  const demi = silo.forme === 'circulaire' ? (silo.d as number) / 2 : (silo.a as number) / 2;
  const nomRayon = silo.forme === 'circulaire' ? 'd/2' : 'a/2';
  const limite = `${nomRayon} = ${nombreFr(demi)} m`;

  const verifier = (valeur: number, nom: string): void => {
    if (!Number.isFinite(valeur) || valeur < 0 || valeur > demi) {
      throw new Error(`L excentrement ${nom} doit etre un nombre positif ou nul (m) au plus egal a ${limite}.`);
    }
  };
  verifier(exploitation.e_f, 'e_f');
  if (exploitation.e_t !== undefined) verifier(exploitation.e_t, 'e_t');
  verifier(exploitation.e_o, 'e_o');
}

/** Materiau : grandeurs positives, angles entre 0 et 90 deg, coefficients a au moins egaux a 1. */
function validerMateriau(m: Materiau): void {
  exigerPositif(m.gamma_l, `materiau ${m.id} : gamma_l`, 'kN/m3');
  exigerPositif(m.gamma_u, `materiau ${m.id} : gamma_u`, 'kN/m3');
  exigerAngle(m.phi_r, `materiau ${m.id} : phi_r`);
  exigerAngle(m.phi_im, `materiau ${m.id} : phi_im`);
  exigerAuMoinsUn(m.a_phi, `materiau ${m.id} : a_phi`);
  exigerPositif(m.K_m, `materiau ${m.id} : K_m`, 'sans dimension');
  exigerAuMoinsUn(m.a_K, `materiau ${m.id} : a_K`);
  exigerAuMoinsUn(m.a_mu, `materiau ${m.id} : a_mu`);
  exigerPositif(m.C_op, `materiau ${m.id} : C_op`, 'sans dimension');
  for (const categorie of CATEGORIES) {
    exigerPositif(
      (m.mu_m as Record<string, number>)[categorie],
      `materiau ${m.id} : mu_m ${categorie}`,
      'sans dimension',
    );
  }
}

/**
 * Valide les donnees d'un silo avant tout calcul (SPEC §2). Leve une Error
 * nommant la grandeur fautive et son unite ; ne rend rien.
 */
export function validerDonnees(d: DonneesSilo): void {
  validerSilo(d.silo);
  validerExploitation(d);
  validerMateriau(d.materiau);

  exigerPositif(d.discretisation.dz, 'La hauteur des bandes dz', 'm');
  const points = d.discretisation.pointsProfil;
  if (!Number.isInteger(points) || points < 101) {
    throw new Error('Le nombre de points des profils pointsProfil doit etre un entier au moins egal a 101.');
  }
}
