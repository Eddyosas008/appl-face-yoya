import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NotificationSettings {
  enabled: boolean;
  hour: number;      // 0-23
  minute: number;    // 0-59
  reminderType: 'morning' | 'afternoon' | 'evening' | 'custom';
  scheduledId: string | null;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: false,
  hour: 8,
  minute: 0,
  reminderType: 'morning',
  scheduledId: null,
};

const STORAGE_KEY = 'yoya_notification_settings';

// ─── Notification messages (varied & motivating) ──────────────────────────────

const MORNING_MESSAGES = [
  { title: '🌸 Bonjour, belle âme', body: 'Commencez votre journée avec 5 minutes de pleine conscience. Votre bien-être vous attend.' },
  { title: '☀️ Un nouveau départ', body: 'Chaque matin est une chance de vous reconnecter à vous-même. Méditez dès maintenant.' },
  { title: '🌿 Votre moment de calme', body: 'Avant que la journée s\'emballe, prenez un instant pour vous centrer. Yoya vous attend.' },
  { title: '💜 Prenez soin de vous', body: 'Une courte méditation ce matin peut transformer toute votre journée. Commençons ?' },
  { title: '🌅 L\'heure du bien-être', body: 'Votre pratique quotidienne vous attend. Même 5 minutes font une vraie différence.' },
];

const AFTERNOON_MESSAGES = [
  { title: '🌬️ Pause bien-être', body: 'Milieu de journée — le moment idéal pour une respiration guidée et recharger vos batteries.' },
  { title: '💆‍♀️ Reconnectez-vous', body: 'Comment vous sentez-vous en ce moment ? Prenez 5 minutes pour un check-in émotionnel.' },
  { title: '🌸 Votre pause méritée', body: 'Relâchez les tensions de la matinée avec une méditation anti-stress. Vous le méritez.' },
  { title: '✨ Recentrez-vous', body: 'Une courte pause méditative en milieu de journée booste votre concentration et votre sérénité.' },
  { title: '🫁 Respirez', body: 'Quelques respirations profondes peuvent tout changer. Votre exercice de respiration vous attend.' },
];

const EVENING_MESSAGES = [
  { title: '🌙 Préparez votre sommeil', body: 'Une méditation du soir pour relâcher les tensions et glisser doucement vers le sommeil.' },
  { title: '🌟 Bilan de la journée', body: 'Prenez un moment pour noter vos pensées dans votre journal et clore cette journée en beauté.' },
  { title: '💜 Votre rituel du soir', body: 'Laissez aller les soucis de la journée. Une méditation apaisante vous attend.' },
  { title: '🌸 Douceur du soir', body: 'Offrez-vous un moment de paix avant de dormir. Votre corps et votre esprit vous remercieront.' },
  { title: '✨ Fin de journée sereine', body: 'Terminez cette journée avec gratitude et légèreté. Méditez avec Yoya ce soir.' },
];

function getMessagesForHour(hour: number) {
  if (hour >= 5 && hour < 12) return MORNING_MESSAGES;
  if (hour >= 12 && hour < 18) return AFTERNOON_MESSAGES;
  return EVENING_MESSAGES;
}

function getRandomMessage(hour: number) {
  const messages = getMessagesForHour(hour);
  return messages[Math.floor(Math.random() * messages.length)];
}

// ─── Notification Handler (call once at app startup) ──────────────────────────

export function setupNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

// ─── Android channel setup ────────────────────────────────────────────────────

async function ensureAndroidChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('yoya-daily-reminder', {
      name: 'Rappel quotidien Yoya',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#7C3AED',
      sound: 'default',
    });
  }
}

// ─── Permission request ───────────────────────────────────────────────────────

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  await ensureAndroidChannel();

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function getNotificationPermissionStatus(): Promise<'granted' | 'denied' | 'undetermined'> {
  if (Platform.OS === 'web') return 'denied';
  const { status } = await Notifications.getPermissionsAsync();
  return status as 'granted' | 'denied' | 'undetermined';
}

// ─── Schedule / cancel daily reminder ────────────────────────────────────────

export async function scheduleDailyReminder(
  hour: number,
  minute: number
): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  // Cancel any existing reminder first
  await cancelDailyReminder();

  const msg = getRandomMessage(hour);

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: msg.title,
        body: msg.body,
        sound: 'default',
        data: { url: '/(tabs)' },
        ...(Platform.OS === 'android' ? { channelId: 'yoya-daily-reminder' } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
    return id;
  } catch (e) {
    console.warn('Failed to schedule notification:', e);
    return null;
  }
}

export async function cancelDailyReminder(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    const settings = await loadNotificationSettings();
    if (settings.scheduledId) {
      await Notifications.cancelScheduledNotificationAsync(settings.scheduledId);
    }
  } catch (_) {}
}

export async function cancelAllReminders(): Promise<void> {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// ─── Persistence ──────────────────────────────────────────────────────────────

export async function saveNotificationSettings(settings: NotificationSettings): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export async function loadNotificationSettings(): Promise<NotificationSettings> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(raw) };
  } catch (_) {}
  return { ...DEFAULT_NOTIFICATION_SETTINGS };
}

// ─── High-level toggle ────────────────────────────────────────────────────────

export async function enableDailyReminder(
  hour: number,
  minute: number
): Promise<{ success: boolean; permissionDenied?: boolean }> {
  const granted = await requestNotificationPermission();
  if (!granted) return { success: false, permissionDenied: true };

  const id = await scheduleDailyReminder(hour, minute);
  if (!id) return { success: false };

  const settings: NotificationSettings = {
    enabled: true,
    hour,
    minute,
    reminderType: getReminderType(hour),
    scheduledId: id,
  };
  await saveNotificationSettings(settings);
  return { success: true };
}

export async function disableDailyReminder(): Promise<void> {
  await cancelDailyReminder();
  const settings = await loadNotificationSettings();
  await saveNotificationSettings({ ...settings, enabled: false, scheduledId: null });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getReminderType(hour: number): NotificationSettings['reminderType'] {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18) return 'evening';
  return 'custom';
}

export function formatTime(hour: number, minute: number): string {
  const h = hour.toString().padStart(2, '0');
  const m = minute.toString().padStart(2, '0');
  return `${h}:${m}`;
}

export const PRESET_TIMES: { label: string; emoji: string; hour: number; minute: number; type: NotificationSettings['reminderType'] }[] = [
  { label: 'Matin doux', emoji: '🌅', hour: 7, minute: 0, type: 'morning' },
  { label: 'Début de journée', emoji: '☀️', hour: 8, minute: 30, type: 'morning' },
  { label: 'Pause déjeuner', emoji: '🌿', hour: 12, minute: 30, type: 'afternoon' },
  { label: 'Après-midi', emoji: '🌸', hour: 15, minute: 0, type: 'afternoon' },
  { label: 'Fin de journée', emoji: '🌆', hour: 18, minute: 0, type: 'evening' },
  { label: 'Soirée calme', emoji: '🌙', hour: 20, minute: 30, type: 'evening' },
  { label: 'Avant le sommeil', emoji: '✨', hour: 22, minute: 0, type: 'evening' },
];
