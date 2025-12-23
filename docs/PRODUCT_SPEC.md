# Spécification Produit - Face Yoga App V1

## Vision & Positionnement

### Objectif Principal
Créer une application de face yoga qui aide l'utilisateur à :
- Intégrer une routine quotidienne courte (5 à 15 minutes)
- Améliorer la conscience musculaire du visage
- Réduire les tensions faciales (mâchoire, front, cou)
- Soutenir une perception positive de son image corporelle
- S'ancrer dans une pratique durable, simple et non culpabilisante

### Principes Fondateurs
- **Pratique complémentaire, non médicale**
- **Progression douce et sécurisée**
- **Zéro injonction esthétique**
- **Micro-habitudes > performance**

### Contraintes Éditoriales & Éthiques
- **Langue** : Français clair, accessible, pédagogique
- **Ton** : Bienveillant, motivant, professionnel
- **Disclaimer obligatoire** : "Le face yoga ne remplace pas un avis médical et s'inscrit dans une hygiène de vie globale."
- **Mention explicite des contre-indications**

---

## Architecture Fonctionnelle & UX

### 1. Onboarding Intelligent

**Objectif UX** : Personnaliser l'expérience et rassurer sur la sécurité

**Étapes** :
1. **Bienvenue** - Présentation + disclaimer
2. **Objectifs** - Sélection des goals (multi-choix)
3. **Zones** - Zones à cibler en priorité
4. **Durée** - Temps disponible quotidien
5. **Santé** - Contre-indications
6. **Horaire** - Moment préféré
7. **Résumé** - Récapitulatif personnalisé

**Blocs UI** :
- Cartes sélectionnables avec icônes
- Sliders pour la durée
- Checkboxes pour contre-indications
- Progress bar en haut

**Micro-textes** :
- "Sélectionnez un ou plusieurs objectifs"
- "Aucune inquiétude, vous pourrez modifier ces choix à tout moment"
- "Ces informations nous permettent d'adapter les exercices"

---

### 2. Écran "Aujourd'hui"

**Objectif UX** : Accès rapide à la séance du jour + motivation

**Blocs UI** :
- **Header** : Salutation personnalisée + avatar
- **Carte Stats** : Streak, progression semaine, minutes totales
- **Carte Séance** : Programme en cours + CTA "Commencer"
- **Astuce du jour** : Tip rotatif
- **Accès rapide** : 4 icônes (Exercices, Programmes, Journal, Sécurité)
- **Citation motivation** : Quote inspirante

**Actions utilisateur** :
- Démarrer la séance
- Accéder au profil
- Navigation vers autres sections

**Données affichées** :
- Streak actuel
- Progression hebdomadaire
- Programme en cours et jour
- Durée estimée de la séance

---

### 3. Programme en Cours

**Objectif UX** : Visualiser la progression et continuer le programme

**Blocs UI** :
- **Header programme** : Nom, jour actuel, progression
- **Cercle de progression** : Pourcentage visuel
- **Liste des jours** : État (complété/en cours/à venir)
- **CTA principal** : "Continuer" ou "Commencer le jour X"

**Micro-textes** :
- "Jour 5 sur 28"
- "Bravo ! Vous avez complété 4 jours"
- "Prêt(e) pour aujourd'hui ?"

---

### 4. Bibliothèque d'Exercices

**Objectif UX** : Explorer et découvrir tous les exercices

**Blocs UI** :
- **Barre de recherche**
- **Filtres par zone** : Chips horizontaux scrollables
- **Liste d'exercices** : Cards avec image, nom, durée, zone
- **Badge "Complété"** : Indicateur visuel

**Actions utilisateur** :
- Rechercher un exercice
- Filtrer par zone
- Voir le détail d'un exercice
- Marquer en favori

---

### 5. Journal & Suivi

**Objectif UX** : Suivre sa progression et ses sensations

**Vues** :
1. **Aperçu** : Stats clés + objectif hebdomadaire
2. **Calendrier** : Vision mensuelle des séances
3. **Badges** : Collection obtenue

**Blocs UI** :
- **Grille de stats** : 4 métriques principales
- **Barre de progression** : Objectif hebdomadaire
- **Calendrier interactif** : Jours avec/sans séance
- **Grid de badges** : Badges gagnés et à obtenir

**Micro-textes** :
- "Comment se sent votre visage ?"
- "Plus que 2 séances pour atteindre votre objectif"
- "Nouveau badge débloqué !"

---

### 6. Profil & Paramètres

**Objectif UX** : Gérer son compte et personnaliser l'app

**Sections** :
1. **Profil** : Avatar, nom, stats rapides
2. **Préférences** : Zones, durée, objectif
3. **Notifications** : Rappels
4. **Application** : Sons, vibrations, animations
5. **Santé** : Contre-indications, sécurité
6. **Support** : Aide, contact, légal

**Actions sensibles** :
- Réinitialiser la progression
- Supprimer les données

---

### 7. Écran Sécurité & Précautions

**Objectif UX** : Informer et rassurer sur la pratique sûre

**Contenu** :
- Avis important (disclaimer)
- Liste des contre-indications avec explications
- Conseils de pratique
- Quand s'arrêter
- Hygiène de vie complémentaire

---

## Modèle de Données (Pseudo-JSON)

Voir le fichier `src/types/index.ts` pour le modèle complet.

### Structures principales :

```typescript
// Exercice
interface Exercise {
  id: string;
  name: string;
  zone: FaceZone;
  duration: number;
  difficulty: DifficultyLevel;
  steps: ExerciseStep[];
  contraindications: Contraindication[];
}

// Programme
interface Program {
  id: string;
  name: string;
  duration: number; // jours
  dailyDuration: number; // minutes
  days: ProgramDay[];
}

// Utilisateur
interface User {
  profile: UserProfile;
  preferences: UserPreferences;
  healthInfo: UserHealthInfo;
  progress: UserProgress;
  settings: UserSettings;
}

// Historique
interface SessionHistory {
  id: string;
  date: string;
  exercises: CompletedExercise[];
  totalDuration: number;
  mood?: MoodRating;
}
```

---

## Personnalisation (V1)

### Questions d'Onboarding
1. Objectifs (multi-sélection)
2. Zones prioritaires (multi-sélection)
3. Durée préférée (choix unique)
4. Contre-indications (multi-sélection)
5. Moment préféré (choix unique)

### Règles de Personnalisation

| Condition | Action |
|-----------|--------|
| Contre-indication ATM | Exclure exercices mâchoire intenses |
| Contre-indication cervicales | Exclure rotations cou |
| Durée 5 min | Proposer Programme Express |
| Objectif "tensions" | Prioriser Programme Détente |
| Zone "yeux" prioritaire | Séances enrichies en exercices yeux |

### Logique d'Adaptation Quotidienne
- Exercices adaptés aux contre-indications
- Durée respectant la préférence
- Variété dans les exercices proposés
- Progression graduelle en difficulté

---

## Engagement & Gamification Douce

### Streaks Non Culpabilisants
- Compteur de jours consécutifs
- Pas de pénalité visible en cas d'interruption
- Message de reprise bienveillant

### Badges Symboliques
Voir `src/data/badges.ts` pour la liste complète.

**Catégories** :
- **Streak** : Premier Élan (3j), Semaine Complète (7j), etc.
- **Completion** : Bienvenue (1 séance), Fidèle (25 séances), etc.
- **Exploration** : Curieux (10 exercices), Zones explorées
- **Milestone** : Premier programme, heures de pratique

### Messages de Motivation

**Démarrage de séance** :
- "Prenez un moment pour vous. Vous le méritez."
- "Quelques minutes de bien-être commencent maintenant."

**Fin de séance** :
- "Bravo ! Vous avez pris soin de vous aujourd'hui."
- "Belle séance ! Votre visage rayonne."

**Relance douce** :
- "Votre routine de 5 minutes vous attend."
- "Un petit moment pour votre visage aujourd'hui ?"

**Reprise après pause** :
- "Content de vous revoir ! Reprenons ensemble."
- "Pas de culpabilité ici. Bienvenue à nouveau !"

---

## Roadmap Produit

### V1 - Essentiel (MVP)
- [x] Onboarding personnalisé
- [x] 4 programmes guidés
- [x] Bibliothèque de 30 exercices
- [x] Suivi de progression simple
- [x] Système de badges
- [x] Gestion des contre-indications
- [ ] Player de séance
- [ ] Notifications locales

### V2 - IA Légère
- [ ] Suggestions automatiques basées sur l'historique
- [ ] Journal enrichi avec photos
- [ ] Ajustement dynamique des routines
- [ ] Analyse des patterns d'utilisation
- [ ] Recommandations personnalisées

### V3 - Avancé
- [ ] Analyse vidéo temps réel (guidage par caméra)
- [ ] Communauté modérée
- [ ] Lives guidés
- [ ] Programmes personnalisés par IA
- [ ] Partenariats experts

---

## Métriques de Succès

### Acquisition
- Taux de completion onboarding > 80%
- Downloads organiques

### Engagement
- DAU/MAU > 25%
- Sessions par semaine > 4
- Durée moyenne session > 8 min

### Rétention
- J7 rétention > 40%
- J30 rétention > 25%
- Streak moyen > 5 jours

### Satisfaction
- NPS > 40
- App Store rating > 4.5
