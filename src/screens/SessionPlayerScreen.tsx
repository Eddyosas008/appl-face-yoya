import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, typography } from '../theme';
import { Button, Card, BreathingCircle } from '../components';
import { useStore } from '../store/useStore';
import { exercises, getExerciseById } from '../data/exercises';
import { programs } from '../data/programs';
import { Exercise, ExerciseStep, FaceFeelRating, RootStackNavigationProp, RootStackRouteProp } from '../types';

const { width, height } = Dimensions.get('window');

interface SessionPlayerScreenProps {
  navigation: RootStackNavigationProp;
  route: RootStackRouteProp<'SessionPlayer'>;
}

type SessionState = 'intro' | 'exercise' | 'rest' | 'completed';

export const SessionPlayerScreen: React.FC<SessionPlayerScreenProps> = ({
  navigation,
  route,
}) => {
  const { programId, day, exerciseIds } = route.params ?? {};
  const {
    user,
    completeSession,
    updateProgramProgress,
    incrementStreak,
    checkAndAwardBadges,
  } = useStore();

  // Get exercises for this session
  const sessionExercises = React.useMemo(() => {
    if (exerciseIds && exerciseIds.length > 0) {
      return exerciseIds
        .map((id) => getExerciseById(id))
        .filter(Boolean) as Exercise[];
    }

    // If from a program, get exercises for that day
    if (programId && day) {
      const program = programs.find((p) => p.id === programId);
      if (program) {
        const dayData = program.days.find((d) => d.day === day);
        if (dayData && dayData.sessions.length > 0) {
          return dayData.sessions[0].exercises
            .map((se) => getExerciseById(se.exerciseId))
            .filter(Boolean) as Exercise[];
        }
      }
    }

    // Default exercises
    return exercises.slice(0, 4);
  }, [programId, day, exerciseIds]);

  // State
  const [sessionState, setSessionState] = useState<SessionState>('intro');
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [sessionStartTime] = useState(Date.now());
  const [selectedFeeling, setSelectedFeeling] = useState<FaceFeelRating | null>(null);
  const [restCountdown, setRestCountdown] = useState(5);

  // Animation refs
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const restTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleStepCompleteRef = useRef<() => void>(() => undefined);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (restTimeoutRef.current) {
        clearTimeout(restTimeoutRef.current);
      }
    };
  }, []);

  // Get breathing phase from current step
  const getBreathingPhase = (): 'inhale' | 'hold' | 'exhale' | 'rest' => {
    if (!currentStep?.breathingCue) return 'rest';
    return currentStep.breathingCue;
  };

  const currentExercise = sessionExercises[currentExerciseIndex];
  const currentStep = currentExercise?.steps[currentStepIndex];
  const totalDuration = sessionExercises.reduce((sum, ex) => sum + ex.duration, 0);

  useEffect(() => {
    if (sessionState !== 'exercise' || isPaused || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Defer to next tick to avoid state update during render
          setTimeout(() => handleStepCompleteRef.current(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionState, isPaused, timeRemaining]);

  // Progress animation
  useEffect(() => {
    if (currentStep?.duration && currentStep.duration > 0) {
      const progress = 1 - timeRemaining / currentStep.duration;
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 100,
        useNativeDriver: false,
      }).start();
    }
  }, [timeRemaining, currentStep]);

  // Rest countdown timer
  useEffect(() => {
    if (sessionState !== 'rest') return;

    setRestCountdown(5);
    const timer = setInterval(() => {
      setRestCountdown((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionState]);

  const handleStepComplete = useCallback(() => {
    if (user.settings.hapticEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Check if there are more steps
    if (currentStepIndex < currentExercise.steps.length - 1) {
      // Next step
      fadeTransition(() => {
        setCurrentStepIndex((prev) => prev + 1);
        const nextStep = currentExercise.steps[currentStepIndex + 1];
        setTimeRemaining(nextStep.duration || 5);
      });
    } else {
      // Exercise complete
      setCompletedExercises((prev) => [...prev, currentExercise.id]);

      if (currentExerciseIndex < sessionExercises.length - 1) {
        // Show rest screen then next exercise
        setSessionState('rest');
        restTimeoutRef.current = setTimeout(() => {
          fadeTransition(() => {
            setCurrentExerciseIndex((prev) => prev + 1);
            setCurrentStepIndex(0);
            setSessionState('exercise');
            const nextExercise = sessionExercises[currentExerciseIndex + 1];
            setTimeRemaining(nextExercise.steps[0].duration || 5);
          });
        }, 5000); // 5 second rest
      } else {
        // Session complete
        handleSessionComplete();
      }
    }
  }, [currentStepIndex, currentExercise, currentExerciseIndex, sessionExercises]);

  handleStepCompleteRef.current = handleStepComplete;

  const fadeTransition = (callback: () => void) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(callback, 200);
  };

  const handleSessionComplete = () => {
    setSessionState('completed');

    if (user.settings.hapticEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Calculate session duration
    const sessionDuration = Math.round((Date.now() - sessionStartTime) / 60000);

    // Save session
    completeSession({
      date: new Date().toISOString(),
      programId,
      programDay: day,
      exercises: completedExercises.map((id) => ({
        exerciseId: id,
        completedAt: new Date().toISOString(),
        duration: getExerciseById(id)?.duration || 0,
        skipped: false,
      })),
      totalDuration: sessionDuration,
    });

    // Update program progress if applicable
    if (programId && day) {
      updateProgramProgress(day);
    }

    // Increment streak
    incrementStreak();

    // Check for new badges
    checkAndAwardBadges();
  };

  const startSession = () => {
    setSessionState('exercise');
    setTimeRemaining(currentExercise.steps[0].duration || 5);

    if (user.settings.hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);

    if (user.settings.hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const skipExercise = () => {
    if (currentExerciseIndex < sessionExercises.length - 1) {
      fadeTransition(() => {
        setCurrentExerciseIndex((prev) => prev + 1);
        setCurrentStepIndex(0);
        const nextExercise = sessionExercises[currentExerciseIndex + 1];
        setTimeRemaining(nextExercise.steps[0].duration || 5);
      });
    } else {
      handleSessionComplete();
    }
  };

  const exitSession = () => {
    Alert.alert(
      'Quitter la séance ?',
      'Votre progression sera perdue.',
      [
        { text: 'Continuer', style: 'cancel' },
        {
          text: 'Quitter',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  };

  const getBreathingText = (): string => {
    switch (currentStep?.breathingCue) {
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

  // Render intro screen
  const renderIntro = () => (
    <View style={styles.introContainer}>
      <View style={styles.introHeader}>
        <TouchableOpacity style={styles.closeButton} onPress={exitSession}>
          <Ionicons name="close" size={28} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.introContent}>
        <View style={styles.introIconContainer}>
          <Ionicons name="leaf" size={64} color={colors.accent.green} />
        </View>

        <Text style={styles.introTitle}>Prêt(e) pour votre séance ?</Text>
        <Text style={styles.introSubtitle}>
          {sessionExercises.length} exercices · {Math.ceil(totalDuration / 60)} minutes
        </Text>

        <View style={styles.exercisePreviewList}>
          {sessionExercises.slice(0, 4).map((exercise, index) => (
            <View key={exercise.id} style={styles.exercisePreviewItem}>
              <View style={styles.exercisePreviewNumber}>
                <Text style={styles.exercisePreviewNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.exercisePreviewName}>{exercise.name}</Text>
            </View>
          ))}
          {sessionExercises.length > 4 && (
            <Text style={styles.moreExercisesText}>
              +{sessionExercises.length - 4} autres exercices
            </Text>
          )}
        </View>

        <View style={styles.tipBox}>
          <Ionicons name="information-circle" size={20} color={colors.accent.teal} />
          <Text style={styles.tipText}>
            Installez-vous confortablement, de préférence devant un miroir.
          </Text>
        </View>
      </View>

      <View style={styles.introFooter}>
        <Button
          title="Commencer"
          onPress={startSession}
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
    </View>
  );

  // Render exercise screen
  const renderExercise = () => (
    <Animated.View style={[styles.exerciseContainer, { opacity: fadeAnim }]}>
      {/* Header */}
      <View style={styles.exerciseHeader}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={exitSession}
          accessibilityRole="button"
          accessibilityLabel="Quitter la séance"
        >
          <Ionicons name="close" size={28} color={colors.text.primary} />
        </TouchableOpacity>

        <View
          style={styles.progressIndicator}
          accessible
          accessibilityLabel={`Exercice ${currentExerciseIndex + 1} sur ${sessionExercises.length}`}
        >
          <Text style={styles.progressText}>
            {currentExerciseIndex + 1} / {sessionExercises.length}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={skipExercise}
          accessibilityRole="button"
          accessibilityLabel="Passer cet exercice"
        >
          <Ionicons name="play-skip-forward" size={24} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          {sessionExercises.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressSegment,
                index < currentExerciseIndex && styles.progressSegmentComplete,
                index === currentExerciseIndex && styles.progressSegmentCurrent,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Main content */}
      <ScrollView
        style={styles.exerciseContent}
        contentContainerStyle={styles.exerciseContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Exercise name */}
        <Text style={styles.exerciseName}>{currentExercise.name}</Text>
        <View style={styles.exerciseZoneBadge}>
          <Text style={styles.exerciseZoneText}>
            {currentExercise.zone.charAt(0).toUpperCase() + currentExercise.zone.slice(1)}
          </Text>
        </View>

        {/* Timer circle */}
        <View
          style={styles.timerContainer}
          accessible
          accessibilityRole="timer"
          accessibilityLabel={`${formatTime(timeRemaining)} restantes${currentStep?.breathingCue ? `, ${getBreathingText()}` : ''}`}
          accessibilityLiveRegion="polite"
        >
          <View style={styles.timerCircle}>
            <Animated.View
              style={[
                styles.timerProgress,
                {
                  transform: [
                    {
                      rotate: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      }),
                    },
                  ],
                },
              ]}
            />
            <View style={styles.timerInner}>
              <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
              {currentStep?.breathingCue && (
                <Text style={styles.breathingText}>{getBreathingText()}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Current step */}
        <Card variant="elevated" padding="large" style={styles.stepCard}>
          <View style={styles.stepHeader}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>
                {currentStepIndex + 1}
              </Text>
            </View>
            <Text style={styles.stepLabel}>
              Étape {currentStepIndex + 1} sur {currentExercise.steps.length}
            </Text>
          </View>
          <Text style={styles.stepInstruction}>{currentStep?.instruction}</Text>
        </Card>

        {/* Exercise visualization placeholder */}
        <View style={styles.visualizationContainer}>
          <View style={styles.visualizationPlaceholder}>
            <Ionicons name="person" size={80} color={colors.text.muted} />
            <Text style={styles.visualizationText}>Zone : {currentExercise.zone}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Controls */}
      <View style={styles.controlsContainer} accessibilityRole="toolbar">
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => {
            if (currentStepIndex > 0) {
              setCurrentStepIndex((prev) => prev - 1);
              const prevStep = currentExercise.steps[currentStepIndex - 1];
              setTimeRemaining(prevStep.duration || 5);
            }
          }}
          accessibilityRole="button"
          accessibilityLabel="Étape précédente"
          disabled={currentStepIndex === 0}
          accessibilityState={{ disabled: currentStepIndex === 0 }}
        >
          <Ionicons name="play-back" size={28} color={colors.text.secondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.pauseButton]}
          onPress={togglePause}
          accessibilityRole="button"
          accessibilityLabel={isPaused ? 'Reprendre' : 'Pause'}
        >
          <Ionicons
            name={isPaused ? 'play' : 'pause'}
            size={36}
            color={colors.background.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => {
            if (currentStepIndex < currentExercise.steps.length - 1) {
              setCurrentStepIndex((prev) => prev + 1);
              const nextStep = currentExercise.steps[currentStepIndex + 1];
              setTimeRemaining(nextStep.duration || 5);
            } else {
              handleStepComplete();
            }
          }}
          accessibilityRole="button"
          accessibilityLabel="Étape suivante"
        >
          <Ionicons name="play-forward" size={28} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  // Render rest screen
  const renderRest = () => (
    <View style={styles.restContainer}>
      <View style={styles.restContent}>
        <BreathingCircle
          phase="exhale"
          size={140}
          isActive={true}
          showLabel={false}
          color={colors.accent.teal}
        />
        <Text style={styles.restTitle}>Respirez profondément</Text>
        <View style={styles.restCountdownContainer}>
          <Text style={styles.restCountdownNumber}>{restCountdown}</Text>
          <Text style={styles.restCountdownLabel}>secondes</Text>
        </View>

        <View style={styles.nextExercisePreview}>
          <Text style={styles.nextExerciseLabel}>Exercice suivant</Text>
          <Text style={styles.nextExerciseName}>
            {sessionExercises[currentExerciseIndex + 1]?.name || 'Terminé'}
          </Text>
        </View>
      </View>
    </View>
  );

  // Render completed screen
  const renderCompleted = () => {
    const sessionDuration = Math.round((Date.now() - sessionStartTime) / 60000);

    return (
      <View style={styles.completedContainer}>
        <View style={styles.completedContent}>
          <View style={styles.completedIcon}>
            <Ionicons name="checkmark-circle" size={80} color={colors.accent.green} />
          </View>

          <Text style={styles.completedTitle}>Bravo !</Text>
          <Text style={styles.completedSubtitle}>
            Vous avez terminé votre séance de face yoga
          </Text>

          <View style={styles.completedStats}>
            <View style={styles.completedStatItem}>
              <Ionicons name="time" size={24} color={colors.accent.teal} />
              <Text style={styles.completedStatValue}>{sessionDuration} min</Text>
              <Text style={styles.completedStatLabel}>Durée</Text>
            </View>

            <View style={styles.completedStatItem}>
              <Ionicons name="fitness" size={24} color={colors.accent.green} />
              <Text style={styles.completedStatValue}>{completedExercises.length}</Text>
              <Text style={styles.completedStatLabel}>Exercices</Text>
            </View>

            <View style={styles.completedStatItem}>
              <Ionicons name="flame" size={24} color={colors.accent.gold} />
              <Text style={styles.completedStatValue}>{user.progress.currentStreak + 1}</Text>
              <Text style={styles.completedStatLabel}>Streak</Text>
            </View>
          </View>

          {/* How do you feel */}
          <View style={styles.feelingSection}>
            <Text style={styles.feelingTitle}>Comment se sent votre visage ?</Text>
            <View style={styles.feelingsRow}>
              {[
                { id: 'tendu' as FaceFeelRating, emoji: '😣', label: 'Tendu' },
                { id: 'normal' as FaceFeelRating, emoji: '😐', label: 'Normal' },
                { id: 'detendu' as FaceFeelRating, emoji: '😌', label: 'Détendu' },
                { id: 'revitalise' as FaceFeelRating, emoji: '✨', label: 'Revitalisé' },
              ].map((feeling) => (
                <TouchableOpacity
                  key={feeling.id}
                  style={[
                    styles.feelingButton,
                    selectedFeeling === feeling.id && styles.feelingButtonSelected,
                  ]}
                  accessibilityRole="radio"
                  accessibilityLabel={feeling.label}
                  accessibilityState={{ selected: selectedFeeling === feeling.id }}
                  onPress={() => {
                    if (user.settings.hapticEnabled) {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    setSelectedFeeling(feeling.id);
                    // Save feeling to daily entry
                    const today = new Date().toISOString().split('T')[0];
                    useStore.getState().updateDailyEntry({
                      date: today,
                      eveningFeel: feeling.id,
                      sessionCompleted: true,
                    });
                  }}
                >
                  <Text style={styles.feelingEmoji}>{feeling.emoji}</Text>
                  <Text style={[
                    styles.feelingLabel,
                    selectedFeeling === feeling.id && styles.feelingLabelSelected,
                  ]}>{feeling.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Text style={styles.motivationQuote}>
            "Chaque séance est un pas vers votre bien-être. À demain !"
          </Text>
        </View>

        <View style={styles.completedFooter}>
          <Button
            title="Terminer"
            onPress={() => navigation.goBack()}
            fullWidth
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {sessionState === 'intro' && renderIntro()}
      {sessionState === 'exercise' && renderExercise()}
      {sessionState === 'rest' && renderRest()}
      {sessionState === 'completed' && renderCompleted()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  // Intro
  introContainer: {
    flex: 1,
  },
  introHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  closeButton: {
    padding: spacing.sm,
  },
  introContent: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  introIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.accent.green + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  introTitle: {
    ...typography.h2,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  introSubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  exercisePreviewList: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  exercisePreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  exercisePreviewNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.background.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  exercisePreviewNumberText: {
    ...typography.label,
    color: colors.text.secondary,
  },
  exercisePreviewName: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
  },
  moreExercisesText: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.accent.teal + '10',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    width: '100%',
  },
  tipText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  introFooter: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  // Exercise
  exerciseContainer: {
    flex: 1,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  progressIndicator: {
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  progressText: {
    ...typography.label,
    color: colors.text.primary,
  },
  skipButton: {
    padding: spacing.sm,
  },
  progressBarContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  progressBarBackground: {
    flexDirection: 'row',
    height: 4,
    backgroundColor: colors.background.elevated,
    borderRadius: 2,
  },
  progressSegment: {
    flex: 1,
    height: '100%',
    backgroundColor: colors.background.elevated,
    marginHorizontal: 1,
    borderRadius: 2,
  },
  progressSegmentComplete: {
    backgroundColor: colors.accent.green,
  },
  progressSegmentCurrent: {
    backgroundColor: colors.accent.green + '50',
  },
  exerciseContent: {
    flex: 1,
  },
  exerciseContentContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  exerciseName: {
    ...typography.h3,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  exerciseZoneBadge: {
    backgroundColor: colors.accent.green + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginBottom: spacing.xl,
  },
  exerciseZoneText: {
    ...typography.labelSmall,
    color: colors.accent.green,
  },
  timerContainer: {
    marginBottom: spacing.xl,
  },
  timerCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 6,
    borderColor: colors.accent.green,
  },
  timerProgress: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  timerInner: {
    alignItems: 'center',
  },
  timerText: {
    ...typography.h1,
    color: colors.text.primary,
    fontSize: 48,
  },
  breathingText: {
    ...typography.label,
    color: colors.accent.teal,
    marginTop: spacing.xs,
  },
  stepCard: {
    width: '100%',
    marginBottom: spacing.xl,
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
  stepLabel: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  stepInstruction: {
    ...typography.bodyLarge,
    color: colors.text.primary,
    lineHeight: 26,
  },
  visualizationContainer: {
    width: '100%',
    aspectRatio: 1.5,
    marginBottom: spacing.xl,
  },
  visualizationPlaceholder: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  visualizationText: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: spacing.md,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xxl,
    backgroundColor: colors.background.secondary,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing.md,
  },
  pauseButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accent.green,
    marginHorizontal: spacing.lg,
  },
  // Rest
  restContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  restContent: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  restTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  restCountdownContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  restCountdownNumber: {
    ...typography.h1,
    fontSize: 56,
    color: colors.accent.teal,
  },
  restCountdownLabel: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  nextExercisePreview: {
    backgroundColor: colors.background.tertiary,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  nextExerciseLabel: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  nextExerciseName: {
    ...typography.h4,
    color: colors.text.primary,
  },
  // Completed
  completedContainer: {
    flex: 1,
  },
  completedContent: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedIcon: {
    marginBottom: spacing.xl,
  },
  completedTitle: {
    ...typography.h1,
    color: colors.accent.green,
    marginBottom: spacing.sm,
  },
  completedSubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  completedStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: spacing.xl,
  },
  completedStatItem: {
    alignItems: 'center',
  },
  completedStatValue: {
    ...typography.h3,
    color: colors.text.primary,
    marginTop: spacing.sm,
  },
  completedStatLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  feelingSection: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  feelingTitle: {
    ...typography.label,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  feelingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  feelingButton: {
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  feelingButtonSelected: {
    borderColor: colors.accent.green,
    backgroundColor: colors.accent.green + '20',
  },
  feelingEmoji: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  feelingLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  feelingLabelSelected: {
    color: colors.accent.green,
    fontWeight: '600',
  },
  motivationQuote: {
    ...typography.body,
    color: colors.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  completedFooter: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xxl,
  },
});

export default SessionPlayerScreen;
