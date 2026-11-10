/**
 * Profil normatif des silos : les valeurs que l'annexe nationale peut fixer
 * ou que la norme recommande. AUCUNE valeur nationale n'est codee : le noyau
 * recoit un profil, sur le modele de `ec1Recommande()` de charges-climatiques.
 *
 * Chaque valeur porte sa source ; une source vide BLOQUE le calcul
 * (`verifierProfil`, implemente au lot 1).
 *
 * Interface ecrite par la seance de conception.
 */

/** Une grandeur et le texte d'ou elle vient. */
export interface ValeurSourcee {
  valeur: number;
  /** Norme et clause. Jamais vide. */
  source: string;
}

export interface ProfilSilos {
  /** Nom affiche en permanence par l'interface. */
  nom: string;
  /** Date de consultation des sources, AAAA-MM-JJ. */
  date: string;
  /** Ce que le profil couvre et ne couvre pas. */
  perimetre: string;
  valeurs: {
    /** Capacite (t) sous laquelle un silo est de classe 1, tableau 2.1. */
    capaciteClasse1: ValeurSourcee;
    /** Capacite (t) au-dessus de laquelle un silo est de classe 3, tableau 2.1. */
    capaciteClasse3: ValeurSourcee;
    /** Capacite (t) au-dessus de laquelle l'excentrement mene a la classe 3, tableau 2.1. */
    capaciteExcentrement: ValeurSourcee;
    /** Excentrement relatif e/d_c au-dela duquel la classe 3 s'applique, tableau 2.1. */
    excentrementClasse3: ValeurSourcee;
    /** C_h d'un silo elance, eq. 5.21. */
    C_h_elance: ValeurSourcee;
    /** C_w d'un silo elance, eq. 5.22. */
    C_w_elance: ValeurSourcee;
    /** Pente de C_h en fonction de C_S, silo intermediaire, eq. 5.85. */
    C_h_pente: ValeurSourcee;
    /** Pente de C_w en fonction de C_S, silo intermediaire, eq. 5.86. */
    C_w_pente: ValeurSourcee;
    /** Coefficient b de la tremie, eq. 6.17. */
    b_tremie: ValeurSourcee;
    /** C_b en classe 2 ou 3, 6.1.2(4). */
    C_b: ValeurSourcee;
    /** C_b d'un materiau cohesif ou a engrainement, 6.1.2(5) et (6). */
    C_b_majore: ValeurSourcee;
    /** Angle de la zone d'ecoulement en vidange excentree (deg), 5.2.4.2. */
    theta_c: ValeurSourcee;
    /** Excentrement relatif e/d_c qui declenche la vidange a grand excentrement, 5.2.4.1(2). */
    excentrementGrand: ValeurSourcee;
    /** Elancement hc/dc au-dela duquel e_f declenche la vidange a grand excentrement, 5.2.4.1(2). */
    elancementExcentrementRemplissage: ValeurSourcee;
    /** Rapport d_c/t au-dela duquel la paroi est mince, 5.2.1.4(1). */
    minceurParoi: ValeurSourcee;
    /** Excentrement relatif e_o/d_c sous lequel l'action localisee d'un silo peu elance est nulle, 5.3.2.2(4). */
    excentrementPeuElance: ValeurSourcee;
  };
}

/**
 * Leve si une valeur du profil est inexploitable : nombre non fini, ou source
 * absente. Une valeur sans provenance ne doit jamais atteindre un resultat.
 * Le message nomme la cle de la grandeur en cause.
 */
export function verifierProfil(p: ProfilSilos): void {
  for (const [cle, v] of Object.entries(p.valeurs)) {
    if (v === undefined || v === null || !Number.isFinite(v.valeur)) {
      throw new Error(`Profil « ${p.nom} » : la grandeur ${cle} n'a pas de valeur numerique.`);
    }
    if (typeof v.source !== 'string' || v.source.trim() === '') {
      throw new Error(
        `Profil « ${p.nom} » : la grandeur ${cle} n'a pas de source. ` +
          'Une valeur de provenance inconnue bloque le calcul.',
      );
    }
  }
}

