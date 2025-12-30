import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, typography } from '../theme';
import { Card, Button } from '../components';
import { useStore } from '../store/useStore';
import NotificationService from '../services/notifications';

interface SettingsScreenProps {
  navigation: any;
}

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  showArrow?: boolean;
  iconColor?: string;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  rightElement,
  showArrow = false,
  iconColor = colors.accent.green,
}) => (
  <TouchableOpacity
    style={styles.settingItem}
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={onPress ? 0.7 : 1}
  >
    <View style={[styles.settingIcon, { backgroundColor: iconColor + '20' }]}>
      <Ionicons name={icon} size={20} color={iconColor} />
    </View>
    <View style={styles.settingContent}>
      <Text style={styles.settingTitle}>{title}</Text>
      {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
    </View>
    {rightElement}
    {showArrow && !rightElement && (
      <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
    )}
  </TouchableOpacity>
);

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { user, updateSettings, updatePreferences, resetProgress } = useStore();
  const { settings, preferences } = user;

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [reminderTime, setReminderTime] = useState<Date>(() => {
    if (preferences.reminderTime) {
      const [hours, minutes] = preferences.reminderTime.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date;
    }
    return new Date();
  });

  const handleToggleSound = (value: boolean) => {
    if (settings.hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    updateSettings({ soundEnabled: value });
  };

  const handleToggleHaptic = (value: boolean) => {
    if (value) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    updateSettings({ hapticEnabled: value });
  };

  const handleToggleAnimations = (value: boolean) => {
    if (settings.hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    updateSettings({ showAnimations: value });
  };

  const handleToggleReminder = async (value: boolean) => {
    if (settings.hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (value) {
      const hasPermission = await NotificationService.requestPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Notifications désactivées',
          'Veuillez activer les notifications dans les paramètres de votre téléphone pour recevoir des rappels.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Schedule default reminder at current time
      const hours = reminderTime.getHours();
      const minutes = reminderTime.getMinutes();
      await NotificationService.scheduleDailyReminder(hours, minutes);
    } else {
      await NotificationService.cancelNotification('daily_reminder');
    }

    updatePreferences({ reminderEnabled: value });
  };

  const handleTimeChange = async (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');

    if (selectedTime) {
      setReminderTime(selectedTime);
      const hours = selectedTime.getHours();
      const minutes = selectedTime.getMinutes();
      const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

      updatePreferences({ reminderTime: timeString });

      if (preferences.reminderEnabled) {
        await NotificationService.scheduleDailyReminder(hours, minutes);
      }
    }
  };

  const handleResetProgress = () => {
    Alert.alert(
      'Réinitialiser la progression',
      'Cette action est irréversible. Toutes vos données de progression seront supprimées.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Réinitialiser',
          style: 'destructive',
          onPress: () => {
            resetProgress();
            if (settings.hapticEnabled) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
            Alert.alert('Progression réinitialisée', 'Votre progression a été supprimée.');
          },
        },
      ]
    );
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const durations = [
    { value: 5, label: '5 min' },
    { value: 10, label: '10 min' },
    { value: 15, label: '15 min' },
    { value: 20, label: '20 min' },
  ] as const;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paramètres</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <Card variant="default" padding="none">
            <SettingItem
              icon="notifications"
              title="Rappel quotidien"
              subtitle="Recevez un rappel pour votre séance"
              iconColor={colors.accent.gold}
              rightElement={
                <Switch
                  value={preferences.reminderEnabled}
                  onValueChange={handleToggleReminder}
                  trackColor={{
                    false: colors.background.elevated,
                    true: colors.accent.green + '50',
                  }}
                  thumbColor={preferences.reminderEnabled ? colors.accent.green : colors.text.muted}
                />
              }
            />

            {preferences.reminderEnabled && (
              <SettingItem
                icon="time"
                title="Heure du rappel"
                subtitle={formatTime(reminderTime)}
                iconColor={colors.accent.teal}
                onPress={() => setShowTimePicker(true)}
                showArrow
              />
            )}
          </Card>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Préférences</Text>
          <Card variant="default" padding="none">
            <SettingItem
              icon="volume-high"
              title="Sons"
              subtitle="Activer les sons de l'application"
              iconColor={colors.accent.teal}
              rightElement={
                <Switch
                  value={settings.soundEnabled}
                  onValueChange={handleToggleSound}
                  trackColor={{
                    false: colors.background.elevated,
                    true: colors.accent.green + '50',
                  }}
                  thumbColor={settings.soundEnabled ? colors.accent.green : colors.text.muted}
                />
              }
            />

            <SettingItem
              icon="phone-portrait"
              title="Vibrations"
              subtitle="Retour haptique lors des interactions"
              iconColor={colors.accent.green}
              rightElement={
                <Switch
                  value={settings.hapticEnabled}
                  onValueChange={handleToggleHaptic}
                  trackColor={{
                    false: colors.background.elevated,
                    true: colors.accent.green + '50',
                  }}
                  thumbColor={settings.hapticEnabled ? colors.accent.green : colors.text.muted}
                />
              }
            />

            <SettingItem
              icon="sparkles"
              title="Animations"
              subtitle="Afficher les animations dans l'application"
              iconColor={colors.accent.gold}
              rightElement={
                <Switch
                  value={settings.showAnimations}
                  onValueChange={handleToggleAnimations}
                  trackColor={{
                    false: colors.background.elevated,
                    true: colors.accent.green + '50',
                  }}
                  thumbColor={settings.showAnimations ? colors.accent.green : colors.text.muted}
                />
              }
            />
          </Card>
        </View>

        {/* Session Duration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Durée préférée</Text>
          <View style={styles.durationGrid}>
            {durations.map((duration) => (
              <TouchableOpacity
                key={duration.value}
                style={[
                  styles.durationButton,
                  preferences.preferredDuration === duration.value && styles.durationButtonActive,
                ]}
                onPress={() => {
                  if (settings.hapticEnabled) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  updatePreferences({ preferredDuration: duration.value });
                }}
              >
                <Text
                  style={[
                    styles.durationText,
                    preferences.preferredDuration === duration.value && styles.durationTextActive,
                  ]}
                >
                  {duration.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À propos</Text>
          <Card variant="default" padding="none">
            <SettingItem
              icon="information-circle"
              title="Version"
              subtitle="1.0.0"
              iconColor={colors.text.secondary}
            />

            <SettingItem
              icon="shield-checkmark"
              title="Précautions de sécurité"
              iconColor={colors.accent.coral}
              onPress={() => navigation.navigate('Safety')}
              showArrow
            />

            <SettingItem
              icon="document-text"
              title="Conditions d'utilisation"
              iconColor={colors.text.secondary}
              onPress={() => {
                Alert.alert('Conditions', 'Les conditions d\'utilisation seront bientôt disponibles.');
              }}
              showArrow
            />

            <SettingItem
              icon="lock-closed"
              title="Politique de confidentialité"
              iconColor={colors.text.secondary}
              onPress={() => {
                Alert.alert('Confidentialité', 'La politique de confidentialité sera bientôt disponible.');
              }}
              showArrow
            />
          </Card>
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Données</Text>
          <Card variant="outlined" padding="none" style={styles.dangerCard}>
            <SettingItem
              icon="trash"
              title="Réinitialiser la progression"
              subtitle="Supprimer toutes les données de progression"
              iconColor={colors.accent.coral}
              onPress={handleResetProgress}
              showArrow
            />
          </Card>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Ionicons name="information-circle-outline" size={16} color={colors.text.muted} />
          <Text style={styles.disclaimerText}>
            Le face yoga est une pratique complémentaire de bien-être et ne remplace pas un avis médical professionnel.
          </Text>
        </View>
      </ScrollView>

      {/* Time Picker Modal */}
      <Modal
        visible={showTimePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Heure du rappel</Text>
            <View style={styles.timePickerContainer}>
              <View style={styles.timeColumn}>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => {
                    const newDate = new Date(reminderTime);
                    newDate.setHours((reminderTime.getHours() + 1) % 24);
                    setReminderTime(newDate);
                  }}
                >
                  <Ionicons name="chevron-up" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.timeValue}>
                  {reminderTime.getHours().toString().padStart(2, '0')}
                </Text>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => {
                    const newDate = new Date(reminderTime);
                    newDate.setHours((reminderTime.getHours() - 1 + 24) % 24);
                    setReminderTime(newDate);
                  }}
                >
                  <Ionicons name="chevron-down" size={24} color={colors.text.primary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.timeSeparator}>:</Text>
              <View style={styles.timeColumn}>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => {
                    const newDate = new Date(reminderTime);
                    newDate.setMinutes((reminderTime.getMinutes() + 5) % 60);
                    setReminderTime(newDate);
                  }}
                >
                  <Ionicons name="chevron-up" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.timeValue}>
                  {reminderTime.getMinutes().toString().padStart(2, '0')}
                </Text>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => {
                    const newDate = new Date(reminderTime);
                    newDate.setMinutes((reminderTime.getMinutes() - 5 + 60) % 60);
                    setReminderTime(newDate);
                  }}
                >
                  <Ionicons name="chevron-down" size={24} color={colors.text.primary} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setShowTimePicker(false)}
              >
                <Text style={styles.modalButtonCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonConfirm}
                onPress={() => {
                  handleTimeChange(null, reminderTime);
                  setShowTimePicker(false);
                }}
              >
                <Text style={styles.modalButtonConfirmText}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  headerSpacer: {
    width: 40,
  },
  // Content
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.huge,
  },
  // Section
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    paddingLeft: spacing.xs,
  },
  // Setting Item
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  settingContent: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingTitle: {
    ...typography.body,
    color: colors.text.primary,
  },
  settingSubtitle: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  // Duration Grid
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  durationButton: {
    flex: 1,
    minWidth: '22%',
    marginHorizontal: spacing.xs,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  durationButtonActive: {
    backgroundColor: colors.accent.green,
  },
  durationText: {
    ...typography.label,
    color: colors.text.secondary,
  },
  durationTextActive: {
    color: colors.background.primary,
  },
  // Danger Card
  dangerCard: {
    borderColor: colors.accent.coral + '30',
    backgroundColor: colors.accent.coral + '05',
  },
  // Disclaimer
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  disclaimerText: {
    ...typography.caption,
    color: colors.text.muted,
    marginLeft: spacing.sm,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    ...typography.h4,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  timePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  timeColumn: {
    alignItems: 'center',
  },
  timeButton: {
    padding: spacing.sm,
  },
  timeValue: {
    ...typography.h1,
    color: colors.text.primary,
    minWidth: 60,
    textAlign: 'center',
  },
  timeSeparator: {
    ...typography.h1,
    color: colors.text.primary,
    marginHorizontal: spacing.md,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButtonCancel: {
    flex: 1,
    paddingVertical: spacing.md,
    marginRight: spacing.sm,
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  modalButtonCancelText: {
    ...typography.button,
    color: colors.text.secondary,
  },
  modalButtonConfirm: {
    flex: 1,
    paddingVertical: spacing.md,
    marginLeft: spacing.sm,
    backgroundColor: colors.accent.green,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  modalButtonConfirmText: {
    ...typography.button,
    color: colors.background.primary,
  },
});

export default SettingsScreen;
