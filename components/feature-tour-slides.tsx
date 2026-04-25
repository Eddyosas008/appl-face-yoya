/**
 * FeatureTourSlides — Présentation animée des 4 fonctionnalités clés de SomnioPax.
 *
 * Utilisé dans l'onboarding (étape 'features') pour présenter :
 * - Méditations guidées
 * - Suivi du sommeil
 * - Journal de bien-être
 * - Séances express
 *
 * Chaque slide est swipeable horizontalement avec pagination par points.
 */

import React, { useRef, useState, useCallback } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewToken,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  FadeIn,
  FadeInDown,
  Easing,
} from "react-native-reanimated";

const { width: SCREEN_W } = Dimensions.get("window");

// ─── Données des slides ───────────────────────────────────────────────────────

interface FeatureSlide {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  description: string;
  imageUri: string;
  gradientColors: [string, string, string];
  accentColor: string;
}

const SLIDES: FeatureSlide[] = [
  {
    id: "meditations",
    emoji: "🧘",
    title: "Méditations guidées",
    subtitle: "Plus de 50 séances",
    description:
      "Explorez une bibliothèque de méditations guidées par thèmes : sommeil, stress, confiance, concentration. Chaque séance est adaptée à votre niveau.",
    imageUri:
      "https://files.manuscdn.com/user_upload_by_module/session_file/91776583/AgfmdcGmHLCHGgiF.png",
    gradientColors: ["#1A1040", "#2A1A60", "#0D0B1A"],
    accentColor: "#9B7FE8",
  },
  {
    id: "sleep",
    emoji: "🌙",
    title: "Suivi du sommeil",
    subtitle: "Analysez vos nuits",
    description:
      "Enregistrez la qualité de votre sommeil chaque matin, ajoutez des notes et visualisez vos tendances sur 7 jours pour mieux comprendre vos cycles.",
    imageUri:
      "https://files.manuscdn.com/user_upload_by_module/session_file/91776583/aCfuZoRaAGDOuFOr.png",
    gradientColors: ["#0D1A30", "#1A2A50", "#0D0B1A"],
    accentColor: "#6BA3E8",
  },
  {
    id: "journal",
    emoji: "📖",
    title: "Journal de bien-être",
    subtitle: "Exprimez-vous librement",
    description:
      "Notez vos pensées, émotions et gratitudes au quotidien. Votre journal est privé, sécurisé sur votre appareil, et enrichi d'un suivi d'humeur visuel.",
    imageUri:
      "https://files.manuscdn.com/user_upload_by_module/session_file/91776583/YHIWRUZmEQUWGdhI.png",
    gradientColors: ["#1A0D30", "#2A1540", "#0D0B1A"],
    accentColor: "#C8A96E",
  },
  {
    id: "express",
    emoji: "⚡",
    title: "Séances express",
    subtitle: "3, 5 ou 10 minutes",
    description:
      "Pas le temps ? Lancez une séance express en un tap depuis l'accueil. Choisissez votre durée, respirez, et revenez à votre journée ressourcé(e).",
    imageUri:
      "https://files.manuscdn.com/user_upload_by_module/session_file/91776583/pbHMlWGhyseNGTNS.png",
    gradientColors: ["#1A1200", "#2A2000", "#0D0B1A"],
    accentColor: "#F0C040",
  },
];

// ─── Composant slide individuel ───────────────────────────────────────────────

function FeatureSlideItem({
  item,
  isDark,
  isActive,
}: {
  item: FeatureSlide;
  isDark: boolean;
  isActive: boolean;
}) {
  const scale = useSharedValue(isActive ? 1 : 0.92);
  const opacity = useSharedValue(isActive ? 1 : 0.5);

  React.useEffect(() => {
    scale.value = withSpring(isActive ? 1 : 0.92, { damping: 16 });
    opacity.value = withTiming(isActive ? 1 : 0.5, { duration: 300 });
  }, [isActive]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[{ width: SCREEN_W - 48 }, animStyle]}>
      {/* Image avec overlay gradient */}
      <View style={st.imageWrap}>
        <Image
          source={{ uri: item.imageUri }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          transition={400}
          cachePolicy="memory-disk"
        />
        <LinearGradient
          colors={item.gradientColors}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        {/* Emoji flottant */}
        <View style={[st.emojiWrap, { backgroundColor: item.accentColor + "25", borderColor: item.accentColor + "50" }]}>
          <Text style={st.emojiText}>{item.emoji}</Text>
        </View>
        {/* Badge */}
        <View style={[st.badge, { backgroundColor: item.accentColor + "30", borderColor: item.accentColor + "60" }]}>
          <Text style={[st.badgeText, { color: item.accentColor }]}>{item.subtitle}</Text>
        </View>
      </View>

      {/* Contenu texte */}
      {isActive && (
        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <Text style={[st.slideTitle, { color: isDark ? "#F0EBE0" : "#1C1410" }]}>
            {item.title}
          </Text>
          <Text style={[st.slideDesc, { color: isDark ? "rgba(240,235,224,0.65)" : "rgba(60,40,20,0.65)" }]}>
            {item.description}
          </Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

interface FeatureTourSlidesProps {
  isDark: boolean;
  GOLD: string;
  onComplete: () => void;
}

export function FeatureTourSlides({ isDark, GOLD, onComplete }: FeatureTourSlidesProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
    []
  );

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const goNext = useCallback(() => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      onComplete();
    }
  }, [activeIndex, onComplete]);

  const goPrev = useCallback(() => {
    if (activeIndex > 0) {
      flatListRef.current?.scrollToIndex({ index: activeIndex - 1, animated: true });
    }
  }, [activeIndex]);

  const isLast = activeIndex === SLIDES.length - 1;

  return (
    <Animated.View entering={FadeIn.duration(500)} style={st.container}>
      {/* En-tête */}
      <View style={st.header}>
        <Text style={[st.headerTitle, { color: isDark ? "#F0EBE0" : "#1C1410" }]}>
          Découvrez SomnioPax
        </Text>
        <Text style={[st.headerSub, { color: isDark ? "rgba(240,235,224,0.55)" : "rgba(60,40,20,0.55)" }]}>
          Voici ce qui vous attend
        </Text>
      </View>

      {/* Carousel */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled={false}
        snapToInterval={SCREEN_W - 48 + 16}
        snapToAlignment="start"
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={st.listContent}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item, index }) => (
          <View style={{ marginRight: 16 }}>
            <FeatureSlideItem
              item={item}
              isDark={isDark}
              isActive={index === activeIndex}
            />
          </View>
        )}
      />

      {/* Pagination par points */}
      <View style={st.dotsRow}>
        {SLIDES.map((_, i) => (
          <DotIndicator key={i} active={i === activeIndex} GOLD={GOLD} />
        ))}
      </View>

      {/* Boutons de navigation */}
      <View style={st.navRow}>
        {activeIndex > 0 ? (
          <Pressable
            style={({ pressed }) => [
              st.backBtn,
              {
                borderColor: isDark ? "rgba(200,169,110,0.35)" : "rgba(139,105,20,0.25)",
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            onPress={goPrev}
          >
            <Text style={[st.backBtnText, { color: isDark ? "rgba(240,235,224,0.70)" : "rgba(60,40,20,0.70)" }]}>
              ← Retour
            </Text>
          </Pressable>
        ) : (
          <View style={{ flex: 0 }} />
        )}

        <Pressable
          style={({ pressed }) => [st.nextBtn, { opacity: pressed ? 0.85 : 1 }]}
          onPress={goNext}
        >
          <LinearGradient
            colors={[GOLD, "#F0D090"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={st.nextBtnGradient}
          >
            <Text style={st.nextBtnText}>
              {isLast ? "Commencer la configuration →" : "Suivant →"}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>

      {/* Lien passer */}
      <Pressable style={st.skipWrap} onPress={onComplete}>
        <Text style={[st.skipText, { color: isDark ? "rgba(200,169,110,0.70)" : "rgba(139,105,20,0.70)" }]}>
          Passer la présentation
        </Text>
      </Pressable>
    </Animated.View>
  );
}

// ─── Indicateur de point ──────────────────────────────────────────────────────

function DotIndicator({ active, GOLD }: { active: boolean; GOLD: string }) {
  const width = useSharedValue(active ? 24 : 8);
  const opacityVal = useSharedValue(active ? 1 : 0.35);

  React.useEffect(() => {
    width.value = withTiming(active ? 24 : 8, { duration: 250, easing: Easing.out(Easing.cubic) });
    opacityVal.value = withTiming(active ? 1 : 0.35, { duration: 250 });
  }, [active]);

  const animStyle = useAnimatedStyle(() => ({
    width: width.value,
    opacity: opacityVal.value,
  }));

  return (
    <Animated.View
      style={[
        st.dot,
        { backgroundColor: GOLD },
        animStyle,
      ]}
    />
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const st = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 8,
  },
  header: {
    paddingHorizontal: 4,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 14,
    lineHeight: 20,
  },

  // Carousel
  listContent: {
    paddingLeft: 0,
    paddingRight: 24,
  },
  imageWrap: {
    width: "100%",
    height: 200,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
    justifyContent: "flex-end",
    alignItems: "flex-start",
    padding: 14,
  },
  emojiWrap: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emojiText: { fontSize: 26 },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
  },
  badgeText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },

  // Texte
  slideTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  slideDesc: {
    fontSize: 14,
    lineHeight: 22,
  },

  // Pagination
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 20,
    marginBottom: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },

  // Navigation
  navRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  backBtn: {
    borderRadius: 999,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnText: { fontSize: 14, fontWeight: "600" },
  nextBtn: {
    flex: 1,
    borderRadius: 999,
    overflow: "hidden",
  },
  nextBtnGradient: {
    paddingVertical: 16,
    paddingHorizontal: 28,
    alignItems: "center",
  },
  nextBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1C1410",
  },

  // Passer
  skipWrap: {
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 4,
  },
  skipText: {
    fontSize: 13,
    textDecorationLine: "underline",
  },
});
