// Test d'acceptation du lot 2 (T2.1 et T2.2). Ne pas modifier : voir PLAN.md.
// Valeurs attendues : docs/validation/V1, V2 et V3, recopiees en dur.
import { describe, expect, it } from 'vitest';
import { classer } from '../../src/classement/classement';
import { en1991_4Recommande } from '../../src/norms/en1991-4-recommande';
import { valeursCaracteristiques } from '../../src/proprietes/caracteristiques';
import { combinaison } from '../../src/proprietes/combinaisons';
import { janssen, parametresJanssen } from '../../src/parois/janssen';
import { exposantN, janssenModifie } from '../../src/parois/janssen-modifie';
import type { DonneesSilo, IdCombinaison } from '../../src/model/types';
import { proche, v1, v2, v3 } from '../fixtures';

const P = en1991_4Recommande();

function contexte(d: DonneesSilo, id: IdCombinaison) {
  const cl = classer(d, P);
  const c = combinaison(id, valeursCaracteristiques(d.materiau, d.parois), d.materiau);
  return { cl, c };
}

describe('V1 : parametres de Janssen (5.3, 5.4)', () => {
  it('C1, C2 et C3', () => {
    const attendus: [IdCombinaison, number, number][] = [
      ['C1', 5.8058, 46.4],
      ['C2', 4.3147, 34.4828],
      ['C3', 7.1533, 46.4],
    ];
    for (const [id, z_o, p_ho] of attendus) {
      const { cl, c } = contexte(v1(), id);
      const j = parametresJanssen(cl.geometrie, c);
      proche(j.z_o, z_o);
      proche(j.p_ho, p_ho);
    }
  });
});

describe('V1 : remplissage d un silo elance (5.1 a 5.7)', () => {
  it('p_hf en C1', () => {
    const { cl, c } = contexte(v1(), 'C1');
    const attendus: [number, number][] = [[1, 7.3416], [5, 26.789], [10, 38.1114], [20, 44.9194]];
    for (const [z, p] of attendus) proche(janssen(z, cl.geometrie, c).p_h, p);
  });
  it('p_wf et n_zSk en C2', () => {
    const { cl, c } = contexte(v1(), 'C2');
    const attendus: [number, number, number][] = [
      [1, 3.9719, 2.0626],
      [5, 13.1741, 39.1583],
      [10, 17.3088, 117.3186],
      [20, 19.0137, 301.9623],
    ];
    for (const [z, p_w, n] of attendus) {
      const r = janssen(z, cl.geometrie, c);
      proche(r.p_w, p_w);
      proche(r.n_zSk, n);
    }
  });
  it('p_vf au fond en C3', () => {
    const { cl, c } = contexte(v1(), 'C3');
    proche(janssen(20, cl.geometrie, c).p_v, 107.4648);
  });
  it('tout est nul a la surface equivalente', () => {
    const { cl, c } = contexte(v1(), 'C1');
    const r = janssen(0, cl.geometrie, c);
    expect([r.p_h, r.p_w, r.p_v, r.n_zSk]).toEqual([0, 0, 0, 0]);
  });
});

describe('V2 : remplissage en C1', () => {
  it('z_o, p_ho et p_hf', () => {
    const { cl, c } = contexte(v2(), 'C1');
    const j = parametresJanssen(cl.geometrie, c);
    proche(j.z_o, 7.2573);
    proche(j.p_ho, 58.0);
    proche(janssen(9, cl.geometrie, c).p_h, 41.218);
    proche(janssen(18, cl.geometrie, c).p_h, 53.1442);
  });
});

describe('V3 : Janssen modifie (5.71 a 5.81)', () => {
  it('exposant n en C1', () => {
    const { cl, c } = contexte(v3(), 'C1');
    proche(exposantN(cl.geometrie, c, cl.h_o, 39), -1.607844);
  });
  it('Y_R et p_hf en C1', () => {
    const { cl, c } = contexte(v3(), 'C1');
    const attendus: [number, number, number][] = [
      [2, 0.090153, 8.7148],
      [5, 0.375128, 36.2624],
      [10, 0.613077, 59.2641],
      [15, 0.732407, 70.7994],
    ];
    for (const [z, Y_R, p_h] of attendus) {
      const r = janssenModifie(z, cl.geometrie, c, cl.h_o, 39);
      proche(r.Y_R, Y_R);
      proche(r.p_h, p_h);
    }
  });
  it('pas de contact au dessus de h_o', () => {
    const { cl, c } = contexte(v3(), 'C1');
    for (const z of [0, cl.h_o / 2, cl.h_o]) {
      const r = janssenModifie(z, cl.geometrie, c, cl.h_o, 39);
      expect(r.Y_R).toBe(0);
      expect(r.p_h).toBe(0);
      expect(r.p_w).toBe(0);
      expect(r.n_zSk).toBe(0);
    }
  });
  it('p_wf en C2', () => {
    const { cl, c } = contexte(v3(), 'C2');
    proche(janssenModifie(5, cl.geometrie, c, cl.h_o, 39).p_w, 18.0638);
    proche(janssenModifie(15, cl.geometrie, c, cl.h_o, 39).p_w, 31.7311);
  });
  it('z_V et p_vf au fond en C3', () => {
    const { cl, c } = contexte(v3(), 'C3');
    const r = janssenModifie(15, cl.geometrie, c, cl.h_o, 39);
    proche(r.z_V, 8.9537);
    proche(r.p_v, 143.2587);
  });
});

describe('domaine de z', () => {
  it('z hors de [0 ; hc] ou non fini leve une erreur', () => {
    const { cl, c } = contexte(v1(), 'C1');
    expect(() => janssen(-0.1, cl.geometrie, c)).toThrow(/z/);
    expect(() => janssen(Number.NaN, cl.geometrie, c)).toThrow(/z/);
  });
});
