// Test d'acceptation du lot 0 (T0.1). Ne pas modifier : voir PLAN.md.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

function texte(chemin: string): string {
  return readFileSync(new URL(`../../${chemin}`, import.meta.url), 'utf8');
}

describe('package.json', () => {
  const pkg = JSON.parse(texte('package.json'));

  it('porte le nom du depot et les scripts de la suite', () => {
    expect(pkg.name).toBe('silo');
    expect(pkg.private).toBe(true);
    expect(pkg.type).toBe('module');
    expect(pkg.scripts.test).toBe('vitest run');
    expect(pkg.scripts.typecheck).toBe('tsc --noEmit');
    expect(pkg.scripts.dev).toBe('vite');
    expect(pkg.scripts.build).toMatch(/vite build/);
  });

  it('n a aucune dependance de production et epingle aedificium-ui sur une v1.x', () => {
    expect(pkg.dependencies).toBeUndefined();
    expect(pkg.devDependencies['aedificium-ui']).toMatch(/^github:henri421\/aedificium-ui#v1\.\d+\.\d+$/);
    const permises = new Set([
      '@types/jsdom',
      '@types/node',
      'aedificium-ui',
      'jsdom',
      'typescript',
      'vite',
      'vite-plugin-pwa',
      'vitest',
    ]);
    for (const nom of Object.keys(pkg.devDependencies)) expect(permises.has(nom)).toBe(true);
  });
});

describe('vite.config.ts', () => {
  const cfg = texte('vite.config.ts');

  it('construit app/ vers docs/ avec les pages fr et en', () => {
    expect(cfg).toMatch(/root:\s*'app'/);
    expect(cfg).toMatch(/base:\s*'\.\/'/);
    expect(cfg).toMatch(/outDir:\s*'\.\.\/docs'/);
    expect(cfg).toMatch(/emptyOutDir:\s*false/);
    expect(cfg).toContain('./app/en/index.html');
  });

  it('declare une PWA propre au silo', () => {
    expect(cfg).toContain("short_name: 'Silos'");
    expect(cfg).toContain("name: 'Silos, pressions des matériaux ensilés selon l EN 1991-4'");
    expect(cfg).toContain("registerType: 'prompt'");
    expect(cfg).toContain('icone-masquable-512.png');
    expect(cfg).not.toContain('charges-climatiques');
  });
});

describe('workflow et depot', () => {
  it('la CI controle les types, teste, construit puis publie', () => {
    const wf = texte('.github/workflows/pages.yml');
    for (const etape of ['npm ci', 'npm run typecheck', 'npm test', 'npm run build', 'actions/deploy-pages']) {
      expect(wf).toContain(etape);
    }
  });

  it('la construction n est pas suivie par Git, la validation l est', () => {
    const gi = texte('.gitignore');
    expect(gi).toMatch(/^docs\/\*\r?$/m);
    expect(gi).toMatch(/^!docs\/validation\/\r?$/m);
    expect(gi).toMatch(/^node_modules\r?$/m);
  });

  it('le PDF de la norme est exclu', () => {
    expect(texte('.gitignore')).toMatch(/^\*\.pdf\r?$/m);
  });
});
