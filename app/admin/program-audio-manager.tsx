import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";

// ─── Types locaux ───────────────────────────────────────────────────────────────

type DayEdit = {
  audioUrl: string;
  audioDurationSeconds: string; // "mm:ss" ou secondes bruts
};

// ─── Composant ──────────────────────────────────────────────────────────────────

export default function ProgramAudioManagerScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // État local des éditions par clé "slug-dayNumber"
  const [edits, setEdits] = useState<Record<string, DayEdit>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  // Charger tous les programmes
  const { data: programs, isLoading } = trpc.programs.list.useQuery();

  // Charger les jours de chaque programme
  const programSlugs = programs?.map((p) => p.slug) ?? [];

  // Mutation pour mettre à jour l'audioUrl d'un jour
  const updateMutation = trpc.programs.updateDayAudioUrl.useMutation({
    onSuccess: (_, variables) => {
      const key = `${variables.programSlug}-${variables.dayNumber}`;
      setSaving((prev) => ({ ...prev, [key]: false }));
      setSaved((prev) => ({ ...prev, [key]: true }));
      setTimeout(() => setSaved((prev) => ({ ...prev, [key]: false })), 2000);
    },
    onError: (err, variables) => {
      const key = `${variables.programSlug}-${variables.dayNumber}`;
      setSaving((prev) => ({ ...prev, [key]: false }));
      Alert.alert("Erreur", err.message ?? "Impossible de sauvegarder.");
    },
  });

  const parseDuration = (val: string): number => {
    if (!val) return 0;
    if (val.includes(":")) {
      const [m, s] = val.split(":").map(Number);
      return (m || 0) * 60 + (s || 0);
    }
    return parseInt(val, 10) || 0;
  };

  const handleSave = (programSlug: string, dayNumber: number) => {
    const key = `${programSlug}-${dayNumber}`;
    const edit = edits[key];
    if (!edit) return;

    const audioUrl = edit.audioUrl.trim() || null;
    if (audioUrl) {
      try { new URL(audioUrl); } catch {
        Alert.alert("URL invalide", "Veuillez entrer une URL valide (https://...)");
        return;
      }
    }

    setSaving((prev) => ({ ...prev, [key]: true }));
    updateMutation.mutate({
      programSlug,
      dayNumber,
      audioUrl,
      audioDurationSeconds: parseDuration(edit.audioDurationSeconds),
    });
  };

  const getEdit = (programSlug: string, dayNumber: number, defaultUrl?: string | null, defaultDuration?: number): DayEdit => {
    const key = `${programSlug}-${dayNumber}`;
    if (edits[key]) return edits[key];
    const m = Math.floor((defaultDuration ?? 0) / 60);
    const s = (defaultDuration ?? 0) % 60;
    return {
      audioUrl: defaultUrl ?? "",
      audioDurationSeconds: defaultDuration ? `${m}:${String(s).padStart(2, "0")}` : "",
    };
  };

  const setEdit = (programSlug: string, dayNumber: number, field: keyof DayEdit, value: string) => {
    const key = `${programSlug}-${dayNumber}`;
    setEdits((prev) => ({
      ...prev,
      [key]: { ...getEdit(programSlug, dayNumber), [field]: value },
    }));
  };

  if (!isAuthenticated) {
    return (
      <ScreenContainer>
        <View style={styles.center}>
          <Text style={styles.errorText}>Connexion requise</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>← Retour</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer containerClassName="bg-[#0D0B1E]">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🎧 Audio — Programmes</Text>
          <Text style={styles.subtitle}>
            Assignez un lien audio (MP3, M4A, AAC) à chaque jour de programme.
          </Text>
        </View>

        {/* Légende */}
        <View style={styles.legendCard}>
          <Text style={styles.legendTitle}>Comment utiliser</Text>
          <Text style={styles.legendText}>
            • Collez l'URL directe de votre fichier audio (Dropbox, S3, CDN…){"\n"}
            • Dropbox : remplacez <Text style={styles.code}>dl=0</Text> par <Text style={styles.code}>dl=1</Text>{"\n"}
            • Durée : format <Text style={styles.code}>mm:ss</Text> (ex: 12:30) ou secondes{"\n"}
            • Appuyez sur Sauvegarder pour chaque jour modifié
          </Text>
        </View>

        {isLoading ? (
          <ActivityIndicator color="#A78BFA" style={{ marginTop: 40 }} />
        ) : (
          programs?.map((program) => (
            <ProgramSection
              key={program.slug}
              program={program}
              edits={edits}
              saving={saving}
              saved={saved}
              getEdit={getEdit}
              setEdit={setEdit}
              handleSave={handleSave}
            />
          ))
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

// ─── Section par programme ───────────────────────────────────────────────────────

function ProgramSection({
  program,
  edits,
  saving,
  saved,
  getEdit,
  setEdit,
  handleSave,
}: {
  program: { slug: string; title: string };
  edits: Record<string, any>;
  saving: Record<string, boolean>;
  saved: Record<string, boolean>;
  getEdit: (slug: string, day: number, url?: string | null, dur?: number) => DayEdit;
  setEdit: (slug: string, day: number, field: keyof DayEdit, value: string) => void;
  handleSave: (slug: string, day: number) => void;
}) {
  const { data: programData, isLoading } = trpc.programs.get.useQuery({ slug: program.slug });
  const days = programData?.days ?? [];

  return (
    <View style={styles.programSection}>
      <Text style={styles.programTitle}>{program.title}</Text>

      {isLoading ? (
        <ActivityIndicator color="#A78BFA" size="small" style={{ marginVertical: 12 }} />
      ) : (
        days?.map((day) => {
          const key = `${program.slug}-${day.dayNumber}`;
          const edit = getEdit(program.slug, day.dayNumber, (day as any).audioUrl, (day as any).audioDurationSeconds);
          const isSaving = saving[key];
          const isSaved = saved[key];
          const hasAudio = !!(edit.audioUrl || (day as any).audioUrl);

          return (
            <View key={day.dayNumber} style={styles.dayCard}>
              <View style={styles.dayHeader}>
                <View style={[styles.statusDot, { backgroundColor: hasAudio ? "#22C55E" : "#6B7280" }]} />
                <Text style={styles.dayLabel}>Jour {day.dayNumber} — {day.title}</Text>
              </View>

              <TextInput
                style={styles.input}
                placeholder="URL audio (https://...)"
                placeholderTextColor="#4B5563"
                value={edit.audioUrl}
                onChangeText={(v) => setEdit(program.slug, day.dayNumber, "audioUrl", v)}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />

              <View style={styles.rowBottom}>
                <TextInput
                  style={[styles.input, styles.durationInput]}
                  placeholder="Durée (mm:ss)"
                  placeholderTextColor="#4B5563"
                  value={edit.audioDurationSeconds}
                  onChangeText={(v) => setEdit(program.slug, day.dayNumber, "audioDurationSeconds", v)}
                  keyboardType="numbers-and-punctuation"
                />
                <TouchableOpacity
                  style={[styles.saveBtn, isSaved && styles.saveBtnDone]}
                  onPress={() => handleSave(program.slug, day.dayNumber)}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.saveBtnText}>{isSaved ? "✓ Sauvegardé" : "Sauvegarder"}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: { paddingBottom: 40 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  errorText: { color: "#F87171", fontSize: 16, marginBottom: 16 },
  header: { padding: 20, paddingTop: 16 },
  backBtn: { marginBottom: 12 },
  backBtnText: { color: "#A78BFA", fontSize: 14, fontWeight: "600" },
  title: { color: "#E9D5FF", fontSize: 22, fontWeight: "800", marginBottom: 6 },
  subtitle: { color: "#9CA3AF", fontSize: 13, lineHeight: 18 },
  legendCard: {
    marginHorizontal: 20,
    backgroundColor: "#1E1B4B",
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.2)",
  },
  legendTitle: { color: "#A78BFA", fontSize: 13, fontWeight: "700", marginBottom: 6 },
  legendText: { color: "#9CA3AF", fontSize: 12, lineHeight: 18 },
  code: { color: "#E9D5FF", fontFamily: "monospace" },
  programSection: { marginHorizontal: 20, marginBottom: 24 },
  programTitle: {
    color: "#E9D5FF",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(167,139,250,0.2)",
  },
  dayCard: {
    backgroundColor: "#1A1730",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  dayHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  dayLabel: { color: "#C4B5FD", fontSize: 13, fontWeight: "600", flex: 1 },
  input: {
    backgroundColor: "#0D0B1E",
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.2)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: "#E9D5FF",
    fontSize: 12,
    marginBottom: 8,
  },
  rowBottom: { flexDirection: "row", gap: 8, alignItems: "center" },
  durationInput: { flex: 1, marginBottom: 0 },
  saveBtn: {
    backgroundColor: "#7C3AED",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    minWidth: 110,
    alignItems: "center",
  },
  saveBtnDone: { backgroundColor: "#059669" },
  saveBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
});
