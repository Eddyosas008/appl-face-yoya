import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme';
import { Card, ProgressCircle, BadgeComponent } from '../components';
import { useStore } from '../store/useStore';
import { badgeDefinitions, getNextBadgeToEarn, getBadgeProgress } from '../data/badges';

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, updateSettings, resetProgress, resetAllData } = useStore();
  const { profile, preferences, progress, settings } = user;

  const handleResetProgress = () => {
    Alert.alert(
      'Réinitialiser la progression',
      'Êtes-vous sûr de vouloir réinitialiser toute votre progression ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Réinitialiser',
          style: 'destructive',
          onPress: () => resetProgress(),
        },
      ]
    );
  };

  const handleResetAllData = () => {
    Alert.alert(
      'Supprimer toutes les données',
      'Êtes-vous sûr de vouloir supprimer toutes vos données ? Vous devrez recommencer l\'onboarding.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            resetAllData();
            // Navigation to onboarding would happen here
          },
        },
      ]
    );
  };

  const formatJoinDate = (): string => {
    const date = new Date(user.createdAt);
    return date.toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric',
    });
  };

  const MenuItem: React.FC<{
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value?: string;
    onPress?: () => void;
    showArrow?: boolean;
    color?: string;
  }> = ({ icon, label, value, onPress, showArrow = true, color }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View
        style={[
          styles.menuItemIcon,
          { backgroundColor: (color || colors.accent.green) + '20' },
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={color || colors.accent.green}
        />
      </View>
      <View style={styles.menuItemContent}>
        <Text style={[styles.menuItemLabel, color && { color }]}>{label}</Text>
        {value && <Text style={styles.menuItemValue}>{value}</Text>}
      </View>
      {showArrow && onPress && (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.text.tertiary}
        />
      )}
    </TouchableOpacity>
  );

  const ToggleItem: React.FC<{
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
  }> = ({ icon, label, value, onValueChange }) => (
    <View style={styles.menuItem}>
      <View
        style={[
          styles.menuItemIcon,
          { backgroundColor: colors.accent.green + '20' },
        ]}
      >
        <Ionicons name={icon} size={20} color={colors.accent.green} />
      </View>
      <View style={styles.menuItemContent}>
        <Text style={styles.menuItemLabel}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: colors.background.elevated,
          true: colors.accent.green + '50',
        }}
        thumbColor={value ? colors.accent.green : colors.text.muted}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profil</Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings-outline" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <Card variant="elevated" padding="large" style={styles.profileCard}>
          <TouchableOpacity
            style={styles.profileHeader}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={40} color={colors.text.secondary} />
              </View>
              <View style={styles.editAvatarButton}>
                <Ionicons name="pencil" size={12} color={colors.background.primary} />
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {profile.firstName || 'Utilisateur'}
              </Text>
              <Text style={styles.profileMeta}>
                Membre depuis {formatJoinDate()}
              </Text>
              <Text style={styles.editProfileHint}>Appuyez pour modifier</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
          </TouchableOpacity>

          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatValue}>{progress.currentStreak}</Text>
              <Text style={styles.quickStatLabel}>Jours</Text>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatValue}>{progress.totalSessions}</Text>
              <Text style={styles.quickStatLabel}>Séances</Text>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatValue}>{progress.badges.length}</Text>
              <Text style={styles.quickStatLabel}>Badges</Text>
            </View>
          </View>
        </Card>

        {/* Achievements Section */}
        <Text style={styles.sectionTitle}>Vos Accomplissements</Text>
        <Card variant="default" padding="large" style={styles.achievementsCard}>
          {progress.badges.length > 0 ? (
            <>
              <View style={styles.badgesGrid}>
                {progress.badges.slice(0, 6).map((badge) => (
                  <View key={badge.id} style={styles.badgeItem}>
                    <BadgeComponent badge={badge} size="small" showName />
                  </View>
                ))}
              </View>
              {progress.badges.length > 6 && (
                <TouchableOpacity style={styles.viewAllBadges}>
                  <Text style={styles.viewAllBadgesText}>
                    Voir tous les {progress.badges.length} badges
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.accent.green} />
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View style={styles.noBadgesContainer}>
              <Ionicons name="ribbon-outline" size={48} color={colors.text.muted} />
              <Text style={styles.noBadgesTitle}>Pas encore de badge</Text>
              <Text style={styles.noBadgesText}>
                Complétez des séances pour gagner vos premiers badges !
              </Text>
            </View>
          )}

          {/* Next badge to earn */}
          {(() => {
            const userStats = {
              currentStreak: progress.currentStreak,
              totalSessions: progress.totalSessions,
              totalMinutes: progress.totalMinutes,
              completedExercises: progress.completedExercises,
              completedPrograms: progress.completedPrograms,
              zonesExplored: [],
            };
            const nextBadge = getNextBadgeToEarn(
              progress.badges.map((b) => b.id),
              userStats
            );

            if (nextBadge) {
              const progressPercent = getBadgeProgress(nextBadge, userStats);
              return (
                <View style={styles.nextBadgeContainer}>
                  <Text style={styles.nextBadgeLabel}>Prochain badge</Text>
                  <View style={styles.nextBadgeContent}>
                    <View style={styles.nextBadgeInfo}>
                      <Text style={styles.nextBadgeName}>{nextBadge.name}</Text>
                      <Text style={styles.nextBadgeDescription}>
                        {nextBadge.description}
                      </Text>
                    </View>
                    <View style={styles.nextBadgeProgress}>
                      <ProgressCircle
                        progress={progressPercent}
                        size={48}
                        strokeWidth={4}
                      />
                    </View>
                  </View>
                </View>
              );
            }
            return null;
          })()}
        </Card>

        {/* Preferences Section */}
        <Text style={styles.sectionTitle}>Préférences</Text>
        <Card variant="default" padding="none" style={styles.menuCard}>
          <MenuItem
            icon="body"
            label="Zones ciblées"
            value={`${preferences.focusZones.length} zone(s)`}
            onPress={() => {/* Navigate to edit */}}
          />
          <MenuItem
            icon="time"
            label="Durée préférée"
            value={`${preferences.preferredDuration} min`}
            onPress={() => {/* Navigate to edit */}}
          />
          <MenuItem
            icon="target"
            label="Objectif hebdomadaire"
            value={`${progress.weeklyGoal} séances`}
            onPress={() => {/* Navigate to edit */}}
          />
        </Card>

        {/* Notifications Section */}
        <Text style={styles.sectionTitle}>Notifications</Text>
        <Card variant="default" padding="none" style={styles.menuCard}>
          <ToggleItem
            icon="notifications"
            label="Rappels quotidiens"
            value={preferences.reminderEnabled}
            onValueChange={(value) => {/* Update preference */}}
          />
          <MenuItem
            icon="time-outline"
            label="Heure de rappel"
            value={preferences.reminderTime || '08:00'}
            onPress={() => {/* Open time picker */}}
          />
        </Card>

        {/* App Settings Section */}
        <Text style={styles.sectionTitle}>Application</Text>
        <Card variant="default" padding="none" style={styles.menuCard}>
          <ToggleItem
            icon="volume-high"
            label="Sons"
            value={settings.soundEnabled}
            onValueChange={(value) => updateSettings({ soundEnabled: value })}
          />
          <ToggleItem
            icon="phone-portrait"
            label="Vibrations"
            value={settings.hapticEnabled}
            onValueChange={(value) => updateSettings({ hapticEnabled: value })}
          />
          <ToggleItem
            icon="sparkles"
            label="Animations"
            value={settings.showAnimations}
            onValueChange={(value) => updateSettings({ showAnimations: value })}
          />
        </Card>

        {/* Health & Safety Section */}
        <Text style={styles.sectionTitle}>Santé & Sécurité</Text>
        <Card variant="default" padding="none" style={styles.menuCard}>
          <MenuItem
            icon="medical"
            label="Contre-indications"
            value={
              user.healthInfo.contraindications.length > 0
                ? `${user.healthInfo.contraindications.length} déclarée(s)`
                : 'Aucune'
            }
            onPress={() => {/* Navigate to edit */}}
          />
          <MenuItem
            icon="shield-checkmark"
            label="Sécurité & Précautions"
            onPress={() => navigation.navigate('Safety')}
          />
        </Card>

        {/* Support Section */}
        <Text style={styles.sectionTitle}>Support</Text>
        <Card variant="default" padding="none" style={styles.menuCard}>
          <MenuItem
            icon="help-circle"
            label="Aide & FAQ"
            onPress={() => {/* Navigate to help */}}
          />
          <MenuItem
            icon="mail"
            label="Nous contacter"
            onPress={() => {/* Open contact */}}
          />
          <MenuItem
            icon="document-text"
            label="Politique de confidentialité"
            onPress={() => {/* Navigate to privacy */}}
          />
          <MenuItem
            icon="document"
            label="Conditions d'utilisation"
            onPress={() => {/* Navigate to terms */}}
          />
        </Card>

        {/* Danger Zone */}
        <Text style={styles.sectionTitle}>Zone de danger</Text>
        <Card variant="default" padding="none" style={styles.menuCard}>
          <MenuItem
            icon="refresh"
            label="Réinitialiser la progression"
            onPress={handleResetProgress}
            showArrow={false}
            color={colors.accent.coral}
          />
          <MenuItem
            icon="trash"
            label="Supprimer toutes les données"
            onPress={handleResetAllData}
            showArrow={false}
            color={colors.state.error}
          />
        </Card>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Face Yoga v1.0.0</Text>
          <Text style={styles.versionSubtext}>
            Fait avec soin pour votre bien-être
          </Text>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimerContainer}>
          <Ionicons
            name="information-circle-outline"
            size={16}
            color={colors.text.muted}
          />
          <Text style={styles.disclaimerText}>
            Le face yoga est une pratique complémentaire qui ne remplace pas un avis médical et s'inscrit dans une hygiène de vie globale.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.huge,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.text.primary,
  },
  settingsButton: {
    padding: spacing.sm,
  },
  // Profile Card
  profileCard: {
    marginBottom: spacing.xl,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background.elevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent.green,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background.tertiary,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...typography.h3,
    color: colors.text.primary,
  },
  profileMeta: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  editProfileHint: {
    ...typography.caption,
    color: colors.accent.green,
    marginTop: spacing.xs,
  },
  // Quick Stats
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  quickStatItem: {
    alignItems: 'center',
  },
  quickStatValue: {
    ...typography.h3,
    color: colors.accent.green,
  },
  quickStatLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  quickStatDivider: {
    width: 1,
    backgroundColor: colors.border.light,
  },
  // Achievements
  achievementsCard: {
    marginBottom: spacing.md,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.sm,
  },
  badgeItem: {
    width: '33.33%',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  viewAllBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  viewAllBadgesText: {
    ...typography.label,
    color: colors.accent.green,
    marginRight: spacing.xs,
  },
  noBadgesContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  noBadgesTitle: {
    ...typography.h4,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  noBadgesText: {
    ...typography.body,
    color: colors.text.muted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  nextBadgeContainer: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  nextBadgeLabel: {
    ...typography.caption,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  nextBadgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nextBadgeInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  nextBadgeName: {
    ...typography.label,
    color: colors.text.primary,
  },
  nextBadgeDescription: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  nextBadgeProgress: {},
  // Section Title
  sectionTitle: {
    ...typography.label,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  // Menu Card
  menuCard: {
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  menuItemIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemLabel: {
    ...typography.body,
    color: colors.text.primary,
  },
  menuItemValue: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  // Version
  versionContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  versionText: {
    ...typography.body,
    color: colors.text.tertiary,
  },
  versionSubtext: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  // Disclaimer
  disclaimerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
  },
  disclaimerText: {
    ...typography.caption,
    color: colors.text.muted,
    marginLeft: spacing.sm,
    flex: 1,
  },
});

export default ProfileScreen;
