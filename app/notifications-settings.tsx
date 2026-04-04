import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Switch,
  Platform, Alert, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  loadNotificationSettings,
  enableDailyReminder,
  disableDailyReminder,
  getNotificationPermissionStatus,
  formatTime,
  PRESET_TIMES,
  type NotificationSettings,
  DEFAULT_NOTIFICATION_SETTINGS,
} from '@/lib/notification-service';

// ─── Hour/Minute picker (simple scroll-based) ─────────────────────────────────

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

export default function NotificationsSettingsScreen() {
  const colors = useColors();
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempHour, setTempHour] = useState(8);
  const [tempMinute, setTempMinute] = useState(0);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Animate the success indicator
  const successScale = useSharedValue(0);
  const successStyle = useAnimatedStyle(() => ({
    transform: [{ scale: successScale.value }],
    opacity: successScale.value,
  }));

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    const [s, perm] = await Promise.all([
      loadNotificationSettings(),
      getNotificationPermissionStatus(),
    ]);
    setSettings(s);
    setTempHour(s.hour);
    setTempMinute(s.minute);
    setPermissionStatus(perm);
    setIsLoading(false);
  }

  async function handleToggle(value: boolean) {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!value) {
      setIsSaving(true);
      await disableDailyReminder();
      setSettings((prev) => ({ ...prev, enabled: false, scheduledId: null }));
      setIsSaving(false);
      return;
    }

    // Enable
    setIsSaving(true);
    const result = await enableDailyReminder(settings.hour, settings.minute);
    setIsSaving(false);

    if (result.permissionDenied) {
      Alert.alert(
        'Permission requise',
        'Pour recevoir des rappels, veuillez autoriser les notifications dans les réglages de votre téléphone.',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Ouvrir les réglages', onPress: () => {} },
        ]
      );
      return;
    }

    if (result.success) {
      setSettings((prev) => ({ ...prev, enabled: true }));
      showSuccessFeedback();
    }
  }

  async function handlePresetSelect(hour: number, minute: number) {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTempHour(hour);
    setTempMinute(minute);
    setSettings((prev) => ({ ...prev, hour, minute }));

    if (settings.enabled) {
      setIsSaving(true);
      await enableDailyReminder(hour, minute);
      setIsSaving(false);
      showSuccessFeedback();
    }
  }

  async function handleCustomTimeConfirm() {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSettings((prev) => ({ ...prev, hour: tempHour, minute: tempMinute }));
    setShowTimePicker(false);

    if (settings.enabled) {
      setIsSaving(true);
      await enableDailyReminder(tempHour, tempMinute);
      setIsSaving(false);
      showSuccessFeedback();
    }
  }

  function showSuccessFeedback() {
    setSaveSuccess(true);
    successScale.value = withSpring(1, { damping: 12 });
    setTimeout(() => {
      successScale.value = withTiming(0, { duration: 300 });
      setTimeout(() => setSaveSuccess(false), 350);
    }, 2000);
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  const reminderTypeLabel: Record<string, string> = {
    morning: '🌅 Matin',
    afternoon: '☀️ Après-midi',
    evening: '🌙 Soir',
    custom: '⚙️ Personnalisé',
  };

  if (isLoading) {
    return (
      <ScreenContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={22} color={colors.foreground} />
          </Pressable>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.title, { color: colors.foreground }]}>Rappels quotidiens</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>Votre moment de bien-être chaque jour</Text>
          </View>
          {isSaving && <ActivityIndicator size="small" color={colors.primary} />}
          {saveSuccess && (
            <Animated.View style={[styles.successBadge, { backgroundColor: `${colors.success}20` }, successStyle]}>
              <Text style={[styles.successText, { color: colors.success }]}>✓ Enregistré</Text>
            </Animated.View>
          )}
        </View>

        {/* Main toggle card */}
        <View style={[styles.toggleCard, { backgroundColor: colors.surface }]}>
          <View style={styles.toggleRow}>
            <View style={[styles.toggleIconBg, { backgroundColor: `${colors.primary}15` }]}>
              <Text style={styles.toggleIcon}>🔔</Text>
            </View>
            <View style={styles.toggleInfo}>
              <Text style={[styles.toggleTitle, { color: colors.foreground }]}>Rappel quotidien</Text>
              <Text style={[styles.toggleSubtitle, { color: colors.muted }]}>
                {settings.enabled
                  ? `Activé — chaque jour à ${formatTime(settings.hour, settings.minute)}`
                  : 'Désactivé'}
              </Text>
            </View>
            <Switch
              value={settings.enabled}
              onValueChange={handleToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
              disabled={isSaving}
            />
          </View>

          {settings.enabled && (
            <View style={[styles.activeInfo, { backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}20` }]}>
              <Text style={[styles.activeInfoText, { color: colors.primary }]}>
                {reminderTypeLabel[settings.reminderType]} · Prochain rappel demain à {formatTime(settings.hour, settings.minute)}
              </Text>
            </View>
          )}
        </View>

        {/* Permission warning */}
        {permissionStatus === 'denied' && (
          <View style={[styles.warningCard, { backgroundColor: `${colors.warning}15`, borderColor: `${colors.warning}30` }]}>
            <Text style={styles.warningEmoji}>⚠️</Text>
            <Text style={[styles.warningText, { color: colors.foreground }]}>
              Les notifications sont désactivées dans les réglages de votre téléphone. Activez-les pour recevoir vos rappels.
            </Text>
          </View>
        )}

        {/* Preset times */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Horaires suggérés</Text>
        <View style={styles.presetsGrid}>
          {PRESET_TIMES.map((preset) => {
            const isSelected = settings.hour === preset.hour && settings.minute === preset.minute;
            return (
              <Pressable
                key={`${preset.hour}-${preset.minute}`}
                style={({ pressed }) => [
                  styles.presetCard,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
                onPress={() => handlePresetSelect(preset.hour, preset.minute)}
              >
                <Text style={styles.presetEmoji}>{preset.emoji}</Text>
                <Text style={[styles.presetLabel, { color: isSelected ? '#FFFFFF' : colors.foreground }]}>
                  {preset.label}
                </Text>
                <Text style={[styles.presetTime, { color: isSelected ? 'rgba(255,255,255,0.8)' : colors.muted }]}>
                  {formatTime(preset.hour, preset.minute)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Custom time picker */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Heure personnalisée</Text>
        <Pressable
          style={({ pressed }) => [styles.customTimeBtn, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.85 : 1 }]}
          onPress={() => setShowTimePicker(!showTimePicker)}
        >
          <Text style={styles.customTimeEmoji}>⚙️</Text>
          <Text style={[styles.customTimeLabel, { color: colors.foreground }]}>Choisir une heure précise</Text>
          <View style={styles.customTimeRight}>
            <Text style={[styles.customTimeValue, { color: colors.primary }]}>{formatTime(tempHour, tempMinute)}</Text>
            <IconSymbol name="chevron.right" size={16} color={colors.muted} />
          </View>
        </Pressable>

        {showTimePicker && (
          <View style={[styles.timePicker, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.timePickerTitle, { color: colors.foreground }]}>Sélectionnez l'heure</Text>
            <View style={styles.timePickerRow}>
              {/* Hours */}
              <View style={styles.timePickerColumn}>
                <Text style={[styles.timePickerLabel, { color: colors.muted }]}>Heure</Text>
                <ScrollView style={styles.timePickerScroll} showsVerticalScrollIndicator={false}>
                  {HOURS.map((h) => (
                    <Pressable
                      key={h}
                      style={({ pressed }) => [
                        styles.timePickerItem,
                        tempHour === h && { backgroundColor: `${colors.primary}20` },
                        { opacity: pressed ? 0.7 : 1 },
                      ]}
                      onPress={() => setTempHour(h)}
                    >
                      <Text style={[styles.timePickerItemText, { color: tempHour === h ? colors.primary : colors.foreground, fontWeight: tempHour === h ? '700' : '400' }]}>
                        {h.toString().padStart(2, '0')}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
              <Text style={[styles.timePickerColon, { color: colors.foreground }]}>:</Text>
              {/* Minutes */}
              <View style={styles.timePickerColumn}>
                <Text style={[styles.timePickerLabel, { color: colors.muted }]}>Minute</Text>
                <ScrollView style={styles.timePickerScroll} showsVerticalScrollIndicator={false}>
                  {MINUTES.map((m) => (
                    <Pressable
                      key={m}
                      style={({ pressed }) => [
                        styles.timePickerItem,
                        tempMinute === m && { backgroundColor: `${colors.primary}20` },
                        { opacity: pressed ? 0.7 : 1 },
                      ]}
                      onPress={() => setTempMinute(m)}
                    >
                      <Text style={[styles.timePickerItemText, { color: tempMinute === m ? colors.primary : colors.foreground, fontWeight: tempMinute === m ? '700' : '400' }]}>
                        {m.toString().padStart(2, '0')}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </View>
            <Pressable
              style={({ pressed }) => [styles.confirmBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
              onPress={handleCustomTimeConfirm}
            >
              <Text style={styles.confirmBtnText}>Confirmer — {formatTime(tempHour, tempMinute)}</Text>
            </Pressable>
          </View>
        )}

        {/* Info box */}
        <View style={[styles.infoCard, { backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}20` }]}>
          <Text style={[styles.infoTitle, { color: colors.foreground }]}>💡 Comment ça fonctionne ?</Text>
          <Text style={[styles.infoText, { color: colors.muted }]}>
            Chaque jour à l'heure choisie, vous recevrez un message personnalisé vous invitant à votre pratique de bien-être. Les messages varient pour rester inspirants et non répétitifs.
          </Text>
          <Text style={[styles.infoText, { color: colors.muted, marginTop: 8 }]}>
            Les rappels fonctionnent même lorsque l'application est fermée, grâce aux notifications locales de votre téléphone.
          </Text>
        </View>
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
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 16, marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 2 },
  successBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  successText: { fontSize: 12, fontWeight: '700' },
  toggleCard: { borderRadius: 18, padding: 16, marginBottom: 16 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleIconBg: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  toggleIcon: { fontSize: 22 },
  toggleInfo: { flex: 1 },
  toggleTitle: { fontSize: 16, fontWeight: '700' },
  toggleSubtitle: { fontSize: 13, marginTop: 2 },
  activeInfo: { marginTop: 12, borderRadius: 10, borderWidth: 1, padding: 10 },
  activeInfoText: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  warningCard: { borderRadius: 14, borderWidth: 1, padding: 14, flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginBottom: 16 },
  warningEmoji: { fontSize: 18 },
  warningText: { flex: 1, fontSize: 13, lineHeight: 19 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12, marginTop: 8 },
  presetsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  presetCard: { width: '47%', borderRadius: 14, borderWidth: 1.5, padding: 12, gap: 4 },
  presetEmoji: { fontSize: 20, marginBottom: 2 },
  presetLabel: { fontSize: 13, fontWeight: '700' },
  presetTime: { fontSize: 12 },
  customTimeBtn: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1.5, padding: 14, gap: 10, marginBottom: 12 },
  customTimeEmoji: { fontSize: 20 },
  customTimeLabel: { flex: 1, fontSize: 15, fontWeight: '600' },
  customTimeRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  customTimeValue: { fontSize: 16, fontWeight: '700' },
  timePicker: { borderRadius: 18, borderWidth: 1.5, padding: 16, marginBottom: 16 },
  timePickerTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  timePickerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 },
  timePickerColumn: { flex: 1, alignItems: 'center' },
  timePickerLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', marginBottom: 8 },
  timePickerScroll: { height: 180, width: '100%' },
  timePickerItem: { padding: 10, borderRadius: 8, alignItems: 'center' },
  timePickerItemText: { fontSize: 18 },
  timePickerColon: { fontSize: 24, fontWeight: '800', marginTop: 20 },
  confirmBtn: { borderRadius: 999, paddingVertical: 12, alignItems: 'center' },
  confirmBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  infoCard: { borderRadius: 14, borderWidth: 1, padding: 14, marginTop: 4 },
  infoTitle: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  infoText: { fontSize: 13, lineHeight: 19 },
  });
}
