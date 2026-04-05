import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, StyleSheet, Pressable,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { StarField } from '@/components/star-field';
import { useThemeContext } from '@/lib/theme-provider';
import { loginWithEmail } from '@/lib/email-auth-service';
import { useUser } from '@/lib/user-context';
import { GoogleSignInButton } from '@/components/google-sign-in-button';
import type { User } from '@/lib/_core/auth';

export default function SignInScreen() {
  const { isDark } = useThemeContext();
  const { login } = useUser();
  const styles = useMemo(() => makeStyles(isDark), [isDark]);

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]       = useState('');

  // Palette
  const BG      = isDark ? '#0D0B1A' : '#FAF7F2';
  const GOLD    = isDark ? '#C8A96E' : '#8B6914';
  const WHITE   = isDark ? '#EDE8DC' : '#1C1410';
  const LAV     = isDark ? 'rgba(240,235,224,0.65)' : 'rgba(80,60,140,0.70)';
  const LAV_DIM = isDark ? 'rgba(240,235,224,0.45)' : 'rgba(80,60,140,0.40)';
  const BORDER  = isDark ? 'rgba(200,169,110,0.40)' : 'rgba(120,100,180,0.18)';
  const GLASS   = isDark ? '#2A2540' : 'rgba(255,255,255,0.75)';

  async function handleSignIn() {
    setError('');
    if (!email.trim() || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    setIsLoading(true);
    try {
      const result = await loginWithEmail(email.trim(), password);
      await login(result.user.email ?? email, password);
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e?.message ?? 'Email ou mot de passe incorrect.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleGoogleSuccess(_user: User) {
    router.replace('/(tabs)');
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
          {/* Back */}
          <Pressable
            style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.6 : 1 }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.backArrow, { color: LAV }]}>←</Text>
          </Pressable>

          {/* Header */}
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
              <View style={styles.labelRow}>
                <Text style={[styles.label, { color: GOLD }]}>Mot de passe</Text>
                <Pressable onPress={() => router.push('/(auth)/forgot-password' as never)}>
                  <Text style={[styles.forgotLink, { color: GOLD }]}>Mot de passe oublié ?</Text>
                </Pressable>
              </View>
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

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                { backgroundColor: GOLD, shadowColor: GOLD, opacity: pressed || isLoading ? 0.8 : 1 },
              ]}
              onPress={handleSignIn}
              disabled={isLoading}
            >
              {isLoading
                ? <ActivityIndicator color={BG} />
                : <Text style={[styles.submitButtonText, { color: BG }]}>Se connecter</Text>
              }
            </Pressable>
          </View>

          {/* Séparateur */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: BORDER }]} />
            <Text style={[styles.dividerText, { color: LAV_DIM }]}>ou</Text>
            <View style={[styles.dividerLine, { backgroundColor: BORDER }]} />
          </View>

          {/* Bouton Google */}
          <GoogleSignInButton
            label="Continuer avec Google"
            onSuccess={handleGoogleSuccess}
            onError={(err) => setError(err)}
          />

          <View style={{ height: 24 }} />

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

function makeStyles(isDark: boolean) {
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
      marginBottom: 24,
    },
    field: { gap: 6 },
    labelRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
    },
    forgotLink: {
      fontSize: 13,
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
      lineHeight: 18,
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
      minHeight: 52,
      justifyContent: 'center',
    },
    submitButtonText: {
      fontSize: 16,
      fontWeight: '800',
    },
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      gap: 12,
    },
    dividerLine: { flex: 1, height: 1 },
    dividerText: { fontSize: 13, fontWeight: '500' },
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
