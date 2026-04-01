import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, FlatList, TextInput,
  Modal, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/hooks/use-auth';
import type { MoodState } from '@/shared/wellness-types';

// ─── Constantes ───────────────────────────────────────────────────────────────

const MOODS: MoodState[] = ['calm', 'happy', 'grateful', 'neutral', 'anxious', 'sad'];

const MOOD_EMOJI: Record<string, string> = {
  happy: '😊', grateful: '🙏', calm: '😌', neutral: '😐',
  tired: '😴', anxious: '😰', sad: '😢', overwhelmed: '😵', energetic: '⚡',
};
const MOOD_LABEL: Record<string, string> = {
  happy: 'Joyeux', grateful: 'Reconnaissant', calm: 'Calme',
  neutral: 'Neutre', tired: 'Fatigué', anxious: 'Anxieux',
  sad: 'Triste', overwhelmed: 'Dépassé', energetic: 'Énergique',
};
const MOOD_COLOR: Record<string, string> = {
  happy: '#22C55E', grateful: '#10B981', calm: '#6366F1',
  neutral: '#94A3B8', tired: '#F59E0B', anxious: '#F97316',
  sad: '#3B82F6', overwhelmed: '#EF4444', energetic: '#FBBF24',
};

type DbMood = 'anxious' | 'sad' | 'neutral' | 'calm' | 'happy' | 'energetic' | 'grateful';
const MOOD_MAP: Partial<Record<MoodState, DbMood>> = {
  calm: 'calm', happy: 'happy', grateful: 'grateful',
  neutral: 'neutral', anxious: 'anxious', sad: 'sad',
};

const PROMPTS = [
  "Qu'est-ce qui vous a rendu(e) heureux/heureuse aujourd'hui ?",
  "Quelle émotion avez-vous ressentie le plus intensément ?",
  "De quoi êtes-vous reconnaissant(e) en ce moment ?",
  "Qu'est-ce qui vous a mis(e) au défi aujourd'hui ?",
  "Comment avez-vous pris soin de vous aujourd'hui ?",
  "Quelle pensée revenait souvent dans votre esprit ?",
  "Qu'avez-vous appris sur vous-même cette semaine ?",
  "Quel moment de calme avez-vous vécu aujourd'hui ?",
];

// ─── Composants ───────────────────────────────────────────────────────────────

function MoodBadge({ mood, small }: { mood: string; small?: boolean }) {
  const color = MOOD_COLOR[mood] ?? '#94A3B8';
  return (
    <View style={[styles.badge, { backgroundColor: color + '25', borderColor: color + '60' }, small && styles.badgeSmall]}>
      <Text style={[styles.badgeEmoji, small && { fontSize: 12 }]}>{MOOD_EMOJI[mood] ?? '😐'}</Text>
      {!small && <Text style={[styles.badgeLabel, { color }]}>{MOOD_LABEL[mood] ?? mood}</Text>}
    </View>
  );
}

function EntryCard({
  item, onDelete, colors,
}: {
  item: any;
  onDelete: (id: number) => void;
  colors: ReturnType<typeof useColors>;
}) {
  const [expanded, setExpanded] = useState(false);
  const wordCount = item.content?.split(/\s+/).filter(Boolean).length ?? 0;

  return (
    <Pressable
      style={({ pressed }) => [styles.entryCard, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.95 : 1 }]}
      onPress={() => setExpanded((v) => !v)}
    >
      <View style={styles.entryHeader}>
        {item.mood && <MoodBadge mood={item.mood} small />}
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={[styles.entryTitle, { color: colors.foreground }]} numberOfLines={1}>{item.title}</Text>
          <Text style={[styles.entryDate, { color: colors.muted }]}>
            {new Date(item.createdAt).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
            {' · '}{wordCount} mot{wordCount !== 1 ? 's' : ''}
          </Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.deleteBtn, { opacity: pressed ? 0.6 : 1 }]}
          onPress={() => onDelete(item.id)}
          hitSlop={8}
        >
          <Text style={{ color: colors.muted, fontSize: 16 }}>🗑️</Text>
        </Pressable>
      </View>
      <Text
        style={[styles.entryContent, { color: colors.muted }]}
        numberOfLines={expanded ? undefined : 3}
      >
        {item.content}
      </Text>
      {!expanded && item.content?.length > 120 && (
        <Text style={[styles.readMore, { color: colors.primary }]}>Lire la suite →</Text>
      )}
    </Pressable>
  );
}

// ─── Écran principal ──────────────────────────────────────────────────────────

export default function JournalScreen() {
  const colors = useColors();
  const { isAuthenticated } = useAuth();

  const [isWriting, setIsWriting] = useState(false);
  const [mood, setMood] = useState<MoodState | null>(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [search, setSearch] = useState('');
  const [filterMood, setFilterMood] = useState<string | null>(null);

  const prompt = PROMPTS[new Date().getDate() % PROMPTS.length];
  const wordCount = content.split(/\s+/).filter(Boolean).length;

  const { data: entries = [], isLoading, refetch } = trpc.journal.list.useQuery(
    undefined, { enabled: isAuthenticated }
  );
  const createMutation = trpc.journal.create.useMutation({ onSuccess: () => { refetch(); resetForm(); } });
  const deleteMutation = trpc.journal.delete.useMutation({ onSuccess: () => refetch() });

  function resetForm() {
    setIsWriting(false);
    setContent('');
    setTitle('');
    setMood(null);
  }

  async function handleSave() {
    if (!content.trim() || !mood) return;
    const dbMood = MOOD_MAP[mood];
    await createMutation.mutateAsync({
      title: title.trim() || `Journal du ${new Date().toLocaleDateString('fr-FR')}`,
      content: content.trim(),
      mood: dbMood,
    });
  }

  function handleDelete(id: number) {
    Alert.alert(
      'Supprimer cette entrée ?',
      'Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer', style: 'destructive',
          onPress: () => deleteMutation.mutate({ id }),
        },
      ]
    );
  }

  // Filtrage et recherche
  const filtered = useMemo(() => {
    let result = entries;
    if (filterMood) result = result.filter((e) => e.mood === filterMood);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((e) =>
        e.title?.toLowerCase().includes(q) || e.content?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [entries, filterMood, search]);

  // Humeurs présentes dans les entrées
  const presentMoods = useMemo(() => {
    const set = new Set(entries.map((e) => e.mood).filter(Boolean));
    return Array.from(set) as string[];
  }, [entries]);

  return (
    <ScreenContainer>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View>
            {/* ── En-tête ── */}
            <View style={styles.header}>
              <View>
                <Text style={[styles.title, { color: colors.foreground }]}>📖 Mon journal</Text>
                <Text style={[styles.subtitle, { color: colors.muted }]}>
                  {entries.length} entrée{entries.length !== 1 ? 's' : ''}
                </Text>
              </View>
              <Pressable
                style={({ pressed }) => [styles.newBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
                onPress={() => setIsWriting(true)}
              >
                <Text style={styles.newBtnText}>+ Écrire</Text>
              </Pressable>
            </View>

            {/* ── Invitation du jour ── */}
            <Pressable
              style={[styles.promptCard, { backgroundColor: `${colors.primary}12`, borderColor: `${colors.primary}35` }]}
              onPress={() => setIsWriting(true)}
            >
              <Text style={[styles.promptLabel, { color: colors.primary }]}>✨ Invitation du jour</Text>
              <Text style={[styles.promptText, { color: colors.foreground }]}>{prompt}</Text>
            </Pressable>

            {/* ── Recherche ── */}
            {entries.length > 2 && (
              <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={{ color: colors.muted, fontSize: 16 }}>🔍</Text>
                <TextInput
                  style={[styles.searchInput, { color: colors.foreground }]}
                  placeholder="Rechercher dans le journal..."
                  placeholderTextColor={colors.muted}
                  value={search}
                  onChangeText={setSearch}
                  returnKeyType="search"
                />
                {search.length > 0 && (
                  <Pressable onPress={() => setSearch('')} hitSlop={8}>
                    <Text style={{ color: colors.muted }}>✕</Text>
                  </Pressable>
                )}
              </View>
            )}

            {/* ── Filtres humeur ── */}
            {presentMoods.length > 1 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll} contentContainerStyle={{ gap: 8, paddingRight: 8 }}>
                <Pressable
                  style={[styles.filterChip, !filterMood && { backgroundColor: colors.primary + '25', borderColor: colors.primary }]}
                  onPress={() => setFilterMood(null)}
                >
                  <Text style={[styles.filterChipText, { color: !filterMood ? colors.primary : colors.muted }]}>Tout</Text>
                </Pressable>
                {presentMoods.map((m) => {
                  const active = filterMood === m;
                  const color = MOOD_COLOR[m] ?? colors.primary;
                  return (
                    <Pressable
                      key={m}
                      style={[styles.filterChip, active && { backgroundColor: color + '25', borderColor: color }]}
                      onPress={() => setFilterMood(active ? null : m)}
                    >
                      <Text style={{ fontSize: 14 }}>{MOOD_EMOJI[m]}</Text>
                      <Text style={[styles.filterChipText, { color: active ? color : colors.muted }]}>{MOOD_LABEL[m]}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}

            {isLoading && <ActivityIndicator color={colors.primary} style={{ marginVertical: 16 }} />}
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>📖</Text>
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                {search || filterMood ? 'Aucun résultat' : 'Votre journal est vide'}
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
                {search || filterMood
                  ? 'Essayez d\'autres mots-clés ou filtres.'
                  : 'Commencez à écrire vos pensées et émotions pour mieux vous comprendre.'}
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <EntryCard item={item} onDelete={handleDelete} colors={colors} />
        )}
      />

      {/* ── Modal d'écriture ── */}
      <Modal visible={isWriting} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Pressable onPress={resetForm} hitSlop={8}>
              <Text style={[styles.modalCancel, { color: colors.muted }]}>Annuler</Text>
            </Pressable>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Nouvelle entrée</Text>
            <Pressable
              onPress={handleSave}
              disabled={!content.trim() || !mood || createMutation.isPending}
              hitSlop={8}
            >
              <Text style={[styles.modalSave, { color: mood && content.trim() ? colors.primary : colors.muted }]}>
                {createMutation.isPending ? '...' : 'Sauver'}
              </Text>
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
            {/* Invitation */}
            <View style={[styles.modalPrompt, { backgroundColor: `${colors.primary}10` }]}>
              <Text style={[styles.modalPromptText, { color: colors.primary }]}>{prompt}</Text>
            </View>

            {/* Titre */}
            <TextInput
              style={[styles.titleInput, { color: colors.foreground, borderBottomColor: colors.border }]}
              placeholder="Titre (optionnel)"
              placeholderTextColor={colors.muted}
              value={title}
              onChangeText={setTitle}
            />

            {/* Humeur */}
            <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Comment vous sentez-vous ?</Text>
            <View style={styles.moodGrid}>
              {MOODS.map((m) => {
                const active = mood === m;
                const color = MOOD_COLOR[m] ?? colors.primary;
                return (
                  <Pressable
                    key={m}
                    style={[
                      styles.moodChip,
                      { backgroundColor: active ? color + '25' : colors.surface, borderColor: active ? color : colors.border },
                    ]}
                    onPress={() => setMood(m)}
                  >
                    <Text style={styles.moodChipEmoji}>{MOOD_EMOJI[m]}</Text>
                    <Text style={[styles.moodChipLabel, { color: active ? color : colors.muted }]}>{MOOD_LABEL[m]}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Contenu */}
            <View style={[styles.contentWrapper, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <TextInput
                style={[styles.contentInput, { color: colors.foreground }]}
                placeholder="Écrivez librement vos pensées, émotions, réflexions..."
                placeholderTextColor={colors.muted}
                value={content}
                onChangeText={setContent}
                multiline
                textAlignVertical="top"
              />
              <Text style={[styles.wordCount, { color: colors.muted }]}>
                {wordCount} mot{wordCount !== 1 ? 's' : ''}
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 2 },
  newBtn: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 9 },
  newBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  promptCard: { borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 14 },
  promptLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  promptText: { fontSize: 15, fontWeight: '600', lineHeight: 22 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10,
    marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 14 },
  filtersScroll: { marginBottom: 14 },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12, paddingVertical: 6,
  },
  filterChipText: { fontSize: 12, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 40, paddingHorizontal: 20 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  emptySubtitle: { fontSize: 14, lineHeight: 20, textAlign: 'center' },
  entryCard: { borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 10 },
  entryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  entryTitle: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  entryDate: { fontSize: 11 },
  entryContent: { fontSize: 13, lineHeight: 19 },
  readMore: { fontSize: 12, fontWeight: '600', marginTop: 4 },
  deleteBtn: { padding: 4 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 10, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4 },
  badgeSmall: { paddingHorizontal: 6, paddingVertical: 3 },
  badgeEmoji: { fontSize: 14 },
  badgeLabel: { fontSize: 11, fontWeight: '600' },
  modal: { flex: 1 },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 0.5,
  },
  modalCancel: { fontSize: 15 },
  modalTitle: { fontSize: 16, fontWeight: '700' },
  modalSave: { fontSize: 15, fontWeight: '700' },
  modalContent: { flex: 1, paddingHorizontal: 20 },
  modalPrompt: { borderRadius: 12, padding: 12, marginTop: 14, marginBottom: 4 },
  modalPromptText: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
  titleInput: {
    fontSize: 18, fontWeight: '700', paddingVertical: 14,
    borderBottomWidth: 1, marginBottom: 20,
  },
  sectionLabel: { fontSize: 15, fontWeight: '600', marginBottom: 12 },
  moodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  moodChip: {
    borderRadius: 12, borderWidth: 1.5, paddingHorizontal: 10, paddingVertical: 8,
    alignItems: 'center', width: '30%',
  },
  moodChipEmoji: { fontSize: 22, marginBottom: 2 },
  moodChipLabel: { fontSize: 10, fontWeight: '600', textAlign: 'center' },
  contentWrapper: { borderRadius: 14, borderWidth: 1.5, padding: 14, marginBottom: 32 },
  contentInput: { fontSize: 15, lineHeight: 22, minHeight: 180 },
  wordCount: { fontSize: 11, textAlign: 'right', marginTop: 8 },
});
