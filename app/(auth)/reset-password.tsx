import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, TextInput, StyleSheet, Pressable,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { StarField } from '@/components/star-field';
import { useThemeContext } from '@/lib/theme-provider';
import { validateResetToken, resetPassword } from '@/lib/email-auth-service';
import { useUser } from '@/lib/user-context';

export default function ResetPasswordScreen() {
  const { isDark } = useThemeContext();
  const { login } = useUser();
  const styles = useMemo(() => makeStyles(isDark), [isDark]);
  const { token } = useLocalSearchParams<{ token: string }>();

  const [password, setPassword]     = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [isLoading, setIsLoading]   = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState(false);

  const BG      = isDark ? '#0D0B1A' : '#FAF7F2';
  const GOLD    = isDark ? '#C8A96E' : '#8B6914';
  const WHITE   = isDark ? '#EDE8DC' : '#1C1410';
  const LAV     = isDark ? 'rgba(240,235,224,0.65)' : 'rgba(80,60,140,0.70)';
  const LAV_DIM = isDark ? 'rgba(240,235,224,0.45)' : 'rgba(80,60,140,0.40)';
  const BORDER  = isDark ? 'rgba(200,169,110,0.40)' : 'rgba(120,100,180,0.18)';
  const GLASS   = isDark ? '#2A2540' : 'rgba(255,255,255,0.75)';

  // Password strength
  const strength = password.length === 0 ? 0
    : password.length < 8 ? 1
    : password.length < 12 && !/[^a-zA-Z0-9]/.test(password) ? 2
    : 3;
  const strengthLabel = ['', 'Faible', 'Moyen', 'Fort'];
  const strengthColor = ['', '#F87171', '#FBBF24', '#4ADE80'];

  // Validate token on mount
  useEffect(() => {
    async function validate() {
      if (!token) {
        setTokenValid(false);
        setIsValidating(false);
        return;
      }
      try {
        const result = await validateResetToken(token);
        setTokenValid(result.valid);
      } catch {
        setTokenValid(false);
      } finally {
        setIsValidating(false);
      }
    }
    validate();
  }, [token]);

  async function handleReset() {
    setError('');
    if (!password) {
      setError('Veuillez saisir un nouveau mot de passe.');
      return;
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (password !== confirmPwd) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (!token) {
      setError('Lien invalide.');
      return;
    }
    setIsLoading(true);
    try {
      const result = await resetPassword(token, password);
      await login(result.user.email ?? '', password);
      setSuccess(true);
      // Redirect after 2 seconds
      setTimeout(() => router.replace('/(tabs)' as never), 2000);
    } catch (e: any) {
      setError(e?.message ?? 'Erreur lors de la réinitialisation.');
    } finally {
      setIsLoading(false);
    }
  }

  // Loading state while validating token
  if (isValidating) {
    return (
      <ScreenContainer containerClassName={isDark ? 'bg-[#0D0B1A]' : 'bg-[#FAF7F2]'}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={GOLD} size="large" />
          <Text style={[styles.loadingText, { color: LAV }]}>Vérification du lien...</Text>
        </View>
      </ScreenContainer>
    );
  }

  // Invalid token state
  if (!tokenValid) {
    return (
      <ScreenContainer containerClassName={isDark ? 'bg-[#0D0B1A]' : 'bg-[#FAF7F2]'}>
        <StarField />
        <ScrollView contentContainerStyle={[styles.scroll, { backgroundColor: BG }]}>
          <View style={styles.centeredContent}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={[styles.title, { color: WHITE, textAlign: 'center' }]}>Lien invalide</Text>
            <Text style={[styles.subtitle, { color: LAV, textAlign: 'center' }]}>
              Ce lien de réinitialisation est invalide ou a expiré. Les liens sont valables 1 heure.
            </Text>
            <Pressable
              style={({ pressed }) => [styles.submitButton, { backgroundColor: GOLD, opacity: pressed ? 0.8 : 1 }]}
              onPress={() => router.replace('/(auth)/forgot-password' as never)}
            >
              <Text style={[styles.submitButtonText, { color: BG }]}>Demander un nouveau lien</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.cancelButton, { opacity: pressed ? 0.6 : 1 }]}
              onPress={() => router.replace('/(auth)/signin' as never)}
            >
              <Text style={[styles.cancelText, { color: LAV }]}>Retour à la connexion</Text>
            </Pressable>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.icon}>🔒</Text>
            <Text style={[styles.title, { color: WHITE }]}>Nouveau mot de passe</Text>
            <Text style={[styles.subtitle, { color: LAV }]}>
              Choisissez un nouveau mot de passe sécurisé pour votre compte.
            </Text>
          </View>

          {success ? (
            <View style={[styles.successCard, { backgroundColor: isDark ? 'rgba(74,222,128,0.1)' : 'rgba(34,197,94,0.08)', borderColor: isDark ? 'rgba(74,222,128,0.3)' : 'rgba(34,197,94,0.25)' }]}>
              <Text style={styles.successIcon}>✅</Text>
              <Text style={[styles.successTitle, { color: isDark ? '#4ADE80' : '#16A34A' }]}>
                Mot de passe modifié !
              </Text>
              <Text style={[styles.successText, { color: LAV }]}>
                Votre mot de passe a été réinitialisé avec succès. Redirection en cours...
              </Text>
              <ActivityIndicator color={GOLD} style={{ marginTop: 8 }} />
            </View>
          ) : (
            <View style={styles.form}>
              {/* Nouveau mot de passe */}
              <View style={styles.field}>
                <Text style={[styles.label, { color: GOLD }]}>Nouveau mot de passe</Text>
                <TextInput
                  style={[styles.input, { borderColor: BORDER, backgroundColor: GLASS, color: WHITE }]}
                  placeholder="Minimum 8 caractères"
                  placeholderTextColor={LAV_DIM}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  returnKeyType="next"
                />
                {password.length > 0 && (
                  <View style={styles.strengthRow}>
                    {[1, 2, 3].map((i) => (
                      <View
                        key={i}
                        style={[styles.strengthBar, { backgroundColor: i <= strength ? strengthColor[strength] : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)') }]}
                      />
                    ))}
                    <Text style={[styles.strengthLabel, { color: strengthColor[strength] }]}>{strengthLabel[strength]}</Text>
                  </View>
                )}
              </View>

              {/* Confirmation */}
              <View style={styles.field}>
                <Text style={[styles.label, { color: GOLD }]}>Confirmer le mot de passe</Text>
                <TextInput
                  style={[styles.input, { borderColor: confirmPwd && confirmPwd !== password ? '#F87171' : BORDER, backgroundColor: GLASS, color: WHITE }]}
                  placeholder="Répétez votre mot de passe"
                  placeholderTextColor={LAV_DIM}
                  value={confirmPwd}
                  onChangeText={setConfirmPwd}
                  secureTextEntry
                  returnKeyType="done"
                  onSubmitEditing={handleReset}
                />
                {confirmPwd.length > 0 && confirmPwd !== password && (
                  <Text style={styles.matchError}>Les mots de passe ne correspondent pas</Text>
                )}
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Pressable
                style={({ pressed }) => [
                  styles.submitButton,
                  { backgroundColor: GOLD, shadowColor: GOLD, opacity: pressed || isLoading ? 0.8 : 1 },
                ]}
                onPress={handleReset}
                disabled={isLoading}
              >
                {isLoading
                  ? <ActivityIndicator color={BG} />
                  : <Text style={[styles.submitButtonText, { color: BG }]}>Réinitialiser mon mot de passe</Text>
                }
              </Pressable>
            </View>
          )}
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
      paddingTop: 60,
    },
    header: {
      marginBottom: 32,
      alignItems: 'center',
    },
    icon: {
      fontSize: 48,
      marginBottom: 16,
    },
    title: {
      fontFamily: 'PlayfairDisplay-Medium',
      fontSize: 28,
      marginBottom: 12,
    },
    subtitle: {
      fontSize: 15,
      lineHeight: 22,
    },
    form: { gap: 16 },
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
    strengthRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 6,
    },
    strengthBar: {
      flex: 1,
      height: 4,
      borderRadius: 2,
    },
    strengthLabel: {
      fontSize: 12,
      fontWeight: '600',
      width: 40,
    },
    matchError: {
      fontSize: 12,
      color: '#F87171',
      marginTop: 2,
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
    cancelButton: {
      alignItems: 'center',
      paddingVertical: 12,
    },
    cancelText: {
      fontSize: 15,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 15,
    },
    centeredContent: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      paddingTop: 80,
    },
    errorIcon: {
      fontSize: 48,
    },
    successCard: {
      borderRadius: 20,
      borderWidth: 1,
      padding: 24,
      alignItems: 'center',
      gap: 12,
    },
    successIcon: {
      fontSize: 40,
    },
    successTitle: {
      fontSize: 20,
      fontWeight: '800',
    },
    successText: {
      fontSize: 14,
      lineHeight: 22,
      textAlign: 'center',
    },
  });
}
