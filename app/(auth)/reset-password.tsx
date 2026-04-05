import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View, Text, TextInput, StyleSheet, Pressable,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
  Animated,
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

  const [password, setPassword]         = useState('');
  const [confirmPwd, setConfirmPwd]     = useState('');
  const [showPwd, setShowPwd]           = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [tokenValid, setTokenValid]     = useState(false);
  const [error, setError]               = useState('');
  const [success, setSuccess]           = useState(false);
  const [countdown, setCountdown]       = useState(3);

  // Animations
  const fadeAnim    = useRef(new Animated.Value(0)).current;
  const slideAnim   = useRef(new Animated.Value(24)).current;
  const successScale = useRef(new Animated.Value(0.85)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;

  const BG       = isDark ? '#0D0B1A' : '#FAF7F2';
  const GOLD     = isDark ? '#C8A96E' : '#8B6914';
  const WHITE    = isDark ? '#EDE8DC' : '#1C1410';
  const LAV      = isDark ? 'rgba(240,235,224,0.65)' : 'rgba(80,60,140,0.70)';
  const LAV_DIM  = isDark ? 'rgba(240,235,224,0.40)' : 'rgba(80,60,140,0.38)';
  const BORDER   = isDark ? 'rgba(200,169,110,0.35)' : 'rgba(120,100,180,0.18)';
  const GLASS    = isDark ? '#2A2540' : 'rgba(255,255,255,0.80)';
  const GREEN    = isDark ? '#4ADE80' : '#16A34A';
  const GREEN_BG = isDark ? 'rgba(74,222,128,0.07)' : 'rgba(34,197,94,0.06)';
  const GREEN_BD = isDark ? 'rgba(74,222,128,0.22)' : 'rgba(34,197,94,0.18)';

  // Password strength
  const strength = password.length === 0 ? 0
    : password.length < 8 ? 1
    : password.length < 12 && !/[^a-zA-Z0-9]/.test(password) ? 2
    : 3;
  const strengthLabel = ['', 'Faible', 'Moyen', 'Fort'];
  const strengthColor = ['', '#F87171', '#FBBF24', '#4ADE80'];

  // Entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 380, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 380, useNativeDriver: true }),
    ]).start();
  }, []);

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

  // Success animation + countdown
  useEffect(() => {
    if (success) {
      Animated.sequence([
        Animated.spring(successScale, { toValue: 1, friction: 5, useNativeDriver: true }),
        Animated.timing(checkOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
      ]).start();

      const interval = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(interval);
            router.replace('/(tabs)' as never);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [success]);

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
    } catch (e: any) {
      setError(e?.message ?? 'Erreur lors de la réinitialisation.');
    } finally {
      setIsLoading(false);
    }
  }

  // ── Loading while validating token ──
  if (isValidating) {
    return (
      <ScreenContainer containerClassName={isDark ? 'bg-[#0D0B1A]' : 'bg-[#FAF7F2]'}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 }}>
          <ActivityIndicator color={GOLD} size="large" />
          <Text style={{ color: LAV, fontSize: 15 }}>Vérification du lien…</Text>
        </View>
      </ScreenContainer>
    );
  }

  // ── Invalid / expired token ──
  if (!tokenValid) {
    return (
      <ScreenContainer containerClassName={isDark ? 'bg-[#0D0B1A]' : 'bg-[#FAF7F2]'}>
        <StarField />
        <ScrollView contentContainerStyle={[styles.scroll, { backgroundColor: BG }]}>
          <View style={styles.centeredContent}>
            <View style={[styles.iconCircle, {
              backgroundColor: 'rgba(248,113,113,0.08)',
              borderColor: 'rgba(248,113,113,0.25)',
            }]}>
              <Text style={styles.iconEmoji}>⚠️</Text>
            </View>
            <Text style={[styles.title, { color: WHITE, textAlign: 'center' }]}>Lien invalide</Text>
            <Text style={[styles.subtitle, { color: LAV, textAlign: 'center' }]}>
              Ce lien de réinitialisation est invalide ou a expiré.{'\n'}Les liens sont valables 1 heure et à usage unique.
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                { backgroundColor: GOLD, shadowColor: GOLD, opacity: pressed ? 0.82 : 1 },
              ]}
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
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            {/* Header */}
            <View style={styles.header}>
              <View style={[styles.iconCircle, {
                backgroundColor: isDark ? 'rgba(200,169,110,0.10)' : 'rgba(139,105,20,0.07)',
                borderColor: isDark ? 'rgba(200,169,110,0.28)' : 'rgba(139,105,20,0.18)',
              }]}>
                <Text style={styles.iconEmoji}>🔒</Text>
              </View>
              <Text style={[styles.title, { color: WHITE }]}>Nouveau mot de passe</Text>
              <Text style={[styles.subtitle, { color: LAV }]}>
                Choisissez un mot de passe sécurisé pour protéger votre compte.
              </Text>
            </View>

            {success ? (
              /* ── Success state ── */
              <Animated.View style={[
                styles.successCard,
                { backgroundColor: GREEN_BG, borderColor: GREEN_BD },
                { transform: [{ scale: successScale }] },
              ]}>
                <Animated.Text style={[styles.successIcon, { opacity: checkOpacity }]}>✅</Animated.Text>
                <Text style={[styles.successTitle, { color: GREEN }]}>Mot de passe modifié !</Text>
                <Text style={[styles.successText, { color: LAV }]}>
                  Votre mot de passe a été réinitialisé avec succès. Vous êtes maintenant connecté.
                </Text>
                <View style={[styles.countdownBox, {
                  backgroundColor: isDark ? 'rgba(200,169,110,0.08)' : 'rgba(139,105,20,0.06)',
                  borderColor: isDark ? 'rgba(200,169,110,0.2)' : 'rgba(139,105,20,0.15)',
                }]}>
                  <ActivityIndicator color={GOLD} size="small" />
                  <Text style={[styles.countdownText, { color: GOLD }]}>
                    Redirection dans {countdown}s…
                  </Text>
                </View>
                <Pressable
                  style={({ pressed }) => [
                    styles.submitButton,
                    { backgroundColor: GOLD, shadowColor: GOLD, opacity: pressed ? 0.82 : 1 },
                  ]}
                  onPress={() => router.replace('/(tabs)' as never)}
                >
                  <Text style={[styles.submitButtonText, { color: BG }]}>Accéder à l'app →</Text>
                </Pressable>
              </Animated.View>
            ) : (
              /* ── Form ── */
              <View style={styles.form}>
                {/* Nouveau mot de passe */}
                <View style={styles.field}>
                  <Text style={[styles.label, { color: GOLD }]}>Nouveau mot de passe</Text>
                  <View style={[styles.inputWrapper, {
                    borderColor: error && !password ? '#F87171' : BORDER,
                    backgroundColor: GLASS,
                  }]}>
                    <TextInput
                      style={[styles.inputInner, { color: WHITE }]}
                      placeholder="Minimum 8 caractères"
                      placeholderTextColor={LAV_DIM}
                      value={password}
                      onChangeText={(v) => { setPassword(v); if (error) setError(''); }}
                      secureTextEntry={!showPwd}
                      returnKeyType="next"
                      editable={!isLoading}
                    />
                    <Pressable
                      style={({ pressed }) => [styles.eyeBtn, { opacity: pressed ? 0.6 : 1 }]}
                      onPress={() => setShowPwd(!showPwd)}
                    >
                      <Text style={{ fontSize: 16 }}>{showPwd ? '🙈' : '👁️'}</Text>
                    </Pressable>
                  </View>
                  {password.length > 0 && (
                    <View style={styles.strengthRow}>
                      {[1, 2, 3].map((i) => (
                        <View
                          key={i}
                          style={[styles.strengthBar, {
                            backgroundColor: i <= strength
                              ? strengthColor[strength]
                              : (isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)'),
                          }]}
                        />
                      ))}
                      <Text style={[styles.strengthLabel, { color: strengthColor[strength] }]}>
                        {strengthLabel[strength]}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Confirmation */}
                <View style={styles.field}>
                  <Text style={[styles.label, { color: GOLD }]}>Confirmer le mot de passe</Text>
                  <View style={[styles.inputWrapper, {
                    borderColor: confirmPwd && confirmPwd !== password ? '#F87171' : BORDER,
                    backgroundColor: GLASS,
                  }]}>
                    <TextInput
                      style={[styles.inputInner, { color: WHITE }]}
                      placeholder="Répétez votre mot de passe"
                      placeholderTextColor={LAV_DIM}
                      value={confirmPwd}
                      onChangeText={(v) => { setConfirmPwd(v); if (error) setError(''); }}
                      secureTextEntry={!showConfirm}
                      returnKeyType="done"
                      onSubmitEditing={handleReset}
                      editable={!isLoading}
                    />
                    <Pressable
                      style={({ pressed }) => [styles.eyeBtn, { opacity: pressed ? 0.6 : 1 }]}
                      onPress={() => setShowConfirm(!showConfirm)}
                    >
                      <Text style={{ fontSize: 16 }}>{showConfirm ? '🙈' : '👁️'}</Text>
                    </Pressable>
                  </View>
                  {confirmPwd.length > 0 && confirmPwd !== password && (
                    <Text style={styles.matchError}>⚠️  Les mots de passe ne correspondent pas</Text>
                  )}
                  {confirmPwd.length > 0 && confirmPwd === password && password.length >= 8 && (
                    <Text style={[styles.matchOk, { color: GREEN }]}>✓  Les mots de passe correspondent</Text>
                  )}
                </View>

                {error ? (
                  <View style={[styles.errorBox, {
                    backgroundColor: 'rgba(248,113,113,0.07)',
                    borderColor: 'rgba(248,113,113,0.22)',
                  }]}>
                    <Text style={styles.errorText}>⚠️  {error}</Text>
                  </View>
                ) : null}

                <Pressable
                  style={({ pressed }) => [
                    styles.submitButton,
                    { backgroundColor: GOLD, shadowColor: GOLD, opacity: pressed || isLoading ? 0.82 : 1 },
                  ]}
                  onPress={handleReset}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <View style={styles.loadingRow}>
                      <ActivityIndicator color={BG} size="small" />
                      <Text style={[styles.submitButtonText, { color: BG, marginLeft: 10 }]}>
                        Réinitialisation…
                      </Text>
                    </View>
                  ) : (
                    <Text style={[styles.submitButtonText, { color: BG }]}>
                      Réinitialiser mon mot de passe
                    </Text>
                  )}
                </Pressable>

                <Pressable
                  style={({ pressed }) => [styles.cancelButton, { opacity: pressed ? 0.6 : 1 }]}
                  onPress={() => router.replace('/(auth)/signin' as never)}
                >
                  <Text style={[styles.cancelText, { color: LAV }]}>Retour à la connexion</Text>
                </Pressable>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

function makeStyles(_isDark: boolean) {
  return StyleSheet.create({
    scroll: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingBottom: 48,
      paddingTop: 48,
    },
    centeredContent: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      paddingTop: 60,
    },
    header: {
      alignItems: 'center',
      marginBottom: 36,
      gap: 14,
    },
    iconCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      borderWidth: 1.5,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },
    iconEmoji: { fontSize: 32 },
    title: {
      fontSize: 26,
      fontWeight: '800',
      textAlign: 'center',
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 15,
      lineHeight: 23,
      textAlign: 'center',
      maxWidth: 300,
    },
    form: { gap: 16 },
    field: { gap: 8 },
    label: { fontSize: 14, fontWeight: '600' },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 14,
      borderWidth: 1.5,
      paddingHorizontal: 16,
      paddingVertical: 4,
    },
    inputInner: {
      flex: 1,
      fontSize: 16,
      paddingVertical: 11,
    },
    eyeBtn: {
      paddingHorizontal: 4,
      paddingVertical: 8,
    },
    strengthRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 4,
    },
    strengthBar: {
      flex: 1,
      height: 4,
      borderRadius: 2,
    },
    strengthLabel: {
      fontSize: 12,
      fontWeight: '600',
      width: 42,
    },
    matchError: {
      fontSize: 12,
      color: '#F87171',
      marginTop: 2,
    },
    matchOk: {
      fontSize: 12,
      fontWeight: '600',
      marginTop: 2,
    },
    errorBox: {
      borderRadius: 12,
      borderWidth: 1,
      padding: 12,
    },
    errorText: {
      fontSize: 13,
      color: '#F87171',
      lineHeight: 18,
    },
    loadingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    submitButton: {
      borderRadius: 999,
      paddingVertical: 17,
      alignItems: 'center',
      marginTop: 4,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.28,
      shadowRadius: 12,
      elevation: 6,
      minHeight: 54,
      justifyContent: 'center',
    },
    submitButtonText: {
      fontSize: 16,
      fontWeight: '800',
    },
    cancelButton: {
      alignItems: 'center',
      paddingVertical: 14,
    },
    cancelText: { fontSize: 15 },
    // ── Success ──
    successCard: {
      borderRadius: 20,
      borderWidth: 1,
      padding: 28,
      alignItems: 'center',
      gap: 14,
    },
    successIcon: { fontSize: 44 },
    successTitle: { fontSize: 22, fontWeight: '800' },
    successText: { fontSize: 15, lineHeight: 23, textAlign: 'center' },
    countdownBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      borderRadius: 12,
      borderWidth: 1,
      paddingHorizontal: 16,
      paddingVertical: 12,
      width: '100%',
      justifyContent: 'center',
    },
    countdownText: {
      fontSize: 14,
      fontWeight: '600',
    },
  });
}
