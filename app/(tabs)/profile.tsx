import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useUser } from '@/lib/user-context';
import { PremiumBadge } from '@/components/ui/premium-badge';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { MOOD_EMOJIS, MOOD_LABELS } from '@/lib/mock-data';

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
  const { profile, checkIns, logout } = useUser();
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showPremium, setShowPremium] = useState(false);

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
            <Text style={[styles.profileName, { color: colors.foreground }]}>{profile?.firstName || 'Sophia'}</Text>
            <Text style={[styles.profileEmail, { color: colors.muted }]}>{profile?.firstName ? profile.firstName + '@yoya.app' : 'sophia@yoya.app'}</Text>
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
        </View>

        {topMoodEntry && (
          <View style={[styles.moodRecap, { backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}20` }]}>
            <Text style={[styles.moodRecapLabel, { color: colors.primary }]}>Humeur dominante cette semaine</Text>
            <Text style={styles.moodRecapEmoji}>{MOOD_EMOJIS[topMoodEntry[0] as keyof typeof MOOD_EMOJIS]}</Text>
            <Text style={[styles.moodRecapText, { color: colors.foreground }]}>{MOOD_LABELS[topMoodEntry[0] as keyof typeof MOOD_LABELS]}</Text>
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Paramètres</Text>
        <View style={[styles.settingsGroup, { backgroundColor: colors.surface }]}>
          <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
            <Text style={styles.settingIcon}>🔔</Text>
            <Text style={[styles.settingLabel, { color: colors.foreground }]}>Notifications</Text>
            <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} trackColor={{ false: colors.border, true: colors.primary }} thumbColor="#FFFFFF" />
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

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Compte</Text>
        <View style={[styles.settingsGroup, { backgroundColor: colors.surface }]}>
          <Pressable style={({ pressed }) => [styles.settingRow, { borderBottomColor: colors.border, opacity: pressed ? 0.7 : 1 }]}>
            <Text style={styles.settingIcon}>✏️</Text>
            <Text style={[styles.settingLabel, { color: colors.foreground }]}>Modifier le profil</Text>
            <IconSymbol name="chevron.right" size={16} color={colors.muted} />
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

        <Pressable style={({ pressed }) => [styles.logoutButton, { borderColor: colors.error, opacity: pressed ? 0.7 : 1 }]} onPress={logout}>
          <Text style={[styles.logoutText, { color: colors.error }]}>Se déconnecter</Text>
        </Pressable>

        <Text style={[styles.version, { color: colors.muted }]}>Yoya Wellness v1.0.0</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingTop: 20, marginBottom: 20 },
  avatarContainer: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 26, fontWeight: '800' },
  profileInfo: { flex: 1, gap: 4 },
  profileName: { fontSize: 20, fontWeight: '800' },
  profileEmail: { fontSize: 13 },
  upgradeBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', backgroundColor: '#F59E0B20' },
  upgradeBadgeText: { fontSize: 12, fontWeight: '700', color: '#F59E0B' },
  statsCard: { flexDirection: 'row', borderRadius: 16, paddingVertical: 16, marginBottom: 16 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800', marginBottom: 2 },
  statLabel: { fontSize: 12 },
  statDivider: { width: 1, height: '80%', alignSelf: 'center' },
  moodRecap: { borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 24, alignItems: 'center' },
  moodRecapLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  moodRecapEmoji: { fontSize: 36, marginBottom: 4 },
  moodRecapText: { fontSize: 16, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10, marginTop: 4 },
  settingsGroup: { borderRadius: 16, marginBottom: 20, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12, borderBottomWidth: 0.5 },
  settingIcon: { fontSize: 20, width: 28 },
  settingLabel: { flex: 1, fontSize: 15 },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  settingValue: { fontSize: 13 },
  premiumCta: { borderRadius: 999, paddingVertical: 15, alignItems: 'center', marginBottom: 12 },
  premiumCtaText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  logoutButton: { borderRadius: 999, paddingVertical: 14, alignItems: 'center', borderWidth: 1.5, marginBottom: 16 },
  logoutText: { fontSize: 15, fontWeight: '600' },
  version: { fontSize: 12, textAlign: 'center' },
  premiumScroll: { paddingBottom: 40 },
  closeBtn: { position: 'absolute', top: 16, right: 16, zIndex: 10, padding: 8 },
  premiumHero: { paddingTop: 60, paddingBottom: 40, alignItems: 'center' },
  premiumHeroEmoji: { fontSize: 48, marginBottom: 12 },
  premiumHeroTitle: { color: '#FFF', fontSize: 28, fontWeight: '800', marginBottom: 6 },
  premiumHeroSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 15 },
  premiumFeatures: { padding: 20, gap: 12 },
  premiumFeatureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  premiumFeatureIcon: { fontSize: 22, width: 32 },
  premiumFeatureText: { fontSize: 15, flex: 1 },
  plans: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 20 },
  planCard: { flex: 1, borderRadius: 16, borderWidth: 2, padding: 16, alignItems: 'center', position: 'relative', paddingTop: 24 },
  popularBadge: { position: 'absolute', top: -10, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  popularBadgeText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  savingBadge: { position: 'absolute', bottom: -10, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  savingBadgeText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  planLabel: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  planPrice: { fontSize: 22, fontWeight: '800' },
  planPeriod: { fontSize: 12 },
  subscribeButton: { marginHorizontal: 20, borderRadius: 999, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
  subscribeButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  premiumDisclaimer: { fontSize: 11, textAlign: 'center', paddingHorizontal: 20 },
});
