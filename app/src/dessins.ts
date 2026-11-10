/**
 * Dessins SVG de la page : elevation avec diagrammes, profils, vue en plan et
 * tremie (SPEC §8.1).
 *
 * Module PUR : chaque fonction rend une chaine SVG complete, sans DOM et sans
 * etat. Aucune couleur n'est codee en dur : les classes sont peintes par la
 * feuille de style de la page, et le dessin rappelle ses propres jetons dans
 * une feuille `<style>` interne, tous en `var(--...)`.
 *
 * Unites : longueurs en m, pressions en kPa, angles en degres.
 */

import { echapper, nombreAffiche, notationSvg } from 'aedificium-ui';
import type { CasDeCharge, IdCas, ResultatSilo } from '../../src/index';
import { phrase, textes } from './textes';

/** Nombre affiche : trois decimales au plus, sans zeros inutiles. */
function aff(valeur: number, decimales = 3): string {
  return nombreAffiche(valeur, Math.min(decimales, 3));
}

/** Coordonnee SVG ; une valeur non finie ne doit jamais sortir du dessin. */
function c(valeur: number): string {
  if (!Number.isFinite(valeur)) throw new Error('Dessin : coordonnee non finie.');
  return valeur.toFixed(1);
}

/**
 * Feuille de style interne : toutes les couleurs passent par les jetons de la
 * suite, jamais par une valeur en dur. Les cas se distinguent par le trait
 * autant que par la couleur.
 */
export const STYLE_DESSIN = `.dessin{background:var(--surface);color:var(--texte);font-family:var(--sans)}
.titre{fill:var(--texte);font-size:13px;font-weight:600}
.texte{fill:var(--texte);font-size:11px;font-family:var(--mono)}
.texte-doux{fill:var(--texte-doux);font-size:11px}
.axe{stroke:var(--neutre);stroke-width:1}
.grille{stroke:var(--bordure-douce);stroke-width:0.6}
.silo{fill:var(--surface);stroke:var(--texte);stroke-width:1.6}
.silo-plan{fill:var(--surface);stroke:var(--texte);stroke-width:1.6}
.surface{stroke:var(--neutre);stroke-width:1;stroke-dasharray:5 3}
.talus{fill:var(--beton);stroke:var(--texte-doux);stroke-width:1}
.cote{stroke:var(--neutre);stroke-width:1}
.diagramme-h{fill:var(--compression);fill-opacity:0.18;stroke:var(--compression);stroke-width:1}
.diagramme-w{fill:var(--traction);fill-opacity:0.14;stroke:var(--traction);stroke-width:1}
.bande{fill:var(--accent);fill-opacity:0.06;stroke:var(--bordure-douce);stroke-width:0.5}
.trace{fill:none;stroke-width:1.8}
.trace-REMP{stroke:var(--compression)}
.trace-VID{stroke:var(--traction)}
.trace-VID_EXC{stroke:var(--alerte)}
.trace-FOND_REMP{stroke:var(--compression)}
.trace-FOND_VID{stroke:var(--traction)}
.zone-localisee{fill:var(--accent-doux);stroke:var(--accent);stroke-width:1.2}
.zone-ecoulement{fill:var(--accent-doux);stroke:var(--accent);stroke-width:1}
.zone-contrainte-elevee{fill:var(--alerte-fond);stroke:var(--alerte);stroke-width:1}
.zone-immobile{fill:var(--surface-appui);stroke:var(--bordure);stroke-width:1}
.zone-majoration{fill:var(--accent-doux);stroke:var(--accent);stroke-width:1.2}`;

/** Feuille de style interne du SVG : memes regles de peinture que l'export. */
const STYLE = `<style>${STYLE_DESSIN}</style>`;

/** Enveloppe SVG commune : le dessin commence par `<svg` et finit par `</svg>`. */
function enveloppe(classe: string, largeur: number, hauteur: number, contenu: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" class="dessin ${classe}" viewBox="0 0 ${largeur} ${hauteur}" role="img">${STYLE}${contenu}</svg>`;
}

/** Cas de charge par identifiant, s'il existe. */
function casDe(r: ResultatSilo, id: IdCas): CasDeCharge | undefined {
  return r.cas.find((cas) => cas.id === id);
}

/** Un texte en plusieurs lignes SVG, coupe aux espaces. */
function lignesTexte(texte: string, x: number, y: number, longueur = 78): string {
  const mots = texte.split(/\s+/).filter((m) => m !== '');
  const lignes: string[] = [];
  let courante = '';
  for (const mot of mots) {
    if (courante === '') courante = mot;
    else if ((courante + ' ' + mot).length <= longueur) courante += ' ' + mot;
    else {
      lignes.push(courante);
      courante = mot;
    }
  }
  if (courante !== '') lignes.push(courante);
  return `<text class="texte" x="${c(x)}" y="${c(y)}">${lignes
    .map((l, i) => `<tspan x="${c(x)}"${i === 0 ? '' : ' dy="14"'}>${notationSvg(l)}</tspan>`)
    .join('')}</text>`;
}

/** Etat d'un cas pour le dessin : motif quand il n'est pas calcule. */
function arretDeCas(cas: CasDeCharge): string {
  return `${textes().statuts[cas.statut]} : ${phrase(cas.motif ?? '')}`;
}

// ---------------------------------------------------------------------------
// Elevation
// ---------------------------------------------------------------------------

const ELEV_LARGEUR = 640;
const ELEV_HAUTEUR = 540;
const ELEV_MARGE = 24;
const ELEV_HAUT = 64;
const ELEV_BAS = 36;
const ELEV_SILO = 170;

/**
 * Elevation du silo a l'echelle, avec le talus, la cote h_o et les diagrammes
 * de p_h_total a gauche et de p_w a droite pour le cas demande. Avec
 * `avecBandes`, chaque bande du cas est tracee en rectangle.
 */
export function dessinElevation(r: ResultatSilo, id: IdCas, avecBandes: boolean): string {
  const t = textes();
  const cl = r.classement;
  const hc = r.donnees.silo.hc;
  const hh = cl.h_h ?? 0;
  const haut = ELEV_HAUT;
  const bas = ELEV_HAUTEUR - ELEV_BAS;
  const echelle = (bas - haut) / Math.max(hc + hh, 1e-9);
  const y = (z: number): number => haut + z * echelle;
  const cx = ELEV_LARGEUR / 2;
  const largeurSilo = Math.min(ELEV_SILO, Math.max(80, cl.geometrie.d_c * 18));
  const gauche = cx - largeurSilo / 2;
  const droite = cx + largeurSilo / 2;

  const cas = casDe(r, id);
  const calcule = cas !== undefined && cas.statut === 'calcule' && cas.profil.length > 0;
  const morceaux: string[] = [];

  morceaux.push(
    `<text class="titre" x="${c(ELEV_MARGE)}" y="${c(ELEV_MARGE + 4)}">${notationSvg(
      `${t.dessins.titreElevation}, ${id}`
    )}</text>`
  );

  // Surface equivalente, parois, fond ou tremie.
  morceaux.push(
    `<line class="surface" x1="${c(gauche)}" y1="${c(y(0))}" x2="${c(droite)}" y2="${c(y(0))}"/>`
  );
  morceaux.push(
    `<rect class="silo" x="${c(gauche)}" y="${c(y(0))}" width="${c(largeurSilo)}" height="${c(
      Math.max(hc * echelle, 0)
    )}"/>`
  );
  if (hh > 0) {
    morceaux.push(
      `<path class="silo" d="M ${c(gauche)} ${c(y(hc))} L ${c(cx)} ${c(y(hc + hh))} L ${c(droite)} ${c(
        y(hc)
      )}" fill="none"/>`
    );
  }

  // Talus : contact le plus haut a h_o, sommet a h_o - h_tp (ramene a la
  // surface equivalente quand il la depasse).
  const sommet = Math.max(0, cl.h_o - cl.h_tp / 2);
  morceaux.push(
    `<polygon class="talus" points="${c(gauche)},${c(y(cl.h_o))} ${c(cx)},${c(y(sommet))} ${c(droite)},${c(
      y(cl.h_o)
    )}"/>`
  );
  morceaux.push(
    `<line class="cote" x1="${c(gauche - 12)}" y1="${c(y(0))}" x2="${c(gauche - 12)}" y2="${c(
      y(cl.h_o)
    )}"/>`
  );
  morceaux.push(
    `<text class="texte" data-symbole="h_o" x="${c(gauche - 16)}" y="${c(y(cl.h_o / 2) + 4)}" text-anchor="end">${notationSvg(
      t.dessins.ho
    )}</text>`
  );
  morceaux.push(
    `<text class="texte-doux" x="${c(gauche)}" y="${c(y(0) - 6)}">${echapper(t.dessins.surfaceEquivalente)}</text>`
  );

  if (calcule && cas !== undefined) {
    const profil = cas.profil;
    const maxH = Math.max(0, ...profil.map((p) => p.p_h_total));
    const maxW = Math.max(0, ...profil.map((p) => p.p_w));
    const echelleH = maxH > 0 ? 110 / maxH : 0;
    const echelleW = maxW > 0 ? 110 / maxW : 0;
    const pointsH = profil.map((p) => `${c(gauche - 8 - p.p_h_total * echelleH)},${c(y(p.z))}`).join(' ');
    const pointsW = profil.map((p) => `${c(droite + 8 + p.p_w * echelleW)},${c(y(p.z))}`).join(' ');
    morceaux.push(
      `<path class="diagramme-h" d="M ${c(gauche - 8)} ${c(y(0))} L ${pointsH} L ${c(gauche - 8)} ${c(
        y(hc)
      )} Z"/>`
    );
    morceaux.push(
      `<path class="diagramme-w" d="M ${c(droite + 8)} ${c(y(0))} L ${pointsW} L ${c(droite + 8)} ${c(
        y(hc)
      )} Z"/>`
    );
    morceaux.push(
      `<text class="texte" x="${c(gauche - 14)}" y="${c(y(0) - 10)}" text-anchor="end">${notationSvg(
        t.dessins.ph
      )}</text>`
    );
    morceaux.push(
      `<text class="texte" x="${c(droite + 14)}" y="${c(y(0) - 10)}">${notationSvg(t.dessins.pw)}</text>`
    );
    morceaux.push(
      `<text class="texte-doux" x="${c(gauche - 14)}" y="${c(y(hc) + 16)}" text-anchor="end">${echapper(
        `${aff(maxH, 2)} kPa`
      )}</text>`
    );
    morceaux.push(
      `<text class="texte-doux" x="${c(droite + 14)}" y="${c(y(hc) + 16)}">${echapper(
        `${aff(maxW, 2)} kPa`
      )}</text>`
    );

    if (avecBandes) {
      for (const bande of r.bandes.filter((b) => b.cas === id)) {
        morceaux.push(
          `<rect class="bande" x="${c(gauche)}" y="${c(y(bande.z_haut))}" width="${c(largeurSilo)}" height="${c(
            Math.max(y(bande.z_bas) - y(bande.z_haut), 0)
          )}"/>`
        );
      }
    }
  } else if (cas !== undefined) {
    morceaux.push(lignesTexte(arretDeCas(cas), cx - 150, y(0) + 36, 60));
  }

  return enveloppe('elevation', ELEV_LARGEUR, ELEV_HAUTEUR, morceaux.join(''));
}

// ---------------------------------------------------------------------------
// Profils
// ---------------------------------------------------------------------------

const PROF_LARGEUR = 680;
const PROF_HAUTEUR = 480;
const PROF_GAUCHE = 80;
const PROF_HAUT = 54;
const PROF_BAS = 54;
const PROF_DROITE = 190;

/** Valeur d'un point de profil pour la grandeur demandee. */
function valeurProfil(
  point: { p_h_total: number; p_w: number; p_v: number; n_zSk: number },
  grandeur: 'p_h' | 'p_w' | 'p_v' | 'n_zSk'
): number {
  return grandeur === 'p_h' ? point.p_h_total : point[grandeur];
}

/**
 * Profils de p_h totale, p_w, p_v ou n_zSk en fonction de z, axe z vers le
 * bas. Un cas calcule est trace ; un cas non calcule n'a pas de profil.
 * REMP est en trait plein, VID et VID_EXC en tirets.
 */
export function dessinProfils(
  r: ResultatSilo,
  grandeur: 'p_h' | 'p_w' | 'p_v' | 'n_zSk',
  ids: IdCas[]
): string {
  const t = textes();
  const hc = r.donnees.silo.hc;
  const gauche = PROF_GAUCHE;
  const droite = PROF_LARGEUR - PROF_DROITE;
  const haut = PROF_HAUT;
  const bas = PROF_HAUTEUR - PROF_BAS;
  const largeur = droite - gauche;
  const hauteur = bas - haut;

  const traces = ids
    .map((id) => casDe(r, id))
    .filter((cas): cas is CasDeCharge => cas !== undefined && cas.statut === 'calcule' && cas.profil.length > 0);

  let max = 0;
  for (const cas of traces) for (const p of cas.profil) max = Math.max(max, valeurProfil(p, grandeur));
  const echelle = max > 0 ? largeur / max : 0;
  const x = (valeur: number): number => gauche + valeur * echelle;
  const y = (z: number): number => haut + (z / hc) * hauteur;

  const morceaux: string[] = [
    `<text class="titre" x="${c(PROF_GAUCHE - 40)}" y="${c(24)}">${notationSvg(
      `${t.dessins.titreProfils}, ${t.interface.grandeurs[grandeur]}`
    )}</text>`,
    `<line class="axe" x1="${c(gauche)}" y1="${c(haut)}" x2="${c(gauche)}" y2="${c(bas)}"/>`,
    `<line class="axe" x1="${c(gauche)}" y1="${c(bas)}" x2="${c(droite)}" y2="${c(bas)}"/>`,
  ];

  // Graduations de z, vers le bas.
  for (const z of [0, hc / 2, hc]) {
    morceaux.push(
      `<line class="grille" x1="${c(gauche)}" y1="${c(y(z))}" x2="${c(droite)}" y2="${c(y(z))}"/>`
    );
    morceaux.push(
      `<text class="texte" x="${c(gauche - 8)}" y="${c(y(z) + 4)}" text-anchor="end">${echapper(
        aff(z, 1)
      )}</text>`
    );
  }
  morceaux.push(
    `<text class="texte-doux" x="${c(gauche - 8)}" y="${c(haut - 10)}" text-anchor="end">${echapper(
      t.dessins.axeProfondeur
    )}</text>`
  );
  morceaux.push(
    `<text class="texte-doux" x="${c(droite)}" y="${c(bas + 20)}" text-anchor="end">${echapper(
      `${aff(max, 3)} kPa`
    )}</text>`
  );

  let rang = 0;
  for (const cas of traces) {
    const points = cas.profil
      .map((p) => `${c(x(valeurProfil(p, grandeur)))},${c(y(p.z))}`)
      .join(' ');
    const tirets = cas.id === 'REMP' ? '' : ' stroke-dasharray="6 4"';
    morceaux.push(`<path class="trace trace-${cas.id}" d="M ${points.replaceAll(' ', ' L ')}"${tirets}/>`);
    morceaux.push(
      `<line class="trace trace-${cas.id}" x1="${c(droite + 16)}" y1="${c(haut + 16 + rang * 18)}" x2="${c(
        droite + 46
      )}" y2="${c(haut + 16 + rang * 18)}"${tirets}/>`
    );
    morceaux.push(
      `<text class="texte" x="${c(droite + 52)}" y="${c(haut + 20 + rang * 18)}">${notationSvg(cas.id)}</text>`
    );
    rang += 1;
  }

  return enveloppe('profils', PROF_LARGEUR, PROF_HAUTEUR, morceaux.join(''));
}

// ---------------------------------------------------------------------------
// Vue en plan
// ---------------------------------------------------------------------------

const PLAN_LARGEUR = 480;
const PLAN_HAUTEUR = 480;

/** Point d'un cercle a un angle en degres, mesure depuis l'axe des x. */
function pointPolaire(cx: number, cy: number, rayon: number, degres: number): { x: number; y: number } {
  const radians = (degres * Math.PI) / 180;
  return { x: cx + rayon * Math.cos(radians), y: cy + rayon * Math.sin(radians) };
}

/** Secteur annulaire entre deux angles, pour les zones de vidange excentree. */
function secteur(
  cx: number,
  cy: number,
  rayonInterieur: number,
  rayonExterieur: number,
  debut: number,
  fin: number
): string {
  const a = pointPolaire(cx, cy, rayonExterieur, debut);
  const b = pointPolaire(cx, cy, rayonExterieur, fin);
  const d = pointPolaire(cx, cy, rayonInterieur, fin);
  const e = pointPolaire(cx, cy, rayonInterieur, debut);
  const grandArc = fin - debut > 180 ? 1 : 0;
  return `M ${c(a.x)} ${c(a.y)} A ${c(rayonExterieur)} ${c(rayonExterieur)} 0 ${grandArc} 1 ${c(b.x)} ${c(
    b.y
  )} L ${c(d.x)} ${c(d.y)} A ${c(rayonInterieur)} ${c(rayonInterieur)} 0 ${grandArc} 0 ${c(e.x)} ${c(e.y)} Z`;
}

/** Vue en plan d'un silo circulaire : action localisee et zones excentrees. */
function planCirculaire(r: ResultatSilo): string {
  const t = textes();
  const cx = PLAN_LARGEUR / 2;
  const cy = PLAN_HAUTEUR / 2 + 12;
  const rayon = 150;
  const morceaux: string[] = [
    `<text class="titre" x="20" y="26">${echapper(t.dessins.titrePlan)}</text>`,
    `<circle class="silo-plan" cx="${c(cx)}" cy="${c(cy)}" r="${c(rayon)}"/>`,
  ];

  // Action localisee : carres opposes (paroi epaisse) ou distribution en
  // cosinus (paroi mince). Une majoration uniforme se lit comme un anneau.
  const def = r.actionLocalisee.remplissage;
  const echelle = (2 * rayon) / r.classement.geometrie.d_c;
  if (def.forme === 'circulaire-epaisse') {
    const cote = Math.max(6, r.actionLocalisee.s * echelle);
    morceaux.push(
      `<rect class="zone-localisee" x="${c(cx + rayon - cote / 2)}" y="${c(cy - cote / 2)}" width="${c(
        cote
      )}" height="${c(cote)}"/>`
    );
    morceaux.push(
      `<rect class="zone-localisee" x="${c(cx - rayon - cote / 2)}" y="${c(cy - cote / 2)}" width="${c(
        cote
      )}" height="${c(cote)}"/>`
    );
    morceaux.push(
      `<text class="texte" x="${c(cx + rayon)}" y="${c(cy - cote / 2 - 6)}" text-anchor="middle">${echapper(
        `s = ${aff(r.actionLocalisee.s, 2)} m`
      )}</text>`
    );
  } else if (def.forme === 'circulaire-mince' || def.forme === 'majoration-uniforme') {
    morceaux.push(
      `<circle class="zone-localisee" cx="${c(cx)}" cy="${c(cy)}" r="${c(rayon * 0.82)}" fill-opacity="0.5"/>`
    );
  }

  // Zones de la vidange a grand excentrement, si le cas est calcule.
  const vidExc = casDe(r, 'VID_EXC');
  if (vidExc !== undefined && vidExc.statut === 'calcule' && vidExc.excentree !== null) {
    const zones = vidExc.excentree;
    const tc = zones.theta_c;
    morceaux.push(
      `<path class="zone-ecoulement" d="${secteur(cx, cy, 0, rayon * 0.95, -tc, tc)}"/>`
    );
    morceaux.push(
      `<path class="zone-contrainte-elevee" d="${secteur(cx, cy, 0, rayon * 0.95, tc, 2 * tc)}"/>`
    );
    morceaux.push(
      `<path class="zone-contrainte-elevee" d="${secteur(cx, cy, 0, rayon * 0.95, -2 * tc, -tc)}"/>`
    );
    morceaux.push(
      `<text class="texte" x="${c(cx + rayon * 0.55)}" y="${c(cy + 18)}">${echapper(
        t.dessins.angle(aff(tc, 0))
      )}</text>`
    );
    morceaux.push(
      `<text class="texte" x="${c(cx + rayon * 0.28)}" y="${c(cy + rayon * 0.55)}">${echapper(
        t.dessins.angle(aff(2 * tc, 0))
      )}</text>`
    );
    morceaux.push(
      `<text class="texte-doux" x="${c(cx)}" y="${c(cy + rayon + 26)}" text-anchor="middle">${echapper(
        t.dessins.zoneEcoulement
      )}</text>`
    );
  }

  return enveloppe('plan', PLAN_LARGEUR, PLAN_HAUTEUR, morceaux.join(''));
}

/** Vue en plan d'un silo rectangulaire : la majoration uniforme rappelee. */
function planRectangulaire(): string {
  const t = textes();
  const largeur = 300;
  const hauteur = 190;
  const x = (PLAN_LARGEUR - largeur) / 2;
  const y = (PLAN_HAUTEUR - hauteur) / 2 + 8;
  return enveloppe(
    'plan',
    PLAN_LARGEUR,
    PLAN_HAUTEUR,
    [
      `<text class="titre" x="20" y="26">${echapper(t.dessins.titrePlan)}</text>`,
      `<rect class="silo-plan" x="${c(x)}" y="${c(y)}" width="${c(largeur)}" height="${c(hauteur)}"/>`,
      `<rect class="zone-majoration" x="${c(x + 18)}" y="${c(y + 18)}" width="${c(largeur - 36)}" height="${c(
        hauteur - 36
      )}"/>`,
      `<text class="texte" x="${c(PLAN_LARGEUR / 2)}" y="${c(y + hauteur / 2)}" text-anchor="middle">${notationSvg(
        `${t.dessins.majoration}, ${t.dessins.majorationUniforme}`
      )}</text>`,
    ].join('')
  );
}

/** Vue en plan : action localisee et zones de vidange excentree (SPEC §8.1). */
export function dessinPlan(r: ResultatSilo): string {
  return r.donnees.silo.forme === 'circulaire' ? planCirculaire(r) : planRectangulaire();
}

// ---------------------------------------------------------------------------
// Tremie
// ---------------------------------------------------------------------------

const TREM_LARGEUR = 640;
const TREM_HAUTEUR = 420;
const TREM_GAUCHE = 80;
const TREM_HAUT = 54;
const TREM_BAS = 56;
const TREM_DROITE = 40;

/**
 * Pressions p_n et p_t le long de la paroi de tremie, en fonction de x.
 * `null` pour un fond plat.
 */
export function dessinTremie(r: ResultatSilo): string | null {
  const t = textes();
  const remp = casDe(r, 'FOND_REMP');
  const vid = casDe(r, 'FOND_VID');
  if (remp === undefined || remp.tremie === null) return null;

  const hh = remp.tremie.h_h;
  const cases = [remp, vid].filter(
    (cas): cas is CasDeCharge => cas !== undefined && cas.statut === 'calcule' && cas.tremie !== null && cas.fond.length > 0
  );
  let max = 0;
  for (const cas of cases) {
    for (const p of cas.fond) max = Math.max(max, p.p_n ?? 0, p.p_t ?? 0);
  }
  const gauche = TREM_GAUCHE;
  const droite = TREM_LARGEUR - TREM_DROITE;
  const haut = TREM_HAUT;
  const bas = TREM_HAUTEUR - TREM_BAS;
  const x = (valeur: number): number => gauche + (valeur / Math.max(hh, 1e-9)) * (droite - gauche);
  const y = (pression: number): number => bas - (max > 0 ? (pression / max) * (bas - haut) : 0);

  const morceaux: string[] = [
    `<text class="titre" x="20" y="26">${echapper(t.dessins.titreTremie)}</text>`,
    `<line class="axe" x1="${c(gauche)}" y1="${c(haut)}" x2="${c(gauche)}" y2="${c(bas)}"/>`,
    `<line class="axe" x1="${c(gauche)}" y1="${c(bas)}" x2="${c(droite)}" y2="${c(bas)}"/>`,
    `<text class="texte-doux" x="${c(gauche - 8)}" y="${c(haut - 10)}" text-anchor="end">${echapper(
      t.dessins.axePression
    )}</text>`,
    `<text class="texte-doux" x="${c(droite)}" y="${c(bas + 20)}" text-anchor="end">${echapper(
      t.dessins.axeX
    )}</text>`,
  ];

  for (const cas of cases) {
    const points = [...cas.fond].sort((a, b) => (a.x ?? 0) - (b.x ?? 0));
    const pn = points.map((p) => `${c(x(p.x ?? 0))},${c(y(p.p_n ?? 0))}`).join(' L ');
    const pt = points.map((p) => `${c(x(p.x ?? 0))},${c(y(p.p_t ?? 0))}`).join(' L ');
    morceaux.push(`<path class="trace trace-${cas.id}" d="M ${pn}"/>`);
    morceaux.push(`<path class="trace trace-${cas.id}" d="M ${pt}" stroke-dasharray="4 3"/>`);
  }

  morceaux.push(
    `<text class="texte" data-symbole="p_n" x="${c(droite)}" y="${c(haut)}">${notationSvg(t.dessins.pn)}</text>`
  );
  morceaux.push(
    `<text class="texte" data-symbole="p_t" x="${c(droite)}" y="${c(haut + 16)}">${notationSvg(t.dessins.pt)}</text>`
  );

  return enveloppe('tremie', TREM_LARGEUR, TREM_HAUTEUR, morceaux.join(''));
}
