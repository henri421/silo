// Test d'acceptation du lot 9 (T9.1). Ne pas modifier : voir PLAN.md.
// Regles d'affichage de la suite (aedificium-ui, constatsAffichage) sur tout
// ce que l'ecran et la note montrent en francais.
import { describe, expect, it } from 'vitest';
import { constatsAffichage, definirLangue, notationHtml, texteVisible } from 'aedificium-ui';
import type { ResultatSilo } from '../../src/model/types';
import { blocsSynthese, messageDErreur, rendreBlocs } from '../../app/src/vue';
import { champsDepuisModele, modeleDepuisChamps, modeleParDefaut } from '../../app/src/form';
import { donneesDAffichage, ecran, essai, note } from './cas-affichage';

const controler = (nom: string, html: string): string[] =>
  constatsAffichage(texteVisible(html)).map((c) => `${nom} : ${c}`);

describe('affichage en francais', () => {
  it('ecran, dessins et note : aucun constat', () => {
    definirLangue('fr');
    const constats: string[] = [];
    for (const [nom, d] of donneesDAffichage()) {
      const r = essai(d);
      if (r instanceof Error) {
        constats.push(...controler(`${nom} erreur`, notationHtml(messageDErreur(r))));
        continue;
      }
      ecran(r).forEach((h, i) => constats.push(...controler(`${nom} ecran ${i}`, h)));
      constats.push(...controler(`${nom} note`, note(r)));
    }
    expect(constats).toEqual([]);
  });

  it('les symboles s affichent en indice, pas avec un souligne', () => {
    const r = essai(donneesDAffichage()[1][1]) as ResultatSilo;
    const html = rendreBlocs(blocsSynthese(r));
    expect(html).toContain('<sub>');
    expect(texteVisible(html)).not.toContain('_');
  });

  it('messages de saisie refusee', () => {
    const champs = champsDepuisModele(modeleParDefaut());
    const messages = [
      modeleDepuisChamps({ ...champs, hc: 'abc' }),
      modeleDepuisChamps({ ...champs, forme: 'circulaire', d: '' }),
      modeleDepuisChamps({ ...champs, fond: 'conique', forme: 'circulaire', d: '6', beta: '' }),
      modeleDepuisChamps({ ...champs, materiau: 'saisi', K_m: '' }),
    ].map((l) => (l.ok ? '' : l.message));
    expect(messages.every((m) => m.length > 0)).toBe(true);
    expect(messages.flatMap((m, i) => controler(`message ${i}`, notationHtml(m)))).toEqual([]);
  });
});
