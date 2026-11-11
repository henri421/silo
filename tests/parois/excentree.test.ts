// Test d'acceptation du lot 5. Ne pas modifier : voir PLAN.md.
// Valeurs attendues : docs/validation/V2, recopiees en dur. Applique P1 et P4.
import { describe, expect, it } from 'vitest';
import { classer } from '../../src/classement/classement';
import { en1991_4Recommande } from '../../src/norms/en1991-4-recommande';
import {
  declenchementExcentree,
  pressionsEnTheta,
  valeursExcentrees,
  zonesExcentrees,
} from '../../src/parois/excentree';
import type { DonneesSilo } from '../../src/model/types';
import { proche, v1, v2, v3 } from '../fixtures';

const P = en1991_4Recommande();

function circulaire(d: number, hc: number, e: Partial<DonneesSilo['exploitation']>): DonneesSilo {
  const b = v3();
  return { ...b, silo: { ...b.silo, d, t: d / 50, hc }, exploitation: { ...b.exploitation, ...e } };
}

describe('declenchement (5.2.4.1, 5.3.4)', () => {
  it('V2 : e_o = 2,0 m > 0,25 d_c = 1,5 m', () => {
    const r = declenchementExcentree(v2(), classer(v2(), P), P);
    expect(r.declenche).toBe(true);
    expect(r.parEo).toBe(true);
    expect(r.parEf).toBe(false);
    expect(r.motif).toMatch(/5\.2\.4\.1/);
  });
  it('par e_f seulement si hc/dc > 4,0', () => {
    const elance = circulaire(4, 20, { e_f: 1.2 });
    const r = declenchementExcentree(elance, classer(elance, P), P);
    expect(r.declenche).toBe(true);
    expect(r.parEf).toBe(true);
    const moins = circulaire(6, 18, { e_f: 1.6 });
    expect(declenchementExcentree(moins, classer(moins, P), P).declenche).toBe(false);
  });
  it('silo intermediaire : declenche par e_o, clause 5.3.4', () => {
    const d = circulaire(6, 9, { e_o: 2 });
    const r = declenchementExcentree(d, classer(d, P), P);
    expect(r.declenche).toBe(true);
    expect(r.motif).toMatch(/5\.3\.4/);
  });
  it('excentrement egal a 0,25 d_c : pas de declenchement (inegalite stricte)', () => {
    const d = circulaire(6, 18, { e_o: 1.5 });
    expect(declenchementExcentree(d, classer(d, P), P).declenche).toBe(false);
  });
  it('silo rectangulaire : non applicable, avec motif', () => {
    const r = declenchementExcentree(v1(), classer(v1(), P), P);
    expect(r.declenche).toBe(false);
    expect(r.motif).toMatch(/circulaire/);
  });
});

describe('V2 : classe 2, methode de 5.2.4.2', () => {
  const d = v2();
  const cl = classer(d, P);
  it('zones en theta (P4) : 35 et 70 deg', () => {
    const z = zonesExcentrees(d, cl, P);
    proche(z.theta_c, 35);
    expect(z.zones).toEqual([
      { nom: 'ecoulement', thetaMin: 0, thetaMax: 35 },
      { nom: 'contrainte-elevee', thetaMin: 35, thetaMax: 70 },
      { nom: 'immobile', thetaMin: 70, thetaMax: 180 },
    ]);
    expect(z.pointsOuverts).toEqual(['P1', 'P4']);
  });
  it('valeurs aux deux niveaux, combinaison X', () => {
    const attendus: [number, number, number, number, number][] = [
      [9, 41.218, 82.4361, 17.0557, 34.1115],
      [18, 53.1442, 106.2885, 21.9907, 43.9814],
    ];
    for (const [z, hse, hae, wse, wae] of attendus) {
      const v = valeursExcentrees(z, d, cl, P);
      expect(v.combinaison).toBe('X');
      expect(v.p_hce).toBe(0);
      expect(v.p_wce).toBe(0);
      proche(v.p_hse, hse);
      proche(v.p_hae, hae);
      proche(v.p_wse, wse);
      proche(v.p_wae, wae);
    }
  });
  it('pression selon l angle, symetrique de part et d autre de l axe', () => {
    const v = valeursExcentrees(9, d, cl, P);
    const z = zonesExcentrees(d, cl, P);
    expect(pressionsEnTheta(v, z, 0)).toEqual({ p_h: 0, p_w: 0 });
    expect(pressionsEnTheta(v, z, 35)).toEqual({ p_h: 0, p_w: 0 });
    expect(pressionsEnTheta(v, z, 50)).toEqual({ p_h: v.p_hae, p_w: v.p_wae });
    expect(pressionsEnTheta(v, z, -50)).toEqual({ p_h: v.p_hae, p_w: v.p_wae });
    expect(pressionsEnTheta(v, z, 70)).toEqual({ p_h: v.p_hae, p_w: v.p_wae });
    expect(pressionsEnTheta(v, z, 120)).toEqual({ p_h: v.p_hse, p_w: v.p_wse });
    expect(pressionsEnTheta(v, z, 300)).toEqual({ p_h: v.p_hae, p_w: v.p_wae });
  });
});

describe('classe 3 : la methode simplifiee de 5.2.4.2 ne s applique pas', () => {
  it('erreur explicite qui renvoie a 5.2.4.3 (lot 11)', () => {
    const d: DonneesSilo = { ...v2(), exploitation: { ...v2().exploitation, classeImposee: 3 } };
    const cl = classer(d, P);
    expect(() => zonesExcentrees(d, cl, P)).toThrow(
      'Methode simplifiee de 5.2.4.2 reservee a la classe 2 (5.2.4.1(5)) : en classe 3, voir les cas VID_EXC_1 a VID_EXC_3 (5.2.4.3).',
    );
    expect(() => valeursExcentrees(9, d, cl, P)).toThrow(/5\.2\.4\.3/);
  });
  it('non declenche : zonesExcentrees leve une erreur qui le dit', () => {
    expect(() => zonesExcentrees(v1(), classer(v1(), P), P)).toThrow(/declench/);
  });
});
