# Face Yoga App

Application mobile de Face Yoga – bien-être facial naturel. React Native + Expo (SDK 51), TypeScript strict, 100 % hors-ligne par défaut, synchronisation Supabase optionnelle.

## Vision

Une application de face yoga qui aide l'utilisateur à :
- Intégrer une routine quotidienne courte (5 à 15 minutes)
- Améliorer la conscience musculaire du visage
- Réduire les tensions faciales (mâchoire, front, cou)
- S'ancrer dans une pratique durable, simple et non culpabilisante

> Le face yoga est une pratique complémentaire qui ne remplace pas un avis médical.

## Fonctionnalités

- **Onboarding personnalisé** : objectifs, zones ciblées, durée, contre-indications, horaire
- **30 exercices illustrés** classés par zone (front, yeux, joues, bouche, ovale, cou), chacun avec
  une **illustration animée** du mouvement (sourcils, yeux avec iris et clignement, joues, lèvres
  bicolores, mâchoire, tête, respiration, doigts avec trajectoires fléchées) et une vignette de zone ;
  **carnation du visage** au choix dans les réglages (claire, médium, hâlée, foncée)
- **4 programmes guidés** : Découverte (7 j), Anti-Âge Doux (28 j), Détente Mâchoire & Cou (21 j), Routine Express
- **Lecteur de séance** : minuteur par étape avec anneau de progression, consignes de respiration,
  pause, repos guidé entre les exercices, ressenti de fin de séance
- **Séances personnalisées** : sélection multiple d'exercices dans la bibliothèque, favoris
- **Sécurité** : filtrage des exercices selon les contre-indications et les actes récents, écran de
  précautions, avertissements contextuels
- **Suivi** : streak bienveillant, objectif hebdomadaire, badges, journal (ressentis, hydratation,
  sommeil, photos), statistiques détaillées
- **Rappels** : notifications locales quotidiennes
- **Accessibilité** : labels, rôles et états sur tous les contrôles, réglage « animations » respecté

## Écrans

1. **Aujourd'hui** – séance du jour (avec aperçu animé du premier exercice), check-in, astuce
2. **Programmes** – liste, programme en cours, détail jour par jour avec reprise
3. **Exercices** – bibliothèque filtrable (zone, niveau, favoris, complétés), créateur de séance
4. **Journal** – aperçu, calendrier, badges, galerie de progression
5. **Profil** – statistiques, préférences, notifications, sécurité, paramètres

## Stack technique

- **Framework** : React Native 0.74 / Expo SDK 51
- **Navigation** : React Navigation 6 (Bottom Tabs + Native Stack)
- **État** : Zustand (persisté dans AsyncStorage)
- **Illustrations** : react-native-svg + Animated (`src/components/FaceIllustration`)
- **Backend optionnel** : Supabase (auth + sync), schéma dans `supabase/`
- **Qualité** : TypeScript strict, ESLint, Jest + Testing Library

## Démarrage

```bash
npm install
cp .env.example .env     # optionnel : clés Supabase publiques
npm start                # puis i (iOS), a (Android) ou w (web)
```

## Scripts

| Commande | Rôle |
|---|---|
| `npm start` | Serveur de développement Expo |
| `npm test` | Tests unitaires (Jest) |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Vérification des types |
| `npx expo install --check` | Cohérence des dépendances Expo |
| `npx expo export --platform ios` | Validation du bundle Metro |

## Publication

La configuration des stores (permissions en français, manifeste de confidentialité iOS, permissions
Android minimales, icônes, EAS) est décrite dans [`docs/APP_STORE_CHECKLIST.md`](docs/APP_STORE_CHECKLIST.md).

```bash
eas build -p ios --profile production
eas build -p android --profile production
```

## Structure du projet

```
src/
├── components/        # Composants réutilisables (dont FaceIllustration/)
├── data/              # Exercices, programmes, badges, labels partagés
├── hooks/             # Hooks (réseau, synchro, reset hebdomadaire…)
├── navigation/        # Tabs + stack
├── providers/         # AppProvider
├── screens/           # Écrans
├── services/          # Notifications, stockage, Supabase, synchro
├── store/             # Zustand
├── theme/             # Couleurs, typographie, espacements
├── types/             # Types TypeScript
└── utils/             # Dates locales, sécurité, validation, responsive

docs/
├── PERSONAS.md            # Personas utilisateurs
├── PRODUCT_SPEC.md        # Spécification produit
├── WEB_VALIDATION.md      # Validation web
└── APP_STORE_CHECKLIST.md # Checklist de publication
```

## Principes de design

- **Bienveillance** : pas de culpabilisation, messages positifs
- **Simplicité** : actions claires, navigation intuitive
- **Sécurité** : contre-indications respectées, avertissements visibles
- **Éthique** : pratique complémentaire, non médicale ; zéro injonction esthétique
