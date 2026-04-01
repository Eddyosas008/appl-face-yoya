import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useUser } from '@/lib/user-context';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/hooks/use-auth';
import type { UserProfile } from '@/shared/wellness-types';

type OnboardingData = Partial<UserProfile>;

const STEPS = [
  {
    id: 'name',
    title: 'Comment vous appelez-vous ?',
    subtitle: 'Nous personnaliserons votre expérience.',
    type: 'text',
    field: 'firstName',
    placeholder: 'Votre prénom',
  },
  {
    id: 'age',
    title: 'Votre tranche d\'âge ?',
    subtitle: 'Pour adapter les contenus à votre profil.',
    type: 'choice',
    field: 'ageRange',
    options: [
      { value: '18-24', label: '18 – 24 ans' },
      { value: '25-30', label: '25 – 30 ans' },
      { value: '31-35', label: '31 – 35 ans' },
      { value: '36-40', label: '36 – 40 ans' },
      { value: '40+', label: 'Plus de 40 ans' },
    ],
  },
  {
    id: 'goal',
    title: 'Votre objectif principal ?',
    subtitle: 'Nous construirons votre parcours autour de cela.',
    type: 'choice',
    field: 'mainGoal',
    options: [
      { value: 'sleep', label: '🌙 Mieux dormir' },
      { value: 'stress_relief', label: '🌿 Réduire le stress' },
      { value: 'emotional_balance', label: '💜 Équilibre émotionnel' },
      { value: 'confidence', label: '✨ Confiance en soi' },
      { value: 'focus', label: '🎯 Améliorer la concentration' },
      { value: 'recovery', label: '🌸 Récupération émotionnelle' },
    ],
  },
  {
    id: 'level',
    title: 'Votre expérience en méditation ?',
    subtitle: 'Pas de bonne ou mauvaise réponse.',
    type: 'choice',
    field: 'meditationLevel',
    options: [
      { value: 'beginner', label: '🌱 Débutante — Je commence tout juste' },
      { value: 'intermediate', label: '🌿 Intermédiaire — Je pratique parfois' },
      { value: 'advanced', label: '🌳 Avancée — Je pratique régulièrement' },
    ],
  },
  {
    id: 'duration',
    title: 'Durée de session préférée ?',
    subtitle: 'Même 5 minutes par jour font une différence.',
    type: 'choice',
    field: 'preferredDuration',
    options: [
      { value: 5, label: '⚡ 5 minutes — Micro-pause' },
      { value: 10, label: '🌸 10 minutes — Idéal quotidien' },
      { value: 15, label: '🌿 15 minutes — Pratique régulière' },
      { value: 20, label: '🌙 20 minutes — Session profonde' },
      { value: 30, label: '✨ 30 minutes — Immersion complète' },
    ],
  },
  {
    id: 'tone',
    title: 'Ton de guidance préféré ?',
    subtitle: 'Comment souhaitez-vous être guidée ?',
    type: 'choice',
    field: 'guidanceTone',
    options: [
      { value: 'gentle', label: '🌸 Doux et bienveillant' },
      { value: 'motivating', label: '⚡ Motivant et énergisant' },
      { value: 'neutral', label: '🌿 Neutre et factuel' },
      { value: 'spiritual', label: '✨ Spirituel et profond' },
    ],
  },
];

export default function OnboardingScreen() {
  const colors = useColors();
  const { completeOnboarding } = useUser();
  const { isAuthenticated } = useAuth();
  const upsertProfile = trpc.profile.upsert.useMutation();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({});
  const [textInput, setTextInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const step = STEPS[currentStep];
  const progress = (currentStep + 1) / STEPS.length;

  function handleChoice(value: string | number) {
    setData((prev) => ({ ...prev, [step.field]: value }));
    if (currentStep < STEPS.length - 1) {
      setTimeout(() => setCurrentStep((s) => s + 1), 200);
    }
  }

  function handleNext() {
    if (step.type === 'text') {
      if (!textInput.trim()) return;
      setData((prev) => ({ ...prev, [step.field]: textInput.trim() }));
    }
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      handleFinish();
    }
  }

  async function handleFinish() {
    setIsLoading(true);
    try {
      const finalData = step.type === 'text'
        ? { ...data, [step.field]: textInput.trim() }
        : data;
      // Sauvegarder localement
      await completeOnboarding(finalData as Partial<UserProfile>);
      // Sauvegarder en DB si authentifié
      if (isAuthenticated) {
        await upsertProfile.mutateAsync({
          firstName: (finalData as Partial<UserProfile>).firstName || undefined,
          ageRange: (finalData as Partial<UserProfile>).ageRange || undefined,
          mainGoal: (finalData as Partial<UserProfile>).mainGoal || undefined,
          meditationLevel: (finalData as Partial<UserProfile>).meditationLevel as any || undefined,
          preferredDuration: (finalData as Partial<UserProfile>).preferredDuration || undefined,
          guidanceTone: (finalData as Partial<UserProfile>).guidanceTone as any || undefined,
        });
      }
      router.replace('/(tabs)');
    } finally {
      setIsLoading(false);
    }
  }

  const currentValue = data[step.field as keyof OnboardingData];

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Progress bar */}
        <View style={[styles.progressContainer, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressBar,
              { backgroundColor: colors.primary, width: `${progress * 100}%` },
            ]}
          />
        </View>

        {/* Step counter */}
        <Text style={[styles.stepCounter, { color: colors.muted }]}>
          Étape {currentStep + 1} sur {STEPS.length}
        </Text>

        {/* Question */}
        <View style={styles.questionContainer}>
          <Text style={[styles.title, { color: colors.foreground }]}>{step.title}</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>{step.subtitle}</Text>
        </View>

        {/* Text input step */}
        {step.type === 'text' && (
          <View style={styles.textInputContainer}>
            {/* Vrai champ de saisie éditable */}
            <TextInput
              style={[
                styles.textInputWrapper,
                {
                  backgroundColor: colors.surface,
                  borderColor: textInput ? colors.primary : colors.border,
                  color: colors.foreground,
                  fontSize: 18,
                  fontWeight: '600',
                },
              ]}
              placeholder={step.placeholder}
              placeholderTextColor={colors.muted}
              value={textInput}
              onChangeText={setTextInput}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleNext}
              autoFocus
            />
            {/* Suggestions de prénoms */}
            <Text style={[styles.suggestionsLabel, { color: colors.muted }]}>Suggestions</Text>
            <View style={styles.nameOptions}>
              {['Sophia', 'Emma', 'Léa', 'Marie', 'Camille', 'Julie', 'Chloé', 'Laura'].map((name) => (
                <Pressable
                  key={name}
                  style={({ pressed }) => [
                    styles.nameChip,
                    {
                      backgroundColor: textInput === name ? colors.primary : colors.surface,
                      borderColor: textInput === name ? colors.primary : colors.border,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                  onPress={() => setTextInput(name)}
                >
                  <Text style={[styles.nameChipText, { color: textInput === name ? '#FFF' : colors.foreground }]}>
                    {name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Choice steps */}
        {step.type === 'choice' && step.options && (
          <View style={styles.options}>
            {step.options.map((option) => {
              const isSelected = currentValue === option.value;
              return (
                <Pressable
                  key={String(option.value)}
                  style={({ pressed }) => [
                    styles.option,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.surface,
                      borderColor: isSelected ? colors.primary : colors.border,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                  onPress={() => handleChoice(option.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: isSelected ? '#FFFFFF' : colors.foreground },
                    ]}
                  >
                    {option.label}
                  </Text>
                  {isSelected && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Navigation buttons */}
        <View style={styles.navigation}>
          {currentStep > 0 && (
            <Pressable
              style={({ pressed }) => [
                styles.backButton,
                { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={() => setCurrentStep((s) => s - 1)}
            >
              <Text style={[styles.backButtonText, { color: colors.muted }]}>Retour</Text>
            </Pressable>
          )}

          {(step.type === 'text' || currentStep === STEPS.length - 1) && (
            <Pressable
              style={({ pressed }) => [
                styles.nextButton,
                { backgroundColor: colors.primary, flex: currentStep > 0 ? 1 : undefined, opacity: pressed || isLoading ? 0.8 : 1 },
              ]}
              onPress={currentStep === STEPS.length - 1 ? handleFinish : handleNext}
              disabled={isLoading}
            >
              <Text style={styles.nextButtonText}>
                {isLoading ? 'Chargement...' : currentStep === STEPS.length - 1 ? 'Commencer' : 'Continuer'}
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  progressContainer: {
    height: 4,
    borderRadius: 2,
    marginTop: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  stepCounter: {
    fontSize: 13,
    marginBottom: 32,
  },
  questionContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 34,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  textInputContainer: {
    marginBottom: 24,
  },
  textInputWrapper: {
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  textInputField: {
    fontSize: 16,
  },
  nameInput: {
    display: 'none',
  },
  suggestionsLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 4,
  },
  nameOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  nameChip: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1.5,
  },
  nameChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  options: {
    gap: 10,
    marginBottom: 32,
  },
  option: {
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  checkmark: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  navigation: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  backButton: {
    borderRadius: 999,
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  nextButton: {
    borderRadius: 999,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    flex: 1,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
