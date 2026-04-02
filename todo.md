# Yoya Wellness — TODO

## Phase 1 : Initialisation & Design
- [x] Initialiser le projet Expo
- [x] Créer design.md
- [x] Créer todo.md

## Phase 2 : Logo & Thème
- [x] Générer le logo de l'application
- [x] Configurer la palette de couleurs premium (violet/rose/lavande)
- [x] Mettre à jour theme.config.js et tailwind.config.js
- [x] Mettre à jour app.config.ts avec le nom et logo

## Phase 3 : Structure & Navigation
- [x] Lire server/README.md pour comprendre le backend
- [x] Configurer la navigation (tabs + stack)
- [x] Créer les icônes dans icon-symbol.tsx
- [x] Configurer le contexte d'authentification
- [x] Configurer les types TypeScript globaux
- [x] Créer les données mock (méditations, parcours)

## Phase 4 : Authentification & Onboarding
- [x] Écran Welcome
- [x] Écran Sign Up
- [x] Écran Sign In
- [x] Onboarding multi-étapes (6 étapes)
- [x] Sauvegarde des préférences onboarding

## Phase 5 : Dashboard & Fonctionnalités Core
- [x] Home Dashboard
- [x] Emotional Check-in
- [x] Adaptive Journey Detail
- [x] Parcours adaptatifs (liste)

## Phase 6 : Bibliothèque & Lecteur
- [x] Bibliothèque de méditations (liste + filtres + recherche)
- [x] Meditation Player (lecteur audio)
- [x] Système de favoris

## Phase 7 : Chat IA, Journal & Progression
- [x] AI Chat screen
- [x] Journal (entrées + historique)
- [x] Progress screen (statistiques, tendances)

## Phase 8 : Abonnement, Profil & Paramètres
- [x] Subscription screen
- [x] Profile screen
- [x] Settings screen
- [x] Données de démonstration (seed data)

## Phase 9 : Finalisation
- [x] Vérification de tous les flux utilisateur
- [x] Checkpoint final

## Phase 10 : Améliorations v2
- [x] Lecteur audio fonctionnel avec sons réels (expo-audio + URLs distantes)
- [x] Exercices de respiration guidés avec animation cercle pulsant
- [x] Écran Progression avec graphique d'humeur sur 7 jours (SVG)
- [x] Sons d'ambiance (pluie, forêt, océan) dans l'écran Explore
- [x] Animation d'entrée sur le Dashboard (fade-in des cartes)
- [x] Barre de progression interactive dans le lecteur (seek on tap)
- [x] Minuteur de méditation libre (sans audio)
- [x] Amélioration de l'écran Explore avec sections thématiques

## Phase 11 : Notifications de rappel quotidien
- [x] Créer le service de notifications (lib/notification-service.ts)
- [x] Demande de permission au démarrage de l'app
- [x] Planification de rappels quotidiens récurrents (heure personnalisable)
- [x] Messages de rappel variés et motivants (10+ messages)
- [x] Écran dédié de configuration des notifications
- [x] Intégration dans les paramètres du profil (remplacement du Switch basique)
- [x] Gestion des réponses aux notifications (deep link vers l'app)
- [x] Persistance des préférences de notifications dans AsyncStorage

## Phase 12 : Backend complet + connexion frontend
- [x] Schéma DB : tables userProfiles, checkIns, journalEntries, sessionHistory, chatMessages
- [x] Migration DB (pnpm db:push)
- [x] API tRPC : profil utilisateur (get, update, isPremium)
- [x] API tRPC : check-ins émotionnels (list, create)
- [x] API tRPC : journal (list, create, update, delete)
- [x] API tRPC : sessions de méditation (list, create, stats)
- [x] API tRPC : favoris (list, toggle)
- [x] API tRPC : chat IA avec LLM intégré (send message, history)
- [x] Connexion frontend : user-context utilise tRPC au lieu d'AsyncStorage
- [x] Authentification Manus OAuth réelle dans les écrans auth
- [x] Gestion des états loading/error dans tous les écrans connectés
- [x] Synchronisation multi-appareils fonctionnelle

## Phase 13 : Persistance et affichage du prénom
- [x] Lire l'état actuel de l'onboarding et du user-context
- [x] Sauvegarder le prénom en DB (trpc.profile.upsert) à la fin de l'onboarding
- [x] Sauvegarder le prénom dans AsyncStorage pour accès hors-ligne
- [x] Afficher le prénom dans le dashboard (salutation personnalisée)
- [x] Afficher le prénom dans le chat IA (contexte personnalisé)
- [x] Afficher le prénom dans le profil et les paramètres
- [x] Permettre la modification du prénom depuis le profil

## Phase 14 : Catalogue audio DB
- [x] Tables DB : meditations + meditationCategories
- [x] Migration DB
- [x] Fonctions DB : getMeditations, getMeditationBySlug, getMeditationCategories, incrementPlayCount
- [x] Routes tRPC : catalog.list, catalog.get, catalog.categories, catalog.played, catalog.upsert
- [x] Script de seed : 8 catégories + 14 méditations avec scripts complets
- [x] Bibliothèque explore.tsx connectée à la DB (filtres dynamiques depuis DB)
- [x] Lecteur meditation/[id].tsx connecté à la DB via slug
- [x] Affichage du script de méditation dans le lecteur
- [x] Compteur de lectures incrémenté à chaque écoute

## Phase 15 : Recentrage Sommeil + Page d'accueil enrichie + Programmes

- [x] Refonte complète de la page d'accueil orientée sommeil
- [x] Section hero avec heure du coucher, qualité de sommeil et météo nocturne
- [x] Widget "Ce soir" avec méditation du soir recommandée
- [x] Section problématiques du sommeil (insomnie, réveil nocturne, stress, etc.)
- [x] Section programmes structurés sur la page d'accueil
- [x] Conseils du soir et hygiène du sommeil
- [x] Citation inspirante nocturne
- [x] Statistiques de sommeil (heures dormies, qualité, streak)
- [x] Table DB : sleepPrograms (programmes structurés)
- [x] Table DB : programDays (jours d'un programme avec contenu)
- [x] Table DB : userProgramProgress (progression utilisateur)
- [x] Seed DB : Programme "Initiation au sommeil" (2 jours)
- [x] Seed DB : Programme "Retrouver le sommeil" (7 jours)
- [x] Seed DB : Programme "Transformation du sommeil" (21 jours)
- [x] Seed DB : Programme "Maître du sommeil" (30 jours)
- [x] Écran liste des programmes avec filtres et progression
- [x] Écran détail d.un programme (jours, contenu, progression)
- [x] Navigation vers les programmes depuis la page d'accueil
- [x] Mise à jour du thème couleurs vers bleu nuit / violet profond

## Phase 16 : Suivi du sommeil

- [x] Table DB sleepLogs (heure coucher, lever, durée, qualité, notes, date)
- [x] Routes tRPC : sleepLog.create, sleepLog.list, sleepLog.stats, sleepLog.delete
- [x] Modal de saisie du sommeil (heure coucher/lever, qualité 1-5 étoiles, notes)
- [x] Widget sommeil sur la page d'accueil (dernière nuit + bouton saisie)
- [x] Écran dédié suivi sommeil avec graphique SVG hebdomadaire
- [x] Graphique barres durée de sommeil sur 7 jours
- [x] Courbe qualité du sommeil sur 7 jours
- [x] Statistiques : durée moyenne, meilleure nuit, objectif atteint
- [x] Historique des 30 derniers jours en liste
- [x] Lien depuis le dashboard vers l'écran de suivi

## Phase 17 : Notes de nuit (rêves / pensées)

- [ ] Ajouter champ notes multilignes dans le modal de saisie du dashboard
- [ ] Afficher les notes dans l'historique de l'écran sleep-tracker
- [ ] Permettre l'édition des notes depuis l'historique

## Phase 17 : Notes de nuit (rêves / pensées)

- [ ] Ajouter champ notes multilignes dans le modal de saisie du dashboard
- [ ] Afficher les notes dans l historique de l ecran sleep-tracker
- [ ] Permettre l edition des notes depuis l historique

## Phase 18 : Amélioration Programmes

- [x] Refonte écran liste programmes (cartes gradient, progression, badge Premium)
- [x] Section "Mon programme en cours" sur la liste
- [x] Refonte écran détail programme (timeline jours, aperçu contenu)
- [x] Refonte écran jour de programme (exercices interactifs, minuteur)
- [ ] Enrichissement contenu DB (21j et 30j complets)
- [x] Indicateur de jours restants et streak programme

## Phase 24 : Correction tap cartes jours programme

- [x] Corriger le tap sur les cartes de jours — tap simple navigue vers le jour (plus besoin de connexion pour Jour 1)

## Phase 25 : Corrections navigation et audio

- [x] Corriger le bouton "Voir tout" Programmes dans la page d'accueil
- [x] Faire fonctionner le lecteur audio des jours de programme (audioUrl depuis DB)
- [x] Créer l'écran liste /programs avec filtres et progression
- [x] Corriger la navigation des cartes programmes (/programs/[slug] → /program/[slug])

## Phase 26 : Écran de félicitations fin de programme

- [x] Créer l'écran /program-complete/[slug] avec animations et statistiques
- [x] Modifier completeDay dans routers.ts pour retourner isCompleted
- [x] Connecter la navigation depuis program-day vers l'écran de félicitations
- [x] Ajouter haptics et animation d'entrée sur l'écran de félicitations

## Phase 27 : Section Programmes complétés dans le profil

- [x] Créer la fonction getCompletedPrograms dans db.ts (joint userProgramProgress + sleepPrograms)
- [x] Ajouter la route tRPC programs.completed dans routers.ts
- [x] Intégrer la section dans l'écran profil avec cartes gradient, badges et dates
- [x] Ajouter les styles pour les cartes de programmes complétés

## Phase 28 : Développement continu et améliorations globales

### Home
- [x] Remplacer les cartes programmes hardcodées par des données dynamiques depuis la DB
- [x] Ajouter une section "Programme en cours" sur la Home si l'utilisateur a un programme actif
- [x] Ajouter un 4ème stat "Programmes" dans la carte de stats du profil

### Backend
- [x] Ajouter route tRPC programs.inProgress pour les programmes en cours
- [x] Améliorer la route programs.list pour inclure la progression utilisateur
- [x] Ajouter la fonction getCompletedPrograms dans db.ts

### Profil
- [x] Ajouter compteur de programmes terminés dans les stats du profil
- [x] Ajouter section "Programmes en cours" dans le profil avec progression et bouton Reprendre

### Explore / Méditations
- [x] Ajouter un filtre "Favoris" dans l'écran Explore

### Journal
- [x] Ajouter recherche et filtres par humeur dans le journal
- [x] Ajouter bouton supprimer les entrées du journal

### Progress
- [x] Connecter les sessions récentes depuis la DB
- [x] Ajouter section "Programmes en cours" dans Progress
- [x] Améliorer les stats avec données DB (minutes, sessions)

## Phase 29 : Enrichissement des programmes longs (21j et 30j)

- [x] Analyser l'état actuel des jours en DB (programmes transformation-21j et maitre-30j)
- [x] Créer le script de seed pour les jours 1-21 du programme Transformation (21 jours complets)
- [x] Créer le script de seed pour les jours 1-30 du programme Maître du sommeil (30 jours complets)
- [x] Exécuter les scripts de seed : 21 jours insérés (0 erreur) + 30 jours insérés (0 erreur)
- [x] Contenu enrichi : descriptions détaillées, routines du soir, conseils scientifiques, prompts de journal, méditations, exercices de respiration, sons d'ambiance, durée estimée

## Phase 30 : Gestion audio admin + améliorations fonctionnelles

- [x] Créer l'écran admin /admin/audio-manager pour gérer les URLs audio des programDays
- [x] Route tRPC programs.updateDayAudio (admin) pour mettre à jour audioUrl + audioDurationSeconds
- [x] Route tRPC programs.getDays pour lister les jours d'un programme
- [x] Ajouter lien vers audio-manager dans la section Administration du profil
- [x] Créer l'écran /journal/[id] pour afficher une entrée de journal en plein écran avec édition
- [x] Connecter les cartes du journal vers l'écran de détail (navigation + hint)
- [x] Ajouter route tRPC sleep.weeklyReport (bilan 7j vs 7j précédents avec tendances)
- [x] Intégrer le widget rapport hebdomadaire dans l'écran Sleep Tracker
- [x] Ajouter section Administration dans le profil avec lien audio-manager
- [x] 0 erreur TypeScript réelle confirmée (npx tsc --noEmit)

## Phase 31 : Enrichissement méditations + améliorations globales

- [x] Analyser l'état actuel des catégories et méditations en DB (8 catégories existantes)
- [x] Appliquer migration pour ajouter colonne scriptText à la table meditations
- [x] Créer script seed-meditations-enriched.ts avec 12 nouvelles catégories et 32 méditations
- [x] Exécuter le seed : 12 catégories + 32 méditations insérées avec succès
- [x] Réécrire l'écran Explore avec section "À la une", grille par catégorie, meilleur affichage
- [x] Ajouter méditations similaires dans le lecteur de méditation
- [x] Améliorer Home : méditation du jour dynamique (rotation quotidienne), mini-cartes méditations du soir
- [x] Corriger le bug View non fermé dans Home (section Suivi du sommeil)
- [x] Ajouter styles miniMedCard dans le StyleSheet de Home
- [x] Remplacer import * as db par imports nommés explicites dans routers.ts (correction watcher TS)
- [x] 0 erreur TypeScript réelle confirmée (npx tsc --noEmit)
