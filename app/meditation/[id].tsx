import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Image, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useUser } from '@/lib/user-context';
import { MEDITATIONS, CATEGORY_LABELS } from '@/lib/mock-data';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { PremiumBadge } from '@/components/ui/premium-badge';

export default function MeditationPlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const { favorites, toggleFavorite, profile, addSessionHistory } = useUser();

  const meditation = MEDITATIONS.find((m) => m.id === id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalSeconds = (meditation?.duration || 10) * 60;

  const isLocked = meditation?.isPremium && !profile?.isPremium;
  const isFav = meditation ? favorites.includes(meditation.id) : false;

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setElapsed((e) => {
          const next = e + 1;
          setProgress(next / totalSeconds);
          if (next >= totalSeconds) {
            setIsPlaying(false);
            handleComplete(Math.floor(next / 60));
            if (intervalRef.current) clearInterval(intervalRef.current);
          }
          return next;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying]);

  async function handleComplete(minutes: number) {
    if (!meditation) return;
    await addSessionHistory({
      meditationId: meditation.id,
      duration: minutes || 1,
    });
  }

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  if (!meditation) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.muted }}>Méditation introuvable</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover image with gradient overlay */}
        <View style={styles.coverContainer}>
          <Image source={{ uri: meditation.coverImage }} style={styles.coverImage} />
          <LinearGradient
            colors={['transparent', colors.background]}
            style={styles.coverGradient}
          />
          {/* Close button */}
          <Pressable
            style={({ pressed }) => [
              styles.closeButton,
              { backgroundColor: 'rgba(0,0,0,0.4)', opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={22} color="#FFFFFF" />
          </Pressable>
          {/* Favorite button */}
          <Pressable
            style={({ pressed }) => [
              styles.favButton,
              { backgroundColor: 'rgba(0,0,0,0.4)', opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => toggleFavorite(meditation.id)}
          >
            <IconSymbol
              name={isFav ? 'heart.fill' : 'heart'}
              size={20}
              color={isFav ? '#F9A8D4' : '#FFFFFF'}
            />
          </Pressable>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Meta */}
          <View style={styles.metaRow}>
            <Text style={[styles.category, { color: colors.primary }]}>
              {CATEGORY_LABELS[meditation.category]}
            </Text>
            {meditation.isPremium && <PremiumBadge small />}
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>{meditation.title}</Text>
          <Text style={[styles.description, { color: colors.muted }]}>{meditation.description}</Text>

          {/* Tags */}
          <View style={styles.tags}>
            {meditation.tags.map((tag) => (
              <View key={tag} style={[styles.tag, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.tagText, { color: colors.muted }]}>{tag}</Text>
              </View>
            ))}
          </View>

          {/* Player */}
          {isLocked ? (
            <View style={[styles.lockedPlayer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <IconSymbol name="lock.fill" size={28} color={colors.muted} />
              <Text style={[styles.lockedTitle, { color: colors.foreground }]}>Contenu Premium</Text>
              <Text style={[styles.lockedSub, { color: colors.muted }]}>
                Débloquez cette méditation et bien plus encore avec Premium.
              </Text>
              <Pressable
                style={({ pressed }) => [
                  styles.unlockButton,
                  { backgroundColor: '#F59E0B', opacity: pressed ? 0.85 : 1 },
                ]}
                onPress={() => router.back()}
              >
                <Text style={styles.unlockButtonText}>Passer à Premium</Text>
              </Pressable>
            </View>
          ) : (
            <View style={[styles.player, { backgroundColor: colors.surface }]}>
              {/* Progress bar */}
              <View style={styles.progressContainer}>
                <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.progressFill,
                      { backgroundColor: colors.primary, width: `${progress * 100}%` },
                    ]}
                  />
                </View>
                <View style={styles.timeRow}>
                  <Text style={[styles.timeText, { color: colors.muted }]}>{formatTime(elapsed)}</Text>
                  <Text style={[styles.timeText, { color: colors.muted }]}>{formatTime(totalSeconds)}</Text>
                </View>
              </View>

              {/* Controls */}
              <View style={styles.controls}>
                <Pressable
                  style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                  onPress={() => setElapsed(Math.max(0, elapsed - 15))}
                >
                  <IconSymbol name="backward.fill" size={28} color={colors.foreground} />
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.playButton,
                    { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
                  ]}
                  onPress={() => setIsPlaying(!isPlaying)}
                >
                  <IconSymbol
                    name={isPlaying ? 'pause.fill' : 'play.fill'}
                    size={28}
                    color="#FFFFFF"
                  />
                </Pressable>

                <Pressable
                  style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                  onPress={() => setElapsed(Math.min(totalSeconds, elapsed + 15))}
                >
                  <IconSymbol name="forward.fill" size={28} color={colors.foreground} />
                </Pressable>
              </View>

              <Text style={[styles.playerHint, { color: colors.muted }]}>
                {isPlaying ? 'En cours de lecture...' : 'Appuyez pour commencer'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  coverContainer: {
    position: 'relative',
    height: 280,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  closeButton: {
    position: 'absolute',
    top: 52,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favButton: {
    position: 'absolute',
    top: 52,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  category: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  tag: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 12,
  },
  player: {
    borderRadius: 20,
    padding: 20,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    marginBottom: 16,
  },
  playButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C084FC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  playerHint: {
    fontSize: 12,
    textAlign: 'center',
  },
  lockedPlayer: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    alignItems: 'center',
    gap: 10,
  },
  lockedTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  lockedSub: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  unlockButton: {
    borderRadius: 999,
    paddingVertical: 13,
    paddingHorizontal: 28,
    marginTop: 8,
  },
  unlockButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
