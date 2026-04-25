import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  TextInput, Dimensions, Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withSpring, withSequence,
  FadeIn, FadeOut, SlideInRight, SlideOutLeft,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { StarField } from '@/components/star-field';
import { FeatureTourSlides } from '@/components/feature-tour-slides';
import { useThemeContext } from '@/lib/theme-provider';
import { useUser } from '@/lib/user-context';
import { useAuth } from '@/hooks/use-auth';
import { trpc } from '@/lib/trpc';
import type { UserProfile } from '@/shared/wellness-types';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Palette SomnioPax ─────────────────────────────────────────────────────────────────────────────────
const GOLD_D = '#C8A96E';
const GOLD_L = '#8B6914';
const BG_D   = '#0D0B1A';
const BG_L   = '#FAF7F2';

// ─── Images thématiques par objectif (CDN) ──────────────────────────────────────────────────────────────────────────────
const GOAL_IMAGES: Record<string, string> = {
  sleep:             'https://files.manuscdn.com/user_upload_by_module/session_file/91776583/aCfuZoRaAGDOuFOr.png',
  stress_relief:     'https://files.manuscdn.com/user_upload_by_module/session_file/91776583/AgfmdcGmHLCHGgiF.png',
  emotional_balance: 'https://files.manuscdn.com/user_upload_by_module/session_file/91776583/YHIWRUZmEQUWGdhI.png',
  confidence:        'https://files.manuscdn.com/user_upload_by_module/session_file/91776583/rdxEytswvmxEcltP.png',
  focus:             'https://files.manuscdn.com/user_upload_by_module/session_file/91776583/pbHMlWGhyseNGTNS.png',
  recovery:          'https://files.manuscdn.com/user_upload_by_module/session_file/91776583/wBzXuFffEEBgKiNL.png',
};

// ─── Définition des étapes ────────────────────────────────────────────────────
type StepType = 'welcome' | 'features' | 'text' | 'choice-grid' | 'choice-list' | 'summary';

interface Step {
  id: string;
  type: StepType;
  title?: string;
  subtitle?: string;
  field?: keyof UserProfile;
  options?: { value: string | number; label: string; emoji: string; desc?: string }[];
}

const STEPS: Step[] = [
  {
    id: 'welcome',
    type: 'welcome',
  },
  {
    id: 'features',
    type: 'features',
    title: 'Découvrez SomnioPax',
    subtitle: 'Voici ce qui vous attend',
  },
  {
    id: 'name',
    type: 'text',
    title: 'Comment vous appelez-vous ?',
    subtitle: 'Nous personnaliserons votre expérience avec votre prénom.',
    field: 'firstName',
  },
  {
    id: 'goal',
    type: 'choice-grid',
    title: 'Votre objectif principal ?',
    subtitle: 'Nous construirons votre parcours autour de cela.',
    field: 'mainGoal',
    options: [
      { value: 'sleep',             label: 'Mieux dormir',       emoji: '🌙', desc: 'Endormissement, qualité du sommeil' },
      { value: 'stress_relief',     label: 'Réduire le stress',  emoji: '🌿', desc: 'Calme, relaxation profonde' },
      { value: 'emotional_balance', label: 'Équilibre émotionnel', emoji: '💜', desc: 'Sérénité, stabilité intérieure' },
      { value: 'confidence',        label: 'Confiance en soi',   emoji: '✨', desc: 'Estime, affirmation de soi' },
      { value: 'focus',             label: 'Concentration',      emoji: '🎯', desc: 'Clarté mentale, productivité' },
      { value: 'recovery',          label: 'Récupération',       emoji: '🌸', desc: 'Guérison émotionnelle, résilience' },
    ],
  },
  {
    id: 'level',
    type: 'choice-list',
    title: 'Votre expérience en méditation ?',
    subtitle: 'Pas de bonne ou mauvaise réponse — soyez honnête.',
    field: 'meditationLevel',
    options: [
      { value: 'beginner',     label: 'Débutant(e)',     emoji: '🌱', desc: 'Je commence tout juste, je découvre' },
      { value: 'intermediate', label: 'Intermédiaire',   emoji: '🌿', desc: 'Je pratique parfois, j\'ai quelques bases' },
      { value: 'advanced',     label: 'Avancé(e)',       emoji: '🌳', desc: 'Je pratique régulièrement depuis un moment' },
    ],
  },
  {
    id: 'duration',
    type: 'choice-list',
    title: 'Durée de session préférée ?',
    subtitle: 'Même 5 minutes par jour font une vraie différence.',
    field: 'preferredDuration',
    options: [
      { value: 5,  label: '5 minutes',  emoji: '⚡', desc: 'Micro-pause, idéal pour débuter' },
      { value: 10, label: '10 minutes', emoji: '🌸', desc: 'Idéal au quotidien, facile à maintenir' },
      { value: 15, label: '15 minutes', emoji: '🌿', desc: 'Pratique régulière et efficace' },
      { value: 20, label: '20 minutes', emoji: '🌙', desc: 'Session profonde, transformation durable' },
      { value: 30, label: '30 minutes', emoji: '✨', desc: 'Immersion complète, résultats accélérés' },
    ],
  },
  {
    id: 'tone',
    type: 'choice-grid',
    title: 'Ton de guidance préféré ?',
    subtitle: 'Comment souhaitez-vous être guidé(e) ?',
    field: 'guidanceTone',
    options: [
      { value: 'gentle',     label: 'Doux',       emoji: '🌸', desc: 'Bienveillant, chaleureux' },
      { value: 'motivating', label: 'Motivant',   emoji: '⚡', desc: 'Énergisant, dynamique' },
      { value: 'neutral',    label: 'Neutre',     emoji: '🌿', desc: 'Factuel, sans fioritures' },
      { value: 'spiritual',  label: 'Spirituel',  emoji: '✨', desc: 'Profond, introspectif' },
    ],
  },
  {
    id: 'summary',
    type: 'summary',
    title: 'Votre profil est prêt',
    subtitle: 'Voici ce que nous avons préparé pour vous.',
  },
];

// ─── Labels lisibles pour le résumé ──────────────────────────────────────────
const GOAL_LABELS: Record<string, string> = {
  sleep: '🌙 Mieux dormir', stress_relief: '🌿 Réduire le stress',
  emotional_balance: '💜 Équilibre émotionnel', confidence: '✨ Confiance en soi',
  focus: '🎯 Concentration', recovery: '🌸 Récupération',
};
const LEVEL_LABELS: Record<string, string> = {
  beginner: '🌱 Débutant(e)', intermediate: '🌿 Intermédiaire', advanced: '🌳 Avancé(e)',
};
const TONE_LABELS: Record<string, string> = {
  gentle: '🌸 Doux', motivating: '⚡ Motivant', neutral: '🌿 Neutre', spiritual: '✨ Spirituel',
};

// ─── Composant carte de choix (grille) ───────────────────────────────────────
function ChoiceCard({
  emoji, label, desc, selected, onPress, isDark, GOLD, imageUri,
}: {
  emoji: string; label: string; desc?: string; selected: boolean;
  onPress: () => void; isDark: boolean; GOLD: string; imageUri?: string;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[{ width: (SCREEN_W - 48 - 12) / 2 }, animStyle]}>
      <Pressable
        style={({ pressed }) => [
          choiceSt.card,
          {
            borderColor: selected ? GOLD : (isDark ? 'rgba(200,169,110,0.25)' : 'rgba(139,105,20,0.18)'),
            borderWidth: selected ? 2 : 1,
            opacity: pressed ? 0.88 : 1,
            overflow: 'hidden',
          },
        ]}
        onPress={() => {
          scale.value = withSequence(
            withTiming(0.95, { duration: 80 }),
            withSpring(1, { damping: 12 }),
          );
          onPress();
        }}
      >
        {/* Image de fond thématique */}
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={[StyleSheet.absoluteFillObject, { opacity: isDark ? 0.65 : 0.55 }]}
            contentFit="cover"
            transition={300}
            cachePolicy="memory-disk"
          />
        ) : null}
        {/* Overlay de couleur */}
        <View
          style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: selected
                ? (isDark ? 'rgba(200,169,110,0.30)' : 'rgba(200,169,110,0.22)')
                : (isDark ? 'rgba(13,11,26,0.45)' : 'rgba(30,20,10,0.30)'),
            },
          ]}
        />
        {/* Contenu de la carte */}
        <View style={{ position: 'relative', zIndex: 1 }}>
          {selected && (
            <View style={[choiceSt.checkDot, { backgroundColor: GOLD }]}>
              <Text style={{ fontSize: 9, color: isDark ? '#0D0B1A' : '#FFFFFF', fontWeight: '800' }}>✓</Text>
            </View>
          )}
          <Text style={choiceSt.emoji}>{emoji}</Text>
          <Text style={[choiceSt.label, { color: '#FFFFFF', textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 }]}>{label}</Text>
          {desc && <Text style={[choiceSt.desc, { color: 'rgba(255,255,255,0.80)' }]}>{desc}</Text>}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const choiceSt = StyleSheet.create({
  card: {
    borderRadius: 18, padding: 14, minHeight: 110,
    justifyContent: 'flex-end', position: 'relative',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
  },
  checkDot: {
    position: 'absolute', top: 10, right: 10,
    width: 20, height: 20, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  emoji: { fontSize: 32, marginBottom: 6 },
  label: { fontSize: 13, fontWeight: '700', lineHeight: 17 },
  desc: { fontSize: 10, lineHeight: 14, marginTop: 3 },
});

// ─── Composant ligne de choix (liste) ────────────────────────────────────────
function ChoiceRow({
  emoji, label, desc, selected, onPress, isDark, GOLD,
}: {
  emoji: string; label: string; desc?: string; selected: boolean;
  onPress: () => void; isDark: boolean; GOLD: string;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        rowSt.row,
        {
          backgroundColor: selected
            ? (isDark ? `${GOLD}20` : `${GOLD}14`)
            : (isDark ? '#2A2540' : '#FFFFFF'),
          borderColor: selected ? GOLD : (isDark ? 'rgba(200,169,110,0.25)' : 'rgba(139,105,20,0.18)'),
          borderWidth: selected ? 1.5 : 1,
          opacity: pressed ? 0.88 : 1,
        },
      ]}
      onPress={onPress}
    >
      <View style={[rowSt.emojiWrap, { backgroundColor: selected ? `${GOLD}25` : (isDark ? '#201C38' : '#F5F0E8') }]}>
        <Text style={{ fontSize: 24 }}>{emoji}</Text>
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={[rowSt.label, { color: isDark ? '#EDE8DC' : '#1C1410' }]}>{label}</Text>
        {desc && <Text style={[rowSt.desc, { color: isDark ? 'rgba(240,235,224,0.55)' : 'rgba(60,40,20,0.55)' }]}>{desc}</Text>}
      </View>
      <View style={[rowSt.radio, { borderColor: selected ? GOLD : (isDark ? 'rgba(200,169,110,0.35)' : 'rgba(139,105,20,0.3)') }]}>
        {selected && <View style={[rowSt.radioDot, { backgroundColor: GOLD }]} />}
      </View>
    </Pressable>
  );
}

const rowSt = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 16, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  emojiWrap: {
    width: 50, height: 50, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  label: { fontSize: 15, fontWeight: '700' },
  desc: { fontSize: 12, marginTop: 2, lineHeight: 16 },
  radio: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2,
    justifyContent: 'center', alignItems: 'center', marginLeft: 10,
  },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
});

// ─── Barre de progression ─────────────────────────────────────────────────────
function ProgressBar({ current, total, isDark, GOLD }: { current: number; total: number; isDark: boolean; GOLD: string }) {
  const progress = current / total;
  const width = useSharedValue(0);
  const widthStyle = useAnimatedStyle(() => ({ width: `${width.value * 100}%` as `${number}%` }));

  React.useEffect(() => {
    width.value = withTiming(progress, { duration: 400, easing: Easing.out(Easing.cubic) });
  }, [progress]);

  return (
    <View style={[pbSt.track, { backgroundColor: isDark ? 'rgba(200,169,110,0.15)' : 'rgba(139,105,20,0.12)' }]}>
      <Animated.View style={[pbSt.fill, { backgroundColor: GOLD }, widthStyle]} />
    </View>
  );
}
const pbSt = StyleSheet.create({
  track: { height: 4, borderRadius: 2, overflow: 'hidden', marginBottom: 8 },
  fill: { height: '100%', borderRadius: 2 },
});

// ─── Écran principal ──────────────────────────────────────────────────────────
export default function OnboardingScreen() {
  const { isDark } = useThemeContext();
  const { completeOnboarding } = useUser();
  const { isAuthenticated } = useAuth();
  const upsertProfile = trpc.profile.upsert.useMutation();

  const GOLD = isDark ? GOLD_D : GOLD_L;
  const WHITE = isDark ? '#EDE8DC' : '#1C1410';
  const LAV = isDark ? 'rgba(240,235,224,0.60)' : 'rgba(60,40,20,0.60)';
  const BORDER = isDark ? 'rgba(200,169,110,0.35)' : 'rgba(139,105,20,0.22)';
  const CARD = isDark ? '#2A2540' : '#FFFFFF';
  const SURFACE = isDark ? '#201C38' : '#F5F0E8';

  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<Partial<UserProfile>>({});
  const [textInput, setTextInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const step = STEPS[currentStep];
  // Exclude welcome and summary from progress count
  const contentSteps = STEPS.filter(s => s.type !== 'welcome' && s.type !== 'features' && s.type !== 'summary');
  const contentIndex = contentSteps.findIndex(s => s.id === step.id);
  const progressValue = contentIndex >= 0 ? (contentIndex + 1) / contentSteps.length : 0;

  function haptic(style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) {
    if (Platform.OS !== 'web') Haptics.impactAsync(style);
  }

  function handleChoice(value: string | number) {
    if (!step.field) return;
    setData(prev => ({ ...prev, [step.field!]: value }));
    haptic();
    // Auto-advance after a short delay for visual feedback
    setTimeout(() => {
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(s => s + 1);
        scrollRef.current?.scrollTo({ y: 0, animated: false });
      }
    }, 280);
  }

  function handleNext() {
    if (step.type === 'text') {
      const val = textInput.trim();
      if (!val) return;
      setData(prev => ({ ...prev, firstName: val }));
    }
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(s => s + 1);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      haptic();
    }
  }

  function handleBack() {
    if (currentStep > 0) {
      setCurrentStep(s => s - 1);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      haptic();
    }
  }

  async function handleFinish() {
    setIsLoading(true);
    try {
      const finalData: Partial<UserProfile> = {
        ...data,
        firstName: data.firstName || textInput.trim() || 'Utilisateur',
      };
      await completeOnboarding(finalData);
      if (isAuthenticated) {
        await upsertProfile.mutateAsync({
          firstName: finalData.firstName,
          ageRange: finalData.ageRange,
          mainGoal: finalData.mainGoal,
          meditationLevel: finalData.meditationLevel as any,
          preferredDuration: finalData.preferredDuration,
          guidanceTone: finalData.guidanceTone as any,
        }).catch(() => {});
      }
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } finally {
      setIsLoading(false);
    }
  }

  const currentValue = step.field ? data[step.field] : undefined;
  const canAdvance = step.type === 'welcome'
    || step.type === 'summary'
    || (step.type === 'text' && textInput.trim().length > 0)
    || (step.type !== 'text' && currentValue !== undefined);

  // ── Rendu de l'étape Bienvenue ────────────────────────────────────────────
  // ── Rendu de l'étape Feature Tour ─────────────────────────────────────────
  function renderFeatures() {
    return (
      <FeatureTourSlides
        isDark={isDark}
        GOLD={GOLD}
        onComplete={() => {
          setCurrentStep(s => s + 1);
          scrollRef.current?.scrollTo({ y: 0, animated: false });
          haptic();
        }}
      />
    );
  }
  function renderWelcome() {
    return (
      <Animated.View entering={FadeIn.duration(600)} style={welcomeSt.container}>
        {/* Image de méditation en haut */}
        <View style={welcomeSt.heroImageWrap}>
          <Image
            source={{ uri: 'https://d2xsxph8kpxj0f.cloudfront.net/91776583/eYFNRfZnGFDCF7cJsc37XA/onboarding-hero_c_708dd0cf.jpg' }}
            style={welcomeSt.heroImage}
            contentFit="cover"
            transition={400}
            cachePolicy="memory-disk"
          />
          <LinearGradient
            colors={['transparent', isDark ? BG_D : BG_L]}
            style={welcomeSt.heroImageOverlay}
          />
        </View>
        {/* Logo animé */}
        <View style={welcomeSt.logoWrap}>
          <LinearGradient
            colors={isDark ? ['#2A2540', '#1A1630'] : ['#F5F0E8', '#EDE8DC']}
            style={welcomeSt.logoBg}
          >
            <Text style={{ fontSize: 56 }}>🌙</Text>
          </LinearGradient>
          <View style={[welcomeSt.logoGlow, { backgroundColor: `${GOLD}20` }]} />
        </View>

        {/* Titre */}
        <Text style={[welcomeSt.appName, { color: GOLD }]}>SomnioPax</Text>
        <Text style={[welcomeSt.tagline, { color: WHITE }]}>Votre sanctuaire du bien-être intérieur</Text>
        <Text style={[welcomeSt.desc, { color: LAV }]}>
          En quelques étapes, nous allons personnaliser votre expérience pour vous offrir des méditations, des sons et des exercices adaptés à vos besoins.
        </Text>

        {/* Promesses */}
        <View style={welcomeSt.promises}>
          {[
            { emoji: '🎯', text: 'Parcours personnalisé selon vos objectifs' },
            { emoji: '🔒', text: 'Vos données restent sur votre appareil' },
            { emoji: '⏱️', text: 'Seulement 2 minutes pour configurer' },
          ].map((p) => (
            <View key={p.text} style={[welcomeSt.promiseRow, { borderColor: BORDER }]}>
              <Text style={{ fontSize: 18 }}>{p.emoji}</Text>
              <Text style={[welcomeSt.promiseText, { color: LAV }]}>{p.text}</Text>
            </View>
          ))}
        </View>
      </Animated.View>
    );
  }

  // ── Rendu de l'étape Résumé ─────────────────────────────────────────────────
  function renderSummary() {
    const firstName = data.firstName || textInput.trim() || 'vous';
    const items = [
      { label: 'Objectif',     value: GOAL_LABELS[data.mainGoal ?? ''] ?? '—' },
      { label: 'Niveau',       value: LEVEL_LABELS[data.meditationLevel ?? ''] ?? '—' },
      { label: 'Durée',        value: data.preferredDuration ? `${data.preferredDuration} min par session` : '—' },
      { label: 'Ton préféré',  value: TONE_LABELS[data.guidanceTone ?? ''] ?? '—' },
    ];

    return (
      <Animated.View entering={FadeIn.duration(500)} style={{ paddingBottom: 8 }}>
        {/* Greeting */}
        <View style={[summSt.greetCard, { backgroundColor: `${GOLD}12`, borderColor: `${GOLD}35` }]}>
          <Text style={{ fontSize: 36 }}>🎉</Text>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[summSt.greetTitle, { color: WHITE }]}>Bienvenue, {firstName} !</Text>
            <Text style={[summSt.greetSub, { color: LAV }]}>Votre espace de bien-être est prêt.</Text>
          </View>
        </View>

        {/* Résumé des choix */}
        <Text style={[summSt.sectionLabel, { color: LAV }]}>VOS PRÉFÉRENCES</Text>
        <View style={[summSt.summaryCard, { backgroundColor: CARD, borderColor: BORDER }]}>
          {items.map((item, idx) => (
            <View key={item.label} style={[summSt.summaryRow, idx < items.length - 1 && { borderBottomColor: BORDER, borderBottomWidth: 0.5 }]}>
              <Text style={[summSt.summaryLabel, { color: LAV }]}>{item.label}</Text>
              <Text style={[summSt.summaryValue, { color: WHITE }]}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* Ce qui vous attend */}
        <Text style={[summSt.sectionLabel, { color: LAV }]}>CE QUI VOUS ATTEND</Text>
        <View style={summSt.featuresRow}>
          {[
            { emoji: '🧘', label: 'Méditations\nguidées' },
            { emoji: '🌬️', label: 'Exercices de\nrespiration' },
            { emoji: '🎵', label: 'Sons\nd\'ambiance' },
            { emoji: '📓', label: 'Journal\nde bien-être' },
          ].map((f) => (
            <View key={f.label} style={[summSt.featureCard, { backgroundColor: SURFACE, borderColor: BORDER }]}>
              <Text style={{ fontSize: 24 }}>{f.emoji}</Text>
              <Text style={[summSt.featureLabel, { color: LAV }]}>{f.label}</Text>
            </View>
          ))}
        </View>
      </Animated.View>
    );
  }

  // ── Rendu du contenu de l'étape ─────────────────────────────────────────────
  function renderStepContent() {
    switch (step.type) {
      case 'welcome':
        return renderWelcome();

      case 'text':
        return (
          <Animated.View entering={FadeIn.duration(400)} style={{ marginBottom: 8 }}>
            <TextInput
              style={[
                textSt.input,
                {
                  backgroundColor: CARD,
                  borderColor: textInput.trim() ? GOLD : BORDER,
                  color: WHITE,
                },
              ]}
              placeholder="Votre prénom"
              placeholderTextColor={LAV}
              value={textInput}
              onChangeText={setTextInput}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleNext}
              autoFocus
            />
            {/* Suggestions */}
            <Text style={[textSt.sugLabel, { color: LAV }]}>Suggestions rapides</Text>
            <View style={textSt.chips}>
              {['Sophie', 'Emma', 'Léa', 'Marie', 'Camille', 'Julie', 'Lucas', 'Thomas'].map((name) => (
                <Pressable
                  key={name}
                  style={({ pressed }) => [
                    textSt.chip,
                    {
                      backgroundColor: textInput === name ? GOLD : SURFACE,
                      borderColor: textInput === name ? GOLD : BORDER,
                      opacity: pressed ? 0.75 : 1,
                    },
                  ]}
                  onPress={() => setTextInput(name)}
                >
                  <Text style={[textSt.chipText, { color: textInput === name ? (isDark ? '#0D0B1A' : '#FFFFFF') : WHITE }]}>
                    {name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        );

      case 'choice-grid':
        return (
          <Animated.View entering={FadeIn.duration(400)} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
            {step.options?.map((opt) => (
              <ChoiceCard
                key={String(opt.value)}
                emoji={opt.emoji}
                label={opt.label}
                desc={opt.desc}
                selected={currentValue === opt.value}
                onPress={() => handleChoice(opt.value)}
                isDark={isDark}
                GOLD={GOLD}
                imageUri={step.field === 'mainGoal' ? GOAL_IMAGES[String(opt.value)] : undefined}
              />
            ))}
          </Animated.View>
        );

      case 'choice-list':
        return (
          <Animated.View entering={FadeIn.duration(400)} style={{ marginBottom: 8 }}>
            {step.options?.map((opt) => (
              <ChoiceRow
                key={String(opt.value)}
                emoji={opt.emoji}
                label={opt.label}
                desc={opt.desc}
                selected={currentValue === opt.value}
                onPress={() => handleChoice(opt.value)}
                isDark={isDark}
                GOLD={GOLD}
              />
            ))}
          </Animated.View>
        );

      case 'summary':
        return renderSummary();

      default:
        return null;
    }
  }

  const isWelcome = step.type === 'welcome';
  const isSummary = step.type === 'summary';
  const showProgress = !isWelcome;
  const showHeader = !isWelcome;

  return (
    <ScreenContainer
      containerClassName={isDark ? 'bg-[#0D0B1A]' : 'bg-[#FAF7F2]'}
      edges={['top', 'left', 'right', 'bottom']}
    >
      <StarField />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Barre de progression ──────────────────────────────────────────── */}
        {showProgress && (
          <View style={styles.progressWrap}>
            <ProgressBar
              current={contentIndex + 1}
              total={contentSteps.length}
              isDark={isDark}
              GOLD={GOLD}
            />
            <Text style={[styles.stepCounter, { color: LAV }]}>
              Étape {contentIndex + 1} sur {contentSteps.length}
            </Text>
          </View>
        )}

        {/* ── En-tête de l'étape ────────────────────────────────────────────── */}
        {showHeader && step.title && (
          <Animated.View key={step.id + '_header'} entering={FadeIn.duration(350)} style={styles.stepHeader}>
            <Text style={[styles.stepTitle, { color: WHITE }]}>{step.title}</Text>
            {step.subtitle && (
              <Text style={[styles.stepSubtitle, { color: LAV }]}>{step.subtitle}</Text>
            )}
          </Animated.View>
        )}

        {/* ── Contenu de l'étape ────────────────────────────────────────────── */}
        <Animated.View key={step.id + '_content'} entering={FadeIn.duration(350)}>
          {renderStepContent()}
        </Animated.View>

        {/* ── Boutons de navigation ─────────────────────────────────────────── */}
        {step.type !== 'features' && <View style={styles.navRow}>
          {/* Bouton Retour */}
          {currentStep > 0 && !isSummary && (
            <Pressable
              style={({ pressed }) => [
                styles.backBtn,
                { borderColor: BORDER, opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={handleBack}
            >
              <Text style={[styles.backBtnText, { color: LAV }]}>← Retour</Text>
            </Pressable>
          )}

          {/* Bouton Continuer / Commencer */}
          {(isWelcome || step.type === 'text' || isSummary) && (
            <Pressable
              style={({ pressed }) => [
                styles.nextBtn,
                {
                  backgroundColor: canAdvance ? GOLD : (isDark ? '#2A2540' : '#E5E0D8'),
                  flex: currentStep === 0 ? undefined : 1,
                  opacity: pressed ? 0.88 : 1,
                },
              ]}
              onPress={isSummary ? handleFinish : handleNext}
              disabled={!canAdvance || isLoading}
            >
              <LinearGradient
                colors={canAdvance
                  ? (isDark ? [GOLD_D, '#A8854A'] : [GOLD_L, '#6B4F10'])
                  : (isDark ? ['#2A2540', '#2A2540'] : ['#E5E0D8', '#E5E0D8'])
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.nextBtnGradient}
              >
                <Text style={[styles.nextBtnText, { color: canAdvance ? (isDark ? '#0D0B1A' : '#FFFFFF') : LAV }]}>
                  {isLoading ? 'Chargement…'
                    : isWelcome ? 'Commencer la configuration →'
                    : isSummary ? '🚀 Démarrer SomnioPax'
                    : 'Continuer →'}
                </Text>
              </LinearGradient>
            </Pressable>
          )}
        </View>}

        {/* Lien "Passer" sur l'écran de bienvenue */}
        {isWelcome && (
          <Pressable
            style={({ pressed }) => [{ alignItems: 'center', marginTop: 12, opacity: pressed ? 0.6 : 1 }]}
            onPress={async () => {
              await completeOnboarding({});
              router.replace('/(tabs)');
            }}
          >
            <Text style={[styles.skipText, { color: LAV }]}>Passer la configuration</Text>
          </Pressable>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

// ─── Styles des sous-composants ───────────────────────────────────────────────
const welcomeSt = StyleSheet.create({
  container: { alignItems: 'center', paddingTop: 0, paddingBottom: 8 },
  heroImageWrap: {
    width: '100%', height: 220, borderRadius: 24, overflow: 'hidden',
    marginBottom: 24, position: 'relative',
  },
  heroImage: { width: '100%', height: '100%' },
  heroImageOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
  },
  logoWrap: { position: 'relative', marginBottom: 24 },
  logoBg: {
    width: 120, height: 120, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25, shadowRadius: 20, elevation: 10,
  },
  logoGlow: {
    position: 'absolute', top: -10, left: -10, right: -10, bottom: -10,
    borderRadius: 40, zIndex: -1,
  },
  appName: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 38, letterSpacing: 1, marginBottom: 6 },
  tagline: { fontSize: 16, fontWeight: '600', marginBottom: 12, textAlign: 'center' },
  desc: { fontSize: 14, lineHeight: 22, textAlign: 'center', marginBottom: 28, paddingHorizontal: 8 },
  promises: { width: '100%', gap: 10 },
  promiseRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 14, padding: 14, borderWidth: 1,
    backgroundColor: 'rgba(200,169,110,0.05)',
  },
  promiseText: { fontSize: 13, flex: 1, lineHeight: 18 },
});

const textSt = StyleSheet.create({
  input: {
    borderRadius: 16, borderWidth: 1.5,
    paddingHorizontal: 18, paddingVertical: 16,
    fontSize: 18, fontWeight: '600', marginBottom: 20,
  },
  sugLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1.5 },
  chipText: { fontSize: 14, fontWeight: '500' },
});

const summSt = StyleSheet.create({
  greetCard: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 18, padding: 16, marginBottom: 20, borderWidth: 1,
  },
  greetTitle: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 18 },
  greetSub: { fontSize: 13, marginTop: 3 },
  sectionLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  summaryCard: {
    borderRadius: 18, borderWidth: 1, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  summaryLabel: { fontSize: 13 },
  summaryValue: { fontSize: 13, fontWeight: '700', textAlign: 'right', flex: 1, marginLeft: 12 },
  featuresRow: { flexDirection: 'row', gap: 10 },
  featureCard: {
    flex: 1, borderRadius: 14, padding: 12, alignItems: 'center', gap: 6, borderWidth: 1,
  },
  featureLabel: { fontSize: 10, textAlign: 'center', lineHeight: 14 },
});

// ─── Styles principaux ────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40, flexGrow: 1 },
  progressWrap: { marginBottom: 6 },
  stepCounter: { fontSize: 12, fontWeight: '600', marginBottom: 20, textAlign: 'right' },
  stepHeader: { marginBottom: 24 },
  stepTitle: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 26, lineHeight: 34, marginBottom: 8 },
  stepSubtitle: { fontSize: 15, lineHeight: 22 },
  navRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  backBtn: {
    borderRadius: 999, paddingVertical: 15, paddingHorizontal: 20,
    borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
  },
  backBtnText: { fontSize: 14, fontWeight: '600' },
  nextBtn: { borderRadius: 999, overflow: 'hidden', flex: 1 },
  nextBtnGradient: { paddingVertical: 16, paddingHorizontal: 28, alignItems: 'center' },
  nextBtnText: { fontSize: 16, fontWeight: '800' },
  skipText: { fontSize: 13, textDecorationLine: 'underline' },
});
