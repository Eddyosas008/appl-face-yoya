import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { StarField } from '@/components/star-field';
import { useUser } from '@/lib/user-context';

// ─── Palette SomnioPax v3 ────────────────────────────────────────────────
const BG      = '#03020F';
const GOLD    = '#C9A84C';
const WHITE   = '#EDE9FF';
const LAV     = 'rgba(184,174,255,0.55)';
const LAV_DIM = 'rgba(184,174,255,0.35)';
const BORDER  = 'rgba(180,160,255,0.12)';
const GLASS   = 'rgba(255,255,255,0.04)';

export default function SignUpScreen() {
  const { signup } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSignUp() {
    setError('');
    if (!email || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    setIsLoading(true);
    try {
      await signup(email, password);
      router.replace('/onboarding' as never);
    } catch (e) {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ScreenContainer containerClassName="bg-[#03020F]">
      <StarField />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Back button */}
          <Pressable
            style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.6 : 1 }]}
            onPress={() => router.back()}
          >
            <Text style={styles.backArrow}>←</Text>
          </Pressable>

          <View style={styles.header}>
            <Text style={styles.title}>Créer un compte</Text>
            <Text style={styles.subtitle}>
              Rejoignez Yoya et commencez votre voyage vers le bien-être.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Adresse e-mail</Text>
              <TextInput
                style={styles.input}
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
              <Text style={styles.label}>Mot de passe</Text>
              <TextInput
                style={styles.input}
                placeholder="Au moins 6 caractères"
                placeholderTextColor={LAV_DIM}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                returnKeyType="next"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Confirmer le mot de passe</Text>
              <TextInput
                style={styles.input}
                placeholder="Répétez votre mot de passe"
                placeholderTextColor={LAV_DIM}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleSignUp}
              />
            </View>

            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                { opacity: pressed || isLoading ? 0.8 : 1 },
              ]}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? 'Création en cours...' : 'Créer mon compte'}
              </Text>
            </Pressable>
          </View>

          {/* Sign in link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Vous avez déjà un compte ? </Text>
            <Pressable onPress={() => router.push('/(auth)/signin' as never)}>
              <Text style={styles.footerLink}>Se connecter</Text>
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
    backgroundColor: BG,
  },
  backButton: {
    marginTop: 16,
    marginBottom: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backArrow: { fontSize: 22, color: LAV },
  header: {
    marginBottom: 32,
    marginTop: 8,
  },
  title: {
    fontFamily: 'PlayfairDisplay-Medium',
    fontSize: 30,
    color: WHITE,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: LAV,
  },
  form: {
    gap: 16,
    marginBottom: 32,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: GOLD,
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: GLASS,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: WHITE,
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
    backgroundColor: GOLD,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  submitButtonText: {
    color: BG,
    fontSize: 16,
    fontWeight: '800',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: LAV_DIM,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: GOLD,
  },
});
