/**
 * Google OAuth 2.0 authentication routes for SomnioPax.
 *
 * Flows:
 * 1. Web: GET /api/auth/google → redirect to Google → GET /api/auth/google/callback → session cookie
 * 2. Native: POST /api/auth/google/token → verify idToken → session JWT (Bearer)
 */
import type { Express, Request, Response } from "express";
import { upsertUser, getUserByOpenId } from "../db";
import { sdk } from "./sdk";
import { getSessionCookieOptions } from "./cookies";
import { COOKIE_NAME, ONE_YEAR_MS } from "../../shared/const.js";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? "";
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";
const GOOGLE_TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo";

function getCallbackUrl(req: Request): string {
  // Use the API server URL for the callback
  const apiBase = process.env.EXPO_PUBLIC_API_BASE_URL ?? `${req.protocol}://${req.hostname}`;
  return `${apiBase}/api/auth/google/callback`;
}

function getAppRedirectUrl(req: Request): string {
  // After successful auth, redirect to the app
  const apiBase = process.env.EXPO_PUBLIC_API_BASE_URL ?? `${req.protocol}://${req.hostname}`;
  // Replace port 3000 with 8081 for the Metro dev server
  const appBase = apiBase.replace(/^(https?:\/\/)(3000-)/, "$18081-");
  return `${appBase}/oauth/google-success`;
}

interface GoogleUserInfo {
  sub: string;       // Google user ID
  email: string;
  name: string;
  picture?: string;
  email_verified?: boolean;
}

async function fetchGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch Google user info: ${res.status}`);
  }
  return res.json() as Promise<GoogleUserInfo>;
}

async function exchangeCodeForTokens(code: string, redirectUri: string) {
  const body = new URLSearchParams({
    code,
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google token exchange failed: ${err}`);
  }
  return res.json() as Promise<{ access_token: string; id_token?: string }>;
}

async function verifyGoogleIdToken(idToken: string): Promise<GoogleUserInfo> {
  const res = await fetch(`${GOOGLE_TOKEN_INFO_URL}?id_token=${idToken}`);
  if (!res.ok) {
    throw new Error("Invalid Google ID token");
  }
  const data = await res.json() as any;
  if (data.aud !== GOOGLE_CLIENT_ID) {
    throw new Error("Google ID token audience mismatch");
  }
  return {
    sub: data.sub,
    email: data.email,
    name: data.name ?? data.email,
    picture: data.picture,
    email_verified: data.email_verified === "true" || data.email_verified === true,
  };
}

async function syncGoogleUser(googleUser: GoogleUserInfo) {
  const openId = `google:${googleUser.sub}`;
  await upsertUser({
    openId,
    email: googleUser.email,
    name: googleUser.name,
    loginMethod: "google",
    lastSignedIn: new Date(),
  });
  const saved = await getUserByOpenId(openId);
  return saved ?? {
    openId,
    email: googleUser.email,
    name: googleUser.name,
    loginMethod: "google",
    lastSignedIn: new Date(),
  };
}

export function registerGoogleAuthRoutes(app: Express) {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.warn("[GoogleAuth] GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set — Google auth disabled");
    return;
  }

  // ─── Step 1: Redirect to Google ───────────────────────────────────────────
  app.get("/api/auth/google", (req: Request, res: Response) => {
    const callbackUrl = getCallbackUrl(req);
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: callbackUrl,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "select_account",
    });
    res.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);
  });

  // ─── Step 2: Handle Google callback ──────────────────────────────────────
  app.get("/api/auth/google/callback", async (req: Request, res: Response) => {
    const code = req.query.code as string;
    const error = req.query.error as string;

    if (error || !code) {
      const appBase = getAppRedirectUrl(req).replace("/oauth/google-success", "");
      res.redirect(`${appBase}/(auth)/signin?error=google_cancelled`);
      return;
    }

    try {
      const callbackUrl = getCallbackUrl(req);
      const tokens = await exchangeCodeForTokens(code, callbackUrl);
      const googleUser = await fetchGoogleUserInfo(tokens.access_token);
      const user = await syncGoogleUser(googleUser);

      const sessionToken = await sdk.createSessionToken(user.openId!, {
        name: user.name ?? "",
        expiresInMs: ONE_YEAR_MS,
      });

      // Set session cookie (web)
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      // Redirect to app success page with token for native deep link
      const appRedirect = getAppRedirectUrl(req);
      res.redirect(`${appRedirect}?token=${encodeURIComponent(sessionToken)}&userId=${(user as any).id ?? ""}`);
    } catch (err) {
      console.error("[GoogleAuth] Callback error:", err);
      const appBase = getAppRedirectUrl(req).replace("/oauth/google-success", "");
      res.redirect(`${appBase}/(auth)/signin?error=google_failed`);
    }
  });

  // ─── Native flow: verify idToken from expo-auth-session ──────────────────
  app.post("/api/auth/google/token", async (req: Request, res: Response) => {
    try {
      const { idToken, accessToken } = req.body as { idToken?: string; accessToken?: string };

      let googleUser: GoogleUserInfo;

      if (idToken) {
        googleUser = await verifyGoogleIdToken(idToken);
      } else if (accessToken) {
        googleUser = await fetchGoogleUserInfo(accessToken);
      } else {
        res.status(400).json({ error: "idToken ou accessToken requis." });
        return;
      }

      const user = await syncGoogleUser(googleUser);
      const sessionToken = await sdk.createSessionToken(user.openId!, {
        name: user.name ?? "",
        expiresInMs: ONE_YEAR_MS,
      });

      // Also set cookie for web
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({
        success: true,
        sessionToken,
        user: {
          id: (user as any).id ?? null,
          openId: user.openId,
          name: user.name,
          email: user.email,
          loginMethod: "google",
          lastSignedIn: (user.lastSignedIn ?? new Date()).toISOString(),
        },
      });
    } catch (err: any) {
      console.error("[GoogleAuth] Token verification error:", err);
      res.status(401).json({ error: err?.message ?? "Authentification Google échouée." });
    }
  });

  console.log("[GoogleAuth] Google OAuth routes registered");
}
