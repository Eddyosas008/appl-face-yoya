/**
 * ReminderSettings — Composant de configuration des rappels de méditation.
 *
 * Fonctionnalités :
 * - Toggle pour activer/désactiver les rappels
 * - Presets d'heure rapides (Matin, Après-midi, Soirée, Nuit)
 * - Sélecteur d'heure précis (heure + minutes avec +/-)
 * - Sélecteur de jours de la semaine
 * - Aperçu du prochain rappel
 * - Message de permissions refusées
 */

import { useThemeContext } from "@/lib/theme-provider";
import { useNotifications, type WeekDay } from "@/hooks/use-notifications";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

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

const PRESETS = [
  { label: "Matin doux",       emoji: "🌅", hour: 7,  minute: 0  },
  { label: "Début journée",    emoji: "☀️", hour: 8,  minute: 30 },
  { label: "Pause déjeuner",   emoji: "🌿", hour: 12, minute: 30 },
  { label: "Soirée calme",     emoji: "🌙", hour: 20, minute: 30 },
  { label: "Avant le sommeil", emoji: "✨", hour: 22, minute: 0  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pad(n: number) {
  return String(n).padStart(2, "0");
}

// ─── Composant principal ──────────────────────────────────────────────────────

export function ReminderSettings() {
  const { isDark } = useThemeContext();
  const GOLD  = isDark ? "#C8A96E" : "#8B6914";
  const TEXT1 = isDark ? "#F0EBE0" : "#1C1410";
  const TEXT2 = isDark ? "rgba(240,235,224,0.60)" : "rgba(60,40,20,0.60)";
  const CARD  = isDark ? "#2A2540" : "#FFFFFF";
  const BORD  = isDark ? "rgba(200,169,110,0.25)" : "rgba(139,105,20,0.20)";
  const SURF  = isDark ? "#201C38" : "#F5F0E8";

  const { prefs, permissionStatus, loading, toggleEnabled, setTime, toggleDay } = useNotifications();

  // État local pour l'édition de l'heure (avant confirmation)
  const [editHour,   setEditHour]   = useState(prefs.hour);
  const [editMinute, setEditMinute] = useState(prefs.minute);
  const [timeChanged, setTimeChanged] = useState(false);

  const adjustHour = useCallback((delta: number) => {
    setEditHour(h => { const next = (h + delta + 24) % 24; setTimeChanged(true); return next; });
  }, []);

  const adjustMinute = useCallback((delta: number) => {
    setEditMinute(m => { const next = (m + delta + 60) % 60; setTimeChanged(true); return next; });
  }, []);

  const applyTime = useCallback(async () => {
    await setTime(editHour, editMinute);
    setTimeChanged(false);
  }, [editHour, editMinute, setTime]);

  const applyPreset = useCallback(async (hour: number, minute: number) => {
    setEditHour(hour);
    setEditMinute(minute);
    await setTime(hour, minute);
    setTimeChanged(false);
  }, [setTime]);

  const isActivePreset = (hour: number, minute: number) =>
    prefs.hour === hour && prefs.minute === minute;

  if (loading) {
    return (
      <View style={[styles.card, { backgroundColor: CARD, borderColor: BORD }]}>
        <ActivityIndicator color={GOLD} />
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: CARD, borderColor: BORD }]}>

      {/* ── En-tête avec toggle ─────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.bellWrap, { backgroundColor: GOLD + "22" }]}>
            <Text style={styles.bellIcon}>🔔</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: TEXT1 }]}>Rappels de méditation</Text>
            <Text style={[styles.subtitle, { color: TEXT2 }]}>
              {prefs.enabled
                ? `Actif · ${pad(prefs.hour)}h${pad(prefs.minute)} · ${
                    prefs.days.length === 7 ? "chaque jour" : `${prefs.days.length} j/sem`
                  }`
                : "Désactivé — activez pour recevoir des rappels"}
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

      {/* ── Avertissement permissions ───────────────────────────────────── */}
      {permissionStatus === "denied" && prefs.enabled && (
        <View style={[styles.permWarning, { backgroundColor: "rgba(239,68,68,0.10)", borderColor: "rgba(239,68,68,0.25)" }]}>
          <Text style={styles.permWarningText}>
            ⚠️ Les notifications sont désactivées dans les paramètres de votre appareil. Activez-les pour recevoir vos rappels.
          </Text>
        </View>
      )}

      {/* ── Contenu étendu quand activé ─────────────────────────────────── */}
      {prefs.enabled && (
        <>
          {/* Presets rapides */}
          <View style={[styles.section, { borderTopColor: BORD }]}>
            <Text style={[styles.sectionLabel, { color: TEXT2 }]}>Horaires suggérés</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.presetsRow}
            >
              {PRESETS.map(p => {
                const active = isActivePreset(p.hour, p.minute);
                return (
                  <Pressable
                    key={p.label}
                    style={({ pressed }) => [
                      styles.presetBtn,
                      {
                        backgroundColor: active ? GOLD : SURF,
                        borderColor: active ? GOLD : BORD,
                        opacity: pressed ? 0.75 : 1,
                      },
                    ]}
                    onPress={() => applyPreset(p.hour, p.minute)}
                  >
                    <Text style={styles.presetEmoji}>{p.emoji}</Text>
                    <Text style={[styles.presetLabel, { color: active ? "#1C1410" : TEXT1 }]}>
                      {p.label}
                    </Text>
                    <Text style={[styles.presetTime, { color: active ? "#1C1410" : TEXT2 }]}>
                      {pad(p.hour)}:{pad(p.minute)}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Sélecteur d'heure précis */}
          <View style={[styles.section, { borderTopColor: BORD }]}>
            <Text style={[styles.sectionLabel, { color: TEXT2 }]}>Heure personnalisée</Text>
            <View style={styles.timeRow}>
              {/* Heures */}
              <View style={styles.timeUnit}>
                <Pressable
                  style={({ pressed }) => [styles.timeBtn, { backgroundColor: SURF, opacity: pressed ? 0.7 : 1 }]}
                  onPress={() => adjustHour(1)}
                >
                  <Text style={[styles.timeBtnIcon, { color: GOLD }]}>▲</Text>
                </Pressable>
                <Text style={[styles.timeValue, { color: TEXT1 }]}>{pad(editHour)}</Text>
                <Pressable
                  style={({ pressed }) => [styles.timeBtn, { backgroundColor: SURF, opacity: pressed ? 0.7 : 1 }]}
                  onPress={() => adjustHour(-1)}
                >
                  <Text style={[styles.timeBtnIcon, { color: GOLD }]}>▼</Text>
                </Pressable>
              </View>

              <Text style={[styles.timeSep, { color: TEXT1 }]}>:</Text>

              {/* Minutes */}
              <View style={styles.timeUnit}>
                <Pressable
                  style={({ pressed }) => [styles.timeBtn, { backgroundColor: SURF, opacity: pressed ? 0.7 : 1 }]}
                  onPress={() => adjustMinute(5)}
                >
                  <Text style={[styles.timeBtnIcon, { color: GOLD }]}>▲</Text>
                </Pressable>
                <Text style={[styles.timeValue, { color: TEXT1 }]}>{pad(editMinute)}</Text>
                <Pressable
                  style={({ pressed }) => [styles.timeBtn, { backgroundColor: SURF, opacity: pressed ? 0.7 : 1 }]}
                  onPress={() => adjustMinute(-5)}
                >
                  <Text style={[styles.timeBtnIcon, { color: GOLD }]}>▼</Text>
                </Pressable>
              </View>

              {/* Bouton Appliquer */}
              {timeChanged && (
                <Pressable
                  style={({ pressed }) => [styles.applyBtn, { opacity: pressed ? 0.8 : 1 }]}
                  onPress={applyTime}
                >
                  <LinearGradient
                    colors={[GOLD, "#F0D090"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.applyBtnGradient}
                  >
                    <Text style={styles.applyBtnText}>Appliquer</Text>
                  </LinearGradient>
                </Pressable>
              )}
            </View>
          </View>

          {/* Sélecteur de jours */}
          <View style={[styles.section, { borderTopColor: BORD }]}>
            <View style={styles.daysHeader}>
              <Text style={[styles.sectionLabel, { color: TEXT2 }]}>Jours de rappel</Text>
              <Pressable
                onPress={async () => {
                  // Sélectionner / désélectionner tous les jours
                  const allSelected = prefs.days.length === 7;
                  const newDays: WeekDay[] = allSelected ? [1] : [1,2,3,4,5,6,7];
                  // On utilise savePrefs via toggleDay en boucle n'est pas optimal,
                  // on va juste appeler toggleDay pour chaque jour manquant/excédentaire
                  // Simplification : on recharge via setTime pour déclencher un re-render
                  // Note: pour "tous les jours", on toggle chaque jour manquant
                  if (!allSelected) {
                    for (const d of [2,3,4,5,6,7] as WeekDay[]) {
                      if (!prefs.days.includes(d)) await toggleDay(d);
                    }
                  }
                }}
              >
                <Text style={[styles.daysAllBtn, { color: GOLD }]}>
                  {prefs.days.length === 7 ? "Aucun" : "Tous"}
                </Text>
              </Pressable>
            </View>
            <View style={styles.daysRow}>
              {DAYS.map(day => {
                const active = prefs.days.includes(day.id);
                return (
                  <Pressable
                    key={day.id}
                    style={({ pressed }) => [
                      styles.dayBtn,
                      {
                        backgroundColor: active ? GOLD : SURF,
                        borderColor: active ? GOLD : BORD,
                        opacity: pressed ? 0.75 : 1,
                      },
                    ]}
                    onPress={() => toggleDay(day.id)}
                  >
                    <Text style={[styles.dayBtnText, { color: active ? "#1C1410" : TEXT2 }]}>
                      {day.short}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={[styles.daysHint, { color: TEXT2 }]}>
              {prefs.days.length === 7
                ? "Tous les jours"
                : prefs.days.map(d => DAYS.find(x => x.id === d)?.long).join(", ")}
            </Text>
          </View>

          {/* Aperçu du prochain rappel */}
          <View style={[styles.preview, { backgroundColor: GOLD + "15", borderColor: GOLD + "40" }]}>
            <Text style={{ fontSize: 16, marginBottom: 4 }}>🔔</Text>
            <Text style={[styles.previewTitle, { color: TEXT1 }]}>
              Prochain rappel à {pad(prefs.hour)}h{pad(prefs.minute)}
            </Text>
            <Text style={[styles.previewSub, { color: TEXT2 }]}>
              {prefs.days.length === 7
                ? "Chaque jour"
                : prefs.days.length === 1
                ? DAYS.find(d => d.id === prefs.days[0])?.long
                : `${prefs.days.length} jours par semaine`}
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
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
    gap: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  bellWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  bellIcon: { fontSize: 22 },
  title: { fontSize: 15, fontWeight: "600", letterSpacing: 0.2 },
  subtitle: { fontSize: 12, marginTop: 2, lineHeight: 16 },

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

  // Presets
  presetsRow: {
    gap: 8,
    paddingRight: 4,
  },
  presetBtn: {
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 0.5,
    minWidth: 90,
    gap: 2,
  },
  presetEmoji: { fontSize: 18, marginBottom: 2 },
  presetLabel: { fontSize: 11, fontWeight: "600", textAlign: "center" },
  presetTime: { fontSize: 11, textAlign: "center" },

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
    borderRadius: 12,
    overflow: "hidden",
    alignSelf: "center",
  },
  applyBtnGradient: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  applyBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1C1410",
  },

  // Jours
  daysHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  daysAllBtn: { fontSize: 12, fontWeight: "600" },
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
    borderRadius: 14,
    padding: 14,
    borderWidth: 0.5,
    alignItems: "center",
    gap: 2,
  },
  previewTitle: { fontSize: 14, fontWeight: "700", textAlign: "center" },
  previewSub: { fontSize: 12, textAlign: "center" },
});
