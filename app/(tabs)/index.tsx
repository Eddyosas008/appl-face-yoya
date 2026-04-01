import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  Animated, Dimensions, Platform, Modal, TextInput,
} from 'react-native';
// Note: useRef, useState, useEffect imported from React above
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useUser } from '@/lib/user-context';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/hooks/use-auth';
import { IconSymbol } from '@/components/ui/icon-symbol';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Problématiques du sommeil
const SLEEP_ISSUES = [
  { id: 'insomnia', emoji: '😶', label: 'Insomnie', desc: 'Difficultés à s\'endormir', color: '#4F46E5' },
  { id: 'wakeup', emoji: '😴', label: 'Réveils nocturnes', desc: 'Se réveiller la nuit', color: '#7C3AED' },
  { id: 'stress', emoji: '😰', label: 'Stress du soir', desc: 'Pensées envahissantes', color: '#9333EA' },
  { id: 'anxiety', emoji: '😟', label: 'Anxiété', desc: 'Ruminations mentales', color: '#6D28D9' },
  { id: 'quality', emoji: '🥱', label: 'Sommeil léger', desc: 'Pas assez reposant', color: '#5B21B6' },
  { id: 'rhythm', emoji: '🌀', label: 'Rythme perturbé', desc: 'Décalage horaire, travail', color: '#4338CA' },
];

// Conseils d'hygiène du sommeil
const SLEEP_TIPS = [
  { emoji: '📵', title: 'Écrans éteints', desc: 'Évitez les écrans 1h avant le coucher. La lumière bleue perturbe la mélatonine.' },
  { emoji: '🌡️', title: 'Chambre fraîche', desc: 'La température idéale pour dormir est entre 16 et 19°C.' },
  { emoji: '⏰', title: 'Horaires fixes', desc: 'Se coucher et se lever à la même heure renforce votre horloge biologique.' },
  { emoji: '☕', title: 'Caféine avant 14h', desc: 'La caféine reste active 6 à 8h dans l\'organisme. Évitez-la l\'après-midi.' },
  { emoji: '🛁', title: 'Bain chaud', desc: 'Un bain chaud 1h avant le coucher abaisse la température corporelle et favorise l\'endormissement.' },
  { emoji: '📖', title: 'Routine du soir', desc: 'Un rituel régulier (lecture, méditation) signale à votre cerveau qu\'il est temps de dormir.' },
];

// Citations nocturnes
const SLEEP_QUOTES = [
  { text: "Le sommeil est la meilleure méditation.", author: "Dalaï Lama" },
  { text: "Chaque nuit, nous mourons un peu pour renaître le matin.", author: "Proverbe" },
  { text: "Un bon rire et un long sommeil sont les deux meilleurs remèdes.", author: "Proverbe irlandais" },
  { text: "Le sommeil est le fil d'or qui relie la santé et nos corps.", author: "Thomas Dekker" },
];

function getTimeGreeting(): { greeting: string; emoji: string; isNight: boolean } {
  const h = new Date().getHours();
  if (h >= 21 || h < 6) return { greeting: 'Bonne nuit', emoji: '🌙', isNight: true };
  if (h < 12) return { greeting: 'Bonjour', emoji: '☀️', isNight: false };
  if (h < 18) return { greeting: 'Bon après-midi', emoji: '🌤️', isNight: false };
  return { greeting: 'Bonsoir', emoji: '🌙', isNight: true };
}

function getMoonPhase(): string {
  const phases = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
  const day = new Date().getDate();
  return phases[day % 8];
}

export default function HomeScreen() {
  const colors = useColors();
  const { profile } = useUser();
  const { isAuthenticated } = useAuth();
  const { greeting, emoji: timeEmoji, isNight } = getTimeGreeting();
  const moonPhase = getMoonPhase();
  const quoteIndex = new Date().getDate() % SLEEP_QUOTES.length;
  const quote = SLEEP_QUOTES[quoteIndex];

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const moonAnim = useRef(new Animated.Value(0)).current;
  const [tipIndex, setTipIndex] = useState(0);

  // Stats depuis la DB
  const { data: sessionStats } = trpc.sessions.stats.useQuery(undefined, { enabled: isAuthenticated });
  const { data: dbMeditations = [] } = trpc.catalog.list.useQuery({ categorySlug: 'sleep', limit: 3 });
  const { data: sleepStats } = trpc.sleep.stats.useQuery(undefined, { enabled: isAuthenticated });
  const { data: sleepLogs = [] } = trpc.sleep.list.useQuery({ limit: 7 }, { enabled: isAuthenticated });

  // Modal saisie sommeil
  const [showSleepModal, setShowSleepModal] = useState(false);
  const [sleepBedtime, setSleepBedtime] = useState('22:30');
  const [sleepWakeTime, setSleepWakeTime] = useState('07:00');
  const [sleepQuality, setSleepQuality] = useState(3);
  const [sleepNotes, setSleepNotes] = useState('');
  const createSleepLog = trpc.sleep.create.useMutation({
    onSuccess: () => {
      setShowSleepModal(false);
      setSleepNotes('');
    },
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLog = sleepLogs.find((l: { sleepDate: string; bedtime?: string | null; wakeTime?: string | null; quality?: number | null }) => l.sleepDate === todayStr);

  function handleSaveSleep() {
    createSleepLog.mutate({
      sleepDate: todayStr,
      bedtime: sleepBedtime,
      wakeTime: sleepWakeTime,
      quality: sleepQuality,
      notes: sleepNotes.trim() || undefined,
    });
  }

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(moonAnim, { toValue: 8, duration: 3000, useNativeDriver: true }),
          Animated.timing(moonAnim, { toValue: 0, duration: 3000, useNativeDriver: true }),
        ])
      ),
    ]).start();

    // Rotation des conseils toutes les 5 secondes
    const interval = setInterval(() => {
      setTipIndex(i => (i + 1) % SLEEP_TIPS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const firstName = profile?.firstName ?? 'vous';
  const streak = sessionStats?.currentStreak ?? 0;
  const totalSessions = sessionStats?.totalSessions ?? 0;
  const totalMinutes = sessionStats?.totalMinutes ?? 0;

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* ── HERO NOCTURNE ─────────────────────────────── */}
        <LinearGradient
          colors={['#0F0C29', '#302B63', '#24243E']}
          style={styles.hero}
        >
          {/* Étoiles décoratives */}
          <View style={styles.starsContainer}>
            {['✦', '✧', '✦', '✧', '✦', '✧', '✦'].map((s, i) => (
              <Text key={i} style={[styles.star, { left: `${10 + i * 13}%`, top: `${15 + (i % 3) * 20}%`, opacity: 0.4 + (i % 3) * 0.2 }]}>{s}</Text>
            ))}
          </View>

          {/* Lune animée */}
          <Animated.View style={[styles.moonContainer, { transform: [{ translateY: moonAnim }] }]}>
            <Text style={styles.moonEmoji}>{moonPhase}</Text>
          </Animated.View>

          <Animated.View style={[styles.heroContent, { opacity: fadeAnim }]}>
            <Text style={styles.heroGreeting}>{timeEmoji} {greeting}, {firstName}</Text>
            <Text style={styles.heroTitle}>Votre sanctuaire{'\n'}du sommeil</Text>
            <Text style={styles.heroSubtitle}>
              Retrouvez un sommeil profond et réparateur grâce à des méditations guidées et des programmes personnalisés.
            </Text>

            {/* Heure actuelle */}
            <View style={styles.timeWidget}>
              <Text style={styles.timeWidgetText}>
                🕐 {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <Text style={styles.timeWidgetSep}>·</Text>
              <Text style={styles.timeWidgetText}>
                Phase lunaire {moonPhase}
              </Text>
            </View>
          </Animated.View>
        </LinearGradient>

        {/* ── STATS SOMMEIL ─────────────────────────────── */}
        <Animated.View style={[styles.statsRow, { opacity: fadeAnim }]}>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{streak}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Jours de suite</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={styles.statEmoji}>🧘</Text>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{totalSessions}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Séances</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={styles.statEmoji}>⏱️</Text>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{totalMinutes}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Minutes</Text>
          </View>
        </Animated.View>

        {/* ── WIDGET SUIVI DU SOMMEIL ──────────────────── */}
        <View style={[styles.section, { paddingHorizontal: 16 }]}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>🛏️ Suivi du sommeil</Text>
              <Text style={[styles.sectionSub, { color: colors.muted }]}>Enregistrez votre nuit</Text>
            </View>
            <Pressable
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              onPress={() => router.push('/sleep-tracker' as never)}
            >
              <Text style={[styles.seeAll, { color: colors.primary }]}>Voir tout</Text>
            </Pressable>
          </View>

          <Pressable
            style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}
            onPress={() => isAuthenticated ? setShowSleepModal(true) : router.push('/(auth)/signin' as never)}
          >
            <LinearGradient
              colors={todayLog ? ['#0D3B2E', '#065F46'] : ['#1E1B4B', '#312E81']}
              style={styles.sleepWidget}
            >
              <View style={styles.sleepWidgetLeft}>
                <Text style={styles.sleepWidgetEmoji}>{todayLog ? '✅' : '🌙'}</Text>
                <View>
                  <Text style={styles.sleepWidgetTitle}>
                    {todayLog ? 'Nuit enregistrée' : 'Enregistrer cette nuit'}
                  </Text>
                  {todayLog ? (
                    <Text style={styles.sleepWidgetSub}>
                      {todayLog.bedtime} → {todayLog.wakeTime} · Qualité {todayLog.quality}/5
                    </Text>
                  ) : (
                    <Text style={styles.sleepWidgetSub}>Heure de coucher, lever, qualité</Text>
                  )}
                </View>
              </View>
              <View style={styles.sleepWidgetRight}>
                {sleepStats && (
                  <View style={styles.sleepMiniStats}>
                    <Text style={styles.sleepMiniVal}>{sleepStats.avgQuality?.toFixed(1) ?? '—'}</Text>
                    <Text style={styles.sleepMiniLabel}>Qualité moy.</Text>
                  </View>
                )}
                <IconSymbol name="chevron.right" size={18} color="rgba(255,255,255,0.6)" />
              </View>
            </LinearGradient>
          </Pressable>

          {/* Mini graphique barres 7 jours */}
          {sleepLogs.length > 0 && (
            <View style={[styles.sleepMiniChart, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.sleepMiniChartTitle, { color: colors.muted }]}>7 dernières nuits</Text>
              <View style={styles.sleepBars}>
                {Array.from({ length: 7 }, (_, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() - (6 - i));
                  const dateStr = d.toISOString().split('T')[0];
                  const log = sleepLogs.find((l: { sleepDate: string; quality: number | null }) => l.sleepDate === dateStr);
                  const quality = log?.quality ?? 0;
                  const barH = quality > 0 ? (quality / 5) * 48 : 4;
                  const barColor = quality >= 4 ? '#10B981' : quality >= 3 ? '#6366F1' : quality > 0 ? '#F59E0B' : colors.border;
                  return (
                    <View key={dateStr} style={styles.sleepBarCol}>
                      <View style={[styles.sleepBar, { height: barH, backgroundColor: barColor }]} />
                      <Text style={[styles.sleepBarLabel, { color: colors.muted }]}>
                        {['D', 'L', 'M', 'M', 'J', 'V', 'S'][d.getDay()]}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </View>

        {/* ── MÉDITATION DU SOIR ────────────────────────── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>🌙 Ce soir</Text>
          <Text style={[styles.sectionSub, { color: colors.muted }]}>Méditation recommandée pour bien dormir</Text>

          <Pressable
            style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}
            onPress={() => router.push('/explore' as never)}
          >
            <LinearGradient
              colors={['#1E1B4B', '#312E81', '#4338CA']}
              style={styles.featuredCard}
            >
              <View style={styles.featuredContent}>
                <Text style={styles.featuredEmoji}>😴</Text>
                <View style={styles.featuredText}>
                  <Text style={styles.featuredLabel}>MÉDITATION DU SOIR</Text>
                  <Text style={styles.featuredTitle}>
                    {dbMeditations[0]?.title ?? 'Voyage Nocturne'}
                  </Text>
                  <Text style={styles.featuredDuration}>
                    {dbMeditations[0] ? `${Math.round(dbMeditations[0].audioDurationSeconds / 60)} min` : '15 min'} · Sommeil profond
                  </Text>
                </View>
                <View style={styles.featuredPlayBtn}>
                  <IconSymbol name="play.fill" size={20} color="#FFF" />
                </View>
              </View>
            </LinearGradient>
          </Pressable>
        </View>

        {/* ── PROBLÉMATIQUES DU SOMMEIL ─────────────────── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>🔍 Votre problématique</Text>
          <Text style={[styles.sectionSub, { color: colors.muted }]}>Choisissez ce qui vous concerne</Text>

          <View style={styles.issuesGrid}>
            {SLEEP_ISSUES.map((issue) => (
              <Pressable
                key={issue.id}
                style={({ pressed }) => [
                  styles.issueCard,
                  { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
                ]}
                onPress={() => router.push(`/programs?issue=${issue.id}` as never)}
              >
                <LinearGradient
                  colors={[`${issue.color}30`, `${issue.color}10`]}
                  style={styles.issueGradient}
                >
                  <Text style={styles.issueEmoji}>{issue.emoji}</Text>
                  <Text style={[styles.issueLabel, { color: colors.foreground }]}>{issue.label}</Text>
                  <Text style={[styles.issueDesc, { color: colors.muted }]}>{issue.desc}</Text>
                </LinearGradient>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── PROGRAMMES STRUCTURÉS ─────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>📅 Programmes</Text>
              <Text style={[styles.sectionSub, { color: colors.muted }]}>Du 2 au 30 jours pour transformer votre sommeil</Text>
            </View>
            <Pressable
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              onPress={() => router.push('/programs' as never)}
            >
              <Text style={[styles.seeAll, { color: colors.primary }]}>Voir tout</Text>
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 16 }}>
            {[
              { slug: 'initiation-sommeil', emoji: '🌙', title: 'Initiation', days: 2, color: ['#1E1B4B', '#312E81'] as [string, string], desc: 'Découvrez les bases' },
              { slug: 'retrouver-sommeil', emoji: '🌛', title: 'Retrouver le sommeil', days: 7, color: ['#1E3A5F', '#1E40AF'] as [string, string], desc: 'Anti-insomnie' },
              { slug: 'transformation-sommeil', emoji: '✨', title: 'Transformation', days: 21, color: ['#2D1B69', '#5B21B6'] as [string, string], desc: 'Restructuration complète' },
              { slug: 'maitre-sommeil', emoji: '🌟', title: 'Maître du sommeil', days: 30, color: ['#1A0533', '#7C3AED'] as [string, string], desc: 'Programme expert' },
            ].map((prog) => (
              <Pressable
                key={prog.slug}
                style={({ pressed }) => [styles.programCard, { opacity: pressed ? 0.9 : 1 }]}
                onPress={() => router.push(`/programs/${prog.slug}` as never)}
              >
                <LinearGradient colors={prog.color} style={styles.programGradient}>
                  <Text style={styles.programEmoji}>{prog.emoji}</Text>
                  <View style={styles.programDaysBadge}>
                    <Text style={styles.programDaysText}>{prog.days}j</Text>
                  </View>
                  <Text style={styles.programTitle}>{prog.title}</Text>
                  <Text style={styles.programDesc}>{prog.desc}</Text>
                  <View style={styles.programStartBtn}>
                    <Text style={styles.programStartText}>Commencer →</Text>
                  </View>
                </LinearGradient>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* ── ACCÈS RAPIDES ─────────────────────────────── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>⚡ Accès rapide</Text>
          <View style={styles.quickGrid}>
            {[
              { emoji: '🫁', label: 'Respiration', sub: '4-7-8 pour dormir', route: '/breathing' },
              { emoji: '🎵', label: 'Sons d\'ambiance', sub: 'Pluie, forêt, océan', route: '/ambient' },
              { emoji: '📖', label: 'Journal', sub: 'Notez votre nuit', route: '/(tabs)/journal' },
              { emoji: '📊', label: 'Progression', sub: 'Votre évolution', route: '/progress' },
            ].map((item) => (
              <Pressable
                key={item.route}
                style={({ pressed }) => [
                  styles.quickCard,
                  { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
                ]}
                onPress={() => router.push(item.route as never)}
              >
                <Text style={styles.quickEmoji}>{item.emoji}</Text>
                <Text style={[styles.quickLabel, { color: colors.foreground }]}>{item.label}</Text>
                <Text style={[styles.quickSub, { color: colors.muted }]}>{item.sub}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── CONSEIL DU SOIR ───────────────────────────── */}
        <View style={[styles.section, { paddingHorizontal: 16 }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>💡 Conseil du soir</Text>
          <Animated.View
            style={[
              styles.tipCard,
              { backgroundColor: colors.surface, borderColor: `${colors.primary}30` },
              { opacity: fadeAnim },
            ]}
          >
            <LinearGradient
              colors={[`${colors.primary}15`, `${colors.primary}05`]}
              style={styles.tipGradient}
            >
              <Text style={styles.tipEmoji}>{SLEEP_TIPS[tipIndex].emoji}</Text>
              <View style={styles.tipContent}>
                <Text style={[styles.tipTitle, { color: colors.foreground }]}>{SLEEP_TIPS[tipIndex].title}</Text>
                <Text style={[styles.tipDesc, { color: colors.muted }]}>{SLEEP_TIPS[tipIndex].desc}</Text>
              </View>
            </LinearGradient>
            {/* Indicateurs de pagination */}
            <View style={styles.tipDots}>
              {SLEEP_TIPS.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.tipDot,
                    { backgroundColor: i === tipIndex ? colors.primary : colors.border },
                  ]}
                />
              ))}
            </View>
          </Animated.View>
        </View>

        {/* ── SCIENCE DU SOMMEIL ────────────────────────── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>🔬 Science du sommeil</Text>
          <Text style={[styles.sectionSub, { color: colors.muted }]}>Comprendre pour mieux dormir</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 16 }}>
            {[
              { emoji: '🧠', title: 'Cycles du sommeil', desc: 'Un cycle dure 90 min. Vous en avez besoin de 4 à 6 par nuit pour récupérer pleinement.', color: '#1E3A5F' },
              { emoji: '🌡️', title: 'Mélatonine', desc: 'L\'hormone du sommeil se libère dans l\'obscurité. Évitez la lumière bleue après 20h.', color: '#2D1B69' },
              { emoji: '💤', title: 'Sommeil profond', desc: 'Le sommeil profond (N3) est essentiel à la récupération physique et à la consolidation de la mémoire.', color: '#1A0533' },
              { emoji: '⚡', title: 'REM et créativité', desc: 'Le sommeil paradoxal (REM) stimule la créativité et régule les émotions. Ne le négligez pas.', color: '#1E1B4B' },
            ].map((card, i) => (
              <View
                key={i}
                style={[styles.scienceCard, { backgroundColor: card.color }]}
              >
                <Text style={styles.scienceEmoji}>{card.emoji}</Text>
                <Text style={styles.scienceTitle}>{card.title}</Text>
                <Text style={styles.scienceDesc}>{card.desc}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ── CITATION NOCTURNE ─────────────────────────── */}
        <View style={[styles.section, { paddingHorizontal: 16 }]}>
          <LinearGradient
            colors={['#0F0C29', '#302B63']}
            style={styles.quoteCard}
          >
            <Text style={styles.quoteStars}>✦ ✧ ✦</Text>
            <Text style={styles.quoteText}>"{quote.text}"</Text>
            <Text style={styles.quoteAuthor}>— {quote.author}</Text>
          </LinearGradient>
        </View>

        {/* ── CTA CHECK-IN ──────────────────────────────── */}
        <View style={[styles.section, { paddingHorizontal: 16 }]}>
          <Pressable
            style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
            onPress={() => router.push('/checkin' as never)}
          >
            <LinearGradient
              colors={['#7C3AED', '#4F46E5']}
              style={styles.ctaCard}
            >
              <Text style={styles.ctaEmoji}>🌙</Text>
              <View style={styles.ctaContent}>
                <Text style={styles.ctaTitle}>Comment vous sentez-vous ce soir ?</Text>
                <Text style={styles.ctaSub}>Faites votre check-in émotionnel</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color="rgba(255,255,255,0.7)" />
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>

      {/* ── MODAL SAISIE SOMMEIL ──────────────────────── */}
      <Modal
        visible={showSleepModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSleepModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowSleepModal(false)}>
          <Pressable style={[styles.modalSheet, { backgroundColor: '#1E1B4B' }]} onPress={e => e.stopPropagation()}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: '#FFF' }]}>🌙 Votre nuit</Text>
            <Text style={[styles.modalSub, { color: 'rgba(255,255,255,0.6)' }]}>Enregistrez votre sommeil de cette nuit</Text>

            <Text style={[styles.modalLabel, { color: 'rgba(255,255,255,0.8)' }]}>🛌 Heure de coucher</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)', color: '#FFF' }]}
              value={sleepBedtime}
              onChangeText={setSleepBedtime}
              placeholder="ex. 22:30"
              placeholderTextColor="rgba(255,255,255,0.4)"
              returnKeyType="done"
            />

            <Text style={[styles.modalLabel, { color: 'rgba(255,255,255,0.8)' }]}>☀️ Heure de lever</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)', color: '#FFF' }]}
              value={sleepWakeTime}
              onChangeText={setSleepWakeTime}
              placeholder="ex. 07:00"
              placeholderTextColor="rgba(255,255,255,0.4)"
              returnKeyType="done"
            />

            <Text style={[styles.modalLabel, { color: 'rgba(255,255,255,0.8)' }]}>⭐ Qualité du sommeil</Text>
            <View style={styles.qualityRow}>
              {[1, 2, 3, 4, 5].map(q => (
                <Pressable
                  key={q}
                  style={[styles.qualityBtn, {
                    backgroundColor: sleepQuality === q ? '#7C3AED' : 'rgba(255,255,255,0.1)',
                    borderColor: sleepQuality === q ? '#7C3AED' : 'rgba(255,255,255,0.2)',
                  }]}
                  onPress={() => setSleepQuality(q)}
                >
                  <Text style={styles.qualityBtnText}>{['😫', '😕', '😐', '🙂', '😄'][q - 1]}</Text>
                  <Text style={[styles.qualityBtnText, { fontSize: 12, color: '#FFF' }]}>{q}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.modalLabel, { color: 'rgba(255,255,255,0.8)' }]}>📝 Notes (rêves, pensées...)</Text>
            <TextInput
              style={[styles.modalInput, styles.modalInputNotes, { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)', color: '#FFF' }]}
              value={sleepNotes}
              onChangeText={setSleepNotes}
              placeholder="Notez vos rêves, vos pensées du soir..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              returnKeyType="default"
            />

            <Pressable
              style={({ pressed }) => [styles.modalSaveBtn, { backgroundColor: '#7C3AED', opacity: pressed ? 0.85 : 1 }]}
              onPress={handleSaveSleep}
            >
              <Text style={styles.modalSaveBtnText}>
                {createSleepLog.isPending ? 'Enregistrement...' : 'Enregistrer ma nuit 🌙'}
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  // Hero
  hero: { paddingTop: 20, paddingBottom: 32, paddingHorizontal: 20, position: 'relative', minHeight: 280 },
  starsContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  star: { position: 'absolute', color: '#FFF', fontSize: 10 },
  moonContainer: { alignItems: 'center', marginBottom: 12 },
  moonEmoji: { fontSize: 48 },
  heroContent: { alignItems: 'center' },
  heroGreeting: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 8 },
  heroTitle: { color: '#FFF', fontSize: 28, fontWeight: '800', textAlign: 'center', lineHeight: 36, marginBottom: 10 },
  heroSubtitle: { color: 'rgba(255,255,255,0.65)', fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 16 },
  timeWidget: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 },
  timeWidgetText: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  timeWidgetSep: { color: 'rgba(255,255,255,0.4)', fontSize: 13 },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginTop: 16, marginBottom: 4 },
  statCard: { flex: 1, borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1 },
  statEmoji: { fontSize: 22, marginBottom: 4 },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11, textAlign: 'center', marginTop: 2 },

  // Sections
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  sectionSub: { fontSize: 13, marginBottom: 12 },
  seeAll: { fontSize: 13, fontWeight: '600', marginTop: 4 },

  // Méditation du soir
  featuredCard: { borderRadius: 20, padding: 20 },
  featuredContent: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  featuredEmoji: { fontSize: 40 },
  featuredText: { flex: 1 },
  featuredLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  featuredTitle: { color: '#FFF', fontSize: 18, fontWeight: '800', marginBottom: 4 },
  featuredDuration: { color: 'rgba(255,255,255,0.65)', fontSize: 13 },
  featuredPlayBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },

  // Problématiques
  issuesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  issueCard: { width: (SCREEN_WIDTH - 32 - 10) / 2, borderRadius: 16, overflow: 'hidden', borderWidth: 1 },
  issueGradient: { padding: 16 },
  issueEmoji: { fontSize: 28, marginBottom: 8 },
  issueLabel: { fontSize: 14, fontWeight: '700', marginBottom: 3 },
  issueDesc: { fontSize: 12, lineHeight: 16 },

  // Programmes
  programCard: { width: 160 },
  programGradient: { borderRadius: 20, padding: 16, height: 200, justifyContent: 'space-between' },
  programEmoji: { fontSize: 32 },
  programDaysBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  programDaysText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  programTitle: { color: '#FFF', fontSize: 15, fontWeight: '800', lineHeight: 20 },
  programDesc: { color: 'rgba(255,255,255,0.65)', fontSize: 12 },
  programStartBtn: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start' },
  programStartText: { color: '#FFF', fontSize: 12, fontWeight: '600' },

  // Accès rapide
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickCard: { width: (SCREEN_WIDTH - 32 - 10) / 2, borderRadius: 16, padding: 16, borderWidth: 1 },
  quickEmoji: { fontSize: 28, marginBottom: 8 },
  quickLabel: { fontSize: 14, fontWeight: '700', marginBottom: 3 },
  quickSub: { fontSize: 12 },

  // Conseil du soir
  tipCard: { borderRadius: 20, overflow: 'hidden', borderWidth: 1 },
  tipGradient: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18 },
  tipEmoji: { fontSize: 36 },
  tipContent: { flex: 1 },
  tipTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  tipDesc: { fontSize: 13, lineHeight: 18 },
  tipDots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingBottom: 12 },
  tipDot: { width: 6, height: 6, borderRadius: 3 },

  // Science
  scienceCard: { width: 200, borderRadius: 20, padding: 18 },
  scienceEmoji: { fontSize: 32, marginBottom: 10 },
  scienceTitle: { color: '#FFF', fontSize: 15, fontWeight: '700', marginBottom: 6 },
  scienceDesc: { color: 'rgba(255,255,255,0.65)', fontSize: 12, lineHeight: 18 },

  // Citation
  quoteCard: { borderRadius: 20, padding: 28, alignItems: 'center' },
  quoteStars: { color: 'rgba(255,255,255,0.4)', fontSize: 14, letterSpacing: 8, marginBottom: 16 },
  quoteText: { color: '#FFF', fontSize: 16, fontStyle: 'italic', textAlign: 'center', lineHeight: 24, marginBottom: 12 },
  quoteAuthor: { color: 'rgba(255,255,255,0.5)', fontSize: 13 },

  // CTA
  ctaCard: { borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 14 },
  ctaEmoji: { fontSize: 36 },
  ctaContent: { flex: 1 },
  ctaTitle: { color: '#FFF', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  ctaSub: { color: 'rgba(255,255,255,0.65)', fontSize: 13 },

  // Widget sommeil
  sleepWidget: { borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sleepWidgetLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  sleepWidgetEmoji: { fontSize: 32 },
  sleepWidgetTitle: { color: '#FFF', fontSize: 15, fontWeight: '700', marginBottom: 3 },
  sleepWidgetSub: { color: 'rgba(255,255,255,0.65)', fontSize: 12 },
  sleepWidgetRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sleepMiniStats: { alignItems: 'center' },
  sleepMiniVal: { color: '#FFF', fontSize: 20, fontWeight: '800' },
  sleepMiniLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10 },
  sleepMiniChart: { marginTop: 12, borderRadius: 16, padding: 14, borderWidth: 1 },
  sleepMiniChartTitle: { fontSize: 12, marginBottom: 10 },
  sleepBars: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 60 },
  sleepBarCol: { alignItems: 'center', flex: 1, gap: 4 },
  sleepBar: { width: 14, borderRadius: 7, minHeight: 4 },
  sleepBarLabel: { fontSize: 10 },

  // Modal sommeil
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: '800', marginBottom: 6 },
  modalSub: { fontSize: 14, marginBottom: 24 },
  modalLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  modalInput: { borderRadius: 12, padding: 14, fontSize: 16, borderWidth: 1, marginBottom: 16 },
  modalInputNotes: { minHeight: 80, paddingTop: 12 },
  qualityRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  qualityBtn: { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1 },
  qualityBtnText: { fontSize: 16, fontWeight: '700' },
  modalSaveBtn: { borderRadius: 16, padding: 18, alignItems: 'center' },
  modalSaveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});
