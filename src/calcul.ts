/**
 * Calcul complet d'un silo : classement, proprietes, parois, fond et cas de
 * charge (SPEC §7 et §8.2, EN 1991-4:2006).
 *
 * Le module assemble les fonctions des lots 1 a 5 et ne recalcule aucune
 * formule de la norme. Il produit les cas REMP, VID, VID_EXC, FOND_REMP et
 * FOND_VID, dans cet ordre, chacun avec son statut, son motif et ses profils,
 * puis les bandes de chargement et leur controle. Pour un silo circulaire de
 * classe 3, il ajoute les trois cas de canal VID_EXC_1 a VID_EXC_3 (5.2.4.3),
 * soit huit cas. Un cas sans objet est declare non applicable avec son motif,
 * jamais omis.
 *
 * Unites : longueurs en m, poids volumique en kN/m3, pressions en kPa
 * (kN/m2), efforts lineiques en kN/m. Les angles sont en degres.
 *
 * L'outil CONSTATE : ces valeurs sont caracteristiques, les coefficients
 * partiels et les combinaisons de l'EN 1990 restent a appliquer.
 */

import type {
  Bande,
  CanalEcoulement,
  CasDeCharge,
  CasFond,
  ControleBandes,
  DonneesSilo,
  IdCas,
  PointFond,
  ResultatSilo,
  ZonesExcentrees,
} from './model/types';
import type { ProfilSilos } from './norms/profil';
import { verifierProfil } from './norms/profil';
import { validerDonnees } from './model/valider';
import { classer } from './classement/classement';
import { valeursCaracteristiques } from './proprietes/caracteristiques';
import { combinaison } from './proprietes/combinaisons';
import { janssen, parametresJanssen } from './parois/janssen';
import { janssenModifie } from './parois/janssen-modifie';
import { coefficientsVidange } from './parois/vidange';
import { etatParoi } from './parois/symetrique';
import { actionLocalisee, valeursLocalisees } from './parois/localisee';
import {
  declenchementExcentree,
  MOTIF_CLASSE3_EXCENTREE,
  valeursExcentrees,
  valeursSymetriquesExcentree,
  zonesExcentrees,
} from './parois/excentree';
import { canalEcoulement, valeursCanal, zonesCanal } from './parois/canal';
import { nzSkAdditionnel, remplissageExcentre } from './parois/remplissage-excentre';
import { coefficientCb } from './fond/transition';
import { fondPlat } from './fond/fond-plat';
import { parametresTremie, pressionsTremie } from './fond/tremie';
import { bandes, controleBandes } from './discretisation/bandes';
import { construireProfil, grilleProfils } from './cas/profils';
import type { ValeursPointParoi } from './cas/profils';

/** Combinaisons des parois verticales, affichees a cote du resultat. */
const COMBINAISONS_PAROI = 'p_h : C1 ; p_w et n_zSk : C2 ; p_v : C3';

/** Motif commun des cas de vidange en ecoulement de cheminee (5.1(8)). */
const MOTIF_CHEMINEE =
  "Écoulement en cheminée interne garanti par l'utilisateur : vidange non applicable (5.1(8)).";

/** Nombre de points du fond d'une tremie (SPEC §8.2, T6.2). */
const POINTS_TREMIE = 50;

/**
 * Calcul complet des actions d'un silo (SPEC §7) : classement, proprietes,
 * valeurs de Janssen, coefficients de vidange, action localisee, C_b,
 * declenchement de la vidange excentree, cinq cas de charge, profils, bandes
 * et controles.
 *
 * Valide d'abord les donnees et le profil : toute erreur de donnees ou de
 * geometrie hors perimetre se propage (magasin de stockage 5.4, point ouvert
 * P6, limites de 1.1(3)).
 */
export function calculer(d: DonneesSilo, p: ProfilSilos): ResultatSilo {
  validerDonnees(d);
  verifierProfil(p);

  const cl = classer(d, p);
  const v = valeursCaracteristiques(d.materiau, d.parois);
  const c1 = combinaison('C1', v, d.materiau);
  const c2 = combinaison('C2', v, d.materiau);
  const c3 = combinaison('C3', v, d.materiau);
  const cx = combinaison('X', v, d.materiau);
  const combinaisons = [
    c1,
    c2,
    c3,
    combinaison('T1', v, d.materiau),
    combinaison('T2', v, d.materiau),
    cx,
  ];
  const janssenParametres = {
    C1: parametresJanssen(cl.geometrie, c1),
    C2: parametresJanssen(cl.geometrie, c2),
    C3: parametresJanssen(cl.geometrie, c3),
  };

  const vidange = coefficientsVidange(d, cl, p);
  const action = actionLocalisee(d, cl, p);
  const C_b = coefficientCb(d, p);
  const excentree = declenchementExcentree(d, cl, p);
  const remplissageExc = remplissageExcentre(d, cl, p);

  const hc = d.silo.hc;
  const Z_transition = d.silo.Z_transition;
  const chiminee = d.exploitation.ecoulementEnCheminee;

  /**
   * Valeurs du remplissage a z : etat symetrique puis action localisee ou
   * majoree. p_h en C1, p_w en C2, p_v en C3. Quand 5.3.3 est declenche,
   * n_zSk augmente de la force verticale additionnelle de 5.92 (P8) ; rien
   * d'autre ne change.
   */
  const evaluerRemplissage = (z: number): ValeursPointParoi => {
    const etat = etatParoi(z, d, cl, p);
    const vl = valeursLocalisees(action.remplissage, action, d, etat.remplissage);
    return {
      p_h_sym: etat.remplissage.p_h,
      p_h_loc: vl.p_h_total - etat.remplissage.p_h,
      p_h_total: vl.p_h_total,
      p_w: vl.p_w_total,
      p_v: etat.remplissage.p_v,
      n_zSk: etat.remplissage.n_zSk + nzSkAdditionnel(z, remplissageExc),
    };
  };

  /**
   * Valeurs de la vidange symetrique a z : etat symetrique puis action
   * localisee ou majoree. p_h en C1, p_w et n_zSk en C2, p_v en C3.
   */
  const evaluerVidange = (z: number): ValeursPointParoi => {
    const etat = etatParoi(z, d, cl, p);
    if (etat.vidange === null) {
      throw new Error(
        "La vidange n'est pas calculable : écoulement en cheminée interne (5.1(8)).",
      );
    }
    const vl = valeursLocalisees(action.vidange, action, d, etat.vidange);
    return {
      p_h_sym: etat.vidange.p_h,
      p_h_loc: vl.p_h_total - etat.vidange.p_h,
      p_h_total: vl.p_h_total,
      p_w: vl.p_w_total,
      p_v: etat.vidange.p_v,
      n_zSk: etat.vidange.n_zSk,
    };
  };

  /**
   * Valeurs de la vidange excentree a z, combinaison X : materiau immobile
   * p_hse, contrainte elevee p_hae = 2 p_hse, frottement p_wae, p_v et n_zSk
   * de la meme evaluation symetrique en X (Janssen ou Janssen modifie selon
   * l'elancement, comme dans excentree.ts).
   */
  const evaluerExcentree = (z: number): ValeursPointParoi => {
    const ex = valeursExcentrees(z, d, cl, p);
    const base =
      cl.elancement === 'elance'
        ? janssen(z, cl.geometrie, cx)
        : janssenModifie(z, cl.geometrie, cx, cl.h_o, d.materiau.phi_r);
    return {
      p_h_sym: ex.p_hse,
      p_h_loc: ex.p_hae - ex.p_hse,
      p_h_total: ex.p_hae,
      p_w: ex.p_wae,
      p_v: base.p_v,
      n_zSk: base.n_zSk,
    };
  };

  const grille = grilleProfils(
    hc,
    d.discretisation.dz,
    d.discretisation.pointsProfil,
    cl.h_o,
    janssenParametres.C1.z_o,
  );

  // REMP : toujours calcule, meme en ecoulement de cheminee (5.1(8)).
  const remp: CasDeCharge = {
    id: 'REMP',
    libelle: 'Remplissage symétrique et action localisée',
    statut: 'calcule',
    motif: null,
    combinaisons: COMBINAISONS_PAROI,
    profil: construireProfil(grille, Z_transition, hc, evaluerRemplissage),
    fond: [],
    localisee: action.remplissage,
    excentree: null,
    fondPlat: null,
    tremie: null,
    canal: null,
  };

  // VID : non applicable en ecoulement de cheminee interne (5.1(8)).
  const vid: CasDeCharge = {
    id: 'VID',
    libelle: 'Vidange symétrique et action localisée',
    statut: chiminee ? 'non-applicable' : 'calcule',
    motif: chiminee ? MOTIF_CHEMINEE : null,
    combinaisons: COMBINAISONS_PAROI,
    profil: chiminee ? [] : construireProfil(grille, Z_transition, hc, evaluerVidange),
    fond: [],
    localisee: action.vidange,
    excentree: null,
    fondPlat: null,
    tremie: null,
    canal: null,
  };

  // Classe 3 d'un silo circulaire : la methode simplifiee de 5.2.4.2 est
  // remplacee par les trois canaux d'ecoulement de 5.2.4.3 (VID_EXC_1 a 3).
  const classe3Circulaire = d.silo.forme === 'circulaire' && cl.procedures === 3;

  // VID_EXC : cas separe, non applicable s'il n'est pas declenche, en
  // ecoulement de cheminee, ou en classe 3 (methode de 5.2.4.3).
  let zones: ZonesExcentrees | null = null;
  let motifVidExc: string | null = null;
  let statutVidExc: CasDeCharge['statut'] = 'non-applicable';
  if (chiminee) {
    motifVidExc = MOTIF_CHEMINEE;
  } else if (!excentree.declenche) {
    motifVidExc = excentree.motif;
  } else if (classe3Circulaire) {
    motifVidExc = MOTIF_CLASSE3_EXCENTREE;
  } else {
    zones = zonesExcentrees(d, cl, p);
    statutVidExc = 'calcule';
  }
  const vidExc: CasDeCharge = {
    id: 'VID_EXC',
    libelle: 'Vidange à grand excentrement',
    statut: statutVidExc,
    motif: motifVidExc,
    combinaisons: 'p_h, p_w, p_v et n_zSk : X',
    profil:
      zones === null ? [] : construireProfil(grille, Z_transition, hc, evaluerExcentree),
    fond: [],
    localisee: null,
    excentree: zones,
    fondPlat: null,
    tremie: null,
    canal: null,
  };

  /**
   * Valeurs d'un canal a z, combinaison X : p_hse et p_hae du canal par
   * `valeursCanal` (5.63 a 5.70), p_v et n_zSk de la meme evaluation
   * symetrique en X que VID_EXC.
   */
  const evaluerCanal = (z: number, canal: CanalEcoulement): ValeursPointParoi => {
    const vc = valeursCanal(z, d, cl, p, canal);
    const base = valeursSymetriquesExcentree(z, d, cl);
    return {
      p_h_sym: vc.p_hse,
      p_h_loc: vc.p_hae - vc.p_hse,
      p_h_total: vc.p_hae,
      p_w: vc.p_wae,
      p_v: base.p_v,
      n_zSk: base.n_zSk,
    };
  };

  /**
   * Cas d'un canal d'ecoulement de classe 3 (5.2.4.3), un par rayon k_i r.
   * Non applicable si la vidange excentree n'est pas declenchee ou en
   * ecoulement de cheminee ; hors perimetre si le canal ne touche pas la
   * paroi ; sinon calcule, avec ses zones et un profil comme VID_EXC.
   */
  const casCanal = (i: 1 | 2 | 3): CasDeCharge => {
    const id: IdCas = `VID_EXC_${i}`;
    let canal: CanalEcoulement | null = null;
    let zonesCanalCas: ZonesExcentrees | null = null;
    let statut: CasDeCharge['statut'] = 'calcule';
    let motif: string | null = null;
    if (!excentree.declenche) {
      statut = 'non-applicable';
      motif = excentree.motif;
    } else if (chiminee) {
      statut = 'non-applicable';
      motif = MOTIF_CHEMINEE;
    } else {
      try {
        canal = canalEcoulement(d, cl, p, i);
        zonesCanalCas = zonesCanal(canal);
      } catch (erreur) {
        statut = 'hors-perimetre';
        motif = erreur instanceof Error ? erreur.message : String(erreur);
        canal = null;
        zonesCanalCas = null;
      }
    }
    const canalCalcule = canal;
    return {
      id,
      libelle: `Vidange excentrée, canal d'écoulement r_c = k_${i} r`,
      statut,
      motif,
      combinaisons: 'p_h, p_w, p_v et n_zSk : X',
      profil:
        canalCalcule === null
          ? []
          : construireProfil(grille, Z_transition, hc, (z) => evaluerCanal(z, canalCalcule)),
      fond: [],
      localisee: null,
      excentree: zonesCanalCas,
      fondPlat: null,
      tremie: null,
      canal,
    };
  };

  /**
   * Cas de fond : un point a la transition pour un fond plat, 50 points de la
   * paroi de tremie de x = h_h vers la pointe. FOND_VID est non applicable en
   * ecoulement de cheminee (5.1(8)).
   */
  const casFond = (id: 'FOND_REMP' | 'FOND_VID', phase: CasFond): CasDeCharge => {
    const libelle =
      phase === 'remplissage' ? 'Fond au remplissage' : 'Fond à la vidange';
    if (id === 'FOND_VID' && chiminee) {
      return {
        id,
        libelle,
        statut: 'non-applicable',
        motif: MOTIF_CHEMINEE,
        combinaisons: 'p_v : C3',
        profil: [],
        fond: [],
        localisee: null,
        excentree: null,
        fondPlat: null,
        tremie: null,
        canal: null,
      };
    }

    if (d.silo.fond === 'plat') {
      const fp = fondPlat(d, cl, p);
      const point: PointFond = {
        x: null,
        Z: Z_transition,
        p_v: fp.p_v,
        p_n: null,
        p_t: null,
      };
      return {
        id,
        libelle,
        statut: 'calcule',
        motif: null,
        combinaisons: 'p_v : C3',
        profil: [],
        fond: [point],
        localisee: null,
        excentree: null,
        fondPlat: fp,
        tremie: null,
        canal: null,
      };
    }

    const t = parametresTremie(d, cl, p, phase);
    const fond: PointFond[] = [];
    for (let i = 0; i < POINTS_TREMIE; i++) {
      const x = t.h_h * (1 - i / POINTS_TREMIE);
      const pr = pressionsTremie(t, x);
      fond.push({
        x,
        Z: Z_transition - (t.h_h - x),
        p_v: pr.p_v,
        p_n: pr.p_n,
        p_t: pr.p_t,
      });
    }
    return {
      id,
      libelle,
      statut: 'calcule',
      motif: null,
      combinaisons: `p_n et p_t : ${t.combinaison}`,
      profil: [],
      fond,
      localisee: null,
      excentree: null,
      fondPlat: null,
      tremie: t,
      canal: null,
    };
  };

  const canaux: CasDeCharge[] = [];
  if (classe3Circulaire) {
    for (const i of [1, 2, 3] as const) canaux.push(casCanal(i));
  }

  const cas: CasDeCharge[] = [
    remp,
    vid,
    vidExc,
    ...canaux,
    casFond('FOND_REMP', 'remplissage'),
    casFond('FOND_VID', 'vidange'),
  ];

  // Bandes et controles des seuls cas de paroi calcules ; p_h_total et p_w
  // sont evalues directement en z, jamais interpoles dans le profil.
  const listeBandes: Bande[] = [];
  const controles: ControleBandes[] = [];
  const ajouterBandes = (
    id: IdCas,
    evaluer: (z: number) => ValeursPointParoi,
  ): void => {
    const f = (z: number) => {
      const valeurs = evaluer(z);
      return { p_h: valeurs.p_h_total, p_w: valeurs.p_w };
    };
    const b = bandes(id, f, hc, d.discretisation.dz, Z_transition);
    listeBandes.push(...b);
    controles.push(controleBandes(id, b, (z) => evaluer(z).p_h_total, hc));
  };
  ajouterBandes('REMP', evaluerRemplissage);
  if (!chiminee) {
    ajouterBandes('VID', evaluerVidange);
    if (zones !== null) {
      ajouterBandes('VID_EXC', evaluerExcentree);
    }
    for (const c of canaux) {
      const canal = c.canal;
      if (c.statut === 'calcule' && canal !== null) {
        ajouterBandes(c.id, (z) => evaluerCanal(z, canal));
      }
    }
  }

  // Points ouverts appliques (SPEC §9), tries.
  const points = new Set<string>(['P5']);
  if (d.silo.fond !== 'plat') points.add('P2');
  if (zones !== null || canaux.some((c) => c.statut === 'calcule')) {
    points.add('P1');
    points.add('P4');
  }
  if (remplissageExc.declenche) points.add('P8');
  if (action.remplissage.pointOuvert !== null) points.add(action.remplissage.pointOuvert);
  if (action.vidange.pointOuvert !== null) points.add(action.vidange.pointOuvert);

  return {
    donnees: d,
    profil: p.nom,
    classement: cl,
    caracteristiques: v,
    combinaisons,
    janssen: janssenParametres,
    vidange,
    actionLocalisee: action,
    C_b,
    excentree,
    remplissageExcentre: remplissageExc,
    cas,
    bandes: listeBandes,
    controles,
    pointsOuverts: [...points].sort(),
  };
}
