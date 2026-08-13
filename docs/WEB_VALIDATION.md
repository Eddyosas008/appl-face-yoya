# Validation navigateur — Face Yoga

## État initial validé

Le 13 août 2026, l’entrée web dédiée (`App.web.tsx`) a été chargée dans Chromium via Expo Web. L’écran d’accueil s’affiche correctement avec :

- l’en-tête **Face Yoga** et l’indicateur « Aperçu web » ;
- une séance du jour de 5 minutes avec CTA de démarrage ;
- les indicateurs de pratique ;
- le bilan de ressenti ;
- la recommandation de rituel ;
- l’astuce de pratique et le rappel de sécurité ;
- la navigation par onglets Aujourd’hui, Programmes, Exercices et Journal.

Les prochaines vérifications concernent l’interaction de ressenti, le lecteur de séance et la navigation par onglets.

## Interactions validées

Le bilan de ressenti est fonctionnel : la sélection de l’état « Détendu » modifie immédiatement le texte de recommandation du rituel. Le CTA « Commencer la séance » ouvre un lecteur de séance pas à pas affichant une progression en trois étapes, l’exercice courant, sa durée, l’instruction correspondante, un contrôle de sortie et des actions de navigation. Le premier état du lecteur désactive correctement le retour à l’étape précédente.

La navigation vers le **Journal** fonctionne et présente des indicateurs de régularité, une semaine visualisée et les précautions de pratique. L’onglet **Exercices** fonctionne également : les filtres de zones et la liste des exercices sont visibles et accessibles.

## Contrôles de qualité

L’export web de production a été généré avec succès via `npx expo export --platform web`, puis ouvert depuis le dossier `dist` dans Chromium. Le contrôle TypeScript est valide et la suite Jest est entièrement réussie, avec **74 tests sur 74**. ESLint est à présent compatible avec ESLint 9 et termine sans erreur bloquante ; il signale encore des avertissements historiques, hors périmètre de cette itération, à traiter progressivement dans une future passe de dette technique.
