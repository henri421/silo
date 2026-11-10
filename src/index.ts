/**
 * silo — noyau de calcul.
 *
 * Actions des materiaux ensiles sur les parois et les fonds des silos
 * circulaires et rectangulaires, selon l'EN 1991-4:2006 : profils de pression
 * en fonction de la profondeur, graphiques et fichiers CSV pour un modele aux
 * elements finis.
 *
 * Unites du noyau : longueurs en m, poids volumique en kN/m3, pressions en
 * kPa (kN/m2), efforts lineiques en kN/m. Les angles sont saisis en degres et
 * convertis en radians dans le noyau.
 */

export const NORME = 'EN 1991-4:2006';

export * from './model/types';
export * from './norms/profil';
export { validerDonnees } from './model/valider';
export { bibliotheque, materiauParId, materiauxDepuisJson } from './materiaux/bibliotheque';
export { en1991_4Recommande } from './norms/en1991-4-recommande';
export { grandeursGeometriques, hauteurTremie, volumeTremie, talus } from './classement/geometrie';
export { classer } from './classement/classement';
export { valeursCaracteristiques } from './proprietes/caracteristiques';
export { combinaison } from './proprietes/combinaisons';
