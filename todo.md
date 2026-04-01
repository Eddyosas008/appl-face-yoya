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
