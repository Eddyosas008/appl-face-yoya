import React, { useState, useEffect } from 'react';
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
import { loadNotificationSettings, formatTime, type NotificationSettings, DEFAULT_NOTIFICATION_SETTINGS } from '@/lib/notification-service';

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
            <Text style={styles.premiumHeroTitle}>Yoya Premium</Text>
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
    <ScreenContainer>
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
          <Pressable
            style={({ pressed }) => [styles.settingRow, { borderBottomColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
            onPress={() => router.push('/notifications-settings' as never)}
          >
            <Text style={styles.settingIcon}>🔔</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingLabel, { color: colors.foreground }]}>Rappels quotidiens</Text>
              {notifSettings.enabled ? (
                <Text style={[styles.settingSubValue, { color: colors.primary }]}>
                  Activé · {formatTime(notifSettings.hour, notifSettings.minute)}
                </Text>
              ) : (
                <Text style={[styles.settingSubValue, { color: colors.muted }]}>Désactivé</Text>
              )}
            </View>
            <View style={styles.settingRight}>
              {notifSettings.enabled && (
                <View style={[styles.notifActiveDot, { backgroundColor: colors.success }]} />
              )}
              <IconSymbol name="chevron.right" size={16} color={colors.muted} />
            </View>
          </Pressable>
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
        </View>

        <Pressable style={({ pressed }) => [styles.logoutButton, { borderColor: colors.error, opacity: pressed ? 0.7 : 1 }]} onPress={logout}>
          <Text style={[styles.logoutText, { color: colors.error }]}>Se déconnecter</Text>
        </Pressable>

        <Text style={[styles.version, { color: colors.muted }]}>Yoya Wellness v1.0.0</Text>
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
    </ScreenContainer>
  );
}

// Palette Sanctuaire du Sommeil
const NIGHT_BG     = '#07051C';
const GOLD         = '#D4A853';
const GOLD_SOFT    = 'rgba(212,168,83,0.12)';
const LAVENDER     = 'rgba(180,168,220,0.55)';
const LAVENDER_DIM = 'rgba(180,168,220,0.12)';
const WHITE_SOFT   = '#F0EEF8';
const GLASS_BG     = 'rgba(255,255,255,0.04)';
const GLASS_BORDER = 'rgba(180,168,220,0.12)';

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingTop: 24, marginBottom: 24 },
  avatarContainer: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: 'rgba(212,168,83,0.4)' },
  avatarText: { fontFamily: 'CormorantGaramond-Medium', fontSize: 28, color: GOLD },
  profileInfo: { flex: 1, gap: 4 },
  profileName: { fontFamily: 'CormorantGaramond-Medium', fontSize: 22, color: WHITE_SOFT },
  profileEmail: { fontSize: 11, color: LAVENDER, letterSpacing: 0.3 },
  upgradeBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', backgroundColor: GOLD_SOFT, borderWidth: 0.5, borderColor: 'rgba(212,168,83,0.3)' },
  upgradeBadgeText: { fontSize: 11, fontWeight: '600', color: GOLD, letterSpacing: 0.3 },
  statsCard: { flexDirection: 'row', borderRadius: 16, paddingVertical: 16, marginBottom: 16, backgroundColor: GLASS_BG, borderWidth: 0.5, borderColor: GLASS_BORDER },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontFamily: 'CormorantGaramond-Medium', fontSize: 24, color: GOLD, marginBottom: 2 },
  statLabel: { fontSize: 10, color: LAVENDER, letterSpacing: 0.3 },
  statDivider: { width: 0.5, height: '80%', alignSelf: 'center', backgroundColor: LAVENDER_DIM },
  moodRecap: { borderRadius: 16, borderWidth: 0.5, borderColor: 'rgba(212,168,83,0.2)', padding: 14, marginBottom: 24, alignItems: 'center', backgroundColor: GOLD_SOFT },
  moodRecapLabel: { fontSize: 9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, color: GOLD, marginBottom: 8 },
  moodRecapEmoji: { fontSize: 36, marginBottom: 4 },
  moodRecapText: { fontFamily: 'CormorantGaramond-Medium', fontSize: 18, color: WHITE_SOFT },
  sectionTitle: { fontFamily: 'CormorantGaramond-Medium', fontSize: 18, color: WHITE_SOFT, marginBottom: 10, marginTop: 4 },
  settingsGroup: { borderRadius: 16, marginBottom: 20, overflow: 'hidden', backgroundColor: GLASS_BG, borderWidth: 0.5, borderColor: GLASS_BORDER },
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12, borderBottomWidth: 0.5, borderBottomColor: GLASS_BORDER },
  settingIcon: { fontSize: 18, width: 26 },
  settingLabel: { fontSize: 14, color: WHITE_SOFT },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  settingValue: { fontSize: 12, color: LAVENDER },
  settingSubValue: { fontSize: 11, color: LAVENDER, marginTop: 1 },
  notifActiveDot: { width: 7, height: 7, borderRadius: 3.5, marginRight: 4 },
  premiumCta: { borderRadius: 16, paddingVertical: 15, alignItems: 'center', marginBottom: 12, backgroundColor: GOLD },
  premiumCtaText: { color: NIGHT_BG, fontSize: 14, fontWeight: '700', letterSpacing: 0.3 },
  logoutButton: { borderRadius: 999, paddingVertical: 14, alignItems: 'center', borderWidth: 0.5, borderColor: '#F87171', marginBottom: 16 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, backgroundColor: '#12103A', borderTopWidth: 0.5, borderColor: GLASS_BORDER },
  modalTitle: { fontFamily: 'CormorantGaramond-Medium', fontSize: 22, color: WHITE_SOFT, marginBottom: 20, textAlign: 'center' },
  modalInput: { borderRadius: 14, borderWidth: 0.5, borderColor: GLASS_BORDER, backgroundColor: GLASS_BG, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: WHITE_SOFT, marginBottom: 20 },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalCancelBtn: { flex: 1, borderRadius: 999, paddingVertical: 14, alignItems: 'center', borderWidth: 0.5, borderColor: GLASS_BORDER },
  modalCancelText: { fontSize: 14, color: LAVENDER },
  modalSaveBtn: { flex: 1, borderRadius: 999, paddingVertical: 14, alignItems: 'center', backgroundColor: GOLD },
  modalSaveText: { color: NIGHT_BG, fontSize: 14, fontWeight: '700' },
  logoutText: { fontSize: 14, fontWeight: '600', color: '#F87171' },
  version: { fontSize: 11, textAlign: 'center', color: LAVENDER, letterSpacing: 0.3 },
  premiumScroll: { paddingBottom: 40 },
  closeBtn: { position: 'absolute', top: 16, right: 16, zIndex: 10, padding: 8 },
  premiumHero: { paddingTop: 60, paddingBottom: 40, alignItems: 'center' },
  premiumHeroEmoji: { fontSize: 48, marginBottom: 12 },
  premiumHeroTitle: { fontFamily: 'CormorantGaramond-Medium', color: WHITE_SOFT, fontSize: 28, marginBottom: 6 },
  premiumHeroSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  premiumFeatures: { padding: 20, gap: 12 },
  premiumFeatureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  premiumFeatureIcon: { fontSize: 20, width: 30 },
  premiumFeatureText: { fontSize: 14, color: WHITE_SOFT, flex: 1 },
  plans: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 20 },
  planCard: { flex: 1, borderRadius: 16, borderWidth: 0.5, padding: 16, alignItems: 'center', position: 'relative', paddingTop: 24, backgroundColor: GLASS_BG },
  popularBadge: { position: 'absolute', top: -10, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, backgroundColor: GOLD },
  popularBadgeText: { color: NIGHT_BG, fontSize: 10, fontWeight: '700' },
  savingBadge: { position: 'absolute', bottom: -10, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, backgroundColor: '#22C55E' },
  savingBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  planLabel: { fontSize: 13, fontWeight: '500', color: WHITE_SOFT, marginBottom: 4 },
  planPrice: { fontFamily: 'CormorantGaramond-Medium', fontSize: 22, color: GOLD },
  planPeriod: { fontSize: 11, color: LAVENDER },
  subscribeButton: { marginHorizontal: 20, borderRadius: 999, paddingVertical: 16, alignItems: 'center', marginBottom: 12, backgroundColor: GOLD },
  subscribeButtonText: { color: NIGHT_BG, fontSize: 15, fontWeight: '700' },
  premiumDisclaimer: { fontSize: 10, textAlign: 'center', paddingHorizontal: 20, color: LAVENDER },
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
  completedCardTitle: { color: WHITE_SOFT, fontSize: 14, fontWeight: '600' },
  completedCardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  completedBadge: { backgroundColor: 'rgba(34,197,94,0.2)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  completedBadgeText: { color: '#4ADE80', fontSize: 10, fontWeight: '700' },
  completedCardLevel: { color: 'rgba(255,255,255,0.55)', fontSize: 10 },
  completedCardDays: { color: 'rgba(255,255,255,0.5)', fontSize: 10, marginTop: 2 },
  completedCardRight: { alignItems: 'center', gap: 4 },
  completedTrophy: { fontSize: 20 },
  completedCardChevron: { color: 'rgba(255,255,255,0.45)', fontSize: 22, lineHeight: 24 },
  // Statistiques avancées
  statsAdvancedBtn: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 16, gap: 12, marginBottom: 20, backgroundColor: GOLD_SOFT, borderWidth: 0.5, borderColor: 'rgba(212,168,83,0.3)' },
  statsAdvancedEmoji: { fontSize: 26 },
  statsAdvancedTitle: { color: WHITE_SOFT, fontSize: 15, fontWeight: '600' },
  statsAdvancedSub: { color: LAVENDER, fontSize: 11, marginTop: 2 },
  statsAdvancedArrow: { color: GOLD, fontSize: 26, lineHeight: 28 },
});
