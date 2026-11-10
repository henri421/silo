// Test d'acceptation du lot 4. Ne pas modifier : voir PLAN.md.
// Valeurs attendues : docs/validation/V1, V3, V4 et V6, recopiees en dur.
import { describe, expect, it } from 'vitest';
import { classer } from '../../src/classement/classement';
import { en1991_4Recommande } from '../../src/norms/en1991-4-recommande';
import { coefficientCb, pressionTransition } from '../../src/fond/transition';
import { fondPlat } from '../../src/fond/fond-plat';
import {
  classerTremie,
  coefficientS,
  facteurWalker,
  parametresTremie,
  pressionsTremie,
  pvTremie,
} from '../../src/fond/tremie';
import { valeursCaracteristiques } from '../../src/proprietes/caracteristiques';
import type { DonneesSilo } from '../../src/model/types';
import { proche, v1, v3, v4, v6 } from '../fixtures';

const P = en1991_4Recommande();

function parois(d: DonneesSilo, p: Partial<DonneesSilo['parois']>): DonneesSilo {
  return { ...d, parois: { ...d.parois, ...p } };
}

describe('C_b (6.1.2)', () => {
  it('1,0 en classe 2 pour un materiau faiblement cohesif', () => {
    expect(coefficientCb(v1(), P).C_b).toBe(1.0);
  });
  it('1,2 si le materiau n est pas faiblement cohesif ou s il est sujet a engrainement', () => {
    expect(coefficientCb(parois(v1(), { faiblementCohesif: false }), P).C_b).toBe(1.2);
    expect(coefficientCb(parois(v1(), { engrainementMecanique: true }), P).C_b).toBe(1.2);
    expect(coefficientCb(parois(v1(), { faiblementCohesif: false }), P).motif).toMatch(/6\.1\.2/);
  });
});

describe('V1 : fond plat d un silo elance (6.2.1)', () => {
  it('p_vft en C3 avec C_b = 1,0 puis 1,2', () => {
    const t = pressionTransition(v1(), classer(v1(), P), P, 'remplissage');
    expect(t.combinaison).toBe('C3');
    proche(t.p_vft, 107.4648);
    const h = parois(v1(), { faiblementCohesif: false });
    proche(pressionTransition(h, classer(h, P), P, 'remplissage').p_vft, 128.9578);
  });
  it('p_v uniforme, identique a la vidange', () => {
    const f = fondPlat(v1(), classer(v1(), P), P);
    expect(f.methode).toBe('6.2.1');
    proche(f.p_v, 107.4648);
    expect(f.facteur).toBeNull();
    const t = pressionTransition(v1(), classer(v1(), P), P, 'vidange');
    expect(t.combinaison).toBe('C3');
    proche(t.p_vft, 107.4648);
  });
});

describe('V3 : fond plat d un silo intermediaire (6.2.2, eq. 6.13 a 6.15)', () => {
  it('p_vb, p_vtp, p_vho, facteur d interpolation et p_vsq', () => {
    const f = fondPlat(v3(), classer(v3(), P), P);
    expect(f.methode).toBe('6.2.2');
    proche(f.p_vb as number, 143.2587);
    proche(f.p_vtp as number, 64.7827);
    proche(f.p_vho as number, 21.5942);
    proche(f.facteur as number, 0.313458);
    proche(f.p_v, 156.7965);
    expect(f.motif).toMatch(/6\.2\.2\(4\)/);
  });
  it('fondPlat refuse une tremie', () => {
    expect(() => fondPlat(v4(), classer(v4(), P), P)).toThrow(/plat/);
  });
});

describe('classement de la tremie (6.1) et coefficient S (6.9 a 6.11)', () => {
  it('V4 profonde, V6 peu profonde', () => {
    const vc4 = valeursCaracteristiques(v4().materiau, v4().parois);
    expect(classerTremie(v4(), vc4)).toBe('profonde');
    const vc6 = valeursCaracteristiques(v6().materiau, v6().parois);
    expect(classerTremie(v6(), vc6)).toBe('peu-profonde');
  });
  it('S selon la forme', () => {
    const base = v1().silo;
    expect(coefficientS(v4().silo)).toBe(2);
    expect(coefficientS({ ...base, a: 4, b: 4, fond: 'pyramidale-carree', beta: 30 })).toBe(2);
    expect(coefficientS({ ...base, fond: 'biseau', beta: 30 })).toBe(1);
    proche(coefficientS({ ...base, fond: 'pyramidale-rectangulaire', beta: 30 }), 1 + 4 / 6);
  });
});

describe('eq. 6.7 et son cas limite n = 1', () => {
  it('h_h = 4, gamma = 10, p_vft = 50, x = 2', () => {
    proche(pvTremie(2, 4, 10, 1, 50), 38.8629);
    proche(pvTremie(2, 4, 10, 1 + 1e-12, 50), 38.8629);
    proche(pvTremie(2, 4, 10, 1.5, 50), 29.3934);
  });
  it('x hors de ]0 ; h_h] leve une erreur', () => {
    expect(() => pvTremie(5, 4, 10, 1.5, 50)).toThrow(/x/);
  });
});

describe('V4 : tremie conique profonde', () => {
  const d = v4();
  const cl = classer(d, P);
  it('remplissage (6.3.2) : p_vft, F_f, n et pressions', () => {
    const t = parametresTremie(d, cl, P, 'remplissage');
    expect(t.profondeur).toBe('profonde');
    expect(t.combinaison).toBe('T1');
    proche(t.h_h, 5.1962);
    proche(t.p_vft, 123.9557);
    proche(t.F, 0.916502);
    proche(t.n, 1.146737);
    const attendus: [number, number, number, number][] = [
      [5.1962, 123.9557, 113.6056, 47.0092],
      [2.5981, 83.3807, 76.4186, 31.6215],
      [1.299, 51.3569, 47.0687, 19.4767],
    ];
    for (const [x, p_v, p_n, p_t] of attendus) {
      const r = pressionsTremie(t, Math.min(x, t.h_h));
      proche(r.p_v, p_v);
      proche(r.p_n, p_n);
      proche(r.p_t, p_t);
    }
  });
  it('vidange (6.3.3, Walker, P2) : p_vft, epsilon, F_e, n et pressions', () => {
    const t = parametresTremie(d, cl, P, 'vidange');
    expect(t.combinaison).toBe('T2');
    proche(t.p_vft, 106.3949);
    proche(t.epsilon as number, 59.6681);
    proche(t.F, 1.004833);
    proche(t.n, 1.450016);
    const attendus: [number, number, number, number][] = [
      [5.1962, 106.3949, 106.9091, 44.2382],
      [2.5981, 63.6951, 64.0029, 26.484],
      [1.299, 35.6899, 35.8623, 14.8396],
    ];
    for (const [x, p_v, p_n, p_t] of attendus) {
      const r = pressionsTremie(t, Math.min(x, t.h_h));
      proche(r.p_v, p_v);
      proche(r.p_n, p_n);
      proche(r.p_t, p_t);
    }
  });
  it('Walker : erreur si phi_wh > phi_i (note 1 sous 6.23)', () => {
    expect(() => facteurWalker(30, 0.9, 39.24)).toThrow(/phi_wh.*phi_i.*6\.23/);
  });
  it('Walker : valeur de V4', () => {
    const w = facteurWalker(30, 0.413793, 39.24);
    proche(w.F_e, 1.004833);
    proche(w.epsilon, 59.6681);
  });
});

describe('V6 : tremie conique peu profonde (6.4)', () => {
  const d = v6();
  const cl = classer(d, P);
  it('remplissage : mu_heff, F_f, n et pressions', () => {
    const t = parametresTremie(d, cl, P, 'remplissage');
    expect(t.profondeur).toBe('peu-profonde');
    proche(t.h_h, 2.8868);
    proche(t.p_vft, 143.2587);
    proche(t.mu_heff, 0.171645);
    proche(t.F, 0.981967);
    proche(t.n, 0.158559);
    const attendus: [number, number, number, number][] = [
      [2.8868, 143.2587, 140.6753, 24.1462],
      [1.4434, 150.0809, 147.3745, 25.2961],
      [0.7217, 145.3268, 142.7061, 24.4947],
    ];
    for (const [x, p_v, p_n, p_t] of attendus) {
      const r = pressionsTremie(t, Math.min(x, t.h_h));
      proche(r.p_v, p_v);
      proche(r.p_n, p_n);
      proche(r.p_t, p_t);
    }
  });
  it('vidange identique au remplissage (6.4.3)', () => {
    const r = parametresTremie(d, cl, P, 'remplissage');
    const e = parametresTremie(d, cl, P, 'vidange');
    expect(e.motif).toMatch(/6\.4\.3/);
    proche(pressionsTremie(e, 1.4434).p_n, pressionsTremie(r, 1.4434).p_n);
  });
});
