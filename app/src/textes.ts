/**
 * Les textes affiches, en francais et en anglais. PUR.
 *
 * Le lot 0 ne livre que le message de nouvelle version ; les autres textes
 * viendront avec l'interface. Aucun texte ne se lit au chargement d'un module :
 * toujours `textes()` AU MOMENT DU RENDU, apres `definirLangue` (main.ts).
 */

import { langueCourante } from 'aedificium-ui';

const FR = {
  messages: {
    nouvelleVersion: 'Une nouvelle version est disponible. Recharger maintenant ?',
  },
};

type Textes = typeof FR;

const EN: Textes = {
  messages: {
    nouvelleVersion: 'A new version is available. Reload now?',
  },
};

export function textes(): Textes {
  return langueCourante() === 'en' ? EN : FR;
}
