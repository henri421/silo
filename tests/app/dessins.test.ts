// Test d'acceptation du lot 7 (T7.3). Ne pas modifier : voir PLAN.md.
import { describe, expect, it } from 'vitest';
import { calculer, en1991_4Recommande } from '../../src/index';
import { dessinElevation, dessinPlan, dessinProfils, dessinTremie } from '../../app/src/dessins';
import { v1, v2, v4 } from '../fixtures';

const P = en1991_4Recommande();
const r1 = calculer(v1(), P);
const r2 = calculer(v2(), P);
const r4 = calculer(v4(), P);

function propre(svg: string): void {
  expect(svg.startsWith('<svg')).toBe(true);
  expect(svg.trim().endsWith('</svg>')).toBe(true);
  expect(svg).not.toContain('NaN');
  expect(svg).not.toContain('undefined');
  expect(svg).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  expect(svg).not.toMatch(/\brgba?\(/);
  expect(svg).toContain('var(--');
}

describe('elevation (SPEC §8.1)', () => {
  it('cas VID de V1, sans puis avec les bandes', () => {
    const sans = dessinElevation(r1, 'VID', false);
    propre(sans);
    expect(sans).toContain('h_o');
    expect(sans).not.toContain('class="bande"');
    const avec = dessinElevation(r1, 'VID', true);
    expect(avec.split('class="bande"').length - 1).toBe(20);
  });
  it('un cas non calcule affiche son motif', () => {
    const svg = dessinElevation(r1, 'VID_EXC', false);
    propre(svg);
    expect(svg).toContain('non applicable');
  });
});

describe('profils', () => {
  it('REMP en trait plein, VID en tirets', () => {
    const svg = dessinProfils(r1, 'p_h', ['REMP', 'VID']);
    propre(svg);
    expect(svg).toContain('class="trace trace-REMP"');
    expect(svg).toContain('class="trace trace-VID"');
    expect(svg).toMatch(/trace-VID"[^>]*stroke-dasharray/);
    expect(svg).not.toMatch(/trace-REMP"[^>]*stroke-dasharray/);
  });
  it('les quatre grandeurs se dessinent, z vers le bas', () => {
    for (const g of ['p_h', 'p_w', 'p_v', 'n_zSk'] as const) {
      const svg = dessinProfils(r1, g, ['REMP', 'VID']);
      propre(svg);
      expect(svg).toContain('z (m)');
    }
  });
});

describe('vue en plan', () => {
  it('V2 circulaire : zones de l action localisee et de la vidange excentree', () => {
    const svg = dessinPlan(r2);
    propre(svg);
    expect(svg).toContain('35°');
    expect(svg).toContain('70°');
    expect(svg).toContain('class="zone-localisee"');
  });
  it('V1 rectangulaire : majoration uniforme', () => {
    const svg = dessinPlan(r1);
    propre(svg);
    expect(svg).toContain('0,36');
  });
});

describe('tremie', () => {
  it('fond plat : pas de dessin', () => {
    expect(dessinTremie(r1)).toBeNull();
  });
  it('V4 : p_n et p_t le long de la paroi, remplissage et vidange', () => {
    const svg = dessinTremie(r4) as string;
    propre(svg);
    expect(svg).toContain('p_n');
    expect(svg).toContain('p_t');
    expect(svg).toContain('class="trace trace-FOND_REMP"');
    expect(svg).toContain('class="trace trace-FOND_VID"');
  });
});
