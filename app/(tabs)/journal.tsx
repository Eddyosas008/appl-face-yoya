import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, FlatList, TextInput,
  Modal, ScrollView, ActivityIndicator, Alert, Dimensions,
} from 'react-native';
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
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Palette ─────────────────────────────────────────────────────────────────
const GOLD_J         = '#C8A96E';
const NIGHT_BG_J     = '#0D0B1A';
const GLASS_BG_J     = '#2A2540';
const GLASS_BORDER_J = 'rgba(200,169,110,0.40)';

const MOODS: MoodState[] = ['calm', 'happy', 'grateful', 'neutral', 'anxious', 'sad'];
const PROMPTS = [
  "Qu'est-ce qui vous a rendue heureuse aujourd'hui ?",
  "Quelle émotion avez-vous ressentie le plus intensément ?",
  "De quoi êtes-vous reconnaissante en ce moment ?",
  "Qu'est-ce qui vous a mise au défi aujourd'hui ?",
  "Comment avez-vous pris soin de vous aujourd'hui ?",
  "Quelle pensée revenait souvent dans votre esprit ?",
];

type DbMood = 'anxious' | 'sad' | 'neutral' | 'calm' | 'happy' | 'energetic' | 'grateful';
const MOOD_MAP: Partial<Record<MoodState, DbMood>> = {
  calm: 'calm', happy: 'happy', grateful: 'grateful',
  neutral: 'neutral', anxious: 'anxious', sad: 'sad',
};

const MOOD_COLORS: Record<string, string> = {
  calm: '#4ADE80', happy: '#FBBF24', grateful: '#A78BFA',
  neutral: '#9CA3AF', anxious: '#F97316', sad: '#60A5FA', energetic: '#F472B6',
};

const MOOD_GRADIENTS: Record<string, [string, string]> = {
  calm:     ['#065F46', '#059669'],
  happy:    ['#92400E', '#F59E0B'],
  grateful: ['#4C1D95', '#7C3AED'],
  neutral:  ['#374151', '#6B7280'],
  anxious:  ['#7C2D12', '#EA580C'],
  sad:      ['#1E3A5F', '#2563EB'],
  energetic:['#831843', '#EC4899'],
};

// ─── Composant Calendrier ──────────────────────────────────────────────────
function MoodCalendar({
  entries, currentMonth, onMonthChange, onDayPress, isDark,
}: {
  entries: any[];
  currentMonth: Date;
  onMonthChange: (dir: -1 | 1) => void;
  onDayPress: (date: string) => void;
  isDark: boolean;
}) {
  const CARD  = isDark ? '#2A2540' : '#FFFFFF';
  const TEXT1 = isDark ? '#F0EBE0' : '#1C1410';
  const TEXT2 = isDark ? 'rgba(240,235,224,0.55)' : 'rgba(60,40,20,0.55)';
  const BORD  = isDark ? 'rgba(200,169,110,0.40)' : 'rgba(139,105,20,0.30)';

  const year  = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const monthName = currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  const moodByDate = useMemo(() => {
    const map: Record<string, string> = {};
    entries.forEach((e) => {
      const d = new Date(e.createdAt);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const key = d.toISOString().split('T')[0];
        if (!map[key]) map[key] = e.mood ?? 'neutral';
      }
    });
    return map;
  }, [entries, year, month]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDay + 6) % 7;
  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <View style={[calS.container, { backgroundColor: CARD, borderColor: BORD }]}>
      <View style={calS.header}>
        <Pressable style={({ pressed }) => [calS.navBtn, { opacity: pressed ? 0.6 : 1 }]} onPress={() => onMonthChange(-1)}>
          <IconSymbol name="chevron.left" size={18} color={GOLD_J} />
        </Pressable>
        <Text style={[calS.monthTitle, { color: TEXT1 }]}>
          {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
        </Text>
        <Pressable style={({ pressed }) => [calS.navBtn, { opacity: pressed ? 0.6 : 1 }]} onPress={() => onMonthChange(1)}>
          <IconSymbol name="chevron.right" size={18} color={GOLD_J} />
        </Pressable>
      </View>
      <View style={calS.weekRow}>
        {DAY_LABELS.map((d, i) => (
          <Text key={i} style={[calS.weekLabel, { color: TEXT2 }]}>{d}</Text>
        ))}
      </View>
      <View style={calS.grid}>
        {cells.map((day, i) => {
          if (!day) return <View key={i} style={calS.cell} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const mood = moodByDate[dateStr];
          const isToday = dateStr === todayStr;
          const moodColor = mood ? MOOD_COLORS[mood] : null;
          return (
            <Pressable
              key={i}
              style={({ pressed }) => [calS.cell, { opacity: pressed ? 0.7 : 1 }]}
              onPress={() => mood && onDayPress(dateStr)}
            >
              <View style={[
                calS.dayCircle,
                isToday && { borderWidth: 1.5, borderColor: GOLD_J },
                moodColor ? { backgroundColor: `${moodColor}25` } : undefined,
              ]}>
                <Text style={[calS.dayNum, { color: isToday ? GOLD_J : TEXT1 }]}>{day}</Text>
                {mood && <View style={[calS.moodDot, { backgroundColor: moodColor ?? GOLD_J }]} />}
              </View>
            </Pressable>
          );
        })}
      </View>
      <View style={[calS.legend, { borderTopColor: 'rgba(200,169,110,0.20)' }]}>
        {Object.entries(MOOD_COLORS).slice(0, 5).map(([m, c]) => (
          <View key={m} style={calS.legendItem}>
            <View style={[calS.legendDot, { backgroundColor: c }]} />
            <Text style={[calS.legendLabel, { color: TEXT2 }]}>{MOOD_LABELS[m as MoodState] ?? m}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const calS = StyleSheet.create({
  container: { borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  navBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  monthTitle: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 16 },
  weekRow: { flexDirection: 'row', marginBottom: 6 },
  weekLabel: { flex: 1, textAlign: 'center', fontSize: 10, fontWeight: '600', letterSpacing: 0.5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%` as any, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', padding: 2 },
  dayCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  dayNum: { fontSize: 12, fontWeight: '500' },
  moodDot: { width: 4, height: 4, borderRadius: 2, position: 'absolute', bottom: 3 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, paddingTop: 10, borderTopWidth: 0.5 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 6, height: 6, borderRadius: 3 },
  legendLabel: { fontSize: 10 },
});

// ─── Composant Statistiques ───────────────────────────────────────────────────
function MoodStats({ entries, isDark }: { entries: any[]; isDark: boolean }) {
  const CARD  = isDark ? '#2A2540' : '#FFFFFF';
  const TEXT1 = isDark ? '#F0EBE0' : '#1C1410';
  const TEXT2 = isDark ? 'rgba(240,235,224,0.55)' : 'rgba(60,40,20,0.55)';
  const BORD  = isDark ? 'rgba(200,169,110,0.40)' : 'rgba(139,105,20,0.30)';

  const stats = useMemo(() => {
    if (!entries.length) return null;
    const counts: Record<string, number> = {};
    entries.forEach((e) => { if (e.mood) counts[e.mood] = (counts[e.mood] ?? 0) + 1; });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return { counts, sorted, dominant: sorted[0], total: entries.length };
  }, [entries]);

  if (!stats) return null;

  return (
    <View style={[statS.container, { backgroundColor: CARD, borderColor: BORD }]}>
      <Text style={[statS.title, { color: TEXT1 }]}>Tendances émotionnelles</Text>
      <Text style={[statS.subtitle, { color: TEXT2 }]}>Sur {stats.total} entrée{stats.total > 1 ? 's' : ''}</Text>
      {stats.dominant && (
        <View style={[statS.dominantRow, { backgroundColor: 'rgba(200,169,110,0.08)' }]}>
          <Text style={statS.dominantEmoji}>{MOOD_EMOJIS[stats.dominant[0] as MoodState] ?? '😐'}</Text>
          <View>
            <Text style={[statS.dominantLabel, { color: MOOD_COLORS[stats.dominant[0]] ?? GOLD_J }]}>
              {MOOD_LABELS[stats.dominant[0] as MoodState] ?? stats.dominant[0]}
            </Text>
            <Text style={[statS.dominantSub, { color: TEXT2 }]}>Humeur dominante · {stats.dominant[1]} fois</Text>
          </View>
        </View>
      )}
      <View style={statS.bars}>
        {stats.sorted.slice(0, 5).map(([mood, count]) => {
          const pct = (count / stats.total) * 100;
          const color = MOOD_COLORS[mood] ?? GOLD_J;
          return (
            <View key={mood} style={statS.barRow}>
              <Text style={statS.barEmoji}>{MOOD_EMOJIS[mood as MoodState] ?? '😐'}</Text>
              <View style={[statS.barTrack, { backgroundColor: 'rgba(200,169,110,0.12)' }]}>
                <View style={[statS.barFill, { width: `${pct}%` as any, backgroundColor: color }]} />
              </View>
              <Text style={[statS.barPct, { color: TEXT2 }]}>{Math.round(pct)}%</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const statS = StyleSheet.create({
  container: { borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 20 },
  title: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 16, marginBottom: 2 },
  subtitle: { fontSize: 11, marginBottom: 14 },
  dominantRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16, borderRadius: 14, padding: 12 },
  dominantEmoji: { fontSize: 32 },
  dominantLabel: { fontSize: 16, fontWeight: '700' },
  dominantSub: { fontSize: 11, marginTop: 2 },
  bars: { gap: 10 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barEmoji: { fontSize: 16, width: 24 },
  barTrack: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  barPct: { fontSize: 11, width: 32, textAlign: 'right' },
});

// ─── Écran principal ──────────────────────────────────────────────────────────
export default function JournalScreen() {
  const colors = useColors();
  const { isDark } = useThemeContext();
  const styles = useMemo(() => makeStyles(isDark), [isDark]);
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState<'list' | 'calendar' | 'stats'>('list');
  const [isWriting, setIsWriting] = useState(false);
  const [mood, setMood] = useState<MoodState | null>(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [search, setSearch] = useState('');
  const [filterMood, setFilterMood] = useState<MoodState | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);

  const prompt = PROMPTS[new Date().getDate() % PROMPTS.length];

  const CARD  = isDark ? '#2A2540' : '#FFFFFF';
  const TEXT1 = isDark ? '#F0EBE0' : '#1C1410';
  const TEXT2 = isDark ? 'rgba(240,235,224,0.65)' : 'rgba(60,40,20,0.65)';
  const BORD  = isDark ? 'rgba(200,169,110,0.40)' : 'rgba(139,105,20,0.30)';
  const GOLD  = isDark ? '#C8A96E' : '#8B6914';

  const { data: allEntries = [], isLoading: listLoading, refetch } = trpc.journal.list.useQuery(
    undefined, { enabled: isAuthenticated }
  );
  const createMutation = trpc.journal.create.useMutation({ onSuccess: () => refetch() });
  const deleteMutation = trpc.journal.delete.useMutation({ onSuccess: () => refetch() });

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
    Alert.alert('Supprimer cette entrée ?', 'Cette action est irréversible.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => deleteMutation.mutate({ id }) },
    ]);
  }

  function formatDate(date: Date | string) {
    return new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  function handleCalendarDayPress(dateStr: string) {
    const entry = allEntries.find((e) => new Date(e.createdAt).toISOString().split('T')[0] === dateStr);
    if (entry) setSelectedEntry(entry);
  }

  return (
    <ScreenContainer containerClassName={isDark ? 'bg-[#0D0B1A]' : 'bg-[#FAF7F2]'}>
      <StarField />
      <AnimatedScreen preset="fadeSlideUp" duration={300}>
        <FlatList
          data={activeTab === 'list' ? entries : []}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View>
              {/* ── En-tête ── */}
              <View style={styles.header}>
                <View style={styles.headerRow}>
                  <View>
                    <Text style={[styles.title, { color: TEXT1 }]}>Mon journal</Text>
                    <Text style={[styles.subtitle, { color: TEXT2 }]}>
                      {allEntries.length} entrée{allEntries.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  <Pressable
                    style={({ pressed }) => [styles.writeBtn, { backgroundColor: GOLD, opacity: pressed ? 0.85 : 1 }]}
                    onPress={() => setIsWriting(true)}
                  >
                    <IconSymbol name="pencil" size={16} color="#0D0B1A" />
                    <Text style={styles.writeBtnText}>Écrire</Text>
                  </Pressable>
                </View>
              </View>

              {/* ── Onglets ── */}
              <View style={[styles.tabs, { backgroundColor: isDark ? '#1A1530' : '#EDE8DC', borderColor: BORD }]}>
                {([
                  { id: 'list', label: 'Entrées', icon: '📝' },
                  { id: 'calendar', label: 'Calendrier', icon: '📅' },
                  { id: 'stats', label: 'Tendances', icon: '📊' },
                ] as const).map((tab) => (
                  <Pressable
                    key={tab.id}
                    style={({ pressed }) => [
                      styles.tab,
                      activeTab === tab.id && [styles.tabActive, { backgroundColor: CARD }],
                      { opacity: pressed ? 0.8 : 1 },
                    ]}
                    onPress={() => setActiveTab(tab.id)}
                  >
                    <Text style={styles.tabEmoji}>{tab.icon}</Text>
                    <Text style={[styles.tabLabel, { color: activeTab === tab.id ? GOLD : TEXT2 }]}>{tab.label}</Text>
                  </Pressable>
                ))}
              </View>

              {/* ── Vue Calendrier ── */}
              {activeTab === 'calendar' && (
                <View>
                  <MoodCalendar
                    entries={allEntries}
                    currentMonth={calendarMonth}
                    onMonthChange={(dir) => {
                      const d = new Date(calendarMonth);
                      d.setMonth(d.getMonth() + dir);
                      setCalendarMonth(d);
                    }}
                    onDayPress={handleCalendarDayPress}
                    isDark={isDark}
                  />
                  {allEntries.length === 0 && (
                    <View style={styles.empty}>
                      <Text style={styles.emptyEmoji}>📅</Text>
                      <Text style={[styles.emptyTitle, { color: TEXT1 }]}>Aucune entrée ce mois</Text>
                      <Text style={[styles.emptySubtitle, { color: TEXT2 }]}>
                        Commencez à écrire pour voir vos humeurs sur le calendrier
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* ── Vue Statistiques ── */}
              {activeTab === 'stats' && (
                <View>
                  <MoodStats entries={allEntries} isDark={isDark} />
                  {allEntries.length > 0 && (
                    <View style={[styles.timelineCard, { backgroundColor: CARD, borderColor: BORD }]}>
                      <Text style={[styles.timelineTitle, { color: TEXT1 }]}>Dernières entrées</Text>
                      {allEntries.slice(0, 7).map((e, i) => {
                        const moodColor = MOOD_COLORS[e.mood ?? 'neutral'] ?? GOLD;
                        return (
                          <Pressable
                            key={e.id}
                            style={({ pressed }) => [styles.timelineItem, { opacity: pressed ? 0.8 : 1 }]}
                            onPress={() => setSelectedEntry(e)}
                          >
                            <View style={[styles.timelineDot, { backgroundColor: moodColor }]} />
                            {i < 6 && <View style={[styles.timelineLine, { backgroundColor: `${moodColor}30` }]} />}
                            <View style={styles.timelineContent}>
                              <Text style={styles.timelineEmoji}>{MOOD_EMOJIS[e.mood as MoodState] ?? '😐'}</Text>
                              <View style={{ flex: 1 }}>
                                <Text style={[styles.timelineEntryTitle, { color: TEXT1 }]} numberOfLines={1}>
                                  {e.title || `Journal du ${new Date(e.createdAt).toLocaleDateString('fr-FR')}`}
                                </Text>
                                <Text style={[styles.timelineDate, { color: TEXT2 }]}>
                                  {new Date(e.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                </Text>
                              </View>
                              <View style={[styles.timelineMoodBadge, { backgroundColor: `${moodColor}15`, borderColor: `${moodColor}30` }]}>
                                <Text style={[styles.timelineMoodLabel, { color: moodColor }]}>
                                  {MOOD_LABELS[e.mood as MoodState] ?? e.mood}
                                </Text>
                              </View>
                            </View>
                          </Pressable>
                        );
                      })}
                    </View>
                  )}
                  {allEntries.length === 0 && (
                    <View style={styles.empty}>
                      <Text style={styles.emptyEmoji}>📊</Text>
                      <Text style={[styles.emptyTitle, { color: TEXT1 }]}>Pas encore de données</Text>
                      <Text style={[styles.emptySubtitle, { color: TEXT2 }]}>
                        Écrivez quelques entrées pour voir vos tendances émotionnelles
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* ── Vue Liste ── */}
              {activeTab === 'list' && (
                <View>
                  {/* Barre de recherche */}
                  <View style={[styles.searchBar, { backgroundColor: isDark ? '#1E1A30' : '#F0EBE0', borderColor: BORD }]}>
                    <IconSymbol name="magnifyingglass" size={16} color={TEXT2} />
                    <TextInput
                      style={[styles.searchInput, { color: TEXT1 }]}
                      placeholder="Rechercher dans le journal..."
                      placeholderTextColor={TEXT2}
                      value={search}
                      onChangeText={setSearch}
                      returnKeyType="search"
                    />
                    {search.length > 0 && (
                      <Pressable onPress={() => setSearch('')}>
                        <IconSymbol name="xmark.circle.fill" size={16} color={TEXT2} />
                      </Pressable>
                    )}
                  </View>

                  {/* Filtres par humeur */}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginBottom: 16 }}
                    contentContainerStyle={{ gap: 8, paddingRight: 4 }}
                  >
                    <Pressable
                      style={[styles.moodFilter, {
                        backgroundColor: !filterMood ? GOLD : (isDark ? GLASS_BG_J : '#F0EBE0'),
                        borderColor: !filterMood ? GOLD : BORD,
                      }]}
                      onPress={() => setFilterMood(null)}
                    >
                      <Text style={[styles.moodFilterText, { color: !filterMood ? '#0D0B1A' : TEXT1 }]}>Tout</Text>
                    </Pressable>
                    {MOODS.map((m) => (
                      <Pressable
                        key={m}
                        style={[styles.moodFilter, {
                          backgroundColor: filterMood === m ? `${MOOD_COLORS[m]}20` : (isDark ? GLASS_BG_J : '#F0EBE0'),
                          borderColor: filterMood === m ? MOOD_COLORS[m] : BORD,
                        }]}
                        onPress={() => setFilterMood(filterMood === m ? null : m)}
                      >
                        <Text style={styles.moodFilterEmoji}>{MOOD_EMOJIS[m]}</Text>
                        <Text style={[styles.moodFilterText, { color: filterMood === m ? MOOD_COLORS[m] : TEXT1 }]}>
                          {MOOD_LABELS[m]}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>

                  {/* Invitation du jour */}
                  <Pressable
                    style={({ pressed }) => [styles.promptCard, { opacity: pressed ? 0.9 : 1 }]}
                    onPress={() => setIsWriting(true)}
                  >
                    <LinearGradient
                      colors={isDark ? ['#1A1240', '#2A1870'] : ['#EDE8DC', '#E8E0FF']}
                      style={styles.promptGradient}
                    >
                      <Text style={[styles.promptLabel, { color: GOLD }]}>✦ Invitation du jour</Text>
                      <Text style={[styles.promptText, { color: TEXT1 }]}>{prompt}</Text>
                      <View style={[styles.writeButton, { backgroundColor: GOLD }]}>
                        <IconSymbol name="pencil" size={14} color="#0D0B1A" />
                        <Text style={styles.writeButtonText}>Commencer à écrire</Text>
                      </View>
                    </LinearGradient>
                  </Pressable>

                  {!listLoading && allEntries.length > 0 && entries.length === 0 && (
                    <View style={styles.empty}>
                      <Text style={styles.emptyEmoji}>🔍</Text>
                      <Text style={[styles.emptyTitle, { color: TEXT1 }]}>Aucun résultat</Text>
                      <Text style={[styles.emptySubtitle, { color: TEXT2 }]}>Essayez un autre terme ou filtre</Text>
                    </View>
                  )}
                </View>
              )}

              {listLoading && activeTab === 'list' && (
                <View style={{ alignItems: 'center', paddingVertical: 16 }}>
                  <ActivityIndicator color={GOLD} />
                </View>
              )}
            </View>
          }
          renderItem={({ item: e }) => {
            const moodColor = MOOD_COLORS[e.mood ?? 'neutral'] ?? GOLD;
            return (
              <Pressable
                style={({ pressed }) => [styles.entryCard, { backgroundColor: CARD, borderColor: `${moodColor}30`, opacity: pressed ? 0.88 : 1 }]}
                onPress={() => setSelectedEntry(e)}
              >
                <View style={styles.entryHeader}>
                  <View style={[styles.entryMoodCircle, { backgroundColor: `${moodColor}15` }]}>
                    <Text style={styles.entryMoodEmoji}>{MOOD_EMOJIS[e.mood as MoodState] ?? '📝'}</Text>
                  </View>
                  <View style={styles.entryMeta}>
                    <Text style={[styles.entryTitle, { color: TEXT1 }]} numberOfLines={1}>
                      {e.title || `Journal du ${new Date(e.createdAt).toLocaleDateString('fr-FR')}`}
                    </Text>
                    <View style={styles.entryMetaRow}>
                      <Text style={[styles.entryDate, { color: TEXT2 }]}>{formatDate(e.createdAt)}</Text>
                      <View style={[styles.entryMoodBadge, { backgroundColor: `${moodColor}15`, borderColor: `${moodColor}30` }]}>
                        <Text style={[styles.entryMoodBadgeText, { color: moodColor }]}>
                          {MOOD_LABELS[e.mood as MoodState] ?? e.mood}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Pressable
                    style={({ pressed }) => [styles.deleteBtn, { opacity: pressed ? 0.6 : 1 }]}
                    onPress={() => handleDelete(e.id)}
                    hitSlop={8}
                  >
                    <IconSymbol name="trash" size={16} color="#F87171" />
                  </Pressable>
                </View>
                <Text style={[styles.entryContent, { color: TEXT2 }]} numberOfLines={2}>{e.content}</Text>
                <Text style={[styles.tapHint, { color: GOLD }]}>Appuyer pour lire →</Text>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            activeTab === 'list' && !listLoading && allEntries.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyEmoji}>📖</Text>
                <Text style={[styles.emptyTitle, { color: TEXT1 }]}>Votre journal vous attend</Text>
                <Text style={[styles.emptySubtitle, { color: TEXT2 }]}>
                  Commencez à noter vos pensées, émotions et moments du quotidien.
                </Text>
              </View>
            ) : null
          }
        />
      </AnimatedScreen>

      {/* ── Modal d'écriture ── */}
      <Modal visible={isWriting} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modal, { backgroundColor: isDark ? NIGHT_BG_J : '#FAF7F2' }]}>
          <View style={[styles.modalHeader, { borderBottomColor: isDark ? GLASS_BORDER_J : 'rgba(139,105,20,0.20)' }]}>
            <Pressable onPress={() => setIsWriting(false)}>
              <Text style={[styles.modalCancel, { color: TEXT2 }]}>Annuler</Text>
            </Pressable>
            <Text style={[styles.modalTitle, { color: TEXT1 }]}>Nouvelle entrée</Text>
            <Pressable onPress={handleSave} disabled={!content.trim() || !mood}>
              <Text style={[styles.modalSave, { color: (!content.trim() || !mood) ? TEXT2 : GOLD }]}>
                {createMutation.isPending ? '...' : 'Sauvegarder'}
              </Text>
            </Pressable>
          </View>
          <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
            <TextInput
              style={[styles.titleInput, { color: TEXT1, borderBottomColor: isDark ? GLASS_BORDER_J : 'rgba(139,105,20,0.20)' }]}
              placeholder="Titre (optionnel)"
              placeholderTextColor={TEXT2}
              value={title}
              onChangeText={setTitle}
              returnKeyType="next"
            />
            <Text style={[styles.moodLabel, { color: TEXT1 }]}>Comment vous sentez-vous ?</Text>
            <View style={styles.moodRow}>
              {MOODS.map((m) => {
                const isSelected = mood === m;
                const moodColor = MOOD_COLORS[m] ?? GOLD;
                return (
                  <Pressable
                    key={m}
                    style={({ pressed }) => [
                      styles.moodChip,
                      {
                        backgroundColor: isSelected ? `${moodColor}20` : (isDark ? GLASS_BG_J : '#F5F0E8'),
                        borderColor: isSelected ? moodColor : (isDark ? GLASS_BORDER_J : 'rgba(139,105,20,0.20)'),
                        transform: [{ scale: pressed ? 0.95 : 1 }],
                      },
                    ]}
                    onPress={() => setMood(m)}
                  >
                    <Text style={styles.moodChipEmoji}>{MOOD_EMOJIS[m]}</Text>
                    <Text style={[styles.moodChipLabel, { color: isSelected ? moodColor : TEXT2 }]}>{MOOD_LABELS[m]}</Text>
                  </Pressable>
                );
              })}
            </View>
            <TextInput
              style={[styles.contentInput, {
                color: TEXT1,
                borderColor: isDark ? GLASS_BORDER_J : 'rgba(139,105,20,0.20)',
                backgroundColor: isDark ? GLASS_BG_J : '#F5F0E8',
              }]}
              placeholder={prompt}
              placeholderTextColor={TEXT2}
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={10}
              textAlignVertical="top"
            />
          </ScrollView>
        </View>
      </Modal>

      {/* ── Modal de lecture d'entrée ── */}
      <Modal visible={!!selectedEntry} animationType="slide" presentationStyle="pageSheet">
        {selectedEntry && (() => {
          const moodColor = MOOD_COLORS[selectedEntry.mood] ?? GOLD;
          const [g1, g2] = (MOOD_GRADIENTS[selectedEntry.mood] ?? ['#2A2540', '#1A1240']) as [string, string];
          return (
            <View style={[styles.modal, { backgroundColor: isDark ? NIGHT_BG_J : '#FAF7F2' }]}>
              <LinearGradient colors={[g1, g2]} style={styles.entryDetailHeader}>
                <Pressable
                  style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1, alignSelf: 'flex-end', padding: 8 }]}
                  onPress={() => setSelectedEntry(null)}
                >
                  <IconSymbol name="xmark.circle.fill" size={24} color="rgba(255,255,255,0.7)" />
                </Pressable>
                <Text style={styles.entryDetailEmoji}>{MOOD_EMOJIS[selectedEntry.mood as MoodState] ?? '😐'}</Text>
                <Text style={styles.entryDetailMood}>{MOOD_LABELS[selectedEntry.mood as MoodState] ?? selectedEntry.mood}</Text>
                <Text style={styles.entryDetailDate}>{formatDate(selectedEntry.createdAt)}</Text>
              </LinearGradient>
              <ScrollView style={{ flex: 1, padding: 20 }}>
                {selectedEntry.title && (
                  <Text style={[styles.entryDetailTitle, { color: TEXT1 }]}>{selectedEntry.title}</Text>
                )}
                <Text style={[styles.entryDetailContent, { color: TEXT2 }]}>{selectedEntry.content}</Text>
              </ScrollView>
              <View style={{ padding: 20, paddingBottom: 40 }}>
                <Pressable
                  style={({ pressed }) => [styles.deleteEntryBtn, { opacity: pressed ? 0.7 : 1 }]}
                  onPress={() => { setSelectedEntry(null); handleDelete(selectedEntry.id); }}
                >
                  <IconSymbol name="trash" size={16} color="#F87171" />
                  <Text style={styles.deleteEntryBtnText}>Supprimer cette entrée</Text>
                </Pressable>
              </View>
            </View>
          );
        })()}
      </Modal>
    </ScreenContainer>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
function makeStyles(isDark: boolean) {
  const CARD  = isDark ? '#2A2540' : '#FFFFFF';
  const TEXT1 = isDark ? '#F0EBE0' : '#1C1410';
  const TEXT2 = isDark ? 'rgba(240,235,224,0.65)' : 'rgba(60,40,20,0.65)';
  const GOLD_C = isDark ? '#C8A96E' : '#8B6914';
  const BORD  = isDark ? 'rgba(200,169,110,0.40)' : 'rgba(139,105,20,0.30)';

  return StyleSheet.create({
    list: { paddingHorizontal: 20, paddingBottom: 120 },

    header: { paddingTop: 18, marginBottom: 18 },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    title: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 28, marginBottom: 4 },
    subtitle: { fontSize: 11, letterSpacing: 0.3 },
    writeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 9 },
    writeBtnText: { color: '#0D0B1A', fontSize: 12, fontWeight: '700', letterSpacing: 0.3 },

    tabs: { flexDirection: 'row', borderRadius: 16, borderWidth: 1, padding: 4, marginBottom: 20 },
    tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 8, borderRadius: 12 },
    tabActive: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
    tabEmoji: { fontSize: 13 },
    tabLabel: { fontSize: 11, fontWeight: '600' },

    searchBar: {
      flexDirection: 'row', alignItems: 'center', borderRadius: 14,
      borderWidth: 0.5, paddingHorizontal: 14, paddingVertical: 10,
      gap: 8, marginBottom: 12,
    },
    searchInput: { flex: 1, fontSize: 14 },

    moodFilter: {
      flexDirection: 'row', alignItems: 'center', gap: 4,
      borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 0.5,
    },
    moodFilterEmoji: { fontSize: 13 },
    moodFilterText: { fontSize: 11, fontWeight: '500', letterSpacing: 0.2 },

    promptCard: { borderRadius: 20, overflow: 'hidden', marginBottom: 24 },
    promptGradient: { padding: 20 },
    promptLabel: { fontSize: 9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8 },
    promptText: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 18, lineHeight: 26, marginBottom: 16 },
    writeButton: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 9, alignSelf: 'flex-start' },
    writeButtonText: { color: '#0D0B1A', fontSize: 12, fontWeight: '700', letterSpacing: 0.3 },

    entryCard: {
      borderRadius: 18, borderWidth: 1, padding: 14, marginBottom: 12,
      shadowColor: isDark ? '#000' : '#1C1410',
      shadowOffset: { width: 0, height: 3 }, shadowOpacity: isDark ? 0.25 : 0.10,
      shadowRadius: isDark ? 10 : 8, elevation: isDark ? 6 : 4,
    },
    entryHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
    entryMoodCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    entryMoodEmoji: { fontSize: 22 },
    entryMeta: { flex: 1 },
    entryTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
    entryMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
    entryDate: { fontSize: 10, letterSpacing: 0.2 },
    entryMoodBadge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 0.5 },
    entryMoodBadgeText: { fontSize: 9, fontWeight: '600' },
    entryContent: { fontSize: 12, lineHeight: 18 },
    tapHint: { fontSize: 10, marginTop: 6, textAlign: 'right', opacity: 0.7, letterSpacing: 0.3 },
    deleteBtn: { padding: 6 },

    timelineCard: { borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 20 },
    timelineTitle: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 16, marginBottom: 16 },
    timelineItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 16, position: 'relative' },
    timelineDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
    timelineLine: { position: 'absolute', left: 4, top: 14, width: 2, height: 24 },
    timelineContent: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
    timelineEmoji: { fontSize: 20 },
    timelineEntryTitle: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
    timelineDate: { fontSize: 10 },
    timelineMoodBadge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 0.5 },
    timelineMoodLabel: { fontSize: 10, fontWeight: '600' },

    empty: { alignItems: 'center', paddingTop: 40 },
    emptyEmoji: { fontSize: 48, marginBottom: 16 },
    emptyTitle: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 20, marginBottom: 8 },
    emptySubtitle: { fontSize: 13, lineHeight: 20, textAlign: 'center' },

    modal: { flex: 1 },
    modalHeader: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1,
    },
    modalCancel: { fontSize: 14 },
    modalTitle: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 18 },
    modalSave: { fontSize: 14, fontWeight: '700' },
    modalContent: { flex: 1, paddingHorizontal: 20 },
    titleInput: { fontSize: 16, fontWeight: '500', paddingVertical: 14, borderBottomWidth: 0.5, marginBottom: 20 },
    moodLabel: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 17, marginBottom: 12 },
    moodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
    moodChip: { borderRadius: 12, borderWidth: 0.5, paddingHorizontal: 8, paddingVertical: 8, alignItems: 'center', flex: 1, minWidth: '28%' },
    moodChipEmoji: { fontSize: 20, marginBottom: 2 },
    moodChipLabel: { fontSize: 9, fontWeight: '500', textAlign: 'center' },
    contentInput: { borderRadius: 14, borderWidth: 0.5, padding: 14, fontSize: 14, lineHeight: 22, minHeight: 200 },

    entryDetailHeader: { padding: 24, paddingTop: 16, alignItems: 'center' },
    entryDetailEmoji: { fontSize: 56, marginBottom: 8 },
    entryDetailMood: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
    entryDetailDate: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
    entryDetailTitle: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 22, marginBottom: 16 },
    entryDetailContent: { fontSize: 15, lineHeight: 24 },
    deleteEntryBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
      paddingVertical: 14, borderRadius: 14, borderWidth: 1,
      borderColor: 'rgba(248,113,113,0.30)', backgroundColor: 'rgba(248,113,113,0.08)',
    },
    deleteEntryBtnText: { color: '#F87171', fontSize: 14, fontWeight: '600' },
  });
}
