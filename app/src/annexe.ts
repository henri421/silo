/**
 * Annexe nationale (lot E, audit R4) : profil de calcul selon l'annexe choisie et
 * les coefficients saisis. Module PUR.
 *
 * Le noyau ne connait aucune annexe : le profil luxembourgeois est construit ici a
 * partir du profil recommande (`en1991_4Recommande`) et de la table commune `AN_LU`
 * d'aedificium-ui. Chaque coefficient est prerempli par l'annexe et reste modifiable ;
 * une valeur changee est marquee « valeur imposee par l'utilisateur ».
 *
 * Tant que les annexes ILNAS ne sont pas lues, aucune valeur luxembourgeoise n'est
 * codee ici : toutes sont presumees egales aux valeurs recommandees (`valeurLu`).
 */

import { nombreAffiche, valeurLu, type AnnexeNationale } from 'aedificium-ui';
import { en1991_4Recommande } from '../../src/index';
import type { ProfilSilos } from '../../src/index';

/** Partie d'Eurocode du profil, telle qu'elle s'ecrit dans les sources d'annexe. */
export const PARTIE = 'EN 1991-4';

/** Un coefficient du profil : la cle de `ProfilSilos.valeurs`. */
export type CleCoef = keyof ProfilSilos['valeurs'];

/** Valeurs de tous les coefficients, dans l'ordre de `COEFS`. */
export type Coefs = Record<CleCoef, number>;

/** Les dix-neuf coefficients du profil, dans l'ordre de saisie et de la note. */
export const COEFS: readonly CleCoef[] = [
  'capaciteClasse1',
  'capaciteClasse3',
  'capaciteExcentrement',
  'excentrementClasse3',
  'C_h_elance',
  'C_w_elance',
  'C_h_pente',
  'C_w_pente',
  'b_tremie',
  'C_b',
  'C_b_majore',
  'theta_c',
  'excentrementGrand',
  'elancementExcentrementRemplissage',
  'minceurParoi',
  'excentrementPeuElance',
  'k1_canal',
  'k2_canal',
  'k3_canal',
];

/** Symbole affiche de chaque coefficient, sans mise en forme. */
export const SYMBOLES: Record<CleCoef, string> = {
  capaciteClasse1: 'C_1',
  capaciteClasse3: 'C_3',
  capaciteExcentrement: 'C_e',
  excentrementClasse3: 'e/d_c',
  C_h_elance: 'C_h',
  C_w_elance: 'C_w',
  C_h_pente: 'C_h pente',
  C_w_pente: 'C_w pente',
  b_tremie: 'b',
  C_b: 'C_b',
  C_b_majore: 'C_b*',
  theta_c: 'θ_c',
  excentrementGrand: 'e/d_c grand',
  elancementExcentrementRemplissage: 'h_c/d_c',
  minceurParoi: 'd_c/t',
  excentrementPeuElance: 'e_o/d_c',
  k1_canal: 'k_1',
  k2_canal: 'k_2',
  k3_canal: 'k_3',
};

/**
 * Clause de chaque coefficient : la source recommandee sans son en-tete « EN 1991-4:2006, ».
 * Repli : la source entiere, si son en-tete n'est pas celui attendu.
 */
export function clauseDe(source: string): string {
  const sansEntete = source.replace(/^EN 1991-4:2006,\s*/, '');
  return sansEntete.trim() === '' ? source : sansEntete;
}

/**
 * Profil luxembourgeois : chaque valeur sourcee du profil recommande passe par
 * `valeurLu`, donc porte la source ILNAS-AN-LU:2020 (valeur presumee retenue, non verifiee).
 */
export function en1991_4Lu(): ProfilSilos {
  const rec = en1991_4Recommande();
  const valeurs = {} as ProfilSilos['valeurs'];
  for (const cle of COEFS) {
    const recommandee = rec.valeurs[cle];
    valeurs[cle] = valeurLu(PARTIE, cle, recommandee, clauseDe(recommandee.source));
  }
  return {
    ...rec,
    nom: 'Luxembourg, EN 1991-4 (AN-LU:2020)',
    date: '2026-11-18',
    perimetre:
      'Annexe nationale luxembourgeoise : valeurs présumées égales aux valeurs recommandées, ' +
      "sauf écarts connus de la table AN_LU d'aedificium-ui. Annexe ILNAS non relue.",
    valeurs,
  };
}

/** Profil de l'annexe choisie, sans valeur imposee. */
export function profilDeLAnnexe(a: AnnexeNationale): ProfilSilos {
  return a === 'lu' ? en1991_4Lu() : en1991_4Recommande();
}

/** Valeurs des coefficients d'une annexe, pour preremplir les champs. */
export function coefsDeLAnnexe(a: AnnexeNationale): Coefs {
  const p = profilDeLAnnexe(a);
  return Object.fromEntries(COEFS.map((k) => [k, p.valeurs[k].valeur])) as Coefs;
}

/**
 * Profil de calcul : celui de l'annexe, et pour chaque coefficient change par
 * l'utilisateur, une source « valeur imposee par l'utilisateur » qui rappelle la
 * valeur de l'annexe. Une valeur inchangee garde sa source d'annexe.
 */
export function profilDeCalcul(a: AnnexeNationale, coefs: Coefs): ProfilSilos {
  const base = profilDeLAnnexe(a);
  const valeurs = { ...base.valeurs };
  for (const cle of COEFS) {
    const x = coefs[cle];
    const b = base.valeurs[cle];
    if (x !== b.valeur) {
      valeurs[cle] = {
        valeur: x,
        source: `valeur imposée par l’utilisateur (annexe : ${nombreAffiche(b.valeur, 4)} ; ${b.source})`,
      };
    }
  }
  return { ...base, valeurs };
}
