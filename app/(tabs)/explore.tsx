import React, { useState, useMemo } from 'react';
import { ScrollView as HScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  View, Text, StyleSheet, Pressable, FlatList,
  TextInput, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useUser } from '@/lib/user-context';
import { trpc } from '@/lib/trpc';
import { PremiumBadge } from '@/components/ui/premium-badge';
import { IconSymbol } from '@/components/ui/icon-symbol';

// Couleurs de fallback par catégorie si pas de coverColor
const CATEGORY_COLORS: Record<string, string> = {
  stress: '#7C3AED',
  sleep: '#1E1B4B',
  focus: '#D97706',
  'self-love': '#BE185D',
  morning: '#F59E0B',
  breathing: '#0EA5E9',
  gratitude: '#EC4899',
  'body-scan': '#6D28D9',
};

// Formater la durée en minutes
function formatDuration(seconds: number): string {
  const m = Math.round(seconds / 60);
  return m < 1 ? '< 1 min' : `${m} min`;
}

export default function ExploreScreen() {
  const colors = useColors();
  const { favorites, toggleFavorite, profile } = useUser();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Charger les catégories depuis la DB
  const { data: dbCategories = [], isLoading: loadingCats } = trpc.catalog.categories.useQuery();

  // Charger toutes les méditations depuis la DB
  const { data: dbMeditations = [], isLoading: loadingMeds, refetch } = trpc.catalog.list.useQuery({
    limit: 200,
  });

  // Construire la liste de catégories avec "Tout" et "Favoris" en premier
  const categoryTabs = useMemo(() => [
    { slug: 'all', name: 'Tout', emoji: '' },
    { slug: 'favorites', name: 'Favoris', emoji: '❤️' },
    ...dbCategories,
  ], [dbCategories]);

  // Filtrer les méditations selon la recherche, la catégorie active et les favoris
  const filtered = useMemo(() => {
    return dbMeditations.filter((m) => {
      const matchSearch = !search ||
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        (m.subtitle ?? '').toLowerCase().includes(search.toLowerCase());
      const matchCat = activeCategory === 'all'
        ? true
        : activeCategory === 'favorites'
          ? favorites.includes(String(m.id))
          : m.categorySlug === activeCategory;
      return matchSearch && matchCat;
    });
  }, [dbMeditations, search, activeCategory, favorites]);

  const isLoading = loadingCats || loadingMeds;

  return (
    <ScreenContainer>
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.foreground }]}>Bibliothèque</Text>
              <Text style={[styles.subtitle, { color: colors.muted }]}>
                {isLoading ? 'Chargement...' : `${dbMeditations.length} méditations guidées`}
              </Text>
            </View>

            {/* Raccourcis fonctionnalités */}
            <HScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 16, marginHorizontal: -4 }}
              contentContainerStyle={{ paddingHorizontal: 4, gap: 10 }}
            >
              <Pressable
                style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
                onPress={() => router.push('/ambient' as never)}
              >
                <LinearGradient colors={['#0C4A6E', '#0EA5E9']} style={styles.featureCard}>
                  <Text style={styles.featureEmoji}>🌊</Text>
                  <Text style={styles.featureName}>Sons d'ambiance</Text>
                  <Text style={styles.featureSub}>Pluie, forêt, océan...</Text>
                </LinearGradient>
              </Pressable>
              <Pressable
                style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
                onPress={() => router.push('/breathing' as never)}
              >
                <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.featureCard}>
                  <Text style={styles.featureEmoji}>🫁</Text>
                  <Text style={styles.featureName}>Respiration</Text>
                  <Text style={styles.featureSub}>5 techniques guidées</Text>
                </LinearGradient>
              </Pressable>
              <Pressable
                style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
                onPress={() => router.push('/progress' as never)}
              >
                <LinearGradient colors={['#065F46', '#059669']} style={styles.featureCard}>
                  <Text style={styles.featureEmoji}>📊</Text>
                  <Text style={styles.featureName}>Progression</Text>
                  <Text style={styles.featureSub}>Votre parcours</Text>
                </LinearGradient>
              </Pressable>
            </HScrollView>

            {/* Barre de recherche */}
            <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <IconSymbol name="magnifyingglass" size={18} color={colors.muted} />
              <TextInput
                style={[styles.searchInput, { color: colors.foreground }]}
                placeholder="Rechercher une méditation..."
                placeholderTextColor={colors.muted}
                value={search}
                onChangeText={setSearch}
                returnKeyType="search"
              />
              {search.length > 0 && (
                <Pressable onPress={() => setSearch('')}>
                  <IconSymbol name="xmark.circle.fill" size={18} color={colors.muted} />
                </Pressable>
              )}
            </View>

            {/* Filtres par catégorie */}
            <FlatList
              horizontal
              data={categoryTabs}
              keyExtractor={(item) => item.slug}
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesScroll}
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [
                    styles.categoryChip,
                    {
                      backgroundColor: activeCategory === item.slug ? colors.primary : colors.surface,
                      borderColor: activeCategory === item.slug ? colors.primary : colors.border,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                  onPress={() => setActiveCategory(item.slug)}
                >
                  {item.emoji ? <Text style={styles.categoryEmoji}>{item.emoji}</Text> : null}
                  <Text style={[
                    styles.categoryChipText,
                    { color: activeCategory === item.slug ? '#FFF' : colors.foreground },
                  ]}>
                    {item.name}
                  </Text>
                </Pressable>
              )}
            />

            {/* État de chargement */}
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.muted }]}>Chargement du catalogue...</Text>
              </View>
            )}

            {/* Aucun résultat */}
            {!isLoading && filtered.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>🔍</Text>
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Aucun résultat</Text>
                <Text style={[styles.emptyText, { color: colors.muted }]}>
                  {search ? `Aucune méditation pour "${search}"` : 'Aucune méditation dans cette catégorie'}
                </Text>
              </View>
            )}
          </View>
        }
        renderItem={({ item }) => {
          const isFav = favorites.includes(String(item.id));
          const isLocked = item.isPremium && !profile?.isPremium;
          const coverColor = item.coverColor ?? CATEGORY_COLORS[item.categorySlug] ?? '#7C3AED';
          const durationMin = formatDuration(item.audioDurationSeconds);

          return (
            <Pressable
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: colors.surface, flex: 1, opacity: pressed ? 0.9 : 1 },
              ]}
              onPress={() => {
                if (isLocked) return;
                // Passer le slug DB pour charger depuis la DB dans le lecteur
                router.push(`/meditation/${item.slug}` as never);
              }}
            >
              {/* Cover colorée avec emoji catégorie */}
              <View style={[styles.coverBlock, { backgroundColor: coverColor }]}>
                <Text style={styles.coverEmoji}>
                  {dbCategories.find(c => c.slug === item.categorySlug)?.emoji ?? '🧘'}
                </Text>
                {item.isFeatured && (
                  <View style={styles.featuredBadge}>
                    <Text style={styles.featuredText}>⭐</Text>
                  </View>
                )}
                {isLocked && (
                  <View style={styles.lockBadge}>
                    <IconSymbol name="lock.fill" size={12} color="#FFF" />
                  </View>
                )}
                <Pressable
                  style={[styles.favButton, { backgroundColor: 'rgba(0,0,0,0.3)' }]}
                  onPress={() => toggleFavorite(String(item.id))}
                >
                  <IconSymbol
                    name={isFav ? 'heart.fill' : 'heart'}
                    size={14}
                    color={isFav ? '#F9A8D4' : '#FFF'}
                  />
                </Pressable>
              </View>

              <View style={styles.cardInfo}>
                <Text style={[styles.cardCategory, { color: colors.primary }]} numberOfLines={1}>
                  {dbCategories.find(c => c.slug === item.categorySlug)?.name ?? item.categorySlug}
                </Text>
                <Text style={[styles.cardTitle, { color: colors.foreground }]} numberOfLines={2}>
                  {item.title}
                </Text>
                <View style={styles.cardMeta}>
                  <Text style={[styles.cardDuration, { color: colors.muted }]}>{durationMin}</Text>
                  {item.isPremium && <PremiumBadge small />}
                </View>
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
  searchBar: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 14,
    borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 10,
    gap: 8, marginBottom: 14,
  },
  searchInput: { flex: 1, fontSize: 14 },
  categoriesScroll: { marginBottom: 16, marginHorizontal: -4 },
  categoryChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7,
    borderWidth: 1.5, marginHorizontal: 4,
  },
  categoryEmoji: { fontSize: 13 },
  categoryChipText: { fontSize: 13, fontWeight: '600' },
  loadingContainer: { alignItems: 'center', paddingVertical: 32, gap: 10 },
  loadingText: { fontSize: 14 },
  emptyContainer: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyEmoji: { fontSize: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyText: { fontSize: 14, textAlign: 'center' },
  card: { borderRadius: 16, overflow: 'hidden', marginBottom: 12 },
  coverBlock: {
    height: 110, justifyContent: 'center', alignItems: 'center',
    position: 'relative',
  },
  coverEmoji: { fontSize: 36 },
  featuredBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 999, padding: 4,
  },
  featuredText: { fontSize: 11 },
  lockBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 999, padding: 5,
  },
  favButton: { position: 'absolute', top: 8, right: 8, borderRadius: 999, padding: 6 },
  cardInfo: { padding: 10 },
  cardCategory: {
    fontSize: 10, fontWeight: '700', textTransform: 'uppercase',
    letterSpacing: 0.5, marginBottom: 2,
  },
  cardTitle: { fontSize: 13, fontWeight: '700', lineHeight: 18, marginBottom: 4 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardDuration: { fontSize: 11 },
  featureCard: { borderRadius: 16, padding: 14, width: 140, height: 90, justifyContent: 'flex-end' },
  featureEmoji: { fontSize: 22, marginBottom: 4 },
  featureName: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  featureSub: { color: 'rgba(255,255,255,0.7)', fontSize: 10, marginTop: 2 },
});
