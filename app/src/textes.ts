/**
 * Les textes affiches de l'interface, en francais et en anglais. PUR.
 *
 * Deux sources :
 * - les textes de l'app (`FR`, `EN`), types : une cle oubliee en anglais ne
 *   compile pas ;
 * - les phrases produites en francais par le noyau (`src/`), mises en forme a
 *   l'affichage par `phrase`.
 *
 * Aucun texte ne se lit au chargement d'un module : toujours `textes()` ou
 * `phrase()` AU MOMENT DU RENDU, apres `definirLangue` (main.ts).
 *
 * Les symboles et les valeurs viennent du noyau ou de `aedificium-ui` ; ce
 * fichier ne porte que les phrases de l'interface.
 *
 * `phrase` en francais corrige les accents, les apostrophes et les zeros
 * inutiles sans toucher aux valeurs ; en anglais, elle traduit la phrase par
 * `traducteur` d'aedificium-ui. Le noyau reste en francais.
 */

import { langueCourante, traducteur, type RegleDePhrase } from 'aedificium-ui';

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
    canaux: 'Vidange excentrée, classe 3',
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
    rC: 'r_c',
    deltaNzSk: 'Δn_zSk',
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
    deltaNzSk: 'force verticale additionnelle au pied de la paroi (5.3.3, P8)',
    canal: (id: string): string =>
      `canal d'écoulement ${id.replace('VID_EXC_', '')} (r_c = k_${id.replace('VID_EXC_', '')} r)`,
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
      VID_EXC_1: "Vidange excentrée, canal d'écoulement r_c = k_1 r",
      VID_EXC_2: "Vidange excentrée, canal d'écoulement r_c = k_2 r",
      VID_EXC_3: "Vidange excentrée, canal d'écoulement r_c = k_3 r",
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
    P8: {
      question: "Lecture de 5.92 à 5.96 pour le grand excentrement de remplissage de classe 3 : le rapport e_t/r est-il un facteur, quel angle de frottement employer, et comment relier z_s à la profondeur z ?",
      choix: "e_t/r est un facteur ; phi_r est l'angle de talus, cohérent avec 5.96 ; z_s = z + h_o,e. Le cas V8 l'utilise. Reste à confirmer par l'utilisateur.",
    },
  },

  dessins: {
    titreElevation: 'Élévation',
    titreProfils: 'Profils',
    titrePlan: 'Vue en plan',
    titreTremie: 'Trémie',
    titreCarte: 'Carte p(z, θ)',
    axeTheta: 'θ (°)',
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

  /** Textes des fichiers CSV (SPEC §8.2). */
  csv: {
    outil: 'outil',
    version: 'version',
    date: 'date',
    norme: 'norme',
    profil: 'profil',
    forme: 'forme',
    dimensions: 'dimensions',
    hc: 'hc',
    fond: 'fond',
    materiau: 'materiau',
    zTransition: 'Z transition',
    combinaisons: 'combinaisons',
    roles: [
      'C1 pression normale max (p_h, action localisée)',
      'C2 frottement max (p_w et n_zSk)',
      'C3 charge verticale max (p_v)',
      'T1 trémie remplissage',
      'T2 trémie vidange',
      'X vidange excentrée',
    ],
    ligneMention: 'mention',
    ligneExclusifs: 'cas exclusifs',
    mention: 'valeurs caractéristiques, coefficients partiels non appliqués',
    exclusivite: 'REMP, VID et VID_EXC sont exclusifs les uns des autres.',
    exclusiviteCanaux:
      'REMP, VID, VID_EXC et VID_EXC_1 à VID_EXC_3 sont exclusifs les uns des autres : en classe 3, les canaux remplacent VID_EXC.',
    entetesProfils: [
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
    entetesBandes: [
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
    entetesTremie: ['cas', 'x [m]', 'Z [m]', 'p_v [kPa]', 'p_n [kPa]', 'p_t [kPa]'],
    entetesLocalisee: ['cas', 'forme', 'C', 's [m]', 'z_p [m]', 'p_p [kPa]', 'p_pi [kPa]', 'p_nc [kPa]'],
    entetesCarte: ['cas', 'z [m]', 'Z [m]', 'θ [°]', 'p_h [kPa]', 'p_w [kPa]'],
    carteCas: 'carte',
    positionZp: 'z_p [m]',
    hauteurZone: 's [m]',
    demiAngle: 'demi-angle [deg]',
    repereAngles: 'repère des angles',
    repereAnglesTexte:
      "θ en degrés dans [0 ; 360[, mesuré depuis la direction de l'excentrement ; zone localisée centrée sur θ = 0 (et sur θ = 180° pour une paroi épaisse).",
    controle: 'contrôle',
    entetesControles: [
      'contrôle',
      'cas',
      'somme des trapèzes [kN/m]',
      'intégrale [kN/m]',
      'écart relatif',
    ],
    nonApplicable: 'non applicable',
    horsPerimetre: 'hors périmètre',
    majoration: 'p_p,nc = 0,36 p_p sur toute la hauteur (5.2.1.5 et 5.2.2.5)',
    zoneEntetes: ['zone', 'nom', 'angle min [deg]', 'angle max [deg]'],
    pPi: "valeur négative : succion vers l'intérieur du silo (paroi épaisse, p_pi = p_p / 7).",
  },

  /** Messages de refus de la saisie (form.ts). */
  formulaire: {
    nombreLisible: (cle: string): string => `Le champ ${cle} doit contenir un nombre lisible.`,
    choix: (cle: string, permis: readonly string[]): string =>
      `Le champ ${cle} doit prendre une valeur parmi : ${permis.join(', ')}.`,
    classe: 'Le champ classe_imposee doit valoir 1, 2, 3 ou rester vide.',
    requis: (cle: string): string => `Le champ ${cle} est requis pour le calcul.`,
  },

  /** Noms du materiau affiches ou exportes. */
  materiaux: {
    sable: 'Sable',
    defaut: 'Matériau par défaut',
    saisi: 'Matériau saisi',
    sourceSaisie: 'saisie utilisateur',
  },
};

type Textes = typeof FR;

const EN: Textes = {
  messages: {
    nouvelleVersion: 'A new version is available. Reload now?',
    elementAbsent: (selecteur: string): string => `element missing from the page: ${selecteur}`,
    erreurInconnue: 'Unknown error.',
  },

  blocs: {
    classement: 'Classification',
    proprietes: 'Characteristic properties',
    parois: 'Vertical walls',
    actionLocalisee: 'Localised action',
    fond: 'Bottom',
    cas: 'Load cases',
    canaux: 'Large eccentric discharge, class 3',
  },

  symboles: {
    hcDc: 'hc/dc',
    elancement: 'slenderness',
    capacite: 'capacity',
    classe: 'class',
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
    forme: 'shape',
    methode: 'method',
    pV: 'p_v',
    F: 'F',
    n: 'n',
    epsilon: 'ε',
    profondeur: 'depth',
    rC: 'r_c',
    deltaNzSk: 'Δn_zSk',
  },

  libelles: {
    elancementRelatif: 'relative slenderness hc/dc',
    elancement: 'slenderness',
    capacite: 'storage capacity',
    classe: 'calculation class',
    K: 'lateral pressure ratio, lower and upper',
    mu: 'wall friction, lower and upper',
    phiI: 'internal friction angle, lower and upper',
    zO: 'characteristic depth in C1',
    pHo: 'reference pressure in C1',
    Ch: 'horizontal discharge coefficient',
    Cw: 'wall friction discharge coefficient',
    Cpf: 'filling coefficient',
    Cpe: 'discharge coefficient',
    s: 'height of the localised zone',
    Cb: 'transition coefficient to the bottom',
    formeRemplissage: 'shape on filling',
    formeVidange: 'shape on discharge',
    methodeFond: 'flat bottom method',
    pVFond: 'vertical pressure on the bottom',
    profondeurTremie: 'hopper depth',
    F: 'hopper shape coefficient',
    n: 'hopper exponent',
    epsilon: 'Walker epsilon angle',
    deltaNzSk: 'additional vertical force at the wall foot (5.3.3, P8)',
    canal: (id: string): string =>
      `flow channel ${id.replace('VID_EXC_', '')} (r_c = k_${id.replace('VID_EXC_', '')} r)`,
    casCalcul: (combinaisons: string): string => `calculated; ${combinaisons}`,
    casArrete: (statut: string, motif: string): string => `${statut}: ${motif}`,
  },

  elancements: {
    elance: 'slender',
    intermediaire: 'intermediate',
    'peu-elance': 'shallow',
  },

  statuts: {
    calcule: 'calculated',
    'non-applicable': 'not applicable',
    'hors-perimetre': 'out of scope',
  },

  formesLocalisees: {
    nulle: 'none',
    'non-circulaire': 'non-circular',
    'circulaire-epaisse': 'circular, thick wall',
    'circulaire-mince': 'circular, thin wall',
    'majoration-uniforme': 'uniform increase',
    'hors-perimetre': 'out of scope',
  },

  profondeursTremie: {
    profonde: 'deep',
    'peu-profonde': 'shallow',
  },

  methodesFond: {
    '6.2.1': 'slender silo (6.2.1)',
    '6.2.2': 'shallow or intermediate silo (6.2.2)',
  },

  cas: {
    libelles: {
      REMP: 'Symmetric filling and localised action',
      VID: 'Symmetric discharge and localised action',
      VID_EXC: 'Large eccentric discharge',
      VID_EXC_1: 'Eccentric discharge, flow channel r_c = k_1 r',
      VID_EXC_2: 'Eccentric discharge, flow channel r_c = k_2 r',
      VID_EXC_3: 'Eccentric discharge, flow channel r_c = k_3 r',
      FOND_REMP: 'Bottom on filling',
      FOND_VID: 'Bottom on discharge',
    },
  },

  pointsOuverts: {
    P1: {
      question: 'Clause 5.2.4.1(4) sets the friction and internal friction angle for eccentric discharge, but not the lateral pressure ratio. Which K should be used?',
      choix: 'Higher K, consistent with combination C1 for p_h. Case V2 uses it.',
    },
    P2: {
      question: 'For the vertical pressure of the hopper on discharge, Table 3.1 does not state the vertical wall friction. Which value should be used?',
      choix: 'Lower friction for the vertical wall. Case V4 uses it.',
    },
    P3: {
      question: 'Bolted thin wall of class 2: the uniform increase required by 5.2.1.4(4) has no defined value. What should be done?',
      choix: 'Not covered: out of scope status, with the clause.',
    },
    P4: {
      question: 'What extent should be given in plan to the zone at twice the wall pressure, for eccentric discharge?',
      choix: 'An arc equal to the flow zone angle on each side of that zone (Figure 5.5c). To be confirmed by the user.',
    },
    P5: {
      question: 'Should the capacity of Table 2.1 be calculated with the upper or lower unit weight, and does the hopper count?',
      choix: 'Upper unit weight, hopper included: the highest class.',
    },
    P6: {
      question: 'Does a hopper silo whose hc/dc ratio does not exceed 0.4 fall under shallow silos?',
      choix: 'Not covered: explicit error citing P6 and 5.1(2). To be confirmed by the user.',
    },
    P7: {
      question: 'The discharge of a circular intermediate or shallow silo of class 2 refers to a uniform increase whose form is not given. Which form should be used?',
      choix: 'The uniform increase of 5.2.3 with C_pe, only if the shape is held at top and bottom; otherwise the localised action of 5.2.2.2 to 5.2.2.4. To be confirmed by the user.',
    },
    P8: {
      question: 'Reading of 5.92 to 5.96 for the class 3 large eccentric filling: is the eₜ/r ratio a factor, which friction angle applies, and how is z_s related to depth z?',
      choix: 'eₜ/r is a factor; phi_r is the angle of repose, consistent with 5.96; z_s = z + h_o,e. Case V8 uses it. To be confirmed by the user.',
    },
  },

  dessins: {
    titreElevation: 'Elevation',
    titreProfils: 'Profiles',
    titrePlan: 'Plan view',
    titreTremie: 'Hopper',
    titreCarte: 'Pressure map p(z, θ)',
    axeTheta: 'θ (°)',
    nonApplicable: 'not applicable',
    horsPerimetre: 'out of scope',
    hauteurTalus: 'h_o',
    zoneLocalisee: 'localised action',
    zoneEcoulement: 'flow',
    zoneContrainteElevee: 'high stress',
    zoneImmobile: 'stationary material',
    majorationUniforme: 'uniform increase',
    majoration: '0.36 p_p',
    ph: 'p_h',
    pw: 'p_w',
    ho: 'h_o',
    surfaceEquivalente: 'equivalent surface',
    axePression: 'p (kPa)',
    axeProfondeur: 'z (m)',
    axeX: 'x (m)',
    pn: 'p_n',
    pt: 'p_t',
    angle: (valeur: string): string => `${valeur}°`,
  },

  pointsOuvertsInconnu: {
    question: (id: string): string => `Open point ${id} of SPEC 9.`,
    choix: 'Choice declared in SPEC.md.',
  },

  interface: {
    casElevation: 'Elevation case',
    grandeurProfils: 'Quantity for profiles',
    bandesElevation: 'Draw the Δz strips',
    entetesCas: ['Case', 'Label', 'Status', 'Reason or combinations'],
    entetesPointsOuverts: ['Point', 'Question', 'Applied choice'],
    grandeurs: {
      p_h: 'total p_h',
      p_w: 'p_w',
      p_v: 'p_v',
      n_zSk: 'n_zSk',
    },
    nonCalcule: 'not calculated',
  },

  note: {
    statut: 'status',
    titreCas: 'Load cases, status and reason',
    entetesCas: ['Case', 'Label', 'Status', 'Reason or combinations'],
    titrePoints: 'Applied open points',
    entetesPoints: ['Point', 'Question', 'Applied choice'],
    hypotheses: (profil: string): string[] => [
      `Standard applied: EN 1991-4:2006. Code profile: ${profil}.`,
      'REMP, VID and VID_EXC are mutually exclusive cases: they are not combined in the finite element model.',
      'Envelope choice of SPEC 7: the normal pressure p_h follows combination C1 and the wall friction p_w follows combination C2 in the same load case.',
    ],
    legendes: {
      elevationRemp: 'Elevation, filling (REMP)',
      elevationVid: 'Elevation, discharge (VID)',
      profilsPh: 'Profiles of p_h, filling and discharge superimposed',
      profilsPw: 'Profiles of p_w, filling and discharge superimposed',
      plan: 'Plan view',
      tremie: 'Hopper, p_n and p_t',
    },
  },

  exports: {
    titre: 'Exports',
    profils: 'Profiles, CSV',
    bandes: 'Strips, CSV',
    tremie: 'Hopper, CSV',
    localisee: 'Localised action, CSV',
    synthese: 'Summary, CSV',
    json: 'Result, JSON',
    note: 'Calculation note',
    svg: 'SVG',
    png: 'PNG',
  },

  csv: {
    outil: 'tool',
    version: 'version',
    date: 'date',
    norme: 'standard',
    profil: 'profile',
    forme: 'shape',
    dimensions: 'dimensions',
    hc: 'hc',
    fond: 'bottom',
    materiau: 'material',
    zTransition: 'Z transition',
    combinaisons: 'combinations',
    roles: [
      'C1 maximum normal pressure (p_h, localised action)',
      'C2 maximum friction (p_w and n_zSk)',
      'C3 maximum vertical load (p_v)',
      'T1 hopper filling',
      'T2 hopper discharge',
      'X eccentric discharge',
    ],
    ligneMention: 'mention',
    ligneExclusifs: 'exclusive cases',
    mention: 'characteristic values, partial factors not applied',
    exclusivite: 'REMP, VID and VID_EXC are mutually exclusive.',
    exclusiviteCanaux:
      'REMP, VID, VID_EXC and VID_EXC_1 to VID_EXC_3 are mutually exclusive: in class 3 the channels replace VID_EXC.',
    entetesProfils: [
      'case',
      'z [m]',
      'Z [m]',
      'p_h sym [kPa]',
      'p_h local or increased [kPa]',
      'p_h total [kPa]',
      'p_w [kPa]',
      'p_v [kPa]',
      'n_zSk [kN/m]',
      'combination',
    ],
    entetesBandes: [
      'case',
      'strip',
      'z top [m]',
      'z bottom [m]',
      'Z top [m]',
      'Z bottom [m]',
      'p_h top [kPa]',
      'p_h bottom [kPa]',
      'p_h constant [kPa]',
      'p_w top [kPa]',
      'p_w bottom [kPa]',
      'p_w constant [kPa]',
    ],
    entetesTremie: ['case', 'x [m]', 'Z [m]', 'p_v [kPa]', 'p_n [kPa]', 'p_t [kPa]'],
    entetesLocalisee: ['case', 'shape', 'C', 's [m]', 'z_p [m]', 'p_p [kPa]', 'p_pi [kPa]', 'p_nc [kPa]'],
    entetesCarte: ['case', 'z [m]', 'Z [m]', 'θ [°]', 'p_h [kPa]', 'p_w [kPa]'],
    carteCas: 'map',
    positionZp: 'z_p [m]',
    hauteurZone: 's [m]',
    demiAngle: 'half-angle [deg]',
    repereAngles: 'angle reference',
    repereAnglesTexte:
      'θ in degrees in [0, 360), measured from the eccentricity direction; localised zone centred on θ = 0 (and on θ = 180° for a thick wall).',
    controle: 'check',
    entetesControles: [
      'check',
      'case',
      'trapezoid sum [kN/m]',
      'integral [kN/m]',
      'relative difference',
    ],
    nonApplicable: 'not applicable',
    horsPerimetre: 'out of scope',
    majoration: 'p_p,nc = 0.36 p_p over the full height (5.2.1.5 and 5.2.2.5)',
    zoneEntetes: ['zone', 'name', 'angle min [deg]', 'angle max [deg]'],
    pPi: 'negative value: suction towards the inside of the silo (thick wall, p_pi = p_p / 7).',
  },

  formulaire: {
    nombreLisible: (cle: string): string => `Field ${cle} must contain a readable number.`,
    choix: (cle: string, permis: readonly string[]): string =>
      `Field ${cle} must take one of: ${permis.join(', ')}.`,
    classe: 'Field classe_imposee must be 1, 2, 3 or empty.',
    requis: (cle: string): string => `Field ${cle} is required for the calculation.`,
  },

  materiaux: {
    sable: 'Sand',
    defaut: 'Default material',
    saisi: 'Entered material',
    sourceSaisie: 'user input',
  },
};

/** Les textes de la langue courante. */
export function textes(): Textes {
  return langueCourante() === 'en' ? EN : FR;
}

/**
 * Nom d'un materiau pour l'affichage et les exports : les deux entrees de la
 * bibliotheque et le materiau saisi ont un nom anglais.
 */
export function nomMateriau(nom: string): string {
  const t = textes().materiaux;
  if (nom === FR.materiaux.sable) return t.sable;
  if (nom === FR.materiaux.defaut) return t.defaut;
  if (nom === FR.materiaux.saisi) return t.saisi;
  return nom;
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
  [/\bsimplifiee(s)?\b/gi, 'simplifiée$1'],
  [/\breservee(s)?\b/gi, 'réservée$1'],
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

/** Bases de motif d'action localisee, pour les phrases prefixees (P7, 5.2.3(3)). */
const BASES_PAROI: Record<string, string> = {
  'Paroi circulaire épaisse : p_pf sur deux carrés opposés de côté s (5.2.1.3).':
    'Thick circular wall: p_pf on two opposite squares of side s (5.2.1.3).',
  'Paroi circulaire épaisse : p_pe sur deux carrés opposés de côté s (5.2.2.3).':
    'Thick circular wall: p_pe on two opposite squares of side s (5.2.2.3).',
  'Paroi circulaire mince : distribution p_pf cos θ sur la hauteur s (5.2.1.4).':
    'Thin circular wall: p_pf cos θ distribution over height s (5.2.1.4).',
  'Paroi circulaire mince : distribution p_pe cos θ sur la hauteur s (5.2.2.4).':
    'Thin circular wall: p_pe cos θ distribution over height s (5.2.2.4).',
};

const baseParoi = (base: string): string => BASES_PAROI[base] ?? base;

/** Une cause de declenchement de la vidange excentree, en anglais. */
function causeExcentree(texte: string): string {
  return texte
    .replace(/^e_o = (.+) m > (.+) d_c = (.+) m$/, 'e_o = $1 m > $2 d_c = $3 m')
    .replace(
      /^e_f = (.+) m > (.+) d_c = (.+) m avec hc\/dc = (.+) > (.+)$/,
      'e_f = $1 m > $2 d_c = $3 m with hc/dc = $4 > $5'
    )
    .replace(/^e_o = (.+) m ne dépasse pas (.+) d_c = (.+) m$/, 'e_o = $1 m does not exceed $2 d_c = $3 m')
    .replace(/^e_f = (.+) m ne dépasse pas (.+) d_c = (.+) m$/, 'e_f = $1 m does not exceed $2 d_c = $3 m')
    .replace(
      /^hc\/dc = (.+) n'est pas supérieur à (.+) malgré e_f = (.+) m > (.+) d_c = (.+) m$/,
      'hc/dc = $1 is not greater than $2 despite e_f = $3 m > $4 d_c = $5 m'
    );
}

/** Phrases exactes du noyau, en anglais. */
const EXACTES: Record<string, string> = {
  'EN 1991-4, valeurs recommandées': 'EN 1991-4, recommended values',
  'valeurs caractéristiques, coefficients partiels non appliqués': 'characteristic values, partial factors not applied',

  // Cas de charge.
  'Remplissage symétrique et action localisée': 'Symmetric filling and localised action',
  'Vidange symétrique et action localisée': 'Symmetric discharge and localised action',
  'Vidange à grand excentrement': 'Large eccentric discharge',
  'Fond au remplissage': 'Bottom on filling',
  'Fond à la vidange': 'Bottom on discharge',
  'p_h : C1 ; p_w et n_zSk : C2 ; p_v : C3': 'p_h: C1; p_w and n_zSk: C2; p_v: C3',
  'p_h, p_w, p_v et n_zSk : X': 'p_h, p_w, p_v and n_zSk: X',
  'p_v : C3': 'p_v: C3',
  'p_n et p_t : T1': 'p_n and p_t: T1',
  'p_n et p_t : T2': 'p_n and p_t: T2',

  // Classement.
  'En v1, une classe 1 est calculée avec les procédures de la classe 2 (2.5(3)).':
    'In v1, a class 1 silo is calculated with the class 2 procedures (2.5(3)).',

  // Vidange.
  'Vidange par le haut : C_h = C_w = 1,0 (EN 1991-4, 5.20 et 5.84).':
    'Discharge from the top: C_h = C_w = 1.0 (EN 1991-4, 5.20 and 5.84).',
  'Silo peu élancé : C_h = C_w = 1,0 (EN 1991-4, 5.3.2.1(2)).':
    'Shallow silo: C_h = C_w = 1.0 (EN 1991-4, 5.3.2.1(2)).',

  // Action localisee.
  'Silo peu élancé : action localisée nulle au remplissage (5.3.1.2(3)).':
    'Shallow silo: no localised action on filling (5.3.1.2(3)).',
  'Coefficient C_pf nul : action localisée nulle au remplissage (5.9).':
    'Zero C_pf: no localised action on filling (5.9).',
  'Paroi non circulaire : majoration uniforme p_pf,nc = 0,36 p_pf sur toute la hauteur (5.2.1.5).':
    'Non-circular wall: uniform increase p_pf,nc = 0.36 p_pf over the full height (5.2.1.5).',
  'Paroi non circulaire : majoration uniforme p_pe,nc = 0,36 p_pe sur toute la hauteur (5.2.2.5).':
    'Non-circular wall: uniform increase p_pe,nc = 0.36 p_pe over the full height (5.2.2.5).',
  'Majoration uniforme de la classe 2 sur paroi maintenue en tête et en pied (5.2.3).':
    'Class 2 uniform increase on a wall held at top and bottom (5.2.3).',
  'Majoration uniforme choisie sans forme maintenue en tête et en pied (5.2.3(3)).':
    'Uniform increase chosen without shape held at top and bottom (5.2.3(3)).',
  "Écoulement en cheminée interne garanti par l'utilisateur : action localisée nulle à la vidange (5.1(8)).":
    'Internal pipe flow guaranteed by the user: no localised action on discharge (5.1(8)).',
  'Silo peu élancé et e_o < 0,1 d_c : action localisée nulle à la vidange (5.3.2.2(4)).':
    'Shallow silo and e_o < 0.1 d_c: no localised action on discharge (5.3.2.2(4)).',
  'Coefficient C_pe nul : action localisée nulle à la vidange (5.28).':
    'Zero C_pe: no localised action on discharge (5.28).',
  'Paroi mince boulonnée de classe 2 : majoration non chiffrée par la norme, hors périmètre (5.2.1.4(4), point ouvert P3).':
    'Bolted thin wall of class 2: increase not quantified by the standard, out of scope (5.2.1.4(4), open point P3).',
  'Paroi circulaire épaisse : p_pf sur deux carrés opposés de côté s (5.2.1.3).':
    'Thick circular wall: p_pf on two opposite squares of side s (5.2.1.3).',
  'Paroi circulaire épaisse : p_pe sur deux carrés opposés de côté s (5.2.2.3).':
    'Thick circular wall: p_pe on two opposite squares of side s (5.2.2.3).',
  'Paroi circulaire mince : distribution p_pf cos θ sur la hauteur s (5.2.1.4).':
    'Thin circular wall: p_pf cos θ distribution over height s (5.2.1.4).',
  'Paroi circulaire mince : distribution p_pe cos θ sur la hauteur s (5.2.2.4).':
    'Thin circular wall: p_pe cos θ distribution over height s (5.2.2.4).',
  'Vidange de classe 2 : majoration uniforme lue comme celle de 5.2.3 (5.3.2.3 et 5.2.3, point ouvert P7).':
    'Class 2 discharge: uniform increase read as that of 5.2.3 (5.3.2.3 and 5.2.3, open point P7).',
  'Vidange de classe 2 sans forme maintenue en tête et en pied (5.3.2.3 et 5.2.3(3), point ouvert P7).':
    'Class 2 discharge without shape held at top and bottom (5.3.2.3 and 5.2.3(3), open point P7).',

  // Fond.
  'Pression verticale uniforme p_v = p_vft sur le fond (6.2.1), identique au remplissage et à la vidange (6.2.1(2)).':
    'Uniform vertical pressure p_v = p_vft on the bottom (6.2.1), identical on filling and discharge (6.2.1(2)).',
  'Pression verticale p_vsq au voisinage du centre du fond (6.2.2(4)), identique au remplissage et à la vidange (6.2.2(3)).':
    'Vertical pressure p_vsq near the centre of the bottom (6.2.2(4)), identical on filling and discharge (6.2.2(3)).',

  // Tremie.
  'Trémie profonde au remplissage : F_f de l équation 6.17 et n de l équation 6.18 (6.3.2).':
    'Deep hopper on filling: F_f from equation 6.17 and n from equation 6.18 (6.3.2).',
  "Trémie profonde à la vidange : F_e de Walker (6.21 à 6.23) et n de la forme générale de l équation 6.8 (6.3.3, point ouvert P2).":
    'Deep hopper on discharge: Walker F_e (6.21 to 6.23) and n from the general form of equation 6.8 (6.3.3, open point P2).',
  'Trémie peu profonde à la vidange : mêmes valeurs qu au remplissage (6.4.3).':
    'Shallow hopper on discharge: same values as on filling (6.4.3).',
  'Trémie peu profonde au remplissage : mu_heff de 6.26, F_f de 6.27 et n de 6.28 (6.4.2).':
    'Shallow hopper on filling: mu_heff from 6.26, F_f from 6.27 and n from 6.28 (6.4.2).',

  // Vidange excentree.
  'Vidange à grand excentrement traitée pour les silos circulaires seulement (5.2.4).':
    'Large eccentric discharge treated for circular silos only (5.2.4).',
  'Vidange excentree en classe 3 : methode de 5.2.4.3 non traitee. Les cas symetriques restent rendus.':
    'Eccentric discharge of class 3: method of 5.2.4.3 not covered. Symmetric cases are still given.',
  'Methode simplifiee de 5.2.4.2 reservee a la classe 2 (5.2.4.1(5)) : en classe 3, voir les cas VID_EXC_1 a VID_EXC_3 (5.2.4.3).':
    'Simplified method of 5.2.4.2 reserved for class 2 (5.2.4.1(5)): in class 3, see cases VID_EXC_1 to VID_EXC_3 (5.2.4.3).',
  "Écoulement en cheminée interne garanti par l'utilisateur : vidange non applicable (5.1(8)).":
    'Internal pipe flow guaranteed by the user: discharge not applicable (5.1(8)).',

  // Remplissage excentre de classe 3.
  'Grand excentrement de remplissage déclenché (5.3.3) : force verticale additionnelle Δn_zSk sur toute la circonférence (5.92 à 5.96, point ouvert P8).':
    'Large eccentric filling triggered (5.3.3): additional vertical force Δn_zSk around the full circumference (5.92 to 5.96, open point P8).',
  'Grand excentrement de remplissage : méthode de 5.3.3 traitée pour les silos circulaires seulement.':
    'Large eccentric filling: method of 5.3.3 treated for circular silos only.',

  // Messages d'erreur du noyau.
  'La hauteur de paroi verticale hc doit etre un nombre strictement positif (m).':
    'The vertical wall height hc must be a strictly positive number (m).',
};

/** Regles de traduction des phrases du noyau. */
const REGLES: readonly RegleDePhrase[] = [
  // Classement.
  [
    /^Capacité de (.+) supérieure à (.+) t : classe 3 \(tableau 2\.1\)\.$/,
    'Capacity of $1 above $2 t: class 3 (Table 2.1).',
  ],
  [
    /^Capacité de (.+) supérieure à (.+) t et e_o\/d_c = (.+) supérieur à (.+) : classe 3 \(tableau 2\.1\)\.$/,
    'Capacity of $1 above $2 t and e_o/d_c = $3 above $4: class 3 (Table 2.1).',
  ],
  [
    /^Capacité de (.+) supérieure à (.+) t, silo peu élancé et e_t\/d_c = (.+) supérieur à (.+) : classe 3 \(tableau 2\.1\)\.$/,
    'Capacity of $1 above $2 t, shallow silo and eₜ/d_c = $3 above $4: class 3 (Table 2.1).',
  ],
  [
    /^Capacité de (.+) inférieure à (.+) t : classe 1 \(tableau 2\.1\)\.$/,
    'Capacity of $1 below $2 t: class 1 (Table 2.1).',
  ],
  [
    /^Capacité de (.+) et excentrements relatifs e_o\/d_c = (.+), e_t\/d_c = (.+) : aucune condition de classe 3 du tableau 2\.1 n'est remplie, classe 2\.$/,
    'Capacity of $1 and relative eccentricities e_o/d_c = $2, eₜ/d_c = $3: no class 3 condition of Table 2.1 is met, class 2.',
  ],
  [
    /^Classe imposée (\d+) : elle relève la classe calculée (\d+) \(2\.5\(3\)\)\.$/,
    'Imposed class $1: it raises the calculated class $2 (2.5(3)).',
  ],
  [
    /^hc\/dc = (.+) avec fond plat : magasin de stockage, hors perimetre \(EN 1991-4, 5\.4\)\.$/,
    'hc/dc = $1 with flat bottom: storage bin, out of scope (EN 1991-4, 5.4).',
  ],
  [
    /^hc\/dc = (.+) avec tremie : cas non tranche par 5\.1\(2\), hors perimetre \(point ouvert P6\)\.$/,
    'hc/dc = $1 with hopper: case not settled by 5.1(2), out of scope (open point P6).',
  ],

  // Vidange.
  [
    /^Silo intermédiaire : C_h = 1 \+ (.+) C_S et C_w = 1 \+ (.+) C_S, avec C_S = hc\/dc - 1 \(EN 1991-4, 5\.85 à 5\.87\)\.$/,
    'Intermediate silo: C_h = 1 + $1 C_S and C_w = 1 + $2 C_S, with C_S = hc/dc - 1 (EN 1991-4, 5.85 to 5.87).',
  ],
  [
    /^Silo élancé : C_h = (.+) et C_w = (.+) \(EN 1991-4, 5\.21 et 5\.22\)\.$/,
    'Slender silo: C_h = $1 and C_w = $2 (EN 1991-4, 5.21 and 5.22).',
  ],

  // C_b.
  [
    /^Matériau non faiblement cohésif ou sujet à engrainement mécanique : C_b = (.+) \(6\.1\.2\(5\) et \(6\)\)\.$/,
    'Material not slightly cohesive or subject to mechanical interlocking: C_b = $1 (6.1.2(5) and (6)).',
  ],
  [
    /^Matériau faiblement cohésif sans engrainement mécanique : C_b = (.+) \(6\.1\.2\(4\)\)\.$/,
    'Slightly cohesive material without mechanical interlocking: C_b = $1 (6.1.2(4)).',
  ],

  // Action localisee prefixee : P7 et methode 5.2.3(3).
  [
    /^Vidange de classe 2 sans forme maintenue en tête et en pied \(5\.3\.2\.3 et 5\.2\.3\(3\), point ouvert P7\)\. (.+)$/,
    (_t, base: string) =>
      `Class 2 discharge without shape held at top and bottom (5.3.2.3 and 5.2.3(3), open point P7). ${baseParoi(base)}`,
  ],
  [
    /^Majoration uniforme choisie sans forme maintenue en tête et en pied \(5\.2\.3\(3\)\)\. (.+)$/,
    (_t, base: string) =>
      `Uniform increase chosen without shape held at top and bottom (5.2.3(3)). ${baseParoi(base)}`,
  ],

  // Vidange a grand excentrement : declenchement et zones.
  [
    /^Vidange à grand excentrement déclenchée par (.+) \(EN 1991-4, (.+)\)\.$/,
    (_t, causes: string, clause: string) =>
      `Large eccentric discharge triggered by ${causes
        .split(' et ')
        .map(causeExcentree)
        .join(' and ')} (EN 1991-4, ${clause}).`,
  ],
  [
    /^Vidange à grand excentrement non déclenchée : (.+) \(EN 1991-4, (.+)\)\.$/,
    (_t, raisons: string, clause: string) =>
      `Large eccentric discharge not triggered: ${raisons
        .split(' ; ')
        .map(causeExcentree)
        .join('; ')} (EN 1991-4, ${clause}).`,
  ],
  [
    /^Méthode simplifiée de 5\.2\.4\.2, classe 2 : écoulement sur \|theta\| <= (.+)°, contrainte élevée à 2 p_hf sur un arc de (.+)° de chaque côté de l'écoulement \(P4 : étendue à confirmer\), matériau immobile au-delà\. K supérieur \(P1\), mu inférieur et phi_i supérieur \(5\.2\.4\.1\(4\)\)\.$/,
    'Simplified method of 5.2.4.2, class 2: flow over |θ| <= $1°, high stress at 2 p_hf over an arc of $2° on each side of the flow (P4: extent to be confirmed), stationary material beyond. Higher K (P1), lower μ and higher φ_i (5.2.4.1(4)).',
  ],
  [
    /^Vidange excentree non declenchee : (.+)$/,
    'Eccentric discharge not triggered: $1',
  ],

  // Canaux d'ecoulement de classe 3 (5.2.4.3).
  [
    /^Canal d'écoulement de 5\.2\.4\.3, rayon r_c = (.+) m \(k = (.+), indice (\d)\) : écoulement sur \|theta\| <= (.+)°, contrainte élevée à 2 p_hf sur un arc de (.+)° de chaque côté du canal \(P4 : étendue à confirmer\), matériau immobile au-delà\. K supérieur \(P1\), mu inférieur et phi_i supérieur \(5\.2\.4\.1\(4\)\)\.$/,
    'Flow channel of 5.2.4.3, radius r_c = $1 m (k = $2, index $3): flow over |θ| <= $4°, high stress at 2 p_hf over an arc of $5° on each side of the channel (P4: extent to be confirmed), stationary material beyond. Higher K (P1), lower μ and higher φ_i (5.2.4.1(4)).',
  ],
  [
    /^La methode du canal d ecoulement ne s applique qu aux silos circulaires \(EN 1991-4, 5\.2\.4\.3\)\.$/,
    'The flow channel method applies to circular silos only (EN 1991-4, 5.2.4.3).',
  ],
  [
    /^La methode du canal d ecoulement de 5\.2\.4\.3 est reservee a la classe 3 \(5\.2\.4\.1\(5\)\)\.$/,
    'The flow channel method of 5.2.4.3 is reserved for class 3 (5.2.4.1(5)).',
  ],
  [
    /^Canal (\d) \(k = (.+)\) sans contact avec la paroi : e_c \+ r_c = (.+) m <= r = (.+) m \(EN 1991-4, 5\.2\.4\.3\)\.$/,
    'Channel $1 (k = $2) without wall contact: e_c + r_c = $3 m <= r = $4 m (EN 1991-4, 5.2.4.3).',
  ],
  [
    /^Canal (\d) \(k = (.+)\) : cos theta_c = (.+) n'est pas dans \[-1 ; 1\], geometrie hors perimetre \(EN 1991-4, 5\.2\.4\.3\)\.$/,
    'Channel $1 (k = $2): cos θ_c = $3 is not within [-1; 1], geometry out of scope (EN 1991-4, 5.2.4.3).',
  ],
  [
    /^Canal (\d) \(k = (.+)\) : cos psi = (.+) n'est pas dans \[-1 ; 1\], geometrie hors perimetre \(EN 1991-4, 5\.2\.4\.3\)\.$/,
    'Channel $1 (k = $2): cos ψ = $3 is not within [-1; 1], geometry out of scope (EN 1991-4, 5.2.4.3).',
  ],
  [
    /^Canal (\d) \(k = (.+)\) : les deux expressions de psi ne concordent pas \(sin psi = (.+), attendu (.+)\) : EN 1991-4, 5\.61\.$/,
    'Channel $1 (k = $2): the two expressions of ψ do not agree (sin ψ = $3, expected $4): EN 1991-4, 5.61.',
  ],
  [
    /^Le cas (VID_EXC_\d) n'a pas de canal d'ecoulement calcule\.$/,
    'Case $1 has no calculated flow channel.',
  ],

  // Messages d'erreur generiques du noyau.
  [
    /^(Le|La|L) (.+) doit etre un nombre strictement positif \((.+)\)\.$/,
    (_t, _article: string, nom: string, unite: string) =>
      `The ${nom} must be a strictly positive number (${unite}).`,
  ],
  [
    /^(Le|La|L) (.+) doit etre un nombre strictement compris entre 0 et 90 \(deg\)\.$/,
    (_t, _article: string, nom: string) => `The ${nom} must lie strictly between 0 and 90 (deg).`,
  ],
  [
    /^La profondeur z = (.+) m depasse la hauteur de paroi verticale hc = (.+) m\.$/,
    'The depth z = $1 m exceeds the vertical wall height hc = $2 m.',
  ],
  [
    /^Vidange excentree en classe 3 : methode de 5\.2\.4\.3 non traitee\. Les cas symetriques restent rendus\.$/,
    'Eccentric discharge of class 3: method of 5.2.4.3 not covered. Symmetric cases are still given.',
  ],
];

const traduire = traducteur(EXACTES, REGLES);

/**
 * Phrase du noyau mise en forme pour l'affichage, dans la langue courante.
 * En francais, la phrase est corrigee sans changer ni les valeurs ni les
 * notations ; en anglais, elle est traduite.
 */
export function phrase(texte: string): string {
  if (langueCourante() === 'en') return traduire(texte);
  let sortie = texte.replace(ELISION, "$1$2'").replace(/\b(cas non) tranche\b/gi, '$1 tranché');
  for (const [motif, remplacement] of ACCENTS) sortie = sortie.replace(motif, remplacement);
  sortie = sortie.replace(/\ba (VID|FOND)(?=[ _])/g, 'à $1');
  return sansZeros(sortie).replace(/\ba (la|le|les|l')\b/g, 'à $1');
}
