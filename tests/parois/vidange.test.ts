// Test d'acceptation du lot 2 (T2.3 et T2.4). Ne pas modifier : voir PLAN.md.
// Valeurs attendues : docs/validation/V1, V2 et V3, recopiees en dur.
import { describe, expect, it } from 'vitest';
import { classer } from '../../src/classement/classement';
import { en1991_4Recommande } from '../../src/norms/en1991-4-recommande';
import { coefficientsVidange } from '../../src/parois/vidange';
import { etatParoi } from '../../src/parois/symetrique';
import type { DonneesSilo } from '../../src/model/types';
import { proche, v1, v2, v3 } from '../fixtures';

const P = en1991_4Recommande();

function exploitation(d: DonneesSilo, e: Partial<DonneesSilo['exploitation']>): DonneesSilo {
  return { ...d, exploitation: { ...d.exploitation, ...e } };
}

describe('coefficients de vidange (SPEC §5.3)', () => {
  it('elance, classe 2 : 1,15 et 1,10 (5.21, 5.22)', () => {
    const k = coefficientsVidange(v1(), classer(v1(), P), P);
    proche(k.C_h, 1.15);
    proche(k.C_w, 1.1);
    expect(k.C_S).toBeNull();
    expect(k.motif).toMatch(/5\.21/);
  });
  it('intermediaire : 1 + 0,15 C_S et 1 + 0,10 C_S (5.85 a 5.87), V3', () => {
    const k = coefficientsVidange(v3(), classer(v3(), P), P);
    proche(k.C_S as number, 0.5);
    proche(k.C_h, 1.075);
    proche(k.C_w, 1.05);
    expect(k.motif).toMatch(/5\.85/);
  });
  it('peu elance : 1,0 et 1,0 (5.3.2.1(2))', () => {
    const d = v3();
    const pe = { ...d, silo: { ...d.silo, hc: 8 } };
    const k = coefficientsVidange(pe, classer(pe, P), P);
    expect([k.C_h, k.C_w]).toEqual([1, 1]);
    expect(k.motif).toMatch(/5\.3\.2\.1/);
  });
  it('vidange par le haut : 1,0 et 1,0 pour tout elancement (5.20, 5.84)', () => {
    for (const d of [v1(), v3()]) {
      const h = exploitation(d, { vidangeParLeHaut: true });
      const k = coefficientsVidange(h, classer(h, P), P);
      expect([k.C_h, k.C_w]).toEqual([1, 1]);
      expect(k.motif).toMatch(/5\.20/);
    }
  });
});

describe('V1 : etat de la paroi, cas symetriques', () => {
  const d = v1();
  const cl = classer(d, P);
  it('remplissage : p_h en C1, p_w et n_zSk en C2, p_v en C3', () => {
    const e = etatParoi(20, d, cl, P);
    proche(e.remplissage.p_h, 44.9194);
    proche(e.remplissage.p_w, 19.0137);
    proche(e.remplissage.n_zSk, 301.9623);
    proche(e.remplissage.p_v, 107.4648);
    expect(e.combinaisons).toEqual({ p_h: 'C1', p_w: 'C2', n_zSk: 'C2', p_v: 'C3' });
  });
  it('vidange : p_he, p_we et n_zSk', () => {
    const attendus: [number, number, number, number][] = [
      [1, 8.4428, 4.3691, 2.2689],
      [5, 30.8073, 14.4915, 43.0742],
      [10, 43.8281, 19.0396, 129.0504],
      [20, 51.6573, 20.9151, 332.1585],
    ];
    for (const [z, p_h, p_w, n] of attendus) {
      const v = etatParoi(z, d, cl, P).vidange;
      expect(v).not.toBeNull();
      proche(v!.p_h, p_h);
      proche(v!.p_w, p_w);
      proche(v!.n_zSk, n);
    }
  });
  it('p_v n est pas majore a la vidange', () => {
    const e = etatParoi(20, d, cl, P);
    proche(e.vidange!.p_v, 107.4648);
  });
});

describe('V2 : vidange en C1', () => {
  it('p_he', () => {
    const d = v2();
    const cl = classer(d, P);
    proche(etatParoi(9, d, cl, P).vidange!.p_h, 47.4007);
    proche(etatParoi(18, d, cl, P).vidange!.p_h, 61.1159);
  });
});

describe('V3 : intermediaire', () => {
  const d = v3();
  const cl = classer(d, P);
  it('p_hf et p_he', () => {
    const attendus: [number, number, number][] = [
      [2, 8.7148, 9.3684],
      [5, 36.2624, 38.9821],
      [10, 59.2641, 63.7089],
      [15, 70.7994, 76.1093],
    ];
    for (const [z, f, e] of attendus) {
      const r = etatParoi(z, d, cl, P);
      proche(r.remplissage.p_h, f);
      proche(r.vidange!.p_h, e);
    }
  });
  it('p_wf, p_we et n_zSk de vidange', () => {
    const a = etatParoi(5, d, cl, P);
    proche(a.remplissage.p_w, 18.0638);
    proche(a.vidange!.p_w, 18.9669);
    proche(a.vidange!.n_zSk, 40.2892);
    const b = etatParoi(15, d, cl, P);
    proche(b.remplissage.p_w, 31.7311);
    proche(b.vidange!.p_w, 33.3177);
    proche(b.vidange!.n_zSk, 320.5423);
  });
  it('p_vf au fond en C3', () => {
    proche(etatParoi(15, d, cl, P).remplissage.p_v, 143.2587);
  });
});

describe('ecoulement en cheminee garanti (5.1(8))', () => {
  it('la vidange est non applicable, avec son motif ; le remplissage reste', () => {
    const d = exploitation(v1(), { ecoulementEnCheminee: true });
    const e = etatParoi(10, d, classer(d, P), P);
    expect(e.vidange).toBeNull();
    expect(e.motifVidange).toMatch(/5\.1\(8\)/);
    proche(e.remplissage.p_h, 38.1114);
  });
  it('sans cheminee, pas de motif', () => {
    expect(etatParoi(10, v1(), classer(v1(), P), P).motifVidange).toBeNull();
  });
});

describe('domaine de z', () => {
  it('z au dela de hc leve une erreur qui nomme hc', () => {
    expect(() => etatParoi(20.5, v1(), classer(v1(), P), P)).toThrow(/hc/);
  });
});
