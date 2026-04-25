import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Modal,
  TextInput, TouchableOpacity, Animated, Platform, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useUser } from '@/lib/user-context';
import { useAuth } from '@/hooks/use-auth';
import { trpc } from '@/lib/trpc';
import { PremiumBadge } from '@/components/ui/premium-badge';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { MOOD_EMOJIS, MOOD_LABELS } from '@/lib/mock-data';
import { AnimatedScreen } from '@/components/animated-screen';
import { StarField } from '@/components/star-field';
import { ReminderSettings } from '@/components/reminder-settings';
import { DailyGoalPicker } from '@/components/daily-goal-picker';
import { useThemeContext } from '@/lib/theme-provider';

type ThemeMode = 'light' | 'dark' | 'system';

const PREMIUM_FEATURES = [
  { icon: '🧘‍♀️', text: 'Accès illimité aux 50+ méditations' },
  { icon: '🌿', text: 'Tous les parcours adaptatifs' },
  { icon: '💜', text: 'Chat IA sans limite' },
  { icon: '📊', text: 'Analyses avancées de progression' },
  { icon: '🌙', text: 'Méditations de sommeil exclusives' },
  { icon: '✨', text: 'Contenu premium mis à jour chaque semaine' },
];

const PLANS = [
  { id: 'monthly', label: 'Mensuel', price: '9,99 €', period: '/mois', popular: false, saving: '' },
  { id: 'yearly', label: 'Annuel', price: '59,99 €', period: '/an', popular: true, saving: 'Économisez 60%' },
];

// Calcul du niveau utilisateur selon les minutes totales
function getUserLevel(totalMinutes: number): { label: string; emoji: string; next: number; color: string } {
  if (totalMinutes < 60)  return { label: 'Débutant',      emoji: '🌱', next: 60,   color: '#4ADE80' };
  if (totalMinutes < 300) return { label: 'Explorateur',   emoji: '🌿', next: 300,  color: '#34D399' };
  if (totalMinutes < 900) return { label: 'Pratiquant',    emoji: '🧘', next: 900,  color: '#60A5FA' };
  if (totalMinutes < 2700)return { label: 'Méditant',      emoji: '🌸', next: 2700, color: '#A78BFA' };
  return                         { label: 'Maître du calme', emoji: '✨', next: 9999, color: '#C8A96E' };
}

// Composant score circulaire
function CircularScore({ score, size = 80, color }: { score: number; size?: number; color: string }) {
  const animVal = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(animVal, { toValue: score, duration: 900, useNativeDriver: false }).start();
  }, [score]);
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - score / 100);
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', width: size, height: size, borderRadius: size / 2, borderWidth: 5, borderColor: 'rgba(200,169,110,0.15)' }} />
      <View style={{ position: 'absolute', width: size, height: size, borderRadius: size / 2, borderWidth: 5, borderColor: color, borderTopColor: 'transparent', borderRightColor: score > 50 ? color : 'transparent', transform: [{ rotate: `${(score / 100) * 360 - 90}deg` }] }} />
      <Text style={{ fontSize: size * 0.22, fontWeight: '700', color }}>{score}</Text>
      <Text style={{ fontSize: size * 0.12, color: 'rgba(200,169,110,0.7)' }}>/ 100</Text>
    </View>
  );
}

// Composant ligne de paramètre
function SettingRow({
  icon, label, value, onPress, isLast = false, isDark, colors,
  description, danger = false,
}: {
  icon: string; label: string; value?: string; onPress?: () => void;
  isLast?: boolean; isDark: boolean; colors: any; description?: string; danger?: boolean;
}) {
  const BORD = isDark ? 'rgba(200,169,110,0.25)' : 'rgba(139,105,20,0.18)';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14,
        gap: 12, borderBottomWidth: isLast ? 0 : 0.5, borderBottomColor: BORD,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text style={{ fontSize: 20, width: 28 }}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, color: danger ? '#F87171' : colors.foreground, fontWeight: '500' }}>{label}</Text>
        {description && <Text style={{ fontSize: 11, color: colors.muted, marginTop: 1 }}>{description}</Text>}
      </View>
      {value && <Text style={{ fontSize: 12, color: colors.muted, marginRight: 4 }}>{value}</Text>}
      {onPress && !danger && <IconSymbol name="chevron.right" size={15} color={colors.muted} />}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const { isDark, themeMode, setThemeMode } = useThemeContext();
  const styles = useMemo(() => makeStyles(isDark), [isDark]);
  const { profile, checkIns, logout, updateProfile } = useUser();
  const { isAuthenticated, user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const [showPremium, setShowPremium] = useState(false);
  const [showEditName, setShowEditName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Animations d'entrée
  const headerAnim = useRef(new Animated.Value(0)).current;
  const statsAnim  = useRef(new Animated.Value(0)).current;
  const cardsAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(100, [
      Animated.timing(headerAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(statsAnim,  { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(cardsAnim,  { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  // Données backend
  const { data: backendProfile, refetch: refetchProfile } = trpc.profile.get.useQuery(
    undefined, { enabled: isAuthenticated }
  );
  const { data: completedPrograms } = trpc.programs.completed.useQuery(
    undefined, { enabled: isAuthenticated }
  );
  const { data: inProgressPrograms = [] } = trpc.programs.inProgress.useQuery(
    undefined, { enabled: isAuthenticated }
  );
  const { data: wellnessData } = trpc.stats.wellnessScore.useQuery(
    undefined, { enabled: isAuthenticated }
  );
  const { data: profileStats } = trpc.profile.stats.useQuery(
    undefined, { enabled: isAuthenticated }
  );

  const updateProfileMutation = trpc.profile.update.useMutation({
    onSuccess: () => refetchProfile(),
  });

  const firstName = backendProfile?.firstName || profile?.firstName || 'Vous';
  const totalSessions = profileStats?.totalSessions ?? profile?.totalSessions ?? 0;
  const totalMinutes  = profileStats?.totalMinutes  ?? profile?.totalMinutes  ?? 0;
  const currentStreak = profileStats?.currentStreak ?? profile?.currentStreak ?? 0;
  const longestStreak = profileStats?.longestStreak ?? profile?.longestStreak ?? 0;
  const level = getUserLevel(totalMinutes);
  const wellnessScore = wellnessData?.score ?? 0;
  const wellnessLabel = wellnessData?.label ?? 'Pas de données';

  // Humeur dominante cette semaine
  const recentMoods = checkIns.slice(0, 7);
  const moodCounts = recentMoods.reduce((acc: Record<string, number>, ci) => {
    acc[ci.mood] = (acc[ci.mood] || 0) + 1;
    return acc;
  }, {});
  const topMoodEntry = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];

  async function handleSaveName() {
    const trimmed = editNameValue.trim();
    if (!trimmed) return;
    await updateProfile({ firstName: trimmed });
    if (isAuthenticated) {
      await updateProfileMutation.mutateAsync({ firstName: trimmed });
    }
    setShowEditName(false);
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  async function handleLogout() {
    setShowLogoutConfirm(false);
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await logout();
  }

  function toggleSection(key: string) {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedSection(prev => prev === key ? null : key);
  }

  // ── Vue Premium ──────────────────────────────────────────────────────────────
  if (showPremium) {
    return (
      <ScreenContainer>
        <ScrollView contentContainerStyle={styles.premiumScroll} showsVerticalScrollIndicator={false}>
          <Pressable
            style={({ pressed }) => [styles.closeBtn, { opacity: pressed ? 0.6 : 1 }]}
            onPress={() => setShowPremium(false)}
          >
            <IconSymbol name="xmark" size={20} color={colors.foreground} />
          </Pressable>
          <LinearGradient colors={['#1A0A2E', '#7C3AED']} style={styles.premiumHero}>
            <Text style={styles.premiumHeroEmoji}>✨</Text>
            <Text style={styles.premiumHeroTitle}>SomnioPax Premium</Text>
            <Text style={styles.premiumHeroSubtitle}>Votre bien-être, sans limites</Text>
          </LinearGradient>
          <View style={styles.premiumFeatures}>
            {PREMIUM_FEATURES.map((f, i) => (
              <View key={i} style={styles.premiumFeatureRow}>
                <Text style={styles.premiumFeatureIcon}>{f.icon}</Text>
                <Text style={[styles.premiumFeatureText, { color: colors.foreground }]}>{f.text}</Text>
              </View>
            ))}
          </View>
          <View style={styles.plans}>
            {PLANS.map((plan) => (
              <Pressable
                key={plan.id}
                style={({ pressed }) => [
                  styles.planCard,
                  { borderColor: selectedPlan === plan.id ? colors.primary : colors.border, backgroundColor: colors.surface, opacity: pressed ? 0.85 : 1 },
                ]}
                onPress={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <View style={[styles.popularBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.popularBadgeText}>Populaire</Text>
                  </View>
                )}
                {plan.saving ? (
                  <View style={[styles.savingBadge, { backgroundColor: '#22C55E' }]}>
                    <Text style={styles.savingBadgeText}>{plan.saving}</Text>
                  </View>
                ) : null}
                <Text style={[styles.planLabel, { color: colors.foreground }]}>{plan.label}</Text>
                <Text style={[styles.planPrice, { color: colors.primary }]}>{plan.price}</Text>
                <Text style={[styles.planPeriod, { color: colors.muted }]}>{plan.period}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            style={({ pressed }) => [styles.subscribeButton, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
            onPress={() => setShowPremium(false)}
          >
            <Text style={styles.subscribeButtonText}>Commencer l'essai gratuit 7 jours</Text>
          </Pressable>
          <Text style={[styles.premiumDisclaimer, { color: colors.muted }]}>
            Sans engagement. Annulez à tout moment. Aucun paiement requis pendant l'essai.
          </Text>
        </ScrollView>
      </ScreenContainer>
    );
  }

  // ── Vue principale ───────────────────────────────────────────────────────────
  const GOLD_C = isDark ? '#C8A96E' : '#8B6914';
  const CARD   = isDark ? '#2A2540' : '#FFFFFF';
  const BORD   = isDark ? 'rgba(200,169,110,0.35)' : 'rgba(139,105,20,0.22)';

  return (
    <ScreenContainer containerClassName={isDark ? 'bg-[#0D0B1A]' : 'bg-[#FAF7F2]'}>
      <StarField />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── HEADER PROFIL ──────────────────────────────────────────────── */}
        <Animated.View style={[styles.headerSection, { opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
          <LinearGradient
            colors={isDark ? ['#1A0A3A', '#0D0B1A'] : ['#EDE8DC', '#FAF7F2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.headerCard, { borderColor: BORD }]}
          >
            {/* Avatar + infos */}
            <View style={styles.headerTop}>
              <View style={styles.avatarWrapper}>
                <LinearGradient
                  colors={isDark ? ['#3D2E1A', '#2A1F0E'] : ['#F5EDD4', '#EDE0B8']}
                  style={styles.avatarGradient}
                >
                  <Text style={[styles.avatarText, { color: GOLD_C }]}>
                    {(firstName).charAt(0).toUpperCase()}
                  </Text>
                </LinearGradient>
                {/* Badge niveau */}
                <View style={[styles.levelBadge, { backgroundColor: level.color + '22', borderColor: level.color + '55' }]}>
                  <Text style={{ fontSize: 12 }}>{level.emoji}</Text>
                </View>
              </View>

              <View style={styles.headerInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={[styles.profileName, { color: colors.foreground }]} numberOfLines={1}>
                    {firstName}
                  </Text>
                  <Pressable
                    onPress={() => { setEditNameValue(firstName); setShowEditName(true); }}
                    style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
                  >
                    <IconSymbol name="pencil" size={14} color={GOLD_C} />
                  </Pressable>
                </View>

                <Text style={[styles.levelLabel, { color: level.color }]}>
                  {level.emoji} {level.label}
                </Text>

                {profile?.isPremium ? (
                  <PremiumBadge small />
                ) : (
                  <Pressable
                    style={({ pressed }) => [styles.upgradeBadge, { opacity: pressed ? 0.7 : 1 }]}
                    onPress={() => setShowPremium(true)}
                  >
                    <Text style={[styles.upgradeBadgeText, { color: GOLD_C }]}>✨ Passer à Premium</Text>
                  </Pressable>
                )}
              </View>
            </View>

            {/* Barre de progression niveau */}
            <View style={styles.levelProgressContainer}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                <Text style={[styles.levelProgressLabel, { color: colors.muted }]}>
                  {totalMinutes} min méditées
                </Text>
                <Text style={[styles.levelProgressLabel, { color: colors.muted }]}>
                  Prochain : {level.next === 9999 ? '∞' : `${level.next} min`}
                </Text>
              </View>
              <View style={[styles.levelProgressBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
                <LinearGradient
                  colors={[level.color, '#F0D090']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.levelProgressFill,
                    {
                      width: level.next === 9999 ? '100%' : `${Math.min(100, (totalMinutes / level.next) * 100)}%` as any,
                    },
                  ]}
                />
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ── STATISTIQUES ──────────────────────────────────────────────── */}
        <Animated.View style={{ opacity: statsAnim, transform: [{ translateY: statsAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Mes statistiques</Text>
          <View style={[styles.statsGrid, { borderColor: BORD }]}>
            {[
              { value: String(totalSessions), label: 'Sessions', icon: '🧘', color: '#60A5FA' },
              { value: `${totalMinutes}m`,    label: 'Minutes',  icon: '⏱️', color: '#A78BFA' },
              { value: `${currentStreak}j`, label: 'Série actuelle', icon: '🔥', color: '#FB923C' },
              { value: `${longestStreak}j`, label: 'Meilleure série', icon: '🏆', color: GOLD_C },
            ].map((stat, i) => (
              <View key={i} style={[styles.statCard, { backgroundColor: CARD, borderColor: BORD }]}>
                <Text style={styles.statIcon}>{stat.icon}</Text>
                <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: colors.muted }]}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* ── SCORE BIEN-ÊTRE ────────────────────────────────────────────── */}
        <Animated.View style={{ opacity: cardsAnim, transform: [{ translateY: cardsAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
          {isAuthenticated && (
            <View style={[styles.wellnessCard, { backgroundColor: CARD, borderColor: BORD }]}>
              <View style={styles.wellnessLeft}>
                <Text style={[styles.wellnessTitle, { color: colors.foreground }]}>Score bien-être</Text>
                <Text style={[styles.wellnessSubtitle, { color: colors.muted }]}>Basé sur vos 7 derniers jours</Text>
                <Text style={[styles.wellnessLabel, { color: GOLD_C }]}>{wellnessLabel}</Text>
                {wellnessData && (
                  <View style={styles.wellnessBreakdown}>
                    {[
                      { label: 'Humeur', score: wellnessData.moodScore, color: '#A78BFA' },
                      { label: 'Sommeil', score: wellnessData.sleepScore, color: '#60A5FA' },
                      { label: 'Régularité', score: wellnessData.consistencyScore, color: '#4ADE80' },
                    ].map((item, i) => (
                      <View key={i} style={styles.wellnessBreakdownRow}>
                        <Text style={[styles.wellnessBreakdownLabel, { color: colors.muted }]}>{item.label}</Text>
                        <View style={[styles.wellnessBreakdownBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}>
                          <View style={[styles.wellnessBreakdownFill, { width: `${item.score}%` as any, backgroundColor: item.color }]} />
                        </View>
                        <Text style={[styles.wellnessBreakdownScore, { color: item.color }]}>{item.score}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
              <CircularScore score={wellnessScore} size={88} color={GOLD_C} />
            </View>
          )}

          {/* Lien stats avancées */}
          <Pressable
            style={({ pressed }) => [styles.statsAdvancedBtn, { backgroundColor: isDark ? 'rgba(200,169,110,0.10)' : 'rgba(139,105,20,0.07)', borderColor: BORD, opacity: pressed ? 0.8 : 1 }]}
            onPress={() => router.push('/stats' as never)}
          >
            <Text style={styles.statsAdvancedEmoji}>📊</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.statsAdvancedTitle, { color: colors.foreground }]}>Statistiques avancées</Text>
              <Text style={[styles.statsAdvancedSub, { color: colors.muted }]}>Graphiques 30j · Score bien-être · Tendances</Text>
            </View>
            <IconSymbol name="chevron.right" size={18} color={GOLD_C} />
          </Pressable>
        </Animated.View>

        {/* ── HUMEUR DOMINANTE ───────────────────────────────────────────── */}
        {topMoodEntry && (
          <View style={[styles.moodRecap, { backgroundColor: isDark ? 'rgba(200,169,110,0.08)' : 'rgba(139,105,20,0.05)', borderColor: isDark ? 'rgba(200,169,110,0.20)' : 'rgba(139,105,20,0.15)' }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.moodRecapLabel, { color: GOLD_C }]}>Humeur dominante cette semaine</Text>
              <Text style={[styles.moodRecapText, { color: colors.foreground }]}>
                {MOOD_EMOJIS[topMoodEntry[0] as keyof typeof MOOD_EMOJIS]} {MOOD_LABELS[topMoodEntry[0] as keyof typeof MOOD_LABELS]}
              </Text>
            </View>
            <Pressable
              style={({ pressed }) => [styles.moodRecapBtn, { backgroundColor: GOLD_C + '22', opacity: pressed ? 0.7 : 1 }]}
              onPress={() => router.push('/checkin' as never)}
            >
              <Text style={[{ fontSize: 11, color: GOLD_C, fontWeight: '600' }]}>Check-in</Text>
            </Pressable>
          </View>
        )}

        {/* ── PROGRAMMES EN COURS ────────────────────────────────────────── */}
        {isAuthenticated && inProgressPrograms.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Programmes en cours 📊</Text>
            <View style={styles.completedList}>
              {inProgressPrograms.map((prog: any) => (
                <TouchableOpacity
                  key={prog.id}
                  activeOpacity={0.85}
                  style={styles.completedCard}
                  onPress={() => router.push(`/program-day/${prog.programSlug}/${prog.nextDay}` as never)}
                >
                  <LinearGradient
                    colors={[prog.programCoverColor ?? '#1E1B4B', prog.programCoverColor2 ?? '#312E81']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={styles.completedCardGradient}
                  >
                    <View style={styles.completedCardLeft}>
                      <Text style={styles.completedCardEmoji}>{prog.programEmoji}</Text>
                      <View style={styles.completedCardInfo}>
                        <Text style={styles.completedCardTitle} numberOfLines={1}>{prog.programTitle}</Text>
                        <View style={styles.completedCardMeta}>
                          <View style={[styles.completedBadge, { backgroundColor: 'rgba(99,102,241,0.25)' }]}>
                            <Text style={[styles.completedBadgeText, { color: '#818CF8' }]}>Jour {prog.nextDay}/{prog.programDurationDays}</Text>
                          </View>
                          <Text style={styles.completedCardLevel}>{prog.progressPct}% complété</Text>
                        </View>
                        <View style={[styles.inProgressBarBg, { marginTop: 4 }]}>
                          <View style={[styles.inProgressBarFill, { width: `${prog.progressPct}%` as any }]} />
                        </View>
                      </View>
                    </View>
                    <View style={styles.completedCardRight}>
                      <Text style={styles.completedCardChevron}>›</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* ── PROGRAMMES TERMINÉS ────────────────────────────────────────── */}
        {isAuthenticated && completedPrograms && completedPrograms.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Programmes terminés 🏆</Text>
            <View style={styles.completedList}>
              {completedPrograms.map((prog) => {
                const completionDate = prog.completedAt
                  ? new Date(prog.completedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                  : null;
                const startDate = prog.startedAt
                  ? new Date(prog.startedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
                  : null;
                const durationDays = prog.programDurationDays ?? prog.completedDaysCount;
                const levelLabel = prog.programLevel === 'beginner' ? 'Débutant'
                  : prog.programLevel === 'intermediate' ? 'Intermédiaire' : 'Avancé';
                return (
                  <TouchableOpacity
                    key={prog.id}
                    activeOpacity={0.85}
                    style={styles.completedCard}
                    onPress={() => router.push(`/program/${prog.programSlug}` as never)}
                  >
                    <LinearGradient
                      colors={[prog.programCoverColor ?? '#1E1B4B', prog.programCoverColor2 ?? '#312E81']}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                      style={styles.completedCardGradient}
                    >
                      <View style={styles.completedCardLeft}>
                        <Text style={styles.completedCardEmoji}>{prog.programEmoji}</Text>
                        <View style={styles.completedCardInfo}>
                          <Text style={styles.completedCardTitle} numberOfLines={1}>{prog.programTitle}</Text>
                          <View style={styles.completedCardMeta}>
                            <View style={styles.completedBadge}>
                              <Text style={styles.completedBadgeText}>✓ Terminé</Text>
                            </View>
                            <Text style={styles.completedCardLevel}>{levelLabel}</Text>
                          </View>
                          <Text style={styles.completedCardDays}>{durationDays} jours · {startDate && completionDate ? `${startDate} → ${completionDate}` : completionDate ?? ''}</Text>
                        </View>
                      </View>
                      <View style={styles.completedCardRight}>
                        <Text style={styles.completedTrophy}>🏆</Text>
                        <Text style={styles.completedCardChevron}>›</Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {/* ── OBJECTIF QUOTIDIEN ─────────────────────────────────────────── */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Objectif quotidien 🎯</Text>
        <DailyGoalPicker />

        {/* ── RAPPELS ────────────────────────────────────────────────────── */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Rappels 🔔</Text>
        <ReminderSettings />

        {/* ── PARAMÈTRES ─────────────────────────────────────────────────── */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Paramètres</Text>

        {/* Thème */}
        <View style={[styles.settingsGroup, { backgroundColor: CARD, borderColor: BORD }]}>
          <View style={[styles.settingRowInner, { borderBottomWidth: 0.5, borderBottomColor: BORD }]}>
            <Text style={{ fontSize: 20, width: 28 }}>{isDark ? '🌙' : '☀️'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, color: colors.foreground, fontWeight: '500' }}>Mode d'affichage</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => {
                const labels: Record<ThemeMode, string> = { light: '☀️', dark: '🌙', system: '📱' };
                const active = themeMode === mode;
                return (
                  <Pressable
                    key={mode}
                    onPress={() => {
                      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setThemeMode(mode);
                    }}
                    style={({ pressed }) => ({
                      width: 38, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
                      borderWidth: active ? 1.5 : 1,
                      borderColor: active ? GOLD_C : BORD,
                      backgroundColor: active ? GOLD_C + '20' : 'transparent',
                      opacity: pressed ? 0.7 : 1,
                    })}
                  >
                    <Text style={{ fontSize: 14 }}>{labels[mode]}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <SettingRow icon="🌍" label="Langue" value="Français" isLast isDark={isDark} colors={colors} />
        </View>

        {/* Compte */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Compte</Text>
        <View style={[styles.settingsGroup, { backgroundColor: CARD, borderColor: BORD }]}>
          <SettingRow
            icon="✏️" label="Modifier le prénom" value={firstName}
            onPress={() => { setEditNameValue(firstName); setShowEditName(true); }}
            isDark={isDark} colors={colors}
          />
          <SettingRow
            icon="🔑"
            label={user?.loginMethod === 'email' ? 'Changer le mot de passe' : 'Créer un mot de passe'}
            description={user?.loginMethod === 'email' ? 'Modifier votre mot de passe actuel' : 'Ajouter un mot de passe à votre compte'}
            onPress={() => router.push('/(auth)/change-password' as never)}
            isDark={isDark} colors={colors}
          />
          <SettingRow icon="🔒" label="Confidentialité" onPress={() => {}} isDark={isDark} colors={colors} />
          <SettingRow icon="⭐" label="Évaluer l'application" onPress={() => {}} isLast isDark={isDark} colors={colors} />
        </View>

        {/* Premium CTA */}
        {!profile?.isPremium && (
          <Pressable
            style={({ pressed }) => [styles.premiumCta, { opacity: pressed ? 0.85 : 1 }]}
            onPress={() => setShowPremium(true)}
          >
            <LinearGradient colors={['#C8A96E', '#8B6914']} style={styles.premiumCtaGradient}>
              <Text style={styles.premiumCtaText}>✨ Découvrir SomnioPax Premium</Text>
              <Text style={styles.premiumCtaSub}>Essai gratuit 7 jours · Sans engagement</Text>
            </LinearGradient>
          </Pressable>
        )}

        {/* Administration */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Administration</Text>
        <View style={[styles.settingsGroup, { backgroundColor: CARD, borderColor: BORD }]}>
          <SettingRow
            icon="🎧" label="Gestion audio des programmes"
            description="Ajouter des URLs audio aux jours"
            onPress={() => router.push('/admin/audio-manager' as never)}
            isDark={isDark} colors={colors}
          />
          <SettingRow
            icon="🎵" label="Sons de relaxation"
            description="Gérer les URLs audio des sons ambiants"
            onPress={() => router.push('/admin/ambient-manager' as never)}
            isLast isDark={isDark} colors={colors}
          />
        </View>

        {/* Déconnexion */}
        <Pressable
          style={({ pressed }) => [styles.logoutButton, { borderColor: isDark ? 'rgba(248,113,113,0.4)' : 'rgba(239,68,68,0.3)', opacity: pressed ? 0.75 : 1 }]}
          onPress={() => setShowLogoutConfirm(true)}
        >
          <IconSymbol name="arrow.right" size={16} color="#F87171" />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </Pressable>

        <Text style={[styles.version, { color: colors.muted }]}>SomnioPax v1.0.0</Text>
      </ScrollView>

      {/* ── MODAL ÉDITION PRÉNOM ──────────────────────────────────────────── */}
      <Modal visible={showEditName} animationType="slide" presentationStyle="pageSheet" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.background, borderColor: BORD }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Modifier votre prénom</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.surface, borderColor: editNameValue ? GOLD_C : BORD, color: colors.foreground }]}
              placeholder="Votre prénom"
              placeholderTextColor={colors.muted}
              value={editNameValue}
              onChangeText={setEditNameValue}
              autoCapitalize="words"
              autoCorrect={false}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleSaveName}
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={({ pressed }) => [styles.modalCancelBtn, { borderColor: BORD, opacity: pressed ? 0.7 : 1 }]}
                onPress={() => setShowEditName(false)}
              >
                <Text style={[styles.modalCancelText, { color: colors.muted }]}>Annuler</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.modalSaveBtn, { backgroundColor: editNameValue.trim() ? GOLD_C : colors.border, opacity: pressed ? 0.8 : 1 }]}
                onPress={handleSaveName}
                disabled={!editNameValue.trim() || updateProfileMutation.isPending}
              >
                <Text style={[styles.modalSaveText, { color: isDark ? '#0D0B1A' : '#FAF7F2' }]}>
                  {updateProfileMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── MODAL CONFIRMATION DÉCONNEXION ────────────────────────────────── */}
      <Modal visible={showLogoutConfirm} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.background, borderColor: BORD }]}>
            <Text style={{ fontSize: 32, textAlign: 'center', marginBottom: 12 }}>👋</Text>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Se déconnecter ?</Text>
            <Text style={[{ fontSize: 14, color: colors.muted, textAlign: 'center', marginBottom: 24, lineHeight: 20 }]}>
              Vos données locales seront conservées. Vous pourrez vous reconnecter à tout moment.
            </Text>
            <View style={styles.modalButtons}>
              <Pressable
                style={({ pressed }) => [styles.modalCancelBtn, { borderColor: BORD, opacity: pressed ? 0.7 : 1 }]}
                onPress={() => setShowLogoutConfirm(false)}
              >
                <Text style={[styles.modalCancelText, { color: colors.muted }]}>Annuler</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.modalSaveBtn, { backgroundColor: '#EF4444', opacity: pressed ? 0.8 : 1 }]}
                onPress={handleLogout}
              >
                <Text style={[styles.modalSaveText, { color: '#FFF' }]}>Déconnecter</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

// ── STYLES ────────────────────────────────────────────────────────────────────
const GOLD_P = '#C8A96E';
const NIGHT_BG_P = '#0D0B1A';
const WHITE_SOFT_P = '#EDE8DC';
const LAVENDER_P = 'rgba(237,233,255,0.55)';

function makeStyles(isDark: boolean) {
  const CARD  = isDark ? '#2A2540' : '#FFFFFF';
  const TEXT1 = isDark ? '#F0EBE0' : '#1C1410';
  const TEXT2 = isDark ? 'rgba(240,235,224,0.65)' : 'rgba(60,40,20,0.65)';
  const GOLD_C = isDark ? '#C8A96E' : '#8B6914';
  const BORD  = isDark ? 'rgba(200,169,110,0.35)' : 'rgba(139,105,20,0.22)';

  return StyleSheet.create({
    scroll: { paddingHorizontal: 18, paddingBottom: 120 },

    // Header
    headerSection: { marginTop: 20, marginBottom: 20 },
    headerCard: { borderRadius: 22, borderWidth: 1, padding: 18 },
    headerTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 16 },
    avatarWrapper: { position: 'relative' },
    avatarGradient: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: GOLD_C + '55' },
    avatarText: { fontSize: 30, fontFamily: 'PlayfairDisplay-Medium', color: GOLD_P },
    levelBadge: { position: 'absolute', bottom: -4, right: -4, width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
    headerInfo: { flex: 1, gap: 5, paddingTop: 4 },
    profileName: { fontSize: 20, fontFamily: 'PlayfairDisplay-Medium', color: WHITE_SOFT_P, flexShrink: 1 },
    levelLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
    upgradeBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', backgroundColor: isDark ? 'rgba(200,169,110,0.12)' : 'rgba(139,105,20,0.08)', borderWidth: 0.5, borderColor: GOLD_C + '40' },
    upgradeBadgeText: { fontSize: 11, fontWeight: '600', letterSpacing: 0.3 },
    levelProgressContainer: {},
    levelProgressLabel: { fontSize: 10, letterSpacing: 0.2 },
    levelProgressBg: { height: 5, borderRadius: 3, overflow: 'hidden' },
    levelProgressFill: { height: 5, borderRadius: 3 },

    // Stats
    sectionTitle: { fontSize: 17, fontFamily: 'PlayfairDisplay-Medium', color: WHITE_SOFT_P, marginBottom: 10, marginTop: 6 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
    statCard: { flex: 1, minWidth: '44%', borderRadius: 16, borderWidth: 1, padding: 12, alignItems: 'center', gap: 3, shadowColor: isDark ? '#000' : '#1C1410', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.20 : 0.07, shadowRadius: 8, elevation: 3 },
    statIcon: { fontSize: 20 },
    statValue: { fontSize: 20, fontFamily: 'PlayfairDisplay-Medium' },
    statLabel: { fontSize: 9, letterSpacing: 0.2, textAlign: 'center', lineHeight: 13 },

    // Wellness
    wellnessCard: { borderRadius: 20, borderWidth: 1, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 12, shadowColor: isDark ? '#000' : '#1C1410', shadowOffset: { width: 0, height: 3 }, shadowOpacity: isDark ? 0.22 : 0.08, shadowRadius: 10, elevation: 4 },
    wellnessLeft: { flex: 1, gap: 4 },
    wellnessTitle: { fontSize: 16, fontFamily: 'PlayfairDisplay-Medium' },
    wellnessSubtitle: { fontSize: 11 },
    wellnessLabel: { fontSize: 13, fontWeight: '700', marginTop: 2 },
    wellnessBreakdown: { gap: 6, marginTop: 8 },
    wellnessBreakdownRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    wellnessBreakdownLabel: { fontSize: 10, width: 60 },
    wellnessBreakdownBg: { flex: 1, height: 4, borderRadius: 2, overflow: 'hidden' },
    wellnessBreakdownFill: { height: 4, borderRadius: 2 },
    wellnessBreakdownScore: { fontSize: 10, fontWeight: '700', width: 24, textAlign: 'right' },

    // Stats avancées
    statsAdvancedBtn: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 14, gap: 12, marginBottom: 20, borderWidth: 1 },
    statsAdvancedEmoji: { fontSize: 24 },
    statsAdvancedTitle: { fontSize: 14, fontWeight: '600' },
    statsAdvancedSub: { fontSize: 11, marginTop: 2 },

    // Mood recap
    moodRecap: { borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 12 },
    moodRecapLabel: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
    moodRecapText: { fontSize: 16, fontFamily: 'PlayfairDisplay-Medium' },
    moodRecapBtn: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },

    // Settings
    settingsGroup: { borderRadius: 18, marginBottom: 20, overflow: 'hidden', borderWidth: 1, shadowColor: isDark ? '#000' : '#1C1410', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.18 : 0.06, shadowRadius: 8, elevation: 3 },
    settingRowInner: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },

    // Premium CTA
    premiumCta: { borderRadius: 18, overflow: 'hidden', marginBottom: 20 },
    premiumCtaGradient: { paddingVertical: 18, paddingHorizontal: 20, alignItems: 'center', gap: 4 },
    premiumCtaText: { color: NIGHT_BG_P, fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },
    premiumCtaSub: { color: NIGHT_BG_P + 'CC', fontSize: 11 },

    // Logout
    logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 999, paddingVertical: 14, borderWidth: 0.5, marginBottom: 16 },
    logoutText: { fontSize: 14, fontWeight: '600', color: '#F87171' },
    version: { fontSize: 11, textAlign: 'center', letterSpacing: 0.3, marginBottom: 8 },

    // Modal
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
    modalCard: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40, borderTopWidth: 1 },
    modalTitle: { fontSize: 20, fontFamily: 'PlayfairDisplay-Medium', marginBottom: 20, textAlign: 'center' },
    modalInput: { borderRadius: 14, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, marginBottom: 20 },
    modalButtons: { flexDirection: 'row', gap: 12 },
    modalCancelBtn: { flex: 1, borderRadius: 999, paddingVertical: 14, alignItems: 'center', borderWidth: 0.5 },
    modalCancelText: { fontSize: 14 },
    modalSaveBtn: { flex: 1, borderRadius: 999, paddingVertical: 14, alignItems: 'center' },
    modalSaveText: { fontSize: 14, fontWeight: '700' },

    // Programmes
    completedList: { gap: 12, marginBottom: 24 },
    completedCard: { borderRadius: 16, overflow: 'hidden' },
    completedCardGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
    completedCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    completedCardEmoji: { fontSize: 32 },
    completedCardInfo: { flex: 1, gap: 4 },
    completedCardTitle: { color: WHITE_SOFT_P, fontSize: 14, fontWeight: '600' },
    completedCardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    completedBadge: { backgroundColor: 'rgba(34,197,94,0.2)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
    completedBadgeText: { color: '#4ADE80', fontSize: 10, fontWeight: '700' },
    completedCardLevel: { color: 'rgba(255,255,255,0.55)', fontSize: 10 },
    completedCardDays: { color: 'rgba(255,255,255,0.5)', fontSize: 10, marginTop: 2 },
    completedCardRight: { alignItems: 'center', gap: 4 },
    completedTrophy: { fontSize: 20 },
    completedCardChevron: { color: 'rgba(255,255,255,0.45)', fontSize: 22, lineHeight: 24 },
    inProgressBarBg: { width: '100%', height: 4, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 2, overflow: 'hidden' },
    inProgressBarFill: { height: 4, backgroundColor: '#4ADE80', borderRadius: 2 },

    // Premium view
    premiumScroll: { paddingBottom: 120 },
    closeBtn: { position: 'absolute', top: 16, right: 16, zIndex: 10, padding: 8 },
    premiumHero: { paddingTop: 60, paddingBottom: 40, alignItems: 'center' },
    premiumHeroEmoji: { fontSize: 48, marginBottom: 12 },
    premiumHeroTitle: { fontFamily: 'PlayfairDisplay-Medium', color: WHITE_SOFT_P, fontSize: 28, marginBottom: 6 },
    premiumHeroSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
    premiumFeatures: { padding: 20, gap: 12 },
    premiumFeatureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    premiumFeatureIcon: { fontSize: 20, width: 30 },
    premiumFeatureText: { fontSize: 14, flex: 1 },
    plans: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 20 },
    planCard: { flex: 1, borderRadius: 16, borderWidth: 0.5, padding: 16, alignItems: 'center', position: 'relative', paddingTop: 24, shadowColor: isDark ? '#000' : '#1C1410', shadowOffset: { width: 0, height: 3 }, shadowOpacity: isDark ? 0.25 : 0.10, shadowRadius: 10, elevation: 6 },
    popularBadge: { position: 'absolute', top: -10, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
    popularBadgeText: { color: NIGHT_BG_P, fontSize: 10, fontWeight: '700' },
    savingBadge: { position: 'absolute', bottom: -10, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
    savingBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
    planLabel: { fontSize: 13, fontWeight: '500', marginBottom: 4 },
    planPrice: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 22 },
    planPeriod: { fontSize: 11 },
    subscribeButton: { marginHorizontal: 20, borderRadius: 999, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
    subscribeButtonText: { color: NIGHT_BG_P, fontSize: 15, fontWeight: '700' },
    premiumDisclaimer: { fontSize: 10, textAlign: 'center', paddingHorizontal: 20 },
  });
}
