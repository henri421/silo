/**
 * Cablage de l'interface des silos.
 *
 * Ce module ne calcule RIEN : le lot 0 ne pose que la page, sans saisie ni
 * resultat. La langue et la barre des feuilles de calcul viennent
 * d'aedificium-ui, comme dans les autres outils de la suite.
 */

import { brancherFeuilles, definirLangue, langueDuDocument } from 'aedificium-ui';
import './style.css';

definirLangue(langueDuDocument(document));

/** Element attendu de la page ; son absence est une erreur de developpement. */
function exige<T extends Element>(selecteur: string): T {
  const trouve = document.querySelector(selecteur);
  if (trouve === null) throw new Error(`element absent de la page : ${selecteur}`);
  return trouve as T;
}

// Barre des feuilles de calcul : aucun champ a enregistrer tant que
// l'interface n'existe pas (lot 7).
brancherFeuilles({
  app: 'silo',
  nomApp: exige<HTMLElement>('header h1').textContent ?? 'silo',
  conteneur: exige<HTMLElement>('[data-role="feuilles"]'),
  lire: () => ({}),
  charger: () => {
    // Rien a recharger : la page n'a pas encore de saisie.
  },
});

// Hors navigateur (tests), pas de service worker.
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  void import('./pwa').then((m) => m.enregistrerServiceWorker());
}
