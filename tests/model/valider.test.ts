// Test d'acceptation du lot 1 (T1.1). Ne pas modifier : voir PLAN.md.
import { describe, expect, it } from 'vitest';
import { validerDonnees } from '../../src/model/valider';
import type { DonneesSilo } from '../../src/model/types';
import { v1, v2, v3 } from '../fixtures';

function avec(d: DonneesSilo, silo: Partial<DonneesSilo['silo']>): DonneesSilo {
  return { ...d, silo: { ...d.silo, ...silo } };
}

describe('validerDonnees (SPEC §11)', () => {
  it('accepte les cas de validation', () => {
    for (const d of [v1(), v2(), v3()]) expect(() => validerDonnees(d)).not.toThrow();
  });
  it('message exact pour un diametre nul', () => {
    expect(() => validerDonnees(avec(v3(), { d: 0 }))).toThrow(
      'Le diametre interieur d doit etre un nombre strictement positif (m).',
    );
  });
  it('epaisseur d un silo circulaire obligatoire et positive', () => {
    expect(() => validerDonnees(avec(v3(), { t: undefined }))).toThrow(/epaisseur.*t.*\(m\)/);
    expect(() => validerDonnees(avec(v3(), { t: -0.1 }))).toThrow(/epaisseur.*t.*\(m\)/);
  });
  it('cotes d un rectangle : positives et a >= b', () => {
    expect(() => validerDonnees(avec(v1(), { b: Number.NaN }))).toThrow(/\bb\b.*\(m\)/);
    expect(() => validerDonnees(avec(v1(), { a: 3, b: 4 }))).toThrow(/a >= b/);
  });
  it('hc strictement positive', () => {
    expect(() => validerDonnees(avec(v1(), { hc: 0 }))).toThrow(/hc.*\(m\)/);
  });
  it('tremie : beta obligatoire, strictement entre 0 et 90 deg', () => {
    expect(() => validerDonnees(avec(v2(), { beta: undefined }))).toThrow(/beta.*\(deg\)/);
    expect(() => validerDonnees(avec(v2(), { beta: 90 }))).toThrow(/beta.*\(deg\)/);
  });
  it('tremie conique sous un silo rectangulaire refusee, pyramidale sous un cercle refusee', () => {
    expect(() => validerDonnees(avec(v1(), { fond: 'conique', beta: 30 }))).toThrow(/conique/);
    expect(() => validerDonnees(avec(v2(), { fond: 'pyramidale-carree' }))).toThrow(/pyramidale/);
  });
  it('pyramidale carree exige a = b', () => {
    expect(() => validerDonnees(avec(v1(), { fond: 'pyramidale-carree', beta: 30 }))).toThrow(/a = b/);
  });
  it('excentrements positifs ou nuls et au plus egaux au rayon d_c/2', () => {
    const d = v2();
    expect(() => validerDonnees({ ...d, exploitation: { ...d.exploitation, e_o: -1 } })).toThrow(/e_o.*\(m\)/);
    expect(() => validerDonnees({ ...d, exploitation: { ...d.exploitation, e_f: 3.5 } })).toThrow(/e_f/);
  });
  it('materiau : grandeurs strictement positives, angles entre 0 et 90 deg, coefficients a >= 1', () => {
    const d = v1();
    expect(() => validerDonnees({ ...d, materiau: { ...d.materiau, K_m: 0 } })).toThrow(/K_m/);
    expect(() => validerDonnees({ ...d, materiau: { ...d.materiau, phi_r: 95 } })).toThrow(/phi_r.*\(deg\)/);
    expect(() => validerDonnees({ ...d, materiau: { ...d.materiau, a_K: 0.9 } })).toThrow(/a_K/);
  });
  it('discretisation : dz > 0 et au moins 101 points', () => {
    const d = v1();
    expect(() => validerDonnees({ ...d, discretisation: { dz: 0, pointsProfil: 101 } })).toThrow(/dz.*\(m\)/);
    expect(() => validerDonnees({ ...d, discretisation: { dz: 1, pointsProfil: 50 } })).toThrow(/101/);
  });
});
