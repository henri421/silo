// Test d'acceptation du lot 10 (T10.2 et T10.3). Ne pas modifier : voir PLAN.md.
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { constatsAffichage, definirLangue, texteVisible } from 'aedificium-ui';
import { calculer, cartePressions, en1991_4Recommande } from '../../src/index';
import type { CarteCas, IdCas, ResultatSilo } from '../../src/model/types';
import { ENTETES, csvCarte } from '../../app/src/export';
import { dessinDeveloppe } from '../../app/src/dessins';
import { v1, v2 } from '../fixtures';

const P = en1991_4Recommande();
const r1 = calculer(v1(), P);
const r2 = calculer(v2(), P);
const IDS: IdCas[] = ['REMP', 'VID', 'VID_EXC'];
const cartes = (r: ResultatSilo, pas = 10): CarteCas[] => IDS.map((id) => cartePressions(r, P, id, { pasTheta: pas }));
const lire = (f: string): string => readFileSync(new URL(`../../${f}`, import.meta.url), 'utf8');

function lignes(csv: string): string[] {
  expect(csv.startsWith('﻿')).toBe(true);
  return csv.slice(1).split('\r\n').filter((l) => l.length > 0);
}

afterEach(() => definirLangue('fr'));

describe('carte.csv', () => {
  it('en-tete de colonnes et noeud de V2', () => {
    expect(ENTETES.carte).toEqual(['cas', 'z [m]', 'Z [m]', 'θ [°]', 'p_h [kPa]', 'p_w [kPa]']);
    const ls = lignes(csvCarte(r2, cartes(r2)));
    const i = ls.indexOf(ENTETES.carte.join(';'));
    expect(i).toBeGreaterThan(0);
    const tete = ls.slice(0, i).join('\n');
    expect(tete).toContain('EN 1991-4:2006');
    expect(tete).toContain('valeurs caractéristiques, coefficients partiels non appliqués');
    expect(tete).toMatch(/11,25/);
    const d = ls.slice(i + 1).map((l) => l.split(';'));
    const n = d.find((l) => l[0] === 'REMP' && l[1] === '9,0000' && l[3] === '0,0000')!;
    expect(n[2]).toBe('9,0000');
    expect(n[4]).toBe('44,5080');
    expect(d.some((l) => l[0] === 'REMP' && l[3] === '11,2500')).toBe(true);
    expect(d.some((l) => l[0] === 'VID_EXC')).toBe(true);
  });
  it('silo rectangulaire : une ligne motivee par cas', () => {
    const csv = csvCarte(r1, cartes(r1));
    expect(csv).toMatch(/REMP;[^\r]*non applicable/);
    expect(csv).toMatch(/rectangulaire/);
  });
  it('en anglais : virgule separateur, point decimal, aucun reste de francais', () => {
    definirLangue('en');
    expect(ENTETES.carte).toEqual(['case', 'z [m]', 'Z [m]', 'θ [°]', 'p_h [kPa]', 'p_w [kPa]']);
    const csv = csvCarte(r2, cartes(r2));
    expect(csv).toContain('REMP,9.0000,9.0000,0.0000,44.5080,');
    const constats = constatsAffichage(csv, { langue: 'en' }).filter(
      (c) => !c.startsWith('virgule decimale') && !c.startsWith('« _ »')
    );
    expect(constats).toEqual([]);
  });
});

describe('developpe de la paroi', () => {
  function propre(svg: string): void {
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).not.toContain('NaN');
    expect(svg).not.toContain('undefined');
    expect(svg).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(svg).not.toMatch(/\brgba?\(/);
    expect(svg).toContain('var(--');
  }
  it('V2 REMP : cellules teintees selon p_h, axes z et θ', () => {
    const svg = dessinDeveloppe(cartePressions(r2, P, 'REMP', { pasTheta: 10 }));
    propre(svg);
    expect(svg.split('class="cellule"').length - 1).toBeGreaterThan(100);
    expect(svg).toContain('θ');
    expect(constatsAffichage(texteVisible(svg))).toEqual([]);
  });
  it('carte non calculee : le motif s affiche', () => {
    const svg = dessinDeveloppe(cartePressions(r1, P, 'REMP'));
    propre(svg);
    expect(svg).toContain('non applicable');
  });
  it('en anglais, aucun reste de francais', () => {
    definirLangue('en');
    const svg = dessinDeveloppe(cartePressions(r2, P, 'VID_EXC', { pasTheta: 10 }));
    expect(constatsAffichage(texteVisible(svg), { langue: 'en' })).toEqual([]);
  });
});

describe('page', () => {
  it('bouton d export, pas angulaire, position z_p et zone du developpe, sur les deux pages', () => {
    const main = lire('app/src/main.ts');
    expect(main).toContain('exporter-carte');
    expect(main).toContain('cartePressions');
    for (const page of ['app/index.html', 'app/en/index.html']) {
      const html = lire(page);
      expect(html, page).toContain('data-action="exporter-carte"');
      for (const role of ['carte-cas', 'carte-pas', 'carte-zp', 'developpe']) expect(html, `${page} ${role}`).toContain(`data-role="${role}"`);
    }
  });
});
