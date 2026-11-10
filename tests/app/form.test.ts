// Test d'acceptation du lot 7 (T7.1). Ne pas modifier : voir PLAN.md.
import { describe, expect, it } from 'vitest';
import {
  CHAMPS,
  champsDepuisModele,
  donneesDepuisModele,
  modeleDepuisChamps,
  modeleParDefaut,
} from '../../app/src/form';
import { v1 } from '../fixtures';

function champs(modifs: Record<string, string> = {}): Record<string, string> {
  return { ...champsDepuisModele(modeleParDefaut()), ...modifs };
}

function lire(modifs: Record<string, string> = {}) {
  const l = modeleDepuisChamps(champs(modifs));
  if (!l.ok) throw new Error(l.message);
  return l.modele;
}

describe('modele par defaut', () => {
  it('reproduit le cas V1', () => {
    const d = donneesDepuisModele(modeleParDefaut());
    const ref = v1();
    expect(d.silo).toEqual(ref.silo);
    expect(d.parois).toEqual(ref.parois);
    expect(d.exploitation).toEqual({ ...ref.exploitation, assemblage: 'soude', methodeLocalisee: 'action-localisee' });
    expect(d.discretisation).toEqual(ref.discretisation);
    expect(d.materiau.id).toBe('sable');
    expect(d.materiau.mu_m).toEqual(ref.materiau.mu_m);
  });
});

describe('lecture des champs', () => {
  it('les cles des champs sont celles de CHAMPS', () => {
    expect(Object.keys(champsDepuisModele(modeleParDefaut())).sort()).toEqual([...CHAMPS].sort());
  });
  it('aller-retour champs, modele, champs', () => {
    expect(champsDepuisModele(lire())).toEqual(champs());
  });
  it('virgule decimale acceptee', () => {
    expect(lire({ hc: '20,5' }).hc).toBe(20.5);
  });
  it('texte illisible : refus motive qui nomme le champ', () => {
    const l = modeleDepuisChamps(champs({ hc: 'abc' }));
    expect(l.ok).toBe(false);
    if (!l.ok) expect(l.message).toMatch(/hc/);
  });
  it('un champ masque n est pas exige', () => {
    expect(modeleDepuisChamps(champs({ d: '' })).ok).toBe(true);
    expect(modeleDepuisChamps(champs({ forme: 'circulaire', d: '' })).ok).toBe(false);
    expect(modeleDepuisChamps(champs({ beta: '' })).ok).toBe(true);
    expect(modeleDepuisChamps(champs({ fond: 'conique', forme: 'circulaire', d: '6', beta: '' })).ok).toBe(false);
  });
  it('e_t vide vaut e_f, classe imposee vide est absente', () => {
    const d = donneesDepuisModele(lire({ e_t: '', classe_imposee: '' }));
    expect(d.exploitation.e_t).toBeUndefined();
    expect(d.exploitation.classeImposee).toBeUndefined();
    const d2 = donneesDepuisModele(lire({ e_t: '1,5', classe_imposee: '3' }));
    expect(d2.exploitation.e_t).toBe(1.5);
    expect(d2.exploitation.classeImposee).toBe(3);
  });
  it('cases a cocher : oui ou non', () => {
    const d = donneesDepuisModele(lire({ cheminee: 'oui', faiblement_cohesif: 'non' }));
    expect(d.exploitation.ecoulementEnCheminee).toBe(true);
    expect(d.parois.faiblementCohesif).toBe(false);
  });
});

describe('materiau', () => {
  it('bibliotheque : les champs du materiau saisi sont ignores', () => {
    const d = donneesDepuisModele(lire({ materiau: 'defaut', K_m: 'abc' }));
    expect(d.materiau.id).toBe('defaut');
    expect(d.materiau.K_m).toBe(0.5);
  });
  it('saisie libre : chaque valeur porte la source saisie utilisateur', () => {
    const d = donneesDepuisModele(lire({ materiau: 'saisi', K_m: '0,6', mu_D2: '0,4' }));
    expect(d.materiau.id).toBe('saisi');
    expect(d.materiau.K_m).toBe(0.6);
    expect(d.materiau.mu_m.D2).toBe(0.4);
    for (const s of Object.values(d.materiau.sources)) expect(s).toBe('saisie utilisateur');
  });
});
