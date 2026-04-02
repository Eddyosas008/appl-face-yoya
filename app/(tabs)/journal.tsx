import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, TextInput, Modal, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { MOOD_EMOJIS, MOOD_LABELS } from '@/lib/mock-data';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/hooks/use-auth';
import type { MoodState } from '@/shared/wellness-types';

const MOODS: MoodState[] = ['calm', 'happy', 'grateful', 'neutral', 'anxious', 'sad'];

const PROMPTS = [
  "Qu'est-ce qui vous a rendue heureuse aujourd'hui ?",
  "Quelle émotion avez-vous ressentie le plus intensément ?",
  "De quoi êtes-vous reconnaissante en ce moment ?",
  "Qu'est-ce qui vous a mise au défi aujourd'hui ?",
  "Comment avez-vous pris soin de vous aujourd'hui ?",
  "Quelle pensée revenait souvent dans votre esprit ?",
];

// Map MoodState to DB mood enum
type DbMood = 'anxious' | 'sad' | 'neutral' | 'calm' | 'happy' | 'energetic' | 'grateful';
const MOOD_MAP: Partial<Record<MoodState, DbMood>> = {
  calm: 'calm', happy: 'happy', grateful: 'grateful',
  neutral: 'neutral', anxious: 'anxious', sad: 'sad',
};

export default function JournalScreen() {
  const colors = useColors();
  const { isAuthenticated } = useAuth();
  const [isWriting, setIsWriting] = useState(false);
  const [mood, setMood] = useState<MoodState | null>(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [search, setSearch] = useState('');
  const [filterMood, setFilterMood] = useState<MoodState | null>(null);
  const prompt = PROMPTS[new Date().getDate() % PROMPTS.length];

  // Backend queries
  const { data: allEntries = [], isLoading: listLoading, refetch } = trpc.journal.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const createMutation = trpc.journal.create.useMutation({ onSuccess: () => refetch() });
  const deleteMutation = trpc.journal.delete.useMutation({ onSuccess: () => refetch() });

  // Filtrage local
  const entries = useMemo(() => {
    return allEntries.filter((e) => {
      const matchSearch = !search ||
        (e.title ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (e.content ?? '').toLowerCase().includes(search.toLowerCase());
      const matchMood = !filterMood || e.mood === filterMood;
      return matchSearch && matchMood;
    });
  }, [allEntries, search, filterMood]);

  async function handleSave() {
    if (!content.trim() || !mood) return;
    const dbMood = MOOD_MAP[mood];
    await createMutation.mutateAsync({
      title: title.trim() || `Journal du ${new Date().toLocaleDateString('fr-FR')}`,
      content: content.trim(),
      mood: dbMood,
    });
    setIsWriting(false);
    setContent('');
    setTitle('');
    setMood(null);
  }

  function handleDelete(id: number) {
    Alert.alert(
      'Supprimer cette entrée ?',
      'Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => deleteMutation.mutate({ id }),
        },
      ]
    );
  }

  function formatDate(date: Date) {
    return new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  return (
    <ScreenContainer>
      {listLoading && (
        <View style={{ alignItems: 'center', paddingVertical: 16 }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      )}
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.foreground }]}>Mon journal</Text>
              <Text style={[styles.subtitle, { color: colors.muted }]}>
                {allEntries.length} entrée{allEntries.length !== 1 ? 's' : ''}
              </Text>
            </View>

            {/* Barre de recherche */}
            <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <IconSymbol name="magnifyingglass" size={16} color={colors.muted} />
              <TextInput
                style={[styles.searchInput, { color: colors.foreground }]}
                placeholder="Rechercher dans le journal..."
                placeholderTextColor={colors.muted}
                value={search}
                onChangeText={setSearch}
                returnKeyType="search"
              />
              {search.length > 0 && (
                <Pressable onPress={() => setSearch('')}>
                  <IconSymbol name="xmark.circle.fill" size={16} color={colors.muted} />
                </Pressable>
              )}
            </View>

            {/* Filtres par humeur */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 16 }}
              contentContainerStyle={{ gap: 8 }}
            >
              <Pressable
                style={[styles.moodFilter, { backgroundColor: !filterMood ? colors.primary : colors.surface, borderColor: !filterMood ? colors.primary : colors.border }]}
                onPress={() => setFilterMood(null)}
              >
                <Text style={[styles.moodFilterText, { color: !filterMood ? '#FFF' : colors.foreground }]}>Tout</Text>
              </Pressable>
              {MOODS.map((m) => (
                <Pressable
                  key={m}
                  style={[styles.moodFilter, { backgroundColor: filterMood === m ? colors.primary : colors.surface, borderColor: filterMood === m ? colors.primary : colors.border }]}
                  onPress={() => setFilterMood(filterMood === m ? null : m)}
                >
                  <Text style={styles.moodFilterEmoji}>{MOOD_EMOJIS[m]}</Text>
                  <Text style={[styles.moodFilterText, { color: filterMood === m ? '#FFF' : colors.foreground }]}>{MOOD_LABELS[m]}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={[styles.promptCard, { backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}30` }]}>
              <Text style={[styles.promptLabel, { color: colors.primary }]}>Invitation du jour</Text>
              <Text style={[styles.promptText, { color: colors.foreground }]}>{prompt}</Text>
              <Pressable
                style={({ pressed }) => [styles.writeButton, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
                onPress={() => setIsWriting(true)}
              >
                <IconSymbol name="pencil" size={16} color="#FFF" />
                <Text style={styles.writeButtonText}>Écrire</Text>
              </Pressable>
            </View>

            {/* Aucun résultat de filtre */}
            {!listLoading && allEntries.length > 0 && entries.length === 0 && (
              <View style={styles.empty}>
                <Text style={styles.emptyEmoji}>🔍</Text>
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Aucun résultat</Text>
                <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
                  {search ? `Aucune entrée pour "${search}"` : 'Aucune entrée avec cette humeur'}
                </Text>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          !listLoading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>📖</Text>
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Votre journal est vide</Text>
              <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
                Commencez à écrire vos pensées et émotions pour mieux vous comprendre.
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={[styles.entryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.entryHeader}>
              <Text style={styles.entryMoodEmoji}>{item.mood ? MOOD_EMOJIS[item.mood] : "📝"}</Text>
              <View style={styles.entryMeta}>
                <Text style={[styles.entryTitle, { color: colors.foreground }]}>{item.title}</Text>
                <Text style={[styles.entryDate, { color: colors.muted }]}>{formatDate(new Date(item.createdAt))}</Text>
              </View>
              <Pressable
                style={({ pressed }) => [styles.deleteBtn, { opacity: pressed ? 0.6 : 1 }]}
                onPress={() => handleDelete(item.id)}
              >
                <IconSymbol name="trash" size={16} color={colors.error} />
              </Pressable>
            </View>
            <Text style={[styles.entryContent, { color: colors.muted }]} numberOfLines={3}>
              {item.content}
            </Text>
          </View>
        )}
      />

      {/* Write Modal */}
      <Modal visible={isWriting} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Pressable onPress={() => setIsWriting(false)}>
              <Text style={[styles.modalCancel, { color: colors.muted }]}>Annuler</Text>
            </Pressable>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Nouvelle entrée</Text>
            <Pressable onPress={handleSave} disabled={!content.trim() || !mood || createMutation.isPending}>
              <Text style={[styles.modalSave, { color: mood && content.trim() ? colors.primary : colors.muted }]}>
                {createMutation.isPending ? '...' : 'Sauver'}
              </Text>
            </Pressable>
          </View>
          <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
            <TextInput
              style={[styles.titleInput, { color: colors.foreground, borderBottomColor: colors.border }]}
              placeholder="Titre (optionnel)"
              placeholderTextColor={colors.muted}
              value={title}
              onChangeText={setTitle}
            />
            <Text style={[styles.moodLabel, { color: colors.foreground }]}>Comment vous sentez-vous ?</Text>
            <View style={styles.moodRow}>
              {MOODS.map((m) => (
                <Pressable
                  key={m}
                  style={[styles.moodChip, { backgroundColor: mood === m ? `${colors.primary}20` : colors.surface, borderColor: mood === m ? colors.primary : colors.border }]}
                  onPress={() => setMood(m)}
                >
                  <Text style={styles.moodChipEmoji}>{MOOD_EMOJIS[m]}</Text>
                  <Text style={[styles.moodChipLabel, { color: mood === m ? colors.primary : colors.muted }]}>{MOOD_LABELS[m]}</Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              style={[styles.contentInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.surface }]}
              placeholder="Écrivez librement vos pensées, émotions, réflexions..."
              placeholderTextColor={colors.muted}
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={12}
              textAlignVertical="top"
            />
          </ScrollView>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 20, paddingBottom: 32 },
  header: { paddingTop: 16, marginBottom: 16 },
  title: { fontSize: 26, fontWeight: '800', marginBottom: 4 },
  subtitle: { fontSize: 13 },
  // Recherche
  searchBar: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 14,
    borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 10,
    gap: 8, marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 14 },
  // Filtres humeur
  moodFilter: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1.5,
  },
  moodFilterEmoji: { fontSize: 14 },
  moodFilterText: { fontSize: 12, fontWeight: '600' },
  promptCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 24 },
  promptLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  promptText: { fontSize: 16, fontWeight: '600', lineHeight: 22, marginBottom: 14 },
  writeButton: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 9, alignSelf: 'flex-start' },
  writeButtonText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, lineHeight: 20, textAlign: 'center' },
  entryCard: { borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 12 },
  entryHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  entryMoodEmoji: { fontSize: 28 },
  entryMeta: { flex: 1 },
  entryTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  entryDate: { fontSize: 12 },
  entryContent: { fontSize: 13, lineHeight: 18 },
  deleteBtn: { padding: 6 },
  modal: { flex: 1 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 0.5 },
  modalCancel: { fontSize: 15 },
  modalTitle: { fontSize: 16, fontWeight: '700' },
  modalSave: { fontSize: 15, fontWeight: '700' },
  modalContent: { flex: 1, paddingHorizontal: 20 },
  titleInput: { fontSize: 18, fontWeight: '700', paddingVertical: 14, borderBottomWidth: 1, marginBottom: 20 },
  moodLabel: { fontSize: 15, fontWeight: '600', marginBottom: 12 },
  moodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  moodChip: { borderRadius: 12, borderWidth: 1.5, paddingHorizontal: 10, paddingVertical: 8, alignItems: 'center', width: '22%' },
  moodChipEmoji: { fontSize: 20, marginBottom: 2 },
  moodChipLabel: { fontSize: 9, fontWeight: '600', textAlign: 'center' },
  contentInput: { borderRadius: 14, borderWidth: 1.5, padding: 14, fontSize: 15, lineHeight: 22, minHeight: 200 },
});
