/**
 * Note de calcul HTML imprimable (SPEC §8.3).
 *
 * Module PUR : il compose un objet `NoteDeCalcul` pour `noteDeCalculHtml`
 * d'aedificium-ui. Les figures viennent de `dessins.ts`, les blocs de la
 * synthese et les points ouverts de `vue.ts`. Aucun calcul de la norme n'est
 * refait ici.
 *
 * La note s'ouvre sur les hypotheses : norme et profil normatif, mention des
 * valeurs caracteristiques, coefficients de l'annexe nationale avec leur source,
 * exclusivite des cas de vidange et choix enveloppe de SPEC §7 (p_h en C1 et
 * p_w en C2 dans le meme cas).
 */

import {
  avertissementAnnexeLu,
  langueCourante,
  libelleAnnexe,
  nombreAffiche,
  traduireSource,
  type AnnexeNationale,
  type ElementNote,
  type NoteDeCalcul,
} from 'aedificium-ui';
import {
  en1991_4Recommande,
  type CasDeCharge,
  type ProfilSilos,
  type ResultatSilo,
} from '../../src/index';
import { COEFS, SYMBOLES } from './annexe';
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

/**
 * Source d'un coefficient telle qu'elle s'affiche : traduite par aedificium-ui en
 * anglais, la clause « éq. » y devient « Eq. ». Intacte en francais.
 */
function sourceAffichee(source: string): string {
  const traduite = traduireSource(source);
  return langueCourante() === 'en' ? traduite.replace(/éq\. /g, 'Eq. ').replace(/ et \(/g, ' and (') : traduite;
}

/**
 * Bloc des coefficients de l'annexe : symbole, libelle suivi de sa source, et
 * valeur de chacun. La note dit ainsi quelle annexe a servi, sans rien recalculer.
 */
function blocCoefficients(profil: ProfilSilos, annexe: AnnexeNationale): ElementNote {
  const t = textes();
  return {
    type: 'bloc',
    bloc: {
      titre: `${t.note.coefficients} : ${libelleAnnexe(annexe)}`,
      lignes: COEFS.map((k) => ({
        symbole: SYMBOLES[k],
        libelle: `${t.note.libellesCoefs[k]} (${sourceAffichee(profil.valeurs[k].source)})`,
        valeur: nombreAffiche(profil.valeurs[k].valeur, 4),
      })),
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
 * fournis par la page ; l'outil est fixe. `profil` et `annexe` sont ceux qui ont
 * servi au calcul. Avec l'annexe luxembourgeoise, la norme du cartouche le dit et
 * l'avertissement de l'annexe ouvre la note (lot E).
 */
export function noteDuCalcul(
  r: ResultatSilo,
  cartouche: { projet: string; element: string; date: string },
  profil: ProfilSilos = en1991_4Recommande(),
  annexe: AnnexeNationale = 'recommande'
): NoteDeCalcul {
  const t = textes();
  const lu = annexe === 'lu';
  const [norme, ...items] = t.note.hypotheses(phrase(r.profil));
  return {
    cartouche: {
      version: VERSION_OUTIL,
      projet: cartouche.projet,
      element: cartouche.element,
      date: cartouche.date,
      norme: lu ? 'EN 1991-4:2006, ILNAS-EN 1991-4/AN-LU:2020' : 'EN 1991-4:2006',
      outil: 'silo',
    },
    avertissements: lu ? [avertissementAnnexeLu()].filter((a) => a !== '') : [],
    sections: {
      hypotheses: [
        { type: 'texte', texte: norme },
        { type: 'texte', texte: `${mention()}.` },
        blocCoefficients(profil, annexe),
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
