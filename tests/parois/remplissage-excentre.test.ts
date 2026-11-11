// Test d'acceptation du lot 11 (T11.2). Ne pas modifier : voir PLAN.md.
// Valeurs attendues : docs/validation/V8-remplissage-excentre.md, recopiees en dur.
import { describe, expect, it } from 'vitest';
import { calculer, classer, en1991_4Recommande, nzSkAdditionnel, remplissageExcentre } from '../../src/index';
import type { DonneesSilo } from '../../src/model/types';
import { proche, v1, v2, v5 } from '../fixtures';

const P = en1991_4Recommande();

function variante(d: DonneesSilo, e: Partial<DonneesSilo['exploitation']>): DonneesSilo {
  return { ...d, exploitation: { ...d.exploitation, ...e } };
}

const V8 = variante(v5(), { classeImposee: 3, e_t: 4 });

describe('declenchement (5.3.3(1))', () => {
  it('V8 : declenche, grandeurs de 5.93 a 5.96', () => {
    const re = remplissageExcentre(V8, classer(V8, P), P);
    expect(re.declenche).toBe(true);
    expect(re.motif).toMatch(/5\.3\.3/);
    proche(re.e_t, 4);
    proche(re.K as number, 0.4995);
    proche(re.mu as number, 0.5568);
    proche(re.p_ho as number, 86.2069);
    proche(re.h_o as number, 0.8998);
    proche(re.B as number, 9.8869);
  });
  it('e_t vide : e_f est retenu', () => {
    const d = variante(v5(), { classeImposee: 3, e_f: 4 });
    const re = remplissageExcentre(d, classer(d, P), P);
    expect(re.declenche).toBe(true);
    proche(re.e_t, 4);
  });
  it('conditions manquantes : motif qui les nomme, grandeurs nulles', () => {
    const cas: [DonneesSilo, RegExp][] = [
      [variante(v5(), { classeImposee: 3, e_t: 2 }), /0,25/],
      [variante(v2(), { e_t: 2 }), /classe 3/],
      [variante(v2(), { classeImposee: 3, e_t: 2 }), /2,0/],
      [variante(v1(), { classeImposee: 3, e_t: 2 }), /circulaire/],
    ];
    for (const [d, motif] of cas) {
      const re = remplissageExcentre(d, classer(d, P), P);
      expect(re.declenche).toBe(false);
      expect(re.motif).toMatch(motif);
      expect(re.B).toBeNull();
    }
  });
});

describe('force verticale additionnelle (5.92, P8)', () => {
  const re = remplissageExcentre(V8, classer(V8, P), P);
  it('V8 : valeurs a z = z_s - h_o,e', () => {
    proche(nzSkAdditionnel(1.1002, re), 27.4586, 1e-3);
    proche(nzSkAdditionnel(4.1002, re), 86.4169, 1e-3);
    proche(nzSkAdditionnel(9.1002, re), 224.4511, 1e-3);
    proche(nzSkAdditionnel(10, re), 253.6689);
  });
  it('hors declenchement : zero', () => {
    const d = variante(v5(), { classeImposee: 3, e_t: 2 });
    expect(nzSkAdditionnel(5, remplissageExcentre(d, classer(d, P), P))).toBe(0);
  });
});

describe('dans le calcul complet', () => {
  it('REMP : n_zSk du remplissage symetrique augmente de 5.92, P8 signale', () => {
    const avec = calculer(V8, P);
    const sans = calculer(variante(V8, { e_t: 0 }), P);
    expect(avec.remplissageExcentre.declenche).toBe(true);
    expect(sans.remplissageExcentre.declenche).toBe(false);
    const n = (r: typeof avec) => r.cas.find((c) => c.id === 'REMP')!.profil.find((k) => k.z === 10)!;
    proche(n(avec).n_zSk - n(sans).n_zSk, 253.6689);
    expect(n(avec).p_h_total).toBe(n(sans).p_h_total);
    expect(avec.pointsOuverts).toContain('P8');
    expect(sans.pointsOuverts).not.toContain('P8');
  });
});
