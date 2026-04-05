import React, { useState, useMemo} from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useThemeContext } from '@/lib/theme-provider';
import { useUser } from '@/lib/user-context';
import { ADAPTIVE_JOURNEYS } from '@/lib/mock-data';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { PremiumBadge } from '@/components/ui/premium-badge';


const STEP_ICONS: Record<string, string> = {
  intro: '🌸',
  breathing: '💨',
  meditation: '🧘‍♀️',
  reflection: '📝',
  feedback: '💜',
};

const STEP_COLORS: Record<string, string> = {
  intro: '#C084FC',
  breathing: '#86EFAC',
  meditation: '#F9A8D4',
  reflection: '#FCD34D',
  feedback: '#A855F7',
};

export default function JourneyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const { isDark } = useThemeContext();
  const styles = useMemo(() => makeStyles(isDark), [isDark]);
  const { profile, addSessionHistory } = useUser();
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const journey = ADAPTIVE_JOURNEYS.find((j) => j.id === id);

  if (!journey) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.muted }}>Parcours introuvable</Text>
        </View>
      </ScreenContainer>
    );
  }

  const isLocked = journey.isPremium && !profile?.isPremium;

  async function handleComplete() {
    await addSessionHistory({
      journeyId: journey!.id,
      duration: journey!.duration,
    });
    setIsComplete(true);
  }

  if (isComplete) {
    return (
      <ScreenContainer>
        <View style={styles.completeContainer}>
          <Text style={styles.completeEmoji}>🌸</Text>
          <Text style={[styles.completeTitle, { color: colors.foreground }]}>
            Parcours terminé
          </Text>
          <Text style={[styles.completeSubtitle, { color: colors.muted }]}>
            Vous avez pris soin de vous. C'est un acte de courage et d'amour envers vous-même.
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.completeButton,
              { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={() => router.back()}
          >
            <Text style={styles.completeButtonText}>Retour à l'accueil</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  if (currentStep !== null) {
    const step = journey.steps[currentStep];
    const isLast = currentStep === journey.steps.length - 1;

    return (
      <ScreenContainer>
        <LinearGradient
          colors={journey.coverGradient as [string, string]}
          style={styles.stepHeader}
        >
          <Pressable
            style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.7 : 1 }]}
            onPress={() => setCurrentStep(null)}
          >
            <IconSymbol name="chevron.left" size={22} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.stepProgress}>
            {currentStep + 1} / {journey.steps.length}
          </Text>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.stepContent}>
          <Text style={styles.stepEmoji}>{STEP_ICONS[step.type]}</Text>
          <Text style={[styles.stepTitle, { color: colors.foreground }]}>{step.title}</Text>
          <Text style={[styles.stepDescription, { color: colors.muted }]}>{step.description}</Text>

          {step.content && (
            <View style={[styles.stepContentBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.stepContentText, { color: colors.foreground }]}>{step.content}</Text>
            </View>
          )}

          <View style={[styles.durationBadge, { backgroundColor: `${colors.primary}20` }]}>
            <IconSymbol name="clock.fill" size={14} color={colors.primary} />
            <Text style={[styles.durationText, { color: colors.primary }]}>{step.duration} min</Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.stepNextButton,
              { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={() => {
              if (isLast) {
                handleComplete();
              } else {
                setCurrentStep((s) => (s !== null ? s + 1 : 0));
              }
            }}
          >
            <Text style={styles.stepNextButtonText}>
              {isLast ? 'Terminer le parcours' : 'Étape suivante'}
            </Text>
          </Pressable>
        </ScrollView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient
          colors={journey.coverGradient as [string, string]}
          style={styles.hero}
        >
          <Pressable
            style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.7 : 1 }]}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={22} color="#FFFFFF" />
          </Pressable>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>{journey.title}</Text>
            <Text style={styles.heroSubtitle}>{journey.subtitle}</Text>
            <View style={styles.heroBadges}>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>{journey.duration} min</Text>
              </View>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>{journey.steps.length} étapes</Text>
              </View>
              {journey.isPremium && <PremiumBadge small />}
            </View>
          </View>
        </LinearGradient>

        {/* Description */}
        <View style={styles.body}>
          <Text style={[styles.description, { color: colors.muted }]}>{journey.description}</Text>

          {/* Steps */}
          <Text style={[styles.stepsTitle, { color: colors.foreground }]}>Ce parcours comprend</Text>
          <View style={styles.stepsList}>
            {journey.steps.map((step, index) => (
              <View key={step.id} style={[styles.stepRow, { backgroundColor: colors.surface }]}>
                <View style={[styles.stepIconContainer, { backgroundColor: `${STEP_COLORS[step.type]}20` }]}>
                  <Text style={styles.stepIcon}>{STEP_ICONS[step.type]}</Text>
                </View>
                <View style={styles.stepInfo}>
                  <Text style={[styles.stepName, { color: colors.foreground }]}>{step.title}</Text>
                  <Text style={[styles.stepDesc, { color: colors.muted }]}>{step.description}</Text>
                </View>
                <Text style={[styles.stepDuration, { color: colors.muted }]}>{step.duration}m</Text>
              </View>
            ))}
          </View>

          {/* CTA */}
          {isLocked ? (
            <View>
              <View style={[styles.lockedBanner, { backgroundColor: `${colors.warning}15`, borderColor: colors.warning }]}>
                <Text style={[styles.lockedText, { color: colors.warning }]}>
                  Ce parcours est réservé aux membres Premium. Débloquez l'accès complet pour profiter de tous les parcours adaptatifs.
                </Text>
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.ctaButton,
                  { backgroundColor: '#F59E0B', opacity: pressed ? 0.85 : 1 },
                ]}
                onPress={() => router.push('/(tabs)/profile' as never)}
              >
                <Text style={styles.ctaButtonText}>Passer à Premium</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={({ pressed }) => [
                styles.ctaButton,
                { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
              ]}
              onPress={() => setCurrentStep(0)}
            >
              <Text style={styles.ctaButtonText}>Commencer le parcours</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function makeStyles(isDark: boolean) {
  const CARD   = isDark ? '#2A2540' : '#FFFFFF';
  const CARD2  = isDark ? '#201C38' : '#F5F0E8';
  const TEXT1  = isDark ? '#F0EBE0' : '#1C1410';
  const TEXT2  = isDark ? 'rgba(240,235,224,0.65)' : 'rgba(60,40,20,0.65)';
  const TEXT3  = isDark ? 'rgba(240,235,224,0.70)' : 'rgba(60,40,20,0.70)';
  const GOLD_C = isDark ? '#C8A96E' : '#8B6914';
  const BORD   = isDark ? 'rgba(200,169,110,0.40)' : 'rgba(139,105,20,0.30)';
  const BORD2  = isDark ? 'rgba(200,169,110,0.30)' : 'rgba(139,105,20,0.20)';
  return StyleSheet.create({
  hero: {
    paddingTop: 16,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  heroContent: {},
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 6,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  heroBadges: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  body: {
    padding: 20,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 28,
  },
  stepsTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 14,
  },
  stepsList: {
    gap: 10,
    marginBottom: 28,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 12,
    gap: 12,
  },
  stepIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIcon: {
    fontSize: 20,
  },
  stepInfo: {
    flex: 1,
  },
  stepName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  stepDuration: {
    fontSize: 12,
    fontWeight: '600',
  },
  lockedBanner: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
  },
  lockedText: {
    fontSize: 13,
    lineHeight: 18,
  },
  ctaButton: {
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  // Step view
  stepHeader: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepProgress: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
  },
  stepContent: {
    padding: 24,
    alignItems: 'center',
  },
  stepEmoji: {
    fontSize: 64,
    marginBottom: 20,
    marginTop: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },
  stepDescription: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  stepContentBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    width: '100%',
    marginBottom: 20,
  },
  stepContentText: {
    fontSize: 15,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginBottom: 32,
  },
  durationText: {
    fontSize: 13,
    fontWeight: '600',
  },
  stepNextButton: {
    borderRadius: 999,
    paddingVertical: 16,
    paddingHorizontal: 48,
    alignItems: 'center',
    width: '100%',
  },
  stepNextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  // Complete state
  completeContainer: {
    flex: 1,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeEmoji: {
    fontSize: 72,
    marginBottom: 24,
  },
  completeTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  completeSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 36,
  },
  completeButton: {
    borderRadius: 999,
    paddingVertical: 16,
    paddingHorizontal: 48,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  });
}
