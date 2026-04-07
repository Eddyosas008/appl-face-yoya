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

## Phase 32 : Écran statistiques avancées 30j

- [x] Créer routes tRPC stats.mood30j, stats.sleep30j, stats.wellnessScore
- [x] Créer l'écran /stats avec graphiques SVG humeur 30j et sommeil 30j
- [x] Ajouter score de bien-être global calculé (humeur + sommeil + sessions)
- [x] Ajouter section tendances (semaine vs semaine précédente)
- [x] Connecter depuis le profil (bouton "Statistiques avancées")
- [x] Vérifier TypeScript et sauvegarder le checkpoint

## Phase 33 : Refonte visuelle — Style Sanctuaire du Sommeil

- [x] Mettre à jour theme.config.js avec la palette indigo nuit / or / lavande
- [x] Installer et configurer la police Cormorant Garamond (expo-font)
- [x] Refondre l'écran Home avec le style glassmorphisme céleste
- [x] Refondre la barre de navigation (fond sombre, icônes SVG fines, tab actif en or)
- [x] Refondre l'écran Explore avec le nouveau thème
- [x] Refondre l'écran Profil avec le nouveau thème
- [x] Refondre l'écran Journal avec le nouveau thème
- [x] Refondre l'écran Journeys avec le nouveau thème
- [x] Vérifier TypeScript et sauvegarder le checkpoint

## Phase 34 : Refonte lecteur de méditation — Style Sanctuaire du Sommeil

- [x] Analyser la structure complète du lecteur de méditation
- [x] Appliquer fond indigo nuit + étoiles animées (SVG)
- [x] Refondre la pochette (cover art glassmorphisme + gradient)
- [x] Refondre les contrôles audio (boutons or, barre de progression dorée)
- [x] Refondre les métadonnées (titre Cormorant Garamond, catégorie or)
- [x] Refondre la section script de méditation (cartes glass)
- [x] Refondre les méditations similaires (cartes glass)
- [x] Vérifier TypeScript et sauvegarder le checkpoint

## Phase 35 : Refonte SomnioPax v3 — Interface premium

- [x] Mettre à jour la palette : #03020F fond, --gold #C9A84C, Playfair Display
- [x] Installer la police Playfair Display (expo-font)
- [x] Refondre la navigation : floating pill glassmorphique
- [x] Refondre Home : aurora animée (blobs SVG), stats anneaux SVG, carte méditation premium
- [x] Refondre Explore avec le nouveau thème SomnioPax
- [x] Refondre Journal avec le nouveau thème SomnioPax
- [x] Refondre Profil avec le nouveau thème SomnioPax
- [x] Refondre Journeys avec le nouveau thème SomnioPax
- [x] Vérifier TypeScript et sauvegarder le checkpoint

## Phase 36 : Amélioration barre de navigation

- [x] Rendre le fond de la tab bar plus opaque (fond sombre solide)
- [x] Renforcer la bordure supérieure
- [x] Améliorer le contraste des icônes inactives
- [x] Sauvegarder le checkpoint

## Phase 37 : Thème SomnioPax v3 — Écrans secondaires [TERMINÉE]

- [x] Refondre /sleep-tracker (fond #03020F, graphiques or, cartes glass)
- [x] Refondre /stats (fond #03020F, graphiques SVG or, Playfair Display)
- [x] Refondre /program/[slug] (fond #03020F, timeline glass, progression or)
- [x] Refondre /program-day/[slug]/[day] (fond #03020F, lecteur audio or, minuteur)
- [x] Refondre /program-complete/[slug] (fond #03020F, particules dorées, Playfair)
- [x] Refondre les écrans auth (welcome, sign-in, sign-up) avec SomnioPax v3
- [x] Refondre breathing.tsx, checkin.tsx, ambient.tsx, programs/index.tsx
- [x] Vérifier TypeScript et sauvegarder le checkpoint

## Phase 38 : Animations de transition fluides [TERMINÉE]

- [x] Créer le composant AnimatedScreen (fade-in + slide-up à l'entrée)
- [x] Configurer les transitions stack dans app/_layout.tsx (slide horizontal natif)
- [x] Appliquer AnimatedScreen sur les écrans principaux (Home, Explore, Journal, Profil, Journeys)
- [x] Vérifier TypeScript et sauvegarder le checkpoint

## Phase 38b : Correction affichage catégories et méditations [TERMINÉE]

- [x] Diagnostiquer la route tRPC catalog.list — limite 200 dépassée par requête limit:300
- [x] Augmenter la limite maximale de catalog.list de 200 à 500 dans routers.ts
- [x] Corriger explore.tsx pour utiliser limit:200 au lieu de limit:300
- [x] Vérifier que les 20 catégories et 45 méditations s'affichent correctement
- [x] Vérifier TypeScript et sauvegarder le checkpoint

## Phase 39 : Refonte écran Chat IA — SomnioPax v3

- [x] Analyser la structure actuelle de l'écran chat IA
- [x] Appliquer fond #03020F + étoiles + aurora blobs
- [x] Refondre les bulles de messages (user : glass or, IA : glassmorphisme lavande)
- [x] Refondre la zone de saisie (fond glass intégré, bordure or, bouton envoi doré)
- [x] Ajouter l'en-tête avec avatar IA halo doré et Playfair Display
- [x] Ajouter animation d'entrée des messages (fade-in + slide-up)
- [x] Ajouter indicateur de frappe animé (3 points dorés pulsants)
- [x] Vérifier TypeScript et sauvegarder le checkpoint

## Phase 40 : Harmonie visuelle totale — Style Home sur toute l'app [TERMINÉE]

- [x] Extraire les constantes visuelles du Home dans lib/theme-constants.ts
- [x] Créer composant StarField partagé dans components/star-field.tsx
- [x] Refondre Explore avec le style Home exact (StarField + fond #03020F)
- [x] Refondre Journal avec le style Home exact
- [x] Refondre Journeys avec le style Home exact
- [x] Refondre Profil avec le style Home exact
- [x] Refondre sleep-tracker avec le style Home exact
- [x] Refondre stats avec le style Home exact
- [x] Refondre program/[slug] avec le style Home exact
- [x] Refondre program-day avec le style Home exact
- [x] Refondre program-complete avec le style Home exact
- [x] Refondre breathing avec le style Home exact
- [x] Refondre checkin avec le style Home exact
- [x] Refondre ambient avec le style Home exact
- [x] Refondre welcome/signin/signup avec le style Home exact
- [x] Vérifier TypeScript (0 erreur réelle) et sauvegarder le checkpoint

## Phase 41 : Animations staggerées sur les cartes de méditation

- [x] Créer composant StaggeredItem réutilisable (fade-in + slide-up décalé par index)
- [x] Appliquer dans Explore — grille + sections horizontales par catégorie
- [x] Appliquer dans Home — mini-cartes méditations du soir
- [x] Appliquer dans le lecteur — méditations similaires
- [x] Vérifier TypeScript et sauvegarder le checkpoint

## Phase 35 : Mode clair / sombre

- [x] Définir les deux palettes complètes clair/sombre dans theme.config.js
- [x] Mettre à jour le ThemeProvider pour persister le choix avec AsyncStorage
- [x] Exposer toggleTheme dans le contexte ThemeContext
- [x] Adapter le composant StarField au mode clair/sombre
- [x] Adapter la barre de navigation (tabs) au mode clair/sombre
- [x] Adapter l'écran Home (index.tsx) au mode clair/sombre
- [x] Adapter l'écran Explore au mode clair/sombre
- [x] Adapter l'écran Journal au mode clair/sombre
- [x] Adapter l'écran Journeys au mode clair/sombre
- [x] Adapter l'écran Profile au mode clair/sombre
- [x] Ajouter le toggle clair/sombre dans les Paramètres du Profil (Switch)
- [x] Corriger toutes les références GOLD/GLASS_BORDER non définies dans les styles statiques
- [x] Persister le choix de thème dans AsyncStorage (clé somniopax_color_scheme)

## Phase 36 : Mode clair sur les écrans secondaires

- [x] Adapter le lecteur de méditation (meditation/[id].tsx) au mode clair/sombre
- [x] Adapter le chat IA (chat.tsx) au mode clair/sombre (fond, bulles, saisie)
- [x] Adapter l'écran check-in (checkin.tsx) au mode clair/sombre
- [x] Adapter l'écran ambient (ambient.tsx) au mode clair/sombre
- [x] Adapter les écrans auth (welcome, signin, signup) au mode clair/sombre
- [x] Adapter l'écran stats (stats.tsx) au mode clair/sombre
- [x] Vérifier l'absence d'erreurs Metro après toutes les adaptations

## Phase 37 : Mode clair sur les écrans de programmes

- [x] Adapter programs/index.tsx au mode clair/sombre
- [x] Adapter program/[slug].tsx au mode clair/sombre
- [x] Adapter program-day/[slug]/[day].tsx au mode clair/sombre
- [x] Adapter program-complete/[slug].tsx au mode clair/sombre
- [x] Vérifier l'absence d'erreurs Metro après toutes les adaptations

## Phase 38 : Renommage SomnioPax + Refonte thème clair/sombre

- [ ] Renommer l'app en SomnioPax dans app.config.ts
- [ ] Refondre theme.config.js avec palettes très distinctes (clair : #F7F3FD/violet, sombre : #120E2E/or)
- [ ] Mettre à jour ThemeProvider avec transitions fluides et tokens CSS variables
- [ ] Adapter tous les écrans principaux (tabs) aux nouvelles palettes
- [ ] Adapter tous les écrans secondaires aux nouvelles palettes
- [ ] Adapter tous les écrans de programmes aux nouvelles palettes
- [ ] Générer un nouveau logo SomnioPax
- [ ] Vérifier l'absence d'erreurs Metro et sauvegarder le checkpoint

## Phase 38 : Renommage SomnioPax + Refonte thème

- [x] Renommer l'app en SomnioPax dans app.config.ts
- [x] Refondre les palettes clair/sombre dans theme.config.js et theme-constants.ts (fonds très distincts : #120E2E vs #F7F3FD)
- [x] Mettre à jour tous les écrans (tabs + secondaires + programmes) avec les nouvelles palettes
- [x] Générer et intégrer le nouveau logo SomnioPax (lune + lotus + fond indigo)
- [x] Remplacer toutes les occurrences de Yoya par SomnioPax dans les fichiers tsx
- [x] Corriger les fonds clair dans les écrans auth (#F0EDF8 → #F7F3FD)

## Phase 39 : Refonte palette premium épurée

- [x] Définir la palette premium (crème/ivoire clair, bleu nuit sombre, or subtil)
- [x] Mettre à jour theme.config.js et theme-constants.ts
- [x] Appliquer sur tous les écrans tabs
- [x] Appliquer sur tous les écrans secondaires
- [x] Vérifier la cohérence et sauvegarder le checkpoint

## Phase 40 : Correction visibilité et contraste

- [x] Corriger les tokens de thème (surfaces très distinctes du fond, bordures visibles)
- [x] Corriger l'écran Home (cartes stats, sections, méditation du soir)
- [x] Corriger les autres écrans tabs et secondaires

## Phase 41 : Visibilité mode clair + option Automatique

- [x] Refondre les tokens clair (surfaces blanches, textes très sombres, bordures visibles)
- [x] Corriger les styles hardcodés sombres dans tous les écrans via makeStyles(isDark)
- [x] Convertir 26 fichiers en styles dynamiques (StyleSheet.create → makeStyles)
- [x] Ajouter l'option "Automatique" dans ThemeProvider (suit le mode système) — déjà présent
- [x] Ajouter le sélecteur 3 boutons dans Profil (Clair / Sombre / Auto)
- [x] Corriger les imports dupliqués (React, useMemo)
- [x] Vérifier la cohérence et sauvegarder le checkpoint

## Phase 42 : Ombres portées cartes mode clair

- [ ] Ajouter les tokens d'ombres dynamiques dans theme-constants.ts
- [ ] Appliquer les ombres sur les cartes de l'écran Home
- [ ] Appliquer les ombres sur les cartes Explore, Journal, Journeys, Profile
- [ ] Appliquer les ombres sur les écrans secondaires (chat, méditation, programmes)
- [ ] Vérifier la cohérence et sauvegarder le checkpoint

## Phase 43 : Animation fondu transition thème

- [x] Analyser ThemeProvider et layout root
- [x] Implémenter animation fondu 300ms dans ThemeProvider (overlay Animated.View)
- [x] Tests vitest 10/10 passés
- [x] Vérifier et sauvegarder le checkpoint

## Phase 44 : Correction contenu masqué par tab bar

- [ ] Corriger le padding bas du ScrollView dans index.tsx (Home)
- [ ] Vérifier et corriger les autres écrans tabs (Explore, Journal, Journeys, Profile)
- [ ] Vérifier et corriger les écrans secondaires avec ScrollView
- [ ] Sauvegarder le checkpoint

## Phase 42 : Sons de relaxation depuis la base de données

- [x] Ajouter la table `ambientSounds` dans drizzle/schema.ts
- [x] Migrer la DB (pnpm db:push)
- [x] Ajouter les fonctions DB : getAmbientSounds, getAmbientSoundBySlug, upsertAmbientSound
- [x] Ajouter les routes tRPC : ambient.list, ambient.get, ambient.upsert (admin)
- [x] Adapter ambient.tsx pour charger les sons depuis la DB (avec fallback local)
- [x] Seed initial : 10 sons de relaxation avec URLs à remplir par l'admin

## Phase 45 : Améliorations continues

- [ ] Ombres portées dynamiques (mode clair) sur les cartes Home, Explore, Journal, Journeys, Profile
- [x] Gestionnaire admin sons ambiants (/admin/ambient-manager)
- [x] Contrôle de volume individuel par son (slider) dans l'écran Ambient
- [x] Catégories de sons dans l'écran Ambient (Nature, Méditation, Cosmos)
- [x] Widget humeur du jour sur la Home (dernier check-in + bouton rapide)
- [ ] Citation nocturne personnalisée selon l'humeur du dernier check-in
- [ ] Écran de détail méditation enrichi (durée, niveau, description longue)
- [ ] Bouton "Ajouter aux favoris" visible directement sur les cartes de méditation

## Phase 46 : Refonte écran Check-in + améliorations Explore

- [x] Refondre checkin.tsx : design premium, sliders natifs fonctionnels (boutons 1-5 avec animation)
- [x] Sélection humeur avec animation de sélection (scale + glow couleur par humeur)
- [x] Sliders stress/énergie/sommeil avec valeurs visuelles et labels min/max
- [x] Animation de confirmation après enregistrement (récap humeur + scores)
- [x] Bouton favori sur les cartes de méditation dans Explore (fond rose quand actif)
- [x] Section infos enrichies dans le lecteur méditation (durée, niveau, catégorie)

## Phase 47 : Notifications de rappel méditation

- [x] Lire DOCS.md expo-notifications
- [x] Créer hook useNotifications (permissions, scheduling, cancel)
- [x] Créer composant ReminderSettings (toggle, heure, jours de la semaine)
- [x] Persister les préférences de rappel dans AsyncStorage
- [x] Intégrer ReminderSettings dans l'écran profil
- [x] Handler de notifications déjà configuré dans _layout.tsx (setupNotificationHandler)

## Phase 48 : Objectif quotidien configurable

- [x] Ajouter dailyGoalMinutes dans le schéma DB (table profiles via preferredDuration)
- [x] Ajouter updateDailyGoal dans server/db.ts et route tRPC profile.updateGoal + todayProgress
- [x] Créer composant DailyGoalPicker (sélecteur 5/10/15/20/30/45/60 min avec niveau)
- [x] Intégrer DailyGoalPicker dans l'écran Profil
- [x] Persister l'objectif localement (AsyncStorage) + DB si connecté
- [x] Afficher barre de progression de l'objectif sur la Home (minutes du jour / objectif)
- [x] Animation de la barre de progression (Reanimated)
- [x] Message de félicitation quand objectif atteint

## Phase 49 : Refonte page Bibliothèque (Explore)

- [x] Header amélioré avec compteur dynamique, sous-titre et bouton favoris rapide
- [x] Quick-access cards redessinées (gradient + icône + description + flèche)
- [x] Barre de recherche améliorée avec animation focus et compteur de résultats
- [x] Filtres catégories avec icônes emoji et indicateur actif amélioré
- [x] Carte hero "Méditation du moment" (première featured en pleine largeur)
- [x] Section "Populaires" triée par playCount
- [x] Cartes enrichies : gradient par catégorie, niveau, durée, playCount
- [x] Section "Récemment ajoutées" avec cartes horizontales
- [x] Animations d'entrée staggered sur les cartes
- [x] Bouton favori visible directement sur toutes les cartes
- [x] Bouton "Réinitialiser les filtres" sur l'état vide
- [x] Séparateurs visuels entre les sections catégories

## Phase 50 : Refonte page de lecture audio (meditation/[id].tsx)

- [x] Fond dégradé immersif animé par catégorie de méditation
- [x] Artwork de méditation agrandi avec ombre portée, rotation lente et halo pulsant
- [x] Visualiseur audio animé (36 barres Reanimated pendant la lecture)
- [x] Barre de progression avec temps écoulé/restant et seek interactif
- [x] Contrôles enrichis : vitesse de lecture (0.75x, 1x, 1.25x, 1.5x), mode boucle
- [x] Minuteur de sommeil (s'arrête après 15/30/45/60 min)
- [x] Section script déroulant
- [x] Bouton partage de la méditation
- [x] Méditations similaires redessinées en bas de page
- [x] Corriger erreurs TS server/routers.ts (fonctions ambient + getTodayMinutes dans namespace db)

## Phase 51 : Graphique humeur 30 jours dans Progress

- [x] Analyser progress.tsx et la route tRPC mood30Days
- [x] Créer composant MoodChart30Days (SVG, courbe colorée par émotion)
- [x] Afficher les 30 derniers jours avec couleur par humeur dominante
- [x] Légende des humeurs avec couleurs et barres de fréquence
- [x] Stats résumées : humeur dominante, tendance, jours trackés, score moyen
- [x] Vue heatmap calendrier 30 jours
- [x] Intégrer dans progress.tsx (remplace l'ancien graphique 7 jours)

## Phase 52 : Refonte page Profil

- [x] Header enrichi : avatar avec initiales colorées, badge niveau, streak visuel
- [x] Statistiques animées avec icônes colorées et progression
- [x] Carte "Bien-être global" avec score circulaire
- [x] Section Paramètres réorganisée et plus compacte
- [x] Supprimer la duplication "Objectif quotidien" (apparaît 2 fois)
- [x] Section Abonnement Premium redessinée
- [x] Bouton déconnexion stylisé en bas
- [x] Animations d'entrée sur les sections

## Phase 53 : Authentification email/mot de passe réelle

- [x] Table DB emailAuth (userId, email, passwordHash, emailVerified)
- [x] Table DB passwordResets (userId, token, expiresAt, usedAt)
- [x] Migration DB appliquée
- [x] Backend : route POST /api/auth/register (bcrypt hash, JWT session)
- [x] Backend : route POST /api/auth/login (vérification bcrypt, JWT session)
- [x] Backend : route POST /api/auth/forgot-password (token reset 1h, email nodemailer)
- [x] Backend : route GET /api/auth/reset-password/validate (vérification token)
- [x] Backend : route POST /api/auth/reset-password (consomme token, nouveau hash)
- [x] Frontend service email-auth-service.ts (fetch wrapper + stockage token natif)
- [x] Écran signin.tsx : auth email réelle + lien "Mot de passe oublié"
- [x] Écran signup.tsx : inscription réelle + indicateur force mot de passe + champ prénom
- [x] Écran forgot-password.tsx : formulaire + état succès
- [x] Écran reset-password.tsx : validation token + formulaire + redirection auto
- [x] Layout auth mis à jour avec les nouvelles routes

## Phase 54 : Connexion avec Google (Gmail)

- [x] Obtenir les credentials Google OAuth (Client ID + Secret)
- [x] Backend : route GET /api/auth/google (redirection vers Google)
- [x] Backend : route GET /api/auth/google/callback (échange code → token → session JWT)
- [x] Backend : route POST /api/auth/google/token (flux natif avec idToken)
- [x] Frontend : bouton "Continuer avec Google" sur signin.tsx
- [x] Frontend : bouton "S'inscrire avec Google" sur signup.tsx
- [x] Frontend : bouton "Continuer avec Google" sur welcome.tsx
- [x] Flux web : ouverture navigateur + callback + redirection app
- [x] Flux natif : expo-auth-session + Google idToken

## Phase 55 : Réinitialisation de mot de passe par e-mail

- [x] Configurer Resend SDK (remplace nodemailer) avec domaine somniopax.fr vérifié
- [x] Backend : route POST /api/auth/forgot-password (email Resend avec template HTML premium)
- [x] Backend : route POST /api/auth/reset-password (validation token + nouveau mdp + session JWT)
- [x] Backend : route GET /api/auth/reset-password/validate (vérification token avant affichage formulaire)
- [x] Écran forgot-password : UX améliorée avec animations, bouton renvoi, icône cercle
- [x] Écran reset-password : jauge force mdp, toggle visibilité, compteur redirection 3s
- [x] Template email HTML : design SomnioPax avec gradient doré, bouton CTA et lien de secours
- [x] Gestion des erreurs : token expiré, token déjà utilisé, email inconnu
- [x] Flux complet testé de bout en bout (forgot → email Resend → validate → reset → session JWT)

## Phase 56 : Modification du mot de passe depuis le profil

- [x] Backend : route POST /api/auth/change-password (vérif ancien mdp + nouveau hash bcrypt)
- [x] Frontend service : fonction changePassword dans email-auth-service.ts
- [x] Écran change-password.tsx (ancien mdp + nouveau mdp + confirmation + jauge force)
- [x] Route dans le layout auth
- [x] Bouton "Changer le mot de passe" dans le profil (section Compte)
- [x] Gestion des cas : utilisateur sans mdp (connexion Google uniquement) — création premier mdp
- [x] Test flux complet (changement + vérification ancien/nouveau mdp)

## Phase 57 : Suivi du sommeil enrichi

- [x] Corriger la navigation "Suivi du sommeil" depuis le dashboard (tap sur la carte)
- [x] Corriger le bouton "Voir tout" à côté de "Suivi du sommeil"
- [x] Refonte complète de l'écran sleep-tracker avec onglets (Aperçu, Historique, Recommandations)
- [x] Graphique SVG durée + qualité (7j / 14j) avec barres colorées et courbe
- [x] Score circulaire de qualité du sommeil (0-100) avec analyse personnalisée
- [x] Rapport hebdomadaire (cette semaine vs semaine dernière) avec tendances
- [x] Recommandations personnalisées : méditations guidées selon qualité de sommeil
- [x] Sons de relaxation (pluie, forêt, océan, bruit blanc, brun, feu)
- [x] Méditations matinales et exercices de respiration recommandés
- [x] Section intégration montre connectée (Apple Health, Google Fit, Garmin, Fitbit)
- [x] Modal d'enregistrement enrichi (horaires, qualité, humeur, pratiques, réveils, notes)
- [x] Routine du soir recommandée (timeline visuelle) + conseils scientifiques
- [x] Statistiques enrichies (total nuits, durée moy., qualité moy., meilleure nuit)

## Phase 58 : Synchronisation Apple Health & Google Fit

- [x] Lire la documentation expo-health (HealthKit iOS + Health Connect Android)
- [x] Installer react-native-health (iOS) + react-native-health-connect (Android)
- [x] Service health-sync.ts : demande de permissions, lecture données sommeil
- [x] Fonction parseSleepData : convertir données HealthKit/Google Fit → SleepLog
- [x] Route tRPC sleep.importFromHealth : import en masse avec déduplication
- [x] Écran sleep-tracker : composant HealthSyncCard intégré dans la section Montre
- [x] Affichage état de connexion (connecté, dernière sync, nb nuits importées)
- [x] Gestion des erreurs (permission refusée, pas de données, doublon)
- [x] Support iOS (Apple Health / HealthKit)
- [x] Support Android (Google Health Connect)
- [x] Test flux complet

## Phase 59 : Refonte complète de toutes les pages

- [x] Auditer toutes les pages existantes
- [x] Journal : éditeur enrichi avec humeur, tags, sélection d'humeur
- [x] Journal : vue calendrier avec points de couleur par humeur
- [x] Journal : statistiques et tendances émotionnelles
- [x] Journal : barre de recherche et filtres par humeur
- [x] Journal : modal de lecture d'entrée avec gradient par humeur
- [x] Respiration : 2 nouvelles techniques (Wim Hof, Nadi Shodhana)
- [x] Respiration : carte intro visuelle en haut de la liste
- [x] Respiration : 7 techniques disponibles au total
- [x] Stats : header amélioré avec bouton retour stylisé et sous-titre
- [ ] Sons d'ambiance : grille premium avec images, lecteur audio flottant, mixage multi-sons
- [ ] Sons d'ambiance : filtres par catégorie (Nature, Ville, Cosmos, Méditation)
- [ ] Dashboard : section "Pour vous aujourd'hui" personnalisée
- [ ] Favoris : organisation par collections
- [ ] Cohérence visuelle : palette de couleurs unifiée sur toutes les pages

## Phase 60 : Refonte Sons d'ambiance — Grille premium + lecteur flottant

- [x] Analyser l'état actuel de ambient.tsx et la DB des sons
- [x] Grille premium 2 colonnes avec visuels par son (emoji + gradient 3 couleurs par catégorie)
- [x] Filtres catégories horizontaux (Tous, Nature, Eau, Feu, Méditation, Cosmos)
- [x] Lecteur audio flottant persistant en bas de l'écran (sons actifs + contrôles)
- [x] Mixage multi-sons simultanés (sons indépendants, appui multiple)
- [x] Contrôle de volume individuel par son actif (slider dans le lecteur flottant)
- [x] Minuteur de sommeil avec options 15/30/45/60 min
- [x] Animation de pulsation sur les cartes actives (scale + glow overlay)
- [x] Barres d'onde animées sur les cartes actives
- [x] Indicateur visuel du nombre de sons actifs (dot pulsant dans le header)
- [x] Bannière mix actif avec bouton "Tout arrêter"
- [x] Section combinaisons recommandées (Pluie+Feu, Océan+Oiseaux, Bol+Forêt)
- [x] Vérifier TypeScript : 0 erreur dans ambient.tsx

## Phase 61 : Écran d'onboarding interactif

- [x] Analyser la structure de navigation et le stockage AsyncStorage existant
- [x] Créer app/onboarding.tsx avec 6 étapes animées (Bienvenue, Prénom, Objectif, Niveau, Durée, Ton, Résumé)
- [x] Étape Bienvenue : logo animé, titre SomnioPax, promesses (privé, 2 min, personnalisé)
- [x] Étape Objectif : 6 cartes en grille (Sommeil, Stress, Équilibre, Confiance, Focus, Récupération)
- [x] Étape Niveau : 3 choix en liste avec description (Débutant, Intermédiaire, Avancé)
- [x] Étape Durée : 5 choix en liste avec description (5/10/15/20/30 min)
- [x] Étape Ton : 4 cartes en grille (Doux, Motivant, Neutre, Spirituel)
- [x] Étape Résumé : carte de bienvenue + récapitulatif des choix + 4 features de l'app
- [x] Barre de progression animée avec Reanimated (withTiming)
- [x] Transitions FadeIn entre étapes
- [x] Auto-avancement après sélection d'une option (280ms)
- [x] Bouton "Passer la configuration" sur l'écran de bienvenue
- [x] Logique de navigation : app/index.tsx vérifie isOnboarded et redirige
- [x] Sauvegarder les préférences via completeOnboarding() dans user-context
- [x] Section "Pour vous aujourd'hui" dans le Dashboard (recommandations basées sur mainGoal)
- [x] Recommandations adaptées par objectif : 3 actions ciblées (méditation, sons, respiration)
- [x] Vérifier TypeScript : 0 erreur dans les fichiers front-end

## Phase 62 : Génération d'images premium (Nano Banana)

- [x] Générer hero nocturne pour le Dashboard (lac de montagne la nuit)
- [x] Générer image portrait pour l'Onboarding (personne en méditation)
- [x] Générer 7 images pour les sons d'ambiance (pluie, océan, forêt, feu, oiseaux, bol tibétain, cosmos)
- [x] Générer image pour la page Respiration (brume matinale)
- [x] Générer 5 images pour les objectifs de l'onboarding (sommeil, stress, confiance, focus, énergie)
- [x] Intégrer l'image hero dans le Dashboard (fond mode sombre, opacité 0.4)
- [x] Intégrer l'image portrait dans l'onboarding (section bienvenue, avec fondu vers le bas)
- [x] Intégrer les 7 images dans les cartes sons d'ambiance (fond avec overlay pour lisibilité)
- [x] Intégrer l'image dans la carte intro de la page Respiration
- [x] Vérifier TypeScript : 0 erreur dans les fichiers front-end

## Phase 63 : Images thématiques bibliothèque de méditations

- [x] Analyser les catégories de méditation dans explore.tsx (sommeil, stress-anxiete, matin, nature-connexion, confiance, pleine-conscience, creativite)
- [x] Générer 8 images thématiques avec Nano Banana (lot 1 : sommeil lac nuit, stress forêt dorée, matin sommet montagne, nature forêt magique)
- [x] Générer 8 images thématiques avec Nano Banana (lot 2 : confiance plage, pleine conscience lac cerisiers, créativité cosmos, défaut cosmos)
- [x] Images hébergées sur CDN via URLs webdev (pas besoin d'upload manuel)
- [x] Intégrer les images dans la carte hero (HeroMeditationCard) avec opacity 0.38
- [x] Intégrer les images dans les cartes horizontales (MeditationCardHorizontal) avec opacity 0.45
- [x] Intégrer les images dans les cartes grille (MeditationCardGrid) avec opacity 0.45
- [x] Corriger les doublons JSX introduits lors de l'édition
- [x] Vérifier TypeScript : 0 erreur dans les fichiers front-end

## Phase 64 : Image thématique dans le lecteur audio

- [x] Analyser la structure du lecteur audio (meditation/[id].tsx)
- [x] Ajouter le mapping CAT_IMAGES_PLAYER dans le lecteur (11 catégories + default)
- [x] Intégrer l'image en fond plein écran avec opacity 0.18 (dark) / 0.12 (light)
- [x] Ajouter un overlay gradient sombre pour la lisibilité (3 stops)
- [x] Effet blur natif (blurRadius=3) sur iOS/Android, désactivé sur web
- [x] Image positionnée entre le gradient de base et le StarField
- [x] Vérifier TypeScript : 0 erreur dans les fichiers front-end

## Phase 65 : Images thématiques dans les cartes objectifs de l'onboarding

- [x] Analyser la structure des cartes d'objectifs dans onboarding.tsx (composant ChoiceCard)
- [x] Générer les 2 images manquantes : Équilibre (émotion/lotus violet) et Récupération (prairie printanière)
- [x] Uploader les 6 images d'objectifs sur CDN (manuscdn.com)
- [x] Ajouter le mapping GOAL_IMAGES dans onboarding.tsx (6 objectifs)
- [x] Modifier ChoiceCard pour accepter imageUri et afficher l'image en fond
- [x] Overlay semi-transparent adapté à la sélection (doré si sélectionné, sombre sinon)
- [x] Texte blanc avec ombre portée pour la lisibilité sur toutes les images
- [x] imageUri passé uniquement pour l'étape mainGoal (step.field === 'mainGoal')
- [x] Vérifier TypeScript : 0 erreur dans les fichiers front-end

## Phase 66 : Correction compatibilité Expo Go

- [x] Identifier la cause : expo-crypto v55 inclut ExpoCryptoAES (module natif absent de Expo Go)
- [x] Rétrograder expo-crypto de v55 à v14.0.2 (compatible SDK 54 + Expo Go)
- [x] Rétrograder expo-linear-gradient de v55 à v14.0.2 (compatible SDK 54 + Expo Go)
- [x] Rétrograder expo-auth-session de v55 à v6.0.3 (compatible SDK 54 + Expo Go)
- [x] Supprimer les plugins react-native-health et react-native-health-connect de app.config.ts
- [x] Vérifier que les imports de react-native-health sont dynamiques (await import) dans health-sync.ts
- [x] Vérifier TypeScript : 0 erreur dans les fichiers front-end

## Phase 67 : Correction visibilité images (mode clair + sombre)

- [x] Dashboard hero : opacité 0.65 (dark) / 0.50 (light) — visible en mode clair
- [x] Onboarding cartes objectifs : opacité 0.65 (dark) / 0.55 (light) + overlay réduit rgba(30,20,10,0.30)
- [x] Respiration carte intro : opacité 0.60 (dark) / 0.50 (light) + overlay réduit
- [x] Explore carte héro : opacité 0.70 (uniforme)
- [x] Explore cartes horizontales : opacité 0.75 (uniforme)
- [x] Explore cartes grille : opacité 0.75 (uniforme)
- [x] Sons d'ambiance : overlay réduit à rgba(0,0,0,0.35)
- [x] Lecteur audio : opacité 0.45 (dark) / 0.38 (light) + overlay réduit
- [x] Vérifier TypeScript : 0 erreur dans les fichiers front-end

## Phase 68 : Correction problèmes visuels (screenshots réels)

- [x] Dashboard : image hero contenue dans le cadre arrondi (overflow hidden + borderRadius)
- [x] Sons d'ambiance : renommer tous les sons en français (Calmness → Pluie douce, etc.)
- [x] Sons d'ambiance : corriger erreur "Text strings must be rendered within a <Text>" (expo-image migration)
- [x] Sons d'ambiance : titres tronqués correctement dans les cartes (numberOfLines)
- [x] Explorer/Bibliothèque : corriger erreur "Text strings must be rendered within a <Text>" (expo-image migration)
- [x] Explorer : améliorer le cadrage des images dans les cartes (expo-image + StyleSheet.absoluteFillObject)
- [x] Migrer tous les imports Image (react-native) → Image (expo-image) dans 6 fichiers
- [x] Vérifier TypeScript et sauvegarder le checkpoint

## Phase 69 : Correction affichage pages (rapport utilisateur)

- [x] progress.tsx : bug critique styles = {} jamais calculés → useMemo + useThemeContext
- [x] progress.tsx : paddingBottom 60 → 100 pour éviter que le tab bar cache le contenu
- [x] progress.tsx : statCard padding 10 → 12, statValue fontSize 18 → 20
- [x] journey/[id].tsx : bug critique styles = {} jamais calculés → useMemo + useThemeContext
- [x] notifications-settings.tsx : bug critique styles = {} jamais calculés → useMemo + useThemeContext
- [x] journal/[id].tsx : bug critique styles = {} jamais calculés → useMemo + useThemeContext
- [x] mood-chart-30days.tsx : statValue numberOfLines={2} pour textes longs (Reconnaissante)
- [x] mood-chart-30days.tsx : MoodCurve W = screenW - 60 (calcul responsive correct)
- [x] mood-chart-30days.tsx : MoodHeatmap responsive avec Dimensions.get
- [x] ambient.tsx : CARD_W cohérent avec padding scroll + paddingBottom pour FloatingPlayer
- [x] Sauvegarder checkpoint

## Phase 70 : Correction avertissements textShadow*

- [x] Identifier tous les fichiers utilisant textShadowColor/Offset/Radius (3 fichiers trouvés)
- [x] app/(tabs)/index.tsx ligne 857 : featuredMoon textShadow* → textShadow CSS unifié
- [x] app/onboarding.tsx ligne 200 : ChoiceCard label textShadow* → textShadow CSS unifié
- [x] components/mood-chart-30days.tsx lignes 447-449 : heatDay textShadow* → textShadow CSS unifié
- [x] Vérification finale : 0 occurrence restante de textShadowColor/Offset/Radius

## Phase 71 : Correction avertissement props.pointerEvents déprécié

- [x] star-field.tsx : remplacer pointerEvents prop par style={{ pointerEvents: 'none' }}
- [x] animated-screen.tsx : non concerné (pas d'occurrence)
- [x] lib/theme-provider.tsx : remplacer pointerEvents prop par style={{ pointerEvents: 'none' }}
- [x] Vérification finale : 0 occurrence restante de pointerEvents en prop
- [x] Sauvegarder checkpoint

## Phase 72 : Correction des 5 erreurs TypeScript

- [x] Diagnostic : les erreurs étaient dans index.tsx, mood-chart-30days.tsx et onboarding.tsx (textShadow CSS), pas dans server/routers.ts
- [x] index.tsx : textShadow CSS → textShadowColor/Offset/Radius natifs React Native
- [x] mood-chart-30days.tsx : textShadow CSS → textShadowColor/Offset/Radius natifs React Native
- [x] onboarding.tsx : textShadow CSS inline → textShadowColor/Offset/Radius natifs React Native
- [x] Vérification : tsc --noEmit passe sans aucune erreur
- [x] Sauvegarder checkpoint

## Phase 73 : Notes de nuit (champ notes dans le modal de saisie du sommeil)

- [ ] Analyser le modal de saisie du sommeil dans index.tsx (Dashboard)
- [ ] Analyser le schéma DB (drizzle) pour la table sleep_sessions
- [ ] Analyser sleep-tracker.tsx pour voir l'affichage de l'historique
- [ ] Ajouter la colonne notes (text nullable) dans le schéma DB
- [ ] Mettre à jour server/db.ts : logSleep et getSleepHistory pour inclure notes
- [ ] Mettre à jour server/routers.ts : procédure logSleep pour accepter notes
- [ ] Ajouter le champ TextInput multilignes dans le modal de saisie du Dashboard
- [ ] Afficher les notes dans l'historique sleep-tracker.tsx
- [ ] Migrer la DB (pnpm db:push)
- [ ] Sauvegarder checkpoint

## Phase 74 : Amélioration affichage notes dans l'historique sleep-tracker

- [x] Lire le code de l'historique dans sleep-tracker.tsx (section logItem)
- [x] Créer composant LogNoteBlock avec état d'expansion local
- [x] numberOfLines={3} par défaut, illimité quand expanded=true
- [x] Indicateur visuel 📓 sous l'emoji qualité quand une note est présente
- [x] Label "Notes de nuit" en petites majuscules au-dessus du texte
- [x] Fond semi-transparent + bord gauche doré pour distinguer les notes
- [x] Bouton "Voir plus ▼" / "Voir moins ▲" pour les notes > 80 caractères
- [x] Texte des notes plus lisible (couleur rgba(240,235,224,0.80) au lieu de 0.45)
- [x] pnpm check : 0 erreur TypeScript
- [x] Sauvegarder checkpoint

## Phase 75 : Skeleton loader dans progress.tsx

- [x] Analyser progress.tsx : 3 requêtes tRPC (mood30, sessions.list, programs.inProgress) sans isLoading
- [x] Créer composant SkeletonBlock réutilisable avec animation Animated.loop (0.35 ↔ 1.0, 900ms)
- [x] Créer composant ProgressSkeleton avec placeholders pour header, stats 4 cartes, programmes, graphiques, sessions
- [x] Ajouter isLoading global = isAuthenticated && (loadingMood30 || loadingSessions || loadingPrograms)
- [x] Rendu conditionnel : if (isLoading) return <ScreenContainer><ProgressSkeleton /></ScreenContainer>
- [x] Skeleton adapté au thème clair/sombre (isDark)
- [x] pnpm check : 0 erreur TypeScript
- [x] Sauvegarder checkpoint
