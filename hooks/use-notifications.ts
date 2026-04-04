/**
 * useNotifications — Hook de gestion des notifications de rappel de méditation.
 *
 * Fonctionnalités :
 * - Demande de permissions iOS/Android
 * - Planification de rappels quotidiens ou par jours de la semaine
 * - Annulation de tous les rappels existants
 * - Persistance des préférences dans AsyncStorage
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

export type WeekDay = 1 | 2 | 3 | 4 | 5 | 6 | 7; // 1 = Lundi … 7 = Dimanche

export interface ReminderPrefs {
  enabled: boolean;
  hour: number;   // 0-23
  minute: number; // 0-59
  days: WeekDay[]; // jours sélectionnés (vide = tous les jours)
}

const STORAGE_KEY = "somniopax:reminder_prefs";
const CHANNEL_ID  = "meditation_reminder";

const DEFAULT_PREFS: ReminderPrefs = {
  enabled: false,
  hour: 8,
  minute: 0,
  days: [1, 2, 3, 4, 5, 6, 7],
};

// Messages de rappel variés pour éviter la monotonie
const REMINDER_MESSAGES = [
  { title: "🧘 Votre moment de paix vous attend", body: "Quelques minutes de méditation pour bien commencer la journée." },
  { title: "✨ Prenez soin de vous", body: "Un instant de calme peut transformer toute votre journée." },
  { title: "🌙 Votre sanctuaire intérieur", body: "SomnioPax est prêt pour votre séance de méditation." },
  { title: "🌿 Reconnectez-vous à vous-même", body: "Une courte méditation pour retrouver votre équilibre." },
  { title: "💫 Moment de bien-être", body: "Votre pratique quotidienne vous attend dans SomnioPax." },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Crée le canal Android si nécessaire */
async function ensureAndroidChannel() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "Rappels de méditation",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#C8A96E",
      sound: "default",
    });
  }
}

/** Demande les permissions et retourne true si accordées */
async function requestPermissions(): Promise<boolean> {
  await ensureAndroidChannel();
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

/** Annule tous les rappels SomnioPax planifiés */
async function cancelAllReminders() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notif of scheduled) {
    if (notif.content.data?.type === "meditation_reminder") {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }
}

/**
 * Planifie les rappels selon les préférences.
 * - Si days est vide ou contient les 7 jours → rappel quotidien (repeats: true)
 * - Sinon → un rappel par jour sélectionné avec trigger weekday
 */
async function scheduleReminders(prefs: ReminderPrefs) {
  await cancelAllReminders();
  if (!prefs.enabled) return;

  const msg = REMINDER_MESSAGES[Math.floor(Math.random() * REMINDER_MESSAGES.length)];
  const allDays = prefs.days.length === 0 || prefs.days.length === 7;

  if (allDays) {
    // Rappel quotidien
    await Notifications.scheduleNotificationAsync({
      content: {
        title: msg.title,
        body: msg.body,
        sound: "default",
        data: { type: "meditation_reminder" },
      },
      trigger: {
        hour: prefs.hour,
        minute: prefs.minute,
        repeats: true,
        ...(Platform.OS === "android" ? { channelId: CHANNEL_ID } : {}),
      } as Notifications.NotificationTriggerInput,
    });
  } else {
    // Un rappel par jour sélectionné
    // weekday: 1=Dimanche, 2=Lundi … 7=Samedi (Expo/iOS convention)
    // Notre convention : 1=Lundi … 7=Dimanche → mapping nécessaire
    const toExpoWeekday = (day: WeekDay): number => {
      // Lundi=1 → 2, Mardi=2 → 3, … Samedi=6 → 7, Dimanche=7 → 1
      return day === 7 ? 1 : day + 1;
    };

    for (const day of prefs.days) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: msg.title,
          body: msg.body,
          sound: "default",
          data: { type: "meditation_reminder", day },
        },
        trigger: {
          weekday: toExpoWeekday(day),
          hour: prefs.hour,
          minute: prefs.minute,
          repeats: true,
          ...(Platform.OS === "android" ? { channelId: CHANNEL_ID } : {}),
        } as Notifications.NotificationTriggerInput,
      });
    }
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useNotifications() {
  const [prefs, setPrefs] = useState<ReminderPrefs>(DEFAULT_PREFS);
  const [permissionStatus, setPermissionStatus] = useState<"unknown" | "granted" | "denied">("unknown");
  const [loading, setLoading] = useState(true);

  // Charger les préférences au montage
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setPrefs(JSON.parse(raw));
        const { status } = await Notifications.getPermissionsAsync();
        setPermissionStatus(status === "granted" ? "granted" : status === "denied" ? "denied" : "unknown");
      } catch {
        // Ignore les erreurs de lecture
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /** Sauvegarde et applique les nouvelles préférences */
  const savePrefs = useCallback(async (newPrefs: ReminderPrefs) => {
    setPrefs(newPrefs);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs));

    if (newPrefs.enabled) {
      const granted = await requestPermissions();
      setPermissionStatus(granted ? "granted" : "denied");
      if (granted) {
        await scheduleReminders(newPrefs);
      }
    } else {
      await cancelAllReminders();
    }
  }, []);

  /** Active/désactive les rappels */
  const toggleEnabled = useCallback(async () => {
    const newPrefs = { ...prefs, enabled: !prefs.enabled };
    await savePrefs(newPrefs);
  }, [prefs, savePrefs]);

  /** Modifie l'heure du rappel */
  const setTime = useCallback(async (hour: number, minute: number) => {
    const newPrefs = { ...prefs, hour, minute };
    await savePrefs(newPrefs);
  }, [prefs, savePrefs]);

  /** Bascule un jour de la semaine */
  const toggleDay = useCallback(async (day: WeekDay) => {
    const days = prefs.days.includes(day)
      ? prefs.days.filter(d => d !== day)
      : [...prefs.days, day].sort((a, b) => a - b) as WeekDay[];
    // Garantir au moins 1 jour sélectionné
    if (days.length === 0) return;
    const newPrefs = { ...prefs, days };
    await savePrefs(newPrefs);
  }, [prefs, savePrefs]);

  return {
    prefs,
    permissionStatus,
    loading,
    toggleEnabled,
    setTime,
    toggleDay,
    savePrefs,
  };
}
