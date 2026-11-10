/**
 * Classement d'un silo : elancement, classe d'evaluation des actions, paroi,
 * surface equivalente et talus (SPEC §4, EN 1991-4:2006).
 *
 * Unites : longueurs en m, aires en m2, volumes en m3, capacite en t, angles
 * en degres. Le poids volumique gamma_u est en kN/m3 et G = 9,81 m/s2.
 *
 * L'outil CONSTATE : il ne rend qu'un classement et ses motifs, jamais une
 * prescription de structure.
 */

import type { Classe, Classement, DonneesSilo, Elancement } from '../model/types';
import type { ProfilSilos } from '../norms/profil';
import { verifierProfil } from '../norms/profil';
import { validerDonnees } from '../model/valider';
import { grandeursGeometriques, hauteurTremie, talus, volumeTremie } from './geometrie';

/** Acceleration de la pesanteur (m/s2), pour convertir un poids en masse. */
const G = 9.81;

/** Nombre a la francaise, virgule decimale, nombre fixe de decimales. */
function nombreFr(valeur: number, decimales: number): string {
  return valeur.toFixed(decimales).replace('.', ',');
}

/**
 * Classe l'elancement selon 5.1(2). Leve une erreur explicite pour les cas
 * hors perimetre : magasin de stockage avec fond plat (5.4), et silo a tremie
 * de hc/dc inferieur ou egal a 0,4 (point ouvert P6).
 */
function classerElancement(hc_dc: number, donnees: DonneesSilo): Elancement {
  if (hc_dc <= 0.4) {
    const valeur = nombreFr(hc_dc, 2);
    if (donnees.silo.fond === 'plat') {
      throw new Error(`hc/dc = ${valeur} avec fond plat : magasin de stockage, hors perimetre (EN 1991-4, 5.4).`);
    }
    throw new Error(`hc/dc = ${valeur} avec tremie : cas non tranche par 5.1(2), hors perimetre (point ouvert P6).`);
  }
  if (hc_dc <= 1.0) return 'peu-elance';
  if (hc_dc < 2.0) return 'intermediaire';
  return 'elance';
}

/**
 * Verifie les limites de 1.1(3), dans l'ordre d_c, h_b puis h_b/d_c. Leve une
 * erreur explicite si une limite est atteinte ou depassee.
 */
function verifierLimites(d_c: number, h_b: number): void {
  if (d_c >= 60) {
    throw new Error(
      `d_c = ${nombreFr(d_c, 2)} m atteint la limite de 60 m (EN 1991-4, 1.1(3)).`,
    );
  }
  if (h_b >= 100) {
    throw new Error(
      `h_b = ${nombreFr(h_b, 2)} m atteint la limite de 100 m (EN 1991-4, 1.1(3)).`,
    );
  }
  if (h_b / d_c >= 10) {
    throw new Error(
      `h_b/d_c = ${nombreFr(h_b / d_c, 2)} atteint la limite de 10 (EN 1991-4, 1.1(3)).`,
    );
  }
}

/**
 * Classe un silo selon le tableau 2.1, avec les seuils du profil normatif.
 * La capacite vaut gamma_u (A hc + volume de tremie) / G, en tonnes : gamma_u
 * et la tremie comprise sont le choix declare P5. Les comparaisons sont
 * strictes. Rend la classe et ses motifs en francais.
 */
function classeTableau21(
  capacite: number,
  d_c: number,
  elancement: Elancement,
  donnees: DonneesSilo,
  p: ProfilSilos,
): { classeCalculee: Classe; motifsClasse: string[] } {
  const v = p.valeurs;
  const e_o = donnees.exploitation.e_o;
  const e_t = donnees.exploitation.e_t ?? donnees.exploitation.e_f;
  const motifs: string[] = [];
  const cap = `${nombreFr(capacite, 1)} t`;

  if (capacite > v.capaciteClasse3.valeur) {
    motifs.push(
      `Capacité de ${cap} supérieure à ${nombreFr(v.capaciteClasse3.valeur, 0)} t : classe 3 (tableau 2.1).`,
    );
    return { classeCalculee: 3, motifsClasse: motifs };
  }
  if (capacite > v.capaciteExcentrement.valeur && e_o / d_c > v.excentrementClasse3.valeur) {
    motifs.push(
      `Capacité de ${cap} supérieure à ${nombreFr(v.capaciteExcentrement.valeur, 0)} t et ` +
        `e_o/d_c = ${nombreFr(e_o / d_c, 3)} supérieur à ${nombreFr(v.excentrementClasse3.valeur, 2)} : ` +
        'classe 3 (tableau 2.1).',
    );
    return { classeCalculee: 3, motifsClasse: motifs };
  }
  if (
    capacite > v.capaciteExcentrement.valeur &&
    elancement === 'peu-elance' &&
    e_t / d_c > v.excentrementClasse3.valeur
  ) {
    motifs.push(
      `Capacité de ${cap} supérieure à ${nombreFr(v.capaciteExcentrement.valeur, 0)} t, silo peu élancé et ` +
        `e_t/d_c = ${nombreFr(e_t / d_c, 3)} supérieur à ${nombreFr(v.excentrementClasse3.valeur, 2)} : ` +
        'classe 3 (tableau 2.1).',
    );
    return { classeCalculee: 3, motifsClasse: motifs };
  }
  if (capacite < v.capaciteClasse1.valeur) {
    motifs.push(
      `Capacité de ${cap} inférieure à ${nombreFr(v.capaciteClasse1.valeur, 0)} t : classe 1 (tableau 2.1).`,
      'En v1, une classe 1 est calculée avec les procédures de la classe 2 (2.5(3)).',
    );
    return { classeCalculee: 1, motifsClasse: motifs };
  }
  motifs.push(
    `Capacité de ${cap} et excentrements relatifs e_o/d_c = ${nombreFr(e_o / d_c, 3)}, ` +
      `e_t/d_c = ${nombreFr(e_t / d_c, 3)} : aucune condition de classe 3 du tableau 2.1 n'est remplie, classe 2.`,
  );
  return { classeCalculee: 2, motifsClasse: motifs };
}

/**
 * Classe les donnees d'un silo : geometrie, elancement, classe de calcul,
 * paroi, surface equivalente et talus (SPEC §4). Valide d'abord les donnees
 * (`validerDonnees`) et le profil normatif (`verifierProfil`).
 */
export function classer(d: DonneesSilo, p: ProfilSilos): Classement {
  validerDonnees(d);
  verifierProfil(p);

  const geometrie = grandeursGeometriques(d.silo);
  const { d_c } = geometrie;
  const hc_dc = d.silo.hc / d_c;
  const elancement = classerElancement(hc_dc, d);

  const h_h = hauteurTremie(d.silo);
  const volume = volumeTremie(d.silo);
  const h_b = d.silo.hc + (h_h ?? 0);
  verifierLimites(d_c, h_b);

  const capacite = (d.materiau.gamma_u * (geometrie.A * d.silo.hc + volume)) / G;
  const { classeCalculee, motifsClasse } = classeTableau21(capacite, d_c, elancement, d, p);

  const imposee = d.exploitation.classeImposee;
  const classeDeCalcul: Classe = imposee !== undefined && imposee > classeCalculee ? imposee : classeCalculee;
  if (imposee !== undefined && imposee > classeCalculee) {
    motifsClasse.push(
      `Classe imposée ${imposee} : elle relève la classe calculée ${classeCalculee} (2.5(3)).`,
    );
  }
  const procedures: 2 | 3 = classeDeCalcul === 3 ? 3 : 2;

  let paroi: 'mince' | 'epaisse' | null = null;
  if (d.silo.forme === 'circulaire') {
    paroi = d_c / (d.silo.t as number) > p.valeurs.minceurParoi.valeur ? 'mince' : 'epaisse';
  }

  const { h_o, h_tp } = talus(d.silo, d.materiau.phi_r);

  return {
    geometrie,
    hc_dc,
    elancement,
    h_h,
    volumeTremie: volume,
    h_b,
    capacite,
    classeCalculee,
    classeDeCalcul,
    procedures,
    motifsClasse,
    paroi,
    h_o,
    h_tp,
  };
}
