import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, StyleSheet, Pressable,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { StarField } from '@/components/star-field';
import { useUser } from '@/lib/user-context';
import { useThemeContext } from '@/lib/theme-provider';
import { registerWithEmail } from '@/lib/email-auth-service';
import { GoogleSignInButton } from '@/components/google-sign-in-button';
import {
  useSignUpValidation,
  getPasswordStrength,
  getStrengthLabel,
  getStrengthColor,
  getStrengthFill,
} from '@/hooks/use-form-validation';
import type { User } from '@/lib/_core/auth';

const SUCCESS_COLOR = '#4ADE80';
const ERROR_COLOR   = '#F87171';

export default function SignUpScreen() {
  const { signup } = useUser();
  const { isDark } = useThemeContext();
  const styles = useMemo(() => makeStyles(), []);
  const v = useSignUpValidation();

  const [name, setName]                       = useState('');
  const [email, setEmail]                     = useState('');
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading]             = useState(false);
  const [serverError, setServerError]         = useState('');

  // Palette
  const BG      = isDark ? '#0D0B1A' : '#FAF7F2';
  const GOLD    = isDark ? '#C8A96E' : '#8B6914';
  const WHITE   = isDark ? '#EDE8DC' : '#1C1410';
  const LAV     = isDark ? 'rgba(240,235,224,0.65)' : 'rgba(80,60,140,0.70)';
  const LAV_DIM = isDark ? 'rgba(240,235,224,0.45)' : 'rgba(80,60,140,0.40)';
  const BORDER  = isDark ? 'rgba(200,169,110,0.40)' : 'rgba(120,100,180,0.18)';
  const GLASS   = isDark ? '#2A2540' : 'rgba(255,255,255,0.75)';
  const TRACK   = isDark ? '#3A3555' : '#E5E7EB';

  // Force du mot de passe
  const strength      = getPasswordStrength(password);
  const strengthLabel = getStrengthLabel(strength);
  const strengthColor = getStrengthColor(strength);
  const strengthFill  = getStrengthFill(strength);

  type SignUpField = 'firstName' | 'email' | 'password' | 'confirmPassword';

  function getBorderColor(field: SignUpField): string {
    const valid = v.isFieldValid(field);
    if (valid === true)  return SUCCESS_COLOR;
    if (valid === false) return ERROR_COLOR;
    return BORDER;
  }

  function getLabelColor(field: SignUpField): string {
    const valid = v.isFieldValid(field);
    if (valid === true)  return SUCCESS_COLOR;
    if (valid === false) return ERROR_COLOR;
    return GOLD;
  }

  async function handleSignUp() {
    setServerError('');
    const isValid = v.validate(name, email, password, confirmPassword);
    if (!isValid) return;
    setIsLoading(true);
    try {
      const result = await registerWithEmail(email.trim(), password, name.trim() || undefined);
      await signup(result.user.email ?? email, password);
    } catch (e: any) {
      setServerError(e?.message ?? 'Erreur lors de la création du compte.');
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
            <Text style={[styles.title, { color: WHITE }]}>Créer un compte</Text>
            <Text style={[styles.subtitle, { color: LAV }]}>
              Rejoignez SomnioPax et commencez votre voyage vers un meilleur sommeil.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>

            {/* ── Prénom (optionnel) ── */}
            <View style={styles.field}>
              <View style={styles.labelRow}>
                <Text style={[styles.label, { color: getLabelColor('firstName') }]}>
                  Prénom{' '}
                  <Text style={{ color: LAV_DIM, fontWeight: '400' }}>(optionnel)</Text>
                </Text>
                {v.isFieldValid('firstName') === true && (
                  <Text style={{ fontSize: 14, color: SUCCESS_COLOR }}>✓</Text>
                )}
              </View>
              <TextInput
                style={[styles.input, {
                  borderColor: getBorderColor('firstName'),
                  backgroundColor: GLASS,
                  color: WHITE,
                }]}
                placeholder="Votre prénom"
                placeholderTextColor={LAV_DIM}
                value={name}
                onChangeText={(val) => {
                  setName(val);
                  v.updateFields({ firstName: val, email, password, confirmPassword }, 'firstName');
                }}
                onBlur={() => v.touch('firstName')}
                autoCapitalize="words"
                returnKeyType="next"
              />
              {v.errors.firstName && v.isFieldValid('firstName') === false && (
                <Text style={styles.fieldError}>{v.errors.firstName}</Text>
              )}
            </View>

            {/* ── Email ── */}
            <View style={styles.field}>
              <View style={styles.labelRow}>
                <Text style={[styles.label, { color: getLabelColor('email') }]}>
                  Adresse e-mail
                </Text>
                {v.isFieldValid('email') === true && (
                  <Text style={{ fontSize: 14, color: SUCCESS_COLOR }}>✓</Text>
                )}
              </View>
              <TextInput
                style={[styles.input, {
                  borderColor: getBorderColor('email'),
                  backgroundColor: GLASS,
                  color: WHITE,
                }]}
                placeholder="votre@email.com"
                placeholderTextColor={LAV_DIM}
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  v.updateFields({ firstName: name, email: val, password, confirmPassword }, 'email');
                }}
                onBlur={() => v.touch('email')}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
              {v.errors.email && v.isFieldValid('email') === false && (
                <Text style={styles.fieldError}>{v.errors.email}</Text>
              )}
            </View>

            {/* ── Mot de passe ── */}
            <View style={styles.field}>
              <View style={styles.labelRow}>
                <Text style={[styles.label, { color: getLabelColor('password') }]}>
                  Mot de passe
                </Text>
                {v.isFieldValid('password') === true && (
                  <Text style={{ fontSize: 14, color: SUCCESS_COLOR }}>✓</Text>
                )}
              </View>
              <TextInput
                style={[styles.input, {
                  borderColor: getBorderColor('password'),
                  backgroundColor: GLASS,
                  color: WHITE,
                }]}
                placeholder="Minimum 8 caractères"
                placeholderTextColor={LAV_DIM}
                value={password}
                onChangeText={(val) => {
                  setPassword(val);
                  v.updateFields({ firstName: name, email, password: val, confirmPassword }, 'password');
                }}
                onBlur={() => v.touch('password')}
                secureTextEntry
                returnKeyType="next"
              />
              {/* Jauge de force */}
              {password.length > 0 && (
                <View style={styles.strengthRow}>
                  <View style={[styles.strengthTrack, { backgroundColor: TRACK }]}>
                    <View style={[styles.strengthFill, {
                      width: `${Math.round(strengthFill * 100)}%` as any,
                      backgroundColor: strengthColor,
                    }]} />
                  </View>
                  <Text style={[styles.strengthLabel, { color: strengthColor }]}>
                    {strengthLabel}
                  </Text>
                </View>
              )}
              {v.errors.password && v.isFieldValid('password') === false && (
                <Text style={styles.fieldError}>{v.errors.password}</Text>
              )}
            </View>

            {/* ── Confirmation ── */}
            <View style={styles.field}>
              <View style={styles.labelRow}>
                <Text style={[styles.label, { color: getLabelColor('confirmPassword') }]}>
                  Confirmer le mot de passe
                </Text>
                {v.isFieldValid('confirmPassword') === true && (
                  <Text style={{ fontSize: 14, color: SUCCESS_COLOR }}>✓</Text>
                )}
              </View>
              <TextInput
                style={[styles.input, {
                  borderColor: getBorderColor('confirmPassword'),
                  backgroundColor: GLASS,
                  color: WHITE,
                }]}
                placeholder="Répétez votre mot de passe"
                placeholderTextColor={LAV_DIM}
                value={confirmPassword}
                onChangeText={(val) => {
                  setConfirmPassword(val);
                  v.updateFields({ firstName: name, email, password, confirmPassword: val }, 'confirmPassword');
                }}
                onBlur={() => v.touch('confirmPassword')}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleSignUp}
              />
              {v.errors.confirmPassword && v.isFieldValid('confirmPassword') === false && (
                <Text style={styles.fieldError}>{v.errors.confirmPassword}</Text>
              )}
            </View>

            {/* Erreur serveur */}
            {serverError ? <Text style={styles.errorText}>{serverError}</Text> : null}

            {/* Bouton */}
            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                {
                  backgroundColor: GOLD,
                  shadowColor: GOLD,
                  opacity: pressed || isLoading ? 0.75 : 1,
                },
              ]}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              {isLoading
                ? <ActivityIndicator color={BG} />
                : <Text style={[styles.submitButtonText, { color: BG }]}>Créer mon compte</Text>
              }
            </Pressable>
          </View>

          {/* Séparateur */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: BORDER }]} />
            <Text style={[styles.dividerText, { color: LAV_DIM }]}>ou</Text>
            <View style={[styles.dividerLine, { backgroundColor: BORDER }]} />
          </View>

          {/* Google */}
          <GoogleSignInButton
            label="S'inscrire avec Google"
            onSuccess={async (user: User) => {
              await signup(user.email ?? '', '');
            }}
            onError={(err) => setServerError(err)}
          />
          <View style={{ height: 24 }} />

          {/* Lien connexion */}
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

function makeStyles() {
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
    labelRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
    },
    input: {
      borderRadius: 14,
      borderWidth: 1.5,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 15,
    },
    strengthRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginTop: 6,
    },
    strengthTrack: {
      flex: 1,
      height: 5,
      borderRadius: 3,
      overflow: 'hidden',
    },
    strengthFill: {
      height: '100%',
      borderRadius: 3,
    },
    strengthLabel: {
      fontSize: 12,
      fontWeight: '700',
      width: 42,
      textAlign: 'right',
    },
    fieldError: {
      fontSize: 12,
      color: ERROR_COLOR,
      marginTop: 2,
      lineHeight: 16,
    },
    errorText: {
      fontSize: 13,
      textAlign: 'center',
      color: ERROR_COLOR,
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
