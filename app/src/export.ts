/**
 * Exports du calcul : CSV (SPEC §8.2), JSON versionne (SPEC §8.3) et styles
 * des dessins autonomes.
 *
 * Module PUR : aucun `document`, aucun calcul de la norme. Il met en forme le
 * resultat de `calculer` ; les valeurs d'action localisee viennent de
 * `valeursLocalisees` du noyau, jamais d'une formule recopiee ici.
 *
 * Tout CSV passe par `csv()` d'aedificium-ui : BOM, separateur et decimales de
 * la langue courante (point-virgule et virgule en francais, virgule et point en
 * anglais), fins de ligne CRLF. AUCUNE LIGNE N'EST OMISE : un cas non calcule
 * sort avec son statut et son motif.
 *
 * Unites : longueurs en m, pressions en kPa, efforts en kN/m, angles en degres.
 */

import { JETONS, csv, langueCourante, nombreAffiche, resultatsEnCsv } from 'aedificium-ui';
import {
  valeursLocalisees,
  type CarteCas,
  type CasDeCharge,
  type IdCas,
  type ResultatSilo,
  type StatutCas,
} from '../../src/index';
import paquet from '../../package.json';
import { STYLE_DESSIN } from './dessins';
import { nomMateriau, phrase, textes } from './textes';
import { blocsSynthese } from './vue';

const NORME = 'EN 1991-4:2006';

/** Cas de paroi verticale, dans l'ordre des fichiers de profils et de bandes. */
const CAS_PAROI: readonly IdCas[] = ['REMP', 'VID', 'VID_EXC'];

/** Cas de fond, dans l'ordre du fichier de tremie. */
const CAS_FOND: readonly IdCas[] = ['FOND_REMP', 'FOND_VID'];

/**
 * Les colonnes des fichiers de valeurs, dans l'ordre de SPEC §8.2. Ce sont des
 * accesseurs : la langue courante au moment du rendu choisit les en-tetes.
 */
export const ENTETES = {
  get profils(): readonly string[] {
    return textes().csv.entetesProfils;
  },
  get bandes(): readonly string[] {
    return textes().csv.entetesBandes;
  },
  get tremie(): readonly string[] {
    return textes().csv.entetesTremie;
  },
  get carte(): readonly string[] {
    return textes().csv.entetesCarte;
  },
};

/** Styles des dessins autonomes : jetons et regles de peinture du SVG. */
export const STYLES_DESSIN = `${JETONS}\n${STYLE_DESSIN}`;

/** Mention imposee par SPEC §8.2, dans la langue courante. */
export function mention(): string {
  return textes().csv.mention;
}

/** Date du calcul, au format ISO, sans l'heure. */
function dateDuCalcul(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Nombre a 4 decimales fixes, separateur decimal de la langue courante. */
function n4(valeur: number): string {
  const texte = valeur.toFixed(4);
  return langueCourante() === 'en' ? texte : texte.replace('.', ',');
}

/** Nombre a 3 decimales fixes, separateur decimal de la langue courante. */
function n3(valeur: number): string {
  const texte = valeur.toFixed(3);
  return langueCourante() === 'en' ? texte : texte.replace('.', ',');
}

/** Statut d'un cas, tel qu'il s'affiche dans un fichier. */
function statutTexte(statut: StatutCas): string {
  const t = textes().csv;
  return statut === 'non-applicable' ? t.nonApplicable : t.horsPerimetre;
}

/** Forme du silo, en anglais pour les exports anglais. */
function formeTexte(forme: string): string {
  if (langueCourante() !== 'en') return forme;
  return forme === 'circulaire' ? 'circular' : 'rectangular';
}

/** Type de fond, en anglais pour les exports anglais. */
function fondTexte(fond: string): string {
  if (langueCourante() !== 'en') return fond;
  const noms: Record<string, string> = {
    plat: 'flat',
    conique: 'conical hopper',
    'pyramidale-carree': 'square pyramidal hopper',
    'pyramidale-rectangulaire': 'rectangular pyramidal hopper',
    biseau: 'wedge hopper',
  };
  return noms[fond] ?? fond;
}

/** Cas par identifiant. */
function casDe(r: ResultatSilo, id: IdCas): CasDeCharge | undefined {
  return r.cas.find((cas) => cas.id === id);
}

/** Dimension saisie ou chaine vide si elle ne s'applique pas a la forme. */
function dimension(valeur: number | undefined): string {
  return valeur === undefined ? '' : n4(valeur);
}

/**
 * Bloc d'en-tete commun a tous les CSV : outil et version, date, norme et
 * profil, donnees d'entree resumees, combinaisons, mention et exclusivite des
 * cas. Il tient en huit lignes, suivies d'une ligne vide.
 */
function entete(r: ResultatSilo): string[][] {
  const t = textes().csv;
  const d = r.donnees;
  const silo = d.silo;
  const dimensions =
    silo.forme === 'circulaire'
      ? `d = ${dimension(silo.d)} m, t = ${dimension(silo.t)} m`
      : `a = ${dimension(silo.a)} m, b = ${dimension(silo.b)} m`;
  return [
    [t.outil, 'silo', t.version, paquet.version],
    [t.date, dateDuCalcul()],
    [t.norme, NORME, t.profil, phrase(r.profil)],
    [t.forme, formeTexte(silo.forme), t.dimensions, dimensions, t.hc, `${n4(silo.hc)} m`],
    [
      t.fond,
      fondTexte(silo.fond),
      t.materiau,
      nomMateriau(d.materiau.nom),
      t.zTransition,
      `${n4(silo.Z_transition)} m`,
    ],
    [t.combinaisons, ...t.roles],
    [t.ligneMention, t.mention],
    [t.ligneExclusifs, t.exclusivite],
    [],
  ];
}

/** Ligne d'un cas non calcule : identifiant, puis statut et motif. */
function ligneArret(cas: CasDeCharge): string[] {
  return [cas.id, `${statutTexte(cas.statut)} : ${phrase(cas.motif ?? '')}`];
}

/**
 * `profils.csv` : une ligne par (cas, z) pour chaque cas de paroi calcule ;
 * une ligne motivee par cas non calcule (SPEC §8.2).
 */
export function csvProfils(r: ResultatSilo): string {
  const lignes: string[][] = [...entete(r), [...ENTETES.profils]];
  for (const id of CAS_PAROI) {
    const cas = casDe(r, id);
    if (cas === undefined) continue;
    if (cas.statut !== 'calcule' || cas.profil.length === 0) {
      lignes.push(ligneArret(cas));
      continue;
    }
    for (const p of cas.profil) {
      lignes.push([
        cas.id,
        n4(p.z),
        n4(p.Z),
        n4(p.p_h_sym),
        n4(p.p_h_loc),
        n4(p.p_h_total),
        n4(p.p_w),
        n4(p.p_v),
        n4(p.n_zSk),
        phrase(cas.combinaisons),
      ]);
    }
  }
  return csv(lignes);
}

/**
 * `bandes.csv` : une ligne par (cas, bande), une ligne motivee par cas non
 * calcule, puis le pied des controles : somme des trapezes et integrale en
 * kN/m a 3 decimales, ecart relatif en pourcentage.
 */
export function csvBandes(r: ResultatSilo): string {
  const t = textes().csv;
  const lignes: string[][] = [...entete(r), [...ENTETES.bandes]];
  for (const id of CAS_PAROI) {
    const cas = casDe(r, id);
    if (cas === undefined) continue;
    if (cas.statut !== 'calcule') {
      lignes.push(ligneArret(cas));
      continue;
    }
    const bandes = r.bandes.filter((b) => b.cas === id);
    if (bandes.length === 0) {
      lignes.push(ligneArret(cas));
      continue;
    }
    for (const b of bandes) {
      lignes.push([
        b.cas,
        String(b.numero),
        n4(b.z_haut),
        n4(b.z_bas),
        n4(b.Z_haut),
        n4(b.Z_bas),
        n4(b.p_h_haut),
        n4(b.p_h_bas),
        n4(b.p_h_constant),
        n4(b.p_w_haut),
        n4(b.p_w_bas),
        n4(b.p_w_constant),
      ]);
    }
  }
  lignes.push([]);
  lignes.push([...t.entetesControles]);
  for (const c of r.controles) {
    lignes.push([
      t.controle,
      c.cas,
      n3(c.sommeTrapezes),
      n3(c.integrale),
      `${n3(c.ecartRelatif * 100)} %`,
    ]);
  }
  return csv(lignes);
}

/**
 * `tremie.csv` : une ligne par (cas, x) de FOND_REMP et FOND_VID. Pour un fond
 * plat, `x`, `p_n` et `p_t` sont vides. Un cas non calcule sort avec son motif.
 */
export function csvTremie(r: ResultatSilo): string {
  const lignes: string[][] = [...entete(r), [...ENTETES.tremie]];
  for (const id of CAS_FOND) {
    const cas = casDe(r, id);
    if (cas === undefined) continue;
    if (cas.statut !== 'calcule' || cas.fond.length === 0) {
      lignes.push(ligneArret(cas));
      continue;
    }
    for (const p of cas.fond) {
      lignes.push([
        cas.id,
        p.x === null ? '' : n4(p.x),
        n4(p.Z),
        n4(p.p_v),
        p.p_n === null ? '' : n4(p.p_n),
        p.p_t === null ? '' : n4(p.p_t),
      ]);
    }
  }
  return csv(lignes);
}

/** Point de profil le plus proche d'une profondeur, pour lire les valeurs. */
function pointLePlusProche(cas: CasDeCharge, z: number): CasDeCharge['profil'][number] | null {
  let meilleur: CasDeCharge['profil'][number] | null = null;
  for (const p of cas.profil) {
    if (meilleur === null || Math.abs(p.z - z) < Math.abs(meilleur.z - z)) meilleur = p;
  }
  return meilleur;
}

/**
 * `localisee.csv` : definition de l'action localisee au remplissage et a la
 * vidange (forme, C, s, z_p, puis p_p, p_pi et p_nc a la profondeur z_p), et
 * zones en angle de la vidange excentree pour un silo circulaire. La valeur
 * negative de p_pi est expliquee par une ligne qui dit « vers l'intérieur ».
 */
export function csvLocalisee(r: ResultatSilo): string {
  const t = textes().csv;
  const hc = r.donnees.silo.hc;
  const lignes: string[][] = [...entete(r), [...t.entetesLocalisee]];

  const casRemp = casDe(r, 'REMP');
  const casVid = casDe(r, 'VID');
  const definitions = [
    { cas: casRemp, def: r.actionLocalisee.remplissage },
    { cas: casVid, def: r.actionLocalisee.vidange },
  ];
  for (const { cas, def } of definitions) {
    if (cas === undefined) continue;
    if (cas.statut !== 'calcule' || cas.profil.length === 0) {
      lignes.push(ligneArret(cas));
      continue;
    }
    // En classe 3 comme pour une paroi non circulaire, z_p est null : la
    // definition vaut a toute hauteur. On lit alors les valeurs a mi-hauteur.
    const profondeur = def.z_p ?? hc / 2;
    const point = pointLePlusProche(cas, profondeur);
    if (point === null) {
      lignes.push([cas.id, def.forme, n4(def.C)]);
      continue;
    }
    const v = valeursLocalisees(def, r.actionLocalisee, r.donnees, {
      p_h: point.p_h_sym,
      p_w: point.p_w,
      p_v: point.p_v,
      n_zSk: point.n_zSk,
    });
    lignes.push([
      cas.id,
      def.forme,
      n4(def.C),
      n4(r.actionLocalisee.s),
      def.z_p === null ? '' : n4(def.z_p),
      n4(v.p_p),
      v.p_pi === 0 ? n4(0) : `-${n4(v.p_pi)}`,
      n4(v.p_nc),
    ]);
  }

  if (r.donnees.silo.forme === 'rectangulaire') {
    lignes.push(['majoration-uniforme', t.majoration]);
  }

  const exc = casDe(r, 'VID_EXC');
  if (
    r.donnees.silo.forme === 'circulaire' &&
    exc !== undefined &&
    exc.statut === 'calcule' &&
    exc.excentree !== null
  ) {
    lignes.push([...t.zoneEntetes]);
    for (const zone of exc.excentree.zones) {
      // Angles en degres, sans decimales inutiles : le fichier se lit a la main.
      lignes.push([
        exc.id,
        zone.nom,
        nombreAffiche(zone.thetaMin),
        nombreAffiche(zone.thetaMax),
      ]);
    }
  }

  lignes.push(['p_pi', t.pPi]);
  return csv(lignes);
}

/**
 * `carte.csv` (SPEC §8.2) : une ligne par (cas, z, θ). Le bloc d'en-tete
 * rappelle le repere des angles et, pour chaque carte, z_p, s et le demi-angle
 * des carres. Une carte non calculee sort avec son statut et son motif.
 */
export function csvCarte(r: ResultatSilo, cartes: CarteCas[]): string {
  const t = textes().csv;
  const lignes: string[][] = [...entete(r)];
  const rappels: string[][] = [[t.repereAngles, t.repereAnglesTexte]];
  for (const carte of cartes) {
    rappels.push([
      t.carteCas,
      carte.cas,
      t.positionZp,
      carte.z_p === null ? '' : nombreAffiche(carte.z_p),
      t.hauteurZone,
      carte.s === null ? '' : nombreAffiche(carte.s),
      t.demiAngle,
      carte.demiAngle === null ? '' : nombreAffiche(carte.demiAngle),
    ]);
  }
  lignes.splice(lignes.length - 1, 0, ...rappels);
  lignes.push([...ENTETES.carte]);
  for (const carte of cartes) {
    if (carte.statut !== 'calcule') {
      lignes.push([carte.cas, `${statutTexte(carte.statut)} : ${phrase(carte.motif ?? '')}`]);
      continue;
    }
    for (const noeud of carte.points) {
      lignes.push([
        carte.cas,
        n4(noeud.z),
        n4(noeud.Z),
        n4(noeud.theta),
        n4(noeud.p_h),
        n4(noeud.p_w),
      ]);
    }
  }
  return csv(lignes);
}

/** `synthese.csv` : les blocs de la synthese, par `resultatsEnCsv`. */
export function csvSynthese(r: ResultatSilo): string {
  return resultatsEnCsv(blocsSynthese(r));
}

/**
 * JSON structure et versionne (SPEC §8.3) : metadonnees, donnees d'entree,
 * classement, cas, bandes, controles et points ouverts appliques.
 */
export function jsonResultat(r: ResultatSilo): string {
  return JSON.stringify(
    {
      format: 'silo-resultat',
      version: 1,
      norme: NORME,
      mention: mention(),
      profil: phrase(r.profil),
      date: dateDuCalcul(),
      donnees: r.donnees,
      classement: r.classement,
      cas: r.cas,
      bandes: r.bandes,
      controles: r.controles,
      pointsOuverts: r.pointsOuverts,
    },
    null,
    2
  );
}
