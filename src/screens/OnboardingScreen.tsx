import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme';
import { Button, Card } from '../components';
import { useStore } from '../store/useStore';
import { UserGoal, FaceZone, Contraindication } from '../types';

const { width } = Dimensions.get('window');

type OnboardingStepType = 'welcome' | 'goals' | 'zones' | 'duration' | 'health' | 'schedule' | 'ready';

interface OnboardingScreenProps {
  onComplete: () => void;
}

// Données pour les options
const goalOptions: { id: UserGoal; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'reduire_tensions', label: 'Réduire les tensions', icon: 'leaf' },
  { id: 'definir_contours', label: 'Définir les contours', icon: 'scan-outline' },
  { id: 'eclat_peau', label: 'Améliorer l\'éclat', icon: 'sunny' },
  { id: 'detente_globale', label: 'Détente globale', icon: 'happy' },
  { id: 'anti_age_doux', label: 'Anti-âge doux', icon: 'sparkles' },
  { id: 'routine_quotidienne', label: 'Créer une routine', icon: 'calendar' },
];

const zoneOptions: { id: FaceZone; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'front', label: 'Front', icon: 'ellipse-outline' },
  { id: 'yeux', label: 'Contour des yeux', icon: 'eye-outline' },
  { id: 'joues', label: 'Joues', icon: 'happy-outline' },
  { id: 'bouche', label: 'Bouche', icon: 'chatbubble-outline' },
  { id: 'ovale', label: 'Ovale du visage', icon: 'scan-outline' },
  { id: 'cou', label: 'Cou & mâchoire', icon: 'body-outline' },
];

const contraindicationOptions: { id: Contraindication; label: string }[] = [
  { id: 'atm', label: 'Troubles de l\'articulation temporo-mandibulaire (ATM)' },
  { id: 'douleurs_cervicales', label: 'Douleurs cervicales' },
  { id: 'post_chirurgie', label: 'Chirurgie faciale récente' },
  { id: 'injections_recentes', label: 'Injections esthétiques récentes (< 2 semaines)' },
  { id: 'paralysie_faciale', label: 'Paralysie faciale' },
  { id: 'glaucome', label: 'Glaucome' },
  { id: 'hypertension', label: 'Hypertension non contrôlée' },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [step, setStep] = useState<OnboardingStepType>('welcome');
  const [selectedGoals, setSelectedGoals] = useState<UserGoal[]>([]);
  const [selectedZones, setSelectedZones] = useState<FaceZone[]>([]);
  const [selectedDuration, setSelectedDuration] = useState<5 | 10 | 15 | 20>(10);
  const [selectedContraindications, setSelectedContraindications] = useState<Contraindication[]>([]);
  const [reminderTime, setReminderTime] = useState<'matin' | 'midi' | 'soir' | 'flexible'>('matin');

  const { updatePreferences, updateHealthInfo, completeOnboarding } = useStore();

  const steps: OnboardingStepType[] = ['welcome', 'goals', 'zones', 'duration', 'health', 'schedule', 'ready'];
  const currentStepIndex = steps.indexOf(step);
  const progress = (currentStepIndex + 1) / steps.length;

  const goNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setStep(steps[nextIndex]);
    }
  };

  const goBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setStep(steps[prevIndex]);
    }
  };

  const handleComplete = () => {
    // Save all preferences
    updatePreferences({
      primaryGoals: selectedGoals,
      focusZones: selectedZones,
      preferredDuration: selectedDuration,
      preferredTime: reminderTime,
      reminderEnabled: true,
    });

    updateHealthInfo({
      contraindications: selectedContraindications,
    });

    completeOnboarding();
    onComplete();
  };

  const toggleGoal = (goal: UserGoal) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const toggleZone = (zone: FaceZone) => {
    setSelectedZones((prev) =>
      prev.includes(zone) ? prev.filter((z) => z !== zone) : [...prev, zone]
    );
  };

  const toggleContraindication = (c: Contraindication) => {
    setSelectedContraindications((prev) =>
      prev.includes(c) ? prev.filter((item) => item !== c) : [...prev, c]
    );
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.progressText}>
        {currentStepIndex + 1} / {steps.length}
      </Text>
    </View>
  );

  const renderWelcome = () => (
    <View style={styles.stepContainer}>
      <View style={styles.welcomeImagePlaceholder}>
        <Ionicons name="leaf" size={80} color={colors.accent.green} />
      </View>
      <Text style={styles.welcomeTitle}>Face Yoga</Text>
      <Text style={styles.welcomeSubtitle}>
        Votre routine de yoga du visage pour un bien-être naturel
      </Text>
      <Text style={styles.welcomeDescription}>
        Quelques minutes par jour pour prendre soin de votre visage, réduire les tensions et vous sentir bien.
      </Text>
      <View style={styles.disclaimerBox}>
        <Ionicons name="information-circle" size={20} color={colors.accent.teal} />
        <Text style={styles.disclaimerText}>
          Le face yoga est une pratique complémentaire qui ne remplace pas un avis médical.
        </Text>
      </View>
    </View>
  );

  const renderGoals = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Quels sont vos objectifs ?</Text>
      <Text style={styles.stepSubtitle}>
        Sélectionnez un ou plusieurs objectifs pour personnaliser votre expérience
      </Text>
      <View style={styles.optionsGrid}>
        {goalOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionCard,
              selectedGoals.includes(option.id) && styles.optionCardSelected,
            ]}
            onPress={() => toggleGoal(option.id)}
          >
            <Ionicons
              name={option.icon}
              size={28}
              color={
                selectedGoals.includes(option.id)
                  ? colors.accent.green
                  : colors.text.secondary
              }
            />
            <Text
              style={[
                styles.optionLabel,
                selectedGoals.includes(option.id) && styles.optionLabelSelected,
              ]}
            >
              {option.label}
            </Text>
            {selectedGoals.includes(option.id) && (
              <View style={styles.checkmark}>
                <Ionicons name="checkmark" size={16} color={colors.background.primary} />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderZones = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Zones à cibler</Text>
      <Text style={styles.stepSubtitle}>
        Quelles zones souhaitez-vous travailler en priorité ?
      </Text>
      <View style={styles.optionsGrid}>
        {zoneOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionCard,
              selectedZones.includes(option.id) && styles.optionCardSelected,
            ]}
            onPress={() => toggleZone(option.id)}
          >
            <Ionicons
              name={option.icon}
              size={28}
              color={
                selectedZones.includes(option.id)
                  ? colors.accent.green
                  : colors.text.secondary
              }
            />
            <Text
              style={[
                styles.optionLabel,
                selectedZones.includes(option.id) && styles.optionLabelSelected,
              ]}
            >
              {option.label}
            </Text>
            {selectedZones.includes(option.id) && (
              <View style={styles.checkmark}>
                <Ionicons name="checkmark" size={16} color={colors.background.primary} />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderDuration = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Durée idéale</Text>
      <Text style={styles.stepSubtitle}>
        Combien de temps pouvez-vous consacrer chaque jour ?
      </Text>
      <View style={styles.durationOptions}>
        {[5, 10, 15, 20].map((duration) => (
          <TouchableOpacity
            key={duration}
            style={[
              styles.durationCard,
              selectedDuration === duration && styles.durationCardSelected,
            ]}
            onPress={() => setSelectedDuration(duration as 5 | 10 | 15 | 20)}
          >
            <Text
              style={[
                styles.durationNumber,
                selectedDuration === duration && styles.durationNumberSelected,
              ]}
            >
              {duration}
            </Text>
            <Text
              style={[
                styles.durationLabel,
                selectedDuration === duration && styles.durationLabelSelected,
              ]}
            >
              min
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.durationHint}>
        {selectedDuration === 5 && 'Parfait pour une routine express !'}
        {selectedDuration === 10 && 'L\'équilibre idéal entre efficacité et praticité.'}
        {selectedDuration === 15 && 'Une routine complète pour des résultats optimaux.'}
        {selectedDuration === 20 && 'Pour une pratique approfondie et relaxante.'}
      </Text>
    </View>
  );

  const renderHealth = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Santé & Précautions</Text>
      <Text style={styles.stepSubtitle}>
        Avez-vous l'une de ces conditions ? (Sélectionnez si applicable)
      </Text>
      <ScrollView style={styles.healthList} showsVerticalScrollIndicator={false}>
        {contraindicationOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.healthOption,
              selectedContraindications.includes(option.id) && styles.healthOptionSelected,
            ]}
            onPress={() => toggleContraindication(option.id)}
          >
            <View style={styles.healthCheckbox}>
              {selectedContraindications.includes(option.id) && (
                <Ionicons name="checkmark" size={16} color={colors.accent.green} />
              )}
            </View>
            <Text style={styles.healthLabel}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.healthNote}>
        <Ionicons name="shield-checkmark" size={20} color={colors.accent.teal} />
        <Text style={styles.healthNoteText}>
          Ces informations nous permettent d'adapter les exercices et d'exclure ceux qui ne vous conviennent pas.
        </Text>
      </View>
    </View>
  );

  const renderSchedule = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Meilleur moment</Text>
      <Text style={styles.stepSubtitle}>
        Quand préférez-vous pratiquer ?
      </Text>
      <View style={styles.scheduleOptions}>
        {[
          { id: 'matin', label: 'Matin', icon: 'sunny-outline', time: '7h - 10h' },
          { id: 'midi', label: 'Midi', icon: 'partly-sunny-outline', time: '12h - 14h' },
          { id: 'soir', label: 'Soir', icon: 'moon-outline', time: '18h - 21h' },
          { id: 'flexible', label: 'Flexible', icon: 'time-outline', time: 'Pas de préférence' },
        ].map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.scheduleCard,
              reminderTime === option.id && styles.scheduleCardSelected,
            ]}
            onPress={() => setReminderTime(option.id as typeof reminderTime)}
          >
            <Ionicons
              name={option.icon as keyof typeof Ionicons.glyphMap}
              size={32}
              color={
                reminderTime === option.id
                  ? colors.accent.green
                  : colors.text.secondary
              }
            />
            <Text
              style={[
                styles.scheduleLabel,
                reminderTime === option.id && styles.scheduleLabelSelected,
              ]}
            >
              {option.label}
            </Text>
            <Text style={styles.scheduleTime}>{option.time}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderReady = () => (
    <View style={styles.stepContainer}>
      <View style={styles.readyIcon}>
        <Ionicons name="checkmark-circle" size={80} color={colors.accent.green} />
      </View>
      <Text style={styles.stepTitle}>Tout est prêt !</Text>
      <Text style={styles.stepSubtitle}>
        Votre programme personnalisé vous attend
      </Text>
      <View style={styles.summaryBox}>
        <View style={styles.summaryRow}>
          <Ionicons name="flag" size={20} color={colors.accent.green} />
          <Text style={styles.summaryLabel}>Objectifs :</Text>
          <Text style={styles.summaryValue}>{selectedGoals.length} sélectionné(s)</Text>
        </View>
        <View style={styles.summaryRow}>
          <Ionicons name="body" size={20} color={colors.accent.green} />
          <Text style={styles.summaryLabel}>Zones :</Text>
          <Text style={styles.summaryValue}>{selectedZones.length} zone(s)</Text>
        </View>
        <View style={styles.summaryRow}>
          <Ionicons name="time" size={20} color={colors.accent.green} />
          <Text style={styles.summaryLabel}>Durée :</Text>
          <Text style={styles.summaryValue}>{selectedDuration} min/jour</Text>
        </View>
      </View>
    </View>
  );

  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return renderWelcome();
      case 'goals':
        return renderGoals();
      case 'zones':
        return renderZones();
      case 'duration':
        return renderDuration();
      case 'health':
        return renderHealth();
      case 'schedule':
        return renderSchedule();
      case 'ready':
        return renderReady();
      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (step) {
      case 'goals':
        return selectedGoals.length > 0;
      case 'zones':
        return selectedZones.length > 0;
      default:
        return true;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {step !== 'welcome' && (
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          {renderProgressBar()}
        </View>
      )}

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderStep()}
      </ScrollView>

      <View style={styles.footer}>
        {step === 'ready' ? (
          <Button
            title="Commencer mon programme"
            onPress={handleComplete}
            fullWidth
            icon={<Ionicons name="arrow-forward" size={20} color={colors.background.primary} style={{ marginRight: spacing.sm }} />}
          />
        ) : (
          <Button
            title={step === 'welcome' ? 'Commencer' : 'Continuer'}
            onPress={goNext}
            fullWidth
            disabled={!canProceed()}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    marginRight: spacing.md,
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.background.elevated,
    borderRadius: 2,
    marginRight: spacing.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent.green,
    borderRadius: 2,
  },
  progressText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  stepContainer: {
    flex: 1,
  },
  // Welcome styles
  welcomeImagePlaceholder: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.background.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: spacing.huge,
    marginBottom: spacing.xxl,
  },
  welcomeTitle: {
    ...typography.h1,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  welcomeSubtitle: {
    ...typography.bodyLarge,
    color: colors.accent.green,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  welcomeDescription: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.accent.teal + '10',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
  },
  disclaimerText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    flex: 1,
    marginLeft: spacing.sm,
  },
  // Step styles
  stepTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  stepSubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  // Options grid
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.sm,
  },
  optionCard: {
    width: (width - spacing.xl * 2 - spacing.md * 2) / 2,
    margin: spacing.sm,
    padding: spacing.lg,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    borderColor: colors.accent.green,
    backgroundColor: colors.accent.green + '10',
  },
  optionLabel: {
    ...typography.label,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  optionLabelSelected: {
    color: colors.text.primary,
  },
  checkmark: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accent.green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Duration styles
  durationOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  durationCard: {
    width: (width - spacing.xl * 2 - spacing.md * 3) / 4,
    aspectRatio: 1,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  durationCardSelected: {
    borderColor: colors.accent.green,
    backgroundColor: colors.accent.green + '10',
  },
  durationNumber: {
    ...typography.h2,
    color: colors.text.secondary,
  },
  durationNumberSelected: {
    color: colors.accent.green,
  },
  durationLabel: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  durationLabelSelected: {
    color: colors.accent.green,
  },
  durationHint: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  // Health styles
  healthList: {
    maxHeight: 300,
  },
  healthOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  healthOptionSelected: {
    backgroundColor: colors.accent.green + '10',
    borderWidth: 1,
    borderColor: colors.accent.green,
  },
  healthCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border.medium,
    marginRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  healthLabel: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
  },
  healthNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.accent.teal + '10',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginTop: spacing.lg,
  },
  healthNoteText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    flex: 1,
    marginLeft: spacing.sm,
  },
  // Schedule styles
  scheduleOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.sm,
  },
  scheduleCard: {
    width: (width - spacing.xl * 2 - spacing.md * 2) / 2,
    margin: spacing.sm,
    padding: spacing.lg,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  scheduleCardSelected: {
    borderColor: colors.accent.green,
    backgroundColor: colors.accent.green + '10',
  },
  scheduleLabel: {
    ...typography.label,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  scheduleLabelSelected: {
    color: colors.text.primary,
  },
  scheduleTime: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  // Ready styles
  readyIcon: {
    alignItems: 'center',
    marginTop: spacing.huge,
    marginBottom: spacing.xl,
  },
  summaryBox: {
    backgroundColor: colors.background.tertiary,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    marginTop: spacing.xl,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  summaryLabel: {
    ...typography.body,
    color: colors.text.secondary,
    marginLeft: spacing.md,
    flex: 1,
  },
  summaryValue: {
    ...typography.label,
    color: colors.text.primary,
  },
  // Footer
  footer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xxl,
  },
});

export default OnboardingScreen;
