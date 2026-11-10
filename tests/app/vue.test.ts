// Test d'acceptation du lot 7 (T7.2). Ne pas modifier : voir PLAN.md.
import { describe, expect, it } from 'vitest';
import { calculer, en1991_4Recommande } from '../../src/index';
import { blocsSynthese, lignesCas, lignesPointsOuverts, messageDErreur } from '../../app/src/vue';
import { v1, v2 } from '../fixtures';

const P = en1991_4Recommande();

describe('synthese (SPEC §8.1)', () => {
  const blocs = blocsSynthese(calculer(v1(), P));
  it('les blocs, dans l ordre', () => {
    expect(blocs.map((b) => b.titre)).toEqual([
      'Classement',
      'Propriétés caractéristiques',
      'Parois verticales',
      'Action localisée',
      'Fond',
      'Cas de charge',
    ]);
  });
  it('les grandeurs attendues sont presentes', () => {
    const symboles = blocs.flatMap((b) => b.lignes.map((l) => l.symbole));
    for (const s of ['hc/dc', 'capacité', 'classe', 'K', 'μ', 'φ_i', 'z_o', 'p_ho', 'C_h', 'C_w', 'C_pf', 'C_pe', 's', 'C_b']) {
      expect(symboles, s).toContain(s);
    }
  });
  it('nombres a la francaise, sans NaN', () => {
    const texte = JSON.stringify(blocs);
    expect(texte).not.toContain('NaN');
    expect(texte).toMatch(/\d,\d/);
    const valeurs = blocs.flatMap((b) => b.lignes.map((l) => l.valeur)).filter((v) => /^-?[\d\s.,]+( \S+)?$/.test(v));
    for (const v of valeurs) expect(v, v).not.toMatch(/\d\.\d/);
  });
  it('le bloc des cas a une ligne par cas, motif compris', () => {
    const cas = blocs.find((b) => b.titre === 'Cas de charge')!;
    expect(cas.lignes).toHaveLength(5);
    expect(cas.lignes[2].valeur).toMatch(/non applicable/);
  });
});

describe('liste des cas', () => {
  it('V1 : cinq lignes [identifiant, libelle, statut, motif ou combinaisons]', () => {
    const l = lignesCas(calculer(v1(), P));
    expect(l.map((r) => r[0])).toEqual(['REMP', 'VID', 'VID_EXC', 'FOND_REMP', 'FOND_VID']);
    expect(l[0][2]).toBe('calculé');
    expect(l[2][2]).toBe('non applicable');
    expect(l[2][3]).toMatch(/circulaire/);
    for (const r of l) expect(r).toHaveLength(4);
  });
});

describe('points ouverts appliques', () => {
  it('V2 : P1, P2, P4, P5 avec leur choix declare', () => {
    const l = lignesPointsOuverts(calculer(v2(), P));
    expect(l.map((r) => r[0])).toEqual(['P1', 'P2', 'P4', 'P5']);
    for (const r of l) {
      expect(r).toHaveLength(3);
      expect(r[1].length).toBeGreaterThan(10);
      expect(r[2].length).toBeGreaterThan(10);
    }
  });
});

describe('erreurs', () => {
  it('rend le message d une Error, et un texte pour le reste', () => {
    expect(messageDErreur(new Error('hc/dc = 0,35'))).toBe('hc/dc = 0,35');
    expect(messageDErreur('x').length).toBeGreaterThan(0);
  });
});
