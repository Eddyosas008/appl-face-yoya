import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Image } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing } from 'react-native-reanimated';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useUser } from '@/lib/user-context';
import { useAuth } from '@/hooks/use-auth';
import { trpc } from '@/lib/trpc';
import { MEDITATIONS, ADAPTIVE_JOURNEYS, MOOD_EMOJIS, MOOD_LABELS } from '@/lib/mock-data';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { PremiumBadge } from '@/components/ui/premium-badge';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bonjour';
  if (hour < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

export default function HomeScreen() {
  const colors = useColors();
  const { profile, checkIns, sessionHistory, favorites } = useUser();
  const { isAuthenticated } = useAuth();

  // Charger le profil depuis le backend pour avoir le vrai prénom
  const { data: backendProfile } = trpc.profile.get.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Prénom : priorité backend > local > fallback
  const firstName = backendProfile?.firstName || profile?.firstName || 'vous';

  // Fade-in animation on mount
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(20);
  useEffect(() => {
    fadeAnim.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) });
    slideAnim.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.ease) });
  }, []);
  const animStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: slideAnim.value }],
  }));

  const lastCheckIn = checkIns[0];
  const featuredMeditation = MEDITATIONS.find((m) => !m.isPremium) || MEDITATIONS[0];
  const featuredJourney = ADAPTIVE_JOURNEYS[0];
  const recentSessions = sessionHistory.slice(0, 3);
  const favoriteMeditations = MEDITATIONS.filter((m) => favorites.includes(m.id)).slice(0, 3);

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <Animated.View style={animStyle}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.greeting, { color: colors.muted }]}>{getGreeting()},</Text>
            <Text style={[styles.userName, { color: colors.foreground }]}>
              {firstName} ✨
            </Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.notificationButton,
              { backgroundColor: colors.surface, opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => {}}
          >
            <IconSymbol name="bell" size={20} color={colors.foreground} />
          </Pressable>
        </View>

        {/* Emotional Check-in Card */}
        <Pressable
          style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
          onPress={() => router.push('/checkin' as never)}
        >
          <LinearGradient
            colors={['#C084FC', '#7C3AED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.checkInCard}
          >
            <View style={styles.checkInContent}>
              <View>
                <Text style={styles.checkInLabel}>Comment vous sentez-vous ?</Text>
                {lastCheckIn ? (
                  <Text style={styles.checkInMood}>
                    {MOOD_EMOJIS[lastCheckIn.mood]} {MOOD_LABELS[lastCheckIn.mood]}
                  </Text>
                ) : (
                  <Text style={styles.checkInSubtitle}>Faites votre check-in du jour</Text>
                )}
              </View>
              <View style={styles.checkInButton}>
                <IconSymbol name="chevron.right" size={18} color="#FFFFFF" />
              </View>
            </View>
          </LinearGradient>
        </Pressable>

        {/* Progress snapshot */}
        <View style={[styles.statsRow, { backgroundColor: colors.surface }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {profile?.totalSessions || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Sessions</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {profile?.totalMinutes || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Minutes</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {profile?.currentStreak || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Jours 🔥</Text>
          </View>
        </View>

        {/* Meditation du jour */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Méditation du jour</Text>
            <Pressable onPress={() => router.push('/(tabs)/explore')}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>Voir tout</Text>
            </Pressable>
          </View>
          <Pressable
            style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
            onPress={() => router.push(`/meditation/${featuredMeditation.id}` as never)}
          >
            <View style={[styles.meditationCard, { backgroundColor: colors.surface }]}>
              <Image
                source={{ uri: featuredMeditation.coverImage }}
                style={styles.meditationImage}
              />
              <View style={styles.meditationInfo}>
                <Text style={[styles.meditationCategory, { color: colors.primary }]}>
                  {featuredMeditation.category.replace('_', ' ')}
                </Text>
                <Text style={[styles.meditationTitle, { color: colors.foreground }]}>
                  {featuredMeditation.title}
                </Text>
                <View style={styles.meditationMeta}>
                  <IconSymbol name="clock.fill" size={13} color={colors.muted} />
                  <Text style={[styles.meditationDuration, { color: colors.muted }]}>
                    {featuredMeditation.duration} min
                  </Text>
                </View>
              </View>
              <View style={[styles.playButton, { backgroundColor: colors.primary }]}>
                <IconSymbol name="play.fill" size={16} color="#FFFFFF" />
              </View>
            </View>
          </Pressable>
        </View>

        {/* Adaptive Journey */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Parcours adaptatif</Text>
            <Pressable onPress={() => router.push('/(tabs)/journeys')}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>Voir tout</Text>
            </Pressable>
          </View>
          <Pressable
            style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
            onPress={() => router.push(`/journey/${featuredJourney.id}` as never)}
          >
            <LinearGradient
              colors={featuredJourney.coverGradient as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.journeyCard}
            >
              <Text style={styles.journeyTitle}>{featuredJourney.title}</Text>
              <Text style={styles.journeySubtitle}>{featuredJourney.subtitle}</Text>
              <View style={styles.journeyMeta}>
                <View style={styles.journeyBadge}>
                  <Text style={styles.journeyBadgeText}>{featuredJourney.duration} min</Text>
                </View>
                <View style={styles.journeyBadge}>
                  <Text style={styles.journeyBadgeText}>{featuredJourney.steps.length} étapes</Text>
                </View>
              </View>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Favorites */}
        {favoriteMeditations.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Vos favoris</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {favoriteMeditations.map((med) => (
                <Pressable
                  key={med.id}
                  style={({ pressed }) => [
                    styles.favCard,
                    { backgroundColor: colors.surface, opacity: pressed ? 0.85 : 1 },
                  ]}
                  onPress={() => router.push(`/meditation/${med.id}` as never)}
                >
                  <Image source={{ uri: med.coverImage }} style={styles.favImage} />
                  <Text style={[styles.favTitle, { color: colors.foreground }]} numberOfLines={2}>
                    {med.title}
                  </Text>
                  <Text style={[styles.favDuration, { color: colors.muted }]}>{med.duration} min</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Actions rapides</Text>
          <View style={styles.quickActions}>
            <Pressable
              style={({ pressed }) => [styles.quickBtn, { backgroundColor: `#7C3AED20`, opacity: pressed ? 0.8 : 1 }]}
              onPress={() => router.push('/breathing' as never)}
            >
              <Text style={styles.quickEmoji}>🫁</Text>
              <Text style={[styles.quickLabel, { color: colors.foreground }]}>Respiration</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.quickBtn, { backgroundColor: `#10B98120`, opacity: pressed ? 0.8 : 1 }]}
              onPress={() => router.push('/progress' as never)}
            >
              <Text style={styles.quickEmoji}>📊</Text>
              <Text style={[styles.quickLabel, { color: colors.foreground }]}>Progression</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.quickBtn, { backgroundColor: `#F59E0B20`, opacity: pressed ? 0.8 : 1 }]}
              onPress={() => router.push('/(tabs)/journal' as never)}
            >
              <Text style={styles.quickEmoji}>📖</Text>
              <Text style={[styles.quickLabel, { color: colors.foreground }]}>Journal</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.quickBtn, { backgroundColor: `#EC489920`, opacity: pressed ? 0.8 : 1 }]}
              onPress={() => router.push('/chat' as never)}
            >
              <Text style={styles.quickEmoji}>💬</Text>
              <Text style={[styles.quickLabel, { color: colors.foreground }]}>Chat IA</Text>
            </Pressable>
          </View>
        </View>

        {/* Chat IA CTA */}
        <Pressable
          style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
          onPress={() => router.push('/chat' as never)}
        >
          <View style={[styles.chatCta, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.chatIcon, { backgroundColor: `${colors.primary}20` }]}>
              <IconSymbol name="bubble.left.fill" size={22} color={colors.primary} />
            </View>
            <View style={styles.chatCtaText}>
              <Text style={[styles.chatCtaTitle, { color: colors.foreground }]}>
                Besoin de soutien ?
              </Text>
              <Text style={[styles.chatCtaSubtitle, { color: colors.muted }]}>
                Parlez à votre assistante bien-être
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={18} color={colors.muted} />
          </View>
        </Pressable>

        <View style={{ height: 24 }} />
        </Animated.View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerLeft: {},
  greeting: {
    fontSize: 14,
    marginBottom: 2,
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkInCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },
  checkInContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkInLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginBottom: 4,
  },
  checkInMood: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  checkInSubtitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  checkInButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: '80%',
    alignSelf: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
  },
  meditationCard: {
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  meditationImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  meditationInfo: {
    flex: 1,
  },
  meditationCategory: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  meditationTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  meditationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  meditationDuration: {
    fontSize: 12,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  journeyCard: {
    borderRadius: 20,
    padding: 20,
  },
  journeyTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  journeySubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginBottom: 14,
  },
  journeyMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  journeyBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  journeyBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  horizontalScroll: {
    marginHorizontal: -4,
  },
  favCard: {
    width: 130,
    borderRadius: 16,
    marginHorizontal: 4,
    padding: 10,
  },
  favImage: {
    width: '100%',
    height: 90,
    borderRadius: 10,
    marginBottom: 8,
  },
  favTitle: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: 2,
  },
  favDuration: {
    fontSize: 11,
  },
  chatCta: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    gap: 12,
  },
  chatIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatCtaText: {
    flex: 1,
  },
  chatCtaTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  chatCtaSubtitle: {
    fontSize: 12,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  quickBtn: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  quickEmoji: {
    fontSize: 24,
  },
  quickLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
});
