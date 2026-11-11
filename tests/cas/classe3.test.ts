// Test d'acceptation du lot 11 (T11.3). Ne pas modifier : voir PLAN.md.
// Valeurs attendues : docs/validation/V7-classe3-canal.md, recopiees en dur.
import { describe, expect, it } from 'vitest';
import { calculer, cartePressions, en1991_4Recommande } from '../../src/index';
import type { CasDeCharge, DonneesSilo, IdCas, ResultatSilo } from '../../src/model/types';
import { proche, v2 } from '../fixtures';

const P = en1991_4Recommande();

function exploitation(d: DonneesSilo, e: Partial<DonneesSilo['exploitation']>): DonneesSilo {
  return { ...d, exploitation: { ...d.exploitation, ...e } };
}

function cas(r: ResultatSilo, id: IdCas): CasDeCharge {
  const c = r.cas.find((k) => k.id === id);
  expect(c, id).toBeDefined();
  return c as CasDeCharge;
}

const r3 = calculer(exploitation(v2(), { classeImposee: 3 }), P);

describe('cas de charge de la classe 3 (SPEC §7)', () => {
  it('huit cas, dans l ordre, VID_EXC renvoie aux canaux', () => {
    expect(r3.cas.map((c) => c.id)).toEqual([
      'REMP', 'VID', 'VID_EXC', 'VID_EXC_1', 'VID_EXC_2', 'VID_EXC_3', 'FOND_REMP', 'FOND_VID',
    ]);
    expect(cas(r3, 'VID_EXC').statut).toBe('non-applicable');
    expect(cas(r3, 'VID_EXC').motif).toMatch(/5\.2\.4\.3/);
    for (const id of ['VID_EXC_1', 'VID_EXC_2', 'VID_EXC_3'] as const) {
      expect(cas(r3, id).statut, id).toBe('calcule');
      expect(cas(r3, id).combinaisons.length).toBeGreaterThan(0);
      expect(cas(r3, id).libelle).toMatch(/canal/i);
    }
    expect(r3.pointsOuverts).toEqual(['P1', 'P2', 'P4', 'P5']);
  });
  it('classe 2 : cinq cas, sans canal', () => {
    expect(calculer(v2(), P).cas.map((c) => c.id)).toEqual(['REMP', 'VID', 'VID_EXC', 'FOND_REMP', 'FOND_VID']);
  });
  it('canal 2 : geometrie portee par le cas, profil a z = 9 m', () => {
    const c = cas(r3, 'VID_EXC_2');
    expect(c.canal?.indice).toBe(2);
    proche(c.canal?.theta_c as number, 17.2171);
    proche(c.excentree?.theta_c as number, 17.2171);
    const p = c.profil.find((k) => k.z === 9)!;
    proche(p.p_h_sym, 41.218);
    proche(p.p_h_total, 69.7301);
    proche(p.p_h_loc, 69.7301 - 41.218, 1e-3);
    proche(p.p_w, 28.8538);
  });
  it('bandes et controles pour chaque canal', () => {
    for (const id of ['VID_EXC_1', 'VID_EXC_2', 'VID_EXC_3'] as const) {
      expect(r3.bandes.filter((b) => b.cas === id)).toHaveLength(18);
      expect(r3.controles.some((k) => k.cas === id)).toBe(true);
    }
  });
  it('classe 3 sans vidange excentree : les canaux sont non applicables, avec le motif', () => {
    const r = calculer(exploitation(v2(), { classeImposee: 3, e_o: 0 }), P);
    for (const id of ['VID_EXC_1', 'VID_EXC_2', 'VID_EXC_3'] as const) {
      expect(cas(r, id).statut).toBe('non-applicable');
      expect(cas(r, id).motif).toMatch(/declench|0,25/);
    }
  });
});

describe('carte p(z, theta) d un canal', () => {
  it('VID_EXC_2 a z = 9 m : canal, contrainte elevee, immobile', () => {
    const c = cartePressions(r3, P, 'VID_EXC_2', { pasTheta: 5 });
    expect(c.statut).toBe('calcule');
    expect(c.thetas.some((t) => Math.abs(t - 17.2171) < 1e-3)).toBe(true);
    expect(c.thetas.some((t) => Math.abs(t - 34.4342) < 1e-3)).toBe(true);
    const n = (t: number) => c.points.find((k) => k.z === 9 && Math.abs(k.theta - t) < 1e-6)!;
    proche(n(0).p_h, 12.706);
    proche(n(0).p_w, 5.2577);
    proche(n(20).p_h, 69.7301);
    proche(n(90).p_h, 41.218);
    proche(n(330).p_h, 69.7301);
  });
});
