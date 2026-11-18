// Test d'acceptation du lot E (audit R4) : annexe nationale luxembourgeoise,
// coefficients modifiables, enregistrement de la saisie, note qui montre l'annexe.
import { describe, expect, it } from 'vitest';
import { constatsAffichage, definirLangue, noteDeCalculHtml, texteVisible } from 'aedificium-ui';
import { calculer, en1991_4Recommande, type ProfilSilos } from '../../src/index';
import { COEFS, clauseDe, coefsDeLAnnexe, en1991_4Lu, profilDeCalcul, profilDeLAnnexe, type Coefs } from '../../app/src/annexe';
import { champsDepuisModele, donneesDepuisModele, modeleDepuisChamps, modeleParDefaut } from '../../app/src/form';
import { noteDuCalcul } from '../../app/src/note';
import { v1 } from '../fixtures';

const CARTOUCHE = { projet: 'Essai', element: 'Silo', date: '2026-11-18' };

describe('profil luxembourgeois', () => {
  it('chaque coefficient sourcee porte sa source AN-LU, valeur presumee retenue', () => {
    const lu = en1991_4Lu();
    const rec = en1991_4Recommande();
    for (const k of COEFS) {
      expect(lu.valeurs[k].valeur).toBe(rec.valeurs[k].valeur);
      expect(lu.valeurs[k].source).toMatch(/^ILNAS-EN 1991-4\/AN-LU:2020, .+ : valeur recommandée présumée retenue, non vérifiée sur l’annexe$/);
    }
    expect(lu.valeurs.C_h_elance.source).toBe(
      'ILNAS-EN 1991-4/AN-LU:2020, éq. 5.21 : valeur recommandée présumée retenue, non vérifiée sur l’annexe',
    );
    expect(lu.valeurs.k1_canal.source).toMatch(/, 5\.52 : /);
    expect(lu.nom).toMatch(/Luxembourg/);
  });

  it('le profil recommande reste celui de la norme, sans annexe', () => {
    expect(profilDeLAnnexe('recommande')).toEqual(en1991_4Recommande());
    expect(en1991_4Recommande().valeurs.C_b.source).toBe('EN 1991-4:2006, 6.1.2(4)');
  });

  it('la clause est la source sans son en-tete, repli sur la source entiere', () => {
    expect(clauseDe('EN 1991-4:2006, tableau 2.1')).toBe('tableau 2.1');
    expect(clauseDe('EN 1991-4:2006, 6.1.2(5) et (6)')).toBe('6.1.2(5) et (6)');
    expect(clauseDe('autre source')).toBe('autre source');
  });
});

describe('profil de calcul', () => {
  it('une valeur changee par l utilisateur est marquee imposee, les autres gardent leur source', () => {
    const coefs: Coefs = { ...coefsDeLAnnexe('lu'), C_b: 1.3 };
    const p = profilDeCalcul('lu', coefs);
    expect(p.valeurs.C_b.valeur).toBe(1.3);
    expect(p.valeurs.C_b.source).toMatch(/valeur imposée par l’utilisateur/);
    expect(p.valeurs.C_b.source).toMatch(/annexe : 1 /);
    expect(p.valeurs.C_h_elance).toEqual(en1991_4Lu().valeurs.C_h_elance);
  });

  it('une valeur changee sur l annexe recommandee est aussi marquee imposee', () => {
    const coefs: Coefs = { ...coefsDeLAnnexe('recommande'), theta_c: 30 };
    const p = profilDeCalcul('recommande', coefs);
    expect(p.valeurs.theta_c.valeur).toBe(30);
    expect(p.valeurs.theta_c.source).toMatch(/imposée/);
    expect(p.valeurs.C_b).toEqual(en1991_4Recommande().valeurs.C_b);
  });

  it('le profil de calcul sans changement est celui de l annexe', () => {
    expect(profilDeCalcul('lu', coefsDeLAnnexe('lu'))).toEqual(en1991_4Lu());
  });

  it('le noyau recoit le profil luxembourgeois et le nomme dans son resultat', () => {
    const m = modeleParDefaut();
    const r = calculer(donneesDepuisModele(m), en1991_4Lu());
    expect(r.profil).toMatch(/Luxembourg/);
    expect(COEFS).toHaveLength(19);
  });
});

describe('saisie', () => {
  it('par defaut : annexe recommandee et coefficients recommandes', () => {
    const m = modeleParDefaut();
    expect(m.annexe).toBe('recommande');
    expect(m.coefs).toEqual(coefsDeLAnnexe('recommande'));
    expect(m.coefs.C_b).toBe(1);
  });

  it('l annexe et les coefficients sont enregistres et relus', () => {
    const m = modeleParDefaut();
    const coefs: Coefs = { ...coefsDeLAnnexe('lu'), C_b: 1.25 };
    const champs = champsDepuisModele({ ...m, annexe: 'lu', coefs });
    expect(champs['annexe']).toBe('lu');
    expect(champs['coef_C_b']).toBe('1,25');
    const relu = modeleDepuisChamps(champs);
    expect(relu.ok && relu.modele.annexe).toBe('lu');
    expect(relu.ok && relu.modele.coefs).toEqual(coefs);
  });

  it('un ancien fichier, sans annexe ni coefficients, se relit avec les valeurs recommandees', () => {
    const ancien = { ...champsDepuisModele(modeleParDefaut()) } as Record<string, string>;
    delete ancien['annexe'];
    for (const k of COEFS) delete ancien[`coef_${k}`];
    const relu = modeleDepuisChamps(ancien);
    expect(relu.ok).toBe(true);
    if (!relu.ok) return;
    expect(relu.modele.annexe).toBe('recommande');
    expect(relu.modele.coefs).toEqual(coefsDeLAnnexe('recommande'));
  });

  it('un coefficient illisible est refuse et nomme son champ', () => {
    const champs = champsDepuisModele(modeleParDefaut());
    const refus = modeleDepuisChamps({ ...champs, coef_theta_c: 'abc' });
    expect(refus.ok).toBe(false);
    if (refus.ok) return;
    expect(refus.message).toMatch(/coef_theta_c/);
  });
});

describe('note', () => {
  it('annexe retenue : norme AN-LU, avertissement en tete, coefficients et sources visibles', () => {
    const m = { ...modeleParDefaut(), annexe: 'lu' as const, coefs: coefsDeLAnnexe('lu') };
    const p = profilDeCalcul('lu', m.coefs);
    const r = calculer(donneesDepuisModele(m), p);
    const note = noteDuCalcul(r, CARTOUCHE, p, 'lu');
    expect(note.cartouche.norme).toBe('EN 1991-4:2006, ILNAS-EN 1991-4/AN-LU:2020');
    expect(note.avertissements?.[0]).toMatch(/^Annexe nationale luxembourgeoise/);
    const texte = texteVisible(noteDeCalculHtml(note, ''));
    expect(texte).toContain('Luxembourg');
    expect(texte).toContain('AN-LU:2020');
    expect(texte).toContain('valeur recommandée présumée retenue');
    expect(texte).toContain('silo élancé');
  });

  it('valeurs recommandees : note inchangee quant a l annexe, sans avertissement', () => {
    const m = modeleParDefaut();
    const p = profilDeLAnnexe('recommande');
    const r = calculer(donneesDepuisModele(m), p);
    const note = noteDuCalcul(r, CARTOUCHE, p, 'recommande');
    expect(note.cartouche.norme).toBe('EN 1991-4:2006');
    expect(note.avertissements).toEqual([]);
    const texte = texteVisible(noteDeCalculHtml(note, ''));
    expect(texte).toContain('Valeurs recommandées');
    expect(texte).not.toContain('AN-LU');
  });

  it('en anglais, la note luxembourgeoise ne laisse aucun reste de francais', () => {
    definirLangue('en');
    try {
      const m = { ...modeleParDefaut(), annexe: 'lu' as const, coefs: coefsDeLAnnexe('lu') };
      const p: ProfilSilos = profilDeCalcul('lu', m.coefs);
      const r = calculer(donneesDepuisModele(m), p);
      const html = noteDeCalculHtml(noteDuCalcul(r, CARTOUCHE, p, 'lu'), '');
      const constats = constatsAffichage(texteVisible(html), { langue: 'en' });
      expect(constats).toEqual([]);
    } finally {
      definirLangue('fr');
    }
  });
});

describe('valeurs de base', () => {
  it('le cas V1 se calcule avec les deux annexes', () => {
    expect(() => calculer(v1(), en1991_4Lu())).not.toThrow();
    expect(() => calculer(v1(), en1991_4Recommande())).not.toThrow();
  });
});

