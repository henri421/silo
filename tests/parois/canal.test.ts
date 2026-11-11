// Test d'acceptation du lot 11 (T11.1). Ne pas modifier : voir PLAN.md.
// Valeurs attendues : docs/validation/V7-classe3-canal.md, recopiees en dur.
import { describe, expect, it } from 'vitest';
import { canalEcoulement, classer, en1991_4Recommande, valeursCanal, zonesCanal } from '../../src/index';
import type { DonneesSilo } from '../../src/model/types';
import { proche, v1, v2 } from '../fixtures';

const P = en1991_4Recommande();

function classe3(d: DonneesSilo): DonneesSilo {
  return { ...d, exploitation: { ...d.exploitation, classeImposee: 3 } };
}

const V7 = classe3(v2());
const cl = classer(V7, P);

describe('profil normatif', () => {
  it('k_1, k_2, k_3 recommandes, avec leur source', () => {
    expect(P.valeurs.k1_canal.valeur).toBe(0.25);
    expect(P.valeurs.k2_canal.valeur).toBe(0.4);
    expect(P.valeurs.k3_canal.valeur).toBe(0.6);
    for (const k of [P.valeurs.k1_canal, P.valeurs.k2_canal, P.valeurs.k3_canal]) expect(k.source).toMatch(/5\.5[234]/);
  });
});

describe('geometrie du canal (5.52 a 5.62), V7', () => {
  const attendus: [1 | 2 | 3, number[]][] = [
    [1, [0.25, 0.75, 2.4217, 10.1656, 44.9084, 1.0645, 3.5367, 1.6408, 0.9867, 7.886]],
    [2, [0.4, 1.2, 2.0584, 17.2171, 47.7298, 1.803, 5.5405, 4.2009, 1.5955, 12.7513]],
    [3, [0.6, 1.8, 1.5441, 28.4682, 52.6034, 2.9812, 8.0046, 9.4679, 2.4391, 19.4931]],
  ];
  for (const [i, [k, r_c, e_c, theta_c, psi, U_wc, U_sc, A_c, z_oc, p_hco]] of attendus) {
    it(`canal ${i} (k = ${k})`, () => {
      const c = canalEcoulement(V7, cl, P, i);
      expect(c.indice).toBe(i);
      proche(c.k, k);
      proche(c.r_c, r_c);
      proche(c.G, k);
      proche(c.eta, 0.506638);
      proche(c.e_c, e_c);
      proche(c.theta_c, theta_c);
      proche(c.psi, psi);
      proche(c.U_wc, U_wc);
      proche(c.U_sc, U_sc);
      proche(c.A_c, A_c);
      proche(c.z_oc, z_oc);
      proche(c.p_hco, p_hco);
    });
  }
});

describe('pressions (5.63 a 5.70), V7', () => {
  const attendus: [1 | 2 | 3, number, number[]][] = [
    [1, 9, [7.8851, 3.2628, 41.218, 17.0557, 74.551, 30.8487]],
    [1, 18, [7.886, 3.2632, 53.1442, 21.9907, 98.4025, 40.7183]],
    [2, 9, [12.706, 5.2577, 41.218, 17.0557, 69.7301, 28.8538]],
    [2, 18, [12.7511, 5.2763, 53.1442, 21.9907, 93.5374, 38.7051]],
    [3, 9, [19.0062, 7.8647, 41.218, 17.0557, 63.4298, 26.2468]],
    [3, 18, [19.4809, 8.0611, 53.1442, 21.9907, 86.8076, 35.9204]],
  ];
  for (const [i, z, [p_hce, p_wce, p_hse, p_wse, p_hae, p_wae]] of attendus) {
    it(`canal ${i}, z = ${z} m`, () => {
      const v = valeursCanal(z, V7, cl, P, canalEcoulement(V7, cl, P, i));
      expect(v.z).toBe(z);
      expect(v.combinaison).toBe('X');
      proche(v.p_hce, p_hce);
      proche(v.p_wce, p_wce);
      proche(v.p_hse, p_hse);
      proche(v.p_wse, p_wse);
      proche(v.p_hae, p_hae);
      proche(v.p_wae, p_wae);
    });
  }
  it('profondeur au-dela de hc refusee', () => {
    expect(() => valeursCanal(19, V7, cl, P, canalEcoulement(V7, cl, P, 2))).toThrow(/hc/);
  });
});

describe('zones du canal (figure 5.5c, P4)', () => {
  it('canal, contrainte elevee sur theta_c de chaque cote, immobile', () => {
    const z = zonesCanal(canalEcoulement(V7, cl, P, 2));
    proche(z.theta_c, 17.2171);
    expect(z.zones.map((k) => k.nom)).toEqual(['ecoulement', 'contrainte-elevee', 'immobile']);
    proche(z.zones[1].thetaMax, 34.4342);
    expect(z.pointsOuverts).toEqual(['P1', 'P4']);
    expect(z.motif).toMatch(/5\.2\.4\.3/);
  });
});

describe('conditions d application', () => {
  it('classe 2 : la methode du canal ne s applique pas', () => {
    expect(() => canalEcoulement(v2(), classer(v2(), P), P, 1)).toThrow(/classe 3/);
  });
  it('vidange excentree non declenchee : refus motive', () => {
    const d = classe3({ ...v2(), exploitation: { ...v2().exploitation, e_o: 0 } });
    expect(() => canalEcoulement(d, classer(d, P), P, 1)).toThrow(/declench/);
  });
  it('silo rectangulaire : refus motive', () => {
    const d = classe3(v1());
    expect(() => canalEcoulement(d, classer(d, P), P, 1)).toThrow(/circulaire/);
  });
});
