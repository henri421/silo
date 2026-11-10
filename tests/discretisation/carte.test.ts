// Test d'acceptation du lot 10 (T10.1). Ne pas modifier : voir PLAN.md.
// Valeurs attendues : docs/validation/V2, section « Carte p(z, θ) », recopiees en dur.
import { describe, expect, it } from 'vitest';
import { calculer, cartePressions, en1991_4Recommande } from '../../src/index';
import type { CarteCas, DonneesSilo, PointCarte } from '../../src/model/types';
import { proche, v1, v2 } from '../fixtures';

const P = en1991_4Recommande();

function exploitation(d: DonneesSilo, e: Partial<DonneesSilo['exploitation']>): DonneesSilo {
  return { ...d, exploitation: { ...d.exploitation, ...e } };
}

function noeud(c: CarteCas, z: number, theta: number): PointCarte {
  const p = c.points.find((k) => Math.abs(k.z - z) < 1e-4 && Math.abs(k.theta - theta) < 1e-6);
  expect(p, `noeud z = ${z}, theta = ${theta}`).toBeDefined();
  return p as PointCarte;
}

describe('carte d un silo circulaire a paroi epaisse (V2, classe 2)', () => {
  const r = calculer(v2(), P);
  const remp = cartePressions(r, P, 'REMP', { pasTheta: 5 });

  it('grille : multiples du pas, bords des carres, bande localisee', () => {
    expect(remp.statut).toBe('calcule');
    proche(remp.z_p as number, 9);
    expect(remp.z_pChoisi).toBe(false);
    proche(remp.s as number, 1.1781);
    proche(remp.demiAngle as number, 11.25);
    expect(remp.thetas).toHaveLength(76);
    for (const t of [0, 5, 11.25, 168.75, 180, 191.25, 348.75, 355]) expect(remp.thetas, String(t)).toContain(t);
    expect(remp.thetas.every((t) => t >= 0 && t < 360)).toBe(true);
    expect(remp.zs).toHaveLength(21);
    expect(remp.zs.some((z) => Math.abs(z - 8.410951) < 1e-5)).toBe(true);
    expect(remp.zs.some((z) => Math.abs(z - 9.589049) < 1e-5)).toBe(true);
    expect(remp.points).toHaveLength(21 * 76);
  });
  it('REMP a z = z_p : carres vers l exterieur, reste de la bande vers l interieur', () => {
    proche(noeud(remp, 9, 0).p_h, 44.508);
    proche(noeud(remp, 9, 11.25).p_h, 44.508);
    proche(noeud(remp, 9, 15).p_h, 40.748);
    proche(noeud(remp, 9, 90).p_h, 40.748);
    proche(noeud(remp, 9, 180).p_h, 44.508);
    proche(noeud(remp, 9, 270).p_h, 40.748);
    proche(noeud(remp, 9, 0).Z, 9);
    expect(noeud(remp, 9, 0).p_w).toBe(noeud(remp, 9, 90).p_w);
  });
  it('hors de la bande, pression symetrique', () => {
    proche(noeud(remp, 18, 0).p_h, 53.1442);
    proche(noeud(remp, 18, 90).p_h, 53.1442);
  });
  it('VID a z = z_p', () => {
    const vid = cartePressions(r, P, 'VID', { pasTheta: 5 });
    proche(noeud(vid, 9, 0).p_h, 61.6937);
    proche(noeud(vid, 9, 90).p_h, 45.3589);
  });
  it('VID_EXC : zones d ecoulement, de contrainte elevee et immobile', () => {
    const exc = cartePressions(r, P, 'VID_EXC', { pasTheta: 5 });
    expect(exc.statut).toBe('calcule');
    expect(exc.z_p).toBeNull();
    const attendus: [number, number][] = [
      [0, 0], [35, 0], [40, 82.4361], [70, 82.4361], [75, 41.218], [180, 41.218],
      [290, 82.4361], [320, 82.4361], [325, 0],
    ];
    for (const [t, ph] of attendus) proche(noeud(exc, 9, t).p_h, ph);
    proche(noeud(exc, 9, 40).p_w, 34.1115);
    expect(noeud(exc, 9, 0).p_w).toBe(0);
  });
});

describe('carte d une paroi mince soudee (V2 avec t = 0,02 m)', () => {
  const d: DonneesSilo = exploitation({ ...v2(), silo: { ...v2().silo, t: 0.02 } }, { assemblage: 'soude' });
  const c = cartePressions(calculer(d, P), P, 'REMP', { pasTheta: 5 });
  it('z_p = min(z_o ; hc/2), p_h + p_pf cos theta', () => {
    proche(c.z_p as number, 7.2573);
    expect(c.demiAngle).toBeNull();
    expect(c.thetas).toHaveLength(72);
    const zp = c.z_p as number;
    proche(noeud(c, zp, 0).p_h, 39.5894);
    proche(noeud(c, zp, 60).p_h, 38.1262);
    proche(noeud(c, zp, 90).p_h, 36.663);
    proche(noeud(c, zp, 180).p_h, 33.7366);
  });
});

describe('classe 3 : zone a toute hauteur', () => {
  const r = calculer(exploitation(v2(), { classeImposee: 3 }), P);
  it('par defaut au milieu de hc, choix declare', () => {
    const c = cartePressions(r, P, 'REMP');
    proche(c.z_p as number, 9);
    expect(c.z_pChoisi).toBe(true);
    expect(c.motif).toMatch(/toute hauteur/);
    expect(c.thetas).toContain(10);
    expect(c.thetas).not.toContain(5);
  });
  it('position choisie par l utilisateur', () => {
    const c = cartePressions(r, P, 'REMP', { pasTheta: 10, z_p: 12 });
    proche(c.z_p as number, 12);
    expect(noeud(c, 12, 0).p_h).toBeGreaterThan(noeud(c, 12, 90).p_h);
    expect(noeud(c, 9, 0).p_h).toBe(noeud(c, 9, 90).p_h);
  });
  it('position hors du silo refusee', () => {
    expect(() => cartePressions(r, P, 'REMP', { z_p: 25 })).toThrow(/hc/);
  });
});

describe('cartes sans objet et erreurs', () => {
  it('silo rectangulaire : non applicable', () => {
    const c = cartePressions(calculer(v1(), P), P, 'REMP');
    expect(c.statut).toBe('non-applicable');
    expect(c.motif).toMatch(/rectangulaire/);
    expect(c.points).toEqual([]);
  });
  it('cas non calcule : meme statut et meme motif que le cas', () => {
    const r = calculer(exploitation(v2(), { ecoulementEnCheminee: true }), P);
    const c = cartePressions(r, P, 'VID');
    expect(c.statut).toBe('non-applicable');
    expect(c.motif).toMatch(/5\.1\(8\)/);
  });
  it('fond : la carte ne couvre que les parois verticales', () => {
    expect(cartePressions(calculer(v2(), P), P, 'FOND_REMP').statut).toBe('non-applicable');
  });
  it('paroi mince boulonnee : hors perimetre (P3)', () => {
    const d: DonneesSilo = exploitation({ ...v2(), silo: { ...v2().silo, t: 0.02 } }, { assemblage: 'boulonne' });
    expect(cartePressions(calculer(d, P), P, 'REMP').statut).toBe('hors-perimetre');
  });
  it('pas angulaire qui ne divise pas 360 : refuse', () => {
    expect(() => cartePressions(calculer(v2(), P), P, 'REMP', { pasTheta: 7 })).toThrow(/360/);
  });
});
