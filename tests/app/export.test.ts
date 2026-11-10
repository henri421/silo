// Test d'acceptation du lot 8. Ne pas modifier : voir PLAN.md.
// Valeurs attendues : docs/validation/V1, V2 et V4, recopiees en dur.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { noteDeCalculHtml } from 'aedificium-ui';
import { calculer, en1991_4Recommande } from '../../src/index';
import {
  ENTETES,
  csvBandes,
  csvLocalisee,
  csvProfils,
  csvSynthese,
  csvTremie,
  jsonResultat,
} from '../../app/src/export';
import { noteDuCalcul } from '../../app/src/note';
import { v1, v2, v4 } from '../fixtures';

const P = en1991_4Recommande();
const r1 = calculer(v1(), P);
const r2 = calculer(v2(), P);
const r4 = calculer(v4(), P);

const BOM = '﻿';
const MENTION = 'valeurs caractéristiques, coefficients partiels non appliqués';

function lignes(csv: string): string[] {
  expect(csv.startsWith(BOM)).toBe(true);
  expect(csv).toContain('\r\n');
  return csv.slice(1).split('\r\n').filter((l) => l.length > 0);
}

/** Lignes de donnees : celles qui suivent la ligne d'en-tete de colonnes. */
function donnees(csv: string, entete: readonly string[]): string[][] {
  const ls = lignes(csv);
  const i = ls.indexOf(entete.join(';'));
  expect(i, 'ligne d en-tete de colonnes').toBeGreaterThan(0);
  return ls.slice(i + 1).map((l) => l.split(';'));
}

describe('bloc d en-tete commun (SPEC §8.2)', () => {
  it('chaque fichier rappelle l outil, la norme, la mention et l exclusivite des cas', () => {
    for (const csv of [csvProfils(r1), csvBandes(r1), csvTremie(r1), csvLocalisee(r1)]) {
      const tete = lignes(csv).slice(0, 15).join('\n');
      expect(tete).toContain('silo');
      expect(tete).toContain('EN 1991-4:2006');
      expect(tete).toContain(MENTION);
      expect(tete).toMatch(/REMP.*VID.*VID_EXC.*exclusifs/);
      expect(tete).toMatch(/C1/);
    }
  });
});

describe('profils.csv', () => {
  it('en-tete de colonnes de SPEC §8.2', () => {
    expect(ENTETES.profils).toEqual([
      'cas', 'z [m]', 'Z [m]', 'p_h sym [kPa]', 'p_h localisee ou majoree [kPa]', 'p_h total [kPa]',
      'p_w [kPa]', 'p_v [kPa]', 'n_zSk [kN/m]', 'combinaison',
    ]);
  });
  it('une ligne par (cas, z) pour REMP et VID, une ligne motivee pour VID_EXC non applicable', () => {
    const d = donnees(csvProfils(r1), ENTETES.profils);
    const n = r1.cas.find((c) => c.id === 'REMP')!.profil.length;
    expect(d.filter((l) => l[0] === 'REMP')).toHaveLength(n);
    expect(d.filter((l) => l[0] === 'VID')).toHaveLength(n);
    const exc = d.filter((l) => l[0] === 'VID_EXC');
    expect(exc).toHaveLength(1);
    expect(exc[0].join(' ')).toMatch(/non applicable/);
  });
  it('valeurs de V1 a z = 10 m, virgule decimale, 4 decimales', () => {
    const d = donnees(csvProfils(r1), ENTETES.profils);
    const l = d.find((k) => k[0] === 'VID' && k[1] === '10,0000')!;
    expect(l[5]).toBe('46,4722');
    expect(l[6]).toBe('19,0396');
  });
});

describe('bandes.csv', () => {
  it('en-tete de colonnes', () => {
    expect(ENTETES.bandes).toEqual([
      'cas', 'bande', 'z haut [m]', 'z bas [m]', 'Z haut [m]', 'Z bas [m]',
      'p_h haut [kPa]', 'p_h bas [kPa]', 'p_h constant [kPa]', 'p_w haut [kPa]', 'p_w bas [kPa]', 'p_w constant [kPa]',
    ]);
  });
  it('V1, cas VID : bandes 1, 2 et 20', () => {
    const d = donnees(csvBandes(r1), ENTETES.bandes).filter((l) => l[0] === 'VID');
    expect(d.slice(0, 20)).toHaveLength(20);
    expect(d[0].slice(1, 9)).toEqual(['1', '0,0000', '1,0000', '20,0000', '19,0000', '0,0000', '8,9522', '8,9522']);
    expect(d[1][7]).toBe('16,4879');
    expect(d[19][6]).toBe('54,4344');
    expect(d[19][7]).toBe('54,7738');
  });
  it('pied de fichier : somme des trapezes, integrale exacte et ecart', () => {
    const csv = csvBandes(r1);
    expect(csv).toMatch(/VID;[^\r]*812,793/);
    expect(csv).toMatch(/813,578/);
    expect(csv).toMatch(/-0,097 %/);
  });
  it('les cas non calcules sortent avec leur motif', () => {
    expect(csvBandes(r1)).toMatch(/VID_EXC;[^\r]*non applicable/);
  });
});

describe('tremie.csv', () => {
  it('V4 : en-tete et premier point de remplissage', () => {
    expect(ENTETES.tremie).toEqual(['cas', 'x [m]', 'Z [m]', 'p_v [kPa]', 'p_n [kPa]', 'p_t [kPa]']);
    const d = donnees(csvTremie(r4), ENTETES.tremie);
    const premier = d.find((l) => l[0] === 'FOND_REMP')!;
    expect(premier[3]).toBe('123,9557');
    expect(premier[4]).toBe('113,6056');
    expect(d.some((l) => l[0] === 'FOND_VID')).toBe(true);
  });
  it('fond plat : une ligne par cas, sans x', () => {
    const d = donnees(csvTremie(r1), ENTETES.tremie);
    expect(d).toHaveLength(2);
    expect(d[0][1]).toBe('');
    expect(d[0][3]).toBe('107,4648');
  });
});

describe('localisee.csv', () => {
  it('V2 : zones de l action localisee et de la vidange excentree, p_pi negatif', () => {
    const csv = csvLocalisee(r2);
    expect(csv).toContain('1,1781');
    expect(csv).toMatch(/ecoulement;[^\r]*0;[^\r]*35/);
    expect(csv).toMatch(/contrainte-elevee;[^\r]*35;[^\r]*70/);
    expect(csv).toMatch(/-0,4700/);
    expect(csv).toMatch(/vers l'intérieur/);
  });
  it('V1 : silo rectangulaire, majoration 0,36 rappelee', () => {
    expect(csvLocalisee(r1)).toContain('0,36');
  });
});

describe('synthese.csv', () => {
  it('reprend les blocs de la synthese', () => {
    const csv = csvSynthese(r1);
    expect(csv.startsWith(BOM)).toBe(true);
    expect(csv).toContain('Classement');
    expect(csv).toContain('Cas de charge');
  });
});

describe('JSON versionne', () => {
  it('format, version, cas et points ouverts', () => {
    const j = JSON.parse(jsonResultat(r2));
    expect(j.format).toBe('silo-resultat');
    expect(j.version).toBe(1);
    expect(j.norme).toBe('EN 1991-4:2006');
    expect(j.mention).toBe(MENTION);
    expect(j.cas).toHaveLength(5);
    expect(j.pointsOuverts).toEqual(['P1', 'P2', 'P4', 'P5']);
    expect(j.bandes.length).toBeGreaterThan(0);
  });
});

describe('note de calcul', () => {
  it('s ouvre sur les hypotheses, cite les points ouverts et chaque cas', () => {
    const html = noteDeCalculHtml(noteDuCalcul(r2, { projet: 'Essai', element: 'Silo V2', date: '2026-11-10' }));
    const doc = new JSDOM(html).window.document;
    const texte = doc.body.textContent ?? '';
    expect(texte).toContain('EN 1991-4');
    for (const p of ['P1', 'P2', 'P4', 'P5']) expect(texte).toContain(p);
    for (const c of ['REMP', 'VID', 'VID_EXC', 'FOND_REMP', 'FOND_VID']) expect(texte).toContain(c);
    expect(texte).toContain(MENTION);
    expect(doc.querySelectorAll('svg').length).toBeGreaterThanOrEqual(3);
    expect(html).not.toContain('NaN');
  });
});

describe('boutons d export', () => {
  it('la page porte les sept boutons, cables dans main.ts', () => {
    const html = readFileSync(new URL('../../app/index.html', import.meta.url), 'utf8');
    const main = readFileSync(new URL('../../app/src/main.ts', import.meta.url), 'utf8');
    for (const a of ['profils', 'bandes', 'tremie', 'localisee', 'synthese', 'json', 'note']) {
      expect(html, a).toContain(`data-action="exporter-${a}"`);
      expect(main, a).toContain(`exporter-${a}`);
    }
  });
});
