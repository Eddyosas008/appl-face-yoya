import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, Image, TextInput } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useUser } from '@/lib/user-context';
import { MEDITATIONS, CATEGORY_LABELS } from '@/lib/mock-data';
import { PremiumBadge } from '@/components/ui/premium-badge';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { MeditationCategory } from '@/shared/wellness-types';

const CATEGORIES: { id: MeditationCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'Tout' },
  { id: 'sleep', label: 'Sommeil' },
  { id: 'anxiety', label: 'Anxiété' },
  { id: 'stress_relief', label: 'Stress' },
  { id: 'confidence', label: 'Confiance' },
  { id: 'focus', label: 'Focus' },
  { id: 'self_compassion', label: 'Compassion' },
  { id: 'emotional_reset', label: 'Reset' },
];

export default function ExploreScreen() {
  const colors = useColors();
  const { favorites, toggleFavorite, profile } = useUser();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filtered = MEDITATIONS.filter((m) => {
    const matchSearch = !search || m.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'all' || m.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <ScreenContainer>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.foreground }]}>Bibliothèque</Text>
              <Text style={[styles.subtitle, { color: colors.muted }]}>
                {MEDITATIONS.length} méditations guidées
              </Text>
            </View>
            <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <IconSymbol name="magnifyingglass" size={18} color={colors.muted} />
              <TextInput
                style={[styles.searchInput, { color: colors.foreground }]}
                placeholder="Rechercher..."
                placeholderTextColor={colors.muted}
                value={search}
                onChangeText={setSearch}
              />
            </View>
            <FlatList
              horizontal
              data={CATEGORIES}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesScroll}
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [
                    styles.categoryChip,
                    {
                      backgroundColor: activeCategory === item.id ? colors.primary : colors.surface,
                      borderColor: activeCategory === item.id ? colors.primary : colors.border,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                  onPress={() => setActiveCategory(item.id)}
                >
                  <Text style={[styles.categoryChipText, { color: activeCategory === item.id ? '#FFF' : colors.foreground }]}>
                    {item.label}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        }
        renderItem={({ item }) => {
          const isFav = favorites.includes(item.id);
          const isLocked = item.isPremium && !profile?.isPremium;
          return (
            <Pressable
              style={({ pressed }) => [styles.card, { backgroundColor: colors.surface, flex: 1, opacity: pressed ? 0.9 : 1 }]}
              onPress={() => router.push(`/meditation/${item.id}` as never)}
            >
              <View style={styles.imageContainer}>
                <Image source={{ uri: item.coverImage }} style={styles.image} />
                {isLocked && (
                  <View style={styles.lockBadge}>
                    <IconSymbol name="lock.fill" size={12} color="#FFF" />
                  </View>
                )}
                <Pressable
                  style={[styles.favButton, { backgroundColor: 'rgba(0,0,0,0.3)' }]}
                  onPress={() => toggleFavorite(item.id)}
                >
                  <IconSymbol name={isFav ? 'heart.fill' : 'heart'} size={14} color={isFav ? '#F9A8D4' : '#FFF'} />
                </Pressable>
              </View>
              <View style={styles.cardInfo}>
                <Text style={[styles.cardCategory, { color: colors.primary }]} numberOfLines={1}>
                  {CATEGORY_LABELS[item.category]}
                </Text>
                <Text style={[styles.cardTitle, { color: colors.foreground }]} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={[styles.cardDuration, { color: colors.muted }]}>{item.duration} min</Text>
              </View>
            </Pressable>
          );
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  header: { paddingTop: 16, marginBottom: 14 },
  title: { fontSize: 26, fontWeight: '800', marginBottom: 4 },
  subtitle: { fontSize: 13 },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 10, gap: 8, marginBottom: 14 },
  searchInput: { flex: 1, fontSize: 14 },
  categoriesScroll: { marginBottom: 16, marginHorizontal: -4 },
  categoryChip: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1.5, marginHorizontal: 4 },
  categoryChipText: { fontSize: 13, fontWeight: '600' },
  card: { borderRadius: 16, overflow: 'hidden', marginBottom: 12 },
  imageContainer: { position: 'relative' },
  image: { width: '100%', height: 110 },
  lockBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 999, padding: 5 },
  favButton: { position: 'absolute', top: 8, right: 8, borderRadius: 999, padding: 6 },
  cardInfo: { padding: 10 },
  cardCategory: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  cardTitle: { fontSize: 13, fontWeight: '700', lineHeight: 18, marginBottom: 4 },
  cardDuration: { fontSize: 11 },
});
