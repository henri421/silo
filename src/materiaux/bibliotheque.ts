/**
 * Bibliotheque de materiaux ensiles (SPEC §3.3, tableau E.1 de
 * l'EN 1991-4:2006).
 *
 * Le fichier JSON est une DONNEE : il est valide comme tel. Une valeur sans
 * source non vide BLOQUE le chargement, comme `profilDepuisJson` dans
 * charges-climatiques : une provenance inconnue ne doit jamais atteindre un
 * resultat.
 *
 * Unites : poids volumique en kN/m3, angles en degres.
 */

import type { CategorieParoi, Materiau } from '../model/types';
import jsonLivre from './bibliotheque.json';

const FORMAT = 'silo-materiaux';
const VERSION = 1;

/** Les douze grandeurs attendues dans chaque entree du fichier. */
const CHAMPS = [
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

type Champ = (typeof CHAMPS)[number];

interface ValeurJson {
  valeur: number;
  source: string;
}

/** Verifie qu'une entree brute est un objet non nul, et la rend typee. */
function objet(brut: unknown, nom: string): Record<string, unknown> {
  if (typeof brut !== 'object' || brut === null || Array.isArray(brut)) {
    throw new Error(`${nom} doit etre un objet JSON.`);
  }
  return brut as Record<string, unknown>;
}

/** Lit et controle les douze valeurs sources d'une entree de materiau. */
function valeursDepuisJson(brut: Record<string, unknown>, nomMateriau: string): { valeurs: Record<Champ, number>; sources: Record<string, string> } {
  const brutValeurs = objet(brut.valeurs, `Materiau ${nomMateriau} : valeurs`);
  const valeurs = {} as Record<Champ, number>;
  const sources: Record<string, string> = {};
  for (const champ of CHAMPS) {
    if (!(champ in brutValeurs)) {
      throw new Error(`Materiau ${nomMateriau} : le champ ${champ} est absent.`);
    }
    const v = objet(brutValeurs[champ], `Materiau ${nomMateriau} : champ ${champ}`) as unknown as ValeurJson;
    if (typeof v.valeur !== 'number' || !Number.isFinite(v.valeur)) {
      throw new Error(`Materiau ${nomMateriau} : la valeur de ${champ} n'est pas un nombre fini.`);
    }
    if (typeof v.source !== 'string' || v.source.trim() === '') {
      throw new Error(`Materiau ${nomMateriau} : la source de ${champ} est vide. Une valeur sans source bloque le calcul.`);
    }
    valeurs[champ] = v.valeur;
    sources[champ] = v.source;
  }
  return { valeurs, sources };
}

/**
 * Lit une liste de materiaux depuis un JSON deja analyse.
 *
 * Leve une Error si le format, la version, un champ ou une source ne
 * conviennent pas ; le message nomme le materiau et le champ en cause.
 */
export function materiauxDepuisJson(json: unknown): Materiau[] {
  const racine = objet(json, 'Le fichier de materiaux');
  if (racine.format !== FORMAT) {
    throw new Error(`Le fichier de materiaux n'a pas le format attendu : ${FORMAT} (format lu : ${String(racine.format)}).`);
  }
  if (racine.version !== VERSION) {
    throw new Error(`Le fichier de materiaux n'a pas la version attendue : ${VERSION} (version lue : ${String(racine.version)}).`);
  }
  if (!Array.isArray(racine.materiaux)) {
    throw new Error('Le fichier de materiaux doit porter une liste materiaux.');
  }

  return racine.materiaux.map((brut: unknown): Materiau => {
    const entree = objet(brut, 'Une entree de materiau');
    const id = entree.id;
    const nom = entree.nom;
    if (typeof id !== 'string' || id.trim() === '') {
      throw new Error('Un materiau doit porter un identifiant id non vide.');
    }
    if (typeof nom !== 'string' || nom.trim() === '') {
      throw new Error(`Materiau ${id} : le nom doit etre une chaine non vide.`);
    }
    const { valeurs, sources } = valeursDepuisJson(entree, id);
    const mu_m = { D1: valeurs.mu_m_D1, D2: valeurs.mu_m_D2, D3: valeurs.mu_m_D3 } as Record<CategorieParoi, number>;
    return {
      id,
      nom,
      gamma_l: valeurs.gamma_l,
      gamma_u: valeurs.gamma_u,
      phi_r: valeurs.phi_r,
      phi_im: valeurs.phi_im,
      a_phi: valeurs.a_phi,
      K_m: valeurs.K_m,
      a_K: valeurs.a_K,
      mu_m,
      a_mu: valeurs.a_mu,
      C_op: valeurs.C_op,
      sources,
    };
  });
}

/** La bibliotheque livree avec l'outil, relue a chaque appel (objets neufs). */
export function bibliotheque(): Materiau[] {
  return materiauxDepuisJson(jsonLivre);
}

/** Materiau de la bibliotheque par son identifiant ; leve si l'identifiant est inconnu. */
export function materiauParId(id: string): Materiau {
  const trouve = bibliotheque().find((m) => m.id === id);
  if (trouve === undefined) {
    throw new Error(`Materiau inconnu dans la bibliotheque : ${id}.`);
  }
  return trouve;
}
