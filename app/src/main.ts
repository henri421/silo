/**
 * Cablage de l'interface des silos (SPEC §8.1).
 *
 * Ce module ne calcule RIEN : il lit les champs, appelle `donneesDepuisModele`
 * puis `calculer`, et confie a `form`, `vue` et `dessins` (tous purs) la
 * lecture de la saisie, la mise en forme et les dessins.
 *
 * Recalcul en continu : chaque frappe relance le calcul, sans bouton. Une
 * saisie refusee ou une erreur du noyau s'affiche dans la zone d'erreur et
 * laisse les resultats effaces : un resultat perime ne doit jamais rester a
 * l'ecran sous une saisie qui ne le produit plus.
 */

import {
  brancherFeuilles,
  definirLangue,
  echapper,
  langueDuDocument,
  noteDeCalculHtml,
  ouvrirOuTelecharger,
  svgAutonome,
  telecharger,
  type BarreFeuilles,
  type BlocResultat,
  type Json,
} from 'aedificium-ui';
import {
  calculer,
  en1991_4Recommande,
  type IdCas,
  type ResultatSilo,
} from '../../src/index';
import {
  champsDepuisModele,
  donneesDepuisModele,
  modeleDepuisChamps,
  modeleParDefaut,
  type ModeleSaisie,
} from './form';
import { blocsSynthese, lignesCas, lignesPointsOuverts, messageDErreur } from './vue';
import { dessinElevation, dessinPlan, dessinProfils, dessinTremie } from './dessins';
import {
  STYLES_DESSIN,
  csvBandes,
  csvLocalisee,
  csvProfils,
  csvSynthese,
  csvTremie,
  jsonResultat,
} from './export';
import { noteDuCalcul } from './note';
import { textes } from './textes';
import './style.css';

definirLangue(langueDuDocument(document));

const PROFIL = en1991_4Recommande();

/** Identifiants de cas, dans l'ordre de la synthese. */
const CAS: readonly IdCas[] = ['REMP', 'VID', 'VID_EXC', 'FOND_REMP', 'FOND_VID'];

type Grandeur = 'p_h' | 'p_w' | 'p_v' | 'n_zSk';
const GRANDEURS: readonly Grandeur[] = ['p_h', 'p_w', 'p_v', 'n_zSk'];

/** Element attendu de la page ; son absence est une erreur de developpement. */
function exige<T extends Element>(selecteur: string): T {
  const trouve = document.querySelector(selecteur);
  if (trouve === null) throw new Error(textes().messages.elementAbsent(selecteur));
  return trouve as T;
}

const formulaire = document.querySelector<HTMLFormElement>('#formulaire');

/** Les champs de saisie de la page (aucun sur la version anglaise du lot 7). */
function champs(): (HTMLInputElement | HTMLSelectElement)[] {
  return formulaire === null ? [] : Array.from(formulaire.querySelectorAll('[data-champ]'));
}

/** Valeur d'un champ : `oui` ou `non` pour une case, sa valeur sinon. */
function valeursDesChamps(): Record<string, string> {
  const valeurs: Record<string, string> = {};
  for (const el of champs()) {
    const nom = el.getAttribute('data-champ');
    if (nom === null) continue;
    valeurs[nom] =
      el instanceof HTMLInputElement && el.type === 'checkbox' ? (el.checked ? 'oui' : 'non') : el.value;
  }
  return valeurs;
}

/** Ecrit un modele complet dans les champs, sans perdre les valeurs masquees. */
function ecrireModele(modele: ModeleSaisie): void {
  const valeurs = champsDepuisModele(modele);
  for (const el of champs()) {
    const nom = el.getAttribute('data-champ');
    if (nom === null || valeurs[nom] === undefined) continue;
    if (el instanceof HTMLInputElement && el.type === 'checkbox') el.checked = valeurs[nom] === 'oui';
    else el.value = valeurs[nom];
  }
}

/** Masque les champs qui ne s'appliquent pas a la forme, au fond ou au materiau. */
function ajusterGroupes(forme: string, fond: string, materiau: string): void {
  const visibilites: Record<string, boolean> = {
    circulaire: forme === 'circulaire',
    rectangulaire: forme === 'rectangulaire',
    tremie: fond !== 'plat',
    'materiau-saisi': materiau === 'saisi',
  };
  for (const [nom, visible] of Object.entries(visibilites)) {
    const groupe = document.querySelector<HTMLElement>(`[data-groupe="${nom}"]`);
    if (groupe !== null) groupe.hidden = !visible;
  }
}

/** Choix lus dans les commandes de dessin, avec leurs valeurs par defaut. */
function choixAffichage(): { cas: IdCas; grandeur: Grandeur } {
  const cas = exige<HTMLSelectElement>('[data-role="cas-elevation"]').value;
  const grandeur = exige<HTMLSelectElement>('[data-role="grandeur-profils"]').value;
  return {
    cas: (CAS as readonly string[]).includes(cas) ? (cas as IdCas) : 'REMP',
    grandeur: (GRANDEURS as readonly string[]).includes(grandeur) ? (grandeur as Grandeur) : 'p_h',
  };
}

/** Options des deux selecteurs de dessin : identifiants et libelles de textes.ts. */
function initialiserCommandes(): void {
  exige<HTMLSelectElement>('[data-role="cas-elevation"]').innerHTML = CAS.map(
    (id) => `<option value="${id}">${echapper(textes().cas.libelles[id])}</option>`
  ).join('');
  exige<HTMLSelectElement>('[data-role="grandeur-profils"]').innerHTML = GRANDEURS.map(
    (g) => `<option value="${g}">${echapper(textes().interface.grandeurs[g])}</option>`
  ).join('');
}

/** Tableau HTML d'un bloc de resultats : symbole, libelle, valeur. */
function rendreBlocs(blocs: readonly BlocResultat[]): string {
  return blocs
    .map((bloc) => {
      const lignes = bloc.lignes
        .map(
          (l) =>
            `<tr><th>${echapper(l.symbole)}</th><td class="libelle">${echapper(l.libelle)}</td><td class="valeur">${echapper(
              l.valeur
            )}</td></tr>`
        )
        .join('');
      const note =
        bloc.note === null ? '' : `<p class="note">${echapper(bloc.note)}</p>`;
      // Le bloc des cas porte des valeurs longues : il autorise le retour a la
      // ligne, la ou les autres blocs tiennent sur une ligne (style.css).
      const classe = bloc.titre === textes().blocs.cas ? ' bloc-cas' : '';
      return `<div class="bloc${classe}"><h3>${echapper(bloc.titre)}</h3><table class="grandeurs"><tbody>${lignes}</tbody></table>${note}</div>`;
    })
    .join('');
}

/** Tableau HTML a colonnes libres, en-tetes compris. */
function rendreTableau(lignes: readonly string[][], entetes: readonly string[]): string {
  const tete = entetes.map((e) => `<th>${echapper(e)}</th>`).join('');
  const corps = lignes
    .map((ligne) => `<tr>${ligne.map((v) => `<td>${echapper(v)}</td>`).join('')}</tr>`)
    .join('');
  return `<div class="defilement"><table class="zones"><thead><tr>${tete}</tr></thead><tbody>${corps}</tbody></table></div>`;
}

// La barre des feuilles est branchee sur les deux pages ; la saisie n'existe
// que sur la page francaise, la page anglaise reste a construire (lot 9).
let barre: BarreFeuilles | null = null;
let resultat: ResultatSilo | null = null;

/** Elements de resultat de la page francaise. */
interface Zones {
  synthese: HTMLElement;
  cas: HTMLElement;
  pointsOuverts: HTMLElement;
  elevation: HTMLElement;
  profils: HTMLElement;
  plan: HTMLElement;
  tremie: HTMLElement;
  erreur: HTMLElement;
}

let zones: Zones | null = null;
let rafraichir: () => void = () => {};

/** Affiche une erreur et efface les resultats, qui ne sont plus a jour. */
function afficherErreur(message: string): void {
  resultat = null;
  for (const nom of Object.keys(dessinsCourants) as NomDessin[]) delete dessinsCourants[nom];
  if (zones === null) return;
  zones.erreur.textContent = message;
  zones.erreur.hidden = false;
  for (const zone of [zones.synthese, zones.cas, zones.pointsOuverts, zones.elevation, zones.profils, zones.plan, zones.tremie]) {
    zone.innerHTML = '';
  }
}

/** Nom court d'un dessin exportable. */
type NomDessin = 'elevation' | 'profils' | 'plan' | 'tremie';

/** Les SVG du dernier rendu, pour les boutons d'export des dessins. */
const dessinsCourants: Partial<Record<NomDessin, string>> = {};

/** Sous chaque dessin, les boutons SVG et PNG autonomes. */
function boutonsDessin(nom: NomDessin): string {
  const t = textes().exports;
  return `<div class="boutons-dessin"><button type="button" data-action="exporter-dessin" data-dessin="${nom}" data-format="svg">${echapper(
    t.svg
  )}</button><button type="button" data-action="exporter-dessin" data-dessin="${nom}" data-format="png">${echapper(
    t.png
  )}</button></div>`;
}

/** Pose un dessin et ses boutons ; un dessin absent efface la zone. */
function poserDessin(zone: HTMLElement, nom: NomDessin, svg: string | null): void {
  if (svg === null) {
    delete dessinsCourants[nom];
    zone.innerHTML = '';
    return;
  }
  dessinsCourants[nom] = svg;
  zone.innerHTML = svg + boutonsDessin(nom);
}

/** Redessine les quatre dessins pour le resultat courant. */
function redessiner(): void {
  if (resultat === null || zones === null) return;
  const r = resultat;
  const { cas, grandeur } = choixAffichage();
  const avecBandes = exige<HTMLInputElement>('[data-role="bandes-elevation"]').checked;
  poserDessin(zones.elevation, 'elevation', dessinElevation(r, cas, avecBandes));
  poserDessin(zones.profils, 'profils', dessinProfils(r, grandeur, ['REMP', 'VID', 'VID_EXC']));
  poserDessin(zones.plan, 'plan', dessinPlan(r));
  poserDessin(zones.tremie, 'tremie', dessinTremie(r));
}

/** Peint un resultat complet : synthese, cas, points ouverts et dessins. */
function peindre(r: ResultatSilo): void {
  if (zones === null) return;
  zones.erreur.hidden = true;
  zones.erreur.textContent = '';
  zones.synthese.innerHTML = rendreBlocs(blocsSynthese(r));
  zones.cas.innerHTML = rendreTableau(lignesCas(r), textes().interface.entetesCas);
  zones.pointsOuverts.innerHTML = rendreTableau(
    lignesPointsOuverts(r),
    textes().interface.entetesPointsOuverts
  );
  redessiner();
}

if (formulaire !== null) {
  zones = {
    synthese: exige<HTMLElement>('[data-role="synthese"]'),
    cas: exige<HTMLElement>('[data-role="cas"]'),
    pointsOuverts: exige<HTMLElement>('[data-role="points-ouverts"]'),
    elevation: exige<HTMLElement>('[data-role="elevation"]'),
    profils: exige<HTMLElement>('[data-role="profils"]'),
    plan: exige<HTMLElement>('[data-role="plan"]'),
    tremie: exige<HTMLElement>('[data-role="tremie"]'),
    erreur: exige<HTMLElement>('[data-role="erreur"]'),
  };

  rafraichir = (): void => {
    barre?.signaler();
    const valeurs = valeursDesChamps();
    const lecture = modeleDepuisChamps(valeurs);

    // Les groupes suivent la saisie brute, meme quand un nombre est encore
    // illisible : un champ masque ne doit pas rester affiche par accident.
    if (!lecture.ok) {
      ajusterGroupes(valeurs.forme ?? 'rectangulaire', valeurs.fond ?? 'plat', valeurs.materiau ?? 'sable');
      afficherErreur(lecture.message);
      return;
    }

    const modele = lecture.modele;
    ajusterGroupes(modele.forme, modele.fond, modele.materiau);
    let r: ResultatSilo;
    try {
      r = calculer(donneesDepuisModele(modele), PROFIL);
    } catch (e) {
      afficherErreur(messageDErreur(e));
      return;
    }
    resultat = r;
    peindre(r);
  };

  initialiserCommandes();
  ecrireModele(modeleParDefaut());
  formulaire.addEventListener('input', rafraichir);
  formulaire.addEventListener('change', rafraichir);
  const commandes = exige<HTMLElement>('#commandes-dessins');
  commandes.addEventListener('input', redessiner);
  commandes.addEventListener('change', redessiner);
  rafraichir();
}

// La feuille de projet est le releve des champs, comme dans les autres outils.
barre = brancherFeuilles({
  app: 'silo',
  nomApp: document.querySelector('header h1')?.textContent ?? 'silo',
  conteneur: exige<HTMLElement>('[data-role="feuilles"]'),
  lire: () => valeursDesChamps() as Json,
  charger: (d) => {
    if (formulaire === null) return;
    if (d === null) ecrireModele(modeleParDefaut());
    else {
      const v = d as Record<string, string>;
      for (const el of champs()) {
        const valeur = v[el.getAttribute('data-champ') ?? ''];
        if (valeur === undefined) continue;
        if (el instanceof HTMLInputElement && el.type === 'checkbox') el.checked = valeur === 'oui';
        else el.value = valeur;
      }
    }
    rafraichir();
  },
});

/** Date du jour, pour le cartouche et les en-tetes de fichiers. */
function dateDuJour(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Cartouche de la note : projet fixe, element de la page, date du jour. */
function cartoucheNote(): { projet: string; element: string; date: string } {
  return {
    projet: 'Silo',
    element: document.querySelector('header h1')?.textContent?.trim() || 'Silo',
    date: dateDuJour(),
  };
}

/** Telecharge un dessin en PNG : SVG autonome rendu dans un canvas, puis toBlob. */
function telechargerPng(svg: string, nom: string): void {
  const autonome = svgAutonome(svg, STYLES_DESSIN);
  const url = URL.createObjectURL(new Blob([autonome], { type: 'image/svg+xml;charset=utf-8' }));
  const image = new Image();
  image.onload = (): void => {
    const boite = /viewBox="0 0 ([0-9.]+) ([0-9.]+)"/.exec(svg);
    const largeur = boite === null ? 1200 : Math.max(300, Math.round(Number(boite[1]) * 2));
    const hauteur = boite === null ? 900 : Math.max(200, Math.round(Number(boite[2]) * 2));
    const canvas = document.createElement('canvas');
    canvas.width = largeur;
    canvas.height = hauteur;
    const contexte = canvas.getContext('2d');
    URL.revokeObjectURL(url);
    if (contexte === null) return;
    contexte.drawImage(image, 0, 0, largeur, hauteur);
    canvas.toBlob((blob) => {
      if (blob === null) return;
      const adresse = URL.createObjectURL(blob);
      const lien = document.createElement('a');
      lien.href = adresse;
      lien.download = `silo-${nom}.png`;
      document.body.appendChild(lien);
      lien.click();
      lien.remove();
      URL.revokeObjectURL(adresse);
    });
  };
  image.onerror = (): void => {
    URL.revokeObjectURL(url);
  };
  image.src = url;
}

// Les exports : un bouton par fichier, et un couple SVG / PNG sous chaque dessin.
document.addEventListener('click', (evenement) => {
  const cible = evenement.target;
  if (!(cible instanceof HTMLElement)) return;
  const action = cible.dataset.action;
  if (action === undefined || !action.startsWith('exporter-') || resultat === null) return;
  const r = resultat;
  const telechargerCsv = (nom: string, contenu: string): void => {
    telecharger(`silo-${nom}.csv`, contenu, 'text/csv;charset=utf-8');
  };
  if (action === 'exporter-profils') telechargerCsv('profils', csvProfils(r));
  else if (action === 'exporter-bandes') telechargerCsv('bandes', csvBandes(r));
  else if (action === 'exporter-tremie') telechargerCsv('tremie', csvTremie(r));
  else if (action === 'exporter-localisee') telechargerCsv('localisee', csvLocalisee(r));
  else if (action === 'exporter-synthese') telechargerCsv('synthese', csvSynthese(r));
  else if (action === 'exporter-json') {
    telecharger('silo-resultat.json', jsonResultat(r), 'application/json;charset=utf-8');
  } else if (action === 'exporter-note') {
    ouvrirOuTelecharger(
      'silo-note.html',
      noteDeCalculHtml(noteDuCalcul(r, cartoucheNote()), STYLES_DESSIN)
    );
  } else if (action === 'exporter-dessin') {
    const nom = cible.dataset.dessin as NomDessin | undefined;
    if (nom === undefined) return;
    const svg = dessinsCourants[nom];
    if (svg === undefined) return;
    if (cible.dataset.format === 'png') telechargerPng(svg, nom);
    else {
      telecharger(`silo-${nom}.svg`, svgAutonome(svg, STYLES_DESSIN), 'image/svg+xml;charset=utf-8');
    }
  }
});

// Hors navigateur (tests), pas de service worker.
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  void import('./pwa').then((m) => m.enregistrerServiceWorker());
}
