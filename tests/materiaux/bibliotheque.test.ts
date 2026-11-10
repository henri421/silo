// Test d'acceptation du lot 1 (T1.2). Ne pas modifier : voir PLAN.md.
import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { bibliotheque, materiauParId, materiauxDepuisJson } from '../../src/materiaux/bibliotheque';

const E1 = 'EN 1991-4:2006, tableau E.1';
const CHAMPS = ['gamma_l', 'gamma_u', 'phi_r', 'phi_im', 'a_phi', 'K_m', 'a_K', 'mu_m_D1', 'mu_m_D2', 'mu_m_D3', 'a_mu', 'C_op'];

describe('bibliotheque livree (SPEC §3.3)', () => {
  it('ne contient que le materiau par defaut et le sable', () => {
    expect(
      bibliotheque()
        .map((m) => m.id)
        .sort(),
    ).toEqual(['defaut', 'sable']);
  });
  it('sable', () => {
    const m = materiauParId('sable');
    expect(m.nom).toBe('Sable');
    expect([m.gamma_l, m.gamma_u, m.phi_r, m.phi_im, m.a_phi, m.K_m, m.a_K]).toEqual([14, 16, 39, 36, 1.09, 0.45, 1.11]);
    expect(m.mu_m).toEqual({ D1: 0.38, D2: 0.48, D3: 0.57 });
    expect([m.a_mu, m.C_op]).toEqual([1.16, 0.4]);
  });
  it('materiau par defaut', () => {
    const m = materiauParId('defaut');
    expect(m.nom).toBe('Matériau par défaut');
    expect([m.gamma_l, m.gamma_u, m.phi_r, m.phi_im, m.a_phi, m.K_m, m.a_K]).toEqual([6, 22, 40, 35, 1.3, 0.5, 1.5]);
    expect(m.mu_m).toEqual({ D1: 0.32, D2: 0.39, D3: 0.5 });
    expect([m.a_mu, m.C_op]).toEqual([1.4, 1.0]);
  });
  it('chaque valeur porte sa source', () => {
    for (const m of bibliotheque()) {
      for (const c of CHAMPS) expect(m.sources[c], `${m.id}.${c}`).toBe(E1);
    }
  });
  it('un identifiant inconnu leve une erreur qui le nomme', () => {
    expect(() => materiauParId('ble')).toThrow(/ble/);
  });
  it('le LISEZMOI existe', () => {
    expect(existsSync(new URL('../../src/materiaux/LISEZMOI.md', import.meta.url))).toBe(true);
  });
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function jsonMinimal(): any {
  const v = (valeur: number) => ({ valeur, source: 'essai 2026-01' });
  return {
    format: 'silo-materiaux',
    version: 1,
    materiaux: [
      {
        id: 'ble',
        nom: 'Blé',
        valeurs: {
          gamma_l: v(7.5),
          gamma_u: v(9),
          phi_r: v(34),
          phi_im: v(30),
          a_phi: v(1.12),
          K_m: v(0.54),
          a_K: v(1.11),
          mu_m_D1: v(0.24),
          mu_m_D2: v(0.38),
          mu_m_D3: v(0.57),
          a_mu: v(1.16),
          C_op: v(0.5),
        },
      },
    ],
  };
}

describe('materiauxDepuisJson', () => {
  it('lit un materiau complet', () => {
    const [m] = materiauxDepuisJson(jsonMinimal());
    expect(m.id).toBe('ble');
    expect(m.nom).toBe('Blé');
    expect(m.mu_m.D2).toBe(0.38);
    expect(m.sources.K_m).toBe('essai 2026-01');
    expect(m.sources.mu_m_D2).toBe('essai 2026-01');
  });
  it('une valeur sans source bloque en nommant le materiau et la grandeur', () => {
    const j = jsonMinimal();
    j.materiaux[0].valeurs.K_m.source = '';
    expect(() => materiauxDepuisJson(j)).toThrow(/ble.*K_m|K_m.*ble/);
  });
  it('une grandeur absente bloque', () => {
    const j = jsonMinimal();
    delete j.materiaux[0].valeurs.mu_m_D3;
    expect(() => materiauxDepuisJson(j)).toThrow(/mu_m_D3/);
  });
  it('un format ou une version inconnus bloquent', () => {
    expect(() => materiauxDepuisJson({ format: 'autre', version: 1, materiaux: [] })).toThrow(/format/);
    expect(() => materiauxDepuisJson({ format: 'silo-materiaux', version: 2, materiaux: [] })).toThrow(/version/);
  });
});
