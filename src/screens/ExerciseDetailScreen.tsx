import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, typography } from '../theme';
import { Button, Card } from '../components';
import { useStore } from '../store/useStore';
import { getExerciseById } from '../data/exercises';
import { Exercise, RootStackNavigationProp, RootStackRouteProp } from '../types';

const { width } = Dimensions.get('window');

interface ExerciseDetailScreenProps {
  navigation: RootStackNavigationProp;
  route: RootStackRouteProp<'ExerciseDetail'>;
}

const zoneLabels: { [key: string]: string } = {
  front: 'Front',
  yeux: 'Contour des yeux',
  joues: 'Joues',
  bouche: 'Bouche',
  ovale: 'Ovale du visage',
  cou: 'Cou & Mâchoire',
  global: 'Global',
};

const difficultyLabels: { [key: string]: string } = {
  debutant: 'Débutant',
  intermediaire: 'Intermédiaire',
  avance: 'Avancé',
};

const difficultyColors: { [key: string]: string } = {
  debutant: colors.accent.green,
  intermediaire: colors.accent.gold,
  avance: colors.accent.coral,
};

const contraindicationLabels: { [key: string]: string } = {
  atm: 'Troubles ATM',
  douleurs_cervicales: 'Douleurs cervicales',
  post_chirurgie: 'Post-chirurgie',
  injections_recentes: 'Injections récentes',
  paralysie_faciale: 'Paralysie faciale',
  hypertension: 'Hypertension',
  glaucome: 'Glaucome',
  problemes_dentaires: 'Problèmes dentaires',
};

export const ExerciseDetailScreen: React.FC<ExerciseDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const exerciseId = route.params.exerciseId;
  const { user, favoriteExercises, toggleFavoriteExercise } = useStore();
  const exercise = getExerciseById(exerciseId);

  const [activeTab, setActiveTab] = useState<'steps' | 'tips'>('steps');

  if (!exercise) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.text.muted} />
          <Text style={styles.errorText}>Exercice non trouvé</Text>
          <Button title="Retour" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  const isCompleted = user.progress.completedExercises.includes(exerciseId);
  const isFavorite = favoriteExercises.includes(exerciseId);
  const hasContraindication = exercise.contraindications.some((c) =>
    user.healthInfo.contraindications.includes(c)
  );

  const handleToggleFavorite = () => {
    if (user.settings.hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggleFavoriteExercise(exerciseId);
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds} secondes`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0
      ? `${minutes} min ${remainingSeconds} sec`
      : `${minutes} minute${minutes > 1 ? 's' : ''}`;
  };

  const handleStartExercise = () => {
    if (user.settings.hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    navigation.navigate('SessionPlayer', {
      exerciseIds: [exerciseId],
    });
  };

  const getBreathingIcon = (cue: string | undefined): keyof typeof Ionicons.glyphMap => {
    switch (cue) {
      case 'inhale':
        return 'arrow-up-circle';
      case 'exhale':
        return 'arrow-down-circle';
      case 'hold':
        return 'pause-circle';
      default:
        return 'ellipse-outline';
    }
  };

  const getBreathingLabel = (cue: string | undefined): string => {
    switch (cue) {
      case 'inhale':
        return 'Inspirez';
      case 'exhale':
        return 'Expirez';
      case 'hold':
        return 'Maintenez';
      default:
        return '';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          {isCompleted && (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={20} color={colors.accent.green} />
              <Text style={styles.completedText}>Complété</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleToggleFavorite}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? colors.accent.coral : colors.text.secondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Exercise Image/Visualization */}
        <View style={styles.visualContainer}>
          <View style={styles.visualPlaceholder}>
            <Ionicons name="body" size={80} color={colors.text.muted} />
          </View>
        </View>

        {/* Exercise Info */}
        <View style={styles.infoSection}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>

          {/* Badges row */}
          <View style={styles.badgesRow}>
            <View style={styles.zoneBadge}>
              <Ionicons name="location" size={14} color={colors.accent.green} />
              <Text style={styles.zoneBadgeText}>{zoneLabels[exercise.zone]}</Text>
            </View>

            <View
              style={[
                styles.difficultyBadge,
                { backgroundColor: difficultyColors[exercise.difficulty] + '20' },
              ]}
            >
              <Text
                style={[
                  styles.difficultyText,
                  { color: difficultyColors[exercise.difficulty] },
                ]}
              >
                {difficultyLabels[exercise.difficulty]}
              </Text>
            </View>
          </View>

          {/* Duration and repetitions */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={18} color={colors.text.secondary} />
              <Text style={styles.metaText}>{formatDuration(exercise.duration)}</Text>
            </View>
            {exercise.repetitions && (
              <View style={styles.metaItem}>
                <Ionicons name="repeat" size={18} color={colors.text.secondary} />
                <Text style={styles.metaText}>{exercise.repetitions} répétitions</Text>
              </View>
            )}
          </View>

          {/* Description */}
          <Text style={styles.description}>{exercise.description}</Text>

          {/* Benefits */}
          <View style={styles.benefitsSection}>
            <Text style={styles.sectionTitle}>Bénéfices</Text>
            {exercise.benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={18} color={colors.accent.green} />
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Contraindication Warning */}
        {hasContraindication && (
          <Card variant="outlined" padding="medium" style={styles.warningCard}>
            <View style={styles.warningContent}>
              <Ionicons name="warning" size={24} color={colors.accent.coral} />
              <View style={styles.warningTextContainer}>
                <Text style={styles.warningTitle}>Attention</Text>
                <Text style={styles.warningText}>
                  Cet exercice peut ne pas être adapté à votre situation.
                  Pratiquez avec précaution ou consultez un professionnel.
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'steps' && styles.tabActive]}
            onPress={() => setActiveTab('steps')}
          >
            <Ionicons
              name="list"
              size={18}
              color={activeTab === 'steps' ? colors.accent.green : colors.text.secondary}
            />
            <Text style={[styles.tabText, activeTab === 'steps' && styles.tabTextActive]}>
              Étapes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'tips' && styles.tabActive]}
            onPress={() => setActiveTab('tips')}
          >
            <Ionicons
              name="bulb"
              size={18}
              color={activeTab === 'tips' ? colors.accent.green : colors.text.secondary}
            />
            <Text style={[styles.tabText, activeTab === 'tips' && styles.tabTextActive]}>
              Conseils
            </Text>
          </TouchableOpacity>
        </View>

        {/* Steps Tab Content */}
        {activeTab === 'steps' && (
          <View style={styles.tabContent}>
            {exercise.steps.map((step, index) => (
              <Card key={index} variant="default" padding="medium" style={styles.stepCard}>
                <View style={styles.stepHeader}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{step.order}</Text>
                  </View>
                  {step.duration && (
                    <View style={styles.stepDuration}>
                      <Ionicons name="time-outline" size={14} color={colors.text.tertiary} />
                      <Text style={styles.stepDurationText}>{step.duration}s</Text>
                    </View>
                  )}
                  {step.breathingCue && (
                    <View style={styles.breathingCue}>
                      <Ionicons
                        name={getBreathingIcon(step.breathingCue)}
                        size={18}
                        color={colors.accent.teal}
                      />
                      <Text style={styles.breathingCueText}>
                        {getBreathingLabel(step.breathingCue)}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.stepInstruction}>{step.instruction}</Text>
              </Card>
            ))}
          </View>
        )}

        {/* Tips Tab Content */}
        {activeTab === 'tips' && (
          <View style={styles.tabContent}>
            {/* Common Errors */}
            {exercise.commonErrors.length > 0 && (
              <View style={styles.tipsSection}>
                <Text style={styles.tipsSectionTitle}>Erreurs fréquentes</Text>
                {exercise.commonErrors.map((error, index) => (
                  <View key={index} style={styles.errorItem}>
                    <Ionicons name="close-circle" size={18} color={colors.accent.coral} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Corrections */}
            {exercise.corrections.length > 0 && (
              <View style={styles.tipsSection}>
                <Text style={styles.tipsSectionTitle}>Corrections</Text>
                {exercise.corrections.map((correction, index) => (
                  <View key={index} style={styles.correctionItem}>
                    <Ionicons name="checkmark-circle" size={18} color={colors.accent.green} />
                    <Text style={styles.correctionText}>{correction}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Tips */}
            {exercise.tips.length > 0 && (
              <View style={styles.tipsSection}>
                <Text style={styles.tipsSectionTitle}>Astuces</Text>
                {exercise.tips.map((tip, index) => (
                  <View key={index} style={styles.tipItem}>
                    <Ionicons name="bulb" size={18} color={colors.accent.gold} />
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Contraindications */}
            {exercise.contraindications.length > 0 && (
              <View style={styles.tipsSection}>
                <Text style={styles.tipsSectionTitle}>Contre-indications</Text>
                {exercise.contraindications.map((ci, index) => (
                  <View key={index} style={styles.contraindicationItem}>
                    <Ionicons name="alert-circle" size={18} color={colors.accent.coral} />
                    <Text style={styles.contraindicationText}>
                      {contraindicationLabels[ci] || ci}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Footer CTA */}
      <View style={styles.footer}>
        <Button
          title="Pratiquer cet exercice"
          onPress={handleStartExercise}
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
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent.green + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  completedText: {
    ...typography.labelSmall,
    color: colors.accent.green,
    marginLeft: spacing.xs,
  },
  favoriteButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
  },
  // Content
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.huge,
  },
  // Visual
  visualContainer: {
    width: '100%',
    aspectRatio: 1.5,
    marginBottom: spacing.lg,
  },
  visualPlaceholder: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Info Section
  infoSection: {
    paddingHorizontal: spacing.lg,
  },
  exerciseName: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  badgesRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  zoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent.green + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
  },
  zoneBadgeText: {
    ...typography.labelSmall,
    color: colors.accent.green,
    marginLeft: spacing.xs,
  },
  difficultyBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  difficultyText: {
    ...typography.labelSmall,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  metaText: {
    ...typography.body,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  description: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  // Benefits
  benefitsSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  benefitText: {
    ...typography.body,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  // Warning Card
  warningCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.accent.coral + '10',
    borderColor: colors.accent.coral + '30',
  },
  warningContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  warningTextContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  warningTitle: {
    ...typography.label,
    color: colors.accent.coral,
    marginBottom: spacing.xs,
  },
  warningText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.accent.green,
  },
  tabText: {
    ...typography.label,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  tabTextActive: {
    color: colors.accent.green,
  },
  // Tab Content
  tabContent: {
    paddingHorizontal: spacing.lg,
  },
  // Steps
  stepCard: {
    marginBottom: spacing.md,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent.green,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  stepNumberText: {
    ...typography.label,
    color: colors.background.primary,
  },
  stepDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.elevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
  },
  stepDurationText: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginLeft: spacing.xs,
  },
  breathingCue: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent.teal + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  breathingCueText: {
    ...typography.caption,
    color: colors.accent.teal,
    marginLeft: spacing.xs,
  },
  stepInstruction: {
    ...typography.body,
    color: colors.text.primary,
    lineHeight: 24,
  },
  // Tips Tab
  tipsSection: {
    marginBottom: spacing.xl,
  },
  tipsSectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  errorItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    backgroundColor: colors.accent.coral + '10',
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  errorText: {
    ...typography.body,
    color: colors.text.primary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  correctionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    backgroundColor: colors.accent.green + '10',
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  correctionText: {
    ...typography.body,
    color: colors.text.primary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    backgroundColor: colors.accent.gold + '10',
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  tipText: {
    ...typography.body,
    color: colors.text.primary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  contraindicationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  contraindicationText: {
    ...typography.body,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  // Footer
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xxl,
    backgroundColor: colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: colors.border.dark,
  },
  // Error state
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  // Error text style (for error state)
  // Already defined as errorText above, can be reused
});

export default ExerciseDetailScreen;
