# Lancer Claude Code sur ce dépôt

Ce fichier est pour vous ; il peut être supprimé une fois le lot 0 terminé.

## 1. Créer le dépôt

Sur GitHub, créer un dépôt vide `henri421/pressions-silos` (public, sans README ni licence : ils sont déjà ici). Puis, en local :

```bash
cd pressions-silos
git init -b main
git config user.name "henri421"
git config user.email "<adresse anonyme GitHub de henri421>"
git add .
git commit -m "docs: specification, plan et cas de validation"
git remote add origin https://github.com/henri421/pressions-silos.git
git push -u origin main
```

Ne jamais ajouter le PDF de la norme au dépôt.

## 2. Premier message à Claude Code

> Lis `CLAUDE.md`, puis `CONVENTIONS.md`, `SPEC.md`, `PLAN.md` et `docs/validation/`. Clone `henri421/charges-climatiques` à côté pour t'en servir de modèle. Exécute uniquement le lot 0 du plan, puis arrête-toi et résume.

## 3. Messages suivants

> Lot 0 validé. Exécute le lot 1.

Avant le lot 5, relire la figure 5.5c de la norme et répondre au point ouvert P4 de `SPEC.md` §9.

## 4. Ce qu'il faut vérifier vous-même à chaque lot

Les cas de validation passent, la clause citée correspond bien au code, et rien n'a été ajouté qui ne soit pas dans la spécification. En cas de doute sur une formule, c'est la norme qui fait foi, puis `docs/validation/`, puis le code.
