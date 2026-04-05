import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View, Text, TextInput, StyleSheet, Pressable,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { StarField } from '@/components/star-field';
import { useThemeContext } from '@/lib/theme-provider';
import { forgotPassword } from '@/lib/email-auth-service';

export default function ForgotPasswordScreen() {
  const { isDark } = useThemeContext();
  const styles = useMemo(() => makeStyles(isDark), [isDark]);

  const [email, setEmail]         = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState(false);

  // Animations
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const scaleAnim = useRef(new Animated.Value(0.88)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;

  const BG        = isDark ? '#0D0B1A' : '#FAF7F2';
  const GOLD      = isDark ? '#C8A96E' : '#8B6914';
  const WHITE     = isDark ? '#EDE8DC' : '#1C1410';
  const LAV       = isDark ? 'rgba(240,235,224,0.65)' : 'rgba(80,60,140,0.70)';
  const LAV_DIM   = isDark ? 'rgba(240,235,224,0.40)' : 'rgba(80,60,140,0.38)';
  const BORDER    = isDark ? 'rgba(200,169,110,0.35)' : 'rgba(120,100,180,0.18)';
  const GLASS     = isDark ? '#2A2540' : 'rgba(255,255,255,0.80)';
  const GREEN     = isDark ? '#4ADE80' : '#16A34A';
  const GREEN_BG  = isDark ? 'rgba(74,222,128,0.07)' : 'rgba(34,197,94,0.06)';
  const GREEN_BD  = isDark ? 'rgba(74,222,128,0.22)' : 'rgba(34,197,94,0.18)';

  // Entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 380, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 380, useNativeDriver: true }),
    ]).start();
  }, []);

  // Success animation
  useEffect(() => {
    if (success) {
      Animated.sequence([
        Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
        Animated.timing(checkAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      ]).start();
    }
  }, [success]);

  async function handleSubmit() {
    setError('');
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Veuillez saisir votre adresse e-mail.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Format d'e-mail invalide.");
      return;
    }
    setIsLoading(true);
    try {
      await forgotPassword(trimmed);
      setSuccess(true);
    } catch (e: any) {
      setError(e?.message ?? 'Erreur serveur. Veuillez réessayer.');
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
          showsVerticalScrollIndicator={false}
        >
          {/* Back button */}
          <Pressable
            style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.6 : 1 }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.backArrow, { color: GOLD }]}>←</Text>
            <Text style={[styles.backLabel, { color: LAV }]}>Retour</Text>
          </Pressable>

          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            {/* Header */}
            <View style={styles.header}>
              <View style={[styles.iconCircle, {
                backgroundColor: isDark ? 'rgba(200,169,110,0.10)' : 'rgba(139,105,20,0.07)',
                borderColor: isDark ? 'rgba(200,169,110,0.28)' : 'rgba(139,105,20,0.18)',
              }]}>
                <Text style={styles.iconEmoji}>🔑</Text>
              </View>
              <Text style={[styles.title, { color: WHITE }]}>Mot de passe oublié ?</Text>
              <Text style={[styles.subtitle, { color: LAV }]}>
                Pas de panique. Saisissez votre adresse e-mail et nous vous enverrons un lien pour créer un nouveau mot de passe.
              </Text>
            </View>

            {success ? (
              /* ── Success state ── */
              <Animated.View style={[
                styles.successCard,
                { backgroundColor: GREEN_BG, borderColor: GREEN_BD },
                { transform: [{ scale: scaleAnim }] },
              ]}>
                <Animated.Text style={[styles.successIcon, { opacity: checkAnim }]}>✅</Animated.Text>
                <Text style={[styles.successTitle, { color: GREEN }]}>Email envoyé !</Text>
                <Text style={[styles.successText, { color: LAV }]}>
                  Si un compte existe avec l'adresse{' '}
                  <Text style={{ fontWeight: '700', color: GOLD }}>{email}</Text>
                  , vous recevrez un lien de réinitialisation dans quelques minutes.
                </Text>

                <View style={[styles.hintBox, {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                  borderColor: BORDER,
                }]}>
                  <Text style={[styles.hintText, { color: LAV_DIM }]}>
                    📬 Vérifiez aussi vos spams et courriers indésirables.
                  </Text>
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.backToLoginBtn,
                    { backgroundColor: GOLD, opacity: pressed ? 0.82 : 1 },
                  ]}
                  onPress={() => router.replace('/(auth)/signin' as never)}
                >
                  <Text style={[styles.backToLoginText, { color: isDark ? '#0D0B1A' : '#FAF7F2' }]}>
                    Retour à la connexion
                  </Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [styles.resendBtn, { opacity: pressed ? 0.6 : 1 }]}
                  onPress={() => { setSuccess(false); setEmail(''); }}
                >
                  <Text style={[styles.resendText, { color: LAV_DIM }]}>
                    Renvoyer avec une autre adresse
                  </Text>
                </Pressable>
              </Animated.View>
            ) : (
              /* ── Form ── */
              <View style={styles.form}>
                <View style={styles.field}>
                  <Text style={[styles.label, { color: GOLD }]}>Adresse e-mail</Text>
                  <TextInput
                    style={[styles.input, {
                      borderColor: error ? '#F87171' : BORDER,
                      backgroundColor: GLASS,
                      color: WHITE,
                    }]}
                    placeholder="votre@email.com"
                    placeholderTextColor={LAV_DIM}
                    value={email}
                    onChangeText={(v) => { setEmail(v); if (error) setError(''); }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                    editable={!isLoading}
                  />
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
                  onPress={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <View style={styles.loadingRow}>
                      <ActivityIndicator color={BG} size="small" />
                      <Text style={[styles.submitButtonText, { color: BG, marginLeft: 10 }]}>
                        Envoi en cours…
                      </Text>
                    </View>
                  ) : (
                    <Text style={[styles.submitButtonText, { color: BG }]}>Envoyer le lien</Text>
                  )}
                </Pressable>

                <Pressable
                  style={({ pressed }) => [styles.cancelButton, { opacity: pressed ? 0.6 : 1 }]}
                  onPress={() => router.back()}
                >
                  <Text style={[styles.cancelText, { color: LAV }]}>Annuler</Text>
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
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 16,
      marginBottom: 4,
      gap: 6,
      alignSelf: 'flex-start',
    },
    backArrow: { fontSize: 20, fontWeight: '600' },
    backLabel: { fontSize: 15 },
    header: {
      alignItems: 'center',
      marginTop: 28,
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
      maxWidth: 320,
    },
    form: { gap: 16 },
    field: { gap: 8 },
    label: { fontSize: 14, fontWeight: '600' },
    input: {
      borderRadius: 14,
      borderWidth: 1.5,
      paddingHorizontal: 16,
      paddingVertical: 15,
      fontSize: 16,
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
    hintBox: {
      borderRadius: 12,
      borderWidth: 1,
      paddingHorizontal: 16,
      paddingVertical: 12,
      width: '100%',
    },
    hintText: { fontSize: 13, lineHeight: 19, textAlign: 'center' },
    backToLoginBtn: {
      borderRadius: 999,
      paddingVertical: 15,
      paddingHorizontal: 32,
      alignItems: 'center',
      width: '100%',
      marginTop: 4,
    },
    backToLoginText: { fontSize: 16, fontWeight: '700' },
    resendBtn: { paddingVertical: 8 },
    resendText: { fontSize: 13, textDecorationLine: 'underline' },
  });
}
