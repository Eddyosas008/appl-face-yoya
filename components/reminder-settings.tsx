/**
 * ReminderSettings — Composant de configuration des rappels de méditation.
 *
 * Affiche :
 * - Un toggle pour activer/désactiver les rappels
 * - Un sélecteur d'heure (heure + minutes avec +/-)
 * - Les jours de la semaine (boutons toggle)
 * - Un message d'état des permissions
 */

import { useThemeContext } from "@/lib/theme-provider";
import { useNotifications, type WeekDay } from "@/hooks/use-notifications";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

// ─── Constantes ───────────────────────────────────────────────────────────────

const DAYS: { id: WeekDay; short: string; long: string }[] = [
  { id: 1, short: "Lu", long: "Lundi" },
  { id: 2, short: "Ma", long: "Mardi" },
  { id: 3, short: "Me", long: "Mercredi" },
  { id: 4, short: "Je", long: "Jeudi" },
  { id: 5, short: "Ve", long: "Vendredi" },
  { id: 6, short: "Sa", long: "Samedi" },
  { id: 7, short: "Di", long: "Dimanche" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pad(n: number) {
  return String(n).padStart(2, "0");
}

// ─── Composant principal ──────────────────────────────────────────────────────

export function ReminderSettings() {
  const { isDark } = useThemeContext();
  const s = makeStyles(isDark);
  const GOLD = isDark ? "#C8A96E" : "#8B6914";
  const TEXT1 = isDark ? "#F0EBE0" : "#1C1410";
  const TEXT2 = isDark ? "rgba(240,235,224,0.60)" : "rgba(60,40,20,0.60)";
  const CARD  = isDark ? "#2A2540" : "#FFFFFF";
  const BORD  = isDark ? "rgba(200,169,110,0.25)" : "rgba(139,105,20,0.20)";
  const SURF  = isDark ? "#201C38" : "#F5F0E8";

  const { prefs, permissionStatus, loading, toggleEnabled, setTime, toggleDay } = useNotifications();

  // État local pour l'édition de l'heure (avant confirmation)
  const [editHour, setEditHour] = useState(prefs.hour);
  const [editMinute, setEditMinute] = useState(prefs.minute);
  const [timeChanged, setTimeChanged] = useState(false);

  const adjustHour = useCallback((delta: number) => {
    setEditHour(h => {
      const next = (h + delta + 24) % 24;
      setTimeChanged(true);
      return next;
    });
  }, []);

  const adjustMinute = useCallback((delta: number) => {
    setEditMinute(m => {
      const next = (m + delta + 60) % 60;
      setTimeChanged(true);
      return next;
    });
  }, []);

  const applyTime = useCallback(async () => {
    await setTime(editHour, editMinute);
    setTimeChanged(false);
  }, [editHour, editMinute, setTime]);

  if (loading) {
    return (
      <View style={[s.card, { backgroundColor: CARD, borderColor: BORD }]}>
        <ActivityIndicator color={GOLD} />
      </View>
    );
  }

  return (
    <View style={[s.card, { backgroundColor: CARD, borderColor: BORD }]}>
      {/* En-tête avec toggle */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Text style={s.bellIcon}>🔔</Text>
          <View>
            <Text style={[s.title, { color: TEXT1 }]}>Rappels de méditation</Text>
            <Text style={[s.subtitle, { color: TEXT2 }]}>
              {prefs.enabled
                ? `Actif · ${pad(prefs.hour)}h${pad(prefs.minute)}`
                : "Désactivé"}
            </Text>
          </View>
        </View>
        <Switch
          value={prefs.enabled}
          onValueChange={toggleEnabled}
          trackColor={{ false: isDark ? "#3A3550" : "#D1C9B8", true: GOLD }}
          thumbColor={prefs.enabled ? "#FFFFFF" : isDark ? "#6B6580" : "#A09880"}
          ios_backgroundColor={isDark ? "#3A3550" : "#D1C9B8"}
        />
      </View>

      {/* Message permissions refusées */}
      {permissionStatus === "denied" && prefs.enabled && (
        <View style={[s.permWarning, { backgroundColor: "rgba(239,68,68,0.10)", borderColor: "rgba(239,68,68,0.25)" }]}>
          <Text style={s.permWarningText}>
            ⚠️ Les notifications sont désactivées dans les paramètres de votre appareil. Activez-les pour recevoir vos rappels.
          </Text>
        </View>
      )}

      {/* Contenu étendu quand activé */}
      {prefs.enabled && (
        <>
          {/* Sélecteur d'heure */}
          <View style={[s.section, { borderTopColor: BORD }]}>
            <Text style={[s.sectionLabel, { color: TEXT2 }]}>Heure du rappel</Text>
            <View style={s.timeRow}>
              {/* Heures */}
              <View style={s.timeUnit}>
                <Pressable
                  style={({ pressed }) => [s.timeBtn, { backgroundColor: SURF, opacity: pressed ? 0.7 : 1 }]}
                  onPress={() => adjustHour(1)}
                >
                  <Text style={[s.timeBtnIcon, { color: GOLD }]}>▲</Text>
                </Pressable>
                <Text style={[s.timeValue, { color: TEXT1 }]}>{pad(editHour)}</Text>
                <Pressable
                  style={({ pressed }) => [s.timeBtn, { backgroundColor: SURF, opacity: pressed ? 0.7 : 1 }]}
                  onPress={() => adjustHour(-1)}
                >
                  <Text style={[s.timeBtnIcon, { color: GOLD }]}>▼</Text>
                </Pressable>
              </View>

              <Text style={[s.timeSep, { color: TEXT1 }]}>:</Text>

              {/* Minutes */}
              <View style={s.timeUnit}>
                <Pressable
                  style={({ pressed }) => [s.timeBtn, { backgroundColor: SURF, opacity: pressed ? 0.7 : 1 }]}
                  onPress={() => adjustMinute(5)}
                >
                  <Text style={[s.timeBtnIcon, { color: GOLD }]}>▲</Text>
                </Pressable>
                <Text style={[s.timeValue, { color: TEXT1 }]}>{pad(editMinute)}</Text>
                <Pressable
                  style={({ pressed }) => [s.timeBtn, { backgroundColor: SURF, opacity: pressed ? 0.7 : 1 }]}
                  onPress={() => adjustMinute(-5)}
                >
                  <Text style={[s.timeBtnIcon, { color: GOLD }]}>▼</Text>
                </Pressable>
              </View>

              {/* Bouton Appliquer */}
              {timeChanged && (
                <Pressable
                  style={({ pressed }) => [s.applyBtn, { backgroundColor: GOLD, opacity: pressed ? 0.8 : 1 }]}
                  onPress={applyTime}
                >
                  <Text style={s.applyBtnText}>Appliquer</Text>
                </Pressable>
              )}
            </View>
          </View>

          {/* Sélecteur de jours */}
          <View style={[s.section, { borderTopColor: BORD }]}>
            <Text style={[s.sectionLabel, { color: TEXT2 }]}>Jours de rappel</Text>
            <View style={s.daysRow}>
              {DAYS.map(day => {
                const active = prefs.days.includes(day.id);
                return (
                  <Pressable
                    key={day.id}
                    style={({ pressed }) => [
                      s.dayBtn,
                      {
                        backgroundColor: active ? GOLD : SURF,
                        borderColor: active ? GOLD : BORD,
                        opacity: pressed ? 0.75 : 1,
                      },
                    ]}
                    onPress={() => toggleDay(day.id)}
                  >
                    <Text style={[s.dayBtnText, { color: active ? "#1C1410" : TEXT2 }]}>
                      {day.short}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={[s.daysHint, { color: TEXT2 }]}>
              {prefs.days.length === 7
                ? "Tous les jours"
                : prefs.days.map(d => DAYS.find(x => x.id === d)?.long).join(", ")}
            </Text>
          </View>

          {/* Aperçu du prochain rappel */}
          <View style={[s.preview, { backgroundColor: SURF, borderColor: BORD }]}>
            <Text style={[s.previewText, { color: TEXT2 }]}>
              Prochain rappel · {pad(prefs.hour)}h{pad(prefs.minute)} ·{" "}
              {prefs.days.length === 7
                ? "chaque jour"
                : prefs.days.length === 1
                ? DAYS.find(d => d.id === prefs.days[0])?.long
                : `${prefs.days.length} jours / semaine`}
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function makeStyles(isDark: boolean) {
  return StyleSheet.create({
    card: {
      borderRadius: 20,
      borderWidth: 0.5,
      overflow: "hidden",
      marginBottom: 16,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 18,
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      flex: 1,
    },
    bellIcon: { fontSize: 24 },
    title: { fontSize: 15, fontWeight: "600", letterSpacing: 0.2 },
    subtitle: { fontSize: 12, marginTop: 2 },

    permWarning: {
      marginHorizontal: 16,
      marginBottom: 14,
      borderRadius: 12,
      padding: 12,
      borderWidth: 0.5,
    },
    permWarningText: { fontSize: 12, color: "#EF4444", lineHeight: 18 },

    section: {
      borderTopWidth: 0.5,
      padding: 18,
      paddingTop: 16,
    },
    sectionLabel: {
      fontSize: 11,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 14,
    },

    // Sélecteur heure
    timeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    timeUnit: {
      alignItems: "center",
      gap: 4,
    },
    timeBtn: {
      width: 36,
      height: 28,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    timeBtnIcon: { fontSize: 12, fontWeight: "700" },
    timeValue: {
      fontSize: 32,
      fontWeight: "700",
      letterSpacing: 1,
      minWidth: 52,
      textAlign: "center",
    },
    timeSep: {
      fontSize: 28,
      fontWeight: "300",
      marginBottom: 4,
      paddingHorizontal: 4,
    },
    applyBtn: {
      marginLeft: 12,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      alignSelf: "center",
    },
    applyBtnText: {
      fontSize: 13,
      fontWeight: "700",
      color: "#1C1410",
    },

    // Jours
    daysRow: {
      flexDirection: "row",
      gap: 6,
      flexWrap: "wrap",
      marginBottom: 10,
    },
    dayBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 0.5,
    },
    dayBtnText: { fontSize: 11, fontWeight: "700" },
    daysHint: { fontSize: 11, lineHeight: 16 },

    // Aperçu
    preview: {
      marginHorizontal: 16,
      marginBottom: 16,
      borderRadius: 12,
      padding: 12,
      borderWidth: 0.5,
    },
    previewText: { fontSize: 12, textAlign: "center" },
  });
}
