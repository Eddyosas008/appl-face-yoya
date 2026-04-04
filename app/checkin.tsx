import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, TextInput,
  Animated, Dimensions, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { MOOD_EMOJIS, MOOD_LABELS, ADAPTIVE_JOURNEYS } from '@/lib/mock-data';
import type { MoodState } from '@/shared/wellness-types';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/hooks/use-auth';
import { useThemeContext } from '@/lib/theme-provider';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MOODS: MoodState[] = ['calm', 'happy', 'grateful', 'neutral', 'tired', 'anxious', 'sad', 'overwhelmed'];

// Map MoodState → DB mood enum
type DbMood = 'anxious' | 'sad' | 'neutral' | 'calm' | 'happy' | 'energetic' | 'grateful';
const MOOD_MAP: Partial<Record<MoodState, DbMood>> = {
  calm: 'calm', happy: 'happy', grateful: 'grateful', neutral: 'neutral',
  anxious: 'anxious', sad: 'sad', tired: 'neutral', overwhelmed: 'anxious',
};

// Couleur associée à chaque humeur
const MOOD_COLORS: Record<string, string> = {
  calm: '#4ADE80', happy: '#FBBF24', grateful: '#A78BFA',
  neutral: '#9CA3AF', tired: '#60A5FA', anxious: '#F97316',
  sad: '#818CF8', overwhelmed: '#F472B6',
};

// ─── Slider personnalisé (PanResponder) ─────────────────────────────────────
function SliderRow({
  label, emoji, value, onChange, minLabel, maxLabel, gold, border, bg, text, textMuted,
}: {
  label: string; emoji: string; value: number; onChange: (v: number) => void;
  minLabel: string; maxLabel: string;
  gold: string; border: string; bg: string; text: string; textMuted: string;
}) {
  const TRACK_W = SCREEN_WIDTH - 40 - 32; // padding 20 + card padding 16 each side
  const THUMB_SIZE = 28;
  const fillPct = (value - 1) / 4; // value 1-5 → 0-1

  return (
    <View style={{ marginBottom: 22 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 }}>
        <Text style={{ fontSize: 20 }}>{emoji}</Text>
        <Text style={{ fontSize: 13, fontWeight: '600', color: text, flex: 1 }}>{label}</Text>
        <View style={{ backgroundColor: `${gold}22`, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: `${gold}50` }}>
          <Text style={{ fontSize: 14, fontWeight: '800', color: gold }}>{value}/5</Text>
        </View>
      </View>

      {/* Boutons 1-5 en rangée */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {[1, 2, 3, 4, 5].map((v) => {
          const active = value >= v;
          const exact = value === v;
          return (
            <Pressable
              key={v}
              style={({ pressed }) => ({
                flex: 1,
                height: 48,
                borderRadius: 14,
                borderWidth: exact ? 2 : 1,
                borderColor: active ? gold : border,
                backgroundColor: active ? `${gold}${exact ? '35' : '18'}` : bg,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.75 : 1,
                transform: [{ scale: exact ? 1.05 : 1 }],
              })}
              onPress={() => {
                if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onChange(v);
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '800', color: active ? gold : textMuted }}>
                {v}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Labels min/max */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
        <Text style={{ fontSize: 10, color: textMuted }}>{minLabel}</Text>
        <Text style={{ fontSize: 10, color: textMuted }}>{maxLabel}</Text>
      </View>
    </View>
  );
}

// ─── Écran principal ─────────────────────────────────────────────────────────
export default function CheckInScreen() {
  const colors = useColors();
  const { isDark } = useThemeContext();
  const styles = useMemo(() => makeStyles(isDark), [isDark]);
  const { isAuthenticated } = useAuth();

  // Palette
  const GOLD    = isDark ? '#C8A96E' : '#8B6914';
  const WHITE   = isDark ? '#EDE8DC' : '#1C1410';
  const MUTED   = isDark ? 'rgba(240,235,224,0.60)' : 'rgba(60,40,20,0.55)';
  const BORDER  = isDark ? 'rgba(200,169,110,0.35)' : 'rgba(139,105,20,0.22)';
  const CARD_BG = isDark ? '#1E1A35' : '#FFFFFF';
  const CARD_BG2= isDark ? '#2A2540' : '#F5F0E8';
  const BG      = isDark ? '#0D0B1A' : '#FAF7F2';

  const [mood, setMood] = useState<MoodState | null>(null);
  const [stress, setStress] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [sleep, setSleep] = useState(3);
  const [note, setNote] = useState('');
  const [isDone, setIsDone] = useState(false);

  // Animation de sélection humeur
  const moodScales = useRef<Record<string, Animated.Value>>(
    Object.fromEntries(MOODS.map(m => [m, new Animated.Value(1)]))
  ).current;

  const selectMood = useCallback((m: MoodState) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMood(m);
    // Animate selected
    Animated.sequence([
      Animated.timing(moodScales[m], { toValue: 1.12, duration: 100, useNativeDriver: true }),
      Animated.timing(moodScales[m], { toValue: 1.0, duration: 120, useNativeDriver: true }),
    ]).start();
  }, [moodScales]);

  const createCheckIn = trpc.checkIns.create.useMutation();

  async function handleSubmit() {
    if (!mood) return;
    const dbMood = MOOD_MAP[mood] ?? 'neutral';
    const intensity = Math.round(((stress + energy) / 2) * 2); // 1-10
    if (isAuthenticated) {
      await createCheckIn.mutateAsync({
        mood: dbMood,
        intensity,
        note: note.trim() || undefined,
        triggers: JSON.stringify({ stress, energy, sleep }),
      });
    }
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsDone(true);
  }

  const recommendedJourney = mood
    ? ADAPTIVE_JOURNEYS.find((j) => j.mood.includes(mood))
    : null;

  const moodColor = mood ? (MOOD_COLORS[mood] ?? GOLD) : GOLD;

  // ── Écran de confirmation ────────────────────────────────────────────────
  if (isDone) {
    return (
      <ScreenContainer containerClassName={isDark ? 'bg-[#0D0B1A]' : 'bg-[#FAF7F2]'}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40, alignItems: 'center' }}>
          {/* Cercle animé */}
          <LinearGradient
            colors={[`${moodColor}30`, `${moodColor}10`]}
            style={{ width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', marginBottom: 24, borderWidth: 2, borderColor: `${moodColor}50` }}
          >
            <Text style={{ fontSize: 56 }}>✨</Text>
          </LinearGradient>

          <Text style={[styles.doneTitle, { color: WHITE }]}>Check-in enregistré</Text>
          <Text style={[styles.doneSubtitle, { color: MUTED }]}>
            Merci pour votre honnêteté. Prendre soin de soi commence par se connaître.
          </Text>

          {/* Récap humeur */}
          {mood && (
            <View style={[styles.recapCard, { backgroundColor: CARD_BG, borderColor: `${moodColor}40` }]}>
              <Text style={{ fontSize: 32, marginBottom: 8 }}>{MOOD_EMOJIS[mood]}</Text>
              <Text style={[styles.recapMoodLabel, { color: moodColor }]}>{MOOD_LABELS[mood]}</Text>
              <View style={{ flexDirection: 'row', gap: 16, marginTop: 12 }}>
                {[
                  { label: 'Stress', value: stress, emoji: '😤' },
                  { label: 'Énergie', value: energy, emoji: '⚡' },
                  { label: 'Sommeil', value: sleep, emoji: '🌙' },
                ].map(item => (
                  <View key={item.label} style={{ alignItems: 'center', flex: 1 }}>
                    <Text style={{ fontSize: 18 }}>{item.emoji}</Text>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: WHITE, marginTop: 2 }}>{item.value}</Text>
                    <Text style={{ fontSize: 10, color: MUTED }}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {recommendedJourney && (
            <View style={[styles.recommendCard, { backgroundColor: CARD_BG, borderColor: BORDER }]}>
              <Text style={[styles.recommendLabel, { color: MUTED }]}>Recommandé pour vous</Text>
              <Text style={[styles.recommendTitle, { color: WHITE }]}>{recommendedJourney.title}</Text>
              <Text style={[styles.recommendSub, { color: MUTED }]}>{recommendedJourney.subtitle}</Text>
              <Pressable
                style={({ pressed }) => [styles.recommendButton, { backgroundColor: GOLD, opacity: pressed ? 0.85 : 1 }]}
                onPress={() => { router.back(); router.push(`/journey/${recommendedJourney.id}` as never); }}
              >
                <Text style={styles.recommendButtonText}>Commencer ce parcours</Text>
              </Pressable>
            </View>
          )}

          <Pressable
            style={({ pressed }) => [styles.closeButton, { borderColor: BORDER, backgroundColor: CARD_BG2, opacity: pressed ? 0.7 : 1 }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.closeButtonText, { color: MUTED }]}>Retour à l'accueil</Text>
          </Pressable>
        </ScrollView>
      </ScreenContainer>
    );
  }

  // ── Formulaire principal ─────────────────────────────────────────────────
  return (
    <ScreenContainer containerClassName={isDark ? 'bg-[#0D0B1A]' : 'bg-[#FAF7F2]'}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 60 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]} onPress={() => router.back()}>
            <View style={[styles.headerBackBtn, { backgroundColor: CARD_BG, borderColor: BORDER }]}>
              <IconSymbol name="xmark" size={16} color={WHITE} />
            </View>
          </Pressable>
          <Text style={[styles.headerTitle, { color: WHITE }]}>Check-in émotionnel</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* ── Sous-titre ── */}
        <Text style={[styles.pageSubtitle, { color: MUTED }]}>
          Prenez un moment pour observer votre état intérieur
        </Text>

        {/* ── Sélection humeur ── */}
        <View style={[styles.card, { backgroundColor: CARD_BG, borderColor: BORDER }]}>
          <Text style={[styles.cardTitle, { color: WHITE }]}>💭 Comment vous sentez-vous ?</Text>
          <View style={styles.moodGrid}>
            {MOODS.map((m) => {
              const isSelected = mood === m;
              const mc = MOOD_COLORS[m] ?? GOLD;
              return (
                <Animated.View key={m} style={{ transform: [{ scale: moodScales[m] }], width: '22%' }}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.moodItem,
                      {
                        backgroundColor: isSelected ? `${mc}25` : (isDark ? '#2A2540' : '#F8F5EE'),
                        borderColor: isSelected ? mc : BORDER,
                        borderWidth: isSelected ? 2 : 1,
                        opacity: pressed ? 0.75 : 1,
                      },
                    ]}
                    onPress={() => selectMood(m)}
                  >
                    <Text style={styles.moodEmoji}>{MOOD_EMOJIS[m]}</Text>
                    <Text style={[styles.moodLabel, { color: isSelected ? mc : MUTED }]}>
                      {MOOD_LABELS[m]}
                    </Text>
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
        </View>

        {/* ── Niveaux ── */}
        <View style={[styles.card, { backgroundColor: CARD_BG, borderColor: BORDER }]}>
          <Text style={[styles.cardTitle, { color: WHITE }]}>📊 Vos niveaux</Text>
          <SliderRow
            label="Stress"
            emoji="😤"
            value={stress}
            onChange={setStress}
            minLabel="Très bas"
            maxLabel="Très élevé"
            gold={GOLD}
            border={BORDER}
            bg={isDark ? '#2A2540' : '#F8F5EE'}
            text={WHITE}
            textMuted={MUTED}
          />
          <SliderRow
            label="Énergie"
            emoji="⚡"
            value={energy}
            onChange={setEnergy}
            minLabel="Épuisé·e"
            maxLabel="Plein·e d'énergie"
            gold={GOLD}
            border={BORDER}
            bg={isDark ? '#2A2540' : '#F8F5EE'}
            text={WHITE}
            textMuted={MUTED}
          />
          <SliderRow
            label="Qualité du sommeil"
            emoji="🌙"
            value={sleep}
            onChange={setSleep}
            minLabel="Très mauvaise"
            maxLabel="Excellente"
            gold={GOLD}
            border={BORDER}
            bg={isDark ? '#2A2540' : '#F8F5EE'}
            text={WHITE}
            textMuted={MUTED}
          />
        </View>

        {/* ── Note optionnelle ── */}
        <View style={[styles.card, { backgroundColor: CARD_BG, borderColor: BORDER }]}>
          <Text style={[styles.cardTitle, { color: WHITE }]}>✍️ Une note (optionnel)</Text>
          <TextInput
            style={[styles.noteInput, { backgroundColor: isDark ? '#2A2540' : '#F8F5EE', borderColor: BORDER, color: WHITE }]}
            placeholder="Comment vous sentez-vous vraiment ? Rêves, pensées, émotions..."
            placeholderTextColor={MUTED}
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            returnKeyType="default"
          />
        </View>

        {/* ── Bouton soumettre ── */}
        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            {
              backgroundColor: mood ? GOLD : (isDark ? '#2A2540' : '#E8E0D0'),
              shadowColor: mood ? GOLD : 'transparent',
              opacity: pressed || createCheckIn.isPending ? 0.82 : 1,
            },
          ]}
          onPress={handleSubmit}
          disabled={!mood || createCheckIn.isPending}
        >
          {mood ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={{ fontSize: 20 }}>{MOOD_EMOJIS[mood]}</Text>
              <Text style={[styles.submitButtonText, { color: isDark ? '#0D0B1A' : '#FFFFFF' }]}>
                {createCheckIn.isPending ? 'Enregistrement...' : 'Enregistrer mon check-in'}
              </Text>
            </View>
          ) : (
            <Text style={[styles.submitButtonText, { color: MUTED }]}>
              Choisissez votre humeur d'abord
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
function makeStyles(isDark: boolean) {
  const TEXT1 = isDark ? '#F0EBE0' : '#1C1410';
  const TEXT2 = isDark ? 'rgba(240,235,224,0.65)' : 'rgba(60,40,20,0.65)';
  const GOLD_C = isDark ? '#C8A96E' : '#8B6914';
  const BORD = isDark ? 'rgba(200,169,110,0.35)' : 'rgba(139,105,20,0.22)';
  const SHADOW = isDark
    ? { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.22, shadowRadius: 10, elevation: 5 }
    : { shadowColor: '#5C3D0A', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.09, shadowRadius: 8, elevation: 3 };

  return StyleSheet.create({
    scroll: { paddingHorizontal: 20, paddingTop: 8 },

    header: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingVertical: 14, marginBottom: 6,
    },
    headerBackBtn: {
      width: 36, height: 36, borderRadius: 18,
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 1,
    },
    headerTitle: {
      fontFamily: 'PlayfairDisplay-Medium',
      fontSize: 17,
    },

    pageSubtitle: {
      fontSize: 13, textAlign: 'center', lineHeight: 18,
      marginBottom: 20, paddingHorizontal: 20,
    },

    card: {
      borderRadius: 20, borderWidth: 1, padding: 18,
      marginBottom: 16,
      ...SHADOW,
    },
    cardTitle: {
      fontFamily: 'PlayfairDisplay-Medium',
      fontSize: 15, marginBottom: 16,
    },

    moodGrid: {
      flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    },
    moodItem: {
      borderRadius: 14, padding: 10,
      alignItems: 'center', gap: 5,
    },
    moodEmoji: { fontSize: 26 },
    moodLabel: { fontSize: 10, fontWeight: '600', textAlign: 'center' },

    noteInput: {
      borderRadius: 14, borderWidth: 1,
      padding: 14, fontSize: 14, lineHeight: 20,
      minHeight: 100,
    },

    submitButton: {
      borderRadius: 999, paddingVertical: 18,
      alignItems: 'center', marginTop: 8,
      shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.30, shadowRadius: 14, elevation: 7,
    },
    submitButtonText: { fontSize: 16, fontWeight: '800' },

    // Done state
    doneTitle: {
      fontFamily: 'PlayfairDisplay-Medium',
      fontSize: 26, marginBottom: 10, textAlign: 'center',
    },
    doneSubtitle: {
      fontSize: 14, lineHeight: 21, textAlign: 'center', marginBottom: 28,
    },
    recapCard: {
      width: '100%', borderRadius: 20, padding: 22,
      borderWidth: 1.5, marginBottom: 16,
      alignItems: 'center',
      ...SHADOW,
    },
    recapMoodLabel: {
      fontFamily: 'PlayfairDisplay-Medium',
      fontSize: 20,
    },
    recommendCard: {
      width: '100%', borderRadius: 20, padding: 20,
      borderWidth: 1, marginBottom: 16,
      ...SHADOW,
    },
    recommendLabel: {
      fontSize: 11, fontWeight: '700', textTransform: 'uppercase',
      letterSpacing: 0.8, marginBottom: 6,
    },
    recommendTitle: {
      fontFamily: 'PlayfairDisplay-Medium',
      fontSize: 18, marginBottom: 4,
    },
    recommendSub: { fontSize: 13, lineHeight: 18, marginBottom: 14 },
    recommendButton: {
      borderRadius: 999, paddingVertical: 13, alignItems: 'center',
    },
    recommendButtonText: {
      color: '#0D0B1A', fontSize: 14, fontWeight: '800',
    },
    closeButton: {
      borderRadius: 999, paddingVertical: 14, paddingHorizontal: 32,
      borderWidth: 1, alignItems: 'center',
    },
    closeButtonText: { fontSize: 14, fontWeight: '600' },
  });
}
