/**
 * Email/Password authentication routes for SomnioPax.
 * Handles: register, login, forgot-password, reset-password.
 *
 * Password hashing: bcryptjs (cost factor 12)
 * Session: same JWT mechanism as OAuth (sdk.createSessionToken)
 * Reset tokens: 64-byte random hex, 1-hour TTL, single-use
 * Email: nodemailer (SMTP via env vars, or console fallback in dev)
 */
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import type { Express, Request, Response } from "express";
import {
  createEmailUser,
  getEmailAuthByEmail,
  getUserById,
  updateUserLastSignedIn,
  createPasswordResetToken,
  getValidPasswordResetToken,
  consumePasswordResetToken,
  updateEmailPassword,
} from "../db";
import { sdk } from "./sdk";
import { getSessionCookieOptions } from "./cookies";
import { COOKIE_NAME, ONE_YEAR_MS } from "../../shared/const.js";

// ─── Email transport ──────────────────────────────────────────────────────────

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT ?? "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  // Dev fallback: log emails to console
  return nodemailer.createTransport({
    streamTransport: true,
    newline: "unix",
    buffer: true,
  });
}

async function sendResetEmail(to: string, token: string, baseUrl: string) {
  const resetLink = `${baseUrl}/reset-password?token=${token}`;
  const transport = createTransport();

  const mailOptions = {
    from: process.env.SMTP_FROM ?? "SomnioPax <noreply@somniopax.app>",
    to,
    subject: "Réinitialisation de votre mot de passe SomnioPax",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0D0B1A; color: #EDE8DC; border-radius: 16px;">
        <h1 style="color: #C8A96E; font-size: 24px; margin-bottom: 8px;">SomnioPax 🌙</h1>
        <h2 style="font-size: 18px; margin-bottom: 16px;">Réinitialisation de mot de passe</h2>
        <p style="color: rgba(237,232,220,0.75); line-height: 1.6; margin-bottom: 24px;">
          Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe.
          Ce lien est valable <strong>1 heure</strong>.
        </p>
        <a href="${resetLink}" style="display: inline-block; background: #C8A96E; color: #0D0B1A; padding: 14px 28px; border-radius: 999px; font-weight: 700; text-decoration: none; font-size: 16px;">
          Réinitialiser mon mot de passe
        </a>
        <p style="color: rgba(237,232,220,0.45); font-size: 12px; margin-top: 24px; line-height: 1.5;">
          Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre mot de passe ne sera pas modifié.
          <br/>Lien direct : ${resetLink}
        </p>
      </div>
    `,
    text: `SomnioPax — Réinitialisation de mot de passe\n\nCliquez sur ce lien pour réinitialiser votre mot de passe (valable 1 heure) :\n${resetLink}\n\nSi vous n'avez pas demandé cette réinitialisation, ignorez cet email.`,
  };

  try {
    const info = await transport.sendMail(mailOptions);
    // In dev (streamTransport), log the email content
    if ((info as any).message) {
      const msg = (info as any).message.toString();
      console.log("[EmailAuth] DEV MODE — Reset email content:\n", msg);
      console.log(`[EmailAuth] DEV MODE — Reset link: ${resetLink}`);
    }
  } catch (err) {
    console.error("[EmailAuth] Failed to send email:", err);
    // Log the reset link so dev can still test
    console.log(`[EmailAuth] DEV MODE — Reset link (fallback): ${resetLink}`);
  }
}

// ─── Helper to build user response ───────────────────────────────────────────

function buildUserResponse(user: { id: number; openId: string; name: string | null; email: string | null; loginMethod: string | null; lastSignedIn: Date }) {
  return {
    id: user.id,
    openId: user.openId,
    name: user.name,
    email: user.email,
    loginMethod: user.loginMethod,
    lastSignedIn: user.lastSignedIn.toISOString(),
  };
}

// ─── Route registration ───────────────────────────────────────────────────────

export function registerEmailAuthRoutes(app: Express) {
  // POST /api/auth/register
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { email, password, name } = req.body as { email?: string; password?: string; name?: string };

      if (!email || !password) {
        res.status(400).json({ error: "Email et mot de passe requis." });
        return;
      }

      const emailLower = email.toLowerCase().trim();

      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLower)) {
        res.status(400).json({ error: "Format d'email invalide." });
        return;
      }

      // Validate password strength
      if (password.length < 8) {
        res.status(400).json({ error: "Le mot de passe doit contenir au moins 8 caractères." });
        return;
      }

      // Check if email already exists
      const existing = await getEmailAuthByEmail(emailLower);
      if (existing) {
        res.status(409).json({ error: "Un compte existe déjà avec cet email." });
        return;
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Create user
      const { userId } = await createEmailUser({
        email: emailLower,
        passwordHash,
        name: name?.trim() || emailLower.split("@")[0],
      });

      // Get created user
      const user = await getUserById(userId);
      if (!user) {
        res.status(500).json({ error: "Erreur lors de la création du compte." });
        return;
      }

      // Create session token
      const sessionToken = await sdk.createSessionToken(user.openId, {
        name: user.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      // Set cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.status(201).json({
        success: true,
        sessionToken,
        user: buildUserResponse(user),
      });
    } catch (err) {
      console.error("[EmailAuth] Register error:", err);
      res.status(500).json({ error: "Erreur serveur lors de l'inscription." });
    }
  });

  // POST /api/auth/login
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body as { email?: string; password?: string };

      if (!email || !password) {
        res.status(400).json({ error: "Email et mot de passe requis." });
        return;
      }

      const emailLower = email.toLowerCase().trim();

      // Find email auth record
      const authRecord = await getEmailAuthByEmail(emailLower);
      if (!authRecord) {
        // Use generic error to prevent email enumeration
        res.status(401).json({ error: "Email ou mot de passe incorrect." });
        return;
      }

      // Verify password
      const isValid = await bcrypt.compare(password, authRecord.passwordHash);
      if (!isValid) {
        res.status(401).json({ error: "Email ou mot de passe incorrect." });
        return;
      }

      // Get user
      const user = await getUserById(authRecord.userId);
      if (!user) {
        res.status(500).json({ error: "Compte introuvable." });
        return;
      }

      // Update last signed in
      await updateUserLastSignedIn(user.id);

      // Create session token
      const sessionToken = await sdk.createSessionToken(user.openId, {
        name: user.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      // Set cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({
        success: true,
        sessionToken,
        user: buildUserResponse(user),
      });
    } catch (err) {
      console.error("[EmailAuth] Login error:", err);
      res.status(500).json({ error: "Erreur serveur lors de la connexion." });
    }
  });

  // POST /api/auth/forgot-password
  app.post("/api/auth/forgot-password", async (req: Request, res: Response) => {
    try {
      const { email } = req.body as { email?: string };

      if (!email) {
        res.status(400).json({ error: "Email requis." });
        return;
      }

      const emailLower = email.toLowerCase().trim();

      // Always return success to prevent email enumeration
      const authRecord = await getEmailAuthByEmail(emailLower);
      if (authRecord) {
        // Generate secure random token
        const token = crypto.randomBytes(32).toString("hex");
        await createPasswordResetToken(authRecord.userId, token);

        // Build base URL for reset link
        const baseUrl =
          process.env.EXPO_WEB_PREVIEW_URL ||
          process.env.EXPO_PACKAGER_PROXY_URL ||
          `${req.protocol}://${req.get("host")}`;

        await sendResetEmail(emailLower, token, baseUrl);
      }

      // Always return success (security: don't reveal if email exists)
      res.json({
        success: true,
        message: "Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.",
      });
    } catch (err) {
      console.error("[EmailAuth] Forgot password error:", err);
      res.status(500).json({ error: "Erreur serveur." });
    }
  });

  // GET /api/auth/reset-password/validate?token=xxx
  app.get("/api/auth/reset-password/validate", async (req: Request, res: Response) => {
    try {
      const token = req.query.token as string;
      if (!token) {
        res.status(400).json({ valid: false, error: "Token manquant." });
        return;
      }
      const row = await getValidPasswordResetToken(token);
      if (!row) {
        res.status(400).json({ valid: false, error: "Lien invalide ou expiré." });
        return;
      }
      res.json({ valid: true });
    } catch (err) {
      console.error("[EmailAuth] Validate token error:", err);
      res.status(500).json({ valid: false, error: "Erreur serveur." });
    }
  });

  // POST /api/auth/reset-password
  app.post("/api/auth/reset-password", async (req: Request, res: Response) => {
    try {
      const { token, password } = req.body as { token?: string; password?: string };

      if (!token || !password) {
        res.status(400).json({ error: "Token et nouveau mot de passe requis." });
        return;
      }

      if (password.length < 8) {
        res.status(400).json({ error: "Le mot de passe doit contenir au moins 8 caractères." });
        return;
      }

      // Consume token (validates + marks as used)
      const userId = await consumePasswordResetToken(token);
      if (!userId) {
        res.status(400).json({ error: "Lien invalide ou expiré." });
        return;
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(password, 12);
      await updateEmailPassword(userId, passwordHash);

      // Get user and create new session
      const user = await getUserById(userId);
      if (!user) {
        res.status(500).json({ error: "Compte introuvable." });
        return;
      }

      await updateUserLastSignedIn(userId);

      const sessionToken = await sdk.createSessionToken(user.openId, {
        name: user.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({
        success: true,
        sessionToken,
        user: buildUserResponse(user),
        message: "Mot de passe réinitialisé avec succès.",
      });
    } catch (err) {
      console.error("[EmailAuth] Reset password error:", err);
      res.status(500).json({ error: "Erreur serveur lors de la réinitialisation." });
    }
  });
}
