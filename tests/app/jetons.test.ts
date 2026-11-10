// Test d'acceptation du lot 0 (T0.3). Ne pas modifier : voir PLAN.md.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { JETONS, valeursDesJetons } from 'aedificium-ui';

function feuille(): string {
  return readFileSync(new URL('../../app/src/style.css', import.meta.url), 'utf8');
}

describe('jetons communs', () => {
  it('le :root de style.css porte les memes valeurs que JETONS d aedificium-ui', () => {
    const css = feuille();
    const racine = css.slice(css.indexOf(':root'), css.indexOf('}', css.indexOf(':root')) + 1);
    expect(valeursDesJetons(racine)).toEqual(valeursDesJetons(JETONS));
  });

  it('aucune couleur codee en dur hors du bloc :root', () => {
    const css = feuille();
    const finRacine = css.indexOf('}', css.indexOf(':root')) + 1;
    const reste = css.slice(finRacine).replace(/\/\*[\s\S]*?\*\//g, '');
    expect(reste).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(reste).not.toMatch(/\brgba?\(/);
  });
});
