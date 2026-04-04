import React, { useState, useMemo} from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { StarField } from '@/components/star-field';
import { useColors } from '@/hooks/use-colors';
import { MOOD_EMOJIS, MOOD_LABELS, ADAPTIVE_JOURNEYS } from '@/lib/mock-data';
import type { MoodState } from '@/shared/wellness-types';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/hooks/use-auth';
import { useThemeContext } from '@/lib/theme-provider';

// Styles statiques pour les sous-composants (avant le composant principal)
const styles = {} as ReturnType<typeof makeStyles>;


const MOODS: MoodState[] = ['calm', 'happy', 'grateful', 'neutral', 'tired', 'anxious', 'sad', 'overwhelmed'];

function ScaleSelector({
  value,
  onChange,
  label,
  gold,
  glass,
  border,
  lav,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
  gold: string;
  glass: string;
  border: string;
  lav: string;
}) {
  return (
    <View style={styles.scaleContainer}>
      <Text style={[styles.scaleLabel, { color: lav }]}>{label}</Text>
      <View style={styles.scaleButtons}>
        {[1, 2, 3, 4, 5].map((v) => (
          <Pressable
            key={v}
            style={({ pressed }) => [
              styles.scaleButton,
              {
                backgroundColor: value >= v ? gold : glass,
                borderColor: value >= v ? gold : border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            onPress={() => onChange(v)}
          >
            <Text style={[styles.scaleButtonText, { color: value >= v ? '#FFF' : lav }]}>
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
  const { isDark } = useThemeContext();
  const styles = useMemo(() => makeStyles(isDark), [isDark]);
  const { isAuthenticated } = useAuth();

  // Palette dynamique
  const CI_GOLD    = isDark ? '#C8A96E' : '#8B6914';
  const CI_WHITE   = isDark ? '#EDE8DC' : '#1C1410';
  const CI_LAV     = isDark ? 'rgba(240,235,224,0.65)' : 'rgba(80,60,140,0.70)';
  const CI_BORDER  = isDark ? 'rgba(200,169,110,0.40)' : 'rgba(120,100,180,0.18)';
  const CI_GLASS   = isDark ? '#2A2540' : 'rgba(255,255,255,0.70)';
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
    <ScreenContainer containerClassName={isDark ? 'bg-[#0D0B1A]' : 'bg-[#FAF7F2]'}>
      <StarField />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
            onPress={() => router.back()}
          >
            <IconSymbol name="xmark" size={22} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: CI_WHITE }]}>Check-in émotionnel</Text>
          <View style={{ width: 22 }} />
        </View>

        {/* Mood selector */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: CI_WHITE }]}>
            Comment vous sentez-vous en ce moment ?
          </Text>
          <View style={styles.moodGrid}>
            {MOODS.map((m) => (
              <Pressable
                key={m}
                style={({ pressed }) => [
                  styles.moodItem,
                  {
                    backgroundColor: mood === m ? `${CI_GOLD}20` : CI_GLASS,
                    borderColor: mood === m ? CI_GOLD : CI_BORDER,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
                onPress={() => setMood(m)}
              >
                <Text style={styles.moodEmoji}>{MOOD_EMOJIS[m]}</Text>
                <Text style={[styles.moodLabel, { color: mood === m ? CI_GOLD : CI_LAV }]}>
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
            gold={CI_GOLD} glass={CI_GLASS} border={CI_BORDER} lav={CI_LAV}
          />
          <ScaleSelector
            value={energy}
            onChange={setEnergy}
            label="Niveau d'énergie (1 = épuisée, 5 = pleine d'énergie)"
            gold={CI_GOLD} glass={CI_GLASS} border={CI_BORDER} lav={CI_LAV}
          />
          <ScaleSelector
            value={sleep}
            onChange={setSleep}
            label="Qualité du sommeil (1 = très mauvaise, 5 = excellente)"
            gold={CI_GOLD} glass={CI_GLASS} border={CI_BORDER} lav={CI_LAV}
          />
        </View>

        {/* Note */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: CI_WHITE }]}>
            Une note (optionnel)
          </Text>
          <TextInput
            style={[
              styles.noteInput,
              { backgroundColor: CI_GLASS, borderColor: CI_BORDER, color: CI_WHITE },
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
              backgroundColor: mood ? CI_GOLD : CI_BORDER,
            shadowColor: CI_GOLD,
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
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontFamily: 'PlayfairDisplay-Medium',
    fontSize: 16,
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
    padding: 10,
    alignItems: 'center',
    gap: 4,
    shadowColor: isDark ? '#000' : '#1C1410', shadowOffset: { width: 0, height: 3 }, shadowOpacity: isDark ? 0.25 : 0.10, shadowRadius: isDark ? 10 : 8, elevation: isDark ? 6 : 4,
  },
  moodEmoji: {
    fontSize: 24,
  },
  moodLabel: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  scaleContainer: {
    marginBottom: 20,
  },
  scaleLabel: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  scaleButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  noteInput: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    fontSize: 14,
    lineHeight: 20,
    minHeight: 100,
  },
  submitButton: {
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  submitButtonText: {
    color: '#0D0B1A',
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
    marginBottom: 10,
    textAlign: 'center',
  },
  doneSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 32,
  },
  recommendCard: {
    width: '100%',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: isDark ? '#000' : '#1C1410', shadowOffset: { width: 0, height: 3 }, shadowOpacity: isDark ? 0.25 : 0.10, shadowRadius: isDark ? 10 : 8, elevation: isDark ? 6 : 4,
  },
  recommendLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  recommendTitle: {
    fontFamily: 'PlayfairDisplay-Medium',
    fontSize: 18,
    marginBottom: 4,
  },
  recommendSub: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  recommendButton: {
    borderRadius: 999,
    paddingVertical: 13,
    alignItems: 'center',
  },
  recommendButtonText: {
    color: '#0D0B1A',
    fontSize: 14,
    fontWeight: '800',
  },
  closeButton: {
    borderRadius: 999,
    paddingVertical: 13,
    paddingHorizontal: 32,
    borderWidth: 1,
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  });
}
