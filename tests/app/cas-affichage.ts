// Jeu de cas commun aux tests d'affichage du lot 9. Fichier de test : ne pas modifier.
import { noteDeCalculHtml } from 'aedificium-ui';
import { calculer, en1991_4Recommande } from '../../src/index';
import type { DonneesSilo, IdCas, ResultatSilo } from '../../src/model/types';
import { dessinElevation, dessinPlan, dessinProfils, dessinTremie } from '../../app/src/dessins';
import { STYLES_DESSIN } from '../../app/src/export';
import { noteDuCalcul } from '../../app/src/note';
import { blocsSynthese, lignesCas, lignesPointsOuverts, rendreBlocs, rendreTableau } from '../../app/src/vue';
import { v1, v2, v3, v4, v5, v6 } from '../fixtures';

const P = en1991_4Recommande();

function exploitation(d: DonneesSilo, e: Partial<DonneesSilo['exploitation']>): DonneesSilo {
  return { ...d, exploitation: { ...d.exploitation, ...e } };
}

function silo(d: DonneesSilo, s: Partial<DonneesSilo['silo']>): DonneesSilo {
  return { ...d, silo: { ...d.silo, ...s } as DonneesSilo['silo'] };
}

/** Donnees qui parcourent les branches du noyau : cas calcules, non applicables, hors perimetre. */
export function donneesDAffichage(): [string, DonneesSilo][] {
  return [
    ['V1', v1()],
    ['V2', v2()],
    ['V3', v3()],
    ['V4', v4()],
    ['V5', v5()],
    ['V6', v6()],
    ['V1 cheminee', exploitation(v1(), { ecoulementEnCheminee: true })],
    ['V1 vidange par le haut', exploitation(v1(), { vidangeParLeHaut: true })],
    ['V1 non cohesif', { ...v1(), parois: { ...v1().parois, faiblementCohesif: false } }],
    ['V2 classe 3', exploitation(v2(), { classeImposee: 3 })],
    ['V5 classe 3 remplissage excentre (V8)', exploitation(v5(), { classeImposee: 3, e_t: 4 })],
    ['V2 mince boulonne', exploitation(silo(v2(), { t: 0.02 }), { assemblage: 'boulonne' })],
    ['V2 mince soude', exploitation(silo(v2(), { t: 0.02 }), { assemblage: 'soude' })],
    ['V3 majoration', exploitation(v3(), { methodeLocalisee: 'majoration-uniforme', formeMaintenueEnTeteEtEnPied: true })],
    ['V4 par e_f', exploitation(v4(), { e_f: 2.5 })],
    ['V1 pyramide', silo(v1(), { fond: 'pyramidale-rectangulaire', beta: 30 })],
    ['V1 biseau', silo(v1(), { fond: 'biseau', beta: 30 })],
    ['tremie peu elancee (P6)', silo(v6(), { hc: 3 })],
    ['hc nul', silo(v1(), { hc: 0 })],
  ];
}

/** Resultat du calcul, ou message de l'erreur levee (affiche tel quel). */
export function essai(d: DonneesSilo): ResultatSilo | Error {
  try {
    return calculer(d, P);
  } catch (e) {
    return e instanceof Error ? e : new Error(String(e));
  }
}

/** Les cas du resultat : cinq, ou huit en classe 3 avec les canaux d'ecoulement (lot 11). */
const ids = (r: ResultatSilo): IdCas[] => r.cas.map((c) => c.id);

/** Tout ce que l'ecran montre pour un resultat, en HTML. */
export function ecran(r: ResultatSilo): string[] {
  const morceaux = [
    rendreBlocs(blocsSynthese(r)),
    rendreTableau(lignesCas(r), ['a', 'b', 'c', 'd']),
    rendreTableau(lignesPointsOuverts(r), ['a', 'b', 'c']),
    dessinPlan(r),
    ...ids(r).map((id) => dessinElevation(r, id, true)),
    ...(['p_h', 'p_w', 'p_v', 'n_zSk'] as const).map((g) => dessinProfils(r, g, ids(r))),
  ];
  const t = dessinTremie(r);
  if (t !== null) morceaux.push(t);
  return morceaux;
}

export function note(r: ResultatSilo): string {
  return noteDeCalculHtml(noteDuCalcul(r, { projet: 'Essai', element: 'Silo', date: '2026-11-10' }), STYLES_DESSIN);
}
