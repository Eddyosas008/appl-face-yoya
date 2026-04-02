/**
 * Écran Détail Journal — /journal/[id]
 * Affiche une entrée de journal en plein écran avec possibilité d'édition.
 */
import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";

const MOOD_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  anxious:   { label: "Anxieux",   emoji: "😰", color: "#F59E0B" },
  sad:       { label: "Triste",    emoji: "😢", color: "#6366F1" },
  neutral:   { label: "Neutre",    emoji: "😐", color: "#6B7280" },
  calm:      { label: "Calme",     emoji: "😌", color: "#10B981" },
  happy:     { label: "Heureux",   emoji: "😊", color: "#F59E0B" },
  energetic: { label: "Énergique", emoji: "⚡", color: "#EF4444" },
  grateful:  { label: "Reconnaissant", emoji: "🙏", color: "#8B5CF6" },
};

const MOOD_KEYS = Object.keys(MOOD_LABELS) as Array<keyof typeof MOOD_LABELS>;

function formatDate(dateStr: string | Date) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function JournalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useColors();

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<string | undefined>(undefined);

  // Charger les entrées du journal
  const listQuery = trpc.journal.list.useQuery({ limit: 100 });
  const entries = listQuery.data ?? [];
  const entry = entries.find((e) => String(e.id) === String(id));

  // Initialiser les champs d'édition quand l'entrée est chargée
  useEffect(() => {
    if (entry) {
      setTitle(entry.title ?? "");
      setContent(entry.content ?? "");
      setMood(entry.mood ?? undefined);
    }
  }, [entry?.id]);

  const utils = trpc.useUtils();

  const updateMutation = trpc.journal.update.useMutation({
    onSuccess: () => {
      utils.journal.list.invalidate();
      setIsEditing(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: (err) => {
      Alert.alert("Erreur", err.message);
    },
  });

  const deleteMutation = trpc.journal.delete.useMutation({
    onSuccess: () => {
      utils.journal.list.invalidate();
      router.back();
    },
    onError: (err) => {
      Alert.alert("Erreur", err.message);
    },
  });

  const handleSave = () => {
    if (!entry) return;
    if (!content.trim()) {
      Alert.alert("Contenu requis", "Le contenu ne peut pas être vide.");
      return;
    }
    updateMutation.mutate({
      id: entry.id,
      title: title.trim() || undefined,
      content: content.trim(),
      mood: mood as Parameters<typeof updateMutation.mutate>[0]["mood"],
    });
  };

  const handleDelete = () => {
    if (!entry) return;
    Alert.alert(
      "Supprimer cette entrée",
      "Cette action est irréversible. Voulez-vous continuer ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => deleteMutation.mutate({ id: entry.id }),
        },
      ]
    );
  };

  const handleCancelEdit = () => {
    if (entry) {
      setTitle(entry.title ?? "");
      setContent(entry.content ?? "");
      setMood(entry.mood ?? undefined);
    }
    setIsEditing(false);
  };

  if (listQuery.isLoading) {
    return (
      <ScreenContainer>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </ScreenContainer>
    );
  }

  if (!entry) {
    return (
      <ScreenContainer>
        <View style={styles.center}>
          <Text style={[styles.emptyText, { color: colors.muted }]}>Entrée introuvable</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={[styles.backText, { color: colors.primary }]}>← Retour</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const moodInfo = entry.mood ? MOOD_LABELS[entry.mood] : null;

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Barre de navigation */}
        <View style={[styles.navbar, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
            <Text style={[styles.navBtnText, { color: colors.primary }]}>← Retour</Text>
          </TouchableOpacity>
          <View style={styles.navActions}>
            {isEditing ? (
              <>
                <TouchableOpacity onPress={handleCancelEdit} style={styles.navBtn}>
                  <Text style={[styles.navBtnText, { color: colors.muted }]}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSave}
                  style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.saveBtnText}>Enregistrer</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.navBtn}>
                  <Text style={[styles.navBtnText, { color: colors.primary }]}>Modifier</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDelete} style={styles.navBtn}>
                  <Text style={[styles.navBtnText, { color: "#EF4444" }]}>Supprimer</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* Date */}
          <Text style={[styles.dateText, { color: colors.muted }]}>
            {formatDate(entry.createdAt)}
          </Text>

          {/* Titre */}
          {isEditing ? (
            <TextInput
              style={[styles.titleInput, { color: colors.foreground, borderBottomColor: colors.border }]}
              value={title}
              onChangeText={setTitle}
              placeholder="Titre (optionnel)"
              placeholderTextColor={colors.muted}
              returnKeyType="next"
            />
          ) : (
            entry.title ? (
              <Text style={[styles.titleText, { color: colors.foreground }]}>{entry.title}</Text>
            ) : null
          )}

          {/* Sélecteur d'humeur (édition) */}
          {isEditing && (
            <View style={styles.moodSection}>
              <Text style={[styles.moodLabel, { color: colors.muted }]}>Humeur</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moodScroll}>
                {MOOD_KEYS.map((key) => {
                  const m = MOOD_LABELS[key];
                  const selected = mood === key;
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.moodChip,
                        { borderColor: selected ? m.color : colors.border },
                        selected && { backgroundColor: m.color + "22" },
                      ]}
                      onPress={() => setMood(selected ? undefined : key)}
                    >
                      <Text style={styles.moodEmoji}>{m.emoji}</Text>
                      <Text style={[styles.moodChipText, { color: selected ? m.color : colors.muted }]}>
                        {m.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Badge humeur (lecture) */}
          {!isEditing && moodInfo && (
            <View style={[styles.moodBadge, { backgroundColor: moodInfo.color + "22" }]}>
              <Text style={styles.moodBadgeEmoji}>{moodInfo.emoji}</Text>
              <Text style={[styles.moodBadgeText, { color: moodInfo.color }]}>{moodInfo.label}</Text>
            </View>
          )}

          {/* Séparateur */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Contenu */}
          {isEditing ? (
            <TextInput
              style={[styles.contentInput, { color: colors.foreground }]}
              value={content}
              onChangeText={setContent}
              placeholder="Écrivez vos pensées..."
              placeholderTextColor={colors.muted}
              multiline
              textAlignVertical="top"
              autoFocus
            />
          ) : (
            <Text style={[styles.contentText, { color: colors.foreground }]}>
              {entry.content}
            </Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
  },
  backBtn: {
    padding: 8,
  },
  backText: {
    fontSize: 15,
    fontWeight: "500",
  },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  navBtn: {
    padding: 4,
  },
  navBtnText: {
    fontSize: 15,
    fontWeight: "500",
  },
  navActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  saveBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 90,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  container: {
    padding: 20,
    paddingBottom: 48,
  },
  dateText: {
    fontSize: 12,
    textTransform: "capitalize",
    marginBottom: 12,
  },
  titleInput: {
    fontSize: 22,
    fontWeight: "700",
    borderBottomWidth: 1,
    paddingBottom: 8,
    marginBottom: 16,
  },
  titleText: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    lineHeight: 30,
  },
  moodSection: {
    marginBottom: 16,
  },
  moodLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 8,
  },
  moodScroll: {
    flexGrow: 0,
  },
  moodChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  moodEmoji: {
    fontSize: 14,
  },
  moodChipText: {
    fontSize: 12,
    fontWeight: "500",
  },
  moodBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 12,
  },
  moodBadgeEmoji: {
    fontSize: 16,
  },
  moodBadgeText: {
    fontSize: 13,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  contentInput: {
    fontSize: 16,
    lineHeight: 26,
    minHeight: 300,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 26,
  },
});
