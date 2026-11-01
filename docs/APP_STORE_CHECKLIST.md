# Checklist de publication – App Store & Google Play

Ce document liste ce qui est **déjà en place dans le dépôt** et ce qui reste à faire
**côté comptes / consoles** avant la première soumission de Face Yoga.

## 1. Qualité du code (automatisable)

| Vérification | Commande | État |
|---|---|---|
| Typage strict | `npx tsc --noEmit` | ✅ 0 erreur |
| Tests unitaires | `npm test` | ✅ 7 suites, 109 tests |
| Lint | `npm run lint` | ✅ 0 erreur |
| Cohérence des dépendances Expo | `npx expo install --check` | ✅ alignées sur SDK 58 (RN 0.88, React 19) |
| Bundle Metro (iOS/Android/Web) | `npx expo export --platform ios` | ✅ |

Lancer ces 5 commandes avant chaque build de production.

## 2. Configuration applicative (`app.json`) – fait

- `name`, `slug`, `version` (1.0.0), `scheme` (`faceyoga`), `description`, `primaryColor`
- Icône 1024×1024, icône adaptative Android, splash 1284×2778, favicon, icône de notification (blanche, 96×96)
- **iOS** : `bundleIdentifier` `com.faceyoga.app`, `buildNumber`, textes de permissions en français
  (photos, appareil photo, notifications), `ITSAppUsesNonExemptEncryption = false`,
  manifeste de confidentialité (`privacyManifests`) déclarant les API « required reason »
  utilisées par AsyncStorage / Expo (UserDefaults, FileTimestamp, SystemBootTime, DiskSpace).
- **Android** : `package` `com.faceyoga.app`, `versionCode`, permissions minimales
  (CAMERA, READ_MEDIA_IMAGES, POST_NOTIFICATIONS, VIBRATE), permissions de stockage et micro bloquées,
  `allowBackup = false`.
- Plugins `expo-notifications` (canal `reminders`) et `expo-image-picker` (micro désactivé).

## 3. Build & soumission avec EAS

```bash
npm i -g eas-cli
eas login
eas build:configure          # ajoute extra.eas.projectId dans app.json
eas build -p ios --profile production
eas build -p android --profile production
eas submit -p ios            # renseigner submit.production.ios.ascAppId dans eas.json
eas submit -p android        # première soumission manuelle via la Play Console
```

Le fichier `eas.json` définit trois profils : `development` (dev client), `preview`
(APK + simulateur iOS, distribution interne) et `production` (incrément automatique des numéros de build).
Les mises à jour OTA (EAS Update / `expo-updates`) ne sont pas configurées : ajoutez `expo-updates`
et un `channel` par profil si vous en avez besoin.

### Tester sans compte développeur

- **Expo Go** (gratuit) : `npm start` puis scan du QR code. Expo Go ne supporte que le SDK courant,
  d'où l'alignement du projet sur le SDK 58.
- **APK Android** : `eas build -p android --profile preview` produit un APK installable directement.
- **iOS sur appareil** : nécessite un compte Apple Developer (99 $/an) pour `eas build -p ios --profile preview`
  en distribution interne (ad hoc) ou TestFlight.

## 4. À faire dans les consoles (non automatisable)

### App Store Connect
- [ ] Créer l'app (bundle `com.faceyoga.app`), catégorie **Forme et santé**, âge 4+.
- [ ] Captures d'écran 6,7" et 6,5" (iPhone) et 12,9" (iPad, `supportsTablet` est activé) :
  Aujourd'hui, Lecteur de séance (illustration animée), Bibliothèque, Programme, Journal.
- [ ] Déclaration de confidentialité (App Privacy) : données **non collectées** si Supabase n'est pas
  configuré ; sinon déclarer « Identifiants » et « Données d'utilisation » liées à l'utilisateur.
- [ ] URL de politique de confidentialité et de support (voir `extra.privacyPolicyUrl` / `supportEmail`).
- [ ] Notes de révision : préciser que l'app est **non médicale** (disclaimer présent dans l'app).

### Google Play Console
- [ ] Créer l'app, remplir la fiche (icône 512×512, bannière 1024×500, captures).
- [ ] Section « Sécurité des données » : cohérente avec la déclaration iOS.
- [ ] Classification du contenu (questionnaire IARC) : tout public.
- [ ] Santé : cocher « application de bien-être / fitness », pas d'allégation médicale.
- [ ] Test interne → test fermé (≥ 12 testeurs / 14 jours pour un nouveau compte développeur) → production.

### Juridique
- [ ] Publier la politique de confidentialité et les CGU aux URL déclarées dans `app.json > extra`.
- [ ] Vérifier que le disclaimer « Le face yoga ne remplace pas un avis médical » apparaît dans
  l'onboarding, l'écran Sécurité et l'écran Aujourd'hui (c'est le cas).

## 5. Backend (optionnel)

L'app fonctionne **100 % hors-ligne** (AsyncStorage). Pour activer la synchronisation Supabase :
1. Copier `.env.example` en `.env` et renseigner `EXPO_PUBLIC_SUPABASE_URL` et
   `EXPO_PUBLIC_SUPABASE_ANON_KEY` (clé publique uniquement).
2. Appliquer le schéma du dossier `supabase/`.
3. Ajouter ces variables comme secrets EAS : `eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL ...`.

## 6. Avant chaque release

- [ ] Incrémenter `expo.version` (semver) ; `buildNumber`/`versionCode` sont gérés par EAS (`autoIncrement`).
- [ ] Tester sur un appareil physique iOS et Android : notifications, sélection photo, animations
  (et le réglage « Animations » désactivé), accessibilité VoiceOver/TalkBack sur le lecteur de séance.
- [ ] Vérifier le comportement au changement de jour (laisser l'app ouverte après minuit) et le lundi
  (remise à zéro de l'objectif hebdomadaire).
