// Test d'acceptation du lot 1 (T1.3). Ne pas modifier : voir PLAN.md.
import { describe, expect, it } from 'vitest';
import { en1991_4Recommande } from '../../src/norms/en1991-4-recommande';
import { verifierProfil } from '../../src/norms/profil';

describe('profil des valeurs recommandees', () => {
  const p = en1991_4Recommande();
  it('porte les valeurs recommandees de la norme', () => {
    const v = p.valeurs;
    expect(v.capaciteClasse1.valeur).toBe(100);
    expect(v.capaciteClasse3.valeur).toBe(10000);
    expect(v.capaciteExcentrement.valeur).toBe(1000);
    expect(v.excentrementClasse3.valeur).toBe(0.25);
    expect(v.C_h_elance.valeur).toBe(1.15);
    expect(v.C_w_elance.valeur).toBe(1.1);
    expect(v.C_h_pente.valeur).toBe(0.15);
    expect(v.C_w_pente.valeur).toBe(0.1);
    expect(v.b_tremie.valeur).toBe(0.2);
    expect(v.C_b.valeur).toBe(1.0);
    expect(v.C_b_majore.valeur).toBe(1.2);
    expect(v.theta_c.valeur).toBe(35);
    expect(v.excentrementGrand.valeur).toBe(0.25);
    expect(v.elancementExcentrementRemplissage.valeur).toBe(4.0);
    expect(v.minceurParoi.valeur).toBe(200);
    expect(v.excentrementPeuElance.valeur).toBe(0.1);
  });
  it('chaque valeur cite l EN 1991-4 et une clause', () => {
    for (const [cle, val] of Object.entries(p.valeurs)) {
      expect(val.source, cle).toMatch(/^EN 1991-4:2006, .+/);
    }
    expect(p.nom).toMatch(/recommand/);
    expect(p.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
  it('verifierProfil accepte le profil recommande', () => {
    expect(() => verifierProfil(p)).not.toThrow();
  });
  it('une source vide bloque, en nommant la grandeur', () => {
    const q = en1991_4Recommande();
    q.valeurs.theta_c.source = ' ';
    expect(() => verifierProfil(q)).toThrow(/theta_c/);
  });
  it('une valeur non finie bloque, en nommant la grandeur', () => {
    const q = en1991_4Recommande();
    q.valeurs.C_b.valeur = Number.NaN;
    expect(() => verifierProfil(q)).toThrow(/C_b/);
  });
  it('chaque appel rend un profil neuf', () => {
    const q = en1991_4Recommande();
    q.valeurs.C_b.valeur = 9;
    expect(en1991_4Recommande().valeurs.C_b.valeur).toBe(1.0);
  });
});
