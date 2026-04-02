import React, { useState, useMemo } from 'react';
import { ScrollView as HScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  View, Text, StyleSheet, Pressable, FlatList,
  TextInput, ActivityIndicator, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useUser } from '@/lib/user-context';
import { trpc } from '@/lib/trpc';
import { PremiumBadge } from '@/components/ui/premium-badge';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AnimatedScreen } from '@/components/animated-screen';

// Formater la durée en minutes
function formatDuration(seconds: number): string {
  const m = Math.round(seconds / 60);
  return m < 1 ? '< 1 min' : `${m} min`;
}

// Carte de méditation compacte (utilisée dans les sections horizontales)
function MeditationCardHorizontal({
  item, categories, isFav, isLocked, onPress, onFav, colors,
}: any) {
  const cat = categories.find((c: any) => c.slug === item.categorySlug);
  const coverColor = item.coverColor ?? '#7C3AED';
  return (
    <Pressable
      style={({ pressed }) => [styles.hCard, { backgroundColor: colors.surface, opacity: pressed ? 0.9 : 1 }]}
      onPress={onPress}
    >
      <LinearGradient colors={[coverColor, coverColor + 'CC']} style={styles.hCover}>
        <Text style={styles.hCoverEmoji}>{cat?.emoji ?? '🧘'}</Text>
        {isLocked && (
          <View style={styles.lockBadge}>
            <IconSymbol name="lock.fill" size={10} color="#FFF" />
          </View>
        )}
        <Pressable style={styles.hFavBtn} onPress={onFav}>
          <IconSymbol name={isFav ? 'heart.fill' : 'heart'} size={13} color={isFav ? '#F9A8D4' : '#FFF'} />
        </Pressable>
      </LinearGradient>
      <View style={styles.hInfo}>
        <Text style={[styles.hCategory, { color: colors.primary }]} numberOfLines={1}>
          {cat?.name ?? item.categorySlug}
        </Text>
        <Text style={[styles.hTitle, { color: colors.foreground }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.hDuration, { color: colors.muted }]}>{formatDuration(item.audioDurationSeconds)}</Text>
      </View>
    </Pressable>
  );
}

// Carte de méditation verticale (grille 2 colonnes)
function MeditationCardGrid({
  item, categories, isFav, isLocked, onPress, onFav, colors,
}: any) {
  const cat = categories.find((c: any) => c.slug === item.categorySlug);
  const coverColor = item.coverColor ?? '#7C3AED';
  return (
    <Pressable
      style={({ pressed }) => [styles.card, { backgroundColor: colors.surface, flex: 1, opacity: pressed ? 0.9 : 1 }]}
      onPress={onPress}
    >
      <LinearGradient colors={[coverColor, coverColor + 'AA']} style={styles.coverBlock}>
        <Text style={styles.coverEmoji}>{cat?.emoji ?? '🧘'}</Text>
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
        <Pressable style={[styles.favButton, { backgroundColor: 'rgba(0,0,0,0.3)' }]} onPress={onFav}>
          <IconSymbol name={isFav ? 'heart.fill' : 'heart'} size={14} color={isFav ? '#F9A8D4' : '#FFF'} />
        </Pressable>
      </LinearGradient>
      <View style={styles.cardInfo}>
        <Text style={[styles.cardCategory, { color: colors.primary }]} numberOfLines={1}>
          {cat?.name ?? item.categorySlug}
        </Text>
        <Text style={[styles.cardTitle, { color: colors.foreground }]} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.cardMeta}>
          <Text style={[styles.cardDuration, { color: colors.muted }]}>{formatDuration(item.audioDurationSeconds)}</Text>
          {item.isPremium && <PremiumBadge small />}
        </View>
      </View>
    </Pressable>
  );
}

export default function ExploreScreen() {
  const colors = useColors();
  const { favorites, toggleFavorite, profile } = useUser();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Charger les catégories depuis la DB
  const { data: dbCategories = [], isLoading: loadingCats } = trpc.catalog.categories.useQuery();

  // Charger toutes les méditations depuis la DB
  const { data: dbMeditations = [], isLoading: loadingMeds } = trpc.catalog.list.useQuery({ limit: 200 });

  const isLoading = loadingCats || loadingMeds;

  // Catégories avec "Tout" et "Favoris"
  const categoryTabs = useMemo(() => [
    { slug: 'all', name: 'Tout', emoji: '' },
    { slug: 'favorites', name: 'Favoris', emoji: '❤️' },
    ...dbCategories,
  ], [dbCategories]);

  // Méditations filtrées
  const filtered = useMemo(() => {
    return dbMeditations.filter((m) => {
      const matchSearch = !search ||
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        (m.subtitle ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (m.categorySlug ?? '').toLowerCase().includes(search.toLowerCase());
      const matchCat = activeCategory === 'all'
        ? true
        : activeCategory === 'favorites'
          ? favorites.includes(String(m.id))
          : m.categorySlug === activeCategory;
      return matchSearch && matchCat;
    });
  }, [dbMeditations, search, activeCategory, favorites]);

  // Méditations à la une (featured)
  const featured = useMemo(() => dbMeditations.filter(m => m.isFeatured).slice(0, 8), [dbMeditations]);

  // Méditations récentes (dernières insérées)
  const recent = useMemo(() => [...dbMeditations].slice(-8).reverse(), [dbMeditations]);

  // Sections par catégorie pour la vue "Tout"
  const categorySections = useMemo(() => {
    if (activeCategory !== 'all' || search) return [];
    return dbCategories.map(cat => ({
      ...cat,
      items: dbMeditations.filter(m => m.categorySlug === cat.slug).slice(0, 6),
    })).filter(s => s.items.length > 0);
  }, [dbCategories, dbMeditations, activeCategory, search]);

  const isFiltered = activeCategory !== 'all' || search.length > 0;

  const handlePress = (item: any) => {
    if (item.isPremium && !profile?.isPremium) return;
    router.push(`/meditation/${item.slug}` as never);
  };

  const handleFav = (item: any) => toggleFavorite(String(item.id));

  return (
    <ScreenContainer>
      <AnimatedScreen preset="fadeSlideUp" duration={320}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>Bibliothèque</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            {isLoading ? 'Chargement...' : `${dbMeditations.length} méditations · ${dbCategories.length} catégories`}
          </Text>
        </View>

        {/* Raccourcis fonctionnalités */}
        <HScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 20 }}
          contentContainerStyle={{ gap: 10, paddingRight: 4 }}
        >
          <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]} onPress={() => router.push('/ambient' as never)}>
            <LinearGradient colors={['#0C4A6E', '#0EA5E9']} style={styles.featureCard}>
              <Text style={styles.featureEmoji}>🌊</Text>
              <Text style={styles.featureName}>Sons d'ambiance</Text>
              <Text style={styles.featureSub}>Pluie, forêt, océan...</Text>
            </LinearGradient>
          </Pressable>
          <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]} onPress={() => router.push('/breathing' as never)}>
            <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.featureCard}>
              <Text style={styles.featureEmoji}>🫁</Text>
              <Text style={styles.featureName}>Respiration</Text>
              <Text style={styles.featureSub}>5 techniques guidées</Text>
            </LinearGradient>
          </Pressable>
          <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]} onPress={() => router.push('/programs' as never)}>
            <LinearGradient colors={['#065F46', '#059669']} style={styles.featureCard}>
              <Text style={styles.featureEmoji}>🌙</Text>
              <Text style={styles.featureName}>Programmes</Text>
              <Text style={styles.featureSub}>21j & 30j guidés</Text>
            </LinearGradient>
          </Pressable>
          <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]} onPress={() => router.push('/progress' as never)}>
            <LinearGradient colors={['#7C2D12', '#EA580C']} style={styles.featureCard}>
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
        <HScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 20 }}
          contentContainerStyle={{ gap: 8 }}
        >
          {categoryTabs.map(item => (
            <Pressable
              key={item.slug}
              style={({ pressed }) => [
                styles.categoryChip,
                {
                  backgroundColor: activeCategory === item.slug ? GOLD : 'rgba(255,255,255,0.04)',
                  borderColor: activeCategory === item.slug ? GOLD : 'rgba(180,168,220,0.12)',
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              onPress={() => setActiveCategory(item.slug)}
            >
              {item.emoji ? <Text style={styles.categoryEmoji}>{item.emoji}</Text> : null}
              <Text style={[styles.categoryChipText, { color: activeCategory === item.slug ? '#07051C' : 'rgba(180,168,220,0.85)' }]}>
                {item.name}
              </Text>
            </Pressable>
          ))}
        </HScrollView>

        {/* État de chargement */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.muted }]}>Chargement du catalogue...</Text>
          </View>
        )}

        {/* VUE FILTRÉE : grille 2 colonnes */}
        {!isLoading && isFiltered && (
          <>
            {filtered.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>🔍</Text>
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Aucun résultat</Text>
                <Text style={[styles.emptyText, { color: colors.muted }]}>
                  {search ? `Aucune méditation pour "${search}"` : 'Aucune méditation dans cette catégorie'}
                </Text>
              </View>
            ) : (
              <>
                <Text style={[styles.sectionCount, { color: colors.muted }]}>
                  {filtered.length} méditation{filtered.length > 1 ? 's' : ''}
                </Text>
                <View style={styles.grid}>
                  {filtered.map((item, idx) => (
                    <View key={item.id} style={styles.gridItem}>
                      <MeditationCardGrid
                        item={item}
                        categories={dbCategories}
                        isFav={favorites.includes(String(item.id))}
                        isLocked={item.isPremium && !profile?.isPremium}
                        onPress={() => handlePress(item)}
                        onFav={() => handleFav(item)}
                        colors={colors}
                      />
                    </View>
                  ))}
                </View>
              </>
            )}
          </>
        )}

        {/* VUE PRINCIPALE : sections par catégorie */}
        {!isLoading && !isFiltered && (
          <>
            {/* Section À la une */}
            {featured.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.foreground }]}>⭐ À la une</Text>
                  <Text style={[styles.sectionCount, { color: colors.muted }]}>{featured.length}</Text>
                </View>
                <HScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                  {featured.map(item => (
                    <MeditationCardHorizontal
                      key={item.id}
                      item={item}
                      categories={dbCategories}
                      isFav={favorites.includes(String(item.id))}
                      isLocked={item.isPremium && !profile?.isPremium}
                      onPress={() => handlePress(item)}
                      onFav={() => handleFav(item)}
                      colors={colors}
                    />
                  ))}
                </HScrollView>
              </View>
            )}

            {/* Sections par catégorie */}
            {categorySections.map(section => (
              <View key={section.slug} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                    {section.emoji} {section.name}
                  </Text>
                  <Pressable
                    style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                    onPress={() => setActiveCategory(section.slug)}
                  >
                    <Text style={[styles.seeAll, { color: colors.primary }]}>Voir tout</Text>
                  </Pressable>
                </View>
                <Text style={[styles.sectionDesc, { color: colors.muted }]} numberOfLines={1}>
                  {section.description}
                </Text>
                <HScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingTop: 8 }}>
                  {section.items.map((item: any) => (
                    <MeditationCardHorizontal
                      key={item.id}
                      item={item}
                      categories={dbCategories}
                      isFav={favorites.includes(String(item.id))}
                      isLocked={item.isPremium && !profile?.isPremium}
                      onPress={() => handlePress(item)}
                      onFav={() => handleFav(item)}
                      colors={colors}
                    />
                  ))}
                </HScrollView>
              </View>
            ))}

            {/* Section Nouvelles méditations */}
            {recent.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.foreground }]}>🆕 Récemment ajoutées</Text>
                </View>
                <HScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                  {recent.map(item => (
                    <MeditationCardHorizontal
                      key={item.id}
                      item={item}
                      categories={dbCategories}
                      isFav={favorites.includes(String(item.id))}
                      isLocked={item.isPremium && !profile?.isPremium}
                      onPress={() => handlePress(item)}
                      onFav={() => handleFav(item)}
                      colors={colors}
                    />
                  ))}
                </HScrollView>
              </View>
            )}
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
      </AnimatedScreen>
    </ScreenContainer>
  );
}

// Palette SomnioPax v3
const NIGHT_BG     = '#03020F';
const GOLD         = '#C9A84C';
const LAVENDER     = 'rgba(237,233,255,0.55)';
const LAVENDER_DIM = 'rgba(180,160,255,0.10)';
const LAVENDER_MED = 'rgba(184,174,255,0.35)';
const WHITE_SOFT   = '#EDE9FF';
const GLASS_BG     = 'rgba(255,255,255,0.04)';
const GLASS_BORDER = 'rgba(180,160,255,0.10)';

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 18, paddingTop: 0 },
  header: { paddingTop: 18, marginBottom: 18 },
  title: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 28, color: WHITE_SOFT, marginBottom: 4, letterSpacing: -0.3 },
  subtitle: { fontSize: 11, color: LAVENDER, letterSpacing: 0.3 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 14,
    borderWidth: 0.5, borderColor: GLASS_BORDER, backgroundColor: GLASS_BG,
    paddingHorizontal: 14, paddingVertical: 10,
    gap: 8, marginBottom: 14,
  },
  searchInput: { flex: 1, fontSize: 14, color: WHITE_SOFT },
  categoryChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7,
    borderWidth: 0.5,
  },
  categoryEmoji: { fontSize: 12 },
  categoryChipText: { fontSize: 11, fontWeight: '500', letterSpacing: 0.3 },
  loadingContainer: { alignItems: 'center', paddingVertical: 32, gap: 10 },
  loadingText: { fontSize: 13, color: LAVENDER_MED },
  emptyContainer: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyEmoji: { fontSize: 40 },
  emptyTitle: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 20, color: WHITE_SOFT },
  emptyText: { fontSize: 13, color: LAVENDER_MED, textAlign: 'center' },
  sectionCount: { fontSize: 11, color: LAVENDER_MED, marginBottom: 12, letterSpacing: 0.3 },

  // Sections
  section: { marginBottom: 28 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  sectionTitle: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 19, color: WHITE_SOFT },
  sectionDesc: { fontSize: 11, color: LAVENDER, marginBottom: 4, letterSpacing: 0.2 },
  seeAll: { fontSize: 10, color: GOLD, letterSpacing: 0.5 },

  // Grille filtrée
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridItem: { width: '47%' },

  // Carte grille verticale
  card: { borderRadius: 18, overflow: 'hidden', marginBottom: 0, backgroundColor: GLASS_BG, borderWidth: 1, borderColor: GLASS_BORDER },
  coverBlock: {
    height: 110, justifyContent: 'center', alignItems: 'center', position: 'relative',
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
  cardCategory: { fontSize: 9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, color: GOLD, marginBottom: 2 },
  cardTitle: { fontSize: 12, fontWeight: '600', color: WHITE_SOFT, lineHeight: 17, marginBottom: 4 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardDuration: { fontSize: 10, color: LAVENDER },

  // Carte horizontale
  hCard: { borderRadius: 16, overflow: 'hidden', width: 150, backgroundColor: GLASS_BG, borderWidth: 1, borderColor: GLASS_BORDER },
  hCover: { height: 90, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  hCoverEmoji: { fontSize: 30 },
  hFavBtn: {
    position: 'absolute', top: 6, right: 6,
    backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 999, padding: 5,
  },
  hInfo: { padding: 8 },
  hCategory: { fontSize: 9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, color: GOLD, marginBottom: 2 },
  hTitle: { fontSize: 12, fontWeight: '500', color: WHITE_SOFT, lineHeight: 16, marginBottom: 3 },
  hDuration: { fontSize: 10, color: LAVENDER },

  // Feature cards
  featureCard: { borderRadius: 16, padding: 14, width: 140, height: 90, justifyContent: 'flex-end' },
  featureEmoji: { fontSize: 22, marginBottom: 4 },
  featureName: { color: '#FFFFFF', fontSize: 12, fontWeight: '600', letterSpacing: 0.2 },
  featureSub: { color: 'rgba(255,255,255,0.6)', fontSize: 10, marginTop: 2 },
});
