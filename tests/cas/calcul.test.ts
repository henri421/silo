// Test d'acceptation du lot 6. Ne pas modifier : voir PLAN.md.
// Valeurs attendues : docs/validation/V1, V2, V4, recopiees en dur.
import { describe, expect, it } from 'vitest';
import { calculer } from '../../src/calcul';
import { bandes, controleBandes } from '../../src/discretisation/bandes';
import { en1991_4Recommande } from '../../src/norms/en1991-4-recommande';
import type { CasDeCharge, DonneesSilo, IdCas } from '../../src/model/types';
import { proche, v1, v2, v4 } from '../fixtures';

const P = en1991_4Recommande();

function cas(r: { cas: CasDeCharge[] }, id: IdCas): CasDeCharge {
  const c = r.cas.find((k) => k.id === id);
  expect(c, id).toBeDefined();
  return c as CasDeCharge;
}

function exploitation(d: DonneesSilo, e: Partial<DonneesSilo['exploitation']>): DonneesSilo {
  return { ...d, exploitation: { ...d.exploitation, ...e } };
}

describe('cas de charge produits (SPEC §7)', () => {
  it('V1 : cinq cas, dans l ordre, aucun omis', () => {
    const r = calculer(v1(), P);
    expect(r.cas.map((c) => c.id)).toEqual(['REMP', 'VID', 'VID_EXC', 'FOND_REMP', 'FOND_VID']);
    expect(cas(r, 'REMP').statut).toBe('calcule');
    expect(cas(r, 'VID').statut).toBe('calcule');
    expect(cas(r, 'VID_EXC').statut).toBe('non-applicable');
    expect(cas(r, 'VID_EXC').motif).toMatch(/circulaire/);
    expect(cas(r, 'FOND_REMP').statut).toBe('calcule');
    expect(cas(r, 'FOND_VID').statut).toBe('calcule');
    expect(r.pointsOuverts).toEqual(['P5']);
  });
  it('chaque cas porte un libelle et ses combinaisons', () => {
    for (const c of calculer(v1(), P).cas) {
      expect(c.libelle.length).toBeGreaterThan(0);
      expect(c.combinaisons.length).toBeGreaterThan(0);
    }
  });
  it('V2 : vidange excentree calculee, points ouverts P1, P2, P4, P5', () => {
    const r = calculer(v2(), P);
    expect(cas(r, 'VID_EXC').statut).toBe('calcule');
    expect(cas(r, 'VID_EXC').excentree?.theta_c).toBe(35);
    expect(r.pointsOuverts).toEqual(['P1', 'P2', 'P4', 'P5']);
  });
  it('V2 en classe 3 : VID_EXC hors perimetre (5.2.4.3), cas symetriques conserves', () => {
    const r = calculer(exploitation(v2(), { classeImposee: 3 }), P);
    expect(cas(r, 'VID_EXC').statut).toBe('hors-perimetre');
    expect(cas(r, 'VID_EXC').motif).toMatch(/5\.2\.4\.3/);
    expect(cas(r, 'VID_EXC').profil).toEqual([]);
    expect(cas(r, 'REMP').statut).toBe('calcule');
    expect(cas(r, 'VID').statut).toBe('calcule');
  });
  it('ecoulement en cheminee : VID non applicable (5.1(8)), REMP conserve', () => {
    const r = calculer(exploitation(v1(), { ecoulementEnCheminee: true }), P);
    expect(cas(r, 'VID').statut).toBe('non-applicable');
    expect(cas(r, 'VID').motif).toMatch(/5\.1\(8\)/);
    expect(cas(r, 'VID').profil).toEqual([]);
    expect(cas(r, 'REMP').statut).toBe('calcule');
  });
  it('paroi mince boulonnee de classe 2 : point ouvert P3 signale', () => {
    const d: DonneesSilo = { ...v2(), silo: { ...v2().silo, t: 0.02 } };
    const r = calculer(exploitation(d, { assemblage: 'boulonne' }), P);
    expect(cas(r, 'REMP').localisee?.forme).toBe('hors-perimetre');
    expect(r.pointsOuverts).toContain('P3');
  });
});

describe('profils (SPEC §2.4, §5.6)', () => {
  const r = calculer({ ...v1(), silo: { ...v1().silo, Z_transition: 2 } }, P);
  it('au moins 101 points, croissants, avec 0, hc, h_o et z_o', () => {
    const z = cas(r, 'REMP').profil.map((p) => p.z);
    expect(z.length).toBeGreaterThanOrEqual(101);
    for (let i = 1; i < z.length; i++) expect(z[i]).toBeGreaterThan(z[i - 1]);
    expect(z[0]).toBe(0);
    expect(z[z.length - 1]).toBe(20);
    expect(z.some((v) => Math.abs(v - 0.809784) < 1e-5)).toBe(true);
    expect(z.some((v) => Math.abs(v - 5.8058) < 1e-4)).toBe(true);
  });
  it('valeurs de V1 a z = 10 et cote Z = Z_transition + hc - z', () => {
    const remp = cas(r, 'REMP').profil.find((p) => p.z === 10)!;
    proche(remp.Z, 12);
    proche(remp.p_h_sym, 38.1114);
    proche(remp.p_h_total, 39.261);
    proche(remp.p_h_loc, 39.261 - 38.1114, 1e-3);
    proche(remp.p_w, 17.3088);
    proche(remp.n_zSk, 117.3186);
    const vid = cas(r, 'VID').profil.find((p) => p.z === 10)!;
    proche(vid.p_h_total, 46.4722);
    proche(vid.p_w, 19.0396);
  });
  it('fond plat : un point, a la cote de la transition', () => {
    const f = cas(r, 'FOND_REMP').fond;
    expect(f).toHaveLength(1);
    expect(f[0].x).toBeNull();
    proche(f[0].Z, 2);
    proche(f[0].p_v, 107.4648);
  });
  it('tremie de V4 : points en x de h_h vers la pointe, Z = Z_transition - (h_h - x)', () => {
    const f = cas(calculer(v4(), P), 'FOND_REMP').fond;
    expect(f.length).toBeGreaterThanOrEqual(21);
    proche(f[0].x as number, 5.1962);
    proche(f[0].Z, 0, 1e-9);
    proche(f[0].p_v, 123.9557);
    proche(f[0].p_n as number, 113.6056);
    const dernier = f[f.length - 1];
    expect(dernier.x as number).toBeGreaterThan(0);
    proche(dernier.Z, -5.1962 + (dernier.x as number), 1e-3);
  });
});

describe('bandes (SPEC §8.2), V1, cas VID, dz = 1 m', () => {
  const r = calculer(v1(), P);
  const b = r.bandes.filter((k) => k.cas === 'VID');
  it('vingt bandes, valeurs haut, bas et constante', () => {
    expect(b).toHaveLength(20);
    const attendus: [number, number, number, number, number][] = [
      [1, 0, 1, 0, 8.9522],
      [2, 1, 2, 8.9522, 16.4879],
      [3, 2, 3, 16.4879, 22.8313],
      [20, 19, 20, 54.4344, 54.7738],
    ];
    for (const [n, zh, zb, ph, pb] of attendus) {
      const k = b[n - 1];
      expect(k.numero).toBe(n);
      expect([k.z_haut, k.z_bas]).toEqual([zh, zb]);
      proche(k.p_h_haut, ph);
      proche(k.p_h_bas, pb);
      proche(k.p_h_constant, pb);
      proche(k.Z_haut, 20 - zh, 1e-9);
    }
  });
  it('controle : somme des trapezes, integrale exacte et ecart', () => {
    const c = r.controles.find((k) => k.cas === 'VID')!;
    proche(c.sommeTrapezes, 812.793, 2e-6);
    proche(c.integrale, 813.578, 2e-6);
    proche(c.ecartRelatif, -0.000965, 1e-2);
  });
  it('les cas non applicables n ont pas de bandes', () => {
    expect(r.bandes.some((k) => k.cas === 'VID_EXC')).toBe(false);
  });
});

describe('bandes : derniere bande plus courte', () => {
  it('hc = 20 m et dz = 3 m : sept bandes, la derniere de 18 a 20 m', () => {
    const f = (z: number) => ({ p_h: z, p_w: 2 * z });
    const b = bandes('REMP', f, 20, 3, 0);
    expect(b).toHaveLength(7);
    expect([b[6].z_haut, b[6].z_bas]).toEqual([18, 20]);
    expect([b[6].p_h_haut, b[6].p_h_bas, b[6].p_w_bas]).toEqual([18, 20, 40]);
  });
  it('controleBandes : une fonction lineaire est integree exactement', () => {
    const f = (z: number) => ({ p_h: z, p_w: 0 });
    const c = controleBandes('REMP', bandes('REMP', f, 20, 3, 0), (z: number) => f(z).p_h, 20);
    proche(c.sommeTrapezes, 200);
    proche(c.integrale, 200);
    expect(Math.abs(c.ecartRelatif)).toBeLessThan(1e-9);
  });
});
