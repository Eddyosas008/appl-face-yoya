import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, typography } from '../theme';
import { Button, Card, ProgressCircle } from '../components';
import { useStore } from '../store/useStore';
import { programs, getProgramById } from '../data/programs';
import { getExerciseById } from '../data/exercises';

interface ProgramDetailScreenProps {
  navigation?: any;
  route?: {
    params?: {
      programId?: string;
    };
  };
}

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

const zoneLabels: { [key: string]: string } = {
  front: 'Front',
  yeux: 'Yeux',
  joues: 'Joues',
  bouche: 'Bouche',
  ovale: 'Ovale',
  cou: 'Cou',
  global: 'Global',
};

export const ProgramDetailScreen: React.FC<ProgramDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const programId = route?.params?.programId || '';
  const { user, startProgram, completeProgram } = useStore();
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const program = getProgramById(programId);

  if (!program) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.text.muted} />
          <Text style={styles.errorText}>Programme non trouvé</Text>
          <Button title="Retour" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  const isCurrentProgram = user.progress.currentProgramId === programId;
  const isCompleted = user.progress.completedPrograms.includes(programId);
  const currentDay = user.progress.currentProgramProgress?.currentDay || 1;
  const completedDays = user.progress.currentProgramProgress?.completedDays || [];

  // Calculate progress
  const progress = useMemo(() => {
    if (isCompleted) return 1;
    if (!isCurrentProgram) return 0;
    return completedDays.length / program.duration;
  }, [isCompleted, isCurrentProgram, completedDays, program.duration]);

  const handleStartProgram = () => {
    if (user.settings.hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (user.progress.currentProgramId && user.progress.currentProgramId !== programId) {
      Alert.alert(
        'Changer de programme ?',
        'Vous avez déjà un programme en cours. Voulez-vous le remplacer par celui-ci ?',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Changer',
            onPress: () => {
              startProgram(programId);
            },
          },
        ]
      );
    } else {
      startProgram(programId);
    }
  };

  const handleContinueProgram = () => {
    if (user.settings.hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const dayData = program.days.find((d) => d.day === currentDay);
    if (dayData && dayData.sessions.length > 0) {
      const exerciseIds = dayData.sessions[0].exercises.map((e) => e.exerciseId);
      navigation.navigate('SessionPlayer', {
        programId,
        day: currentDay,
        exerciseIds,
      });
    }
  };

  const handleDayPress = (day: number) => {
    if (expandedDay === day) {
      setExpandedDay(null);
    } else {
      setExpandedDay(day);
    }
  };

  const getDayStatus = (day: number): 'completed' | 'current' | 'upcoming' | 'locked' => {
    if (!isCurrentProgram) return day === 1 ? 'upcoming' : 'locked';
    if (completedDays.includes(day)) return 'completed';
    if (day === currentDay) return 'current';
    if (day < currentDay) return 'upcoming'; // Skipped days can still be done
    return 'locked';
  };

  const canStartDay = (day: number): boolean => {
    if (!isCurrentProgram) return false;
    return day <= currentDay || completedDays.includes(day - 1);
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
          {isCurrentProgram && (
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>En cours</Text>
            </View>
          )}
          {isCompleted && (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={18} color={colors.accent.green} />
              <Text style={styles.completedBadgeText}>Terminé</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Resume Banner - Shows prominently when program is in progress */}
        {isCurrentProgram && !isCompleted && (
          <TouchableOpacity
            style={styles.resumeBanner}
            onPress={handleContinueProgram}
            activeOpacity={0.8}
          >
            <View style={styles.resumeBannerContent}>
              <View style={styles.resumeBannerLeft}>
                <View style={styles.resumeIconContainer}>
                  <Ionicons name="play-circle" size={32} color={colors.background.primary} />
                </View>
                <View style={styles.resumeTextContainer}>
                  <Text style={styles.resumeTitle}>Reprendre votre progression</Text>
                  <Text style={styles.resumeSubtitle}>
                    Jour {currentDay} sur {program.duration} · {program.days[currentDay - 1]?.title}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.background.primary} />
            </View>
            <View style={styles.resumeProgressBar}>
              <View style={[styles.resumeProgressFill, { width: `${progress * 100}%` }]} />
            </View>
          </TouchableOpacity>
        )}

        {/* Program Header Card */}
        <Card variant="elevated" padding="large" style={styles.programCard}>
          <View style={styles.programHeader}>
            <View style={styles.programInfo}>
              <Text style={styles.programName}>{program.name}</Text>

              <View style={styles.programMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={16} color={colors.text.secondary} />
                  <Text style={styles.metaText}>{program.duration} jours</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={16} color={colors.text.secondary} />
                  <Text style={styles.metaText}>{program.dailyDuration} min/jour</Text>
                </View>
              </View>

              <View
                style={[
                  styles.difficultyBadge,
                  { backgroundColor: difficultyColors[program.difficulty] + '20' },
                ]}
              >
                <Text
                  style={[
                    styles.difficultyText,
                    { color: difficultyColors[program.difficulty] },
                  ]}
                >
                  {difficultyLabels[program.difficulty]}
                </Text>
              </View>
            </View>

            <ProgressCircle
              progress={progress}
              size={80}
              strokeWidth={8}
              color={colors.accent.green}
            />
          </View>

          {isCurrentProgram && (
            <View style={styles.currentProgress}>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${progress * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {completedDays.length} jour{completedDays.length > 1 ? 's' : ''} complété
                {completedDays.length > 1 ? 's' : ''} sur {program.duration}
              </Text>
            </View>
          )}
        </Card>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{program.description}</Text>
        </View>

        {/* Objective */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Objectif</Text>
          <Card variant="outlined" padding="medium" style={styles.objectiveCard}>
            <Ionicons name="flag" size={24} color={colors.accent.green} />
            <Text style={styles.objectiveText}>{program.objective}</Text>
          </Card>
        </View>

        {/* Target Audience */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pour qui ?</Text>
          <Text style={styles.audienceText}>{program.targetAudience}</Text>
        </View>

        {/* Zones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Zones travaillées</Text>
          <View style={styles.zonesRow}>
            {program.zones.map((zone) => (
              <View key={zone} style={styles.zoneBadge}>
                <Text style={styles.zoneBadgeText}>{zoneLabels[zone]}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Benefits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bénéfices attendus</Text>
          {program.benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={18} color={colors.accent.green} />
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>

        {/* Days List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Programme détaillé</Text>
          {program.days.map((day) => {
            const status = getDayStatus(day.day);
            const isExpanded = expandedDay === day.day;

            return (
              <Card
                key={day.day}
                variant="default"
                padding="none"
                style={[
                  styles.dayCard,
                  status === 'current' && styles.dayCardCurrent,
                  status === 'completed' && styles.dayCardCompleted,
                ]}
              >
                <TouchableOpacity
                  style={styles.dayHeader}
                  onPress={() => handleDayPress(day.day)}
                  disabled={status === 'locked'}
                >
                  <View style={styles.dayHeaderLeft}>
                    <View
                      style={[
                        styles.dayNumber,
                        status === 'completed' && styles.dayNumberCompleted,
                        status === 'current' && styles.dayNumberCurrent,
                        status === 'locked' && styles.dayNumberLocked,
                      ]}
                    >
                      {status === 'completed' ? (
                        <Ionicons name="checkmark" size={16} color={colors.background.primary} />
                      ) : status === 'locked' ? (
                        <Ionicons name="lock-closed" size={14} color={colors.text.muted} />
                      ) : (
                        <Text
                          style={[
                            styles.dayNumberText,
                            status === 'current' && styles.dayNumberTextCurrent,
                          ]}
                        >
                          {day.day}
                        </Text>
                      )}
                    </View>
                    <View style={styles.dayInfo}>
                      <Text
                        style={[
                          styles.dayTitle,
                          status === 'locked' && styles.dayTitleLocked,
                        ]}
                      >
                        {day.title}
                      </Text>
                      {day.sessions.length > 0 && (
                        <Text style={styles.dayMeta}>
                          {day.sessions[0].exercises.length} exercices · {day.sessions[0].totalDuration} min
                        </Text>
                      )}
                    </View>
                  </View>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={status === 'locked' ? colors.text.muted : colors.text.secondary}
                  />
                </TouchableOpacity>

                {isExpanded && status !== 'locked' && (
                  <View style={styles.dayContent}>
                    {day.description && (
                      <Text style={styles.dayDescription}>{day.description}</Text>
                    )}

                    {day.sessions.map((session) => (
                      <View key={session.id} style={styles.sessionContent}>
                        <Text style={styles.sessionTitle}>{session.title}</Text>
                        <View style={styles.exercisesList}>
                          {session.exercises.map((se, index) => {
                            const exercise = getExerciseById(se.exerciseId);
                            return (
                              <View key={index} style={styles.exerciseItem}>
                                <View style={styles.exerciseItemNumber}>
                                  <Text style={styles.exerciseItemNumberText}>
                                    {index + 1}
                                  </Text>
                                </View>
                                <Text style={styles.exerciseItemName}>
                                  {exercise?.name || 'Exercice'}
                                </Text>
                              </View>
                            );
                          })}
                        </View>
                      </View>
                    ))}

                    {canStartDay(day.day) && (
                      <Button
                        title={completedDays.includes(day.day) ? 'Refaire ce jour' : 'Commencer'}
                        onPress={() => {
                          const exerciseIds = day.sessions[0]?.exercises.map((e) => e.exerciseId) || [];
                          navigation.navigate('SessionPlayer', {
                            programId,
                            day: day.day,
                            exerciseIds,
                          });
                        }}
                        variant={completedDays.includes(day.day) ? 'secondary' : 'primary'}
                        size="small"
                        style={styles.startDayButton}
                      />
                    )}
                  </View>
                )}
              </Card>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer CTA */}
      <View style={styles.footer}>
        {!isCurrentProgram && !isCompleted ? (
          <Button
            title="Commencer ce programme"
            onPress={handleStartProgram}
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
        ) : isCurrentProgram ? (
          <Button
            title={`Continuer - Jour ${currentDay}`}
            onPress={handleContinueProgram}
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
        ) : (
          <Button
            title="Recommencer ce programme"
            onPress={handleStartProgram}
            fullWidth
            variant="secondary"
            icon={
              <Ionicons
                name="refresh"
                size={20}
                color={colors.text.primary}
                style={{ marginRight: spacing.sm }}
              />
            }
          />
        )}
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
  activeBadge: {
    backgroundColor: colors.accent.green + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  activeBadgeText: {
    ...typography.labelSmall,
    color: colors.accent.green,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent.green + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  completedBadgeText: {
    ...typography.labelSmall,
    color: colors.accent.green,
    marginLeft: spacing.xs,
  },
  // Content
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.huge,
  },
  // Program Card
  programCard: {
    marginBottom: spacing.xl,
  },
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  programInfo: {
    flex: 1,
    marginRight: spacing.lg,
  },
  programName: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  programMeta: {
    flexDirection: 'row',
    marginBottom: spacing.md,
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
  difficultyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  difficultyText: {
    ...typography.labelSmall,
    fontWeight: '500',
  },
  currentProgress: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.background.elevated,
    borderRadius: 4,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.accent.green,
    borderRadius: 4,
  },
  progressText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  // Sections
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  descriptionText: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  // Objective Card
  objectiveCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.accent.green + '05',
    borderColor: colors.accent.green + '20',
  },
  objectiveText: {
    ...typography.body,
    color: colors.text.secondary,
    marginLeft: spacing.md,
    flex: 1,
  },
  // Audience
  audienceText: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  // Zones
  zonesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  zoneBadge: {
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  zoneBadgeText: {
    ...typography.labelSmall,
    color: colors.text.secondary,
  },
  // Benefits
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
  // Day Cards
  dayCard: {
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  dayCardCurrent: {
    borderWidth: 1,
    borderColor: colors.accent.green,
  },
  dayCardCompleted: {
    opacity: 0.8,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  dayHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dayNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  dayNumberCompleted: {
    backgroundColor: colors.accent.green,
  },
  dayNumberCurrent: {
    backgroundColor: colors.accent.green + '20',
    borderWidth: 2,
    borderColor: colors.accent.green,
  },
  dayNumberLocked: {
    backgroundColor: colors.background.elevated,
  },
  dayNumberText: {
    ...typography.label,
    color: colors.text.secondary,
  },
  dayNumberTextCurrent: {
    color: colors.accent.green,
  },
  dayInfo: {
    flex: 1,
  },
  dayTitle: {
    ...typography.label,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  dayTitleLocked: {
    color: colors.text.muted,
  },
  dayMeta: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  // Day Content (expanded)
  dayContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  dayDescription: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  sessionContent: {
    marginTop: spacing.md,
  },
  sessionTitle: {
    ...typography.label,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  exercisesList: {},
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  exerciseItemNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  exerciseItemNumberText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  exerciseItemName: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
  },
  startDayButton: {
    marginTop: spacing.lg,
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
  errorText: {
    ...typography.body,
    color: colors.text.muted,
    marginVertical: spacing.lg,
  },
  // Resume Banner
  resumeBanner: {
    backgroundColor: colors.accent.green,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xl,
    overflow: 'hidden',
  },
  resumeBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  resumeBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  resumeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  resumeTextContainer: {
    flex: 1,
  },
  resumeTitle: {
    ...typography.label,
    color: colors.background.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  resumeSubtitle: {
    ...typography.bodySmall,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  resumeProgressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  resumeProgressFill: {
    height: '100%',
    backgroundColor: colors.background.primary,
  },
});

export default ProgramDetailScreen;
