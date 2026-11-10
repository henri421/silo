/**
 * Saisie de l'interface : le modele, sa lecture depuis les champs, et sa
 * traduction en donnees du noyau (SPEC §2).
 *
 * Module PUR : il ne connait ni le document ni les elements de formulaire.
 * Le cablage lui passe des chaines, il rend un modele ou un refus motive.
 *
 * Le modele garde TOUTES les valeurs, y compris celles des champs masques :
 * un changement de forme, de fond ou de materiau ne doit pas perdre la saisie
 * que l'utilisateur retrouvera en revenant.
 *
 * Unites de l'interface : longueurs en m, angles en degres, pressions en kPa,
 * poids volumique en kN/m3.
 */

import { lireNombre } from 'aedificium-ui';
import type {
  Assemblage,
  CategorieParoi,
  Classe,
  DonneesSilo,
  Exploitation,
  Forme,
  Materiau,
  MethodeLocalisee,
  Silo,
  TypeFond,
} from '../../src/index';
import { materiauParId } from '../../src/index';

/**
 * Les cles des champs du formulaire, dans l'ordre des blocs de la page.
 * Chaque cle porte exactement un element `data-champ` dans `app/index.html`.
 */
export const CHAMPS = [
  'forme',
  'd',
  'a',
  'b',
  't',
  'hc',
  'Z_transition',
  'fond',
  'beta',
  'materiau',
  'gamma_l',
  'gamma_u',
  'phi_r',
  'phi_im',
  'a_phi',
  'K_m',
  'a_K',
  'mu_D1',
  'mu_D2',
  'mu_D3',
  'a_mu',
  'C_op',
  'paroi_verticale',
  'paroi_tremie',
  'faiblement_cohesif',
  'engrainement',
  'e_f',
  'e_t',
  'e_o',
  'vidange_haut',
  'cheminee',
  'forme_maintenue',
  'assemblage',
  'classe_imposee',
  'methode_localisee',
  'dz',
  'points',
] as const;

export type CleChamp = (typeof CHAMPS)[number];

export type ChoixMateriau = 'sable' | 'defaut' | 'saisi';

/** Modele de saisie : une propriete par cle de `CHAMPS`, memes noms. */
export interface ModeleSaisie {
  forme: Forme;
  /** Diametre interieur (m), silo circulaire. */
  d: number | null;
  /** Grand cote interieur (m), silo rectangulaire. */
  a: number | null;
  /** Petit cote interieur (m), silo rectangulaire. */
  b: number | null;
  /** Epaisseur de paroi (m), silo circulaire. */
  t: number | null;
  /** Hauteur de paroi verticale (m). */
  hc: number | null;
  /** Cote globale de la transition (m). */
  Z_transition: number | null;
  fond: TypeFond;
  /** Demi-angle d'ouverture de la tremie (deg). */
  beta: number | null;
  materiau: ChoixMateriau;
  gamma_l: number | null;
  gamma_u: number | null;
  phi_r: number | null;
  phi_im: number | null;
  a_phi: number | null;
  K_m: number | null;
  a_K: number | null;
  mu_D1: number | null;
  mu_D2: number | null;
  mu_D3: number | null;
  a_mu: number | null;
  C_op: number | null;
  paroi_verticale: CategorieParoi;
  paroi_tremie: CategorieParoi;
  faiblement_cohesif: boolean;
  engrainement: boolean;
  e_f: number | null;
  e_t: number | null;
  e_o: number | null;
  vidange_haut: boolean;
  cheminee: boolean;
  forme_maintenue: boolean;
  assemblage: Assemblage;
  classe_imposee: Classe | null;
  methode_localisee: MethodeLocalisee;
  /** Hauteur des bandes de chargement (m). */
  dz: number | null;
  /** Nombre de points des profils continus. */
  points: number | null;
}

export type Lecture = { ok: true; modele: ModeleSaisie } | { ok: false; message: string };

/** Les douze grandeurs du materiau saisi, dans l'ordre du tableau E.1. */
const CHAMPS_MATERIAU = [
  'gamma_l',
  'gamma_u',
  'phi_r',
  'phi_im',
  'a_phi',
  'K_m',
  'a_K',
  'mu_m_D1',
  'mu_m_D2',
  'mu_m_D3',
  'a_mu',
  'C_op',
] as const;

type ChampMateriau = (typeof CHAMPS_MATERIAU)[number];

const FORMES: readonly Forme[] = ['circulaire', 'rectangulaire'];
const FONDS: readonly TypeFond[] = [
  'plat',
  'conique',
  'pyramidale-carree',
  'pyramidale-rectangulaire',
  'biseau',
];
const MATERIAUX: readonly ChoixMateriau[] = ['sable', 'defaut', 'saisi'];
const CATEGORIES: readonly CategorieParoi[] = ['D1', 'D2', 'D3'];
const ASSEMBLAGES: readonly Assemblage[] = ['soude', 'boulonne'];
const METHODES: readonly MethodeLocalisee[] = ['action-localisee', 'majoration-uniforme'];

/** V1 : rectangulaire 6 x 4 m, hc = 20 m, fond plat, sable, parois D2. */
export function modeleParDefaut(): ModeleSaisie {
  return {
    forme: 'rectangulaire',
    d: 6,
    a: 6,
    b: 4,
    t: 0.2,
    hc: 20,
    Z_transition: 0,
    fond: 'plat',
    beta: 30,
    materiau: 'sable',
    gamma_l: 14,
    gamma_u: 16,
    phi_r: 39,
    phi_im: 36,
    a_phi: 1.09,
    K_m: 0.45,
    a_K: 1.11,
    mu_D1: 0.38,
    mu_D2: 0.48,
    mu_D3: 0.57,
    a_mu: 1.16,
    C_op: 0.4,
    paroi_verticale: 'D2',
    paroi_tremie: 'D2',
    faiblement_cohesif: true,
    engrainement: false,
    e_f: 0,
    e_t: null,
    e_o: 0,
    vidange_haut: false,
    cheminee: false,
    forme_maintenue: false,
    assemblage: 'soude',
    classe_imposee: null,
    methode_localisee: 'action-localisee',
    dz: 1,
    points: 101,
  };
}

/** Refus de saisie, porte par `modeleDepuisChamps` comme valeur de retour. */
class ErreurDeSaisie extends Error {}

/** Un nombre saisi : vide ou illisible vaut null, sauf s'il est exige. */
function nombre(valeurs: Record<string, string>, cle: CleChamp, requis: boolean): number | null {
  const texte = (valeurs[cle] ?? '').trim();
  const lu = lireNombre(texte);
  if (lu !== null) return lu;
  if (requis) throw new ErreurDeSaisie(`Le champ ${cle} doit contenir un nombre lisible.`);
  return null;
}

/** Un choix ferme : sa valeur doit appartenir a la liste permise. */
function choix<T extends string>(
  valeurs: Record<string, string>,
  cle: CleChamp,
  permis: readonly T[],
): T {
  const v = (valeurs[cle] ?? '').trim();
  if ((permis as readonly string[]).includes(v)) return v as T;
  throw new ErreurDeSaisie(`Le champ ${cle} doit prendre une valeur parmi : ${permis.join(', ')}.`);
}

/** Case a cocher : `oui` vaut vrai, toute autre valeur faux. */
function caseCochee(valeurs: Record<string, string>, cle: CleChamp): boolean {
  return (valeurs[cle] ?? '') === 'oui';
}

/** Classe imposee : vide vaut null, sinon 1, 2 ou 3. */
function classeImposee(valeurs: Record<string, string>): Classe | null {
  const texte = (valeurs.classe_imposee ?? '').trim();
  if (texte === '') return null;
  if (texte === '1' || texte === '2' || texte === '3') return Number(texte) as Classe;
  throw new ErreurDeSaisie('Le champ classe_imposee doit valoir 1, 2, 3 ou rester vide.');
}

/**
 * Lit le modele depuis les valeurs des champs (des chaines, cases cochees
 * `oui`). Un champ masque n'est pas exige : vide ou illisible, il vaut null.
 * Les champs utiles a la saisie courante sont exiges : dimensions de la forme
 * choisie, angle d'une tremie, valeurs d'un materiau saisi, et les grandeurs
 * communes (hc, Z_transition, excentrements, discretisation).
 */
export function modeleDepuisChamps(valeurs: Record<string, string>): Lecture {
  try {
    const forme = choix(valeurs, 'forme', FORMES);
    const fond = choix(valeurs, 'fond', FONDS);
    const materiau = choix(valeurs, 'materiau', MATERIAUX);
    const circulaire = forme === 'circulaire';
    const tremie = fond !== 'plat';
    const saisi = materiau === 'saisi';
    const modele: ModeleSaisie = {
      forme,
      d: nombre(valeurs, 'd', circulaire),
      a: nombre(valeurs, 'a', !circulaire),
      b: nombre(valeurs, 'b', !circulaire),
      t: nombre(valeurs, 't', circulaire),
      hc: nombre(valeurs, 'hc', true),
      Z_transition: nombre(valeurs, 'Z_transition', true),
      fond,
      beta: nombre(valeurs, 'beta', tremie),
      materiau,
      gamma_l: nombre(valeurs, 'gamma_l', saisi),
      gamma_u: nombre(valeurs, 'gamma_u', saisi),
      phi_r: nombre(valeurs, 'phi_r', saisi),
      phi_im: nombre(valeurs, 'phi_im', saisi),
      a_phi: nombre(valeurs, 'a_phi', saisi),
      K_m: nombre(valeurs, 'K_m', saisi),
      a_K: nombre(valeurs, 'a_K', saisi),
      mu_D1: nombre(valeurs, 'mu_D1', saisi),
      mu_D2: nombre(valeurs, 'mu_D2', saisi),
      mu_D3: nombre(valeurs, 'mu_D3', saisi),
      a_mu: nombre(valeurs, 'a_mu', saisi),
      C_op: nombre(valeurs, 'C_op', saisi),
      paroi_verticale: choix(valeurs, 'paroi_verticale', CATEGORIES),
      paroi_tremie: choix(valeurs, 'paroi_tremie', CATEGORIES),
      faiblement_cohesif: caseCochee(valeurs, 'faiblement_cohesif'),
      engrainement: caseCochee(valeurs, 'engrainement'),
      e_f: nombre(valeurs, 'e_f', true),
      e_t: nombre(valeurs, 'e_t', false),
      e_o: nombre(valeurs, 'e_o', true),
      vidange_haut: caseCochee(valeurs, 'vidange_haut'),
      cheminee: caseCochee(valeurs, 'cheminee'),
      forme_maintenue: caseCochee(valeurs, 'forme_maintenue'),
      assemblage: choix(valeurs, 'assemblage', ASSEMBLAGES),
      classe_imposee: classeImposee(valeurs),
      methode_localisee: choix(valeurs, 'methode_localisee', METHODES),
      dz: nombre(valeurs, 'dz', true),
      points: nombre(valeurs, 'points', true),
    };
    return { ok: true, modele };
  } catch (e) {
    if (e instanceof ErreurDeSaisie) return { ok: false, message: e.message };
    throw e;
  }
}

/** Un nombre tel qu'il se relit dans un champ : virgule decimale, sans perte. */
function texteNombre(valeur: number | null): string {
  return valeur === null ? '' : String(valeur).replace('.', ',');
}

/** Un booleen tel qu'il se relit dans une case : `oui` ou `non`. */
function texteCase(valeur: boolean): string {
  return valeur ? 'oui' : 'non';
}

/** Valeurs des champs pour un modele : l'inverse de `modeleDepuisChamps`. */
export function champsDepuisModele(m: ModeleSaisie): Record<string, string> {
  return {
    forme: m.forme,
    d: texteNombre(m.d),
    a: texteNombre(m.a),
    b: texteNombre(m.b),
    t: texteNombre(m.t),
    hc: texteNombre(m.hc),
    Z_transition: texteNombre(m.Z_transition),
    fond: m.fond,
    beta: texteNombre(m.beta),
    materiau: m.materiau,
    gamma_l: texteNombre(m.gamma_l),
    gamma_u: texteNombre(m.gamma_u),
    phi_r: texteNombre(m.phi_r),
    phi_im: texteNombre(m.phi_im),
    a_phi: texteNombre(m.a_phi),
    K_m: texteNombre(m.K_m),
    a_K: texteNombre(m.a_K),
    mu_D1: texteNombre(m.mu_D1),
    mu_D2: texteNombre(m.mu_D2),
    mu_D3: texteNombre(m.mu_D3),
    a_mu: texteNombre(m.a_mu),
    C_op: texteNombre(m.C_op),
    paroi_verticale: m.paroi_verticale,
    paroi_tremie: m.paroi_tremie,
    faiblement_cohesif: texteCase(m.faiblement_cohesif),
    engrainement: texteCase(m.engrainement),
    e_f: texteNombre(m.e_f),
    e_t: texteNombre(m.e_t),
    e_o: texteNombre(m.e_o),
    vidange_haut: texteCase(m.vidange_haut),
    cheminee: texteCase(m.cheminee),
    forme_maintenue: texteCase(m.forme_maintenue),
    assemblage: m.assemblage,
    classe_imposee: m.classe_imposee === null ? '' : String(m.classe_imposee),
    methode_localisee: m.methode_localisee,
    dz: texteNombre(m.dz),
    points: texteNombre(m.points),
  };
}

/**
 * Une grandeur commune au noyau, exigee pour le calcul : son absence dans le
 * modele ne doit jamais passer pour une valeur par defaut.
 */
function requise(valeur: number | null, cle: CleChamp): number {
  if (valeur === null) throw new Error(`Le champ ${cle} est requis pour le calcul.`);
  return valeur;
}

/** Le materiau du noyau, de la bibliotheque ou saisi librement. */
function materiauDepuisModele(m: ModeleSaisie): Materiau {
  if (m.materiau !== 'saisi') return materiauParId(m.materiau);

  const nombres: Record<ChampMateriau, number> = {
    gamma_l: requise(m.gamma_l, 'gamma_l'),
    gamma_u: requise(m.gamma_u, 'gamma_u'),
    phi_r: requise(m.phi_r, 'phi_r'),
    phi_im: requise(m.phi_im, 'phi_im'),
    a_phi: requise(m.a_phi, 'a_phi'),
    K_m: requise(m.K_m, 'K_m'),
    a_K: requise(m.a_K, 'a_K'),
    mu_m_D1: requise(m.mu_D1, 'mu_D1'),
    mu_m_D2: requise(m.mu_D2, 'mu_D2'),
    mu_m_D3: requise(m.mu_D3, 'mu_D3'),
    a_mu: requise(m.a_mu, 'a_mu'),
    C_op: requise(m.C_op, 'C_op'),
  };
  const sources: Record<string, string> = {};
  for (const champ of CHAMPS_MATERIAU) sources[champ] = 'saisie utilisateur';

  return {
    id: 'saisi',
    nom: 'Matériau saisi',
    gamma_l: nombres.gamma_l,
    gamma_u: nombres.gamma_u,
    phi_r: nombres.phi_r,
    phi_im: nombres.phi_im,
    a_phi: nombres.a_phi,
    K_m: nombres.K_m,
    a_K: nombres.a_K,
    mu_m: { D1: nombres.mu_m_D1, D2: nombres.mu_m_D2, D3: nombres.mu_m_D3 },
    a_mu: nombres.a_mu,
    C_op: nombres.C_op,
    sources,
  };
}

/**
 * Les donnees du noyau pour un modele complet (SPEC §2). Ne transmet que les
 * grandeurs pertinentes : d et t pour un circulaire, a et b pour un
 * rectangulaire, beta pour une tremie. e_t et la classe imposee vides sont
 * absents.
 */
export function donneesDepuisModele(m: ModeleSaisie): DonneesSilo {
  const hc = requise(m.hc, 'hc');
  const Z_transition = requise(m.Z_transition, 'Z_transition');
  const beta = m.fond !== 'plat' ? { beta: requise(m.beta, 'beta') } : {};

  const silo: Silo =
    m.forme === 'circulaire'
      ? {
          forme: 'circulaire',
          d: requise(m.d, 'd'),
          t: requise(m.t, 't'),
          hc,
          fond: m.fond,
          Z_transition,
          ...beta,
        }
      : {
          forme: 'rectangulaire',
          a: requise(m.a, 'a'),
          b: requise(m.b, 'b'),
          hc,
          fond: m.fond,
          Z_transition,
          ...beta,
        };

  const exploitation: Exploitation = {
    e_f: requise(m.e_f, 'e_f'),
    e_o: requise(m.e_o, 'e_o'),
    vidangeParLeHaut: m.vidange_haut,
    ecoulementEnCheminee: m.cheminee,
    formeMaintenueEnTeteEtEnPied: m.forme_maintenue,
    assemblage: m.assemblage,
    methodeLocalisee: m.methode_localisee,
  };
  if (m.e_t !== null) exploitation.e_t = m.e_t;
  if (m.classe_imposee !== null) exploitation.classeImposee = m.classe_imposee;

  return {
    silo,
    materiau: materiauDepuisModele(m),
    parois: {
      verticale: m.paroi_verticale,
      tremie: m.paroi_tremie,
      faiblementCohesif: m.faiblement_cohesif,
      engrainementMecanique: m.engrainement,
    },
    exploitation,
    discretisation: {
      dz: requise(m.dz, 'dz'),
      pointsProfil: requise(m.points, 'points'),
    },
  };
}
