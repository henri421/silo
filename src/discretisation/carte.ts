/**
 * Carte p(z, theta) des parois verticales d'un silo circulaire (SPEC §5.7,
 * EN 1991-4:2006, 5.2.1.3, 5.2.1.4, 5.2.2.3, 5.2.2.4, 5.2.3, 5.2.4.2 et
 * 5.3.2.3).
 *
 * Une carte rend une grille de noeuds (z, theta) avec p_h et p_w, pour
 * charger un modele en coque : theta en degres dans [0 ; 360[, mesure depuis
 * la direction de l'excentrement, la zone localisee etant centree sur
 * theta = 0 (et sur theta = 180 pour une paroi epaisse). Hors de la bande
 * [z_p - s/2 ; z_p + s/2], la pression est la pression symetrique du cas.
 *
 * Le module assemble les fonctions existantes (`etatParoi`,
 * `valeursLocalisees`, `valeursExcentrees`, `pressionsEnTheta`,
 * `actionLocalisee`) et ne recalcule aucune formule de la norme.
 *
 * Unites : longueurs en m, pressions en kPa (kN/m2). Les angles sont en
 * degres. L'outil CONSTATE : ces valeurs sont caracteristiques.
 */

import type {
  CarteCas,
  CasDeCharge,
  DefinitionLocalisee,
  DonneesSilo,
  IdCas,
  OptionsCarte,
  PointCarte,
  ResultatSilo,
  StatutCas,
  ValeursParoi,
} from '../model/types';
import type { ProfilSilos } from '../norms/profil';
import { etatParoi } from '../parois/symetrique';
import { valeursLocalisees } from '../parois/localisee';
import { pressionsEnTheta, valeursExcentrees, zonesExcentrees } from '../parois/excentree';

/** Tolerance des comparaisons de grille et de bornes (m, degres). */
const TOLERANCE = 1e-9;

/** Nombre a la francaise, virgule decimale, sans zeros inutiles. */
function nombreFr(valeur: number, decimales: number): string {
  return valeur
    .toFixed(decimales)
    .replace(/0+$/, '')
    .replace(/\.$/, '')
    .replace('.', ',');
}

/** Une carte sans grille ni point, avec son statut et son motif. */
function carteVide(cas: IdCas, statut: StatutCas, motif: string | null): CarteCas {
  return {
    cas,
    statut,
    motif,
    z_p: null,
    z_pChoisi: false,
    s: null,
    demiAngle: null,
    zs: [],
    thetas: [],
    points: [],
  };
}

/** Valeurs croissantes, doublons a moins de TOLERANCE retires. */
function trierEtDedoublonner(valeurs: readonly number[]): number[] {
  const triees = [...valeurs].sort((a, b) => a - b);
  const sortie: number[] = [];
  for (const valeur of triees) {
    if (sortie.length === 0 || Math.abs(valeur - sortie[sortie.length - 1]) > TOLERANCE) {
      sortie.push(valeur);
    }
  }
  return sortie;
}

/** Ramene une borne dans [0 ; hc] quand elle y est deja a la tolerance pres. */
function borner(valeur: number, hc: number): number {
  return Math.min(hc, Math.max(0, valeur));
}

/**
 * Grille en z : multiples de dz dans [0 ; hc], et hc. Une borne a moins de
 * 1e-9 de hc est confondue avec hc.
 */
function grilleZ(hc: number, dz: number): number[] {
  const zs: number[] = [0, hc];
  if (Number.isFinite(dz) && dz > 0) {
    for (let k = 0; k * dz <= hc + TOLERANCE; k += 1) {
      zs.push(borner(k * dz, hc));
    }
  }
  return trierEtDedoublonner(zs);
}

/** Grille en theta : multiples du pas, plus les bords de zones demandes. */
function grilleTheta(pas: number, bords: readonly number[]): number[] {
  const thetas: number[] = [];
  for (let k = 0; k < 360 / pas; k += 1) thetas.push(k * pas);
  for (const bord of bords) {
    const theta = ((bord % 360) + 360) % 360;
    if (theta >= 0 && theta < 360) thetas.push(theta);
  }
  return trierEtDedoublonner(thetas).filter((theta) => theta >= 0 && theta < 360);
}

/** Valeurs symetriques du cas a la profondeur z : remplissage ou vidange. */
function valeursSymetriques(
  id: 'REMP' | 'VID',
  z: number,
  d: DonneesSilo,
  cl: ResultatSilo['classement'],
  p: ProfilSilos,
): ValeursParoi {
  const etat = etatParoi(z, d, cl, p);
  const valeurs = id === 'REMP' ? etat.remplissage : etat.vidange;
  if (valeurs === null) {
    throw new Error(
      "La vidange n'est pas calculable : écoulement en cheminée interne (5.1(8)).",
    );
  }
  return valeurs;
}

/** Le noeud d'angle theta tombe-t-il dans un des deux carres de paroi epaisse ? */
function dansUnCarre(theta: number, demiAngle: number): boolean {
  return (
    theta <= demiAngle + TOLERANCE ||
    theta >= 360 - demiAngle - TOLERANCE ||
    Math.abs(theta - 180) <= demiAngle + TOLERANCE
  );
}

/** Rappel du repere des angles, commun aux cartes calculees. */
function motifRepere(): string {
  return (
    'Carte p(z, θ) : θ en degrés dans [0 ; 360[, mesuré depuis la direction de ' +
    "l'excentrement ; la zone localisée est centrée sur θ = 0 et, pour une paroi épaisse, " +
    'sur θ = 180°.'
  );
}

/**
 * Carte d'un cas REMP ou VID a action localisee, majoree ou nulle.
 *
 * La valeur de la zone, p_p = C p_h,sym(z_p), est prise a la profondeur z_p et
 * reste constante sur la hauteur s. En classe 3, ou la norme laisse la zone a
 * toute hauteur, z_p vient de l'option ou vaut hc/2 par defaut, et le motif le
 * dit (les autres positions restent a verifier).
 */
function carteLocalisee(
  r: ResultatSilo,
  p: ProfilSilos,
  id: 'REMP' | 'VID',
  def: DefinitionLocalisee,
  pas: number,
  o: OptionsCarte,
): CarteCas {
  const d = r.donnees;
  const cl = r.classement;
  const hc = d.silo.hc;
  const localisee = def.forme === 'circulaire-epaisse' || def.forme === 'circulaire-mince';
  const s = localisee ? r.actionLocalisee.s : null;
  const demiAngle =
    def.forme === 'circulaire-epaisse'
      ? (180 * r.actionLocalisee.s) / (Math.PI * cl.geometrie.d_c)
      : null;

  let z_p: number | null = null;
  let z_pChoisi = false;
  if (localisee) {
    if (def.z_p !== null) {
      z_p = def.z_p;
    } else {
      // Classe 3 : la norme laisse la zone a toute hauteur (SPEC §5.7).
      z_p = o.z_p ?? hc / 2;
      z_pChoisi = true;
    }
  }

  const zs = grilleZ(hc, d.discretisation.dz);
  if (localisee && z_p !== null && s !== null) {
    for (const borne of [z_p, z_p - s / 2, z_p + s / 2]) {
      if (borne >= -TOLERANCE && borne <= hc + TOLERANCE) zs.push(borner(borne, hc));
    }
  }
  const zsTrie = trierEtDedoublonner(zs);

  const bords: number[] = [];
  if (demiAngle !== null) {
    bords.push(demiAngle, 180 - demiAngle, 180 + demiAngle, 360 - demiAngle);
  }
  const thetas = grilleTheta(pas, bords);

  const p_p = localisee && z_p !== null ? def.C * valeursSymetriques(id, z_p, d, cl, p).p_h : 0;
  const points: PointCarte[] = [];
  for (const z of zsTrie) {
    const sym = valeursSymetriques(id, z, d, cl, p);
    let majoree: ReturnType<typeof valeursLocalisees> | null = null;
    if (def.forme === 'majoration-uniforme') {
      majoree = valeursLocalisees(def, r.actionLocalisee, d, sym);
    }
    const dansBande =
      localisee && z_p !== null && s !== null && z >= z_p - s / 2 - TOLERANCE && z <= z_p + s / 2 + TOLERANCE;
    for (const theta of thetas) {
      let p_h = sym.p_h;
      let p_w = sym.p_w;
      if (majoree !== null) {
        p_h = majoree.p_h_total;
        p_w = majoree.p_w_total;
      } else if (dansBande && demiAngle !== null) {
        p_h = dansUnCarre(theta, demiAngle) ? sym.p_h + p_p : sym.p_h - p_p / 7;
      } else if (dansBande) {
        p_h = sym.p_h + p_p * Math.cos((theta * Math.PI) / 180);
      }
      points.push({ z, Z: d.silo.Z_transition + hc - z, theta, p_h, p_w });
    }
  }

  let motif = motifRepere();
  if (def.forme === 'majoration-uniforme') {
    motif += ' Majoration uniforme : p_h et p_w sont majorés sur toute la hauteur, sans variation en θ (5.2.3).';
  } else if (z_p !== null) {
    if (z_pChoisi) {
      motif +=
        ` La norme laisse la zone à toute hauteur : la carte la place à z_p = ${nombreFr(z_p, 3)} m ; ` +
        'les autres positions restent à vérifier.';
    } else {
      motif += ` Centre de la zone localisée à z_p = ${nombreFr(z_p, 3)} m.`;
    }
  }

  return {
    cas: id,
    statut: 'calcule',
    motif,
    z_p,
    z_pChoisi,
    s,
    demiAngle,
    zs: zsTrie,
    thetas,
    points,
  };
}

/**
 * Carte du cas VID_EXC : les trois zones de 5.2.4.2 a chaque noeud, par
 * `valeursExcentrees` et `pressionsEnTheta`. Ni bande ni position z_p.
 */
function carteExcentree(r: ResultatSilo, p: ProfilSilos, pas: number): CarteCas {
  const d = r.donnees;
  const cl = r.classement;
  const hc = d.silo.hc;
  const zones = zonesExcentrees(d, cl, p);

  const zs = grilleZ(hc, d.discretisation.dz);
  const bords = [zones.theta_c, 2 * zones.theta_c, 360 - 2 * zones.theta_c, 360 - zones.theta_c];
  const thetas = grilleTheta(pas, bords);

  const points: PointCarte[] = [];
  for (const z of zs) {
    const valeurs = valeursExcentrees(z, d, cl, p);
    for (const theta of thetas) {
      const { p_h, p_w } = pressionsEnTheta(valeurs, zones, theta);
      points.push({ z, Z: d.silo.Z_transition + hc - z, theta, p_h, p_w });
    }
  }

  return {
    cas: 'VID_EXC',
    statut: 'calcule',
    motif: motifRepere(),
    z_p: null,
    z_pChoisi: false,
    s: null,
    demiAngle: null,
    zs,
    thetas,
    points,
  };
}

/** Cas de charge du resultat, par identifiant. */
function casDe(r: ResultatSilo, id: IdCas): CasDeCharge | undefined {
  return r.cas.find((cas) => cas.id === id);
}

/**
 * Carte p(z, theta) d'un cas de paroi verticale d'un silo circulaire
 * (SPEC §5.7). `pasTheta` vaut 10 par defaut et doit diviser 360 ; `z_p` ne
 * sert qu'en classe 3, ou la norme laisse la zone a toute hauteur.
 *
 * Rend une carte non applicable pour un fond, un silo rectangulaire (les
 * profils suffisent, la majoration ne varie pas en theta), un cas non calcule
 * (meme statut et meme motif que le cas) ou une paroi mince boulonnee de
 * classe 2 (P3, hors perimetre). Les motifs sont affiches tels quels.
 */
export function cartePressions(
  r: ResultatSilo,
  p: ProfilSilos,
  id: IdCas,
  o: OptionsCarte = {},
): CarteCas {
  const pas = o.pasTheta ?? 10;
  if (!Number.isInteger(pas) || pas <= 0 || 360 % pas !== 0) {
    throw new Error(
      `Le pas angulaire pasTheta doit etre un entier strictement positif qui divise 360 (deg) : ${pas}.`,
    );
  }
  const hc = r.donnees.silo.hc;
  if (
    o.z_p !== undefined &&
    (!Number.isFinite(o.z_p) || o.z_p < 0 || o.z_p > hc)
  ) {
    throw new Error(
      `La position z_p = ${o.z_p} m doit etre comprise entre 0 et hc = ${hc} m.`,
    );
  }

  if (id === 'FOND_REMP' || id === 'FOND_VID') {
    return carteVide(
      id,
      'non-applicable',
      'La carte ne couvre que les parois verticales, pas le fond.',
    );
  }

  if (r.donnees.silo.forme === 'rectangulaire') {
    return carteVide(
      id,
      'non-applicable',
      'Silo rectangulaire : la carte p(z, θ) ne s\'applique qu\'aux silos circulaires ; ' +
        'les profils restent dans profils.csv.',
    );
  }

  const cas = casDe(r, id);
  if (cas === undefined) {
    throw new Error(`Cas de charge inconnu : ${id}.`);
  }
  if (cas.statut !== 'calcule') {
    return carteVide(id, cas.statut, cas.motif);
  }

  if (id === 'REMP' || id === 'VID') {
    const def = id === 'REMP' ? r.actionLocalisee.remplissage : r.actionLocalisee.vidange;
    if (def.forme === 'hors-perimetre') {
      return carteVide(id, 'hors-perimetre', def.motif);
    }
    return carteLocalisee(r, p, id, def, pas, o);
  }

  return carteExcentree(r, p, pas);
}
