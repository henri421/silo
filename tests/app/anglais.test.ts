// Test d'acceptation du lot 9 (T9.2 et T9.3). Ne pas modifier : voir PLAN.md.
// Page anglaise de meme squelette que la page francaise, et aucun reste de
// francais dans ce qui s'affiche en anglais : ecran, dessins, note, CSV, messages.
import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { constatsAffichage, contenuBalise, definirLangue, notationHtml, texteVisible } from 'aedificium-ui';
import { calculer, en1991_4Recommande } from '../../src/index';
import type { ResultatSilo } from '../../src/model/types';
import { ENTETES, csvBandes, csvLocalisee, csvProfils, csvSynthese, csvTremie } from '../../app/src/export';
import { champsDepuisModele, modeleDepuisChamps, modeleParDefaut } from '../../app/src/form';
import { textes } from '../../app/src/textes';
import { messageDErreur } from '../../app/src/vue';
import { donneesDAffichage, ecran, essai, note } from './cas-affichage';
import { v1, v4 } from '../fixtures';

const lire = (f: string): string => readFileSync(new URL(`../../${f}`, import.meta.url), 'utf8');
const controler = (nom: string, html: string): string[] =>
  constatsAffichage(texteVisible(html), { langue: 'en' }).map((c) => `${nom} : ${c}`);
/** CSV : virgule separateur et symboles bruts des en-tetes admis (donnees pour le modele EF). */
const controlerCsv = (nom: string, csv: string): string[] =>
  constatsAffichage(csv, { langue: 'en' })
    .filter((c) => !c.startsWith('virgule decimale') && !c.startsWith('« _ »'))
    .map((c) => `${nom} : ${c}`);

/** Squelette d'une page : les attributs que lit le script, dans l'ordre. */
function squelette(html: string): string[] {
  return [...html.matchAll(/\s(id|data-[a-z-]+|type|value|for|name)="([^"]*)"/g)].map((m) => `${m[1]}=${m[2]}`);
}

describe('page anglaise', () => {
  const fr = lire('app/index.html');
  const en = lire('app/en/index.html');

  it('meme squelette que la page francaise', () => {
    expect(squelette(en)).toEqual(squelette(fr));
  });

  it('titre anglais, aucun reste de francais', () => {
    expect(contenuBalise(en, 'h1')).toBe('Pressures in silos');
    expect(controler('page', en.replace(/lang="fr"[^>]*>FR</, '>'))).toEqual([]);
  });

  it('six blocs de saisie aux legendes anglaises', () => {
    const legendes = [...en.matchAll(/<legend>([^<]*)<\/legend>/g)].map((m) => m[1].trim());
    expect(legendes).toEqual(['Geometry', 'Bottom', 'Material', 'Walls', 'Operation', 'Discretisation']);
  });
});

describe('affichage en anglais', () => {
  beforeEach(() => definirLangue('en'));
  afterEach(() => definirLangue('fr'));

  it('les textes ont une version anglaise', () => {
    expect(textes().blocs.classement).not.toBe('Classement');
  });

  it('ecran, dessins, note et CSV : aucun reste de francais', () => {
    const constats: string[] = [];
    for (const [nom, d] of donneesDAffichage()) {
      const r = essai(d);
      if (r instanceof Error) {
        constats.push(...controler(`${nom} erreur`, notationHtml(messageDErreur(r))));
        continue;
      }
      ecran(r).forEach((h, i) => constats.push(...controler(`${nom} ecran ${i}`, h)));
      constats.push(...controler(`${nom} note`, note(r)));
      const fichiers: [string, string][] = [
        ['profils', csvProfils(r)],
        ['bandes', csvBandes(r)],
        ['tremie', csvTremie(r)],
        ['localisee', csvLocalisee(r)],
        ['synthese', csvSynthese(r)],
      ];
      for (const [f, csv] of fichiers) constats.push(...controlerCsv(`${nom} ${f}.csv`, csv));
    }
    expect(constats).toEqual([]);
  });

  it('messages de saisie refusee', () => {
    const champs = champsDepuisModele(modeleParDefaut());
    const messages = [
      modeleDepuisChamps({ ...champs, hc: 'abc' }),
      modeleDepuisChamps({ ...champs, forme: 'circulaire', d: '' }),
      modeleDepuisChamps({ ...champs, materiau: 'saisi', K_m: '' }),
    ].map((l) => (l.ok ? '' : l.message));
    expect(messages.flatMap((m, i) => controler(`message ${i}`, notationHtml(m)))).toEqual([]);
    expect(controler('inconnue', notationHtml(messageDErreur('x')))).toEqual([]);
  });

  it('CSV anglais : virgule separateur, point decimal, en-tetes anglais', () => {
    const P = en1991_4Recommande();
    const r1: ResultatSilo = calculer(v1(), P);
    expect(ENTETES.profils).toEqual([
      'case', 'z [m]', 'Z [m]', 'p_h sym [kPa]', 'p_h local or increased [kPa]', 'p_h total [kPa]',
      'p_w [kPa]', 'p_v [kPa]', 'n_zSk [kN/m]', 'combination',
    ]);
    expect(ENTETES.bandes).toEqual([
      'case', 'strip', 'z top [m]', 'z bottom [m]', 'Z top [m]', 'Z bottom [m]',
      'p_h top [kPa]', 'p_h bottom [kPa]', 'p_h constant [kPa]', 'p_w top [kPa]', 'p_w bottom [kPa]', 'p_w constant [kPa]',
    ]);
    expect(ENTETES.tremie).toEqual(['case', 'x [m]', 'Z [m]', 'p_v [kPa]', 'p_n [kPa]', 'p_t [kPa]']);
    const lignes = csvProfils(r1).slice(1).split('\r\n');
    expect(lignes).toContain(ENTETES.profils.join(','));
    const l = lignes.find((k) => k.startsWith('VID,10.0000,'));
    expect(l, 'ligne VID a z = 10 m').toBeDefined();
    expect(l).toContain(',46.4722,19.0396,');
    expect(csvProfils(r1)).toContain('characteristic values, partial factors not applied');
    expect(csvTremie(calculer(v4(), P))).toContain('123.9557');
  });
});
