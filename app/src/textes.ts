/**
 * Les textes affiches de l'interface, en francais. PUR.
 *
 * Le lot 7 ne livre que le francais ; le lot 9 ajoutera l'anglais avec les
 * memes cles. Aucun texte ne se lit au chargement d'un module : toujours
 * `textes()` AU MOMENT DU RENDU, apres `definirLangue` (main.ts).
 *
 * Les symboles et les valeurs viennent du noyau ou de `aedificium-ui` ; ce
 * fichier ne porte que les phrases de l'interface.
 *
 * `phrase` met en forme une phrase produite en francais par le noyau (motif,
 * libelle, message d'erreur) avant affichage : en francais, elle corrige les
 * accents, les apostrophes et les zeros inutiles sans toucher aux valeurs ; en
 * anglais (lot 9), elle la traduit.
 */

import { langueCourante } from 'aedificium-ui';

const FR = {
  messages: {
    nouvelleVersion: 'Une nouvelle version est disponible. Recharger maintenant ?',
    elementAbsent: (selecteur: string): string => `element absent de la page : ${selecteur}`,
    erreurInconnue: 'Erreur inconnue.',
  },

  blocs: {
    classement: 'Classement',
    proprietes: 'Propriétés caractéristiques',
    parois: 'Parois verticales',
    actionLocalisee: 'Action localisée',
    fond: 'Fond',
    cas: 'Cas de charge',
  },

  symboles: {
    hcDc: 'hc/dc',
    elancement: 'élancement',
    capacite: 'capacité',
    classe: 'classe',
    K: 'K',
    mu: 'μ',
    phiI: 'φ_i',
    zO: 'z_o',
    pHo: 'p_ho',
    Ch: 'C_h',
    Cw: 'C_w',
    Cpf: 'C_pf',
    Cpe: 'C_pe',
    s: 's',
    Cb: 'C_b',
    forme: 'forme',
    methode: 'méthode',
    pV: 'p_v',
    F: 'F',
    n: 'n',
    epsilon: 'ε',
    profondeur: 'profondeur',
  },

  libelles: {
    elancementRelatif: 'élancement relatif hc/dc',
    elancement: 'élancement',
    capacite: 'capacité de stockage',
    classe: 'classe de calcul',
    K: 'rapport de pression latéral, inférieur et supérieur',
    mu: 'frottement de paroi, inférieur et supérieur',
    phiI: 'angle de frottement interne, inférieur et supérieur',
    zO: 'profondeur caractéristique en C1',
    pHo: 'pression de référence en C1',
    Ch: 'coefficient de vidange horizontal',
    Cw: 'coefficient de vidange du frottement',
    Cpf: 'coefficient de remplissage',
    Cpe: 'coefficient de vidange',
    s: 'hauteur de la zone localisée',
    Cb: 'coefficient de transition vers le fond',
    formeRemplissage: 'forme au remplissage',
    formeVidange: 'forme à la vidange',
    methodeFond: 'méthode du fond plat',
    pVFond: 'pression verticale au fond',
    profondeurTremie: 'profondeur de la trémie',
    F: 'coefficient de forme de la trémie',
    n: 'exposant de la trémie',
    epsilon: 'angle epsilon de Walker',
    casCalcul: (combinaisons: string): string => `calculé ; ${combinaisons}`,
    casArrete: (statut: string, motif: string): string => `${statut} : ${motif}`,
  },

  elancements: {
    elance: 'élancé',
    intermediaire: 'intermédiaire',
    'peu-elance': 'peu élancé',
  },

  statuts: {
    calcule: 'calculé',
    'non-applicable': 'non applicable',
    'hors-perimetre': 'hors périmètre',
  },

  formesLocalisees: {
    nulle: 'nulle',
    'non-circulaire': 'non circulaire',
    'circulaire-epaisse': 'circulaire, paroi épaisse',
    'circulaire-mince': 'circulaire, paroi mince',
    'majoration-uniforme': 'majoration uniforme',
    'hors-perimetre': 'hors périmètre',
  },

  profondeursTremie: {
    profonde: 'profonde',
    'peu-profonde': 'peu profonde',
  },

  methodesFond: {
    '6.2.1': 'silo élancé (6.2.1)',
    '6.2.2': 'silo peu élancé ou intermédiaire (6.2.2)',
  },

  cas: {
    libelles: {
      REMP: 'Remplissage symétrique et action localisée',
      VID: 'Vidange symétrique et action localisée',
      VID_EXC: 'Vidange à grand excentrement',
      FOND_REMP: 'Fond au remplissage',
      FOND_VID: 'Fond à la vidange',
    },
  },

  /**
   * Questions des points ouverts de SPEC §9, reformulees, et le choix declare
   * applique en v1. Aucune clause n'est recopiee mot pour mot.
   */
  pointsOuverts: {
    P1: {
      question: "La clause 5.2.4.1(4) fixe le frottement et l'angle de frottement interne de la vidange excentrée, mais pas le rapport de pression latéral. Quel K retenir ?",
      choix: "K supérieur, cohérent avec la combinaison C1 pour p_h. Le cas V2 l'utilise.",
    },
    P2: {
      question: 'Pour la pression verticale de la trémie à la vidange, le tableau 3.1 ne précise pas le frottement de la paroi verticale. Quelle valeur retenir ?',
      choix: "Frottement inférieur pour la paroi verticale. Le cas V4 l'utilise.",
    },
    P3: {
      question: "Paroi mince boulonnée de classe 2 : la majoration uniforme demandée par 5.2.1.4(4) n'a pas de valeur définie. Que faire ?",
      choix: 'Non traité : statut hors périmètre, avec la clause.',
    },
    P4: {
      question: 'Quelle étendue donner en plan à la zone portée à deux fois la pression de paroi, en vidange excentrée ?',
      choix: "Un arc égal à l'angle de la zone d'écoulement de chaque côté de celle-ci (figure 5.5c). Reste à confirmer par l'utilisateur.",
    },
    P5: {
      question: 'La capacité du tableau 2.1 se calcule-t-elle avec le poids volumique supérieur ou inférieur, et la trémie compte-t-elle ?',
      choix: 'Poids volumique supérieur, trémie comprise : la classe la plus haute.',
    },
    P6: {
      question: 'Un silo à trémie dont le rapport hc/dc ne dépasse pas 0,4 relève-t-il des silos peu élancés ?',
      choix: "Non traité : erreur explicite citant P6 et 5.1(2). Reste à confirmer par l'utilisateur.",
    },
    P7: {
      question: "La vidange d'un silo circulaire intermédiaire ou peu élancé de classe 2 renvoie à une majoration uniforme dont la forme n'est pas donnée. Quelle forme retenir ?",
      choix: "La majoration uniforme de 5.2.3 avec C_pe, seulement si la forme est maintenue en tête et en pied ; sinon l'action localisée de 5.2.2.2 à 5.2.2.4. Reste à confirmer par l'utilisateur.",
    },
  },

  dessins: {
    titreElevation: 'Élévation',
    titreProfils: 'Profils',
    titrePlan: 'Vue en plan',
    titreTremie: 'Trémie',
    nonApplicable: 'non applicable',
    horsPerimetre: 'hors périmètre',
    hauteurTalus: 'h_o',
    zoneLocalisee: 'action localisée',
    zoneEcoulement: 'écoulement',
    zoneContrainteElevee: 'contrainte élevée',
    zoneImmobile: 'matériau immobile',
    majorationUniforme: 'majoration uniforme',
    majoration: '0,36 p_p',
    ph: 'p_h',
    pw: 'p_w',
    ho: 'h_o',
    surfaceEquivalente: 'surface équivalente',
    axePression: 'p (kPa)',
    axeProfondeur: 'z (m)',
    axeX: 'x (m)',
    pn: 'p_n',
    pt: 'p_t',
    angle: (valeur: string): string => `${valeur}°`,
  },

  pointsOuvertsInconnu: {
    question: (id: string): string => `Point ouvert ${id} de SPEC §9.`,
    choix: 'Choix déclaré dans SPEC.md.',
  },

  interface: {
    casElevation: "Cas de l'élévation",
    grandeurProfils: 'Grandeur des profils',
    bandesElevation: 'Tracer les bandes delta z',
    entetesCas: ['Cas', 'Libellé', 'Statut', 'Motif ou combinaisons'],
    entetesPointsOuverts: ['Point', 'Question', 'Choix appliqué'],
    grandeurs: {
      p_h: 'p_h totale',
      p_w: 'p_w',
      p_v: 'p_v',
      n_zSk: 'n_zSk',
    },
    nonCalcule: 'non calculé',
  },

  note: {
    statut: 'statut',
    titreCas: 'Cas de charge, statut et motif',
    entetesCas: ['Cas', 'Libellé', 'Statut', 'Motif ou combinaisons'],
    titrePoints: 'Points ouverts appliqués',
    entetesPoints: ['Point', 'Question', 'Choix appliqué'],
    hypotheses: (profil: string): string[] => [
      `Norme appliquée : EN 1991-4:2006. Profil normatif : ${profil}.`,
      'REMP, VID et VID_EXC sont des cas exclusifs les uns des autres : ils ne se cumulent pas dans le modèle aux éléments finis.',
      'Choix enveloppe de SPEC §7 : la pression normale p_h suit la combinaison C1 et le frottement p_w la combinaison C2 dans le même cas de charge.',
    ],
    legendes: {
      elevationRemp: 'Élévation, remplissage (REMP)',
      elevationVid: 'Élévation, vidange (VID)',
      profilsPh: 'Profils de p_h, remplissage et vidange superposés',
      profilsPw: 'Profils de p_w, remplissage et vidange superposés',
      plan: 'Vue en plan',
      tremie: 'Trémie, p_n et p_t',
    },
  },

  exports: {
    titre: 'Exports',
    profils: 'Profils, CSV',
    bandes: 'Bandes, CSV',
    tremie: 'Trémie, CSV',
    localisee: 'Action localisée, CSV',
    synthese: 'Synthèse, CSV',
    json: 'Résultat, JSON',
    note: 'Note de calcul',
    svg: 'SVG',
    png: 'PNG',
  },
} as const;

type Textes = typeof FR;

/** Les textes de la langue courante ; seul le francais existe encore. */
export function textes(): Textes {
  return FR;
}

/** Mots du noyau qui s'ecrivent avec un accent dans un texte affiche. */
const ACCENTS: readonly (readonly [RegExp, string])[] = [
  [/\bperimetre\b/gi, 'périmètre'],
  [/\bmethode(s)?\b/gi, 'méthode$1'],
  [/\bsymetrie\b/gi, 'symétrie'],
  [/\bsymetrique(s)?\b/gi, 'symétrique$1'],
  [/\btraitee\b/gi, 'traitée'],
  [/\btremie\b/gi, 'trémie'],
  [/\bcarree\b/gi, 'carrée'],
  [/\bmateriau\b/gi, 'matériau'],
  [/\bmateriaux\b/gi, 'matériaux'],
  [/\bcaracteristique(s)?\b/gi, 'caractéristique$1'],
  [/\bdonnees\b/gi, 'données'],
  [/\bepaisseur\b/gi, 'épaisseur'],
  [/\bgeometrie\b/gi, 'géométrie'],
  [/\bcapacite\b/gi, 'capacité'],
  [/\bpropriete(s)?\b/gi, 'propriété$1'],
  [/\bverifiee\b/gi, 'vérifiée'],
  [/\belancement\b/gi, 'élancement'],
  [/\belancee(s)?\b/gi, 'élancé$1'],
];

/** Apostrophe des elisions fautives : « l equation », « n a pas », « qu au ». */
const ELISION = /(^|[\s(])([dlnjmsct]|qu|jusqu|lorsqu|puisqu|quoiqu) (?=[aàâäeéèêëiîïoôöuùûüyhAÀÂÄEÉÈÊËIÎÏOÔÖUÙÛÜYH])/gi;

/** Zeros inutiles d'un nombre decimal : « 1,0 » en « 1 », « 2,50 » en « 2,5 ». */
function sansZeros(texte: string): string {
  return texte
    .replace(/(\d),(\d*?)0+(?!\d)/g, (_t, entier: string, decimales: string) =>
      decimales === '' ? entier : `${entier},${decimales}`
    )
    .replace(/(\d),0+(?!\d)/g, '$1');
}

/**
 * Phrase du noyau mise en forme pour l'affichage, dans la langue courante.
 * En francais, la phrase est corrigee sans changer ni les valeurs ni les
 * notations ; en anglais, elle sera traduite (lot 9, T9.2).
 */
export function phrase(texte: string): string {
  if (langueCourante() === 'en') return texte;
  let sortie = texte.replace(ELISION, "$1$2'").replace(/\b(cas non) tranche\b/gi, '$1 tranché');
  for (const [motif, remplacement] of ACCENTS) sortie = sortie.replace(motif, remplacement);
  return sansZeros(sortie).replace(/\ba (la|le|les|l')\b/g, 'à $1');
}
