// Test d'acceptation du lot 0 (T0.2). Ne pas modifier : voir PLAN.md.
import { describe, expect, it } from 'vitest';
import { NORME } from '../src/index';

describe('noyau', () => {
  it('declare la norme traitee', () => {
    expect(NORME).toBe('EN 1991-4:2006');
  });
});
