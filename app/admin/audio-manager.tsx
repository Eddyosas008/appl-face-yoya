/**
 * Écran Admin — Gestionnaire d'URLs Audio des Programmes
 *
 * Accessible depuis : /admin/audio-manager
 * Permet de visualiser et modifier les URLs audio de chaque jour de programme.
 * Réservé aux utilisateurs avec role = "admin".
 */
import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";

// ─── Types ────────────────────────────────────────────────────────────────────

type ProgramDay = {
  id: number;
  programSlug: string;
  dayNumber: number;
  title: string;
  audioUrl?: string | null;
  audioDurationSeconds?: number | null;
};

// ─── Composant DayAudioRow ────────────────────────────────────────────────────

function DayAudioRow({
  day,
  programSlug,
  onSaved,
}: {
  day: ProgramDay;
  programSlug: string;
  onSaved: () => void;
}) {
  const colors = useColors();
  const [audioUrl, setAudioUrl] = useState(day.audioUrl ?? "");
  const [duration, setDuration] = useState(
    day.audioDurationSeconds ? String(day.audioDurationSeconds) : ""
  );
  const [editing, setEditing] = useState(false);

  const updateMutation = trpc.programs.updateDayAudio.useMutation({
    onSuccess: () => {
      setEditing(false);
      onSaved();
    },
    onError: (err) => {
      Alert.alert("Erreur", err.message);
    },
  });

  const hasAudio = !!day.audioUrl;
  const isDirty =
    audioUrl !== (day.audioUrl ?? "") ||
    duration !== (day.audioDurationSeconds ? String(day.audioDurationSeconds) : "");

  const handleSave = () => {
    updateMutation.mutate({
      programSlug,
      dayNumber: day.dayNumber,
      audioUrl: audioUrl.trim() || null,
      audioDurationSeconds: duration ? parseInt(duration, 10) : 0,
    });
  };

  const handleClear = () => {
    Alert.alert("Supprimer l'audio", `Supprimer l'URL audio du Jour ${day.dayNumber} ?`, [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: () => {
          setAudioUrl("");
          setDuration("");
          updateMutation.mutate({
            programSlug,
            dayNumber: day.dayNumber,
            audioUrl: null,
            audioDurationSeconds: 0,
          });
        },
      },
    ]);
  };

  return (
    <View style={[styles.dayRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* En-tête du jour */}
      <View style={styles.dayHeader}>
        <View style={[styles.dayBadge, { backgroundColor: hasAudio ? "#22C55E22" : "#6B728022" }]}>
          <Text style={[styles.dayBadgeText, { color: hasAudio ? "#22C55E" : colors.muted }]}>
            J{day.dayNumber}
          </Text>
        </View>
        <View style={styles.dayTitleWrap}>
          <Text style={[styles.dayTitle, { color: colors.foreground }]} numberOfLines={1}>
            {day.title}
          </Text>
          <Text style={[styles.dayStatus, { color: hasAudio ? "#22C55E" : colors.muted }]}>
            {hasAudio ? "✓ Audio configuré" : "Pas d'audio"}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.editBtn, { borderColor: colors.border }]}
          onPress={() => setEditing(!editing)}
        >
          <Text style={[styles.editBtnText, { color: colors.primary }]}>
            {editing ? "Fermer" : "Modifier"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Formulaire d'édition */}
      {editing && (
        <View style={styles.editForm}>
          <Text style={[styles.fieldLabel, { color: colors.muted }]}>URL Audio (MP3/M4A)</Text>
          <TextInput
            style={[styles.urlInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
            value={audioUrl}
            onChangeText={setAudioUrl}
            placeholder="https://example.com/audio/jour-1.mp3"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            returnKeyType="next"
            multiline={false}
          />

          <Text style={[styles.fieldLabel, { color: colors.muted, marginTop: 8 }]}>
            Durée (secondes)
          </Text>
          <TextInput
            style={[styles.durationInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
            value={duration}
            onChangeText={setDuration}
            placeholder="ex: 1200 (= 20 min)"
            placeholderTextColor={colors.muted}
            keyboardType="numeric"
            returnKeyType="done"
          />

          {/* Boutons d'action */}
          <View style={styles.actionRow}>
            {hasAudio && (
              <TouchableOpacity
                style={[styles.clearBtn, { borderColor: "#EF4444" }]}
                onPress={handleClear}
              >
                <Text style={[styles.clearBtnText, { color: "#EF4444" }]}>Supprimer</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.saveBtn,
                { backgroundColor: isDirty ? colors.primary : colors.border },
                !isDirty && styles.saveBtnDisabled,
              ]}
              onPress={handleSave}
              disabled={!isDirty || updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Enregistrer</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

// ─── Composant ProgramSection ─────────────────────────────────────────────────

function ProgramSection({
  program,
  onRefresh,
}: {
  program: { id: number; slug: string; title: string; emoji?: string | null; durationDays: number };
  onRefresh: () => void;
}) {
  const colors = useColors();
  const [expanded, setExpanded] = useState(false);

  const daysQuery = trpc.programs.getDays.useQuery(
    { programSlug: program.slug },
    { enabled: expanded }
  );

  const days = (daysQuery.data ?? []) as ProgramDay[];
  const audioCount = days.filter((d) => d.audioUrl).length;

  return (
    <View style={[styles.programSection, { borderColor: colors.border }]}>
      {/* En-tête du programme */}
      <TouchableOpacity
        style={[styles.programHeader, { backgroundColor: colors.surface }]}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <Text style={styles.programEmoji}>{program.emoji ?? "🌙"}</Text>
        <View style={styles.programInfo}>
          <Text style={[styles.programTitle, { color: colors.foreground }]}>{program.title}</Text>
          <Text style={[styles.programMeta, { color: colors.muted }]}>
            {program.durationDays} jours
            {expanded && daysQuery.data
              ? ` · ${audioCount}/${days.length} audios configurés`
              : ""}
          </Text>
        </View>
        <View style={[styles.progressBadge, { backgroundColor: expanded && daysQuery.data ? (audioCount === days.length ? "#22C55E22" : "#F59E0B22") : colors.border + "44" }]}>
          {expanded && daysQuery.data ? (
            <Text style={[styles.progressText, { color: audioCount === days.length ? "#22C55E" : "#F59E0B" }]}>
              {audioCount}/{days.length}
            </Text>
          ) : (
            <Text style={[styles.chevron, { color: colors.muted }]}>{expanded ? "▲" : "▼"}</Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Liste des jours */}
      {expanded && (
        <View style={styles.daysList}>
          {daysQuery.isLoading ? (
            <ActivityIndicator color={colors.primary} style={{ margin: 16 }} />
          ) : days.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.muted }]}>Aucun jour trouvé</Text>
          ) : (
            days.map((day) => (
              <DayAudioRow
                key={`${day.programSlug}-${day.dayNumber}`}
                day={day}
                programSlug={program.slug}
                onSaved={onRefresh}
              />
            ))
          )}
        </View>
      )}
    </View>
  );
}

// ─── Écran principal ──────────────────────────────────────────────────────────

export default function AudioManagerScreen() {
  const colors = useColors();
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

  const programsQuery = trpc.programs.list.useQuery();
  const programs = programsQuery.data ?? [];

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
    programsQuery.refetch();
  }, [programsQuery]);

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* En-tête */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Text style={[styles.backText, { color: colors.primary }]}>← Retour</Text>
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.foreground }]}>🎵 Gestion Audio</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              Ajoutez ou modifiez les URLs audio de chaque jour de programme.
              Formats supportés : MP3, M4A, AAC, OGG.
            </Text>
          </View>

          {/* Guide rapide */}
          <View style={[styles.guideCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.guideTitle, { color: colors.foreground }]}>📋 Guide rapide</Text>
            <Text style={[styles.guideText, { color: colors.muted }]}>
              1. Cliquez sur un programme pour afficher ses jours{"\n"}
              2. Cliquez sur "Modifier" pour un jour spécifique{"\n"}
              3. Collez l'URL directe du fichier audio (MP3){"\n"}
              4. Indiquez la durée en secondes (ex: 1200 = 20 min){"\n"}
              5. Cliquez "Enregistrer" — l'audio sera disponible immédiatement
            </Text>
          </View>

          {/* Liste des programmes */}
          {programsQuery.isLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
          ) : programs.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              Aucun programme trouvé
            </Text>
          ) : (
            programs.map((prog) => (
              <ProgramSection
                key={prog.slug + refreshKey}
                program={prog}
                onRefresh={handleRefresh}
              />
            ))
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 48,
  },
  header: {
    marginBottom: 16,
  },
  backBtn: {
    marginBottom: 12,
  },
  backText: {
    fontSize: 15,
    fontWeight: "500",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
  },
  guideCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  guideText: {
    fontSize: 13,
    lineHeight: 20,
  },
  programSection: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
  },
  programHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
  },
  programEmoji: {
    fontSize: 24,
  },
  programInfo: {
    flex: 1,
  },
  programTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  programMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  progressBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    minWidth: 40,
    alignItems: "center",
  },
  progressText: {
    fontSize: 13,
    fontWeight: "600",
  },
  chevron: {
    fontSize: 12,
  },
  daysList: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    gap: 6,
  },
  dayRow: {
    borderRadius: 10,
    borderWidth: 1,
    overflow: "hidden",
  },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    gap: 8,
  },
  dayBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  dayBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  dayTitleWrap: {
    flex: 1,
  },
  dayTitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  dayStatus: {
    fontSize: 11,
    marginTop: 1,
  },
  editBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: "600",
  },
  editForm: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },
  urlInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  durationInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    width: 160,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 12,
  },
  clearBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  clearBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
  saveBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    padding: 16,
    fontSize: 14,
  },
});
