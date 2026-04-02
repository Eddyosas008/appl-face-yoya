import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, Dimensions } from 'react-native';
import { router } from 'expo-router';
import Svg, { Circle, Ellipse } from 'react-native-svg';
import { ScreenContainer } from '@/components/screen-container';

const { width: W, height: H } = Dimensions.get('window');

// ─── Palette SomnioPax v3 ────────────────────────────────────────────────
const BG      = '#03020F';
const GOLD    = '#C9A84C';
const GOLD_BG = 'rgba(201,168,76,0.14)';
const WHITE   = '#EDE9FF';
const LAV     = 'rgba(184,174,255,0.55)';
const LAV_DIM = 'rgba(184,174,255,0.35)';
const BORDER  = 'rgba(180,160,255,0.12)';

// ─── Étoiles statiques ───────────────────────────────────────────────────
const STARS = [
  { cx: 40,  cy: 80,  r: 1.2 }, { cx: 120, cy: 40,  r: 0.8 },
  { cx: 200, cy: 100, r: 1.5 }, { cx: 280, cy: 60,  r: 1.0 },
  { cx: 340, cy: 130, r: 0.7 }, { cx: 60,  cy: 180, r: 1.3 },
  { cx: 160, cy: 200, r: 0.9 }, { cx: 260, cy: 170, r: 1.1 },
  { cx: 320, cy: 240, r: 0.8 }, { cx: 80,  cy: 280, r: 1.4 },
  { cx: 180, cy: 320, r: 0.6 }, { cx: 300, cy: 300, r: 1.2 },
  { cx: 30,  cy: 350, r: 0.9 }, { cx: 240, cy: 380, r: 1.0 },
];

function StarField() {
  return (
    <Svg
      width={W}
      height={H * 0.55}
      style={{ position: 'absolute', top: 0, left: 0 }}
    >
      {STARS.map((s, i) => (
        <Circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="rgba(255,255,255,0.55)" />
      ))}
      {/* Aurora blobs */}
      <Ellipse cx={W * 0.3} cy={H * 0.15} rx={120} ry={70} fill="rgba(100,60,200,0.12)" />
      <Ellipse cx={W * 0.75} cy={H * 0.22} rx={100} ry={60} fill="rgba(80,40,180,0.10)" />
      <Ellipse cx={W * 0.5} cy={H * 0.32} rx={140} ry={50} fill="rgba(201,168,76,0.06)" />
    </Svg>
  );
}

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <StarField />

      {/* Hero */}
      <View style={styles.hero}>
        {/* Logo avec halo doré */}
        <View style={styles.logoHalo}>
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Titre Playfair Display */}
        <Text style={styles.appName}>Yoya</Text>
        <Text style={styles.tagline}>Votre sanctuaire du bien-être intérieur</Text>
      </View>

      {/* Séparateur lumineux */}
      <View style={styles.separator} />

      {/* Contenu bas */}
      <View style={styles.bottomContent}>
        <Text style={styles.headline}>
          Retrouvez votre{'\n'}équilibre intérieur
        </Text>
        <Text style={styles.subheadline}>
          Méditation guidée, régulation émotionnelle et parcours personnalisés pour votre bien-être.
        </Text>

        {/* CTA Buttons */}
        <View style={styles.buttons}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              { opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={() => router.push('/(auth)/signup')}
          >
            <Text style={styles.primaryButtonText}>Commencer gratuitement</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => router.push('/(auth)/signin')}
          >
            <Text style={styles.secondaryButtonText}>
              J'ai déjà un compte
            </Text>
          </Pressable>
        </View>

        <Text style={styles.disclaimer}>
          En continuant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  hero: {
    height: H * 0.50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  logoHalo: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(201,168,76,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.20)',
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    overflow: 'hidden',
  },
  logo: {
    width: 80,
    height: 80,
  },
  appName: {
    fontFamily: 'PlayfairDisplay-Medium',
    color: WHITE,
    fontSize: 46,
    letterSpacing: 3,
    marginBottom: 8,
  },
  tagline: {
    color: LAV,
    fontSize: 14,
    letterSpacing: 0.5,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  separator: {
    height: 1,
    backgroundColor: BORDER,
    marginHorizontal: 40,
  },
  bottomContent: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 24,
  },
  headline: {
    fontFamily: 'PlayfairDisplay-Medium',
    fontSize: 28,
    color: WHITE,
    lineHeight: 38,
    marginBottom: 12,
  },
  subheadline: {
    fontSize: 15,
    color: LAV,
    lineHeight: 22,
    marginBottom: 32,
  },
  buttons: {
    gap: 12,
    marginBottom: 20,
  },
  primaryButton: {
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: GOLD,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButtonText: {
    color: BG,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    borderRadius: 999,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: LAV,
  },
  disclaimer: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    color: LAV_DIM,
  },
});
