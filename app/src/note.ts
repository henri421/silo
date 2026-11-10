/**
 * Note de calcul HTML imprimable (SPEC §8.3).
 *
 * Module PUR : il compose un objet `NoteDeCalcul` pour `noteDeCalculHtml`
 * d'aedificium-ui. Les figures viennent de `dessins.ts`, les blocs de la
 * synthese et les points ouverts de `vue.ts`. Aucun calcul de la norme n'est
 * refait ici.
 *
 * La note s'ouvre sur les hypotheses : norme et profil normatif, mention des
 * valeurs caracteristiques, exclusivite des cas de vidange et choix enveloppe
 * de SPEC §7 (p_h en C1 et p_w en C2 dans le meme cas).
 */

import type { ElementNote, NoteDeCalcul } from 'aedificium-ui';
import type { CasDeCharge, ResultatSilo } from '../../src/index';
import {
  dessinElevation,
  dessinPlan,
  dessinProfils,
  dessinTremie,
} from './dessins';
import { MENTION } from './export';
import { blocsSynthese, lignesCas, lignesPointsOuverts } from './vue';

/** Statut et motif (ou combinaisons) d'un cas, en une phrase affichee. */
function etatDuCas(c: CasDeCharge): string {
  if (c.statut === 'calcule') return `calculé ; ${c.combinaisons}`;
  const statut = c.statut === 'non-applicable' ? 'non applicable' : 'hors périmètre';
  return `${statut} : ${c.motif ?? ''}`;
}

/** Un bloc par cas, avec son statut et son motif. */
function blocDuCas(c: CasDeCharge): ElementNote {
  return {
    type: 'bloc',
    bloc: {
      titre: `${c.id}, ${c.libelle}`,
      lignes: [{ symbole: '', libelle: 'statut', valeur: etatDuCas(c) }],
      note: null,
    },
  };
}

/** Les figures de la note : elevations, profils, plan et tremie. */
function figures(r: ResultatSilo): ElementNote[] {
  const liste: ElementNote[] = [
    {
      type: 'figure',
      svg: dessinElevation(r, 'REMP', false),
      legende: 'Élévation, remplissage (REMP)',
    },
    {
      type: 'figure',
      svg: dessinElevation(r, 'VID', false),
      legende: 'Élévation, vidange (VID)',
    },
    {
      type: 'figure',
      svg: dessinProfils(r, 'p_h', ['REMP', 'VID']),
      legende: 'Profils de p_h, remplissage et vidange superposés',
    },
    {
      type: 'figure',
      svg: dessinProfils(r, 'p_w', ['REMP', 'VID']),
      legende: 'Profils de p_w, remplissage et vidange superposés',
    },
    { type: 'figure', svg: dessinPlan(r), legende: 'Vue en plan' },
  ];
  const tremie = dessinTremie(r);
  if (tremie !== null) {
    liste.push({ type: 'figure', svg: tremie, legende: 'Trémie, p_n et p_t' });
  }
  return liste;
}

/**
 * Note du calcul courant. Le cartouche porte le projet, l'element et la date
 * fournis par la page ; la norme et l'outil sont fixes.
 */
export function noteDuCalcul(
  r: ResultatSilo,
  cartouche: { projet: string; element: string; date: string }
): NoteDeCalcul {
  return {
    cartouche: {
      projet: cartouche.projet,
      element: cartouche.element,
      date: cartouche.date,
      norme: 'EN 1991-4:2006',
      outil: 'silo',
    },
    sections: {
      hypotheses: [
        {
          type: 'texte',
          texte: `Norme appliquée : EN 1991-4:2006. Profil normatif : ${r.profil}.`,
        },
        { type: 'texte', texte: `${MENTION}.` },
        {
          type: 'liste',
          items: [
            'REMP, VID et VID_EXC sont des cas exclusifs les uns des autres : ils ne se cumulent pas dans le modèle aux éléments finis.',
            "Choix enveloppe de SPEC §7 : la pression normale p_h suit la combinaison C1 et le frottement p_w la combinaison C2 dans le même cas de charge.",
          ],
        },
      ],
      charges: [
        ...r.cas.map(blocDuCas),
        {
          type: 'tableau',
          titre: 'Cas de charge, statut et motif',
          entetes: ['Cas', 'Libellé', 'Statut', 'Motif ou combinaisons'],
          lignes: lignesCas(r),
        },
      ],
      calculs: [
        ...blocsSynthese(r).map((bloc): ElementNote => ({ type: 'bloc', bloc })),
        ...figures(r),
        {
          type: 'tableau',
          titre: 'Points ouverts appliqués',
          entetes: ['Point', 'Question', 'Choix appliqué'],
          lignes: lignesPointsOuverts(r),
        },
      ],
    },
    verifications: [],
  };
}
