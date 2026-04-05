/**
 * Google OAuth service for SomnioPax.
 *
 * Web: redirects to /api/auth/google which redirects to Google, then back to the app.
 * Native: uses expo-auth-session to get an access token, then calls /api/auth/google/token.
 */
import { Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { getApiBaseUrl } from "@/constants/oauth";
import { setSessionToken, setUserInfo } from "@/lib/_core/auth";
import type { User } from "@/lib/_core/auth";

// Required for expo-auth-session to work on web
WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export interface GoogleAuthResult {
  success: boolean;
  user?: User;
  sessionToken?: string;
  error?: string;
}

/**
 * Start Google OAuth flow.
 * - Web: redirects to backend which handles the full OAuth dance
 * - Native: uses expo-auth-session with PKCE
 */
export async function signInWithGoogle(): Promise<GoogleAuthResult> {
  const apiBase = getApiBaseUrl();

  if (Platform.OS === "web") {
    // Web: redirect to backend Google auth endpoint
    if (typeof window !== "undefined") {
      window.location.href = `${apiBase}/api/auth/google`;
    }
    return { success: false }; // Will redirect
  }

  // Native: use expo-auth-session
  return signInWithGoogleNative(apiBase);
}

async function signInWithGoogleNative(apiBase: string): Promise<GoogleAuthResult> {
  try {
    // Use the backend as the authorization endpoint proxy
    // This avoids needing the Google Client ID in the frontend
    const redirectUri = AuthSession.makeRedirectUri({ scheme: "manus20260331160814" });

    const discovery = {
      authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenEndpoint: "https://oauth2.googleapis.com/token",
    };

    // If no client ID is available in frontend, fall back to backend web flow via browser
    if (!GOOGLE_CLIENT_ID) {
      return signInWithGoogleViaBrowser(apiBase);
    }

    const request = new AuthSession.AuthRequest({
      clientId: GOOGLE_CLIENT_ID,
      scopes: ["openid", "email", "profile"],
      redirectUri,
      usePKCE: true,
    });

    const result = await request.promptAsync(discovery);

    if (result.type !== "success") {
      return { success: false, error: result.type === "cancel" ? "Connexion annulée." : "Connexion Google échouée." };
    }

    // Exchange code for token via our backend
    const response = await fetch(`${apiBase}/api/auth/google/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        accessToken: result.params.access_token,
        code: result.params.code,
        codeVerifier: request.codeVerifier,
        redirectUri,
      }),
    });

    if (!response.ok) {
      const err = await response.json() as { error?: string };
      return { success: false, error: err.error ?? "Erreur d'authentification Google." };
    }

    const data = await response.json() as { success: boolean; sessionToken: string; user: User };

    // Store session token for native
    await setSessionToken(data.sessionToken);
    await setUserInfo(data.user);

    return { success: true, user: data.user, sessionToken: data.sessionToken };
  } catch (err: any) {
    console.error("[GoogleAuth] Native error:", err);
    return { success: false, error: err?.message ?? "Erreur de connexion Google." };
  }
}

async function signInWithGoogleViaBrowser(apiBase: string): Promise<GoogleAuthResult> {
  try {
    const googleUrl = `${apiBase}/api/auth/google`;
    const result = await WebBrowser.openAuthSessionAsync(googleUrl, "manus20260331160814://oauth/google-success");

    if (result.type !== "success") {
      return { success: false, error: "Connexion annulée." };
    }

    // Parse token from redirect URL
    const url = result.url;
    const params = new URL(url);
    const token = params.searchParams.get("token");

    if (!token) {
      return { success: false, error: "Token manquant dans la réponse Google." };
    }

    // Verify token with backend
    const meRes = await fetch(`${apiBase}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    });

    if (!meRes.ok) {
      return { success: false, error: "Impossible de vérifier la session Google." };
    }

    const user = await meRes.json() as User;
    await setSessionToken(token);
    await setUserInfo(user);

    return { success: true, user, sessionToken: token };
  } catch (err: any) {
    return { success: false, error: err?.message ?? "Erreur de connexion Google." };
  }
}

/**
 * Handle Google OAuth callback from deep link (native).
 * Called from app/oauth/google-success.tsx
 */
export async function handleGoogleCallback(url: string): Promise<GoogleAuthResult> {
  try {
    const params = new URL(url);
    const token = params.searchParams.get("token");

    if (!token) {
      return { success: false, error: "Token manquant." };
    }

    const apiBase = getApiBaseUrl();
    const meRes = await fetch(`${apiBase}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    });

    if (!meRes.ok) {
      return { success: false, error: "Session invalide." };
    }

    const user = await meRes.json() as User;
    await setSessionToken(token);
    await setUserInfo(user);

    return { success: true, user, sessionToken: token };
  } catch (err: any) {
    return { success: false, error: err?.message ?? "Erreur." };
  }
}
