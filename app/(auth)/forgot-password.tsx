import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, StyleSheet, Pressable,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { StarField } from '@/components/star-field';
import { useThemeContext } from '@/lib/theme-provider';
import { forgotPassword } from '@/lib/email-auth-service';

export default function ForgotPasswordScreen() {
  const { isDark } = useThemeContext();
  const styles = useMemo(() => makeStyles(isDark), [isDark]);

  const [email, setEmail]       = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);

  const BG      = isDark ? '#0D0B1A' : '#FAF7F2';
  const GOLD    = isDark ? '#C8A96E' : '#8B6914';
  const WHITE   = isDark ? '#EDE8DC' : '#1C1410';
  const LAV     = isDark ? 'rgba(240,235,224,0.65)' : 'rgba(80,60,140,0.70)';
  const LAV_DIM = isDark ? 'rgba(240,235,224,0.45)' : 'rgba(80,60,140,0.40)';
  const BORDER  = isDark ? 'rgba(200,169,110,0.40)' : 'rgba(120,100,180,0.18)';
  const GLASS   = isDark ? '#2A2540' : 'rgba(255,255,255,0.75)';

  async function handleSubmit() {
    setError('');
    if (!email.trim()) {
      setError('Veuillez saisir votre adresse e-mail.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Format d'email invalide.");
      return;
    }
    setIsLoading(true);
    try {
      await forgotPassword(email.trim());
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
            <Text style={styles.icon}>🔑</Text>
            <Text style={[styles.title, { color: WHITE }]}>Mot de passe oublié</Text>
            <Text style={[styles.subtitle, { color: LAV }]}>
              Saisissez votre adresse e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </Text>
          </View>

          {success ? (
            /* Success state */
            <View style={[styles.successCard, { backgroundColor: isDark ? 'rgba(74,222,128,0.1)' : 'rgba(34,197,94,0.08)', borderColor: isDark ? 'rgba(74,222,128,0.3)' : 'rgba(34,197,94,0.25)' }]}>
              <Text style={styles.successIcon}>✉️</Text>
              <Text style={[styles.successTitle, { color: isDark ? '#4ADE80' : '#16A34A' }]}>
                Email envoyé !
              </Text>
              <Text style={[styles.successText, { color: LAV }]}>
                Si un compte existe avec l'adresse <Text style={{ fontWeight: '700', color: GOLD }}>{email}</Text>, vous recevrez un lien de réinitialisation dans quelques minutes.
              </Text>
              <Text style={[styles.successHint, { color: LAV_DIM }]}>
                Vérifiez aussi vos spams.
              </Text>
              <Pressable
                style={({ pressed }) => [styles.backToLoginBtn, { borderColor: GOLD, opacity: pressed ? 0.7 : 1 }]}
                onPress={() => router.replace('/(auth)/signin' as never)}
              >
                <Text style={[styles.backToLoginText, { color: GOLD }]}>Retour à la connexion</Text>
              </Pressable>
            </View>
          ) : (
            /* Form */
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
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Pressable
                style={({ pressed }) => [
                  styles.submitButton,
                  { backgroundColor: GOLD, shadowColor: GOLD, opacity: pressed || isLoading ? 0.8 : 1 },
                ]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading
                  ? <ActivityIndicator color={BG} />
                  : <Text style={[styles.submitButtonText, { color: BG }]}>Envoyer le lien</Text>
                }
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.cancelButton, { opacity: pressed ? 0.6 : 1 }]}
                onPress={() => router.back()}
              >
                <Text style={[styles.cancelText, { color: LAV }]}>Annuler</Text>
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
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 15,
      lineHeight: 22,
      textAlign: 'center',
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
    successHint: {
      fontSize: 12,
      textAlign: 'center',
    },
    backToLoginBtn: {
      marginTop: 8,
      borderRadius: 999,
      borderWidth: 1.5,
      paddingHorizontal: 24,
      paddingVertical: 12,
    },
    backToLoginText: {
      fontSize: 15,
      fontWeight: '700',
    },
  });
}
