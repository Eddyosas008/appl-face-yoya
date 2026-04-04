import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { StarField } from '@/components/star-field';
import { useUser } from '@/lib/user-context';
import { useThemeContext } from '@/lib/theme-provider';

export default function SignInScreen() {
  const { login, isOnboarded } = useUser();
  const { isDark } = useThemeContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Palette dynamique
  const BG      = isDark ? '#03020F' : '#F0EDF8';
  const GOLD    = isDark ? '#C9A84C' : '#B8922E';
  const WHITE   = isDark ? '#EDE9FF' : '#1A1240';
  const LAV     = isDark ? 'rgba(184,174,255,0.55)' : 'rgba(80,60,140,0.70)';
  const LAV_DIM = isDark ? 'rgba(184,174,255,0.35)' : 'rgba(80,60,140,0.45)';
  const BORDER  = isDark ? 'rgba(180,160,255,0.12)' : 'rgba(120,100,180,0.18)';
  const GLASS   = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.75)';

  async function handleSignIn() {
    setError('');
    if (!email || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    setIsLoading(true);
    try {
      await login(email, password);
      if (isOnboarded) {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding' as never);
      }
    } catch (e) {
      setError('Email ou mot de passe incorrect.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ScreenContainer containerClassName={isDark ? 'bg-[#03020F]' : 'bg-[#F0EDF8]'}>
      <StarField />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { backgroundColor: BG }]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back button */}
          <Pressable
            style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.6 : 1 }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.backArrow, { color: LAV }]}>←</Text>
          </Pressable>

          <View style={styles.header}>
            <Text style={[styles.title, { color: WHITE }]}>Bon retour</Text>
            <Text style={[styles.subtitle, { color: LAV }]}>
              Reconnectez-vous à votre espace de bien-être.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={[styles.label, { color: GOLD }]}>Adresse e-mail</Text>
              <TextInput
                style={[styles.input, { borderColor: BORDER, backgroundColor: GLASS, color: WHITE }]}
                placeholder="votre@email.com"
                placeholderTextColor={LAV_DIM}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: GOLD }]}>Mot de passe</Text>
              <TextInput
                style={[styles.input, { borderColor: BORDER, backgroundColor: GLASS, color: WHITE }]}
                placeholder="Votre mot de passe"
                placeholderTextColor={LAV_DIM}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleSignIn}
              />
            </View>

            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                { backgroundColor: GOLD, shadowColor: GOLD, opacity: pressed || isLoading ? 0.8 : 1 },
              ]}
              onPress={handleSignIn}
              disabled={isLoading}
            >
              <Text style={[styles.submitButtonText, { color: BG }]}>
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </Text>
            </Pressable>
          </View>

          {/* Sign up link */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: LAV_DIM }]}>Pas encore de compte ? </Text>
            <Pressable onPress={() => router.push('/(auth)/signup' as never)}>
              <Text style={[styles.footerLink, { color: GOLD }]}>S'inscrire</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  backButton: {
    marginTop: 16,
    marginBottom: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backArrow: { fontSize: 22 },
  header: {
    marginBottom: 32,
    marginTop: 8,
  },
  title: {
    fontFamily: 'PlayfairDisplay-Medium',
    fontSize: 30,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  form: {
    gap: 16,
    marginBottom: 32,
  },
  field: { gap: 6 },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
  },
  errorText: {
    fontSize: 13,
    textAlign: 'center',
    color: '#F87171',
  },
  submitButton: {
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '800',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: { fontSize: 14 },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
  },
});
