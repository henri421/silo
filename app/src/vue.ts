/**
 * Mise en forme des resultats pour la page : synthese, liste des cas et
 * points ouverts (SPEC §8.1).
 *
 * Module PUR : il rend des blocs et des lignes de texte, jamais du DOM. Les
 * nombres sont affiches a la francaise, avec leur unite dans la valeur. Les
 * phrases viennent de `textes.ts` ; les motifs du noyau sont affiches tels
 * quels, sans recalcul.
 *
 * Unites affichees : m, t, kPa, kN/m, degres.
 */

import { nombreAffiche, type BlocResultat, type LigneResultat } from 'aedificium-ui';
import type { CasDeCharge, DefinitionLocalisee, ResultatSilo } from '../../src/index';
import { textes } from './textes';

/** Nombre affiche : trois decimales au plus, sans zeros inutiles. */
function aff(valeur: number, decimales = 3): string {
  return nombreAffiche(valeur, Math.min(decimales, 3));
}

function ligne(symbole: string, libelle: string, valeur: string): LigneResultat {
  return { symbole, libelle, valeur };
}

/** Statut affiche d'un cas : calcule, non applicable ou hors perimetre. */
function statutAffiche(cas: CasDeCharge): string {
  return textes().statuts[cas.statut];
}

/** Motif ou combinaisons d'un cas, tel qu'il s'affiche dans sa ligne. */
function detailCas(cas: CasDeCharge): string {
  if (cas.statut === 'calcule') return textes().libelles.casCalcul(cas.combinaisons);
  return textes().libelles.casArrete(statutAffiche(cas), cas.motif ?? '');
}

/** Forme localisee lisible, ou un repli neutre si le cas n'en porte pas. */
function formeLisible(d: DefinitionLocalisee | null): string {
  return d === null ? '' : textes().formesLocalisees[d.forme];
}

/** Les six blocs de la synthese, dans l'ordre de SPEC §8.1. */
export function blocsSynthese(r: ResultatSilo): BlocResultat[] {
  const t = textes();
  const cl = r.classement;
  const v = r.caracteristiques;
  const a = r.actionLocalisee;
  const fondRemp = r.cas.find((c) => c.id === 'FOND_REMP');

  const classement = ligne(t.symboles.hcDc, t.libelles.elancementRelatif, aff(cl.hc_dc, 2));
  const proprietes: LigneResultat[] = [
    ligne(t.symboles.K, t.libelles.K, `${aff(v.K_inf, 3)} / ${aff(v.K_sup, 3)}`),
    ligne(t.symboles.mu, t.libelles.mu, `${aff(v.mu_inf, 3)} / ${aff(v.mu_sup, 3)}`),
    ligne(
      t.symboles.phiI,
      t.libelles.phiI,
      `${aff(v.phi_i_inf, 1)}° / ${aff(v.phi_i_sup, 1)}°`,
    ),
  ];

  const fond: LigneResultat[] = [ligne(t.symboles.Cb, t.libelles.Cb, aff(r.C_b.C_b, 2))];
  if (fondRemp !== undefined && fondRemp.fondPlat !== null) {
    const fp = fondRemp.fondPlat;
    fond.push(ligne(t.symboles.methode, t.libelles.methodeFond, t.methodesFond[fp.methode]));
    fond.push(ligne(t.symboles.pV, t.libelles.pVFond, `${aff(fp.p_v, 3)} kPa`));
  } else if (fondRemp !== undefined && fondRemp.tremie !== null) {
    const tr = fondRemp.tremie;
    fond.push(
      ligne(t.symboles.profondeur, t.libelles.profondeurTremie, t.profondeursTremie[tr.profondeur]),
      ligne(t.symboles.F, t.libelles.F, aff(tr.F, 3)),
      ligne(t.symboles.n, t.libelles.n, aff(tr.n, 3)),
    );
    if (tr.epsilon !== null) {
      fond.push(ligne(t.symboles.epsilon, t.libelles.epsilon, `${aff(tr.epsilon, 2)}°`));
    }
  }

  return [
    {
      titre: t.blocs.classement,
      lignes: [
        classement,
        ligne(t.symboles.elancement, t.libelles.elancement, t.elancements[cl.elancement]),
        ligne(t.symboles.capacite, t.libelles.capacite, `${aff(cl.capacite, 1)} t`),
        ligne(t.symboles.classe, t.libelles.classe, String(cl.classeDeCalcul)),
      ],
      note: cl.motifsClasse.join(' '),
    },
    { titre: t.blocs.proprietes, lignes: proprietes, note: null },
    {
      titre: t.blocs.parois,
      lignes: [
        ligne(t.symboles.zO, t.libelles.zO, `${aff(r.janssen.C1.z_o, 2)} m`),
        ligne(t.symboles.pHo, t.libelles.pHo, `${aff(r.janssen.C1.p_ho, 3)} kPa`),
        ligne(t.symboles.Ch, t.libelles.Ch, aff(r.vidange.C_h, 3)),
        ligne(t.symboles.Cw, t.libelles.Cw, aff(r.vidange.C_w, 3)),
      ],
      note: r.vidange.motif,
    },
    {
      titre: t.blocs.actionLocalisee,
      lignes: [
        ligne(t.symboles.Cpf, t.libelles.Cpf, aff(a.remplissage.C, 4)),
        ligne(t.symboles.Cpe, t.libelles.Cpe, aff(a.vidange.C, 4)),
        ligne(t.symboles.s, t.libelles.s, `${aff(a.s, 2)} m`),
        ligne(t.symboles.forme, t.libelles.formeRemplissage, formeLisible(a.remplissage)),
        ligne(t.symboles.forme, t.libelles.formeVidange, formeLisible(a.vidange)),
      ],
      note: `${a.remplissage.motif} ${a.vidange.motif}`,
    },
    { titre: t.blocs.fond, lignes: fond, note: r.C_b.motif },
    {
      titre: t.blocs.cas,
      lignes: r.cas.map((c) =>
        ligne(c.id, t.cas.libelles[c.id], detailCas(c)),
      ),
      note: null,
    },
  ];
}

/** Une ligne par cas : [identifiant, libelle, statut affiche, motif ou combinaisons]. */
export function lignesCas(r: ResultatSilo): string[][] {
  return r.cas.map((c) => [
    c.id,
    textes().cas.libelles[c.id],
    statutAffiche(c),
    c.statut === 'calcule' ? c.combinaisons : (c.motif ?? ''),
  ]);
}

/**
 * Une ligne par point ouvert applique : [identifiant, question en une phrase,
 * choix applique], reformules depuis SPEC §9.
 */
export function lignesPointsOuverts(r: ResultatSilo): string[][] {
  const t = textes();
  const connus = t.pointsOuverts as Record<string, { question: string; choix: string }>;
  return r.pointsOuverts.map((id) => {
    const point = connus[id];
    if (point === undefined) return [id, `Point ouvert ${id} de SPEC §9.`, 'Choix déclaré dans SPEC.md.'];
    return [id, point.question, point.choix];
  });
}

/** Message d'une erreur du noyau, pour la zone d'erreur de la page. */
export function messageDErreur(e: unknown): string {
  const texte = e instanceof Error ? e.message : String(e);
  return texte.trim() === '' ? textes().messages.erreurInconnue : texte;
}
