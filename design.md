# Yoya Wellness — Plan de Design

## Vision Produit
Application mobile wellness premium pour femmes (18-40 ans) axée sur la méditation, la régulation émotionnelle, le sommeil et le bien-être mental. Design féminin, élégant et apaisant, inspiré des meilleures applications wellness (Calm, Headspace) mais avec une identité propre et différenciante.

---

## Palette de Couleurs

| Rôle | Couleur Light | Couleur Dark | Usage |
|------|--------------|-------------|-------|
| `primary` | `#C084FC` (violet doux) | `#A855F7` | Accents, boutons principaux |
| `secondary` | `#F9A8D4` (rose poudré) | `#EC4899` | Éléments secondaires |
| `accent` | `#86EFAC` (vert sauge) | `#4ADE80` | Succès, progression |
| `background` | `#FDF8FF` (blanc lavande) | `#0F0A1A` | Fond principal |
| `surface` | `#F5EEFF` (lilas très clair) | `#1A1025` | Cartes, surfaces |
| `foreground` | `#1A0A2E` (violet très sombre) | `#F0E6FF` | Texte principal |
| `muted` | `#8B7BA8` (violet grisé) | `#9D8FBF` | Texte secondaire |
| `border` | `#E8D5F5` (lilas clair) | `#2D1F45` | Bordures, séparateurs |

---

## Typographie
- **Titres** : Police serif élégante (ex. Playfair Display ou Georgia) — chaleur et sophistication
- **Corps** : Sans-serif propre (ex. Inter ou SF Pro) — lisibilité maximale
- **Taille minimale** : 14px pour le corps, 24px+ pour les titres d'écran

---

## Liste des Écrans

### Flux d'Authentification
1. **Welcome** — Écran de bienvenue avec illustration, tagline, boutons Sign Up / Sign In
2. **Sign Up** — Formulaire email + mot de passe, lien vers Sign In
3. **Sign In** — Formulaire email + mot de passe, lien vers Sign Up
4. **Onboarding (multi-étapes)** — 6 étapes : prénom, tranche d'âge, objectif principal, niveau méditation, durée préférée, ton de guidance

### Navigation Principale (Tab Bar)
5. **Home Dashboard** — Salutation, check-in émotionnel, méditation du jour, parcours adaptatif recommandé, sessions récentes, favoris, snapshot progression
6. **Explore / Bibliothèque** — Catégories de méditations, recherche, filtres
7. **Journeys / Parcours** — Parcours adaptatifs personnalisés
8. **Journal** — Entrées de journal, historique d'humeur
9. **Profile** — Profil utilisateur, paramètres

### Écrans Secondaires
10. **Emotional Check-in** — Sélection état émotionnel, intensité stress, énergie, qualité sommeil, note
11. **Adaptive Journey Detail** — Intro, exercice respiration, méditation, prompt réflexif, feedback
12. **Meditation Player** — Lecteur audio avec visualisation, contrôles, minuterie
13. **AI Chat** — Interface chat de soutien émotionnel
14. **Progress Screen** — Statistiques, tendances humeur, séries, catégories favorites
15. **Subscription** — Plans gratuit / premium mensuel / annuel
16. **Settings** — Notifications, confidentialité, export données, déconnexion

---

## Flux Utilisateur Principaux

### Flux 1 : Première utilisation
Welcome → Sign Up → Onboarding (6 étapes) → Home Dashboard

### Flux 2 : Check-in émotionnel quotidien
Home → Tap "Check-in" card → Emotional Check-in → Résultats + Recommandation → Parcours adaptatif ou Méditation

### Flux 3 : Méditation
Home / Explore → Tap méditation → Meditation Player → Feedback post-session → Journal (optionnel)

### Flux 4 : Parcours adaptatif
Home → Tap "Adaptive Journey" → Journey Detail → Respiration → Méditation → Prompt → Feedback

### Flux 5 : Chat IA
Tab Bar → Chat → Sélection prompt ou message libre → Réponse IA → Suite conversation

---

## Composants UI Clés

| Composant | Description |
|-----------|-------------|
| `GradientCard` | Carte avec dégradé doux, coins arrondis (16px), ombre légère |
| `MoodSelector` | Grille d'emojis/icônes pour sélection d'humeur |
| `AudioPlayer` | Lecteur avec barre de progression, play/pause, minuterie |
| `JourneyStep` | Étape de parcours avec icône, titre, description |
| `ProgressRing` | Anneau de progression animé |
| `PremiumBadge` | Badge "Premium" pour contenu verrouillé |
| `ChatBubble` | Bulle de message pour le chat IA |

---

## Principes de Design
- **Espacement généreux** : padding 20-24px, gap 12-16px entre éléments
- **Coins arrondis** : 16-24px pour les cartes, 999px pour les boutons pill
- **Ombres douces** : `shadow-sm` avec teinte violette légère
- **Gradients** : Dégradés lilas→rose pour les éléments premium
- **Animations** : Transitions douces 250-350ms, pas de rebond excessif
- **Iconographie** : Lignes fines, style minimal et féminin
