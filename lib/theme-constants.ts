/**
 * SomnioPax — Constantes visuelles partagées
 * Deux modes très distincts selon le modèle de référence :
 *
 * SOMBRE : fond #120E2E (bleu nuit), texte #EDE8FF (lavande), or #C9963E
 * CLAIR  : fond #F7F3FD (lavande pâle), texte #1A1230 (violet foncé), or #A8762C
 */

// ── Palette Nuit (mode sombre) ─────────────────────────────────────────────────
export const DARK_BG         = '#120E2E';  // bleu nuit profond
export const DARK_SURFACE    = '#1C1740';  // surface cartes sombres
export const DARK_HERO       = '#1A1040';  // fond hero sombre
export const DARK_TEXT       = '#EDE8FF';  // texte principal (lavande clair)
export const DARK_TEXT_MID   = '#B8AEDD';  // texte moyen
export const DARK_TEXT_SOFT  = '#8878AA';  // texte doux
export const DARK_TEXT_MUTED = '#554A7A';  // texte atténué
export const DARK_BORDER     = 'rgba(139,108,200,0.18)';
export const DARK_SEP        = 'rgba(139,108,200,0.15)';

// ── Palette Jour (mode clair) ──────────────────────────────────────────────────
export const LIGHT_BG         = '#F7F3FD';  // lavande très pâle
export const LIGHT_SURFACE    = '#FFFFFF';  // blanc pur
export const LIGHT_HERO       = '#EDE6FF';  // fond hero lavande
export const LIGHT_TEXT       = '#1A1230';  // violet très foncé
export const LIGHT_TEXT_MID   = '#4A3870';  // violet moyen
export const LIGHT_TEXT_SOFT  = '#7A6A9A';  // violet doux
export const LIGHT_TEXT_MUTED = '#B0A4CC';  // violet atténué
export const LIGHT_BORDER     = 'rgba(139,108,200,0.20)';
export const LIGHT_SEP        = 'rgba(139,108,200,0.20)';

// ── Or (accent principal) ──────────────────────────────────────────────────────
export const GOLD_DARK        = '#C9963E';  // or chaud (mode sombre)
export const GOLD_DARK_LIGHT  = '#F0C870';  // or clair (highlights sombres)
export const GOLD_DARK_PALE   = 'rgba(201,150,62,0.15)';
export const GOLD_DARK_BORDER = 'rgba(201,150,62,0.28)';

export const GOLD_LIGHT_VAL   = '#A8762C';  // or foncé (mode clair)
export const GOLD_LIGHT_MID   = '#C9963E';  // or moyen (mode clair)
export const GOLD_LIGHT_PALE  = '#F5EDD8';  // or très pâle (fond)
export const GOLD_LIGHT_BORDER = 'rgba(168,118,44,0.25)';

// ── Violet (accent secondaire) ─────────────────────────────────────────────────
export const VIOLET_DARK      = '#3D2678';
export const VIOLET_MID       = '#5A3BA0';
export const VIOLET_LIGHT_VAL = '#8B6CC8';
export const VIOLET_PALE      = '#EDE6FF';
export const VIOLET_CARD      = '#F4EFFE';

// ── Glassmorphisme ─────────────────────────────────────────────────────────────
export const GLASS_BG_DARK    = 'rgba(28,23,64,0.80)';   // fond glass (sombre)
export const GLASS_BG_LIGHT   = 'rgba(255,255,255,0.92)'; // fond glass (clair)
export const GLASS_BORDER_DARK  = 'rgba(139,108,200,0.22)';
export const GLASS_BORDER_LIGHT = 'rgba(139,108,200,0.16)';

// Alias rétrocompatibles
export const GLASS_BG     = GLASS_BG_DARK;
export const GLASS_BORDER = GLASS_BORDER_DARK;
export const GOLD         = GOLD_DARK;
export const GOLD_LIGHT   = GOLD_DARK_LIGHT;
export const GOLD_SOFT    = GOLD_DARK_PALE;
export const GOLD_BORDER  = GOLD_DARK_BORDER;
export const GOLD_GLOW    = 'rgba(201,150,62,0.08)';
export const NIGHT_BG     = DARK_BG;
export const INDIGO_DEEP  = DARK_HERO;
export const INDIGO_MID   = '#2E1870';
export const WHITE_SOFT   = DARK_TEXT;
export const LAVENDER     = 'rgba(184,174,255,0.65)';
export const LAVENDER_DIM = 'rgba(184,174,255,0.40)';
export const LAVENDER_MED = 'rgba(139,108,200,0.22)';
export const TEXT_MUTED   = DARK_TEXT_MUTED;
export const DAY_BG       = LIGHT_BG;
export const DAY_SURFACE  = LIGHT_SURFACE;
export const DAY_HERO     = LIGHT_HERO;
export const GOLD_DAY     = GOLD_LIGHT_VAL;
export const GOLD_LIGHT_DAY = GOLD_LIGHT_MID;
export const GLASS_BG_LIGHT_ALIAS = GLASS_BG_LIGHT;
export const GLASS_BORDER_LIGHT_ALIAS = GLASS_BORDER_LIGHT;

// ── Typographie ────────────────────────────────────────────────────────────────
export const FONT_DISPLAY        = 'PlayfairDisplay_700Bold';
export const FONT_DISPLAY_ITALIC = 'PlayfairDisplay_700Bold_Italic';
export const FONT_BODY           = undefined;

// ── Rayons et espacements ──────────────────────────────────────────────────────
export const RADIUS_SM   = 12;
export const RADIUS_MD   = 16;
export const RADIUS_LG   = 20;
export const RADIUS_XL   = 24;
export const RADIUS_PILL = 999;

// ── Ombres ─────────────────────────────────────────────────────────────────────
export const SHADOW_GOLD = {
  shadowColor: GOLD_DARK,
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

export const SHADOW_LIGHT = {
  shadowColor: '#3D2678',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.10,
  shadowRadius: 8,
  elevation: 3,
};

// ── Aurora blobs ───────────────────────────────────────────────────────────────
export const AURORA_BLOBS_DARK = [
  { leftPct: 10, topPct: 8,  width: 160, height: 90,  color: 'rgba(90,59,160,0.22)' },
  { leftPct: 55, topPct: 15, width: 130, height: 75,  color: 'rgba(40,20,100,0.18)' },
  { leftPct: 30, topPct: 2,  width: 170, height: 60,  color: 'rgba(100,60,180,0.14)' },
];

export const AURORA_BLOBS_LIGHT = [
  { leftPct: 10, topPct: 8,  width: 160, height: 90,  color: 'rgba(139,108,200,0.14)' },
  { leftPct: 55, topPct: 15, width: 130, height: 75,  color: 'rgba(168,118,44,0.10)' },
  { leftPct: 30, topPct: 2,  width: 170, height: 60,  color: 'rgba(90,59,160,0.10)' },
];

export const AURORA_BLOBS = AURORA_BLOBS_DARK;

// ── Gradients réutilisables ────────────────────────────────────────────────────
export const GRADIENT_HERO         = [DARK_HERO, DARK_BG] as const;
export const GRADIENT_HERO_LIGHT   = [LIGHT_HERO, LIGHT_BG] as const;
export const GRADIENT_CARD         = ['rgba(28,23,64,0.90)', 'rgba(18,14,46,0.95)'] as const;
export const GRADIENT_CARD_LIGHT   = ['rgba(255,255,255,0.98)', 'rgba(237,230,255,0.92)'] as const;
export const GRADIENT_GOLD         = ['rgba(201,150,62,0.25)', 'rgba(201,150,62,0.05)'] as const;
export const GRADIENT_SECTION      = ['rgba(26,16,64,0.60)', 'rgba(18,14,46,0.80)'] as const;
export const GRADIENT_SECTION_LIGHT = ['rgba(237,230,255,0.60)', 'rgba(247,243,253,0.80)'] as const;

// ── Helper principal : couleurs selon le mode ──────────────────────────────────
export function getThemeColors(isDark: boolean) {
  return {
    // Fonds
    bg:             isDark ? DARK_BG       : LIGHT_BG,
    surface:        isDark ? GLASS_BG_DARK : GLASS_BG_LIGHT,
    heroBackground: isDark ? DARK_HERO     : LIGHT_HERO,
    cardBackground: isDark ? 'rgba(28,23,64,0.80)' : 'rgba(255,255,255,0.98)',
    cardBorder:     isDark ? GLASS_BORDER_DARK : GLASS_BORDER_LIGHT,

    // Textes
    foreground:  isDark ? DARK_TEXT       : LIGHT_TEXT,
    textMid:     isDark ? DARK_TEXT_MID   : LIGHT_TEXT_MID,
    muted:       isDark ? DARK_TEXT_SOFT  : LIGHT_TEXT_SOFT,
    textMuted:   isDark ? DARK_TEXT_MUTED : LIGHT_TEXT_MUTED,

    // Or
    gold:        isDark ? GOLD_DARK       : GOLD_LIGHT_VAL,
    goldLight:   isDark ? GOLD_DARK_LIGHT : GOLD_LIGHT_MID,
    goldSoft:    isDark ? GOLD_DARK_PALE  : 'rgba(168,118,44,0.12)',
    goldBorder:  isDark ? GOLD_DARK_BORDER : GOLD_LIGHT_BORDER,
    goldPale:    isDark ? 'rgba(201,150,62,0.12)' : '#F5EDD8',

    // Violet
    violet:      isDark ? VIOLET_LIGHT_VAL : VIOLET_MID,
    violetPale:  isDark ? 'rgba(90,59,160,0.20)' : VIOLET_PALE,
    violetCard:  isDark ? 'rgba(90,59,160,0.15)' : VIOLET_CARD,

    // Séparateurs
    border:      isDark ? DARK_BORDER : LIGHT_BORDER,
    sep:         isDark ? DARK_SEP    : LIGHT_SEP,

    // Navigation
    tabBar:       isDark ? '#0E0A22'  : 'rgba(247,243,253,0.98)',
    tabBarBorder: isDark ? 'rgba(201,150,62,0.28)' : 'rgba(139,108,200,0.20)',

    // Décorations
    starColor:   isDark ? 'rgba(237,232,255,0.7)' : 'rgba(139,108,200,0.35)',
    auroraBlobs: isDark ? AURORA_BLOBS_DARK : AURORA_BLOBS_LIGHT,

    // Gradients
    gradientHero:    isDark ? GRADIENT_HERO    : GRADIENT_HERO_LIGHT,
    gradientCard:    isDark ? GRADIENT_CARD    : GRADIENT_CARD_LIGHT,
    gradientSection: isDark ? GRADIENT_SECTION : GRADIENT_SECTION_LIGHT,

    // Ombres
    shadow: isDark ? SHADOW_DARK : SHADOW_LIGHT,
  };
}
