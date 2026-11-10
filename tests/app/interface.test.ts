// Test d'acceptation du lot 7 (T7.4). Ne pas modifier : voir PLAN.md.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { CHAMPS } from '../../app/src/form';

const lire = (f: string): string => readFileSync(new URL(`../../${f}`, import.meta.url), 'utf8');
const doc = new JSDOM(lire('app/index.html')).window.document;

describe('formulaire par blocs (SPEC §2, PLAN lot 7)', () => {
  it('six blocs, dans l ordre', () => {
    const legendes = [...doc.querySelectorAll('#formulaire fieldset > legend')].map((l) => l.textContent?.trim());
    expect(legendes).toEqual(['Géométrie', 'Fond', 'Matériau', 'Parois', 'Exploitation', 'Discrétisation']);
  });
  it('chaque champ du modele a son element, et aucun autre', () => {
    const presents = [...doc.querySelectorAll('[data-champ]')].map((e) => e.getAttribute('data-champ'));
    expect([...presents].sort()).toEqual([...CHAMPS].sort());
  });
  it('pas de bouton calculer : recalcul en continu', () => {
    const boutons = [...doc.querySelectorAll('button')].map((b) => (b.textContent ?? '').toLowerCase());
    expect(boutons.some((t) => t.includes('calculer'))).toBe(false);
    expect(lire('app/src/main.ts')).toMatch(/addEventListener\(\s*'input'/);
  });
  it('les zones de resultat existent', () => {
    for (const r of ['synthese', 'cas', 'points-ouverts', 'elevation', 'profils', 'plan', 'tremie', 'erreur']) {
      expect(doc.querySelector(`[data-role="${r}"]`), r).not.toBeNull();
    }
  });
  it('la barre des feuilles reste entre l en-tete et main', () => {
    const html = lire('app/index.html');
    const zone = html.indexOf('data-role="feuilles"');
    expect(zone).toBeGreaterThan(html.indexOf('</header>'));
    expect(zone).toBeLessThan(html.indexOf('<main'));
  });
  it('main.ts enregistre la saisie dans les feuilles', () => {
    const main = lire('app/src/main.ts');
    expect(main).toContain('brancherFeuilles');
    expect(main).toContain('champsDepuisModele');
  });
  it('aucun tiret cadratin dans la page', () => {
    expect(lire('app/index.html')).not.toContain('—');
  });
});
