import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { trpc } from '@/lib/trpc';
import { useThemeContext } from '@/lib/theme-provider';

const ACTION_ROUTES: Record<string, string> = {
  meditate: '/(tabs)/explore',
  breathe: '/breathing',
  journal: '/(tabs)/journal',
  sleep: '/sleep-tracker',
  chat: '/chat',
};

const ACTION_LABELS: Record<string, string> = {
  meditate: 'Méditer maintenant',
  breathe: 'Exercice de respiration',
  journal: 'Écrire dans le journal',
  sleep: 'Suivre mon sommeil',
  chat: 'Parler avec Yoya',
};

const GOLD = '#C8A96E';
const GOLD_DARK = '#A8854A';

export function AIDailyCard({ mood }: { mood?: string }) {
  const { isDark } = useThemeContext();
  const [rec, setRec] = useState<{ title: string; message: string; action: string; emoji: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.97)).current;

  const mutation = trpc.ai.dailyRecommendation.useMutation({
    onSuccess: (data) => {
      setRec(data);
      setLoading(false);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 8, useNativeDriver: true }),
      ]).start();
    },
    onError: () => {
      setError(true);
      setLoading(false);
    },
  });

  useEffect(() => {
    setLoading(true);
    setError(false);
    mutation.mutate({ mood, hour: new Date().getHours() });
  }, []);

  const CARD_BG = isDark ? 'rgba(30,24,50,0.95)' : 'rgba(255,252,245,0.97)';
  const TEXT_MAIN = isDark ? '#EDE8DC' : '#1C1410';
  const TEXT_SOFT = isDark ? 'rgba(237,232,220,0.6)' : 'rgba(28,20,16,0.55)';

  if (error) return null;

  return (
    <Animated.View style={[styles.wrapper, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      <LinearGradient
        colors={isDark ? ['rgba(200,169,110,0.12)', 'rgba(200,169,110,0.04)'] : ['rgba(200,169,110,0.10)', 'rgba(200,169,110,0.02)']}
        style={[styles.card, { backgroundColor: CARD_BG, borderColor: `${GOLD}30` }]}
      >
        {/* Badge IA */}
        <View style={[styles.aiBadge, { backgroundColor: `${GOLD}20` }]}>
          <Text style={[styles.aiBadgeText, { color: GOLD }]}>✦ Yoya IA</Text>
        </View>

        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={GOLD} />
            <Text style={[styles.loadingText, { color: TEXT_SOFT }]}>Yoya prépare votre conseil…</Text>
          </View>
        ) : rec ? (
          <>
            <View style={styles.contentRow}>
              <Text style={styles.recEmoji}>{rec.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.recTitle, { color: TEXT_MAIN }]}>{rec.title}</Text>
                <Text style={[styles.recMessage, { color: TEXT_SOFT }]}>{rec.message}</Text>
              </View>
            </View>
            <Pressable
              style={({ pressed }) => [styles.actionBtn, { backgroundColor: GOLD, opacity: pressed ? 0.85 : 1 }]}
              onPress={() => router.push(ACTION_ROUTES[rec.action] as never)}
            >
              <Text style={styles.actionBtnText}>{ACTION_LABELS[rec.action] ?? 'Commencer'} →</Text>
            </Pressable>
          </>
        ) : null}
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginHorizontal: 0, marginBottom: 4 },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  aiBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    marginBottom: 4,
  },
  aiBadgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  loadingText: { fontSize: 13 },
  contentRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  recEmoji: { fontSize: 32, lineHeight: 38 },
  recTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4, lineHeight: 20 },
  recMessage: { fontSize: 13, lineHeight: 19 },
  actionBtn: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  actionBtnText: { color: '#1C1410', fontSize: 13, fontWeight: '700' },
});
