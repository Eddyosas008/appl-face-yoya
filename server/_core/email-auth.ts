/**
 * Email/Password authentication routes for SomnioPax.
 * Handles: register, login, forgot-password, reset-password.
 *
 * Password hashing: bcryptjs (cost factor 12)
 * Session: same JWT mechanism as OAuth (sdk.createSessionToken)
 * Reset tokens: 64-byte random hex, 1-hour TTL, single-use
 * Email: Resend SDK (RESEND_API_KEY env var)
 */
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Resend } from "resend";
import type { Express, Request, Response } from "express";
import {
  createEmailUser,
  getEmailAuthByEmail,
  getEmailAuthByUserId,
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

// ─── Resend client ────────────────────────────────────────────────────────────

function getResendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

// ─── Email HTML template ──────────────────────────────────────────────────────

function buildResetEmailHtml(resetLink: string): string {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Réinitialisation de mot de passe — SomnioPax</title>
</head>
<body style="margin:0;padding:0;background:#0D0B1A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D0B1A;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:linear-gradient(135deg,#1A1630 0%,#0D0B1A 100%);border-radius:20px;border:1px solid rgba(200,169,110,0.25);overflow:hidden;">
          <tr>
            <td style="padding:36px 40px 28px;text-align:center;border-bottom:1px solid rgba(200,169,110,0.15);">
              <div style="font-size:36px;margin-bottom:12px;">🌙</div>
              <h1 style="margin:0;color:#C8A96E;font-size:26px;font-weight:700;letter-spacing:-0.5px;">SomnioPax</h1>
              <p style="margin:6px 0 0;color:rgba(237,232,220,0.5);font-size:13px;letter-spacing:1px;text-transform:uppercase;">Votre sanctuaire du bien-être</p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px;">
              <h2 style="margin:0 0 16px;color:#EDE8DC;font-size:20px;font-weight:600;">Réinitialisation de mot de passe</h2>
              <p style="margin:0 0 12px;color:rgba(237,232,220,0.75);font-size:15px;line-height:1.7;">
                Nous avons reçu une demande de réinitialisation du mot de passe associé à votre compte SomnioPax.
              </p>
              <p style="margin:0 0 28px;color:rgba(237,232,220,0.75);font-size:15px;line-height:1.7;">
                Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe. Ce lien est valable <strong style="color:#C8A96E;">1 heure</strong> et ne peut être utilisé qu'une seule fois.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:4px 0 32px;">
                    <a href="${resetLink}" style="display:inline-block;background:linear-gradient(135deg,#C8A96E,#D4B97E);color:#0D0B1A;padding:16px 36px;border-radius:999px;font-weight:700;text-decoration:none;font-size:16px;letter-spacing:0.3px;">
                      Réinitialiser mon mot de passe
                    </a>
                  </td>
                </tr>
              </table>
              <div style="background:rgba(200,169,110,0.08);border:1px solid rgba(200,169,110,0.2);border-radius:12px;padding:16px 20px;">
                <p style="margin:0;color:rgba(237,232,220,0.6);font-size:13px;line-height:1.6;">
                  🔒 <strong style="color:rgba(237,232,220,0.8);">Vous n'avez pas fait cette demande ?</strong><br/>
                  Ignorez simplement cet email. Votre mot de passe restera inchangé.
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px 32px;border-top:1px solid rgba(200,169,110,0.1);">
              <p style="margin:0 0 8px;color:rgba(237,232,220,0.35);font-size:12px;line-height:1.6;text-align:center;">
                Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :
              </p>
              <p style="margin:0;word-break:break-all;text-align:center;">
                <a href="${resetLink}" style="color:#C8A96E;font-size:11px;text-decoration:none;">${resetLink}</a>
              </p>
              <p style="margin:20px 0 0;color:rgba(237,232,220,0.25);font-size:11px;text-align:center;">
                © ${year} SomnioPax · Cet email a été envoyé automatiquement, merci de ne pas y répondre.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildResetEmailText(resetLink: string): string {
  return `SomnioPax — Réinitialisation de mot de passe\n\nNous avons reçu une demande de réinitialisation du mot de passe de votre compte SomnioPax.\n\nCliquez sur ce lien pour réinitialiser votre mot de passe (valable 1 heure, usage unique) :\n${resetLink}\n\nSi vous n'avez pas fait cette demande, ignorez cet email. Votre mot de passe restera inchangé.\n\n© ${new Date().getFullYear()} SomnioPax`;
}

// ─── Send reset email via Resend ──────────────────────────────────────────────

async function sendResetEmail(to: string, token: string, baseUrl: string): Promise<void> {
  const resetLink = `${baseUrl}/reset-password?token=${token}`;
  const resend = getResendClient();
  const from = process.env.RESEND_FROM_EMAIL ?? "SomnioPax <noreply@somniopax.fr>";

  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from,
        to: [to],
        subject: "Réinitialisation de votre mot de passe SomnioPax",
        html: buildResetEmailHtml(resetLink),
        text: buildResetEmailText(resetLink),
      });
      if (error) {
        console.error("[EmailAuth] Resend error:", error);
        console.log(`[EmailAuth] Reset link (fallback): ${resetLink}`);
      } else {
        console.log(`[EmailAuth] Reset email sent via Resend. ID: ${data?.id}`);
      }
    } catch (err) {
      console.error("[EmailAuth] Failed to send via Resend:", err);
      console.log(`[EmailAuth] Reset link (fallback): ${resetLink}`);
    }
  } else {
    // Dev fallback: log to console
    console.log("[EmailAuth] DEV MODE — RESEND_API_KEY not set.");
    console.log(`[EmailAuth] Reset link: ${resetLink}`);
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

  // POST /api/auth/change-password — change password for authenticated users
  app.post("/api/auth/change-password", async (req: Request, res: Response) => {
    try {
      // Authenticate the request (cookie or Bearer token)
      let user;
      try {
        user = await sdk.authenticateRequest(req);
      } catch {
        res.status(401).json({ error: "Vous devez être connecté pour changer votre mot de passe." });
        return;
      }

      const { currentPassword, newPassword } = req.body as {
        currentPassword?: string;
        newPassword?: string;
      };

      if (!newPassword) {
        res.status(400).json({ error: "Le nouveau mot de passe est requis." });
        return;
      }

      if (newPassword.length < 8) {
        res.status(400).json({ error: "Le mot de passe doit contenir au moins 8 caractères." });
        return;
      }

      // Get the user's DB record
      const dbUser = await getUserById(user.id);
      if (!dbUser) {
        res.status(404).json({ error: "Compte introuvable." });
        return;
      }

      // Check if user has an email auth record
      const authRecord = await getEmailAuthByUserId(dbUser.id);

      if (authRecord) {
        // User has email/password — verify current password
        if (!currentPassword) {
          res.status(400).json({ error: "Le mot de passe actuel est requis." });
          return;
        }
        const isValid = await bcrypt.compare(currentPassword, authRecord.passwordHash);
        if (!isValid) {
          res.status(401).json({ error: "Mot de passe actuel incorrect." });
          return;
        }
      } else {
        // User signed up via Google/OAuth — no current password needed
        // They can set a password for the first time
        // Create an emailAuth record for them
        if (!dbUser.email) {
          res.status(400).json({ error: "Aucun email associé à ce compte." });
          return;
        }
        // Check if email is already used by another account
        const existingEmailAuth = await getEmailAuthByEmail(dbUser.email);
        if (existingEmailAuth && existingEmailAuth.userId !== dbUser.id) {
          res.status(409).json({ error: "Cet email est déjà utilisé par un autre compte." });
          return;
        }
      }

      // Hash new password
      const newHash = await bcrypt.hash(newPassword, 12);

      if (authRecord) {
        // Update existing password
        await updateEmailPassword(dbUser.id, newHash);
      } else {
        // Create new email auth record for OAuth user
        await createEmailUser({
          email: dbUser.email!,
          passwordHash: newHash,
          name: dbUser.name || dbUser.email!.split("@")[0],
        });
      }

      res.json({
        success: true,
        message: authRecord
          ? "Mot de passe modifié avec succès."
          : "Mot de passe créé avec succès. Vous pouvez maintenant vous connecter avec votre email.",
        isFirstPassword: !authRecord,
      });
    } catch (err) {
      console.error("[EmailAuth] Change password error:", err);
      res.status(500).json({ error: "Erreur serveur lors du changement de mot de passe." });
    }
  });
}
