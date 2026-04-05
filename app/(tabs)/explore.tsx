import React, { useState, useMemo, useRef } from 'react';
import { ScrollView as HScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring,
  interpolate, Extrapolation,
} from 'react-native-reanimated';
import {
  View, Text, StyleSheet, Pressable,
  TextInput, ActivityIndicator, ScrollView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useUser } from '@/lib/user-context';
import { trpc } from '@/lib/trpc';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AnimatedScreen } from '@/components/animated-screen';
import { StaggeredItem } from '@/components/staggered-item';
import { StarField } from '@/components/star-field';
import { useThemeContext } from '@/lib/theme-provider';

// ─── helpers ──────────────────────────────────────────────────────────────────
function formatDuration(seconds: number): string {
  const m = Math.round(seconds / 60);
  return m < 1 ? '< 1 min' : `${m} min`;
}

// Images thématiques par catégorie (Nano Banana, CDN)
const CAT_IMAGES: Record<string, string> = {
  'sommeil':           'https://d2xsxph8kpxj0f.cloudfront.net/91776583/eYFNRfZnGFDCF7cJsc37XA/med-sommeil-2xtgKdoszLPAkyryegHGNJ.webp',
  'stress-anxiete':    'https://d2xsxph8kpxj0f.cloudfront.net/91776583/eYFNRfZnGFDCF7cJsc37XA/med-stress-aCzt2NLpbohrtRC9aJRwHx.webp',
  'matin':             'https://d2xsxph8kpxj0f.cloudfront.net/91776583/eYFNRfZnGFDCF7cJsc37XA/med-matin-nfvroBuTKzv7WnQDTY4RmX.webp',
  'nature-connexion':  'https://d2xsxph8kpxj0f.cloudfront.net/91776583/eYFNRfZnGFDCF7cJsc37XA/med-nature-ahWR6HVmuAExPjryi7UYNe.webp',
  'confiance':         'https://d2xsxph8kpxj0f.cloudfront.net/91776583/eYFNRfZnGFDCF7cJsc37XA/med-confiance-YMnAaKsT3K2qGkjMoUAhrs.webp',
  'pleine-conscience': 'https://d2xsxph8kpxj0f.cloudfront.net/91776583/eYFNRfZnGFDCF7cJsc37XA/med-conscience-izmdkm2xSuBZXruVcztYvH.webp',
  'creativite':        'https://d2xsxph8kpxj0f.cloudfront.net/91776583/eYFNRfZnGFDCF7cJsc37XA/med-creativite-P6h8EXozAfg7AiZdRUmERQ.webp',
  'default':           'https://d2xsxph8kpxj0f.cloudfront.net/91776583/eYFNRfZnGFDCF7cJsc37XA/med-default-24onGunpmyvq5RFFx94Z5U.webp',
};
function getCatImage(slug?: string): string {
  if (!slug) return CAT_IMAGES.default;
  const key = Object.keys(CAT_IMAGES).find(k => k !== 'default' && slug.includes(k));
  return key ? CAT_IMAGES[key] : CAT_IMAGES.default;
}

// Couleur de gradient par catégorie
const CAT_GRADIENTS: Record<string, [string, string]> = {
  'sommeil':          ['#1E3A5F', '#2563EB'],
  'stress-anxiete':   ['#4A1D96', '#7C3AED'],
  'matin':            ['#92400E', '#F59E0B'],
  'nature-connexion': ['#064E3B', '#059669'],
  'creativite':       ['#831843', '#EC4899'],
  'confiance':        ['#7C2D12', '#EA580C'],
  'pleine-conscience':['#1E3A5F', '#0EA5E9'],
  'default':          ['#312E81', '#6D28D9'],
};

function getCatGradient(slug?: string): [string, string] {
  if (!slug) return CAT_GRADIENTS.default;
  const key = Object.keys(CAT_GRADIENTS).find(k => slug.includes(k));
  return key ? CAT_GRADIENTS[key] : CAT_GRADIENTS.default;
}

// Niveau de difficulté
const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Débutant', intermediate: 'Intermédiaire', advanced: 'Avancé',
};
// ─── Carte hero (méditation du moment) ────────────────────────────────────────────
function HeroMeditationCard({ item, categories, isFav, isLocked, onPress, onFav }: any) {
  const cat = categories.find((c: any) => c.slug === item.categorySlug);
  const [g1, g2] = getCatGradient(item.categorySlug);
  const imgUri = getCatImage(item.categorySlug);
  return (
    <Pressable
      style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1, marginBottom: 20 }]}
      onPress={onPress}
    >
      <LinearGradient
        colors={[g1, g2]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={heroStyles.card}
      >
        {/* Image thématique en fond */}
        <Image
          source={{ uri: imgUri }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', opacity: 0.38 }}
          resizeMode="cover"
        />
        {/* Badge catégorie */}
        <View style={heroStyles.catBadge}>
          <Text style={heroStyles.catEmoji}>{cat?.emoji ?? '🧘'}</Text>
          <Text style={heroStyles.catName}>{cat?.name ?? 'Méditation'}</Text>
        </View>

        {/* Emoji central */}
        <Text style={heroStyles.emoji}>{item.emoji ?? '🌙'}</Text>       {/* Infos */}
        <View style={heroStyles.info}>
          <Text style={heroStyles.label}>✨ Méditation du moment</Text>
          <Text style={heroStyles.title} numberOfLines={2}>{item.title}</Text>
          {item.subtitle ? (
            <Text style={heroStyles.subtitle} numberOfLines={1}>{item.subtitle}</Text>
          ) : null}
          <View style={heroStyles.meta}>
            <View style={heroStyles.metaChip}>
              <Text style={heroStyles.metaText}>⏱ {formatDuration(item.durationSeconds ?? 0)}</Text>
            </View>
            {item.level ? (
              <View style={heroStyles.metaChip}>
                <Text style={heroStyles.metaText}>📶 {LEVEL_LABELS[item.level] ?? item.level}</Text>
              </View>
            ) : null}
            {isLocked && (
              <View style={[heroStyles.metaChip, { backgroundColor: 'rgba(200,169,110,0.3)' }]}>
                <Text style={heroStyles.metaText}>🔒 Premium</Text>
              </View>
            )}
          </View>
        </View>

        {/* Bouton favori */}
        <Pressable
          style={[heroStyles.favBtn, isFav && { backgroundColor: 'rgba(236,72,153,0.35)' }]}
          onPress={onFav}
          hitSlop={10}
        >
          <Text style={{ fontSize: 16 }}>{isFav ? '❤️' : '🤍'}</Text>
        </Pressable>
      </LinearGradient>
    </Pressable>
  );
}

const heroStyles = StyleSheet.create({
  card: { borderRadius: 22, padding: 20, minHeight: 180, justifyContent: 'flex-end', overflow: 'hidden' },
  catBadge: { position: 'absolute', top: 16, left: 16, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  catEmoji: { fontSize: 12 },
  catName: { fontSize: 11, color: 'rgba(255,255,255,0.9)', fontWeight: '600', letterSpacing: 0.3 },
  emoji: { position: 'absolute', top: 16, right: 56, fontSize: 52, opacity: 0.35 },
  info: { gap: 4 },
  label: { fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: 0.8, textTransform: 'uppercase', fontWeight: '600' },
  title: { fontSize: 22, color: '#FFFFFF', fontWeight: '700', lineHeight: 28, letterSpacing: -0.3 },
  subtitle: { fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 16 },
  meta: { flexDirection: 'row', gap: 6, marginTop: 8, flexWrap: 'wrap' },
  metaChip: { backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  metaText: { fontSize: 11, color: 'rgba(255,255,255,0.9)', fontWeight: '500' },
  favBtn: { position: 'absolute', top: 14, right: 14, backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 999, padding: 8 },
});

// ─── Carte horizontale enrichie ──────────────────────────────────────────
function MeditationCardHorizontal({ item, categories, isFav, isLocked, onPress, onFav }: any) {
  const cat = categories.find((c: any) => c.slug === item.categorySlug);
  const [g1, g2] = getCatGradient(item.categorySlug);
  const imgUri = getCatImage(item.categorySlug);
  return (
    <Pressable
      style={({ pressed }) => [hStyles.card, { opacity: pressed ? 0.88 : 1 }]}
      onPress={onPress}
    >
      {/* Cover avec image + gradient overlay */}
      <LinearGradient colors={[g1, g2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={hStyles.cover}>
        <Image
          source={{ uri: imgUri }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', opacity: 0.45 }}
          resizeMode="cover"
        />
        <Text style={hStyles.emoji}>{item.emoji ?? cat?.emoji ?? '🧘'}</Text>
        {isLocked && (
          <View style={hStyles.lockBadge}>
            <Text style={{ fontSize: 10 }}>🔒</Text>
          </View>
        )}
        {item.isFeatured && !isLocked && (
          <View style={hStyles.featBadge}>
            <Text style={{ fontSize: 10 }}>⭐</Text>
          </View>
        )}
        <Pressable
          style={[hStyles.favBtn, isFav && { backgroundColor: 'rgba(236,72,153,0.4)' }]}
          onPress={onFav}
          hitSlop={8}
        >
          <Text style={{ fontSize: 12 }}>{isFav ? '❤️' : '🤍'}</Text>
        </Pressable>
      </LinearGradient>
      {/* Infos */}
      <View style={hStyles.info}>
        <Text style={hStyles.category} numberOfLines={1}>
          {cat?.emoji} {cat?.name ?? item.categorySlug}
        </Text>
        <Text style={hStyles.title} numberOfLines={2}>{item.title}</Text>
        <View style={hStyles.meta}>
          <Text style={hStyles.duration}>⏱ {formatDuration(item.durationSeconds ?? 0)}</Text>
          {item.playCount > 0 && (
            <Text style={hStyles.plays}>▶ {item.playCount}</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const hStyles = StyleSheet.create({
  card: { width: 158, borderRadius: 18, overflow: 'hidden', backgroundColor: '#2A2540', borderWidth: 1, borderColor: 'rgba(200,169,110,0.35)' },
  cover: { height: 100, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  emoji: { fontSize: 34, opacity: 0.9 },
  lockBadge: { position: 'absolute', top: 7, left: 7, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 999, padding: 4 },
  featBadge: { position: 'absolute', top: 7, left: 7, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 999, padding: 4 },
  favBtn: { position: 'absolute', top: 7, right: 7, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 999, padding: 5 },
  info: { padding: 10, gap: 3 },
  category: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.9, color: '#C8A96E' },
  title: { fontSize: 12, fontWeight: '600', color: '#EDE8DC', lineHeight: 17 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  duration: { fontSize: 10, color: 'rgba(237,233,255,0.55)' },
  plays: { fontSize: 10, color: 'rgba(237,233,255,0.40)' },
});

// ─── Carte grille enrichie ─────────────────────────────────────────────────────
function MeditationCardGrid({ item, categories, isFav, isLocked, onPress, onFav }: any) {
  const cat = categories.find((c: any) => c.slug === item.categorySlug);
  const [g1, g2] = getCatGradient(item.categorySlug);
  const imgUri = getCatImage(item.categorySlug);
  return (
    <Pressable
      style={({ pressed }) => [gStyles.card, { opacity: pressed ? 0.88 : 1 }]}
      onPress={onPress}
    >
      <LinearGradient colors={[g1, g2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={gStyles.cover}>
        <Image
          source={{ uri: imgUri }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', opacity: 0.45 }}
          resizeMode="cover"
        />
        <Text style={gStyles.emoji}>{item.emoji ?? cat?.emoji ?? '🧘'}</Text>
        {isLocked && (
          <View style={gStyles.lockBadge}><Text style={{ fontSize: 10 }}>🔒</Text></View>
        )}
        {item.isFeatured && !isLocked && (
          <View style={gStyles.featBadge}><Text style={{ fontSize: 10 }}>⭐</Text></View>
        )}
        <Pressable
          style={[gStyles.favBtn, isFav && { backgroundColor: 'rgba(236,72,153,0.4)' }]}
          onPress={onFav}
          hitSlop={8}
        >
          <Text style={{ fontSize: 13 }}>{isFav ? '❤️' : '🤍'}</Text>
        </Pressable>
      </LinearGradient>
      <View style={gStyles.info}>
        <Text style={gStyles.category} numberOfLines={1}>
          {cat?.emoji} {cat?.name ?? item.categorySlug}
        </Text>
        <Text style={gStyles.title} numberOfLines={2}>{item.title}</Text>
        <View style={gStyles.meta}>
          <Text style={gStyles.duration}>⏱ {formatDuration(item.durationSeconds ?? 0)}</Text>
          {item.level && (
            <View style={gStyles.levelChip}>
              <Text style={gStyles.levelText}>{LEVEL_LABELS[item.level]?.[0] ?? '●'}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const gStyles = StyleSheet.create({
  card: { borderRadius: 18, overflow: 'hidden', backgroundColor: '#2A2540', borderWidth: 1, borderColor: 'rgba(200,169,110,0.35)' },
  cover: { height: 118, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  emoji: { fontSize: 38, opacity: 0.9 },
  lockBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 999, padding: 4 },
  featBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 999, padding: 4 },
  favBtn: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 999, padding: 6 },
  info: { padding: 11, gap: 3 },
  category: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.9, color: '#C8A96E' },
  title: { fontSize: 12, fontWeight: '600', color: '#EDE8DC', lineHeight: 17 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  duration: { fontSize: 10, color: 'rgba(237,233,255,0.55)' },
  levelChip: { backgroundColor: 'rgba(200,169,110,0.2)', borderRadius: 999, paddingHorizontal: 6, paddingVertical: 2 },
  levelText: { fontSize: 9, color: '#C8A96E', fontWeight: '600' },
});

// ─── Quick-access card ─────────────────────────────────────────────────────────
function QuickCard({ gradient, emoji, title, sub, onPress }: {
  gradient: [string, string]; emoji: string; title: string; sub: string; onPress: () => void;
}) {
  return (
    <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]} onPress={onPress}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={qStyles.card}
      >
        <Text style={qStyles.emoji}>{emoji}</Text>
        <Text style={qStyles.title}>{title}</Text>
        <Text style={qStyles.sub} numberOfLines={2}>{sub}</Text>
        <View style={qStyles.arrow}>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>›</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const qStyles = StyleSheet.create({
  card: { borderRadius: 18, padding: 16, width: 148, height: 110, justifyContent: 'flex-end', overflow: 'hidden' },
  emoji: { position: 'absolute', top: 10, left: 14, fontSize: 28 },
  title: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', letterSpacing: 0.1 },
  sub: { color: 'rgba(255,255,255,0.65)', fontSize: 10, marginTop: 2, lineHeight: 14 },
  arrow: { position: 'absolute', top: 10, right: 12, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 999, width: 22, height: 22, justifyContent: 'center', alignItems: 'center' },
});

// ─── Composant principal ───────────────────────────────────────────────────────
export default function ExploreScreen() {
  const colors = useColors();
  const { isDark } = useThemeContext();
  const dynStyles = useMemo(() => makeStyles(isDark), [isDark]);
  const GOLD = isDark ? '#C8A96E' : '#8B6914';
  const { favorites, toggleFavorite, profile } = useUser();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const searchFocused = useSharedValue(0);
  const searchInputRef = useRef<TextInput>(null);

  // Charger les catégories depuis la DB
  const { data: dbCategories = [], isLoading: loadingCats } = trpc.catalog.categories.useQuery();
  // Charger toutes les méditations depuis la DB
  const { data: dbMeditations = [], isLoading: loadingMeds } = trpc.catalog.list.useQuery({ limit: 200 });

  const isLoading = loadingCats || loadingMeds;

  // Catégories avec "Tout" et "Favoris"
  const categoryTabs = useMemo(() => [
    { slug: 'all', name: 'Tout', emoji: '✨' },
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

  // Méditation du moment (première featured)
  const heroMeditation = useMemo(() => dbMeditations.find(m => m.isFeatured), [dbMeditations]);

  // Méditations à la une (featured, sans la hero)
  const featured = useMemo(() =>
    dbMeditations.filter(m => m.isFeatured).slice(1, 9),
    [dbMeditations]
  );

  // Populaires (triées par playCount)
  const popular = useMemo(() =>
    [...dbMeditations]
      .filter(m => (m.playCount ?? 0) > 0)
      .sort((a, b) => (b.playCount ?? 0) - (a.playCount ?? 0))
      .slice(0, 8),
    [dbMeditations]
  );

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

  // Animation barre de recherche
  const searchBarStyle = useAnimatedStyle(() => ({
    borderColor: `rgba(200,169,110,${interpolate(searchFocused.value, [0, 1], [0.3, 0.8], Extrapolation.CLAMP)})`,
    shadowOpacity: interpolate(searchFocused.value, [0, 1], [0, 0.2], Extrapolation.CLAMP),
  }));

  return (
    <ScreenContainer containerClassName={isDark ? 'bg-[#0D0B1A]' : 'bg-[#FAF7F2]'}>
      <StarField />
      <AnimatedScreen preset="fadeSlideUp" duration={320}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={dynStyles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── En-tête ── */}
          <View style={dynStyles.header}>
            <View style={dynStyles.headerRow}>
              <View>
                <Text style={[dynStyles.title, { color: colors.foreground }]}>Bibliothèque</Text>
                <Text style={[dynStyles.subtitle, { color: colors.muted }]}>
                  {isLoading
                    ? 'Chargement...'
                    : `${dbMeditations.length} méditations · ${dbCategories.length} catégories`}
                </Text>
              </View>
              {/* Bouton filtre favoris rapide */}
              <Pressable
                style={({ pressed }) => [
                  dynStyles.favQuickBtn,
                  { backgroundColor: activeCategory === 'favorites' ? '#EC4899' : (isDark ? '#2A2540' : '#F0EBE0') },
                  { opacity: pressed ? 0.8 : 1 },
                ]}
                onPress={() => setActiveCategory(activeCategory === 'favorites' ? 'all' : 'favorites')}
              >
                <Text style={{ fontSize: 16 }}>❤️</Text>
              </Pressable>
            </View>
          </View>

          {/* ── Quick-access cards ── */}
          <HScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 22 }}
            contentContainerStyle={{ gap: 10, paddingRight: 4 }}
          >
            <QuickCard
              gradient={['#0C4A6E', '#0EA5E9']}
              emoji="🌊"
              title="Sons d'ambiance"
              sub="Pluie, forêt, océan, feu..."
              onPress={() => router.push('/ambient' as never)}
            />
            <QuickCard
              gradient={['#4F46E5', '#7C3AED']}
              emoji="🫁"
              title="Respiration"
              sub="5 techniques guidées"
              onPress={() => router.push('/breathing' as never)}
            />
            <QuickCard
              gradient={['#065F46', '#059669']}
              emoji="🌙"
              title="Programmes"
              sub="21j & 30j guidés"
              onPress={() => router.push('/programs' as never)}
            />
            <QuickCard
              gradient={['#7C2D12', '#EA580C']}
              emoji="📊"
              title="Progression"
              sub="Votre parcours"
              onPress={() => router.push('/progress' as never)}
            />
          </HScrollView>

          {/* ── Barre de recherche ── */}
          <Animated.View style={[dynStyles.searchBar, { backgroundColor: isDark ? '#1E1A30' : '#F0EBE0' }, searchBarStyle]}>
            <IconSymbol name="magnifyingglass" size={18} color={colors.muted} />
            <TextInput
              ref={searchInputRef}
              style={[dynStyles.searchInput, { color: colors.foreground }]}
              placeholder="Rechercher une méditation..."
              placeholderTextColor={colors.muted}
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
              onFocus={() => { searchFocused.value = withTiming(1, { duration: 200 }); }}
              onBlur={() => { searchFocused.value = withTiming(0, { duration: 200 }); }}
            />
            {search.length > 0 ? (
              <Pressable onPress={() => setSearch('')} hitSlop={8}>
                <IconSymbol name="xmark.circle.fill" size={18} color={colors.muted} />
              </Pressable>
            ) : null}
          </Animated.View>

          {/* Compteur résultats de recherche */}
          {search.length > 0 && !isLoading && (
            <Text style={[dynStyles.searchCount, { color: colors.muted }]}>
              {filtered.length} résultat{filtered.length !== 1 ? 's' : ''} pour « {search} »
            </Text>
          )}

          {/* ── Filtres par catégorie ── */}
          <HScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 22 }}
            contentContainerStyle={{ gap: 8 }}
          >
            {categoryTabs.map(item => {
              const isActive = activeCategory === item.slug;
              return (
                <Pressable
                  key={item.slug}
                  style={({ pressed }) => [
                    dynStyles.categoryChip,
                    {
                      backgroundColor: isActive
                        ? GOLD
                        : (isDark ? '#1E1A30' : '#EDE8DC'),
                      borderColor: isActive ? GOLD : (isDark ? 'rgba(180,168,220,0.15)' : 'rgba(139,105,20,0.2)'),
                      opacity: pressed ? 0.75 : 1,
                    },
                  ]}
                  onPress={() => setActiveCategory(item.slug)}
                >
                  {item.emoji ? (
                    <Text style={dynStyles.categoryEmoji}>{item.emoji}</Text>
                  ) : null}
                  <Text style={[
                    dynStyles.categoryChipText,
                    { color: isActive ? '#07051C' : (isDark ? 'rgba(220,215,255,0.85)' : 'rgba(60,40,20,0.8)') },
                  ]}>
                    {item.name}
                  </Text>
                </Pressable>
              );
            })}
          </HScrollView>

          {/* ── Chargement ── */}
          {isLoading && (
            <View style={dynStyles.loadingContainer}>
              <ActivityIndicator color={colors.primary} size="large" />
              <Text style={[dynStyles.loadingText, { color: colors.muted }]}>Chargement du catalogue...</Text>
            </View>
          )}

          {/* ── VUE FILTRÉE : grille 2 colonnes ── */}
          {!isLoading && isFiltered && (
            <>
              {filtered.length === 0 ? (
                <View style={dynStyles.emptyContainer}>
                  <Text style={dynStyles.emptyEmoji}>🔍</Text>
                  <Text style={[dynStyles.emptyTitle, { color: colors.foreground }]}>Aucun résultat</Text>
                  <Text style={[dynStyles.emptyText, { color: colors.muted }]}>
                    {search
                      ? `Aucune méditation pour « ${search} »`
                      : 'Aucune méditation dans cette catégorie'}
                  </Text>
                  <Pressable
                    style={({ pressed }) => [dynStyles.resetBtn, { opacity: pressed ? 0.8 : 1 }]}
                    onPress={() => { setSearch(''); setActiveCategory('all'); }}
                  >
                    <Text style={dynStyles.resetBtnText}>Réinitialiser les filtres</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={dynStyles.grid}>
                  {filtered.map((item, idx) => (
                    <StaggeredItem key={item.id} index={idx} staggerDelay={50} style={dynStyles.gridItem}>
                      <MeditationCardGrid
                        item={item}
                        categories={dbCategories}
                        isFav={favorites.includes(String(item.id))}
                        isLocked={item.isPremium && !profile?.isPremium}
                        onPress={() => handlePress(item)}
                        onFav={() => handleFav(item)}
                      />
                    </StaggeredItem>
                  ))}
                </View>
              )}
            </>
          )}

          {/* ── VUE PRINCIPALE ── */}
          {!isLoading && !isFiltered && (
            <>
              {/* Méditation du moment (hero) */}
              {heroMeditation && (
                <View style={dynStyles.section}>
                  <HeroMeditationCard
                    item={heroMeditation}
                    categories={dbCategories}
                    isFav={favorites.includes(String(heroMeditation.id))}
                    isLocked={heroMeditation.isPremium && !profile?.isPremium}
                    onPress={() => handlePress(heroMeditation)}
                    onFav={() => handleFav(heroMeditation)}
                  />
                </View>
              )}

              {/* À la une */}
              {featured.length > 0 && (
                <View style={dynStyles.section}>
                  <View style={dynStyles.sectionHeader}>
                    <Text style={[dynStyles.sectionTitle, { color: colors.foreground }]}>⭐ À la une</Text>
                    <Text style={[dynStyles.sectionCount, { color: colors.muted }]}>{featured.length + 1}</Text>
                  </View>
                  <HScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                    {featured.map((item, idx) => (
                      <StaggeredItem key={item.id} index={idx} staggerDelay={65} translateY={10}>
                        <MeditationCardHorizontal
                          item={item}
                          categories={dbCategories}
                          isFav={favorites.includes(String(item.id))}
                          isLocked={item.isPremium && !profile?.isPremium}
                          onPress={() => handlePress(item)}
                          onFav={() => handleFav(item)}
                        />
                      </StaggeredItem>
                    ))}
                  </HScrollView>
                </View>
              )}

              {/* Populaires */}
              {popular.length > 0 && (
                <View style={dynStyles.section}>
                  <View style={dynStyles.sectionHeader}>
                    <Text style={[dynStyles.sectionTitle, { color: colors.foreground }]}>🔥 Populaires</Text>
                    <Text style={[dynStyles.sectionCount, { color: colors.muted }]}>{popular.length}</Text>
                  </View>
                  <Text style={[dynStyles.sectionDesc, { color: colors.muted }]}>Les plus écoutées par la communauté</Text>
                  <HScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingTop: 8 }}>
                    {popular.map((item, idx) => (
                      <StaggeredItem key={item.id} index={idx} staggerDelay={60} translateY={10}>
                        <MeditationCardHorizontal
                          item={item}
                          categories={dbCategories}
                          isFav={favorites.includes(String(item.id))}
                          isLocked={item.isPremium && !profile?.isPremium}
                          onPress={() => handlePress(item)}
                          onFav={() => handleFav(item)}
                        />
                      </StaggeredItem>
                    ))}
                  </HScrollView>
                </View>
              )}

              {/* Sections par catégorie */}
              {categorySections.map((section, si) => (
                <View key={section.slug} style={dynStyles.section}>
                  {/* Séparateur subtil */}
                  {si > 0 && <View style={[dynStyles.divider, { backgroundColor: isDark ? 'rgba(200,169,110,0.1)' : 'rgba(139,105,20,0.1)' }]} />}
                  <View style={dynStyles.sectionHeader}>
                    <View style={dynStyles.sectionTitleRow}>
                      <Text style={dynStyles.sectionEmoji}>{section.emoji}</Text>
                      <Text style={[dynStyles.sectionTitle, { color: colors.foreground }]}>{section.name}</Text>
                    </View>
                    <Pressable
                      style={({ pressed }) => [dynStyles.seeAllBtn, { opacity: pressed ? 0.7 : 1, borderColor: isDark ? 'rgba(200,169,110,0.3)' : 'rgba(139,105,20,0.3)' }]}
                      onPress={() => setActiveCategory(section.slug)}
                    >
                      <Text style={[dynStyles.seeAll, { color: GOLD }]}>Voir tout</Text>
                    </Pressable>
                  </View>
                  {section.description ? (
                    <Text style={[dynStyles.sectionDesc, { color: colors.muted }]} numberOfLines={1}>
                      {section.description}
                    </Text>
                  ) : null}
                  <HScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingTop: 8 }}>
                    {section.items.map((item: any, idx: number) => (
                      <StaggeredItem key={item.id} index={idx} staggerDelay={60} translateY={10}>
                        <MeditationCardHorizontal
                          item={item}
                          categories={dbCategories}
                          isFav={favorites.includes(String(item.id))}
                          isLocked={item.isPremium && !profile?.isPremium}
                          onPress={() => handlePress(item)}
                          onFav={() => handleFav(item)}
                        />
                      </StaggeredItem>
                    ))}
                  </HScrollView>
                </View>
              ))}

              {/* Récemment ajoutées */}
              {recent.length > 0 && (
                <View style={dynStyles.section}>
                  <View style={[dynStyles.divider, { backgroundColor: isDark ? 'rgba(200,169,110,0.1)' : 'rgba(139,105,20,0.1)' }]} />
                  <View style={dynStyles.sectionHeader}>
                    <Text style={[dynStyles.sectionTitle, { color: colors.foreground }]}>🆕 Récemment ajoutées</Text>
                  </View>
                  <HScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                    {recent.map((item, idx) => (
                      <StaggeredItem key={item.id} index={idx} staggerDelay={60} translateY={10}>
                        <MeditationCardHorizontal
                          item={item}
                          categories={dbCategories}
                          isFav={favorites.includes(String(item.id))}
                          isLocked={item.isPremium && !profile?.isPremium}
                          onPress={() => handlePress(item)}
                          onFav={() => handleFav(item)}
                        />
                      </StaggeredItem>
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

// ─── Styles dynamiques ─────────────────────────────────────────────────────────
function makeStyles(isDark: boolean) {
  const TEXT1 = isDark ? '#F0EBE0' : '#1C1410';
  const TEXT2 = isDark ? 'rgba(240,235,224,0.65)' : 'rgba(60,40,20,0.65)';
  const GOLD_C = isDark ? '#C8A96E' : '#8B6914';

  return StyleSheet.create({
    scrollContent: { paddingHorizontal: 18, paddingTop: 0, paddingBottom: 120 },

    // Header
    header: { paddingTop: 18, marginBottom: 20 },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    title: { fontSize: 30, fontWeight: '700', color: TEXT1, letterSpacing: -0.5, marginBottom: 3 },
    subtitle: { fontSize: 11, color: TEXT2, letterSpacing: 0.3 },
    favQuickBtn: { borderRadius: 999, width: 42, height: 42, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(200,169,110,0.25)' },

    // Recherche
    searchBar: {
      flexDirection: 'row', alignItems: 'center', borderRadius: 16,
      borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 11,
      gap: 8, marginBottom: 8,
      ...Platform.select({ ios: { shadowColor: '#C8A96E', shadowOffset: { width: 0, height: 2 }, shadowRadius: 8 }, android: {} }),
    },
    searchInput: { flex: 1, fontSize: 14 },
    searchCount: { fontSize: 11, marginBottom: 12, letterSpacing: 0.3 },

    // Filtres
    categoryChip: {
      flexDirection: 'row', alignItems: 'center', gap: 5,
      borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8,
      borderWidth: 1,
    },
    categoryEmoji: { fontSize: 13 },
    categoryChipText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.2 },

    // Chargement
    loadingContainer: { alignItems: 'center', paddingVertical: 48, gap: 12 },
    loadingText: { fontSize: 13 },

    // Vide
    emptyContainer: { alignItems: 'center', paddingVertical: 48, gap: 10 },
    emptyEmoji: { fontSize: 48 },
    emptyTitle: { fontSize: 20, fontWeight: '700', letterSpacing: -0.3 },
    emptyText: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
    resetBtn: { marginTop: 8, backgroundColor: GOLD_C, borderRadius: 999, paddingHorizontal: 20, paddingVertical: 10 },
    resetBtnText: { color: '#07051C', fontSize: 13, fontWeight: '700' },

    // Grille
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    gridItem: { width: '47%' },

    // Sections
    section: { marginBottom: 28 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
    sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    sectionEmoji: { fontSize: 18 },
    sectionTitle: { fontSize: 19, fontWeight: '700', letterSpacing: -0.2 },
    sectionDesc: { fontSize: 11, letterSpacing: 0.2, marginBottom: 2 },
    sectionCount: { fontSize: 11, letterSpacing: 0.3 },
    seeAllBtn: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1 },
    seeAll: { fontSize: 11, fontWeight: '600', letterSpacing: 0.3 },
    divider: { height: 1, marginBottom: 22, borderRadius: 999 },
  });
}
