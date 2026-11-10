// Test d'acceptation du lot 1 (T1.6). Ne pas modifier : voir PLAN.md.
import { describe, expect, it } from 'vitest';
import { valeursCaracteristiques } from '../../src/proprietes/caracteristiques';
import { combinaison } from '../../src/proprietes/combinaisons';
import type { Parois } from '../../src/model/types';
import { proche, sable } from '../fixtures';

const parois: Parois = { verticale: 'D2', tremie: 'D1', faiblementCohesif: true, engrainementMecanique: false };
const m = sable();
const v = valeursCaracteristiques(m, parois);

describe('valeurs caracteristiques du sable, paroi D2 (4.2.3, V1)', () => {
  it('K, mu et phi_i', () => {
    proche(v.K_sup, 0.4995);
    proche(v.K_inf, 0.405405);
    proche(v.mu_sup, 0.5568);
    proche(v.mu_inf, 0.413793);
    proche(v.phi_i_sup, 39.24);
    proche(v.phi_i_inf, 33.0275);
  });
  it('mu de tremie lu sur sa propre categorie (D1)', () => {
    proche(v.mu_h_inf, 0.327586);
    proche(v.mu_h_sup, 0.4408);
  });
});

describe('combinaisons du tableau 3.1 (SPEC §3.2, P1, P2)', () => {
  it('C1 pression normale max', () => {
    const c = combinaison('C1', v, m);
    expect(c.id).toBe('C1');
    expect(c.libelle).toBe('C1 pression normale max');
    proche(c.gamma, 16);
    proche(c.K, 0.4995);
    proche(c.mu, 0.413793);
    proche(c.phi_i, 33.0275);
  });
  it('C2 frottement max', () => {
    const c = combinaison('C2', v, m);
    expect(c.libelle).toBe('C2 frottement max');
    proche(c.K, 0.4995);
    proche(c.mu, 0.5568);
    proche(c.phi_i, 33.0275);
  });
  it('C3 charge verticale max', () => {
    const c = combinaison('C3', v, m);
    expect(c.libelle).toBe('C3 charge verticale max');
    proche(c.K, 0.405405);
    proche(c.mu, 0.413793);
    proche(c.phi_i, 39.24);
  });
  it('T1 tremie remplissage', () => {
    const c = combinaison('T1', v, m);
    expect(c.libelle).toBe('T1 trémie remplissage');
    proche(c.K, 0.405405);
    proche(c.mu, 0.413793);
    proche(c.mu_h, 0.327586);
    proche(c.phi_i, 33.0275);
  });
  it('T2 tremie vidange (P2 : mu inferieur sur la paroi verticale)', () => {
    const c = combinaison('T2', v, m);
    expect(c.libelle).toBe('T2 trémie vidange');
    proche(c.K, 0.4995);
    proche(c.mu, 0.413793);
    proche(c.mu_h, 0.327586);
    proche(c.phi_i, 39.24);
  });
  it('X vidange excentree (P1 : K superieur)', () => {
    const c = combinaison('X', v, m);
    expect(c.libelle).toBe('X vidange excentrée');
    proche(c.K, 0.4995);
    proche(c.mu, 0.413793);
    proche(c.phi_i, 39.24);
  });
});
