import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  Share,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ScreenContainer } from "@/components/screen-container";
import { StarField } from "@/components/star-field";
import { trpc } from "@/lib/trpc";
import { useThemeContext } from "@/lib/theme-provider";

// ─── Confettis légers (cercles animés) ──────────────────────────────────────
const CONFETTI_COLORS = ["#A78BFA", "#F9A8D4", "#FCD34D", "#6EE7B7", "#93C5FD", "#FCA5A5"];
const CONFETTI_COUNT = 18;

function ConfettiPiece({ index }: { index: number }) {
  const translateY = useRef(new Animated.Value(-60)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  const left = (index / CONFETTI_COUNT) * 100;
  const delay = index * 80;
  const duration = 1400 + Math.random() * 600;
  const xDrift = (Math.random() - 0.5) * 60;

  useEffect(() => {
    const anim = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 340, duration, useNativeDriver: true }),
        Animated.timing(translateX, { toValue: xDrift, duration, useNativeDriver: true }),
        Animated.timing(rotate, { toValue: 1, duration, useNativeDriver: true }),
      ]),
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]);
    anim.start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay + duration + 400),
        Animated.parallel([
          Animated.timing(translateY, { toValue: -60, duration: 0, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
        anim,
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <Animated.View
      style={[
        confettiStyles.piece,
        {
          left: `${left}%`,
          backgroundColor: color,
          opacity,
          transform: [{ translateY }, { translateX }, { rotate: spin }],
        },
      ]}
    />
  );
}

const confettiStyles = StyleSheet.create({
  piece: {
    position: "absolute",
    top: 0,
    width: 10,
    height: 10,
    borderRadius: 2,
  },
});

// ─── Étoile animée ────────────────────────────────────────────────────────────
function StarBurst() {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View style={[starStyles.container, { opacity, transform: [{ scale }] }]}>
      <Text style={starStyles.emoji}>🏆</Text>
    </Animated.View>
  );
}

const starStyles = StyleSheet.create({
  container: { alignItems: "center", marginBottom: 8 },
  emoji: { fontSize: 80 },
});

// ─── Carte statistique ────────────────────────────────────────────────────────
function StatCard({ emoji, value, label }: { emoji: string; value: string; label: string }) {
  const scale = useRef(new Animated.Value(0.7)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(600),
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, friction: 5, tension: 100, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View style={[statStyles.card, { opacity, transform: [{ scale }] }]}>
      <Text style={statStyles.emoji}>{emoji}</Text>
      <Text style={statStyles.value}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </Animated.View>
  );
}

const statStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.25)",
  },
  emoji: { fontSize: 28, marginBottom: 6 },
  value: { fontSize: 22, fontWeight: "800", color: "#E9D5FF", marginBottom: 2 },
  label: { fontSize: 11, color: "rgba(255,255,255,0.5)", textAlign: "center" },
});

// ─── Écran principal ──────────────────────────────────────────────────────────
export default function ProgramCompleteScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { isDark } = useThemeContext();

  // Couleurs dynamiques
  const GOLD    = isDark ? '#C9A84C' : '#A0722A';
  const FG      = isDark ? '#EDE9FF' : '#1E1A3C';
  const LAV     = isDark ? 'rgba(184,174,255,0.65)' : 'rgba(100,80,180,0.75)';
  const LAV_DIM = isDark ? 'rgba(184,174,255,0.40)' : 'rgba(100,80,180,0.50)';
  const BORDER  = isDark ? 'rgba(180,160,255,0.14)' : 'rgba(120,100,200,0.18)';
  const SURFACE = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.70)';
  const SUCCESS = isDark ? 'rgba(74,222,128,0.8)' : 'rgba(22,163,74,0.9)';

  const { data: program } = trpc.programs.get.useQuery(
    { slug: slug ?? "" },
    { enabled: !!slug }
  );
  const { data: progress } = trpc.programs.progress.useQuery(
    { programSlug: slug ?? "" },
    { enabled: !!slug }
  );
  const { data: allPrograms } = trpc.programs.list.useQuery();

  // Animations d'entrée
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslate = useRef(new Animated.Value(30)).current;
  const messageOpacity = useRef(new Animated.Value(0)).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (Platform.OS !== "web") {
      try {
        const Haptics = require("expo-haptics");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (_) {}
    }

    Animated.sequence([
      Animated.delay(400),
      Animated.parallel([
        Animated.timing(headerOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(headerTranslate, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.delay(200),
      Animated.timing(messageOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.delay(200),
      Animated.timing(buttonsOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  // Calcul des statistiques
  const completedDays: number[] = progress ? JSON.parse(progress.completedDays || "[]") : [];
  const totalDays = program?.durationDays ?? completedDays.length;
  const startedAt = progress?.startedAt ? new Date(progress.startedAt) : null;
  const completedAt = progress?.completedAt ? new Date(progress.completedAt) : new Date();
  const daysElapsed = startedAt
    ? Math.ceil((completedAt.getTime() - startedAt.getTime()) / (1000 * 60 * 60 * 24))
    : totalDays;
  const totalMinutes = (program?.days ?? []).reduce(
    (sum, d) => sum + (d.estimatedMinutes ?? 15),
    0
  );
  const totalHours = Math.round(totalMinutes / 60 * 10) / 10;

  // Programme suivant suggéré
  const nextProgram = (allPrograms ?? []).find(
    (p) => p.durationDays > totalDays && p.slug !== slug
  );

  const handleShare = async () => {
    try {
      await Share.share({
        message: `🌙 J'ai terminé le programme "${program?.title ?? slug}" sur Yoya Wellness ! ${totalDays} jours de transformation du sommeil. #YoyaWellness #Sommeil`,
      });
    } catch (_) {}
  };

  return (
    <ScreenContainer containerClassName={isDark ? 'bg-[#03020F]' : 'bg-[#F0EDF8]'}>
      <StarField />
      {/* Confettis */}
      <View style={styles.confettiContainer} pointerEvents="none">
        {Array.from({ length: CONFETTI_COUNT }).map((_, i) => (
          <ConfettiPiece key={i} index={i} />
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ── Hero ── */}
        <LinearGradient
          colors={[program?.coverColor ?? "#1E1B4B", program?.coverColor2 ?? "#312E81", "#0D0B1E"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.hero}
        >
          <StarBurst />

          <Animated.View
            style={{
              opacity: headerOpacity,
              transform: [{ translateY: headerTranslate }],
              alignItems: "center",
            }}
          >
            <Text style={[styles.congratsLabel, { color: '#F9D87A' }]}>FÉLICITATIONS !</Text>
            <Text style={styles.heroTitle}>Programme terminé</Text>
            <Text style={[styles.programName, { color: 'rgba(255,255,255,0.80)' }]}>{program?.title ?? slug}</Text>
            <View style={styles.completedBadge}>
              <Text style={styles.completedBadgeText}>
                ✅ {totalDays} jour{totalDays > 1 ? "s" : ""} complété{totalDays > 1 ? "s" : ""}
              </Text>
            </View>
          </Animated.View>
        </LinearGradient>

        {/* ── Message personnalisé ── */}
        <Animated.View style={[styles.messageCard, { opacity: messageOpacity, backgroundColor: SURFACE, borderColor: BORDER }]}>
          <Text style={[styles.messageTitle, { color: FG }]}>Votre transformation</Text>
          <Text style={[styles.messageText, { color: LAV }]}>
            Vous avez accompli quelque chose d'extraordinaire. En complétant ce programme, vous avez
            posé les fondations d'un sommeil profond et réparateur. Votre cerveau a intégré de
            nouvelles habitudes qui vont continuer à travailler pour vous chaque nuit.
          </Text>
          <Text style={[styles.messageQuote, { color: GOLD, borderLeftColor: GOLD }]}>
            "Le succès n'est pas final, l'échec n'est pas fatal : c'est le courage de continuer qui compte."
          </Text>
        </Animated.View>

        {/* ── Statistiques ── */}
        <Animated.View style={[styles.statsSection, { opacity: messageOpacity }]}>
          <Text style={[styles.statsTitle, { color: FG }]}>📊 Votre parcours en chiffres</Text>
          <View style={styles.statsGrid}>
            <StatCard
              emoji="📅"
              value={`${totalDays}`}
              label="Jours complétés"
            />
            <StatCard
              emoji="⏱"
              value={`${totalHours}h`}
              label="De méditation"
            />
          </View>
          <View style={[styles.statsGrid, { marginTop: 10 }]}>
            <StatCard
              emoji="🗓"
              value={`${daysElapsed}`}
              label="Jours de pratique"
            />
            <StatCard
              emoji="🌙"
              value={`${Math.round((completedDays.length / totalDays) * 100)}%`}
              label="Taux de complétion"
            />
          </View>
        </Animated.View>

        {/* ── Badges obtenus ── */}
        <Animated.View style={[styles.badgesSection, { opacity: messageOpacity, backgroundColor: SURFACE, borderColor: BORDER }]}>
          <Text style={[styles.badgesTitle, { color: FG }]}>🏅 Badges obtenus</Text>
          <View style={styles.badgesRow}>
            <View style={styles.badgeItem}>
              <Text style={styles.badgeEmoji}>🌙</Text>
              <Text style={[styles.badgeLabel, { color: LAV_DIM }]}>Dormeur{"\n"}conscient</Text>
            </View>
            <View style={styles.badgeItem}>
              <Text style={styles.badgeEmoji}>🧘</Text>
              <Text style={[styles.badgeLabel, { color: LAV_DIM }]}>Méditant{"\n"}régulier</Text>
            </View>
            <View style={styles.badgeItem}>
              <Text style={styles.badgeEmoji}>💪</Text>
              <Text style={[styles.badgeLabel, { color: LAV_DIM }]}>Persévérant{"\n"}exemplaire</Text>
            </View>
            {totalDays >= 21 && (
              <View style={styles.badgeItem}>
                <Text style={styles.badgeEmoji}>⭐</Text>
                <Text style={[styles.badgeLabel, { color: LAV_DIM }]}>Maître du{"\n"}sommeil</Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* ── Programme suivant ── */}
        {nextProgram && (
          <Animated.View style={[styles.nextSection, { opacity: buttonsOpacity }]}>
            <Text style={[styles.nextTitle, { color: FG }]}>🚀 Continuez votre progression</Text>
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => router.replace(`/program/${nextProgram.slug}` as never)}
            >
              <LinearGradient
                colors={[nextProgram.coverColor ?? "#1E1B4B", nextProgram.coverColor2 ?? "#312E81"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.nextCard}
              >
                <Text style={styles.nextEmoji}>{nextProgram.emoji ?? "🌟"}</Text>
                <View style={styles.nextInfo}>
                  <Text style={styles.nextLabel}>Programme suivant recommandé</Text>
                  <Text style={styles.nextName}>{nextProgram.title}</Text>
                  <Text style={styles.nextDays}>📅 {nextProgram.durationDays} jours</Text>
                </View>
                <Text style={styles.nextArrow}>→</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* ── Boutons d'action ── */}
        <Animated.View style={[styles.actions, { opacity: buttonsOpacity }]}>
          <TouchableOpacity
            style={[styles.shareBtn, { backgroundColor: SURFACE, borderColor: BORDER }]}
            onPress={handleShare}
            activeOpacity={0.85}
          >
            <Text style={[styles.shareBtnText, { color: LAV }]}>🔗 Partager ma réussite</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeBtn}
            onPress={() => router.replace("/(tabs)" as never)}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={["#7C3AED", "#A855F7"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.homeBtnGradient}
            >
              <Text style={styles.homeBtnText}>🏠 Retour à l'accueil</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.programsBtn}
            onPress={() => router.replace("/programs" as never)}
            activeOpacity={0.85}
          >
            <Text style={[styles.programsBtnText, { color: LAV_DIM }]}>Voir tous les programmes →</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 400,
    zIndex: 10,
    overflow: 'hidden',
  },
  scroll: { paddingBottom: 60 },

  // Hero
  hero: {
    paddingTop: 48,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  congratsLabel: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 8,
  },
  heroTitle: {
    fontFamily: 'PlayfairDisplay-Medium',
    fontSize: 28,
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  programName: {
    fontFamily: 'PlayfairDisplay-Italic',
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  completedBadge: {
    backgroundColor: 'rgba(74,222,128,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.35)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  completedBadgeText: {
    color: 'rgba(74,222,128,0.90)',
    fontSize: 14,
    fontWeight: '700',
  },

  // Message
  messageCard: {
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
  },
  messageTitle: {
    fontFamily: 'PlayfairDisplay-Medium',
    fontSize: 18,
    marginBottom: 10,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 14,
  },
  messageQuote: {
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 20,
    borderLeftWidth: 2,
    paddingLeft: 12,
  },

  // Stats
  statsSection: { marginHorizontal: 20, marginTop: 24 },
  statsTitle: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 16, marginBottom: 12 },
  statsGrid: { flexDirection: 'row', gap: 10 },

  // Badges
  badgesSection: {
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
  },
  badgesTitle: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 16, marginBottom: 16 },
  badgesRow: { flexDirection: 'row', justifyContent: 'space-around' },
  badgeItem: { alignItems: 'center', gap: 6 },
  badgeEmoji: { fontSize: 36 },
  badgeLabel: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },

  // Programme suivant
  nextSection: { marginHorizontal: 20, marginTop: 24 },
  nextTitle: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 16, marginBottom: 12 },
  nextCard: {
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  nextEmoji: { fontSize: 36 },
  nextInfo: { flex: 1 },
  nextLabel: { fontSize: 11, marginBottom: 2 },
  nextName: { fontFamily: 'PlayfairDisplay-Medium', fontSize: 16, marginBottom: 4 },
  nextDays: { fontSize: 12 },
  nextArrow: { fontSize: 20 },

  // Actions
  actions: { marginHorizontal: 20, marginTop: 28, gap: 12 },
  shareBtn: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  shareBtnText: { fontSize: 15, fontWeight: '700' },
  homeBtn: { borderRadius: 14, overflow: 'hidden' },
  homeBtnGradient: { paddingVertical: 16, alignItems: 'center' },
  homeBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  programsBtn: { alignItems: 'center', paddingVertical: 8 },
  programsBtnText: { fontSize: 14 },
});
