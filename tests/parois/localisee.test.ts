// Test d'acceptation du lot 3. Ne pas modifier : voir PLAN.md.
// Valeurs attendues : docs/validation/V1, V2, V3 et V5, recopiees en dur.
import { describe, expect, it } from 'vitest';
import { classer } from '../../src/classement/classement';
import { en1991_4Recommande } from '../../src/norms/en1991-4-recommande';
import { actionLocalisee, coefficientCpe, coefficientCpf, valeursLocalisees } from '../../src/parois/localisee';
import { etatParoi } from '../../src/parois/symetrique';
import type { DonneesSilo } from '../../src/model/types';
import { proche, v1, v2, v3, v5 } from '../fixtures';

const P = en1991_4Recommande();

function exploitation(d: DonneesSilo, e: Partial<DonneesSilo['exploitation']>): DonneesSilo {
  return { ...d, exploitation: { ...d.exploitation, ...e } };
}

function silo(d: DonneesSilo, s: Partial<DonneesSilo['silo']>): DonneesSilo {
  return { ...d, silo: { ...d.silo, ...s } };
}

describe('coefficients C_pf (5.9 a 5.11) et C_pe (5.28 a 5.30)', () => {
  it('V1 : E = 0', () => {
    const cl = classer(v1(), P);
    proche(coefficientCpf(v1(), cl), 0.083792);
    proche(coefficientCpe(v1(), cl), 0.167584);
  });
  it('V2 : E = 0,6667 par e_o', () => {
    const cl = classer(v2(), P);
    proche(coefficientCpf(v2(), cl), 0.079818);
    proche(coefficientCpe(v2(), cl), 0.301534);
  });
  it('V3 : intermediaire, branche hc/dc >= 1,2', () => {
    const cl = classer(v3(), P);
    proche(coefficientCpf(v3(), cl), 0.044321);
    proche(coefficientCpe(v3(), cl), 0.088642);
  });
  it('V5 : hc/dc < 1,2, maximum de 5.28, 5.30 et 0', () => {
    const cl = classer(v5(), P);
    proche(coefficientCpe(v5(), cl), 0.018133);
  });
  it('C_pf ramene a 0 s il est negatif', () => {
    const d = v5();
    expect(coefficientCpf(d, classer(d, P))).toBe(0);
  });
});

describe('V1 : non circulaire, majoration uniforme 0,36 (5.2.1.5, 5.2.2.5)', () => {
  const d = v1();
  const cl = classer(d, P);
  const a = actionLocalisee(d, cl, P);
  it('formes et s', () => {
    expect(a.remplissage.forme).toBe('non-circulaire');
    expect(a.vidange.forme).toBe('non-circulaire');
    proche(a.s, 0.7854);
    proche(a.remplissage.C, 0.083792);
    proche(a.vidange.C, 0.167584);
  });
  it('p_pf,nc et p_pe,nc, totaux', () => {
    const attendus: [number, number, number, number, number][] = [
      [1, 0.2215, 7.5631, 0.5094, 8.9522],
      [5, 0.8081, 27.5971, 1.8586, 32.6659],
      [10, 1.1496, 39.261, 2.6442, 46.4722],
      [20, 1.355, 46.2744, 3.1165, 54.7738],
    ];
    for (const [z, pf, tf, pe, te] of attendus) {
      const e = etatParoi(z, d, cl, P);
      const r = valeursLocalisees(a.remplissage, a, d, e.remplissage);
      proche(r.p_nc, pf);
      proche(r.p_h_total, tf);
      const v = valeursLocalisees(a.vidange, a, d, e.vidange!);
      proche(v.p_nc, pe);
      proche(v.p_h_total, te);
    }
  });
});

describe('V2 : circulaire, paroi epaisse, action localisee (5.2.1.3, 5.2.2.3)', () => {
  const d = v2();
  const cl = classer(d, P);
  const a = actionLocalisee(d, cl, P);
  it('forme, s et position simplifiee en classe 2', () => {
    expect(a.remplissage.forme).toBe('circulaire-epaisse');
    expect(a.vidange.forme).toBe('circulaire-epaisse');
    proche(a.E, 0.6667, 1e-3);
    proche(a.s, 1.1781);
    proche(a.remplissage.z_p as number, 9);
  });
  it('p_pf, p_pfi, p_pe, p_pei', () => {
    const attendus: [number, number, number, number, number][] = [
      [9, 3.2899, 0.47, 14.2929, 2.0418],
      [18, 4.2419, 0.606, 18.4285, 2.6326],
    ];
    for (const [z, pf, pfi, pe, pei] of attendus) {
      const e = etatParoi(z, d, cl, P);
      const r = valeursLocalisees(a.remplissage, a, d, e.remplissage);
      proche(r.p_p, pf);
      proche(r.p_pi, pfi);
      const v = valeursLocalisees(a.vidange, a, d, e.vidange!);
      proche(v.p_p, pe);
      proche(v.p_pi, pei);
    }
  });
  it('majoration uniforme de 5.2.3 si choisie et si la forme est maintenue : zeta, p_hf,u et p_he,u', () => {
    const m = exploitation(d, { methodeLocalisee: 'majoration-uniforme', formeMaintenueEnTeteEtEnPied: true });
    const am = actionLocalisee(m, classer(m, P), P);
    expect(am.remplissage.forme).toBe('majoration-uniforme');
    proche(am.remplissage.zeta as number, 1.0);
    const attendus: [number, number, number][] = [
      [9, 44.508, 61.6937],
      [18, 57.3861, 79.5444],
    ];
    for (const [z, hfu, heu] of attendus) {
      const e = etatParoi(z, m, classer(m, P), P);
      proche(valeursLocalisees(am.remplissage, am, m, e.remplissage).p_h_total, hfu);
      proche(valeursLocalisees(am.vidange, am, m, e.vidange!).p_h_total, heu);
    }
  });
  it('majoration choisie sans forme maintenue : action localisee conservee, motif 5.2.3(3)', () => {
    const m = exploitation(d, { methodeLocalisee: 'majoration-uniforme', formeMaintenueEnTeteEtEnPied: false });
    const am = actionLocalisee(m, classer(m, P), P);
    expect(am.remplissage.forme).toBe('circulaire-epaisse');
    expect(am.remplissage.motif).toMatch(/5\.2\.3\(3\)/);
  });
  it('en classe 3, pas de position simplifiee', () => {
    const m = exploitation(d, { classeImposee: 3 });
    expect(actionLocalisee(m, classer(m, P), P).remplissage.z_p).toBeNull();
  });
});

describe('circulaire, paroi mince (5.2.1.4, 5.2.2.4)', () => {
  const d = silo(v2(), { t: 0.02 });
  const cl = classer(d, P);
  it('soudee, classe 2 : F_pf = (pi/2) s d_c p_pf et z_p = min(z_o ; 0,5 hc)', () => {
    const a = actionLocalisee(d, cl, P);
    expect(a.remplissage.forme).toBe('circulaire-mince');
    proche(a.remplissage.z_p as number, 7.2573);
    const r = valeursLocalisees(a.remplissage, a, d, etatParoi(9, d, cl, P).remplissage);
    proche(r.p_p, 3.2899);
    proche(r.F_p as number, (Math.PI / 2) * 1.1781 * 6 * 3.2899, 1e-3);
  });
  it('boulonnee, classe 2 : hors perimetre, point ouvert P3', () => {
    const b = exploitation(d, { assemblage: 'boulonne' });
    const a = actionLocalisee(b, classer(b, P), P);
    expect(a.remplissage.forme).toBe('hors-perimetre');
    expect(a.remplissage.pointOuvert).toBe('P3');
    expect(a.remplissage.motif).toMatch(/5\.2\.1\.4\(4\)/);
  });
});

describe('V3 : intermediaire', () => {
  const d = v3();
  const cl = classer(d, P);
  it('remplissage : C_pf selon 5.9 ; vidange classe 2 sans forme maintenue : action localisee (P7)', () => {
    const a = actionLocalisee(d, cl, P);
    expect(a.remplissage.forme).toBe('circulaire-epaisse');
    proche(a.remplissage.C, 0.044321);
    expect(a.vidange.forme).toBe('circulaire-epaisse');
    proche(a.vidange.C, 0.088642);
    expect(a.vidange.pointOuvert).toBe('P7');
  });
});

describe('V5 : peu elance, e_o >= 0,1 d_c', () => {
  const d = v5();
  const cl = classer(d, P);
  it('remplissage nul (5.3.1.2(3))', () => {
    const a = actionLocalisee(d, cl, P);
    expect(a.remplissage.forme).toBe('nulle');
    expect(a.remplissage.C).toBe(0);
    expect(a.remplissage.motif).toMatch(/5\.3\.1\.2\(3\)/);
    const r = valeursLocalisees(a.remplissage, a, d, etatParoi(5, d, cl, P).remplissage);
    expect(r.p_p).toBe(0);
    proche(r.p_h_total, 36.2214);
  });
  it('vidange sans forme maintenue : action localisee, p_pe et p_pei (P7)', () => {
    const a = actionLocalisee(d, cl, P);
    expect(a.vidange.forme).toBe('circulaire-epaisse');
    expect(a.vidange.pointOuvert).toBe('P7');
    const attendus: [number, number, number][] = [
      [5, 0.6568, 0.0938],
      [10, 1.1631, 0.1662],
    ];
    for (const [z, pe, pei] of attendus) {
      const v = valeursLocalisees(a.vidange, a, d, etatParoi(z, d, cl, P).vidange!);
      proche(v.p_p, pe);
      proche(v.p_pi, pei, 1e-3);
    }
  });
  it('vidange avec forme maintenue : majoration uniforme de 5.2.3 par 5.3.2.3 (P7)', () => {
    const m = exploitation(d, { formeMaintenueEnTeteEtEnPied: true });
    const a = actionLocalisee(m, classer(m, P), P);
    expect(a.vidange.forme).toBe('majoration-uniforme');
    expect(a.vidange.motif).toMatch(/5\.3\.2\.3/);
    proche(valeursLocalisees(a.vidange, a, m, etatParoi(5, m, classer(m, P), P).vidange!).p_h_total, 36.8782);
    proche(valeursLocalisees(a.vidange, a, m, etatParoi(10, m, classer(m, P), P).vidange!).p_h_total, 65.3046);
  });
  it('e_o < 0,1 d_c : vidange nulle (5.3.2.2(4))', () => {
    const m = exploitation(d, { e_o: 1.0 });
    const a = actionLocalisee(m, classer(m, P), P);
    expect(a.vidange.forme).toBe('nulle');
    expect(a.vidange.motif).toMatch(/5\.3\.2\.2\(4\)/);
  });
});

describe('ecoulement en cheminee : vidange nulle avec le motif de 5.1(8)', () => {
  it('V1', () => {
    const d = exploitation(v1(), { ecoulementEnCheminee: true });
    const a = actionLocalisee(d, classer(d, P), P);
    expect(a.vidange.forme).toBe('nulle');
    expect(a.vidange.motif).toMatch(/5\.1\(8\)/);
    expect(a.remplissage.forme).toBe('non-circulaire');
  });
});
