import React, { useState } from "react";
import { Pressable, Text, View, StyleSheet, ActivityIndicator, Image } from "react-native";
import { signInWithGoogle } from "@/lib/google-auth-service";
import { useThemeContext } from "@/lib/theme-provider";
import type { User } from "@/lib/_core/auth";

interface GoogleSignInButtonProps {
  onSuccess: (user: User, sessionToken: string) => void;
  onError?: (error: string) => void;
  label?: string;
}

export function GoogleSignInButton({ onSuccess, onError, label = "Continuer avec Google" }: GoogleSignInButtonProps) {
  const { isDark } = useThemeContext();
  const [isLoading, setIsLoading] = useState(false);

  const BG     = isDark ? "#2A2540" : "#FFFFFF";
  const BORDER = isDark ? "rgba(200,169,110,0.25)" : "rgba(0,0,0,0.12)";
  const TEXT   = isDark ? "#EDE8DC" : "#3C4043";

  async function handlePress() {
    setIsLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.success && result.user && result.sessionToken) {
        onSuccess(result.user, result.sessionToken);
      } else if (result.error) {
        onError?.(result.error);
      }
    } catch (err: any) {
      onError?.(err?.message ?? "Erreur de connexion Google.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: BG,
          borderColor: BORDER,
          opacity: pressed || isLoading ? 0.75 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
      onPress={handlePress}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color={isDark ? "#C8A96E" : "#4285F4"} size="small" />
      ) : (
        <>
          {/* Google "G" logo using colored squares */}
          <View style={styles.googleLogo}>
            <Text style={styles.googleG}>G</Text>
          </View>
          <Text style={[styles.label, { color: TEXT }]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 12,
    minHeight: 52,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  googleLogo: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#4285F4",
    alignItems: "center",
    justifyContent: "center",
  },
  googleG: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
    lineHeight: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
  },
});
