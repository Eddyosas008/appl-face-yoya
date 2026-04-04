import React, { useState, useEffect, useMemo} from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Modal, TextInput, Alert, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
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
import { loadNotificationSettings, formatTime, type NotificationSettings, DEFAULT_NOTIFICATION_SETTINGS } from '@/lib/notification-service';
import { ReminderSettings } from '@/components/reminder-settings';
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

export default function ProfileScreen() {
  const colors = useColors();
  const { isDark, themeMode, setThemeMode } = useThemeContext();
  const styles = useMemo(() => makeStyles(isDark), [isDark]);
  const { profile, checkIns, logout, updateProfile } = useUser();
  const { isAuthenticated } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const [showPremium, setShowPremium] = useState(false);
  const [showEditName, setShowEditName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  const [notifSettings, setNotifSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);

  // Charger le profil depuis le backend
  const { data: backendProfile, refetch: refetchProfile } = trpc.profile.get.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Programmes terminés
  const { data: completedPrograms } = trpc.programs.completed.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  // Programmes en cours
  const { data: inProgressPrograms = [] } = trpc.programs.inProgress.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const updateProfileMutation = trpc.profile.update.useMutation({
    onSuccess: () => refetchProfile(),
  });

  // Prénom réel : backend > local
  const firstName = backendProfile?.firstName || profile?.firstName || 'Vous';

  useEffect(() => {
    loadNotificationSettings().then(setNotifSettings);
  }, []);

  async function handleSaveName() {
    const trimmed = editNameValue.trim();
    if (!trimmed) return;
    // Sauvegarder localement
    await updateProfile({ firstName: trimmed });
    // Sauvegarder en DB si connecté
    if (isAuthenticated) {
      await updateProfileMutation.mutateAsync({ firstName: trimmed });
    }
    setShowEditName(false);
  }

  const recentMoods = checkIns.slice(0, 7);
  const moodCounts = recentMoods.reduce((acc: Record<string, number>, ci) => {
    acc[ci.mood] = (acc[ci.mood] || 0) + 1;
    return acc;
  }, {});
  const topMoodEntry = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];

  if (showPremium) {
    return (
      <ScreenContainer>
        <ScrollView contentContainerStyle={styles.premiumScroll} showsVerticalScrollIndicator={false}>
          <Pressable style={({ pressed }) => [styles.closeBtn, { opacity: pressed ? 0.6 : 1 }]} onPress={() => setShowPremium(false)}>
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
                style={({ pressed }) => [styles.planCard, { borderColor: selectedPlan === plan.id ? colors.primary : colors.border, backgroundColor: colors.surface, opacity: pressed ? 0.85 : 1 }]}
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
          <Pressable style={({ pressed }) => [styles.subscribeButton, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]} onPress={() => setShowPremium(false)}>
            <Text style={styles.subscribeButtonText}>Commencer l'essai gratuit 7 jours</Text>
          </Pressable>
          <Text style={[styles.premiumDisclaimer, { color: colors.muted }]}>
            Sans engagement. Annulez à tout moment. Aucun paiement requis pendant l'essai.
          </Text>
        </ScrollView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer containerClassName={isDark ? 'bg-[#0D0B1A]' : 'bg-[#FAF7F2]'}>
      <StarField />
      <AnimatedScreen preset="fadeSlideUp" duration={300}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={[styles.avatarContainer, { backgroundColor: `${colors.primary}20` }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>
              {(profile?.firstName || 'Y').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={[styles.profileName, { color: colors.foreground }]}>{firstName}</Text>
              <Pressable
                style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                onPress={() => { setEditNameValue(firstName); setShowEditName(true); }}
              >
                <Text style={{ fontSize: 14 }}>✏️</Text>
              </Pressable>
            </View>
            <Text style={[styles.profileEmail, { color: colors.muted }]}>{firstName}@yoya.app</Text>
            {profile?.isPremium ? (
              <PremiumBadge small />
            ) : (
              <Pressable style={({ pressed }) => [styles.upgradeBadge, { opacity: pressed ? 0.7 : 1 }]} onPress={() => setShowPremium(true)}>
                <Text style={styles.upgradeBadgeText}>✨ Passer à Premium</Text>
              </Pressable>
            )}
          </View>
        </View>

        <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{profile?.totalSessions || 0}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Sessions</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{profile?.totalMinutes || 0}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Minutes</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{profile?.currentStreak || 0}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Jours 🔥</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{completedPrograms?.length || 0}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Programmes 🏆</Text>
          </View>
        </View>

        {topMoodEntry && (
          <View style={[styles.moodRecap, { backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}20` }]}>
            <Text style={[styles.moodRecapLabel, { color: colors.primary }]}>Humeur dominante cette semaine</Text>
            <Text style={styles.moodRecapEmoji}>{MOOD_EMOJIS[topMoodEntry[0] as keyof typeof MOOD_EMOJIS]}</Text>
            <Text style={[styles.moodRecapText, { color: colors.foreground }]}>{MOOD_LABELS[topMoodEntry[0] as keyof typeof MOOD_LABELS]}</Text>
          </View>
        )}

        {/* Section Programmes en cours */}
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
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
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

        {/* Section Programmes complétés */}
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
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
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

        {/* Lien vers les statistiques avancées */}
        <Pressable
          style={({ pressed }) => [styles.statsAdvancedBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
          onPress={() => router.push('/stats' as never)}
        >
          <Text style={styles.statsAdvancedEmoji}>📊</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.statsAdvancedTitle}>Statistiques avancées</Text>
            <Text style={styles.statsAdvancedSub}>Graphiques 30j · Score bien-être · Tendances</Text>
          </View>
          <Text style={styles.statsAdvancedArrow}>›</Text>
        </Pressable>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Paramètres</Text>
        <View style={[styles.settingsGroup, { backgroundColor: colors.surface }]}>
          {/* Sélecteur de thème : Clair / Sombre / Automatique */}
          <View style={[styles.settingRow, { borderBottomColor: colors.border, flexDirection: 'column', alignItems: 'flex-start', gap: 10 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={styles.settingIcon}>{isDark ? '🌙' : '☀️'}</Text>
              <Text style={[styles.settingLabel, { color: colors.foreground }]}>Mode d'affichage</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8, width: '100%' }}>
              {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => {
                const labels: Record<ThemeMode, string> = { light: '☀️ Clair', dark: '🌙 Sombre', system: '📱 Auto' };
                const active = themeMode === mode;
                const GOLD_C = isDark ? '#C8A96E' : '#8B6914';
                const CARD   = isDark ? '#2A2540' : '#FFFFFF';
                const TEXT1  = isDark ? '#F0EBE0' : '#1C1410';
                const BORD   = isDark ? 'rgba(200,169,110,0.40)' : 'rgba(139,105,20,0.30)';
                return (
                  <Pressable
                    key={mode}
                    onPress={() => setThemeMode(mode)}
                    style={({ pressed }) => ({
                      flex: 1,
                      paddingVertical: 8,
                      paddingHorizontal: 4,
                      borderRadius: 10,
                      borderWidth: active ? 1.5 : 1,
                      borderColor: active ? GOLD_C : BORD,
                      backgroundColor: active ? (isDark ? 'rgba(200,169,110,0.18)' : 'rgba(139,105,20,0.10)') : CARD,
                      alignItems: 'center',
                      opacity: pressed ? 0.75 : 1,
                    })}
                  >
                    <Text style={{ fontSize: 12, color: active ? GOLD_C : TEXT1, fontWeight: active ? '700' : '400', textAlign: 'center' }}>
                      {labels[mode]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <Pressable style={({ pressed }) => [styles.settingRow, { borderBottomColor: colors.border, opacity: pressed ? 0.7 : 1 }]}>
            <Text style={styles.settingIcon}>🎯</Text>
            <Text style={[styles.settingLabel, { color: colors.foreground }]}>Objectif quotidien</Text>
            <View style={styles.settingRight}>
              <Text style={[styles.settingValue, { color: colors.muted }]}>10 min</Text>
              <IconSymbol name="chevron.right" size={16} color={colors.muted} />
            </View>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.settingRow, { opacity: pressed ? 0.7 : 1 }]}>
            <Text style={styles.settingIcon}>🌍</Text>
            <Text style={[styles.settingLabel, { color: colors.foreground }]}>Langue</Text>
            <View style={styles.settingRight}>
              <Text style={[styles.settingValue, { color: colors.muted }]}>Français</Text>
              <IconSymbol name="chevron.right" size={16} color={colors.muted} />
            </View>
          </Pressable>
        </View>

        {/* Rappels de méditation — composant intégré */}
        <ReminderSettings />

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Compte</Text>
        <View style={[styles.settingsGroup, { backgroundColor: colors.surface }]}>
          <Pressable
            style={({ pressed }) => [styles.settingRow, { borderBottomColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
            onPress={() => { setEditNameValue(firstName); setShowEditName(true); }}
          >
            <Text style={styles.settingIcon}>✏️</Text>
            <Text style={[styles.settingLabel, { color: colors.foreground }]}>Modifier le prénom</Text>
            <View style={styles.settingRight}>
              <Text style={[styles.settingValue, { color: colors.muted }]}>{firstName}</Text>
              <IconSymbol name="chevron.right" size={16} color={colors.muted} />
            </View>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.settingRow, { borderBottomColor: colors.border, opacity: pressed ? 0.7 : 1 }]}>
            <Text style={styles.settingIcon}>🔒</Text>
            <Text style={[styles.settingLabel, { color: colors.foreground }]}>Confidentialité</Text>
            <IconSymbol name="chevron.right" size={16} color={colors.muted} />
          </Pressable>
          <Pressable style={({ pressed }) => [styles.settingRow, { opacity: pressed ? 0.7 : 1 }]}>
            <Text style={styles.settingIcon}>⭐</Text>
            <Text style={[styles.settingLabel, { color: colors.foreground }]}>Évaluer l'application</Text>
            <IconSymbol name="chevron.right" size={16} color={colors.muted} />
          </Pressable>
        </View>

        {!profile?.isPremium && (
          <Pressable style={({ pressed }) => [styles.premiumCta, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]} onPress={() => setShowPremium(true)}>
            <Text style={styles.premiumCtaText}>✨ Découvrir Premium</Text>
          </Pressable>
        )}

        {/* Section Administration */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Administration</Text>
        <View style={[styles.settingsGroup, { backgroundColor: colors.surface }]}>
          <Pressable
            style={({ pressed }) => [styles.settingRow, { borderBottomColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
            onPress={() => router.push('/admin/audio-manager' as never)}
          >
            <Text style={styles.settingIcon}>🎧</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingLabel, { color: colors.foreground }]}>Gestion audio des programmes</Text>
              <Text style={[styles.settingSubValue, { color: colors.muted }]}>Ajouter des URLs audio aux jours</Text>
            </View>
            <IconSymbol name="chevron.right" size={16} color={colors.muted} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.settingRow, { borderBottomColor: 'transparent', opacity: pressed ? 0.7 : 1 }]}
            onPress={() => router.push('/admin/ambient-manager' as never)}
          >
            <Text style={styles.settingIcon}>🎵</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingLabel, { color: colors.foreground }]}>Sons de relaxation</Text>
              <Text style={[styles.settingSubValue, { color: colors.muted }]}>Gérer les URLs audio des sons ambiants</Text>
            </View>
            <IconSymbol name="chevron.right" size={16} color={colors.muted} />
          </Pressable>
        </View>

        <Pressable style={({ pressed }) => [styles.logoutButton, { borderColor: colors.error, opacity: pressed ? 0.7 : 1 }]} onPress={logout}>
          <Text style={[styles.logoutText, { color: colors.error }]}>Se déconnecter</Text>
        </Pressable>

        <Text style={[styles.version, { color: colors.muted }]}>SomnioPax v1.0.0</Text>
      </ScrollView>

      {/* Modal d'édition du prénom */}
      <Modal visible={showEditName} animationType="slide" presentationStyle="pageSheet" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Modifier votre prénom</Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: colors.surface,
                  borderColor: editNameValue ? colors.primary : colors.border,
                  color: colors.foreground,
                },
              ]}
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
                style={({ pressed }) => [styles.modalCancelBtn, { borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
                onPress={() => setShowEditName(false)}
              >
                <Text style={[styles.modalCancelText, { color: colors.muted }]}>Annuler</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.modalSaveBtn,
                  { backgroundColor: editNameValue.trim() ? colors.primary : colors.border, opacity: pressed ? 0.8 : 1 },
                ]}
                onPress={handleSaveName}
                disabled={!editNameValue.trim() || updateProfileMutation.isPending}
              >
                <Text style={styles.modalSaveText}>
                  {updateProfileMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      </AnimatedScreen>
    </ScreenContainer>
  );
}

// Constantes palette (statiques pour StyleSheet)
const GOLD_P         = '#C8A96E';
const GOLD_SOFT_P    = 'rgba(201,168,76,0.12)';
const LAVENDER_P     = 'rgba(237,233,255,0.55)';
const LAVENDER_DIM_P = 'rgba(200,169,110,0.40)';
const LAVENDER_MED_P = 'rgba(240,235,224,0.65)';
const WHITE_SOFT_P   = '#EDE8DC';
const NIGHT_BG_P     = '#0D0B1A';
const GLASS_BG_P     = '#2A2540';
const GLASS_BORDER_P = 'rgba(200,169,110,0.40)';

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
  scroll: { paddingHorizontal: 20, paddingBottom: 120 },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingTop: 24, marginBottom: 24 },
  avatarContainer: { width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'rgba(201,168,76,0.45)', shadowColor: GOLD_P, shadowRadius: 12, shadowOpacity: 0.3, shadowOffset: { width: 0, height: 0 } },
  avatarText: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 28, color: GOLD_P },
  profileInfo: { flex: 1, gap: 4 },
  profileName: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 22, color: WHITE_SOFT_P },
  profileEmail: { fontSize: 11, color: LAVENDER_P, letterSpacing: 0.3 },
  upgradeBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', backgroundColor: GOLD_SOFT_P, borderWidth: 0.5, borderColor: 'rgba(212,168,83,0.3)' },
  upgradeBadgeText: { fontSize: 11, fontWeight: '600', color: GOLD_P, letterSpacing: 0.3 },
  statsCard: { flexDirection: 'row', borderRadius: 20, paddingVertical: 18, marginBottom: 16, backgroundColor: GLASS_BG_P, borderWidth: 1, borderColor: GLASS_BORDER_P , shadowColor: isDark ? '#000' : '#1C1410', shadowOffset: { width: 0, height: 3 }, shadowOpacity: isDark ? 0.25 : 0.10, shadowRadius: isDark ? 10 : 8, elevation: isDark ? 6 : 4 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 24, color: GOLD_P, marginBottom: 2 },
  statLabel: { fontSize: 10, color: LAVENDER_MED_P, letterSpacing: 0.3 },
  statDivider: { width: 1, height: '80%', alignSelf: 'center', backgroundColor: LAVENDER_DIM_P },
  moodRecap: { borderRadius: 18, borderWidth: 1, borderColor: 'rgba(201,168,76,0.22)', padding: 14, marginBottom: 24, alignItems: 'center', backgroundColor: GOLD_SOFT_P },
  moodRecapLabel: { fontSize: 9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, color: GOLD_P, marginBottom: 8 },
  moodRecapEmoji: { fontSize: 36, marginBottom: 4 },
  moodRecapText: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 18, color: WHITE_SOFT_P },
  sectionTitle: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 18, color: WHITE_SOFT_P, marginBottom: 10, marginTop: 4 },
  settingsGroup: { borderRadius: 18, marginBottom: 20, overflow: 'hidden', backgroundColor: GLASS_BG_P, borderWidth: 1, borderColor: GLASS_BORDER_P },
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12, borderBottomWidth: 1, borderBottomColor: GLASS_BORDER_P },
  settingIcon: { fontSize: 18, width: 26 },
  settingLabel: { fontSize: 14, color: WHITE_SOFT_P },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  settingValue: { fontSize: 12, color: LAVENDER_P },
  settingSubValue: { fontSize: 11, color: LAVENDER_P, marginTop: 1 },
  notifActiveDot: { width: 7, height: 7, borderRadius: 3.5, marginRight: 4 },
  premiumCta: { borderRadius: 16, paddingVertical: 15, alignItems: 'center', marginBottom: 12, backgroundColor: GOLD_P },
  premiumCtaText: { color: NIGHT_BG_P, fontSize: 14, fontWeight: '700', letterSpacing: 0.3 },
  logoutButton: { borderRadius: 999, paddingVertical: 14, alignItems: 'center', borderWidth: 0.5, borderColor: '#F87171', marginBottom: 16 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalCard: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40, backgroundColor: '#0D0A2A', borderTopWidth: 1, borderColor: GLASS_BORDER_P },
  modalTitle: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 22, color: WHITE_SOFT_P, marginBottom: 20, textAlign: 'center' },
  modalInput: { borderRadius: 14, borderWidth: 0.5, borderColor: GLASS_BORDER_P, backgroundColor: GLASS_BG_P, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: WHITE_SOFT_P, marginBottom: 20 },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalCancelBtn: { flex: 1, borderRadius: 999, paddingVertical: 14, alignItems: 'center', borderWidth: 0.5, borderColor: GLASS_BORDER_P },
  modalCancelText: { fontSize: 14, color: LAVENDER_P },
  modalSaveBtn: { flex: 1, borderRadius: 999, paddingVertical: 14, alignItems: 'center', backgroundColor: GOLD_P },
  modalSaveText: { color: NIGHT_BG_P, fontSize: 14, fontWeight: '700' },
  logoutText: { fontSize: 14, fontWeight: '600', color: '#F87171' },
  version: { fontSize: 11, textAlign: 'center', color: LAVENDER_P, letterSpacing: 0.3 },
  premiumScroll: { paddingBottom: 120 },
  closeBtn: { position: 'absolute', top: 16, right: 16, zIndex: 10, padding: 8 },
  premiumHero: { paddingTop: 60, paddingBottom: 40, alignItems: 'center' },
  premiumHeroEmoji: { fontSize: 48, marginBottom: 12 },
  premiumHeroTitle: { fontFamily: 'PlayfairDisplay-Medium', color: WHITE_SOFT_P, fontSize: 28, marginBottom: 6 },
  premiumHeroSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  premiumFeatures: { padding: 20, gap: 12 },
  premiumFeatureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  premiumFeatureIcon: { fontSize: 20, width: 30 },
  premiumFeatureText: { fontSize: 14, color: WHITE_SOFT_P, flex: 1 },
  plans: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 20 },
  planCard: { flex: 1, borderRadius: 16, borderWidth: 0.5, padding: 16, alignItems: 'center', position: 'relative', paddingTop: 24, backgroundColor: GLASS_BG_P , shadowColor: isDark ? '#000' : '#1C1410', shadowOffset: { width: 0, height: 3 }, shadowOpacity: isDark ? 0.25 : 0.10, shadowRadius: isDark ? 10 : 8, elevation: isDark ? 6 : 4 },
  popularBadge: { position: 'absolute', top: -10, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, backgroundColor: GOLD_P },
  popularBadgeText: { color: NIGHT_BG_P, fontSize: 10, fontWeight: '700' },
  savingBadge: { position: 'absolute', bottom: -10, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, backgroundColor: '#22C55E' },
  savingBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  planLabel: { fontSize: 13, fontWeight: '500', color: WHITE_SOFT_P, marginBottom: 4 },
  planPrice: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 22, color: GOLD_P },
  planPeriod: { fontSize: 11, color: LAVENDER_P },
  subscribeButton: { marginHorizontal: 20, borderRadius: 999, paddingVertical: 16, alignItems: 'center', marginBottom: 12, backgroundColor: GOLD_P },
  subscribeButtonText: { color: NIGHT_BG_P, fontSize: 15, fontWeight: '700' },
  premiumDisclaimer: { fontSize: 10, textAlign: 'center', paddingHorizontal: 20, color: LAVENDER_P },
  // Barre de progression
  inProgressBarBg: { width: '100%', height: 4, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 2, overflow: 'hidden' },
  inProgressBarFill: { height: 4, backgroundColor: '#4ADE80', borderRadius: 2 },
  // Programmes terminés
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
  // Statistiques avancées
  statsAdvancedBtn: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 16, gap: 12, marginBottom: 20, backgroundColor: GOLD_SOFT_P, borderWidth: 0.5, borderColor: 'rgba(212,168,83,0.3)' , shadowColor: isDark ? '#000' : '#1C1410', shadowOffset: { width: 0, height: 3 }, shadowOpacity: isDark ? 0.25 : 0.10, shadowRadius: isDark ? 10 : 8, elevation: isDark ? 6 : 4 },
  statsAdvancedEmoji: { fontSize: 26 },
  statsAdvancedTitle: { color: WHITE_SOFT_P, fontSize: 15, fontWeight: '600' },
  statsAdvancedSub: { color: LAVENDER_P, fontSize: 11, marginTop: 2 },
  statsAdvancedArrow: { color: GOLD_P, fontSize: 26, lineHeight: 28 },
  });
}
