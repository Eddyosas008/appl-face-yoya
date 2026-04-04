/**
 * SomnioPax — Constantes visuelles premium épurées
 *
 * SOMBRE : fond #0D0B1A (bleu nuit), surface #16132B, or #C8A96E, texte #EDE8DC
 * CLAIR  : fond #FAF7F2 (crème ivoire), surface #FFFFFF, or #8B6914, texte #1C1410
 *
 * Philosophie : contraste élevé, tons neutres chauds, un seul accent (or),
 *               lisibilité parfaite, aucune couleur criarde.
 */

// ── Palette Nuit (mode sombre) ─────────────────────────────────────────────────
export const DARK_BG         = '#0D0B1A';  // bleu nuit très profond
export const DARK_SURFACE    = '#16132B';  // surface cartes sombres
export const DARK_SURFACE2   = '#1E1A35';  // surface secondaire
export const DARK_HERO       = '#120F24';  // fond hero sombre
export const DARK_TEXT       = '#EDE8DC';  // texte principal (crème chaud)
export const DARK_TEXT_MID   = '#C4BCAC';  // texte moyen
export const DARK_TEXT_SOFT  = '#9A8F7E';  // texte doux
export const DARK_TEXT_MUTED = '#5C5448';  // texte atténué
export const DARK_BORDER     = 'rgba(200,169,110,0.14)';
export const DARK_SEP        = 'rgba(200,169,110,0.10)';

// ── Palette Jour (mode clair) ──────────────────────────────────────────────────
export const LIGHT_BG         = '#FAF7F2';  // crème ivoire chaud
export const LIGHT_SURFACE    = '#FFFFFF';  // blanc pur
export const LIGHT_SURFACE2   = '#F3EFE8';  // surface secondaire crème
export const LIGHT_HERO       = '#F0EBE0';  // fond hero crème doré
export const LIGHT_TEXT       = '#1C1410';  // brun très foncé (quasi noir chaud)
export const LIGHT_TEXT_MID   = '#3D3020';  // brun moyen foncé
export const LIGHT_TEXT_SOFT  = '#7A6A58';  // brun moyen chaud
export const LIGHT_TEXT_MUTED = '#B0A090';  // brun atténué
export const LIGHT_BORDER     = 'rgba(139,105,20,0.15)';
export const LIGHT_SEP        = 'rgba(139,105,20,0.10)';

// ── Or (accent unique) ─────────────────────────────────────────────────────────
// Mode sombre — or doux lumineux
export const GOLD_DARK        = '#C8A96E';  // or principal
export const GOLD_DARK_LIGHT  = '#E8C98E';  // or clair (highlights)
export const GOLD_DARK_PALE   = 'rgba(200,169,110,0.15)';
export const GOLD_DARK_BORDER = 'rgba(200,169,110,0.28)';

// Mode clair — or riche et profond
export const GOLD_LIGHT_VAL   = '#8B6914';  // or foncé principal
export const GOLD_LIGHT_MID   = '#A8841C';  // or moyen
export const GOLD_LIGHT_PALE  = '#F5EDD8';  // or très pâle (fond)
export const GOLD_LIGHT_BORDER = 'rgba(139,105,20,0.22)';

// ── Glassmorphisme ─────────────────────────────────────────────────────────────
export const GLASS_BG_DARK    = 'rgba(22,19,43,0.88)';    // fond glass (sombre)
export const GLASS_BG_LIGHT   = 'rgba(255,255,255,0.94)'; // fond glass (clair)
export const GLASS_BORDER_DARK  = 'rgba(200,169,110,0.18)';
export const GLASS_BORDER_LIGHT = 'rgba(139,105,20,0.14)';

// ── Alias rétrocompatibles ─────────────────────────────────────────────────────
export const GLASS_BG     = GLASS_BG_DARK;
export const GLASS_BORDER = GLASS_BORDER_DARK;
export const GOLD         = GOLD_DARK;
export const GOLD_LIGHT   = GOLD_DARK_LIGHT;
export const GOLD_SOFT    = GOLD_DARK_PALE;
export const GOLD_BORDER  = GOLD_DARK_BORDER;
export const GOLD_GLOW    = 'rgba(200,169,110,0.08)';
export const NIGHT_BG     = DARK_BG;
export const INDIGO_DEEP  = DARK_HERO;
export const INDIGO_MID   = '#1E1A35';
export const WHITE_SOFT   = DARK_TEXT;
export const LAVENDER     = 'rgba(200,169,110,0.50)';  // remplacé par or translucide
export const LAVENDER_DIM = 'rgba(200,169,110,0.30)';
export const LAVENDER_MED = 'rgba(200,169,110,0.18)';
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
  shadowOpacity: 0.20,
  shadowRadius: 12,
  elevation: 6,
};

export const SHADOW_DARK = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.45,
  shadowRadius: 10,
  elevation: 8,
};

export const SHADOW_LIGHT = {
  shadowColor: '#8B6914',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.10,
  shadowRadius: 8,
  elevation: 3,
};

// ── Aurora blobs (discrets, tons chauds) ──────────────────────────────────────
export const AURORA_BLOBS_DARK = [
  { leftPct: 5,  topPct: 5,  width: 180, height: 100, color: 'rgba(200,169,110,0.06)' },
  { leftPct: 60, topPct: 12, width: 140, height: 80,  color: 'rgba(180,140,80,0.05)'  },
  { leftPct: 25, topPct: 0,  width: 160, height: 70,  color: 'rgba(220,190,130,0.04)' },
];

export const AURORA_BLOBS_LIGHT = [
  { leftPct: 5,  topPct: 5,  width: 180, height: 100, color: 'rgba(139,105,20,0.06)' },
  { leftPct: 60, topPct: 12, width: 140, height: 80,  color: 'rgba(160,120,40,0.05)' },
  { leftPct: 25, topPct: 0,  width: 160, height: 70,  color: 'rgba(200,169,110,0.05)' },
];

export const AURORA_BLOBS = AURORA_BLOBS_DARK;

// ── Gradients réutilisables ────────────────────────────────────────────────────
export const GRADIENT_HERO         = [DARK_HERO, DARK_BG] as const;
export const GRADIENT_HERO_LIGHT   = [LIGHT_HERO, LIGHT_BG] as const;
export const GRADIENT_CARD         = ['rgba(22,19,43,0.92)', 'rgba(13,11,26,0.96)'] as const;
export const GRADIENT_CARD_LIGHT   = ['rgba(255,255,255,0.98)', 'rgba(245,237,216,0.92)'] as const;
export const GRADIENT_GOLD         = ['rgba(200,169,110,0.20)', 'rgba(200,169,110,0.04)'] as const;
export const GRADIENT_SECTION      = ['rgba(22,19,43,0.70)', 'rgba(13,11,26,0.85)'] as const;
export const GRADIENT_SECTION_LIGHT = ['rgba(245,237,216,0.70)', 'rgba(250,247,242,0.85)'] as const;

// ── Helper principal : couleurs selon le mode ──────────────────────────────────
export function getThemeColors(isDark: boolean) {
  return {
    // Fonds
    bg:             isDark ? DARK_BG       : LIGHT_BG,
    surface:        isDark ? GLASS_BG_DARK : GLASS_BG_LIGHT,
    surface2:       isDark ? DARK_SURFACE2 : LIGHT_SURFACE2,
    heroBackground: isDark ? DARK_HERO     : LIGHT_HERO,
    cardBackground: isDark ? 'rgba(22,19,43,0.88)' : 'rgba(255,255,255,0.98)',
    cardBorder:     isDark ? GLASS_BORDER_DARK : GLASS_BORDER_LIGHT,

    // Textes
    foreground:  isDark ? DARK_TEXT       : LIGHT_TEXT,
    textMid:     isDark ? DARK_TEXT_MID   : LIGHT_TEXT_MID,
    muted:       isDark ? DARK_TEXT_SOFT  : LIGHT_TEXT_SOFT,
    textMuted:   isDark ? DARK_TEXT_MUTED : LIGHT_TEXT_MUTED,

    // Or (accent unique)
    gold:        isDark ? GOLD_DARK       : GOLD_LIGHT_VAL,
    goldLight:   isDark ? GOLD_DARK_LIGHT : GOLD_LIGHT_MID,
    goldSoft:    isDark ? GOLD_DARK_PALE  : 'rgba(139,105,20,0.10)',
    goldBorder:  isDark ? GOLD_DARK_BORDER : GOLD_LIGHT_BORDER,
    goldPale:    isDark ? 'rgba(200,169,110,0.10)' : '#F5EDD8',

    // Violet → remplacé par tons neutres chauds
    violet:      isDark ? '#C8A96E' : '#8B6914',   // or en guise d'accent
    violetPale:  isDark ? 'rgba(200,169,110,0.12)' : 'rgba(139,105,20,0.08)',
    violetCard:  isDark ? 'rgba(200,169,110,0.08)' : '#F5EDD8',

    // Séparateurs
    border:      isDark ? DARK_BORDER : LIGHT_BORDER,
    sep:         isDark ? DARK_SEP    : LIGHT_SEP,

    // Navigation
    tabBar:       isDark ? '#0D0B1A'  : 'rgba(250,247,242,0.98)',
    tabBarBorder: isDark ? 'rgba(200,169,110,0.20)' : 'rgba(139,105,20,0.12)',

    // Décorations
    starColor:   isDark ? 'rgba(237,232,220,0.50)' : 'rgba(139,105,20,0.25)',
    auroraBlobs: isDark ? AURORA_BLOBS_DARK : AURORA_BLOBS_LIGHT,

    // Gradients
    gradientHero:    isDark ? GRADIENT_HERO    : GRADIENT_HERO_LIGHT,
    gradientCard:    isDark ? GRADIENT_CARD    : GRADIENT_CARD_LIGHT,
    gradientSection: isDark ? GRADIENT_SECTION : GRADIENT_SECTION_LIGHT,

    // Ombres
    shadow: isDark ? SHADOW_DARK : SHADOW_LIGHT,
  };
}
