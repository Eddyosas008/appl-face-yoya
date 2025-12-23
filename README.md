# Face Yoga App

Application mobile de Face Yoga - Bien-être facial naturel

## Vision

Une application de face yoga qui aide l'utilisateur à :
- Intégrer une routine quotidienne courte (5 à 15 minutes)
- Améliorer la conscience musculaire du visage
- Réduire les tensions faciales (mâchoire, front, cou)
- S'ancrer dans une pratique durable, simple et non culpabilisante

## Fonctionnalités

### V1 - MVP
- **Onboarding personnalisé** : Configuration des objectifs, zones ciblées, contre-indications
- **4 programmes guidés** :
  - Découverte (7 jours)
  - Anti-Âge Doux (28 jours)
  - Détente Mâchoire & Cou (21 jours)
  - Routine Express (5 min/jour)
- **30 exercices** classés par zones (Front, Yeux, Joues, Bouche, Ovale, Cou)
- **Suivi de progression** : Streaks, badges, statistiques
- **Sécurité** : Gestion des contre-indications, écran de précautions

### Écrans principaux
1. **Aujourd'hui** - Séance du jour et accès rapide
2. **Programmes** - Liste et progression des programmes
3. **Bibliothèque** - Tous les exercices filtrables
4. **Journal** - Suivi, calendrier, badges
5. **Profil** - Paramètres et préférences

## Tech Stack

- **Framework** : React Native avec Expo
- **Navigation** : React Navigation 6
- **State Management** : Zustand
- **Storage** : AsyncStorage
- **UI** : Composants personnalisés, thème sombre

## Installation

```bash
# Cloner le repository
git clone <repo-url>
cd face-yoga-app

# Installer les dépendances
npm install

# Lancer l'application
npm start
```

## Structure du projet

```
src/
├── components/       # Composants réutilisables
├── data/            # Données statiques (exercices, programmes, badges)
├── navigation/      # Configuration de la navigation
├── screens/         # Écrans de l'application
├── store/           # State management (Zustand)
├── theme/           # Couleurs, typographie, spacing
└── types/           # Types TypeScript

docs/
├── PERSONAS.md      # 4 personas utilisateurs détaillés
└── PRODUCT_SPEC.md  # Spécification produit complète
```

## Principes de Design

### UX
- **Bienveillance** : Pas de culpabilisation, messages positifs
- **Simplicité** : Actions claires, navigation intuitive
- **Sécurité** : Contre-indications respectées, avertissements visibles

### Éthique
- Pratique complémentaire, non médicale
- Zéro injonction esthétique
- Disclaimer toujours visible

## Personnalisation

L'app s'adapte aux :
- **Objectifs** : Détente, tonification, prévention...
- **Zones prioritaires** : Front, yeux, mâchoire...
- **Contre-indications** : ATM, cervicales, post-chirurgie...
- **Temps disponible** : 5, 10, 15, ou 20 minutes

## Documentation

- [Personas & Usages](docs/PERSONAS.md)
- [Spécification Produit](docs/PRODUCT_SPEC.md)

## Disclaimer

Le face yoga est une pratique complémentaire de bien-être qui ne remplace pas un avis médical. Il s'inscrit dans une hygiène de vie globale et ne peut prétendre à des résultats médicaux ou esthétiques garantis.

## License

Propriétaire - Tous droits réservés
