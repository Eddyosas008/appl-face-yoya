/**
 * Change Password Screen
 * Allows authenticated users to change their password from their profile.
 * - Users with email/password: must provide current password
 * - Users with Google/OAuth only: can set a password for the first time
 */
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { changePassword } from "@/lib/email-auth-service";
import { useAuth } from "@/hooks/use-auth";

// ─── Password strength ────────────────────────────────────────────────────────

function getPasswordStrength(password: string): {
  score: number; // 0-4
  label: string;
  color: string;
} {
  if (!password) return { score: 0, label: "", color: "#334155" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: "Très faible", color: "#EF4444" };
  if (score === 2) return { score: 2, label: "Faible", color: "#F59E0B" };
  if (score === 3) return { score: 3, label: "Moyen", color: "#3B82F6" };
  if (score === 4) return { score: 4, label: "Fort", color: "#22C55E" };
  return { score: 4, label: "Très fort", color: "#10B981" };
}

// ─── Eye icon ─────────────────────────────────────────────────────────────────

function EyeIcon({ visible }: { visible: boolean }) {
  return (
    <Text style={{ fontSize: 18, color: "rgba(200,169,110,0.7)" }}>
      {visible ? "👁" : "🙈"}
    </Text>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function ChangePasswordScreen() {
  const colors = useColors();
  const { user } = useAuth();

  // Determine if user has email/password (loginMethod === 'email')
  const hasEmailAuth = user?.loginMethod === "email";

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const successOpacity = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0.8)).current;

  const newPasswordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const strength = getPasswordStrength(newPassword);

  const handleSubmit = async () => {
    setError(null);

    // Validation
    if (hasEmailAuth && !currentPassword) {
      setError("Veuillez saisir votre mot de passe actuel.");
      return;
    }
    if (!newPassword) {
      setError("Veuillez saisir un nouveau mot de passe.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (hasEmailAuth && newPassword === currentPassword) {
      setError("Le nouveau mot de passe doit être différent de l'ancien.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await changePassword(
        hasEmailAuth ? currentPassword : null,
        newPassword,
      );

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      setSuccessMessage(result.message);
      setSuccess(true);

      // Animate success
      Animated.parallel([
        Animated.spring(successScale, { toValue: 1, useNativeDriver: true }),
        Animated.timing(successOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();

      // Auto-navigate back after 2.5s
      setTimeout(() => {
        router.back();
      }, 2500);
    } catch (err: unknown) {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <ScreenContainer>
        <View style={styles.successContainer}>
          <Animated.View
            style={[
              styles.successCard,
              { backgroundColor: colors.surface, borderColor: "rgba(34,197,94,0.3)" },
              { opacity: successOpacity, transform: [{ scale: successScale }] },
            ]}
          >
            <Text style={styles.successIcon}>✅</Text>
            <Text style={[styles.successTitle, { color: colors.foreground }]}>
              Mot de passe modifié
            </Text>
            <Text style={[styles.successSubtitle, { color: colors.muted }]}>
              {successMessage}
            </Text>
            <Text style={[styles.successHint, { color: colors.muted }]}>
              Redirection en cours…
            </Text>
          </Animated.View>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={[styles.backButton, { backgroundColor: colors.surface }]}
            >
              <Text style={{ color: colors.foreground, fontSize: 18 }}>←</Text>
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={[styles.headerTitle, { color: colors.foreground }]}>
                {hasEmailAuth ? "Changer le mot de passe" : "Créer un mot de passe"}
              </Text>
              <Text style={[styles.headerSubtitle, { color: colors.muted }]}>
                {hasEmailAuth
                  ? "Saisissez votre mot de passe actuel puis le nouveau"
                  : "Ajoutez un mot de passe à votre compte Google"}
              </Text>
            </View>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Info banner for OAuth users */}
            {!hasEmailAuth && (
              <View style={[styles.infoBanner, { backgroundColor: "rgba(200,169,110,0.1)", borderColor: "rgba(200,169,110,0.3)" }]}>
                <Text style={{ fontSize: 16 }}>ℹ️</Text>
                <Text style={[styles.infoBannerText, { color: colors.muted }]}>
                  Votre compte est connecté via Google. Vous pouvez définir un mot de passe pour vous connecter également par email.
                </Text>
              </View>
            )}

            {/* Current password (only for email users) */}
            {hasEmailAuth && (
              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: colors.foreground }]}>
                  Mot de passe actuel
                </Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <TextInput
                    style={[styles.input, { color: colors.foreground }]}
                    placeholder="Votre mot de passe actuel"
                    placeholderTextColor={colors.muted}
                    secureTextEntry={!showCurrent}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    returnKeyType="next"
                    onSubmitEditing={() => newPasswordRef.current?.focus()}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    onPress={() => setShowCurrent(!showCurrent)}
                    style={styles.eyeButton}
                  >
                    <EyeIcon visible={showCurrent} />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* New password */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.foreground }]}>
                Nouveau mot de passe
              </Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <TextInput
                  ref={newPasswordRef}
                  style={[styles.input, { color: colors.foreground }]}
                  placeholder="Au moins 8 caractères"
                  placeholderTextColor={colors.muted}
                  secureTextEntry={!showNew}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  returnKeyType="next"
                  onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowNew(!showNew)}
                  style={styles.eyeButton}
                >
                  <EyeIcon visible={showNew} />
                </TouchableOpacity>
              </View>

              {/* Strength meter */}
              {newPassword.length > 0 && (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthBars}>
                    {[1, 2, 3, 4].map((level) => (
                      <View
                        key={level}
                        style={[
                          styles.strengthBar,
                          {
                            backgroundColor:
                              strength.score >= level ? strength.color : colors.border,
                          },
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={[styles.strengthLabel, { color: strength.color }]}>
                    {strength.label}
                  </Text>
                </View>
              )}

              {/* Hints */}
              <View style={styles.hintsContainer}>
                {[
                  { text: "8 caractères minimum", ok: newPassword.length >= 8 },
                  { text: "Une majuscule", ok: /[A-Z]/.test(newPassword) },
                  { text: "Un chiffre", ok: /[0-9]/.test(newPassword) },
                ].map((hint) => (
                  <Text
                    key={hint.text}
                    style={[
                      styles.hint,
                      { color: hint.ok ? "#22C55E" : colors.muted },
                    ]}
                  >
                    {hint.ok ? "✓" : "○"} {hint.text}
                  </Text>
                ))}
              </View>
            </View>

            {/* Confirm password */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.foreground }]}>
                Confirmer le nouveau mot de passe
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: colors.surface,
                    borderColor:
                      confirmPassword && confirmPassword !== newPassword
                        ? "#EF4444"
                        : confirmPassword && confirmPassword === newPassword
                        ? "#22C55E"
                        : colors.border,
                  },
                ]}
              >
                <TextInput
                  ref={confirmPasswordRef}
                  style={[styles.input, { color: colors.foreground }]}
                  placeholder="Répétez le nouveau mot de passe"
                  placeholderTextColor={colors.muted}
                  secureTextEntry={!showConfirm}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirm(!showConfirm)}
                  style={styles.eyeButton}
                >
                  <EyeIcon visible={showConfirm} />
                </TouchableOpacity>
              </View>
              {confirmPassword.length > 0 && confirmPassword !== newPassword && (
                <Text style={[styles.matchError, { color: "#EF4444" }]}>
                  Les mots de passe ne correspondent pas
                </Text>
              )}
              {confirmPassword.length > 0 && confirmPassword === newPassword && (
                <Text style={[styles.matchError, { color: "#22C55E" }]}>
                  ✓ Les mots de passe correspondent
                </Text>
              )}
            </View>

            {/* Error */}
            {error && (
              <View style={[styles.errorBox, { backgroundColor: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.3)" }]}>
                <Text style={[styles.errorText, { color: "#EF4444" }]}>⚠️ {error}</Text>
              </View>
            )}

            {/* Submit button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isLoading}
              style={[
                styles.submitButton,
                { opacity: isLoading ? 0.7 : 1 },
              ]}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#0D0B1A" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {hasEmailAuth ? "Modifier le mot de passe" : "Créer le mot de passe"}
                </Text>
              )}
            </TouchableOpacity>

            {/* Forgot password link */}
            {hasEmailAuth && (
              <TouchableOpacity
                onPress={() => router.push("/(auth)/forgot-password")}
                style={styles.forgotLink}
              >
                <Text style={[styles.forgotLinkText, { color: "rgba(200,169,110,0.8)" }]}>
                  Mot de passe oublié ? Réinitialiser par email
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 14,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  form: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 20,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    height: 52,
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: "100%",
  },
  eyeButton: {
    padding: 4,
    marginLeft: 8,
  },
  strengthContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
  },
  strengthBars: {
    flexDirection: "row",
    gap: 4,
    flex: 1,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: "600",
    minWidth: 60,
    textAlign: "right",
  },
  hintsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  hint: {
    fontSize: 12,
  },
  matchError: {
    fontSize: 12,
    marginTop: 2,
  },
  errorBox: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
  },
  submitButton: {
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#C8A96E",
    marginTop: 4,
  },
  submitButtonText: {
    color: "#0D0B1A",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  forgotLink: {
    alignItems: "center",
    paddingVertical: 8,
  },
  forgotLinkText: {
    fontSize: 13,
    textDecorationLine: "underline",
  },
  // Success state
  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  successCard: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 24,
    borderWidth: 1,
    padding: 36,
    alignItems: "center",
    gap: 12,
  },
  successIcon: {
    fontSize: 52,
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  successSubtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  successHint: {
    fontSize: 13,
    marginTop: 8,
  },
});
