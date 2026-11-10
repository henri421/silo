// Donnees des cas de validation V1 a V4 (docs/validation/). Fichier de test : ne pas modifier.
import { expect } from 'vitest';
import type { DonneesSilo, Materiau } from '../src/model/types';

const E1 = 'EN 1991-4:2006, tableau E.1';

/** Sable, tableau E.1 (SPEC §3.3), saisi a la main ici pour ne pas dependre du chargeur. */
export function sable(): Materiau {
  const champs = ['gamma_l', 'gamma_u', 'phi_r', 'phi_im', 'a_phi', 'K_m', 'a_K', 'mu_m_D1', 'mu_m_D2', 'mu_m_D3', 'a_mu', 'C_op'];
  return {
    id: 'sable',
    nom: 'Sable',
    gamma_l: 14,
    gamma_u: 16,
    phi_r: 39,
    phi_im: 36,
    a_phi: 1.09,
    K_m: 0.45,
    a_K: 1.11,
    mu_m: { D1: 0.38, D2: 0.48, D3: 0.57 },
    a_mu: 1.16,
    C_op: 0.4,
    sources: Object.fromEntries(champs.map((c) => [c, E1])),
  };
}

function base(): Omit<DonneesSilo, 'silo'> {
  return {
    materiau: sable(),
    parois: { verticale: 'D2', tremie: 'D2', faiblementCohesif: true, engrainementMecanique: false },
    exploitation: {
      e_f: 0,
      e_o: 0,
      vidangeParLeHaut: false,
      ecoulementEnCheminee: false,
      formeMaintenueEnTeteEtEnPied: false,
    },
    discretisation: { dz: 1, pointsProfil: 101 },
  };
}

/** V1 : rectangulaire 6 x 4 m, hc = 20 m, fond plat, vidange centree. */
export function v1(): DonneesSilo {
  return { ...base(), silo: { forme: 'rectangulaire', a: 6, b: 4, hc: 20, fond: 'plat', Z_transition: 0 } };
}

/** V2 : circulaire d = 6 m, t = 0,20 m, hc = 18 m, tremie conique de V4, e_o = 2,0 m. */
export function v2(): DonneesSilo {
  const d = base();
  return {
    ...d,
    silo: { forme: 'circulaire', d: 6, t: 0.2, hc: 18, fond: 'conique', beta: 30, Z_transition: 0 },
    exploitation: { ...d.exploitation, e_o: 2 },
  };
}

/** V3 : circulaire d = 10 m, hc = 15 m, fond plat, intermediaire. */
export function v3(): DonneesSilo {
  return { ...base(), silo: { forme: 'circulaire', d: 10, t: 0.3, hc: 15, fond: 'plat', Z_transition: 0 } };
}

/** V4 : silo de V2 avec sa tremie conique, sans excentrement. */
export function v4(): DonneesSilo {
  return { ...base(), silo: { forme: 'circulaire', d: 6, t: 0.2, hc: 18, fond: 'conique', beta: 30, Z_transition: 0 } };
}

/** V5 : circulaire peu elance d = 12 m, t = 0,25 m, hc = 10 m, fond plat, e_o = 2,0 m. */
export function v5(): DonneesSilo {
  const d = base();
  return {
    ...d,
    silo: { forme: 'circulaire', d: 12, t: 0.25, hc: 10, fond: 'plat', Z_transition: 0 },
    exploitation: { ...d.exploitation, e_o: 2 },
  };
}

/** V6 : silo de V3 sur une tremie conique peu profonde, beta = 60 deg. */
export function v6(): DonneesSilo {
  return { ...base(), silo: { forme: 'circulaire', d: 10, t: 0.3, hc: 15, fond: 'conique', beta: 60, Z_transition: 0 } };
}

/** Verifie une egalite a une tolerance relative (1e-4 par defaut, PLAN.md), ou absolue si l'attendu est nul. */
export function proche(obtenu: number, attendu: number, tol = 1e-4): void {
  expect(Number.isFinite(obtenu), `valeur non finie : ${obtenu}`).toBe(true);
  const ecart = attendu === 0 ? Math.abs(obtenu) : Math.abs(obtenu / attendu - 1);
  expect(ecart, `obtenu ${obtenu}, attendu ${attendu}`).toBeLessThanOrEqual(tol);
}
