/**
 * Action localisee sur les parois verticales (SPEC §5.4,
 * EN 1991-4:2006, 5.2.1.2 a 5.2.3 et 5.3.1.2 a 5.3.2.3).
 *
 * Le module rend, pour le remplissage et pour la vidange :
 * - les coefficients C_pf (eq. 5.9 a 5.11) et C_pe (eq. 5.28 a 5.30) ;
 * - la forme retenue et son motif : non circulaire, circulaire epaisse ou
 *   mince, majoration uniforme, action nulle ou hors perimetre ;
 * - les valeurs a une profondeur, pour la meme combinaison que le cas
 *   symetrique correspondant (p_h en C1).
 *
 * Unites : longueurs en m, pressions en kPa (kN/m2), effort total F_p en kN.
 * Les excentrements sont en m et les angles de materiau en degres.
 *
 * L'outil CONSTATE : ces valeurs sont caracteristiques, les coefficients
 * partiels de l'EN 1990 restent a appliquer.
 */

import type {
  ActionLocalisee,
  Classement,
  DefinitionLocalisee,
  DonneesSilo,
  ValeursLocalisees,
  ValeursParoi,
} from '../model/types';
import type { ProfilSilos } from '../norms/profil';
import { valeursCaracteristiques } from '../proprietes/caracteristiques';
import { combinaison } from '../proprietes/combinaisons';
import { parametresJanssen } from './janssen';

/**
 * Coefficient C_pf de l'action localisee au remplissage (eq. 5.9 a 5.11) :
 * C_pf = 0,21 C_op (1 + 2 E_f^2) (1 - exp(-1,5 (hc/dc - 1))),
 * avec E_f = 2 e_f / d_c. Ramene a 0 s'il est negatif.
 */
export function coefficientCpf(d: DonneesSilo, cl: Classement): number {
  const E_f = (2 * d.exploitation.e_f) / cl.geometrie.d_c;
  const c =
    0.21 *
    d.materiau.C_op *
    (1 + 2 * E_f * E_f) *
    (1 - Math.exp(-1.5 * (cl.hc_dc - 1)));
  return Math.max(0, c);
}

/**
 * Coefficient C_pe de l'action localisee a la vidange (eq. 5.28 a 5.30).
 * E = 2 max(e_f, e_o) / d_c. Pour hc/dc >= 1,2, on applique l'eq. 5.28 ; sinon
 * on retient le maximum de l'eq. 5.28, de l'eq. 5.30 et de 0 (eq. 5.29).
 */
export function coefficientCpe(d: DonneesSilo, cl: Classement): number {
  const E = (2 * Math.max(d.exploitation.e_f, d.exploitation.e_o)) / cl.geometrie.d_c;
  const c528 =
    0.42 *
    d.materiau.C_op *
    (1 + 2 * E * E) *
    (1 - Math.exp(-1.5 * (cl.hc_dc - 1)));
  if (cl.hc_dc >= 1.2) {
    return Math.max(0, c528);
  }
  const c530 = 0.272 * d.materiau.C_op * (cl.hc_dc - 1 + E);
  return Math.max(c528, c530, 0);
}

/** Definition d'une action nulle, avec son motif et sans position ni zeta. */
function definitionNulle(motif: string): DefinitionLocalisee {
  return { forme: 'nulle', C: 0, motif, pointOuvert: null, zeta: null, z_p: null };
}

/**
 * Position simplifiee z_p du centre de la zone (5.2.1.3(4) et 5.16) : null en
 * classe 3, hc/2 pour une paroi epaisse, min(z_o en C1 ; hc/2) pour une paroi
 * mince soudee de classe 2. Rend null hors silo circulaire.
 */
function positionSimplifiee(d: DonneesSilo, cl: Classement): number | null {
  if (cl.procedures === 3 || cl.paroi === null) return null;
  if (cl.paroi === 'epaisse') return d.silo.hc / 2;

  const v = valeursCaracteristiques(d.materiau, d.parois);
  const c1 = combinaison('C1', v, d.materiau);
  const { z_o } = parametresJanssen(cl.geometrie, c1);
  return Math.min(z_o, d.silo.hc / 2);
}

/**
 * Coefficient zeta d'une majoration uniforme sur paroi epaisse (5.40, 5.41) :
 * max(1,0 ; 0,5 + 0,01 d_c/t). Null sur paroi mince ou hors silo circulaire.
 */
function zetaMajoration(d: DonneesSilo, cl: Classement): number | null {
  if (cl.paroi !== 'epaisse') return null;
  const t = d.silo.t as number;
  return Math.max(1, 0.5 + (0.01 * cl.geometrie.d_c) / t);
}

/**
 * Forme localisee selon la paroi : circulaire epaisse (5.2.1.3 ou 5.2.2.3),
 * circulaire mince (5.2.1.4 ou 5.2.2.4), sauf paroi mince boulonnee de classe
 * 2, hors perimetre avec le point ouvert P3 (5.2.1.4(4)).
 *
 * `note` est une phrase de renvoi placee en tete du motif (P7 ou methode
 * majoration sans forme maintenue) ; `pointOuvert` accompagne cette note.
 */
function definitionLocalisee(
  d: DonneesSilo,
  cl: Classement,
  C: number,
  phase: 'remplissage' | 'vidange',
  note: string | null,
  pointOuvert: 'P3' | 'P7' | null,
): DefinitionLocalisee {
  const mince = cl.paroi === 'mince';
  const boulonne = (d.exploitation.assemblage ?? 'soude') === 'boulonne';
  if (mince && boulonne && cl.procedures === 2) {
    return {
      forme: 'hors-perimetre',
      C: 0,
      motif:
        'Paroi mince boulonnée de classe 2 : majoration non chiffrée par la norme, hors périmètre ' +
        '(5.2.1.4(4), point ouvert P3).',
      pointOuvert: 'P3',
      zeta: null,
      z_p: null,
    };
  }

  const clauseParoi = phase === 'remplissage' ? '5.2.1' : '5.2.2';
  const numero = mince ? '4' : '3';
  const grandeur = phase === 'remplissage' ? 'p_pf' : 'p_pe';
  const description = mince
    ? `Paroi circulaire mince : distribution ${grandeur} cos θ sur la hauteur s`
    : `Paroi circulaire épaisse : ${grandeur} sur deux carrés opposés de côté s`;
  const base = `${description} (${clauseParoi}.${numero}).`;

  return {
    forme: mince ? 'circulaire-mince' : 'circulaire-epaisse',
    C,
    motif: note === null ? base : `${note} ${base}`,
    pointOuvert,
    zeta: null,
    z_p: positionSimplifiee(d, cl),
  };
}

/**
 * Definition du remplissage : nulle pour un silo peu elance (5.3.1.2(3)),
 * non circulaire (5.2.1.5), puis circulaire localisee ou majoree (5.2.1.3,
 * 5.2.1.4 et 5.2.3).
 */
function definitionRemplissage(d: DonneesSilo, cl: Classement): DefinitionLocalisee {
  if (cl.elancement === 'peu-elance') {
    return definitionNulle('Silo peu élancé : action localisée nulle au remplissage (5.3.1.2(3)).');
  }
  const C = coefficientCpf(d, cl);
  if (C === 0) {
    return definitionNulle('Coefficient C_pf nul : action localisée nulle au remplissage (5.9).');
  }
  if (d.silo.forme === 'rectangulaire') {
    return {
      forme: 'non-circulaire',
      C,
      motif:
        'Paroi non circulaire : majoration uniforme p_pf,nc = 0,36 p_pf sur toute la hauteur ' +
        '(5.2.1.5).',
      pointOuvert: null,
      zeta: null,
      z_p: null,
    };
  }

  const methode = d.exploitation.methodeLocalisee ?? 'action-localisee';
  if (cl.procedures === 2 && methode === 'majoration-uniforme') {
    if (d.exploitation.formeMaintenueEnTeteEtEnPied) {
      return {
        forme: 'majoration-uniforme',
        C,
        motif:
          'Majoration uniforme de la classe 2 sur paroi maintenue en tête et en pied (5.2.3).',
        pointOuvert: null,
        zeta: zetaMajoration(d, cl),
        z_p: null,
      };
    }
    return definitionLocalisee(
      d,
      cl,
      C,
      'remplissage',
      'Majoration uniforme choisie sans forme maintenue en tête et en pied (5.2.3(3)).',
      null,
    );
  }
  return definitionLocalisee(d, cl, C, 'remplissage', null, null);
}

/**
 * Definition de la vidange : nulle avec ecoulement en cheminee (5.1(8)), pour
 * un silo peu elance a faible excentrement (5.3.2.2(4)) ou pour un coefficient
 * nul (5.28) ; non circulaire (5.2.2.5) ; circulaire localisee ou majoree
 * (5.2.2.3, 5.2.2.4, 5.2.3 et 5.3.2.3, point ouvert P7).
 */
function definitionVidange(
  d: DonneesSilo,
  cl: Classement,
  p: ProfilSilos,
): DefinitionLocalisee {
  if (d.exploitation.ecoulementEnCheminee) {
    return definitionNulle(
      "Écoulement en cheminée interne garanti par l'utilisateur : action localisée nulle à la " +
        'vidange (5.1(8)).',
    );
  }
  const seuilExcentrement = p.valeurs.excentrementPeuElance.valeur * cl.geometrie.d_c;
  if (cl.elancement === 'peu-elance' && d.exploitation.e_o < seuilExcentrement) {
    return definitionNulle(
      'Silo peu élancé et e_o < 0,1 d_c : action localisée nulle à la vidange (5.3.2.2(4)).',
    );
  }
  const C = coefficientCpe(d, cl);
  if (C === 0) {
    return definitionNulle('Coefficient C_pe nul : action localisée nulle à la vidange (5.28).');
  }
  if (d.silo.forme === 'rectangulaire') {
    return {
      forme: 'non-circulaire',
      C,
      motif:
        'Paroi non circulaire : majoration uniforme p_pe,nc = 0,36 p_pe sur toute la hauteur ' +
        '(5.2.2.5).',
      pointOuvert: null,
      zeta: null,
      z_p: null,
    };
  }

  const methode = d.exploitation.methodeLocalisee ?? 'action-localisee';
  const intermediaireOuPeuElance =
    cl.elancement === 'intermediaire' || cl.elancement === 'peu-elance';
  if (intermediaireOuPeuElance && cl.procedures === 2) {
    // Point ouvert P7 : 5.3.2.3 est lu comme un renvoi a la majoration
    // uniforme de 5.2.3, appliquee seulement si la forme est maintenue.
    if (d.exploitation.formeMaintenueEnTeteEtEnPied) {
      return {
        forme: 'majoration-uniforme',
        C,
        motif:
          'Vidange de classe 2 : majoration uniforme lue comme celle de 5.2.3 ' +
          '(5.3.2.3 et 5.2.3, point ouvert P7).',
        pointOuvert: 'P7',
        zeta: zetaMajoration(d, cl),
        z_p: null,
      };
    }
    return definitionLocalisee(
      d,
      cl,
      C,
      'vidange',
      'Vidange de classe 2 sans forme maintenue en tête et en pied (5.3.2.3 et 5.2.3(3), ' +
        'point ouvert P7).',
      'P7',
    );
  }
  if (cl.procedures === 2 && methode === 'majoration-uniforme') {
    if (d.exploitation.formeMaintenueEnTeteEtEnPied) {
      return {
        forme: 'majoration-uniforme',
        C,
        motif:
          'Majoration uniforme de la classe 2 sur paroi maintenue en tête et en pied (5.2.3).',
        pointOuvert: null,
        zeta: zetaMajoration(d, cl),
        z_p: null,
      };
    }
    return definitionLocalisee(
      d,
      cl,
      C,
      'vidange',
      'Majoration uniforme choisie sans forme maintenue en tête et en pied (5.2.3(3)).',
      null,
    );
  }
  return definitionLocalisee(d, cl, C, 'vidange', null, null);
}

/**
 * Definition de l'action localisee pour le remplissage et pour la vidange,
 * avec s = pi d_c / 16 (eq. 5.12) : E_f, E, C_pf, C_pe, forme retenue, motif,
 * point ouvert applique, zeta et position simplifiee z_p (SPEC §5.4).
 */
export function actionLocalisee(d: DonneesSilo, cl: Classement, p: ProfilSilos): ActionLocalisee {
  const { d_c } = cl.geometrie;
  return {
    E_f: (2 * d.exploitation.e_f) / d_c,
    E: (2 * Math.max(d.exploitation.e_f, d.exploitation.e_o)) / d_c,
    s: (Math.PI * d_c) / 16,
    d_c,
    remplissage: definitionRemplissage(d, cl),
    vidange: definitionVidange(d, cl, p),
  };
}

/**
 * Valeurs de l'action localisee a une profondeur, a partir du resultat
 * symetrique du meme cas `v` (p_h en C1) :
 * - nulle ou hors perimetre : aucune valeur, p_h_total = p_h et p_w_total = p_w ;
 * - non circulaire : p_p = C p_h et p_nc = 0,36 p_p sur toute la hauteur ;
 * - circulaire epaisse : p_p vers l'exterieur et p_pi = p_p/7 vers l'interieur ;
 * - circulaire mince : p_p et effort total F_p = (pi/2) s d_c p_p (5.15) ;
 * - majoration uniforme : p_p pour information, puis paroi epaisse
 *   p_h_total = p_h (1 + zeta C) (5.38 a 5.41) ou paroi mince
 *   p_h_total = p_h (1 + 0,5 C) et p_w_total = p_w (1 + C) (5.42 a 5.45).
 *
 * `zeta` n'est renseigne que pour une majoration uniforme sur paroi epaisse :
 * sa valeur distingue les deux branches de majoration. La signature impose les
 * donnees d'entree `d`, non utilisees ici.
 */
export function valeursLocalisees(
  def: DefinitionLocalisee,
  a: ActionLocalisee,
  d: DonneesSilo,
  v: ValeursParoi,
): ValeursLocalisees {
  void d;

  switch (def.forme) {
    case 'nulle':
    case 'hors-perimetre':
      // Un cas sans objet rend des valeurs nulles, avec son motif dans `def`.
      return { p_p: 0, p_pi: 0, p_nc: 0, F_p: null, p_h_total: v.p_h, p_w_total: v.p_w };

    case 'non-circulaire': {
      const p_p = def.C * v.p_h;
      const p_nc = 0.36 * p_p;
      return {
        p_p,
        p_pi: 0,
        p_nc,
        F_p: null,
        p_h_total: v.p_h + p_nc,
        p_w_total: v.p_w,
      };
    }

    case 'circulaire-epaisse': {
      const p_p = def.C * v.p_h;
      return {
        p_p,
        p_pi: p_p / 7,
        p_nc: 0,
        F_p: null,
        p_h_total: v.p_h + p_p,
        p_w_total: v.p_w,
      };
    }

    case 'circulaire-mince': {
      const p_p = def.C * v.p_h;
      return {
        p_p,
        p_pi: 0,
        p_nc: 0,
        F_p: (Math.PI / 2) * a.s * a.d_c * p_p,
        p_h_total: v.p_h + p_p,
        p_w_total: v.p_w,
      };
    }

    case 'majoration-uniforme': {
      const p_p = def.C * v.p_h;
      if (def.zeta !== null) {
        // Paroi epaisse : 5.38 a 5.41, p_w n'est pas majore.
        return {
          p_p,
          p_pi: 0,
          p_nc: 0,
          F_p: null,
          p_h_total: v.p_h * (1 + def.zeta * def.C),
          p_w_total: v.p_w,
        };
      }
      // Paroi mince : 5.42 a 5.45.
      return {
        p_p,
        p_pi: 0,
        p_nc: 0,
        F_p: null,
        p_h_total: v.p_h * (1 + 0.5 * def.C),
        p_w_total: v.p_w * (1 + def.C),
      };
    }
  }
}
