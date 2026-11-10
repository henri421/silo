/**
 * Exports du calcul : CSV (SPEC §8.2), JSON versionne (SPEC §8.3) et styles
 * des dessins autonomes.
 *
 * Module PUR : aucun `document`, aucun calcul de la norme. Il met en forme le
 * resultat de `calculer` ; les valeurs d'action localisee viennent de
 * `valeursLocalisees` du noyau, jamais d'une formule recopiee ici.
 *
 * Tout CSV passe par `csv()` d'aedificium-ui : BOM, point-virgule, virgule
 * decimale et fins de ligne CRLF. AUCUNE LIGNE N'EST OMISE : un cas non
 * calcule sort avec son statut et son motif.
 *
 * Unites : longueurs en m, pressions en kPa, efforts en kN/m, angles en degres.
 */

import { JETONS, csv, nombreAffiche, resultatsEnCsv } from 'aedificium-ui';
import {
  valeursLocalisees,
  type CasDeCharge,
  type IdCas,
  type ResultatSilo,
  type StatutCas,
} from '../../src/index';
import paquet from '../../package.json';
import { STYLE_DESSIN } from './dessins';
import { blocsSynthese } from './vue';

/** Mention imposee par SPEC §8.2, exacte. */
export const MENTION = 'valeurs caractéristiques, coefficients partiels non appliqués';

const NORME = 'EN 1991-4:2006';

/** Cas de paroi verticale, dans l'ordre des fichiers de profils et de bandes. */
const CAS_PAROI: readonly IdCas[] = ['REMP', 'VID', 'VID_EXC'];

/** Cas de fond, dans l'ordre du fichier de tremie. */
const CAS_FOND: readonly IdCas[] = ['FOND_REMP', 'FOND_VID'];

/** Les colonnes des fichiers de valeurs, dans l'ordre de SPEC §8.2. */
export const ENTETES = {
  profils: [
    'cas',
    'z [m]',
    'Z [m]',
    'p_h sym [kPa]',
    'p_h localisee ou majoree [kPa]',
    'p_h total [kPa]',
    'p_w [kPa]',
    'p_v [kPa]',
    'n_zSk [kN/m]',
    'combinaison',
  ],
  bandes: [
    'cas',
    'bande',
    'z haut [m]',
    'z bas [m]',
    'Z haut [m]',
    'Z bas [m]',
    'p_h haut [kPa]',
    'p_h bas [kPa]',
    'p_h constant [kPa]',
    'p_w haut [kPa]',
    'p_w bas [kPa]',
    'p_w constant [kPa]',
  ],
  tremie: ['cas', 'x [m]', 'Z [m]', 'p_v [kPa]', 'p_n [kPa]', 'p_t [kPa]'],
} as const;

/** Styles des dessins autonomes : jetons et regles de peinture du SVG. */
export const STYLES_DESSIN = `${JETONS}\n${STYLE_DESSIN}`;

/** Date du calcul, au format ISO, sans l'heure. */
function dateDuCalcul(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Nombre a 4 decimales fixes, virgule decimale (`10,0000`). */
function n4(valeur: number): string {
  return valeur.toFixed(4).replace('.', ',');
}

/** Nombre a 3 decimales fixes, virgule decimale (`812,793`). */
function n3(valeur: number): string {
  return valeur.toFixed(3).replace('.', ',');
}

/** Statut d'un cas en francais accentue, tel qu'il s'affiche. */
function statutTexte(statut: StatutCas): string {
  return statut === 'non-applicable' ? 'non applicable' : 'hors périmètre';
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
  const d = r.donnees;
  const silo = d.silo;
  const dimensions =
    silo.forme === 'circulaire'
      ? `d = ${dimension(silo.d)} m, t = ${dimension(silo.t)} m`
      : `a = ${dimension(silo.a)} m, b = ${dimension(silo.b)} m`;
  return [
    ['outil', 'silo', 'version', paquet.version],
    ['date', dateDuCalcul()],
    ['norme', NORME, 'profil', r.profil],
    ['forme', silo.forme, 'dimensions', dimensions, 'hc', `${n4(silo.hc)} m`],
    [
      'fond',
      silo.fond,
      'materiau',
      d.materiau.nom,
      'Z transition',
      `${n4(silo.Z_transition)} m`,
    ],
    [
      'combinaisons',
      'C1 pression normale max (p_h, action localisée)',
      'C2 frottement max (p_w et n_zSk)',
      'C3 charge verticale max (p_v)',
      'T1 trémie remplissage',
      'T2 trémie vidange',
      'X vidange excentrée',
    ],
    ['mention', MENTION],
    ['cas exclusifs', 'REMP, VID et VID_EXC sont exclusifs les uns des autres.'],
    [],
  ];
}

/** Ligne d'un cas non calcule : identifiant, puis statut et motif. */
function ligneArret(cas: CasDeCharge): string[] {
  return [cas.id, `${statutTexte(cas.statut)} : ${cas.motif ?? ''}`];
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
        cas.combinaisons,
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
  lignes.push(['contrôle', 'cas', 'somme des trapèzes [kN/m]', 'intégrale [kN/m]', 'écart relatif']);
  for (const c of r.controles) {
    lignes.push([
      'contrôle',
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
  const hc = r.donnees.silo.hc;
  const lignes: string[][] = [
    ...entete(r),
    ['cas', 'forme', 'C', 's [m]', 'z_p [m]', 'p_p [kPa]', 'p_pi [kPa]', 'p_nc [kPa]'],
  ];

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
      v.p_pi === 0 ? '0,0000' : `-${n4(v.p_pi)}`,
      n4(v.p_nc),
    ]);
  }

  if (r.donnees.silo.forme === 'rectangulaire') {
    lignes.push([
      'majoration-uniforme',
      'p_p,nc = 0,36 p_p sur toute la hauteur (5.2.1.5 et 5.2.2.5)',
    ]);
  }

  const exc = casDe(r, 'VID_EXC');
  if (
    r.donnees.silo.forme === 'circulaire' &&
    exc !== undefined &&
    exc.statut === 'calcule' &&
    exc.excentree !== null
  ) {
    lignes.push(['zone', 'nom', 'theta min [deg]', 'theta max [deg]']);
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

  lignes.push([
    'p_pi',
    "valeur négative : succion vers l'intérieur du silo (paroi épaisse, p_pi = p_p / 7).",
  ]);
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
      mention: MENTION,
      profil: r.profil,
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
