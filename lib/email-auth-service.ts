/**
 * Frontend service for email/password authentication.
 * Calls the backend Express routes (not tRPC).
 */
import { getApiBaseUrl } from "@/constants/oauth";
import * as Auth from "@/lib/_core/auth";

function apiUrl(path: string) {
  const base = getApiBaseUrl();
  const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
  return `${cleanBase}${path}`;
}

async function post<T>(path: string, body: object): Promise<T> {
  const res = await fetch(apiUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Erreur serveur");
  }
  return data as T;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(apiUrl(path), {
    method: "GET",
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Erreur serveur");
  }
  return data as T;
}

type AuthResponse = {
  success: boolean;
  sessionToken: string;
  user: {
    id: number;
    openId: string;
    name: string | null;
    email: string | null;
    loginMethod: string | null;
    lastSignedIn: string;
  };
};

export async function registerWithEmail(
  email: string,
  password: string,
  name?: string,
): Promise<AuthResponse> {
  const result = await post<AuthResponse>("/api/auth/register", { email, password, name });
  // Store session token for native
  await Auth.setSessionToken(result.sessionToken);
  await Auth.setUserInfo({
    id: result.user.id,
    openId: result.user.openId,
    name: result.user.name,
    email: result.user.email,
    loginMethod: result.user.loginMethod,
    lastSignedIn: new Date(result.user.lastSignedIn),
  });
  return result;
}

export async function loginWithEmail(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const result = await post<AuthResponse>("/api/auth/login", { email, password });
  // Store session token for native
  await Auth.setSessionToken(result.sessionToken);
  await Auth.setUserInfo({
    id: result.user.id,
    openId: result.user.openId,
    name: result.user.name,
    email: result.user.email,
    loginMethod: result.user.loginMethod,
    lastSignedIn: new Date(result.user.lastSignedIn),
  });
  return result;
}

export async function forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
  return post("/api/auth/forgot-password", { email });
}

export async function validateResetToken(token: string): Promise<{ valid: boolean }> {
  return get(`/api/auth/reset-password/validate?token=${encodeURIComponent(token)}`);
}

export async function resetPassword(
  token: string,
  password: string,
): Promise<AuthResponse> {
  const result = await post<AuthResponse>("/api/auth/reset-password", { token, password });
  await Auth.setSessionToken(result.sessionToken);
  await Auth.setUserInfo({
    id: result.user.id,
    openId: result.user.openId,
    name: result.user.name,
    email: result.user.email,
    loginMethod: result.user.loginMethod,
    lastSignedIn: new Date(result.user.lastSignedIn),
  });
  return result;
}
