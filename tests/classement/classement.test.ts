// Test d'acceptation du lot 1 (T1.5). Ne pas modifier : voir PLAN.md.
// Valeurs attendues : docs/validation/V1 a V4, recopiees en dur.
import { describe, expect, it } from 'vitest';
import { classer } from '../../src/classement/classement';
import { en1991_4Recommande } from '../../src/norms/en1991-4-recommande';
import type { DonneesSilo } from '../../src/model/types';
import { proche, v1, v2, v3, v4 } from '../fixtures';

const P = en1991_4Recommande();

function circulaire(d: number, hc: number, modif: Partial<DonneesSilo['exploitation']> = {}): DonneesSilo {
  const base = v3();
  return {
    ...base,
    silo: { ...base.silo, d, t: d / 50, hc },
    exploitation: { ...base.exploitation, ...modif },
  };
}

describe('V1 : rectangulaire 6 x 4 m, hc = 20 m', () => {
  const c = classer(v1(), P);
  it('geometrie', () => {
    proche(c.geometrie.A, 24);
    proche(c.geometrie.U, 20);
    proche(c.geometrie.A / c.geometrie.U, 1.2);
    proche(c.geometrie.d_c, 4);
    proche(c.hc_dc, 5.0);
    expect(c.elancement).toBe('elance');
  });
  it('capacite et classe 2', () => {
    proche(c.capacite, 782.9);
    expect(c.h_h).toBeNull();
    expect(c.volumeTremie).toBe(0);
    proche(c.h_b, 20);
    expect(c.classeCalculee).toBe(2);
    expect(c.classeDeCalcul).toBe(2);
    expect(c.procedures).toBe(2);
    expect(c.paroi).toBeNull();
  });
  it('surface equivalente et talus (prisme, 5.78)', () => {
    proche(c.h_o, 0.809784);
    proche(c.h_tp, 1.619568);
  });
});

describe('V2 : circulaire d = 6 m, t = 0,20 m, hc = 18 m, tremie conique', () => {
  const c = classer(v2(), P);
  it('geometrie et elancement', () => {
    proche(c.geometrie.A, 28.2743);
    proche(c.geometrie.U, 18.8496);
    proche(c.geometrie.A / c.geometrie.U, 1.5);
    proche(c.geometrie.d_c, 6);
    proche(c.hc_dc, 3.0);
    expect(c.elancement).toBe('elance');
  });
  it('paroi epaisse (d_c/t = 30)', () => {
    expect(c.paroi).toBe('epaisse');
  });
  it('tremie comprise dans la capacite (P5) : 909,9 t, classe 2 malgre e_o/d_c = 0,33', () => {
    proche(c.h_h as number, 5.1962);
    proche(c.volumeTremie, 48.9726);
    proche(c.capacite, 909.9);
    expect(c.classeCalculee).toBe(2);
  });
  it('talus (cone, 5.77)', () => {
    proche(c.h_o, 0.809784);
    proche(c.h_tp, 2.429352);
  });
});

describe('V3 : circulaire d = 10 m, hc = 15 m, intermediaire', () => {
  const c = classer(v3(), P);
  it('classement', () => {
    proche(c.geometrie.A, 78.5398);
    proche(c.geometrie.U, 31.4159);
    proche(c.geometrie.d_c, 10);
    proche(c.hc_dc, 1.5);
    expect(c.elancement).toBe('intermediaire');
    proche(c.capacite, 1921.5);
    expect(c.classeCalculee).toBe(2);
  });
  it('talus', () => {
    proche(c.h_o, 1.3496);
    proche(c.h_tp, 4.0489);
  });
});

describe('V4 : tremie conique', () => {
  it('h_h jusqu a la pointe virtuelle', () => {
    const c = classer(v4(), P);
    proche(c.h_h as number, 5.1962);
    proche(c.h_b, 18 + 5.1962);
  });
});

describe('classes du tableau 2.1', () => {
  it('moins de 100 t : classe 1, calculee avec les procedures de la classe 2 (2.5(3))', () => {
    const c = classer(circulaire(3, 3), P);
    expect(c.elancement).toBe('peu-elance');
    expect(c.classeCalculee).toBe(1);
    expect(c.classeDeCalcul).toBe(1);
    expect(c.procedures).toBe(2);
    expect(c.motifsClasse.join(' ')).toMatch(/2\.5\(3\)/);
  });
  it('plus de 10 000 t : classe 3', () => {
    const c = classer(circulaire(20, 30), P);
    expect(c.classeCalculee).toBe(3);
    expect(c.procedures).toBe(3);
    expect(c.motifsClasse.length).toBeGreaterThan(0);
  });
  it('plus de 1 000 t et e_o/d_c > 0,25 : classe 3', () => {
    expect(classer(circulaire(10, 15, { e_o: 3 }), P).classeCalculee).toBe(3);
    expect(classer(circulaire(10, 15, { e_o: 2.5 }), P).classeCalculee).toBe(2);
  });
  it('peu elance, plus de 1 000 t et e_t/d_c > 0,25 : classe 3 ; e_t vaut e_f par defaut', () => {
    expect(classer(circulaire(16, 12, { e_f: 4.5 }), P).classeCalculee).toBe(3);
    expect(classer(circulaire(16, 12, { e_f: 4.5, e_t: 3 }), P).classeCalculee).toBe(2);
    expect(classer(circulaire(16, 12, { e_f: 3 }), P).classeCalculee).toBe(2);
  });
  it('e_t ne joue pas pour un silo intermediaire', () => {
    expect(classer(circulaire(10, 15, { e_f: 3 }), P).classeCalculee).toBe(2);
  });
  it('la classe imposee releve la classe, jamais ne l abaisse', () => {
    const haut = classer(circulaire(10, 15, { classeImposee: 3 }), P);
    expect(haut.classeCalculee).toBe(2);
    expect(haut.classeDeCalcul).toBe(3);
    expect(haut.procedures).toBe(3);
    const bas = classer(circulaire(10, 15, { classeImposee: 1 }), P);
    expect(bas.classeDeCalcul).toBe(2);
  });
});

describe('paroi d un silo circulaire', () => {
  it('mince si d_c/t > 200, epaisse sinon', () => {
    const base = v3();
    expect(classer({ ...base, silo: { ...base.silo, t: 0.04 } }, P).paroi).toBe('mince');
    expect(classer({ ...base, silo: { ...base.silo, t: 0.05 } }, P).paroi).toBe('epaisse');
  });
});

describe('domaine (5.1(2), 5.4, 1.1(3)) : erreurs explicites', () => {
  it('bornes d elancement : 1,0 peu elance, 2,0 elance, 0,45 peu elance', () => {
    expect(classer(circulaire(10, 10), P).elancement).toBe('peu-elance');
    expect(classer(circulaire(10, 20), P).elancement).toBe('elance');
    expect(classer(circulaire(10, 4.5), P).elancement).toBe('peu-elance');
  });
  it('hc/dc <= 0,4 avec fond plat : magasin de stockage hors perimetre (5.4)', () => {
    expect(() => classer(circulaire(10, 3.5), P)).toThrow(/hc\/dc = 0,35 avec fond plat.*5\.4/);
  });
  it('hc/dc <= 0,4 avec tremie : point ouvert P6, hors perimetre', () => {
    const d = v2();
    expect(() => classer({ ...d, silo: { ...d.silo, hc: 2 } }, P)).toThrow(/P6/);
  });
  it('limites de 1.1(3)', () => {
    expect(() => classer(circulaire(70, 80), P)).toThrow(/d_c.*60.*1\.1\(3\)/);
    expect(() => classer(circulaire(11, 101), P)).toThrow(/h_b.*100.*1\.1\(3\)/);
    expect(() => classer(circulaire(4, 50), P)).toThrow(/h_b\/d_c.*10.*1\.1\(3\)/);
  });
  it('les donnees sont validees avant le classement', () => {
    const d = v1();
    expect(() => classer({ ...d, silo: { ...d.silo, hc: -1 } }, P)).toThrow(/hc/);
  });
});
