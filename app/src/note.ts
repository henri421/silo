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
import { mention } from './export';
import { phrase, textes } from './textes';
import { blocsSynthese, lignesCas, lignesPointsOuverts } from './vue';
import { VERSION_OUTIL } from './version';

/** Statut et motif (ou combinaisons) d'un cas, en une phrase affichee. */
function etatDuCas(c: CasDeCharge): string {
  const t = textes();
  if (c.statut === 'calcule') return t.libelles.casCalcul(phrase(c.combinaisons));
  return t.libelles.casArrete(t.statuts[c.statut], phrase(c.motif ?? ''));
}

/** Un bloc par cas, avec son statut et son motif. */
function blocDuCas(c: CasDeCharge): ElementNote {
  const t = textes();
  return {
    type: 'bloc',
    bloc: {
      titre: `${c.id}, ${t.cas.libelles[c.id]}`,
      lignes: [{ symbole: '', libelle: t.note.statut, valeur: etatDuCas(c) }],
      note: null,
    },
  };
}

/** Les figures de la note : elevations, profils, plan et tremie. */
function figures(r: ResultatSilo): ElementNote[] {
  const t = textes();
  const liste: ElementNote[] = [
    {
      type: 'figure',
      svg: dessinElevation(r, 'REMP', false),
      legende: t.note.legendes.elevationRemp,
    },
    {
      type: 'figure',
      svg: dessinElevation(r, 'VID', false),
      legende: t.note.legendes.elevationVid,
    },
    {
      type: 'figure',
      svg: dessinProfils(r, 'p_h', ['REMP', 'VID']),
      legende: t.note.legendes.profilsPh,
    },
    {
      type: 'figure',
      svg: dessinProfils(r, 'p_w', ['REMP', 'VID']),
      legende: t.note.legendes.profilsPw,
    },
    { type: 'figure', svg: dessinPlan(r), legende: t.note.legendes.plan },
  ];
  const tremie = dessinTremie(r);
  if (tremie !== null) {
    liste.push({ type: 'figure', svg: tremie, legende: t.note.legendes.tremie });
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
  const t = textes();
  const [norme, ...items] = t.note.hypotheses(phrase(r.profil));
  return {
    cartouche: {
      version: VERSION_OUTIL,
      projet: cartouche.projet,
      element: cartouche.element,
      date: cartouche.date,
      norme: 'EN 1991-4:2006',
      outil: 'silo',
    },
    sections: {
      hypotheses: [
        { type: 'texte', texte: norme },
        { type: 'texte', texte: `${mention()}.` },
        { type: 'liste', items },
      ],
      charges: [
        ...r.cas.map(blocDuCas),
        {
          type: 'tableau',
          titre: t.note.titreCas,
          entetes: [...t.note.entetesCas],
          lignes: lignesCas(r),
        },
      ],
      calculs: [
        ...blocsSynthese(r).map((bloc): ElementNote => ({ type: 'bloc', bloc })),
        ...figures(r),
        {
          type: 'tableau',
          titre: t.note.titrePoints,
          entetes: [...t.note.entetesPoints],
          lignes: lignesPointsOuverts(r),
        },
      ],
    },
    verifications: [],
  };
}
