import React, { useState, useMemo} from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { StarField } from '@/components/star-field';
import { useUser } from '@/lib/user-context';
import { useThemeContext } from '@/lib/theme-provider';

export default function SignUpScreen() {
  const { signup } = useUser();
  const { isDark } = useThemeContext();
  const styles = useMemo(() => makeStyles(isDark), [isDark]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Palette dynamique
  const BG      = isDark ? '#0D0B1A' : '#FAF7F2';
  const GOLD    = isDark ? '#C8A96E' : '#8B6914';
  const WHITE   = isDark ? '#EDE8DC' : '#1C1410';
  const LAV     = isDark ? 'rgba(240,235,224,0.65)' : 'rgba(80,60,140,0.70)';
  const LAV_DIM = isDark ? 'rgba(240,235,224,0.65)' : 'rgba(80,60,140,0.45)';
  const BORDER  = isDark ? 'rgba(200,169,110,0.40)' : 'rgba(120,100,180,0.18)';
  const GLASS   = isDark ? '#2A2540' : 'rgba(255,255,255,0.75)';

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
    <ScreenContainer containerClassName={isDark ? 'bg-[#0D0B1A]' : 'bg-[#FAF7F2]'}>
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
            <Text style={[styles.title, { color: WHITE }]}>Créer un compte</Text>
            <Text style={[styles.subtitle, { color: LAV }]}>
              Rejoignez SomnioPax et commencez votre voyage vers un sommeil profond.
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
                placeholder="Au moins 6 caractères"
                placeholderTextColor={LAV_DIM}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                returnKeyType="next"
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: GOLD }]}>Confirmer le mot de passe</Text>
              <TextInput
                style={[styles.input, { borderColor: BORDER, backgroundColor: GLASS, color: WHITE }]}
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
                { backgroundColor: GOLD, shadowColor: GOLD, opacity: pressed || isLoading ? 0.8 : 1 },
              ]}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              <Text style={[styles.submitButtonText, { color: BG }]}>
                {isLoading ? 'Création en cours...' : 'Créer mon compte'}
              </Text>
            </Pressable>
          </View>

          {/* Sign in link */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: LAV_DIM }]}>Vous avez déjà un compte ? </Text>
            <Pressable onPress={() => router.push('/(auth)/signin' as never)}>
              <Text style={[styles.footerLink, { color: GOLD }]}>Se connecter</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

function makeStyles(isDark: boolean) {
  const CARD   = isDark ? '#2A2540' : '#FFFFFF';
  const CARD2  = isDark ? '#201C38' : '#F5F0E8';
  const TEXT1  = isDark ? '#F0EBE0' : '#1C1410';
  const TEXT2  = isDark ? 'rgba(240,235,224,0.65)' : 'rgba(60,40,20,0.65)';
  const TEXT3  = isDark ? 'rgba(240,235,224,0.70)' : 'rgba(60,40,20,0.70)';
  const GOLD_C = isDark ? '#C8A96E' : '#8B6914';
  const BORD   = isDark ? 'rgba(200,169,110,0.40)' : 'rgba(139,105,20,0.30)';
  const BORD2  = isDark ? 'rgba(200,169,110,0.30)' : 'rgba(139,105,20,0.20)';
  return StyleSheet.create({
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
}
