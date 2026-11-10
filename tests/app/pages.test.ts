// Test d'acceptation du lot 0 (T0.3 et T0.4). Ne pas modifier : voir PLAN.md.
import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

function texte(chemin: string): string {
  return readFileSync(new URL(`../../${chemin}`, import.meta.url), 'utf8');
}

function page(chemin: string): Document {
  return new JSDOM(texte(chemin)).window.document;
}

describe('page francaise', () => {
  const doc = page('app/index.html');

  it('est en francais, titree sur les silos et l EN 1991-4', () => {
    expect(doc.documentElement.lang).toBe('fr');
    expect(doc.title).toBe('Pressions dans les silos, EN 1991-4');
    expect(doc.querySelector('h1')?.textContent?.trim()).toBe('Pressions dans les silos');
  });

  it('porte la barre commune avec le lien vers le hub et vers la version anglaise', () => {
    const barre = doc.querySelector('nav.barre');
    expect(barre).not.toBeNull();
    expect(barre?.querySelector('.barre-nom')?.textContent).toBe('Aedificium · Actions');
    expect(barre?.querySelector('a.barre-lien')?.getAttribute('href')).toBe('https://henri421.github.io/WebAedificium/');
    const langue = barre?.querySelector('a.barre-langue');
    expect(langue?.getAttribute('href')).toBe('en/');
    expect(langue?.getAttribute('hreflang')).toBe('en');
  });

  it('declare l icone, la barre des feuilles et le script principal', () => {
    expect(doc.querySelector('link[rel="icon"]')?.getAttribute('href')).toBe('./icone.svg');
    expect(doc.querySelector('link[rel="apple-touch-icon"]')?.getAttribute('href')).toBe('./icone-192.png');
    expect(doc.querySelector('[data-role="feuilles"]')).not.toBeNull();
    expect(doc.querySelector('main')).not.toBeNull();
    expect(doc.querySelector('script[type="module"]')?.getAttribute('src')).toBe('./src/main.ts');
  });

  it('rappelle que les valeurs sont caracteristiques', () => {
    expect(doc.querySelector('header .avertissement')?.textContent).toMatch(/caractéristiques/);
  });
});

describe('page anglaise', () => {
  const doc = page('app/en/index.html');

  it('est en anglais et renvoie vers la version francaise et le hub anglais', () => {
    expect(doc.documentElement.lang).toBe('en');
    expect(doc.title).toBe('Pressures in silos, EN 1991-4');
    expect(doc.querySelector('h1')?.textContent?.trim()).toBe('Pressures in silos');
    expect(doc.querySelector('a.barre-lien')?.getAttribute('href')).toBe('https://henri421.github.io/WebAedificium/en/');
    const langue = doc.querySelector('a.barre-langue');
    expect(langue?.getAttribute('href')).toBe('../');
    expect(langue?.getAttribute('hreflang')).toBe('fr');
    expect(doc.querySelector('link[rel="icon"]')?.getAttribute('href')).toBe('../icone.svg');
    expect(doc.querySelector('[data-role="feuilles"]')).not.toBeNull();
    expect(doc.querySelector('script[type="module"]')?.getAttribute('src')).toBe('../src/main.ts');
  });

  it('rappelle que les valeurs sont caracteristiques', () => {
    expect(doc.querySelector('header .avertissement')?.textContent).toMatch(/characteristic/);
  });
});

describe('style des textes affiches', () => {
  it('aucun tiret cadratin dans les pages', () => {
    expect(texte('app/index.html')).not.toContain('—');
    expect(texte('app/en/index.html')).not.toContain('—');
  });
});

describe('icones', () => {
  it('les quatre fichiers d icone existent', () => {
    for (const f of ['icone.svg', 'icone-192.png', 'icone-512.png', 'icone-masquable-512.png']) {
      expect(existsSync(new URL(`../../app/public/${f}`, import.meta.url))).toBe(true);
    }
  });
});
