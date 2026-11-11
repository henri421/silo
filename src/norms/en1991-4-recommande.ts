/**
 * Profil par defaut : valeurs RECOMMANDEES de l'EN 1991-4:2006, sans annexe
 * nationale. Ce n'est le profil d'aucun pays.
 *
 * Chaque valeur porte sa source : norme, tableau, equation ou clause. Une
 * source vide bloque le calcul (`verifierProfil`).
 *
 * Unites : capacites en t, excentrements relatifs sans dimension, angles en
 * degres, coefficients sans dimension.
 */

import type { ProfilSilos } from './profil';

const EN = 'EN 1991-4:2006, ';

export function en1991_4Recommande(): ProfilSilos {
  return {
    nom: 'EN 1991-4, valeurs recommandées',
    date: '2026-11-10',
    perimetre:
      "Valeurs recommandées de l'EN 1991-4:2006, sans annexe nationale : seuils de classe, " +
      "coefficients de vidange, coefficient de trémie et seuils d'excentrement.",
    valeurs: {
      capaciteClasse1: { valeur: 100, source: `${EN}tableau 2.1` },
      capaciteClasse3: { valeur: 10000, source: `${EN}tableau 2.1` },
      capaciteExcentrement: { valeur: 1000, source: `${EN}tableau 2.1` },
      excentrementClasse3: { valeur: 0.25, source: `${EN}tableau 2.1` },
      C_h_elance: { valeur: 1.15, source: `${EN}éq. 5.21` },
      C_w_elance: { valeur: 1.1, source: `${EN}éq. 5.22` },
      C_h_pente: { valeur: 0.15, source: `${EN}éq. 5.85` },
      C_w_pente: { valeur: 0.1, source: `${EN}éq. 5.86` },
      b_tremie: { valeur: 0.2, source: `${EN}éq. 6.17` },
      C_b: { valeur: 1.0, source: `${EN}6.1.2(4)` },
      C_b_majore: { valeur: 1.2, source: `${EN}6.1.2(5) et (6)` },
      theta_c: { valeur: 35, source: `${EN}5.2.4.2` },
      excentrementGrand: { valeur: 0.25, source: `${EN}5.2.4.1(2)` },
      elancementExcentrementRemplissage: { valeur: 4.0, source: `${EN}5.2.4.1(2)` },
      minceurParoi: { valeur: 200, source: `${EN}5.2.1.4(1)` },
      excentrementPeuElance: { valeur: 0.1, source: `${EN}5.3.2.2(4)` },
      k1_canal: { valeur: 0.25, source: `${EN}5.52` },
      k2_canal: { valeur: 0.4, source: `${EN}5.53` },
      k3_canal: { valeur: 0.6, source: `${EN}5.54` },
    },
  };
}
