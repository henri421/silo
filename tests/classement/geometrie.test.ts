// Test d'acceptation du lot 1 (T1.4). Ne pas modifier : voir PLAN.md.
import { describe, expect, it } from 'vitest';
import { grandeursGeometriques, hauteurTremie, talus, volumeTremie } from '../../src/classement/geometrie';
import type { Silo } from '../../src/model/types';
import { proche } from '../fixtures';

const rect = (a: number, b: number, fond: Silo['fond'] = 'plat', beta?: number): Silo => ({
  forme: 'rectangulaire',
  a,
  b,
  hc: 10,
  fond,
  beta,
  Z_transition: 0,
});

const cercle = (d: number, fond: Silo['fond'] = 'plat', beta?: number): Silo => ({
  forme: 'circulaire',
  d,
  t: 0.2,
  hc: 18,
  fond,
  beta,
  Z_transition: 0,
});

describe('grandeurs geometriques (SPEC §4.1)', () => {
  it('rectangle : d_c est le petit cote', () => {
    const g = grandeursGeometriques(rect(6, 4));
    proche(g.A, 24);
    proche(g.U, 20);
    proche(g.d_c, 4);
    proche(g.r, 2);
  });
  it('cercle', () => {
    const g = grandeursGeometriques(cercle(6));
    proche(g.A, 28.2743);
    proche(g.U, 18.8496);
    proche(g.d_c, 6);
    proche(g.r, 3);
  });
});

describe('tremies : h_h = (d_c/2)/tan(beta) jusqu a la pointe virtuelle', () => {
  it('cone de V4', () => {
    proche(hauteurTremie(cercle(6, 'conique', 30)) as number, 5.1962);
    proche(volumeTremie(cercle(6, 'conique', 30)), 48.9726);
  });
  it('fond plat : pas de tremie', () => {
    expect(hauteurTremie(rect(6, 4))).toBeNull();
    expect(volumeTremie(rect(6, 4))).toBe(0);
  });
  it('pyramide (a b h / 3) et biseau (a b h / 2), beta = 45 deg', () => {
    proche(hauteurTremie(rect(4, 4, 'pyramidale-carree', 45)) as number, 2);
    proche(volumeTremie(rect(4, 4, 'pyramidale-carree', 45)), 32 / 3);
    proche(hauteurTremie(rect(6, 4, 'pyramidale-rectangulaire', 45)) as number, 2);
    proche(volumeTremie(rect(6, 4, 'pyramidale-rectangulaire', 45)), 16);
    proche(hauteurTremie(rect(6, 4, 'biseau', 45)) as number, 2);
    proche(volumeTremie(rect(6, 4, 'biseau', 45)), 24);
  });
});

describe('talus (5.77, 5.78)', () => {
  it('cone : h_o = r tan(phi_r)/3, h_tp = r tan(phi_r)', () => {
    const t = talus(cercle(10), 39);
    proche(t.h_o, 1.3496);
    proche(t.h_tp, 4.0489);
  });
  it('prisme : h_o = d_c tan(phi_r)/4, h_tp = d_c tan(phi_r)/2', () => {
    const t = talus(rect(6, 4), 45);
    proche(t.h_o, 1);
    proche(t.h_tp, 2);
  });
});
