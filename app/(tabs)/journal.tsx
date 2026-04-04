import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, TextInput, Modal, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { MOOD_EMOJIS, MOOD_LABELS } from '@/lib/mock-data';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/hooks/use-auth';
import type { MoodState } from '@/shared/wellness-types';
import { AnimatedScreen } from '@/components/animated-screen';
import { StarField } from '@/components/star-field';
import { useThemeContext } from '@/lib/theme-provider';

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
  const { isDark } = useThemeContext();
  const router = useRouter();
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
    <ScreenContainer containerClassName={isDark ? 'bg-[#0D0B1A]' : 'bg-[#FAF7F2]'}>
      <StarField />
      <AnimatedScreen preset="fadeSlideUp" duration={300}>
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
          <Pressable
            style={({ pressed }) => [styles.entryCard, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.92 : 1 }]}
            onPress={() => router.push(`/journal/${item.id}` as never)}
          >
            <View style={styles.entryHeader}>
              <Text style={styles.entryMoodEmoji}>{item.mood ? MOOD_EMOJIS[item.mood] : "📝"}</Text>
              <View style={styles.entryMeta}>
                <Text style={[styles.entryTitle, { color: colors.foreground }]}>{item.title}</Text>
                <Text style={[styles.entryDate, { color: colors.muted }]}>{formatDate(new Date(item.createdAt))}</Text>
              </View>
              <Pressable
                style={({ pressed }) => [styles.deleteBtn, { opacity: pressed ? 0.6 : 1 }]}
                onPress={(e) => { e.stopPropagation?.(); handleDelete(item.id); }}
              >
                <IconSymbol name="trash" size={16} color={colors.error} />
              </Pressable>
            </View>
            <Text style={[styles.entryContent, { color: colors.muted }]} numberOfLines={3}>
              {item.content}
            </Text>
            <Text style={[styles.tapHint, { color: colors.muted }]}>Appuyer pour lire et modifier →</Text>
          </Pressable>
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
      </AnimatedScreen>
    </ScreenContainer>
  );
}

// Constantes palette (statiques pour StyleSheet)
const GOLD_J         = '#C8A96E';
const GOLD_SOFT_J    = 'rgba(201,168,76,0.10)';
const LAVENDER_J     = 'rgba(237,233,255,0.55)';
const LAVENDER_MED_J = 'rgba(240,235,224,0.65)';
const WHITE_SOFT_J   = '#EDE8DC';
const NIGHT_BG_J     = '#0D0B1A';
const GLASS_BG_J     = '#2A2540';
const GLASS_BORDER_J = 'rgba(200,169,110,0.40)';

const styles = StyleSheet.create({
  list: { paddingHorizontal: 20, paddingBottom: 32 },
  header: { paddingTop: 18, marginBottom: 18 },
  title: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 28, color: WHITE_SOFT_J, marginBottom: 4 },
  subtitle: { fontSize: 11, color: LAVENDER_MED_J, letterSpacing: 0.3 },
  // Recherche
  searchBar: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 14,
    borderWidth: 0.5, borderColor: GLASS_BORDER_J, backgroundColor: GLASS_BG_J,
    paddingHorizontal: 14, paddingVertical: 10,
    gap: 8, marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 14, color: WHITE_SOFT_J },
  // Filtres humeur
  moodFilter: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 0.5,
  },
  moodFilterEmoji: { fontSize: 13 },
  moodFilterText: { fontSize: 11, fontWeight: '500', letterSpacing: 0.2 },
  promptCard: { borderRadius: 18, borderWidth: 1, borderColor: 'rgba(201,168,76,0.22)', backgroundColor: GOLD_SOFT_J, padding: 16, marginBottom: 24 },
  promptLabel: { fontSize: 9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, color: GOLD_J, marginBottom: 6 },
  promptText: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 18, color: WHITE_SOFT_J, lineHeight: 24, marginBottom: 14 },
  writeButton: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 9, alignSelf: 'flex-start', backgroundColor: GOLD_J },
  writeButtonText: { color: NIGHT_BG_J, fontSize: 12, fontWeight: '700', letterSpacing: 0.3 },
  empty: { alignItems: 'center', paddingTop: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 20, color: WHITE_SOFT_J, marginBottom: 8 },
  emptySubtitle: { fontSize: 13, color: LAVENDER_MED_J, lineHeight: 20, textAlign: 'center' },
  entryCard: { borderRadius: 18, borderWidth: 1, borderColor: GLASS_BORDER_J, backgroundColor: GLASS_BG_J, padding: 14, marginBottom: 12 },
  entryHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  entryMoodEmoji: { fontSize: 26 },
  entryMeta: { flex: 1 },
  entryTitle: { fontSize: 14, fontWeight: '600', color: WHITE_SOFT_J, marginBottom: 2 },
  entryDate: { fontSize: 10, color: LAVENDER_J, letterSpacing: 0.2 },
  entryContent: { fontSize: 12, color: LAVENDER_J, lineHeight: 18 },
  tapHint: { fontSize: 10, color: GOLD_J, marginTop: 6, textAlign: 'right', opacity: 0.7, letterSpacing: 0.3 },
  deleteBtn: { padding: 6 },
  modal: { flex: 1, backgroundColor: '#0D0B1A' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: GLASS_BORDER_J },
  modalCancel: { fontSize: 14, color: LAVENDER_MED_J },
  modalTitle: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 18, color: WHITE_SOFT_J },
  modalSave: { fontSize: 14, fontWeight: '700' },
  modalContent: { flex: 1, paddingHorizontal: 20 },
  titleInput: { fontSize: 16, fontWeight: '500', color: WHITE_SOFT_J, paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: GLASS_BORDER_J, marginBottom: 20 },
  moodLabel: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 17, color: WHITE_SOFT_J, marginBottom: 12 },
  moodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  moodChip: { borderRadius: 12, borderWidth: 0.5, paddingHorizontal: 10, paddingVertical: 8, alignItems: 'center', width: '22%', backgroundColor: GLASS_BG_J },
  moodChipEmoji: { fontSize: 20, marginBottom: 2 },
  moodChipLabel: { fontSize: 9, fontWeight: '500', textAlign: 'center', color: LAVENDER_J },
  contentInput: { borderRadius: 14, borderWidth: 0.5, borderColor: GLASS_BORDER_J, backgroundColor: GLASS_BG_J, padding: 14, fontSize: 14, color: WHITE_SOFT_J, lineHeight: 22, minHeight: 200 },
});
