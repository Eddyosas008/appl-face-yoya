import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { MOOD_EMOJIS, MOOD_LABELS, ADAPTIVE_JOURNEYS } from '@/lib/mock-data';
import type { MoodState } from '@/shared/wellness-types';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/hooks/use-auth';

const MOODS: MoodState[] = ['calm', 'happy', 'grateful', 'neutral', 'tired', 'anxious', 'sad', 'overwhelmed'];

function ScaleSelector({
  value,
  onChange,
  label,
  colors,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.scaleContainer}>
      <Text style={[styles.scaleLabel, { color: colors.foreground }]}>{label}</Text>
      <View style={styles.scaleButtons}>
        {[1, 2, 3, 4, 5].map((v) => (
          <Pressable
            key={v}
            style={({ pressed }) => [
              styles.scaleButton,
              {
                backgroundColor: value >= v ? colors.primary : colors.surface,
                borderColor: value >= v ? colors.primary : colors.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            onPress={() => onChange(v)}
          >
            <Text style={[styles.scaleButtonText, { color: value >= v ? '#FFF' : colors.muted }]}>
              {v}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// Map MoodState to DB mood enum
type DbMood = 'anxious' | 'sad' | 'neutral' | 'calm' | 'happy' | 'energetic' | 'grateful';
const MOOD_MAP: Partial<Record<MoodState, DbMood>> = {
  calm: 'calm', happy: 'happy', grateful: 'grateful', neutral: 'neutral',
  anxious: 'anxious', sad: 'sad', tired: 'neutral', overwhelmed: 'anxious',
};

export default function CheckInScreen() {
  const colors = useColors();
  const { isAuthenticated } = useAuth();
  const [mood, setMood] = useState<MoodState | null>(null);
  const [stress, setStress] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [sleep, setSleep] = useState(3);
  const [note, setNote] = useState('');
  const [isDone, setIsDone] = useState(false);

  const createCheckIn = trpc.checkIns.create.useMutation();

  async function handleSubmit() {
    if (!mood) return;
    const dbMood = MOOD_MAP[mood] ?? 'neutral';
    const intensity = Math.round((stress + energy) / 2);
    if (isAuthenticated) {
      await createCheckIn.mutateAsync({
        mood: dbMood,
        intensity: intensity * 2, // scale 1-5 to 1-10
        note: note.trim() || undefined,
        triggers: JSON.stringify({ stress, energy, sleep }),
      });
    }
    setIsDone(true);
  }

  // Recommend a journey based on mood
  const recommendedJourney = mood
    ? ADAPTIVE_JOURNEYS.find((j) => j.mood.includes(mood))
    : null;

  if (isDone) {
    return (
      <ScreenContainer>
        <View style={styles.doneContainer}>
          <Text style={styles.doneEmoji}>✨</Text>
          <Text style={[styles.doneTitle, { color: colors.foreground }]}>
            Check-in enregistré
          </Text>
          <Text style={[styles.doneSubtitle, { color: colors.muted }]}>
            Merci pour votre honnêteté. Prendre soin de soi commence par se connaître.
          </Text>

          {recommendedJourney && (
            <View style={[styles.recommendCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.recommendLabel, { color: colors.muted }]}>Recommandé pour vous</Text>
              <Text style={[styles.recommendTitle, { color: colors.foreground }]}>
                {recommendedJourney.title}
              </Text>
              <Text style={[styles.recommendSub, { color: colors.muted }]}>
                {recommendedJourney.subtitle}
              </Text>
              <Pressable
                style={({ pressed }) => [
                  styles.recommendButton,
                  { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
                ]}
                onPress={() => {
                  router.back();
                  router.push(`/journey/${recommendedJourney.id}` as never);
                }}
              >
                <Text style={styles.recommendButtonText}>Commencer ce parcours</Text>
              </Pressable>
            </View>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.closeButton,
              { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => router.back()}
          >
            <Text style={[styles.closeButtonText, { color: colors.muted }]}>Retour à l'accueil</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
            onPress={() => router.back()}
          >
            <IconSymbol name="xmark" size={22} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Check-in émotionnel</Text>
          <View style={{ width: 22 }} />
        </View>

        {/* Mood selector */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Comment vous sentez-vous en ce moment ?
          </Text>
          <View style={styles.moodGrid}>
            {MOODS.map((m) => (
              <Pressable
                key={m}
                style={({ pressed }) => [
                  styles.moodItem,
                  {
                    backgroundColor: mood === m ? `${colors.primary}20` : colors.surface,
                    borderColor: mood === m ? colors.primary : colors.border,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
                onPress={() => setMood(m)}
              >
                <Text style={styles.moodEmoji}>{MOOD_EMOJIS[m]}</Text>
                <Text style={[styles.moodLabel, { color: mood === m ? colors.primary : colors.muted }]}>
                  {MOOD_LABELS[m]}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Scales */}
        <View style={styles.section}>
          <ScaleSelector
            value={stress}
            onChange={setStress}
            label="Niveau de stress (1 = très bas, 5 = très élevé)"
            colors={colors}
          />
          <ScaleSelector
            value={energy}
            onChange={setEnergy}
            label="Niveau d'énergie (1 = épuisée, 5 = pleine d'énergie)"
            colors={colors}
          />
          <ScaleSelector
            value={sleep}
            onChange={setSleep}
            label="Qualité du sommeil (1 = très mauvaise, 5 = excellente)"
            colors={colors}
          />
        </View>

        {/* Note */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Une note (optionnel)
          </Text>
          <TextInput
            style={[
              styles.noteInput,
              { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground },
            ]}
            placeholder="Comment vous sentez-vous vraiment ?"
            placeholderTextColor={colors.muted}
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Submit */}
        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            {
              backgroundColor: mood ? colors.primary : colors.border,
              opacity: pressed || createCheckIn.isPending ? 0.8 : 1,
            },
          ]}
          onPress={handleSubmit}
          disabled={!mood || createCheckIn.isPending}
        >
          <Text style={styles.submitButtonText}>
            {createCheckIn.isPending ? 'Enregistrement...' : 'Enregistrer mon check-in'}
          </Text>
        </Pressable>

        <View style={{ height: 32 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

// ─── Palette SomnioPax v3 ────────────────────────────────────────────────
const CI_GOLD    = '#C9A84C';
const CI_WHITE   = '#EDE9FF';
const CI_LAV     = 'rgba(184,174,255,0.55)';
const CI_LAV_DIM = 'rgba(184,174,255,0.35)';
const CI_BORDER  = 'rgba(180,160,255,0.12)';
const CI_GLASS   = 'rgba(255,255,255,0.04)';

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    marginBottom: 8,
  },
  headerTitle: {
    fontFamily: 'PlayfairDisplay-Medium',
    fontSize: 16,
    color: CI_WHITE,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontFamily: 'PlayfairDisplay-Medium',
    fontSize: 16,
    color: CI_WHITE,
    lineHeight: 22,
    marginBottom: 14,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  moodItem: {
    width: '22%',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: CI_BORDER,
    backgroundColor: CI_GLASS,
    padding: 10,
    alignItems: 'center',
    gap: 4,
  },
  moodEmoji: {
    fontSize: 24,
  },
  moodLabel: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    color: CI_LAV,
  },
  scaleContainer: {
    marginBottom: 20,
  },
  scaleLabel: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
    color: CI_LAV,
  },
  scaleButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  scaleButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CI_BORDER,
    backgroundColor: CI_GLASS,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scaleButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: CI_LAV,
  },
  noteInput: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: CI_BORDER,
    backgroundColor: CI_GLASS,
    padding: 14,
    fontSize: 14,
    lineHeight: 20,
    minHeight: 100,
    color: CI_WHITE,
  },
  submitButton: {
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: CI_GOLD,
    shadowColor: CI_GOLD,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  submitButtonText: {
    color: '#03020F',
    fontSize: 16,
    fontWeight: '800',
  },
  // Done state
  doneContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  doneEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  doneTitle: {
    fontFamily: 'PlayfairDisplay-Medium',
    fontSize: 26,
    color: CI_WHITE,
    marginBottom: 10,
    textAlign: 'center',
  },
  doneSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 32,
    color: CI_LAV,
  },
  recommendCard: {
    width: '100%',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: CI_BORDER,
    backgroundColor: CI_GLASS,
    marginBottom: 16,
  },
  recommendLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    color: CI_GOLD,
  },
  recommendTitle: {
    fontFamily: 'PlayfairDisplay-Medium',
    fontSize: 18,
    color: CI_WHITE,
    marginBottom: 4,
  },
  recommendSub: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
    color: CI_LAV,
  },
  recommendButton: {
    borderRadius: 999,
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: CI_GOLD,
  },
  recommendButtonText: {
    color: '#03020F',
    fontSize: 14,
    fontWeight: '800',
  },
  closeButton: {
    borderRadius: 999,
    paddingVertical: 13,
    paddingHorizontal: 32,
    borderWidth: 1,
    borderColor: CI_BORDER,
    backgroundColor: CI_GLASS,
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: CI_LAV,
  },
});
