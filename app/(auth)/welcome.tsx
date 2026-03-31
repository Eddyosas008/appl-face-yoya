import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';

const { height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const colors = useColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Hero gradient background */}
      <LinearGradient
        colors={['#1A0A2E', '#4A1A6E', '#C084FC']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.heroGradient}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* App name */}
        <Text style={styles.appName}>Yoya</Text>
        <Text style={styles.tagline}>Votre espace de bien-être intérieur</Text>
      </LinearGradient>

      {/* Bottom content */}
      <View style={[styles.bottomContent, { backgroundColor: colors.background }]}>
        <Text style={[styles.headline, { color: colors.foreground }]}>
          Retrouvez votre{'\n'}équilibre intérieur
        </Text>
        <Text style={[styles.subheadline, { color: colors.muted }]}>
          Méditation guidée, régulation émotionnelle et parcours personnalisés pour votre bien-être.
        </Text>

        {/* CTA Buttons */}
        <View style={styles.buttons}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={() => router.push('/(auth)/signup')}
          >
            <Text style={styles.primaryButtonText}>Commencer gratuitement</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => router.push('/(auth)/signin')}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.foreground }]}>
              J'ai déjà un compte
            </Text>
          </Pressable>
        </View>

        <Text style={[styles.disclaimer, { color: colors.muted }]}>
          En continuant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroGradient: {
    height: height * 0.52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#C084FC',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  logo: {
    width: 90,
    height: 90,
  },
  appName: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 8,
  },
  tagline: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  bottomContent: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 24,
  },
  headline: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
    marginBottom: 12,
  },
  subheadline: {
    fontSize: 15,
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
    shadowColor: '#C084FC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    borderRadius: 999,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
});
