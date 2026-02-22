import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  AccessibilityInfo,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme';
import { Button, Card, ProgressCircle } from '../components';
import { useStore } from '../store/useStore';
import { exercises } from '../data/exercises';
import { programs } from '../data/programs';
import { adaptive } from '../utils/responsive';

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
  navigation: any;
}

export const TodayScreen: React.FC<TodayScreenProps> = ({ navigation }) => {
  const { user } = useStore();
  const { profile, preferences, progress } = user;

  // Get current program info
  const currentProgram = progress.currentProgramId
    ? programs.find((p) => p.id === progress.currentProgramId)
    : null;
  const currentDay = progress.currentProgramProgress?.currentDay || 1;

  // Get today's session exercises
  const getTodayExercises = () => {
    if (currentProgram && progress.currentProgramProgress) {
      const dayData = currentProgram.days.find((d) => d.day === currentDay);
      if (dayData && dayData.sessions.length > 0) {
        const session = dayData.sessions[0];
        return session.exercises.map((se) => {
          const exercise = exercises.find((e) => e.id === se.exerciseId);
          return exercise;
        }).filter(Boolean);
      }
    }
    // Default: suggest exercises based on preferences
    return exercises.slice(0, 4);
  };

  const todayExercises = getTodayExercises();
  const totalDuration = todayExercises.reduce((sum, ex) => sum + (ex?.duration || 0), 0);

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
    navigation.navigate('SessionPlayer', {
      programId: currentProgram?.id,
      day: currentDay,
      exerciseIds: todayExercises.map((e) => e?.id).filter(Boolean),
    });
  }, [navigation, currentProgram, currentDay, todayExercises]);

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
          >
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={20} color={colors.text.secondary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Streak & Stats Card */}
        <Card variant="elevated" padding="large" style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={styles.streakContainer}>
                <Ionicons name="flame" size={28} color={colors.accent.gold} />
                <Text style={styles.streakNumber}>{progress.currentStreak}</Text>
              </View>
              <Text style={styles.statLabel}>Jours</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
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

            <View style={styles.statItem}>
              <Text style={styles.totalMinutes}>{progress.totalMinutes}</Text>
              <Text style={styles.statLabel}>Minutes totales</Text>
            </View>
          </View>
        </Card>

        {/* Today's Session Card */}
        <Card variant="default" padding="large" style={styles.sessionCard}>
          <View style={styles.sessionHeader}>
            <View>
              <Text style={styles.sessionLabel}>Séance du jour</Text>
              {currentProgram ? (
                <Text style={styles.programName}>
                  {currentProgram.name} - Jour {currentDay}
                </Text>
              ) : (
                <Text style={styles.programName}>Routine personnalisée</Text>
              )}
            </View>
            <View style={styles.sessionMeta}>
              <Ionicons name="time-outline" size={16} color={colors.text.secondary} />
              <Text style={styles.sessionDuration}>
                {Math.ceil(totalDuration / 60)} min
              </Text>
            </View>
          </View>

          {/* Session Preview */}
          <View style={styles.sessionPreview}>
            <View style={styles.exercisePreviewRow}>
              {todayExercises.slice(0, 4).map((exercise, index) => (
                <View key={exercise?.id || index} style={styles.exercisePreviewItem}>
                  <View style={styles.exercisePreviewIcon}>
                    <Ionicons
                      name="leaf"
                      size={16}
                      color={colors.accent.green}
                    />
                  </View>
                  <Text style={styles.exercisePreviewName} numberOfLines={1}>
                    {exercise?.name || 'Exercice'}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <Button
            title="Commencer la séance"
            onPress={handleStartSession}
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
              accessibilityLabel="Voir les exercices"
              accessibilityRole="button"
            >
              <View style={[styles.quickAccessIcon, { backgroundColor: colors.accent.green + '20' }]}>
                <Ionicons name="grid" size={24} color={colors.accent.green} />
              </View>
              <Text style={styles.quickAccessLabel}>Exercices</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAccessItem}
              onPress={() => navigation.navigate('Programs')}
              accessibilityLabel="Voir les programmes"
              accessibilityRole="button"
            >
              <View style={[styles.quickAccessIcon, { backgroundColor: colors.accent.teal + '20' }]}>
                <Ionicons name="calendar" size={24} color={colors.accent.teal} />
              </View>
              <Text style={styles.quickAccessLabel}>Programmes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAccessItem}
              onPress={() => navigation.navigate('Journal')}
              accessibilityLabel="Ouvrir le journal"
              accessibilityRole="button"
            >
              <View style={[styles.quickAccessIcon, { backgroundColor: colors.accent.gold + '20' }]}>
                <Ionicons name="book" size={24} color={colors.accent.gold} />
              </View>
              <Text style={styles.quickAccessLabel}>Journal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAccessItem}
              onPress={() => navigation.navigate('Safety')}
              accessibilityLabel="Informations de sécurité"
              accessibilityRole="button"
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
  // Session Card
  sessionCard: {
    marginBottom: spacing.xl,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
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
    backgroundColor: colors.background.elevated,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  sessionDuration: {
    ...typography.label,
    color: colors.text.primary,
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
