/**
 * SomnioPax v3 — Constantes visuelles partagées
 * Source de vérité unique pour toute l'application.
 * Basé sur le style de la page d'accueil.
 */

// ── Palette principale ────────────────────────────────────────────────────────
export const NIGHT_BG     = '#03020F';   // fond quasi-noir absolu
export const INDIGO_DEEP  = '#1A1240';   // fond hero / sections sombres
export const INDIGO_MID   = '#2E1870';   // cartes gradient
export const GOLD         = '#C9A84C';   // or SomnioPax — accent principal
export const GOLD_LIGHT   = '#E8C97A';   // or clair — highlights
export const GOLD_SOFT    = 'rgba(201,168,76,0.15)';   // fond or très doux
export const GOLD_BORDER  = 'rgba(201,168,76,0.35)';   // bordure or
export const GOLD_GLOW    = 'rgba(201,168,76,0.08)';   // lueur or très subtile

// ── Lavande / Blanc ───────────────────────────────────────────────────────────
export const LAVENDER     = 'rgba(237,233,255,0.55)';  // texte secondaire lavande
export const LAVENDER_DIM = 'rgba(180,160,255,0.10)';  // fond lavande très doux
export const LAVENDER_MED = 'rgba(184,174,255,0.35)';  // bordure lavande
export const WHITE_SOFT   = '#EDE9FF';                 // texte principal
export const TEXT_MUTED   = 'rgba(237,233,255,0.45)';  // texte atténué

// ── Glassmorphisme ────────────────────────────────────────────────────────────
export const GLASS_BG     = 'rgba(255,255,255,0.04)';  // fond glass neutre
export const GLASS_BORDER = 'rgba(180,160,255,0.10)';  // bordure glass lavande
export const GLASS_GOLD   = 'rgba(201,168,76,0.10)';   // fond glass or

// ── Typographie ───────────────────────────────────────────────────────────────
export const FONT_DISPLAY = 'PlayfairDisplay_700Bold';
export const FONT_DISPLAY_ITALIC = 'PlayfairDisplay_700Bold_Italic';
export const FONT_BODY    = undefined; // System font (SF Pro / Roboto)

// ── Rayons et espacements ─────────────────────────────────────────────────────
export const RADIUS_SM    = 12;
export const RADIUS_MD    = 16;
export const RADIUS_LG    = 20;
export const RADIUS_XL    = 24;
export const RADIUS_PILL  = 999;

// ── Ombres ────────────────────────────────────────────────────────────────────
export const SHADOW_GOLD = {
  shadowColor: GOLD,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.25,
  shadowRadius: 12,
  elevation: 8,
};

export const SHADOW_DARK = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.4,
  shadowRadius: 8,
  elevation: 6,
};

// ── Aurora blobs (configuration partagée) ────────────────────────────────────
export const AURORA_BLOBS = [
  { leftPct: 10, topPct: 8,  width: 160, height: 90,  color: 'rgba(74,44,138,0.22)' },
  { leftPct: 55, topPct: 15, width: 130, height: 75,  color: 'rgba(40,20,100,0.18)' },
  { leftPct: 30, topPct: 2,  width: 170, height: 60,  color: 'rgba(100,60,180,0.14)' },
];

// ── Gradients réutilisables ───────────────────────────────────────────────────
export const GRADIENT_HERO    = [INDIGO_DEEP, NIGHT_BG] as const;
export const GRADIENT_CARD    = ['rgba(30,18,72,0.85)', 'rgba(10,6,30,0.95)'] as const;
export const GRADIENT_GOLD    = ['rgba(201,168,76,0.25)', 'rgba(201,168,76,0.05)'] as const;
export const GRADIENT_SECTION = ['rgba(26,18,64,0.60)', 'rgba(3,2,15,0.80)'] as const;
