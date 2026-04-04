import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  Animated, Dimensions, Platform, Modal, TextInput,
} from 'react-native';
import { useThemeContext } from '@/lib/theme-provider';
import { getThemeColors } from '@/lib/theme-constants';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useUser } from '@/lib/user-context';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/hooks/use-auth';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AnimatedScreen, AnimatedItem } from '@/components/animated-screen';
import { StaggeredItem } from '@/components/staggered-item';
import { StarField } from '@/components/star-field';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Palette SomnioPax v3 (statique pour les gradients) ────────────────────
const INDIGO_DEEP  = '#1A1240';   // fond hero sombre
const INDIGO_MID   = '#2E1870';   // cartes gradient

// ─── Données statiques ───────────────────────────────────────────────────────
const SLEEP_ISSUES = [
  { id: 'insomnia',  emoji: '😶', label: 'Insomnie',         desc: "Difficultés à s'endormir",  color: '#4F46E5' },
  { id: 'wakeup',   emoji: '😴', label: 'Réveils nocturnes', desc: 'Se réveiller la nuit',       color: '#7C3AED' },
  { id: 'stress',   emoji: '😰', label: 'Stress du soir',    desc: 'Pensées envahissantes',      color: '#9333EA' },
  { id: 'anxiety',  emoji: '😟', label: 'Anxiété',           desc: 'Ruminations mentales',       color: '#6D28D9' },
  { id: 'quality',  emoji: '🥱', label: 'Sommeil léger',     desc: 'Pas assez reposant',         color: '#5B21B6' },
  { id: 'rhythm',   emoji: '🌀', label: 'Rythme perturbé',   desc: 'Décalage horaire, travail',  color: '#4338CA' },
];

const SLEEP_TIPS = [
  { emoji: '📵', title: 'Écrans éteints',   desc: 'Évitez les écrans 1h avant le coucher. La lumière bleue perturbe la mélatonine.' },
  { emoji: '🌡️', title: 'Chambre fraîche',  desc: 'La température idéale pour dormir est entre 16 et 19°C.' },
  { emoji: '⏰', title: 'Horaires fixes',   desc: 'Se coucher et se lever à la même heure renforce votre horloge biologique.' },
  { emoji: '☕', title: 'Caféine avant 14h', desc: "La caféine reste active 6 à 8h dans l'organisme. Évitez-la l'après-midi." },
  { emoji: '🛁', title: 'Bain chaud',        desc: "Un bain chaud 1h avant le coucher abaisse la température corporelle et favorise l'endormissement." },
  { emoji: '📖', title: 'Routine du soir',   desc: 'Un rituel régulier (lecture, méditation) signale à votre cerveau qu\'il est temps de dormir.' },
];

const SLEEP_QUOTES = [
  { text: 'Le sommeil est la meilleure méditation.',                          author: 'Dalaï Lama' },
  { text: 'Chaque nuit, nous mourons un peu pour renaître le matin.',         author: 'Proverbe' },
  { text: 'Un bon rire et un long sommeil sont les deux meilleurs remèdes.',  author: 'Proverbe irlandais' },
  { text: 'Le sommeil est le fil d\'or qui relie la santé et nos corps.',     author: 'Thomas Dekker' },
];

const SCIENCE_CARDS = [
  { emoji: '🧠', title: 'Cycles du sommeil',  desc: 'Un cycle dure 90 min. Vous en avez besoin de 4 à 6 par nuit pour récupérer pleinement.', color: '#1E3A5F' },
  { emoji: '🌡️', title: 'Mélatonine',         desc: "L'hormone du sommeil se libère dans l'obscurité. Évitez la lumière bleue après 20h.",    color: '#2D1B69' },
  { emoji: '💤', title: 'Sommeil profond',     desc: 'Le sommeil profond (N3) est essentiel à la récupération physique et à la mémoire.',       color: '#1A0533' },
  { emoji: '⚡', title: 'REM et créativité',   desc: 'Le sommeil paradoxal (REM) stimule la créativité et régule les émotions.',               color: '#1E1B4B' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getTimeGreeting(): { greeting: string; isNight: boolean } {
  const h = new Date().getHours();
  if (h >= 21 || h < 6) return { greeting: 'Bonne nuit',      isNight: true };
  if (h < 12)           return { greeting: 'Bonjour',          isNight: false };
  if (h < 18)           return { greeting: 'Bon après-midi',   isNight: false };
  return                       { greeting: 'Bonsoir',          isNight: true };
}

function getMoonPhaseLabel(): string {
  const phases = ['Nouvelle lune', 'Croissant', 'Premier quartier', 'Gibbeuse croissante', 'Pleine lune', 'Gibbeuse décroissante', 'Dernier quartier', 'Croissant décroissant'];
  return phases[new Date().getDate() % 8];
}

function getMoonEmoji(): string {
  const phases = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
  return phases[new Date().getDate() % 8];
}

// ─── Composant Aurora + étoiles local (remplacé par StarField partagé) ─────
function _LocalStarField_UNUSED() {
  // Étoiles scintillantes
  const stars = useRef(
    Array.from({ length: 70 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 80,
      size: Math.random() * 1.8 + 0.4,
      anim: new Animated.Value(Math.random() * 0.6 + 0.1),
      delay: i * 60,
    }))
  ).current;

  // Blobs aurora flottants
  const blobAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    // Scintillement étoiles
    stars.forEach((star) => {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(star.anim, { toValue: 0.85, duration: 1800 + Math.random() * 2400, delay: star.delay, useNativeDriver: true }),
          Animated.timing(star.anim, { toValue: 0.08, duration: 1800 + Math.random() * 2400, useNativeDriver: true }),
        ])
      );
      loop.start();
    });
    // Blobs aurora
    blobAnims.forEach((anim, i) => {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: 6000 + i * 1200, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 6000 + i * 1200, useNativeDriver: true }),
        ])
      );
      loop.start();
    });
  }, []);

  const blobConfigs = [
    { left: '10%', top: '8%',  width: 160, height: 90,  color: 'rgba(200,169,110,0.35)' },
    { left: '55%', top: '15%', width: 130, height: 75,  color: 'rgba(180,140,80,0.06)' },
    { left: '30%', top: '2%',  width: 170, height: 60,  color: 'rgba(200,169,110,0.06)' },
  ];

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {/* Blobs aurora */}
      {blobConfigs.map((blob, i) => (
        <Animated.View
          key={`blob-${i}`}
          style={{
            position: 'absolute',
            left: blob.left as any,
            top: blob.top as any,
            width: blob.width,
            height: blob.height,
            borderRadius: blob.width / 2,
            backgroundColor: blob.color,
            opacity: blobAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }),
            transform: [{
              translateY: blobAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0, 12] }),
            }],
          }}
        />
      ))}
      {/* Étoiles scintillantes */}
      {stars.map((star, i) => (
        <Animated.View
          key={`star-${i}`}
          style={{
            position: 'absolute',
            left: `${star.x}%` as any,
            top: `${star.y}%` as any,
            width: star.size,
            height: star.size,
            borderRadius: star.size / 2,
            backgroundColor: '#EDE8DC',
            opacity: star.anim,
          }}
        />
      ))}
    </View>
  );
}

// ─── Écran principal ─────────────────────────────────────────────────────────
export default function HomeScreen() {
  const colors = useColors();
  const { isDark } = useThemeContext();
  const T = getThemeColors(isDark);
  const styles = useMemo(() => makeStyles(isDark), [isDark]);
  const { profile } = useUser();
  const { isAuthenticated } = useAuth();
  // Palette selon modèle de référence
  const GOLD        = isDark ? '#C8A96E' : '#8B6914';
  const GLASS_BORDER = isDark ? 'rgba(200,169,110,0.40)' : 'rgba(139,105,20,0.30)';
  const NIGHT_BG    = isDark ? '#0D0B1A' : '#FAF7F2';
  const WHITE_SOFT  = isDark ? '#F0EBE0' : '#1C1410';   // fort contraste
  const TEXT_MID    = isDark ? '#D4C8B0' : '#3D3020';
  const TEXT_SOFT   = isDark ? '#A89880' : '#6A5840';
  const CARD_BG     = isDark ? '#2A2540' : '#FFFFFF';   // surface très visible
  const CARD_BORDER = isDark ? 'rgba(200,169,110,0.40)' : 'rgba(139,105,20,0.25)';
  const HERO_BG     = isDark ? '#1A1530' : '#EDE5D0';
  const { greeting, isNight } = getTimeGreeting();
  const moonPhase = getMoonPhaseLabel();
  const moonEmoji = getMoonEmoji();
  const quoteIndex = new Date().getDate() % SLEEP_QUOTES.length;
  const quote = SLEEP_QUOTES[quoteIndex];

  // Animations
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const moonAnim  = useRef(new Animated.Value(0)).current;
  const [tipIndex, setTipIndex] = useState(0);

  // Données DB
  const { data: sessionStats }       = trpc.sessions.stats.useQuery(undefined, { enabled: isAuthenticated });
  const { data: dbMeditations = [] } = trpc.catalog.list.useQuery({ categorySlug: 'sleep', limit: 6 });
  const { data: allCategories = [] } = trpc.catalog.categories.useQuery();
  const todayMed = dbMeditations.length > 0 ? dbMeditations[new Date().getDate() % dbMeditations.length] : null;
  const { data: sleepStats }         = trpc.sleep.stats.useQuery(undefined, { enabled: isAuthenticated });
  const { data: sleepLogs = [] }     = trpc.sleep.list.useQuery({ limit: 7 }, { enabled: isAuthenticated });
  const { data: dbPrograms = [] }    = trpc.programs.list.useQuery();
  const { data: inProgressPrograms = [] } = trpc.programs.inProgress.useQuery(undefined, { enabled: isAuthenticated });

  // Modal saisie sommeil
  const [showSleepModal, setShowSleepModal] = useState(false);
  const [sleepBedtime,   setSleepBedtime]   = useState('22:30');
  const [sleepWakeTime,  setSleepWakeTime]  = useState('07:00');
  const [sleepQuality,   setSleepQuality]   = useState(3);
  const [sleepNotes,     setSleepNotes]     = useState('');
  const createSleepLog = trpc.sleep.create.useMutation({
    onSuccess: () => { setShowSleepModal(false); setSleepNotes(''); },
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLog = sleepLogs.find((l: any) => l.sleepDate === todayStr);

  function handleSaveSleep() {
    createSleepLog.mutate({ sleepDate: todayStr, bedtime: sleepBedtime, wakeTime: sleepWakeTime, quality: sleepQuality, notes: sleepNotes.trim() || undefined });
  }

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.loop(Animated.sequence([
        Animated.timing(moonAnim, { toValue: 10, duration: 3500, useNativeDriver: true }),
        Animated.timing(moonAnim, { toValue: 0,  duration: 3500, useNativeDriver: true }),
      ])),
    ]).start();
    const interval = setInterval(() => setTipIndex(i => (i + 1) % SLEEP_TIPS.length), 5000);
    return () => clearInterval(interval);
  }, []);

  const firstName    = profile?.firstName ?? 'vous';
  const streak       = sessionStats?.currentStreak ?? 0;
  const totalSessions = sessionStats?.totalSessions ?? 0;
  const totalMinutes  = sessionStats?.totalMinutes ?? 0;
  const currentTime   = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <ScreenContainer containerClassName={isDark ? 'bg-[#0D0B1A]' : 'bg-[#FAF7F2]'}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── HERO NOCTURNE ──────────────────────────────────────────────── */}
        <View style={styles.heroWrapper}>
          <LinearGradient
            colors={isDark ? ['#120F24', '#0D0B1A', '#0D0B1A'] : ['#F0EBE0', '#F0EBE0', '#FAF7F2']}
            style={styles.hero}
          >
            <StarField />

            {/* Lune animée */}
            <Animated.View style={[styles.moonContainer, { transform: [{ translateY: moonAnim }] }]}>
              <View style={styles.moonRing}>
                <Text style={styles.moonEmoji}>{moonEmoji}</Text>
              </View>
            </Animated.View>

            <Animated.View style={[styles.heroContent, { opacity: fadeAnim }]}>
              {/* Salutation */}
              <Text style={styles.heroGreeting}>
                {isNight ? '🌙' : '☀️'} {greeting}, {firstName}
              </Text>

              {/* Titre Cormorant Garamond */}
              <Text style={styles.heroTitle}>Votre sanctuaire{'\n'}du sommeil</Text>

              <Text style={styles.heroSubtitle}>
                Retrouvez un sommeil profond et réparateur grâce à des méditations guidées.
              </Text>

              {/* Pilule heure + phase lunaire */}
              <View style={styles.moonPill}>
                <View style={styles.moonDot} />
                <Text style={styles.moonPillText}>{currentTime} · {moonPhase}</Text>
              </View>
            </Animated.View>
          </LinearGradient>
        </View>

        {/* ── STATS ──────────────────────────────────────────────────────── */}
        <Animated.View style={[styles.statsRow, { opacity: fadeAnim }]}>
          {[
            { icon: '🔥', value: streak,        label: 'Jours suite' },
            { icon: '🧘', value: totalSessions,  label: 'Séances'    },
            { icon: '⏱',  value: totalMinutes,   label: 'Minutes'    },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={styles.statIcon}>{s.icon}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* ── DIVIDER ────────────────────────────────────────────────────── */}
        <View style={styles.divider} />

        {/* ── SUIVI DU SOMMEIL ───────────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>🛏 Suivi du sommeil</Text>
              <Text style={styles.sectionSub}>Enregistrez votre nuit</Text>
            </View>
            <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]} onPress={() => router.push('/sleep-tracker' as never)}>
              <Text style={styles.seeAll}>Voir tout</Text>
            </Pressable>
          </View>

          {/* Carte sommeil glassmorphisme */}
          <Pressable
            style={({ pressed }) => [styles.sleepCard, { opacity: pressed ? 0.88 : 1 }]}
            onPress={() => isAuthenticated ? setShowSleepModal(true) : router.push('/(auth)/signin' as never)}
          >
            <View style={styles.sleepCardLeft}>
              <View style={styles.sleepCardIcon}>
                <Text style={{ fontSize: 18 }}>{todayLog ? '✅' : '🌙'}</Text>
              </View>
              <View>
                <Text style={styles.sleepCardTitle}>{todayLog ? 'Nuit enregistrée' : 'Enregistrer cette nuit'}</Text>
                <Text style={styles.sleepCardSub}>
                  {todayLog ? `${todayLog.bedtime} → ${todayLog.wakeTime} · Qualité ${todayLog.quality}/5` : 'Coucher · Lever · Qualité'}
                </Text>
              </View>
            </View>
            <View style={styles.arrowBtn}>
              <Text style={styles.arrowBtnText}>›</Text>
            </View>
          </Pressable>

          {/* Mini graphique barres 7 jours */}
          {sleepLogs.length > 0 && (
            <View style={styles.sleepMiniChart}>
              <Text style={styles.sleepMiniChartTitle}>7 dernières nuits</Text>
              <View style={styles.sleepBars}>
                {Array.from({ length: 7 }, (_, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() - (6 - i));
                  const dateStr = d.toISOString().split('T')[0];
                  const log = sleepLogs.find((l: any) => l.sleepDate === dateStr);
                  const quality = log?.quality ?? 0;
                  const barH = quality > 0 ? (quality / 5) * 44 : 3;
                  const barColor = quality >= 4 ? '#4ADE80' : quality >= 3 ? GOLD : quality > 0 ? '#F97316' : GLASS_BORDER;
                  return (
                    <View key={dateStr} style={styles.sleepBarCol}>
                      <View style={[styles.sleepBar, { height: barH, backgroundColor: barColor }]} />
                      <Text style={styles.sleepBarLabel}>
                        {['D', 'L', 'M', 'M', 'J', 'V', 'S'][d.getDay()]}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </View>

        {/* ── MÉDITATION DU SOIR ─────────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>🌙 Méditation du soir</Text>
              <Text style={styles.sectionSub}>Recommandée pour ce soir</Text>
            </View>
            <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]} onPress={() => router.push('/explore' as never)}>
              <Text style={styles.seeAll}>Voir tout</Text>
            </Pressable>
          </View>

          {/* Carte méditation featured */}
          <Pressable
            style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
            onPress={() => todayMed ? router.push(`/meditation/${todayMed.slug}` as never) : router.push('/explore' as never)}
          >
            <LinearGradient
              colors={['#2D1A6E', '#1E1250', '#2A1060']}
              style={styles.featuredCard}
            >
              {/* Halo doré */}
              <View style={styles.featuredHalo} />
              <View style={styles.featuredLeft}>
                <Text style={styles.featuredMoon}>
                  {allCategories.find((c: any) => c.slug === todayMed?.categorySlug)?.emoji ?? '🌙'}
                </Text>
                <View>
                  <Text style={styles.featuredTag}>Méditation du soir</Text>
                  <Text style={styles.featuredTitle}>{todayMed?.title ?? 'Voyage Nocturne'}</Text>
                  <Text style={styles.featuredMeta}>
                    {todayMed ? `${Math.round(todayMed.audioDurationSeconds / 60)} min` : '15 min'} · {todayMed?.instructor ?? 'Sommeil profond'}
                  </Text>
                </View>
              </View>
              <View style={styles.playBtn}>
                <Text style={styles.playBtnIcon}>▶</Text>
              </View>
            </LinearGradient>
          </Pressable>

          {/* Autres méditations */}
          {dbMeditations.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingTop: 10, paddingRight: 16 }}>
              {dbMeditations.filter((m: any) => m.id !== todayMed?.id).slice(0, 5).map((med: any, idx: number) => {
                const cat = allCategories.find((c: any) => c.slug === med.categorySlug);
                return (
                  <StaggeredItem key={med.id} index={idx} staggerDelay={70} translateY={14}>
                    <Pressable
                      style={({ pressed }) => [styles.miniMedCard, { opacity: pressed ? 0.85 : 1 }]}
                      onPress={() => router.push(`/meditation/${med.slug}` as never)}
                    >
                      <View style={[styles.miniMedCover, { backgroundColor: med.coverColor ?? INDIGO_MID }]}>
                        <Text style={styles.miniMedEmoji}>{cat?.emoji ?? '🧘'}</Text>
                      </View>
                      <Text style={styles.miniMedTitle} numberOfLines={2}>{med.title}</Text>
                      <Text style={styles.miniMedDur}>{Math.round(med.audioDurationSeconds / 60)} min</Text>
                    </Pressable>
                  </StaggeredItem>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* ── ACCÈS RAPIDES (mini cards) ─────────────────────────────────── */}
        <View style={styles.miniCardsRow}>
          {[
            { emoji: '🌙', label: 'Relaxation',  route: '/explore' },
            { emoji: '🌬', label: 'Respiration', route: '/breathing' },
            { emoji: '⭐', label: 'Favoris',     route: '/explore' },
            { emoji: '📖', label: 'Journal',     route: '/(tabs)/journal' },
          ].map((item) => (
            <Pressable
              key={item.route + item.label}
              style={({ pressed }) => [styles.miniCard, { opacity: pressed ? 0.8 : 1 }]}
              onPress={() => router.push(item.route as never)}
            >
              <Text style={styles.miniCardIcon}>{item.emoji}</Text>
              <Text style={styles.miniCardLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* ── PROGRAMME EN COURS ─────────────────────────────────────────── */}
        {isAuthenticated && inProgressPrograms.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>▶️ Continuer</Text>
            {inProgressPrograms.slice(0, 1).map((prog: any) => (
              <Pressable
                key={prog.id}
                style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}
                onPress={() => router.push(`/program-day/${prog.programSlug}/${prog.nextDay}` as never)}
              >
                <LinearGradient
                  colors={[prog.programCoverColor ?? INDIGO_MID, prog.programCoverColor2 ?? '#312E81']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={styles.inProgressCard}
                >
                  <View style={styles.inProgressLeft}>
                    <Text style={styles.inProgressEmoji}>{prog.programEmoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inProgressLabel}>PROGRAMME EN COURS</Text>
                      <Text style={styles.inProgressTitle} numberOfLines={1}>{prog.programTitle}</Text>
                      <Text style={styles.inProgressDay}>Jour {prog.nextDay} / {prog.programDurationDays}</Text>
                    </View>
                  </View>
                  <View style={styles.inProgressRight}>
                    <Text style={styles.inProgressPct}>{prog.progressPct}%</Text>
                    <View style={styles.inProgressBarBg}>
                      <View style={[styles.inProgressBarFill, { width: `${prog.progressPct}%` as any }]} />
                    </View>
                    <Text style={styles.inProgressCta}>Reprendre →</Text>
                  </View>
                </LinearGradient>
              </Pressable>
            ))}
          </View>
        )}

        {/* ── PROGRAMMES ─────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>📅 Programmes</Text>
              <Text style={styles.sectionSub}>Du 2 au 30 jours pour transformer votre sommeil</Text>
            </View>
            <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]} onPress={() => router.push('/programs' as never)}>
              <Text style={styles.seeAll}>Voir tout</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 16 }}>
            {(dbPrograms.length > 0 ? dbPrograms : [
              { slug: 'initiation-sommeil',    emoji: '🌙', title: 'Initiation',         durationDays: 2,  coverColor: '#1E1B4B', coverColor2: '#312E81', description: 'Découvrez les bases' },
              { slug: 'retrouver-sommeil',     emoji: '🌛', title: 'Retrouver le sommeil', durationDays: 7, coverColor: '#1E3A5F', coverColor2: '#1E40AF', description: 'Anti-insomnie' },
              { slug: 'transformation-sommeil', emoji: '✨', title: 'Transformation',     durationDays: 21, coverColor: '#2D1B69', coverColor2: '#5B21B6', description: 'Restructuration complète' },
              { slug: 'maitre-sommeil',        emoji: '🌟', title: 'Maître du sommeil',  durationDays: 30, coverColor: '#1A0533', coverColor2: '#7C3AED', description: 'Programme expert' },
            ]).map((prog: any) => (
              <Pressable
                key={prog.slug}
                style={({ pressed }) => [styles.programCard, { opacity: pressed ? 0.9 : 1 }]}
                onPress={() => router.push(`/program/${prog.slug}` as never)}
              >
                <LinearGradient colors={[prog.coverColor ?? INDIGO_MID, prog.coverColor2 ?? '#312E81']} style={styles.programGradient}>
                  <Text style={styles.programEmoji}>{prog.emoji}</Text>
                  <View style={styles.programDaysBadge}>
                    <Text style={styles.programDaysText}>{prog.durationDays}j</Text>
                  </View>
                  <Text style={styles.programTitle}>{prog.title}</Text>
                  <Text style={styles.programDesc}>{prog.description}</Text>
                  <View style={styles.programStartBtn}>
                    <Text style={styles.programStartText}>Commencer →</Text>
                  </View>
                </LinearGradient>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* ── PROBLÉMATIQUES ─────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔍 Votre problématique</Text>
          <Text style={styles.sectionSub}>Choisissez ce qui vous concerne</Text>
          <View style={styles.issuesGrid}>
            {SLEEP_ISSUES.map((issue) => (
              <Pressable
                key={issue.id}
                style={({ pressed }) => [styles.issueCard, { opacity: pressed ? 0.85 : 1 }]}
                onPress={() => router.push('/programs' as never)}
              >
                <LinearGradient colors={[`${issue.color}30`, `${issue.color}10`]} style={styles.issueGradient}>
                  <Text style={styles.issueEmoji}>{issue.emoji}</Text>
                  <Text style={styles.issueLabel}>{issue.label}</Text>
                  <Text style={styles.issueDesc}>{issue.desc}</Text>
                </LinearGradient>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── CONSEIL DU SOIR ────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Conseil du soir</Text>
          <Animated.View style={[styles.tipCard, { opacity: fadeAnim }]}>
            <LinearGradient colors={[`${T.gold}18`, `${T.gold}06`]} style={styles.tipGradient}>
              <Text style={styles.tipEmoji}>{SLEEP_TIPS[tipIndex].emoji}</Text>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>{SLEEP_TIPS[tipIndex].title}</Text>
                <Text style={styles.tipDesc}>{SLEEP_TIPS[tipIndex].desc}</Text>
              </View>
            </LinearGradient>
            <View style={styles.tipDots}>
              {SLEEP_TIPS.map((_, i) => (
                <View key={i} style={[styles.tipDot, { backgroundColor: i === tipIndex ? GOLD : GLASS_BORDER }]} />
              ))}
            </View>
          </Animated.View>
        </View>

        {/* ── SCIENCE DU SOMMEIL ─────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔬 Science du sommeil</Text>
          <Text style={styles.sectionSub}>Comprendre pour mieux dormir</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 16 }}>
            {SCIENCE_CARDS.map((card, i) => (
              <View key={i} style={[styles.scienceCard, { backgroundColor: card.color }]}>
                <Text style={styles.scienceEmoji}>{card.emoji}</Text>
                <Text style={styles.scienceTitle}>{card.title}</Text>
                <Text style={styles.scienceDesc}>{card.desc}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ── CITATION NOCTURNE ──────────────────────────────────────────── */}
        <View style={styles.section}>
          <LinearGradient colors={isDark ? [INDIGO_DEEP, '#0C0828'] : ['#EDE8DC', '#E8E0FF']} style={styles.quoteCard}>
            <Text style={styles.quoteStars}>✦  ✧  ✦</Text>
            <Text style={styles.quoteText}>"{quote.text}"</Text>
            <Text style={styles.quoteAuthor}>— {quote.author}</Text>
          </LinearGradient>
        </View>

        {/* ── CTA CHECK-IN ───────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]} onPress={() => router.push('/checkin' as never)}>
            <LinearGradient colors={isDark ? [INDIGO_MID, '#4F46E5'] : ['#8B5CF6', '#7C3AED']} style={styles.ctaCard}>
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

      {/* ── MODAL SAISIE SOMMEIL ───────────────────────────────────────────── */}
      <Modal visible={showSleepModal} transparent animationType="slide" onRequestClose={() => setShowSleepModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowSleepModal(false)}>
          <Pressable style={styles.modalSheet} onPress={e => e.stopPropagation()}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>🌙 Votre nuit</Text>
            <Text style={styles.modalSub}>Enregistrez votre sommeil de cette nuit</Text>

            <Text style={styles.modalLabel}>🛌 Heure de coucher</Text>
            <TextInput style={styles.modalInput} value={sleepBedtime} onChangeText={setSleepBedtime} placeholder="ex. 22:30" placeholderTextColor="rgba(255,255,255,0.35)" returnKeyType="done" />

            <Text style={styles.modalLabel}>☀️ Heure de lever</Text>
            <TextInput style={styles.modalInput} value={sleepWakeTime} onChangeText={setSleepWakeTime} placeholder="ex. 07:00" placeholderTextColor="rgba(255,255,255,0.35)" returnKeyType="done" />

            <Text style={styles.modalLabel}>⭐ Qualité du sommeil</Text>
            <View style={styles.qualityRow}>
              {[1, 2, 3, 4, 5].map(q => (
                <Pressable key={q} style={[styles.qualityBtn, { backgroundColor: sleepQuality === q ? GOLD : 'rgba(255,255,255,0.08)', borderColor: sleepQuality === q ? GOLD : GLASS_BORDER }]} onPress={() => setSleepQuality(q)}>
                  <Text style={styles.qualityBtnEmoji}>{['😫', '😕', '😐', '🙂', '😄'][q - 1]}</Text>
                  <Text style={[styles.qualityBtnNum, { color: sleepQuality === q ? NIGHT_BG : WHITE_SOFT }]}>{q}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.modalLabel}>📝 Notes (rêves, pensées...)</Text>
            <TextInput style={[styles.modalInput, styles.modalInputNotes]} value={sleepNotes} onChangeText={setSleepNotes} placeholder="Notez vos rêves, vos pensées du soir..." placeholderTextColor="rgba(255,255,255,0.35)" multiline numberOfLines={3} textAlignVertical="top" returnKeyType="default" />

            <Pressable style={({ pressed }) => [styles.modalSaveBtn, { opacity: pressed ? 0.85 : 1 }]} onPress={handleSaveSleep}>
              <Text style={styles.modalSaveBtnText}>{createSleepLog.isPending ? 'Enregistrement...' : 'Enregistrer ma nuit 🌙'}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}

// ─── Styles dynamiques (recalculés selon le thème) ─────────────────────────
function makeStyles(isDark: boolean) {
  const CARD   = isDark ? '#2A2540' : '#FFFFFF';
  const CARD2  = isDark ? '#201C38' : '#F5F0E8';
  const TEXT1  = isDark ? '#F0EBE0' : '#1C1410';
  const TEXT2  = isDark ? 'rgba(240,235,224,0.65)' : 'rgba(60,40,20,0.65)';
  const TEXT3  = isDark ? 'rgba(240,235,224,0.70)' : 'rgba(60,40,20,0.70)';
  const GOLD_C = isDark ? '#C8A96E' : '#8B6914';
  const BORD   = isDark ? 'rgba(200,169,110,0.40)' : 'rgba(139,105,20,0.30)';
  const BORD2  = isDark ? 'rgba(200,169,110,0.30)' : 'rgba(139,105,20,0.20)';
  const NIGHT  = isDark ? '#0D0B1A' : '#FAF7F2';
  return StyleSheet.create({
  // Hero SomnioPax v3
  heroWrapper: { overflow: 'hidden' },
  hero: { paddingTop: 28, paddingBottom: 40, paddingHorizontal: 24, position: 'relative', minHeight: 320 },
  moonContainer: { alignItems: 'center', marginBottom: 18 },
  moonRing: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: isDark ? 'rgba(201,150,62,0.08)' : 'rgba(139,105,20,0.10)',
    borderWidth: 1, borderColor: isDark ? 'rgba(201,150,62,0.30)' : 'rgba(139,105,20,0.35)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: GOLD_C, shadowRadius: 16, shadowOpacity: 0.35, shadowOffset: { width: 0, height: 0 },
  },
  moonEmoji: { fontSize: 38 },
  heroContent: { alignItems: 'center' },
  heroGreeting: { fontSize: 10.5, letterSpacing: 1.8, textTransform: 'uppercase', color: GOLD_C, marginBottom: 12, fontWeight: '500' },
  heroTitle: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 32, color: TEXT1, textAlign: 'center', lineHeight: 38, marginBottom: 12, letterSpacing: -0.3 },
  heroSubtitle: { fontFamily: 'PlayfairDisplay-Regular', fontSize: 13, color: TEXT3, textAlign: 'center', lineHeight: 21, paddingHorizontal: 16, marginBottom: 20 },
  moonPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: CARD, borderWidth: 1, borderColor: BORD, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 7 },
  moonDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: GOLD_C, shadowColor: GOLD_C, shadowRadius: 8, shadowOpacity: 1 },
  moonPillText: { color: TEXT2, fontSize: 10.5, letterSpacing: 0.5 },

  // Stats SomnioPax v3 — anneaux SVG style
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 18, marginTop: 18, marginBottom: 4 },
  statCard: { flex: 1, backgroundColor: CARD, borderWidth: 1, borderColor: BORD, borderRadius: 20, paddingVertical: 16, paddingHorizontal: 6, alignItems: 'center', position: 'relative', overflow: 'hidden' },
  statIcon: { fontSize: 18, marginBottom: 4 },
  statValue: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 24, color: TEXT1, lineHeight: 26, marginBottom: 4 },
  statLabel: { fontSize: 9, letterSpacing: 1.2, textTransform: 'uppercase', color: TEXT2 },

  // Divider
  divider: { height: 0.5, backgroundColor: BORD2, marginHorizontal: 24, marginVertical: 8 },

  // Sections SomnioPax v3
  section: { marginTop: 24, paddingHorizontal: 18 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  sectionTitle: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 19, color: TEXT1, marginBottom: 3 },
  sectionSub: { fontSize: 10.5, color: TEXT2, letterSpacing: 0.2 },
  seeAll: { fontSize: 10, color: GOLD_C, letterSpacing: 0.6, marginTop: 4 },

  // Carte sommeil
  sleepCard: { backgroundColor: CARD, borderWidth: 1, borderColor: BORD, borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, shadowColor: isDark ? '#000' : '#1C1410', shadowOffset: { width: 0, height: 3 }, shadowOpacity: isDark ? 0.25 : 0.10, shadowRadius: isDark ? 10 : 8, elevation: isDark ? 6 : 4 },
  sleepCardShadow: { shadowColor: isDark ? '#000' : '#1C1410', shadowOffset: { width: 0, height: 3 }, shadowOpacity: isDark ? 0.25 : 0.10, shadowRadius: isDark ? 10 : 8, elevation: isDark ? 6 : 4 },
  sleepCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  sleepCardIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: CARD2, borderWidth: 1, borderColor: BORD2, alignItems: 'center', justifyContent: 'center' },
  sleepCardTitle: { fontSize: 13, fontWeight: '500', color: TEXT1, marginBottom: 2 },
  sleepCardSub: { fontSize: 10.5, color: TEXT2, letterSpacing: 0.3 },
  arrowBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: isDark ? 'rgba(200,169,110,0.20)' : 'rgba(139,105,20,0.15)', borderWidth: 0.5, borderColor: BORD2, alignItems: 'center', justifyContent: 'center' },
  arrowBtnText: { color: GOLD_C, fontSize: 18, lineHeight: 20 },

  // Mini graphique sommeil
  sleepMiniChart: { marginTop: 10, backgroundColor: CARD, borderWidth: 1, borderColor: BORD, borderRadius: 16, padding: 14, shadowColor: isDark ? '#000' : '#1C1410', shadowOffset: { width: 0, height: 1 }, shadowOpacity: isDark ? 0.18 : 0.07, shadowRadius: isDark ? 5 : 4, elevation: isDark ? 3 : 2 },
  sleepMiniChartTitle: { fontSize: 11, color: TEXT3, marginBottom: 10, letterSpacing: 0.3 },
  sleepBars: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 52 },
  sleepBarCol: { alignItems: 'center', flex: 1, gap: 4 },
  sleepBar: { width: 12, borderRadius: 6, minHeight: 3 },
  sleepBarLabel: { fontSize: 9, color: TEXT3 },

  // Méditation featured SomnioPax v3
  featuredCard: { borderRadius: 24, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', position: 'relative', overflow: 'hidden', borderWidth: 1, borderColor: BORD },
  featuredHalo: { position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: 70, backgroundColor: isDark ? 'rgba(200,169,110,0.20)' : 'rgba(139,105,20,0.12)' },
  featuredLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1, zIndex: 1 },
  featuredMoon: { fontSize: 32, textShadowColor: isDark ? 'rgba(201,150,62,0.5)' : 'rgba(139,105,20,0.4)', textShadowRadius: 12, textShadowOffset: { width: 0, height: 0 } },
  featuredTag: { fontSize: 8.5, letterSpacing: 1.6, textTransform: 'uppercase', color: GOLD_C, marginBottom: 4, opacity: 0.85 },
  featuredTitle: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 20, color: '#FFFFFF', lineHeight: 23, marginBottom: 3 },
  featuredMeta: { fontSize: 10.5, color: 'rgba(255,255,255,0.70)', letterSpacing: 0.3 },
  playBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: GOLD_C, alignItems: 'center', justifyContent: 'center', zIndex: 1, shadowColor: GOLD_C, shadowRadius: 16, shadowOpacity: 0.45, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
  playBtnIcon: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', paddingLeft: 2 },

  // Mini méditations
  miniMedCard: { borderRadius: 14, overflow: 'hidden', width: 128, backgroundColor: CARD, borderWidth: 1, borderColor: BORD, shadowColor: isDark ? '#000' : '#1C1410', shadowOffset: { width: 0, height: 1 }, shadowOpacity: isDark ? 0.18 : 0.07, shadowRadius: isDark ? 5 : 4, elevation: isDark ? 3 : 2 },
  miniMedCover: { height: 70, justifyContent: 'center', alignItems: 'center' },
  miniMedEmoji: { fontSize: 26 },
  miniMedTitle: { fontSize: 11, fontWeight: '600', color: TEXT1, lineHeight: 15, margin: 8, marginBottom: 2 },
  miniMedDur: { fontSize: 10, color: TEXT2, marginHorizontal: 8, marginBottom: 8 },

  // Mini cards accès rapide
  miniCardsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 18, marginTop: 22 },
  miniCard: { flex: 1, backgroundColor: CARD, borderWidth: 1, borderColor: BORD, borderRadius: 14, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', gap: 6, shadowColor: isDark ? '#000' : '#1C1410', shadowOffset: { width: 0, height: 1 }, shadowOpacity: isDark ? 0.18 : 0.07, shadowRadius: isDark ? 5 : 4, elevation: isDark ? 3 : 2 },
  miniCardIcon: { fontSize: 22 },
  miniCardLabel: { fontSize: 9, letterSpacing: 0.8, textTransform: 'uppercase', color: TEXT2, textAlign: 'center' },

  // Programme en cours
  inProgressCard: { borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  inProgressLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  inProgressEmoji: { fontSize: 36 },
  inProgressLabel: { color: 'rgba(255,255,255,0.70)', fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  inProgressTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', marginBottom: 2 },
  inProgressDay: { color: 'rgba(255,255,255,0.75)', fontSize: 11 },
  inProgressRight: { alignItems: 'flex-end', gap: 6, minWidth: 80 },
  inProgressPct: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  inProgressBarBg: { width: 80, height: 5, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 3, overflow: 'hidden' },
  inProgressBarFill: { height: 5, backgroundColor: '#4ADE80', borderRadius: 3 },
  inProgressCta: { color: '#FFE4A0', fontSize: 11, fontWeight: '600' },

  // Programmes SomnioPax v3
  programCard: { width: 160 },
  programGradient: { borderRadius: 22, padding: 16, height: 205, justifyContent: 'space-between' },
  programEmoji: { fontSize: 30 },
  programDaysBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  programDaysText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  programTitle: { fontFamily: 'PlayfairDisplay-Medium', color: '#FFFFFF', fontSize: 17, lineHeight: 21 },
  programDesc: { color: 'rgba(255,255,255,0.70)', fontSize: 11 },
  programStartBtn: { backgroundColor: 'rgba(255,255,255,0.20)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start', borderWidth: 1, borderColor: 'rgba(255,255,255,0.30)' },
  programStartText: { color: '#FFE4A0', fontSize: 11, fontWeight: '600' },

  // Problématiques
  issuesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  issueCard: { width: (SCREEN_WIDTH - 36 - 10) / 2, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: BORD },
  issueGradient: { padding: 16 },
  issueEmoji: { fontSize: 26, marginBottom: 8 },
  issueLabel: { fontSize: 13, fontWeight: '600', color: isDark ? '#F0EBE0' : '#FFFFFF', marginBottom: 3 },
  issueDesc: { fontSize: 11, color: isDark ? 'rgba(240,235,224,0.65)' : 'rgba(255,255,255,0.75)', lineHeight: 16 },

  // Conseil du soir
  tipCard: { borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: BORD, backgroundColor: CARD, shadowColor: isDark ? '#000' : '#1C1410', shadowOffset: { width: 0, height: 3 }, shadowOpacity: isDark ? 0.25 : 0.10, shadowRadius: isDark ? 10 : 8, elevation: isDark ? 6 : 4 },
  tipGradient: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18 },
  tipEmoji: { fontSize: 34 },
  tipContent: { flex: 1 },
  tipTitle: { fontSize: 14, fontWeight: '600', color: TEXT1, marginBottom: 4 },
  tipDesc: { fontSize: 12, color: TEXT2, lineHeight: 18 },
  tipDots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingBottom: 12 },
  tipDot: { width: 5, height: 5, borderRadius: 2.5 },

  // Science SomnioPax v3 — toujours fond sombre (cartes colorées)
  scienceCard: { width: 200, borderRadius: 22, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  scienceEmoji: { fontSize: 30, marginBottom: 10 },
  scienceTitle: { fontFamily: 'PlayfairDisplay-Medium', color: '#FFFFFF', fontSize: 16, marginBottom: 6 },
  scienceDesc: { color: 'rgba(255,255,255,0.70)', fontSize: 12, lineHeight: 18 },

  // Citation SomnioPax v3
  quoteCard: { borderRadius: 22, padding: 30, alignItems: 'center' },
  quoteStars: { color: GOLD_C, fontSize: 13, letterSpacing: 10, marginBottom: 18, opacity: 0.65 },
  quoteText: { fontFamily: 'PlayfairDisplay-Italic', color: TEXT1, fontSize: 19, lineHeight: 28, textAlign: 'center', marginBottom: 14 },
  quoteAuthor: { color: TEXT2, fontSize: 12, letterSpacing: 0.5 },

  // CTA SomnioPax v3 — toujours fond coloré
  ctaCard: { borderRadius: 22, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 14 },
  ctaEmoji: { fontSize: 34 },
  ctaContent: { flex: 1 },
  ctaTitle: { fontFamily: 'PlayfairDisplay-Medium', color: '#FFFFFF', fontSize: 18, marginBottom: 4, lineHeight: 23 },
  ctaSub: { color: 'rgba(255,255,255,0.70)', fontSize: 12 },

  // Modal sommeil SomnioPax v3
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: isDark ? '#201C38' : '#FFFFFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 40, borderTopWidth: 1, borderColor: BORD },
  modalHandle: { width: 40, height: 3, borderRadius: 2, backgroundColor: BORD, alignSelf: 'center', marginBottom: 22 },
  modalTitle: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 24, color: TEXT1, marginBottom: 6 },
  modalSub: { fontSize: 13, color: TEXT2, marginBottom: 24 },
  modalLabel: { fontSize: 12, fontWeight: '600', color: TEXT3, marginBottom: 8, letterSpacing: 0.3 },
  modalInput: { backgroundColor: CARD2, borderWidth: 1, borderColor: BORD, borderRadius: 12, padding: 14, fontSize: 16, color: TEXT1, marginBottom: 16 },
  modalInputNotes: { minHeight: 80, paddingTop: 12 },
  qualityRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  qualityBtn: { flex: 1, borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 0.5 },
  qualityBtnEmoji: { fontSize: 18, marginBottom: 3 },
  qualityBtnNum: { fontSize: 12, fontWeight: '700' },
  modalSaveBtn: { backgroundColor: GOLD_C, borderRadius: 16, padding: 18, alignItems: 'center' },
  modalSaveBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', letterSpacing: 0.3 },
  });
}
