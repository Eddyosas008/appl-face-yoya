import React, { useMemo, useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  AppState,
  AppStateStatus,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, borderRadius, typography } from '../theme';
import {
  Button,
  Card,
  DailyCheckIn,
  FaceIllustration,
  FaceZoneThumb,
  ProgressCircle,
} from '../components';
import { useStore } from '../store/useStore';
import { exercises } from '../data/exercises';
import { programs } from '../data/programs';
import { ZONE_LABELS } from '../data/labels';
import { adaptive } from '../utils/responsive';
import { getLocalDateKey } from '../utils/date';
import { filterExercisesForHealth } from '../utils/safety';
import { Exercise, FaceFeelRating, MainTabScreenNavigationProp } from '../types';

// Daily tips for face yoga practice
const dailyTips = [
  "Pratiquez de préférence devant un miroir pour vérifier vos mouvements et assurer une bonne symétrie faciale.",
  "Hydratez-vous bien avant et après votre séance pour optimiser les bienfaits sur votre peau.",
  "Respirez profondément pendant les exercices - l'oxygénation améliore les résultats.",
  "Maintenez une posture droite pendant vos exercices pour éviter les tensions au cou.",
  "Lavez-vous les mains avant de toucher votre visage pendant les exercices.",
  "Pratiquez à jeun ou 2h après un repas pour plus de confort.",
  "Soyez doux avec votre peau - les mouvements brusques peuvent causer des irritations.",
  "La régularité est plus importante que l'intensité - quelques minutes chaque jour valent mieux qu'une longue séance occasionnelle.",
  "Écoutez votre corps et ne forcez jamais un mouvement qui cause de la douleur.",
  "Détendez votre mâchoire avant de commencer - beaucoup de tensions s'y accumulent.",
  "Faites vos exercices de préférence le matin pour réveiller votre visage.",
  "Appliquez une crème hydratante avant les exercices pour faciliter les mouvements.",
  "Terminez toujours par quelques respirations profondes pour vous relaxer.",
  "Les résultats apparaissent généralement après 2 à 4 semaines de pratique régulière.",
  "Évitez de pratiquer juste avant de dormir - les exercices peuvent être stimulants.",
  "Combinez le face yoga avec un bon sommeil pour des résultats optimaux.",
  "Relâchez les tensions de vos épaules avant de commencer votre séance.",
  "Souriez naturellement entre les exercices - c'est aussi un excellent travail pour le visage !",
  "Massez légèrement votre visage après les exercices pour détendre les muscles.",
  "La constance est la clé : même 5 minutes par jour peuvent faire une différence.",
  "Évitez les exercices intenses si vous avez des inflammations ou irritations cutanées.",
  "Buvez un verre d'eau tiède le matin avant votre séance pour stimuler la circulation.",
  "Pratiquez dans un endroit calme pour mieux vous concentrer sur vos sensations.",
  "Tenez un journal de vos progrès pour rester motivé(e).",
  "Adaptez l'intensité des exercices selon votre niveau d'énergie du jour.",
  "Les mouvements lents et contrôlés sont plus efficaces que les mouvements rapides.",
  "Prenez une photo de votre visage chaque semaine pour suivre vos progrès.",
  "N'oubliez pas de travailler aussi les muscles du cou pour un résultat harmonieux.",
  "Faites une pause si vous ressentez une fatigue musculaire inhabituelle.",
  "Célébrez chaque petite victoire - la régularité mérite d'être récompensée !",
];

interface TodayScreenProps {
  navigation: MainTabScreenNavigationProp;
}

interface TodaySession {
  exercises: Exercise[];
  /** Nombre d'exercices du jour retirés pour raisons de sécurité. */
  removedCount: number;
  isProgramDay: boolean;
}

export const TodayScreen: React.FC<TodayScreenProps> = ({ navigation }) => {
  const { user, updateDailyEntry, dailyEntries } = useStore();
  const { profile, preferences, progress, healthInfo } = user;

  // Clé du jour LOCAL. L'onglet reste monté indéfiniment : on la recalcule
  // au focus de l'écran et au retour de l'app au premier plan, sinon après
  // minuit le check-in lirait/écrirait l'entrée de la veille.
  const [todayKey, setTodayKey] = useState(() => getLocalDateKey());
  const refreshTodayKey = useCallback(() => {
    const nextKey = getLocalDateKey();
    setTodayKey((prev) => (prev === nextKey ? prev : nextKey));
  }, []);

  useFocusEffect(refreshTodayKey);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (status: AppStateStatus) => {
      if (status === 'active') refreshTodayKey();
    });
    return () => subscription.remove();
  }, [refreshTodayKey]);

  const todayEntry = dailyEntries.find((entry) => entry.date === todayKey);
  const hasSafetyNotice = healthInfo.recentProcedures || healthInfo.contraindications.length > 0;

  // Get current program info
  const currentProgramId = progress.currentProgramId;
  const currentProgram = useMemo(
    () => (currentProgramId ? programs.find((p) => p.id === currentProgramId) ?? null : null),
    [currentProgramId]
  );
  const currentDay = progress.currentProgramProgress?.currentDay || 1;
  const hasProgramProgress = Boolean(progress.currentProgramProgress);

  // Today's session exercises, filtered for the user's health profile.
  const todaySession = useMemo<TodaySession>(() => {
    if (currentProgram && hasProgramProgress) {
      const dayData = currentProgram.days.find((d) => d.day === currentDay);
      if (dayData && dayData.sessions.length > 0) {
        const planned = dayData.sessions[0].exercises
          .map((se) => exercises.find((exercise) => exercise.id === se.exerciseId))
          .filter((exercise): exercise is Exercise => Boolean(exercise));
        const safe = filterExercisesForHealth(planned, healthInfo);
        return {
          exercises: safe,
          removedCount: planned.length - safe.length,
          isProgramDay: true,
        };
      }
    }
    // Default: recommend only exercises compatible with declared precautions.
    return {
      exercises: filterExercisesForHealth(exercises, healthInfo).slice(0, 4),
      removedCount: 0,
      isProgramDay: false,
    };
  }, [currentProgram, currentDay, hasProgramProgress, healthInfo]);

  const todayExercises = todaySession.exercises;
  const removedCount = todaySession.removedCount;
  const canStartSession = todayExercises.length > 0;
  const totalDuration = todayExercises.reduce((sum, ex) => sum + ex.duration, 0);

  // Quick stats
  const weekProgress = progress.weeklyProgress / progress.weeklyGoal;

  // Get daily tip based on current day
  const dailyTip = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    return dailyTips[dayOfYear % dailyTips.length];
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const handleStartSession = useCallback(() => {
    if (!canStartSession) return;

    navigation.navigate('SessionPlayer', {
      programId: currentProgram?.id,
      day: currentDay,
      exerciseIds: todayExercises.map((exercise) => exercise.id),
    });
  }, [navigation, currentProgram, currentDay, todayExercises, canStartSession]);

  const handleOpenSafety = useCallback(() => {
    navigation.navigate('Safety');
  }, [navigation]);

  const handleFeelingChange = useCallback(
    (feeling: FaceFeelRating) => {
      updateDailyEntry({
        date: todayKey,
        morningFeel: feeling,
      });
    },
    [todayKey, updateDailyEntry]
  );

  const routineFocus = useMemo(() => {
    if (todayEntry?.morningFeel === 'tendu') {
      return 'Aujourd’hui, privilégiez la lenteur et la détente.';
    }
    if (preferences.primaryGoals.includes('reduire_tensions')) {
      return 'Votre routine privilégie le relâchement des tensions.';
    }
    if (preferences.focusZones.length > 0) {
      return `Focus du jour : ${ZONE_LABELS[preferences.focusZones[0]]}.`;
    }
    return 'Une routine courte et douce, à votre rythme.';
  }, [preferences.focusZones, preferences.primaryGoals, todayEntry?.morningFeel]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{greeting()}</Text>
            <Text style={styles.userName}>
              {profile.firstName || 'Bienvenue'} !
            </Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
            accessibilityRole="button"
            accessibilityLabel="Voir mon profil"
          >
            {profile.avatarUrl ? (
              <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={20} color={colors.text.secondary} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Streak & Stats Card */}
        <Card variant="elevated" padding="large" style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View
              style={styles.statItem}
              accessible
              accessibilityLabel={`Série actuelle : ${progress.currentStreak} jours consécutifs`}
            >
              <View style={styles.streakContainer}>
                <Ionicons name="flame" size={28} color={colors.accent.gold} />
                <Text style={styles.streakNumber}>{progress.currentStreak}</Text>
              </View>
              <Text style={styles.statLabel}>Jours</Text>
            </View>

            <View style={styles.statDivider} />

            <View
              style={styles.statItem}
              accessible
              accessibilityLabel={`Progrès hebdomadaire : ${progress.weeklyProgress} séances sur ${progress.weeklyGoal}`}
            >
              <ProgressCircle
                progress={weekProgress}
                size={50}
                strokeWidth={5}
                showPercentage={false}
                centerContent={
                  <Text style={styles.weekProgressText}>
                    {progress.weeklyProgress}/{progress.weeklyGoal}
                  </Text>
                }
              />
              <Text style={styles.statLabel}>Cette semaine</Text>
            </View>

            <View style={styles.statDivider} />

            <View
              style={styles.statItem}
              accessible
              accessibilityLabel={`${progress.totalMinutes} minutes de pratique au total`}
            >
              <Text style={styles.totalMinutes}>{progress.totalMinutes}</Text>
              <Text style={styles.statLabel}>Minutes totales</Text>
            </View>
          </View>
        </Card>

        {/* Daily rhythm and safety guidance */}
        <View style={styles.dailyRhythmSection}>
          <View style={styles.routineFocusRow}>
            <View style={styles.routineFocusIcon}>
              <Ionicons name="sparkles" size={18} color={colors.accent.teal} />
            </View>
            <View style={styles.routineFocusTextWrap}>
              <Text style={styles.routineFocusLabel}>Rituel personnalisé</Text>
              <Text style={styles.routineFocusText}>{routineFocus}</Text>
            </View>
          </View>

          {hasSafetyNotice && (
            <View style={styles.safetyNotice}>
              <Ionicons name="shield-checkmark" size={18} color={colors.accent.gold} />
              <Text style={styles.safetyNoticeText}>
                Des précautions sont enregistrées : seuls les exercices compatibles sont proposés.
              </Text>
            </View>
          )}

          <DailyCheckIn
            value={todayEntry?.morningFeel}
            onChange={handleFeelingChange}
          />
        </View>

        {/* Today's Session Card */}
        <Card variant="default" padding="large" style={styles.sessionCard}>
          <View style={styles.sessionHeader}>
            {todayExercises[0] && (
              <FaceIllustration
                exerciseId={todayExercises[0].id}
                zone={todayExercises[0].zone}
                size={78}
                animated={user.settings.showAnimations}
                style={styles.sessionHero}
              />
            )}
            <View style={styles.sessionTitleWrap}>
              <Text style={styles.sessionLabel}>Séance du jour</Text>
              {currentProgram ? (
                <Text style={styles.programName} numberOfLines={2}>
                  {currentProgram.name} · Jour {currentDay}
                </Text>
              ) : (
                <Text style={styles.programName}>Routine personnalisée</Text>
              )}
              <View style={styles.sessionMeta}>
                <Ionicons name="time-outline" size={14} color={colors.text.secondary} />
                <Text style={styles.sessionDuration}>
                  {Math.ceil(totalDuration / 60)} min · {todayExercises.length} exercice
                  {todayExercises.length > 1 ? 's' : ''}
                </Text>
              </View>
            </View>
          </View>

          {/* Session Preview */}
          <View style={styles.sessionPreview}>
            <View style={styles.exercisePreviewRow}>
              {todayExercises.slice(0, 4).map((exercise) => (
                <View key={exercise.id} style={styles.exercisePreviewItem}>
                  <FaceZoneThumb
                    zone={exercise.zone}
                    exerciseId={exercise.id}
                    size={22}
                    style={styles.exercisePreviewIcon}
                  />
                  <Text style={styles.exercisePreviewName} numberOfLines={1}>
                    {exercise.name}
                  </Text>
                </View>
              ))}
            </View>

            {removedCount > 0 && canStartSession && (
              <View style={styles.safetyAdjustment} accessibilityRole="text">
                <Ionicons name="shield-checkmark-outline" size={16} color={colors.accent.gold} />
                <Text style={styles.safetyAdjustmentText}>
                  {removedCount} exercice{removedCount > 1 ? 's' : ''} retiré
                  {removedCount > 1 ? 's' : ''} pour votre sécurité
                </Text>
              </View>
            )}

            {!canStartSession && (
              <View style={styles.blockedNotice} accessibilityRole="alert">
                <Ionicons name="alert-circle" size={18} color={colors.accent.coral} />
                <Text style={styles.blockedNoticeText}>
                  {todaySession.isProgramDay
                    ? 'Tous les exercices de cette séance sont incompatibles avec vos précautions de santé. Mettez à jour vos informations ou choisissez un autre programme.'
                    : 'Aucun exercice compatible avec vos précautions de santé n’a été trouvé. Mettez à jour vos informations pour obtenir une routine adaptée.'}
                </Text>
              </View>
            )}
          </View>

          <Button
            title="Commencer la séance"
            onPress={handleStartSession}
            disabled={!canStartSession}
            fullWidth
            icon={
              <Ionicons
                name="play"
                size={20}
                color={colors.background.primary}
                style={{ marginRight: spacing.sm }}
              />
            }
          />

          {!canStartSession && (
            <Button
              title="Voir les précautions"
              onPress={handleOpenSafety}
              variant="outline"
              fullWidth
              style={styles.safetyButton}
            />
          )}
        </Card>

        {/* Quick Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Astuce du jour</Text>
          <Card variant="outlined" padding="medium" style={styles.tipCard}>
            <View style={styles.tipContent}>
              <View style={styles.tipIcon}>
                <Ionicons name="bulb" size={24} color={colors.accent.gold} />
              </View>
              <Text style={styles.tipText}>{dailyTip}</Text>
            </View>
          </Card>
        </View>

        {/* Quick Access */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accès rapide</Text>
          <View style={styles.quickAccessRow}>
            <TouchableOpacity
              style={styles.quickAccessItem}
              onPress={() => navigation.navigate('Library')}
              accessibilityRole="button"
              accessibilityLabel="Ouvrir la bibliothèque d'exercices"
            >
              <View style={[styles.quickAccessIcon, { backgroundColor: colors.accent.green + '20' }]}>
                <Ionicons name="grid" size={24} color={colors.accent.green} />
              </View>
              <Text style={styles.quickAccessLabel}>Exercices</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAccessItem}
              onPress={() => navigation.navigate('Programs')}
              accessibilityRole="button"
              accessibilityLabel="Voir les programmes"
            >
              <View style={[styles.quickAccessIcon, { backgroundColor: colors.accent.teal + '20' }]}>
                <Ionicons name="calendar" size={24} color={colors.accent.teal} />
              </View>
              <Text style={styles.quickAccessLabel}>Programmes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAccessItem}
              onPress={() => navigation.navigate('Journal')}
              accessibilityRole="button"
              accessibilityLabel="Ouvrir le journal de suivi"
            >
              <View style={[styles.quickAccessIcon, { backgroundColor: colors.accent.gold + '20' }]}>
                <Ionicons name="book" size={24} color={colors.accent.gold} />
              </View>
              <Text style={styles.quickAccessLabel}>Journal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAccessItem}
              onPress={() => navigation.navigate('Safety')}
              accessibilityRole="button"
              accessibilityLabel="Consulter les précautions de sécurité"
            >
              <View style={[styles.quickAccessIcon, { backgroundColor: colors.accent.coral + '20' }]}>
                <Ionicons name="shield-checkmark" size={24} color={colors.accent.coral} />
              </View>
              <Text style={styles.quickAccessLabel}>Sécurité</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Motivation Quote */}
        <Card variant="outlined" padding="large" style={styles.motivationCard}>
          <Ionicons name="leaf" size={24} color={colors.accent.green} />
          <Text style={styles.motivationText}>
            "Quelques minutes par jour suffisent pour prendre soin de vous. Votre visage vous remercie."
          </Text>
        </Card>

        {/* Disclaimer */}
        <View style={styles.disclaimerContainer}>
          <Ionicons
            name="information-circle-outline"
            size={16}
            color={colors.text.muted}
          />
          <Text style={styles.disclaimerText}>
            Le face yoga est une pratique complémentaire qui ne remplace pas un avis médical.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.huge,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    ...typography.body,
    color: colors.text.secondary,
  },
  userName: {
    ...typography.h2,
    color: colors.text.primary,
  },
  profileButton: {
    marginLeft: spacing.md,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background.elevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background.elevated,
  },
  // Stats Card
  statsCard: {
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border.light,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakNumber: {
    ...typography.h2,
    color: colors.text.primary,
    marginLeft: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  weekProgressText: {
    ...typography.labelSmall,
    color: colors.text.primary,
  },
  totalMinutes: {
    ...typography.h3,
    color: colors.text.primary,
  },
  // Daily rhythm
  dailyRhythmSection: {
    marginBottom: spacing.xl,
  },
  routineFocusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  routineFocusIcon: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accent.teal + '18',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  routineFocusTextWrap: {
    flex: 1,
  },
  routineFocusLabel: {
    ...typography.caption,
    color: colors.accent.teal,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  routineFocusText: {
    ...typography.body,
    color: colors.text.primary,
    marginTop: 2,
  },
  safetyNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.accent.gold + '12',
    borderWidth: 1,
    borderColor: colors.accent.gold + '3D',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  safetyNoticeText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    flex: 1,
    marginLeft: spacing.sm,
  },
  // Session Card
  sessionCard: {
    marginBottom: spacing.xl,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sessionHero: {
    marginRight: spacing.md,
  },
  sessionTitleWrap: {
    flex: 1,
  },
  sessionLabel: {
    ...typography.caption,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  programName: {
    ...typography.h4,
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  sessionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  sessionDuration: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  sessionPreview: {
    marginBottom: spacing.lg,
  },
  exercisePreviewRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  exercisePreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.elevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    margin: spacing.xs,
  },
  exercisePreviewIcon: {
    marginRight: spacing.xs,
  },
  exercisePreviewName: {
    ...typography.caption,
    color: colors.text.secondary,
    maxWidth: 100,
  },
  safetyAdjustment: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  safetyAdjustmentText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
    flex: 1,
  },
  blockedNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.accent.coral + '12',
    borderWidth: 1,
    borderColor: colors.accent.coral + '3D',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  blockedNoticeText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    flex: 1,
    marginLeft: spacing.sm,
  },
  safetyButton: {
    marginTop: spacing.sm,
  },
  // Section
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  // Tip Card
  tipCard: {
    backgroundColor: colors.accent.gold + '05',
    borderColor: colors.accent.gold + '30',
  },
  tipContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipIcon: {
    marginRight: spacing.md,
  },
  tipText: {
    ...typography.body,
    color: colors.text.secondary,
    flex: 1,
  },
  // Quick Access
  quickAccessRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAccessItem: {
    alignItems: 'center',
    flex: 1,
    minWidth: 60,
    maxWidth: 90,
  },
  quickAccessIcon: {
    width: adaptive({ small: 48, medium: 56, large: 60, default: 56 }),
    height: adaptive({ small: 48, medium: 56, large: 60, default: 56 }),
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  quickAccessLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  // Motivation Card
  motivationCard: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  motivationText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: spacing.md,
  },
  // Disclaimer
  disclaimerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.md,
  },
  disclaimerText: {
    ...typography.caption,
    color: colors.text.muted,
    marginLeft: spacing.sm,
    flex: 1,
  },
});

export default TodayScreen;
