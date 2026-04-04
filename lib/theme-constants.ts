/**
 * SomnioPax — Constantes visuelles premium épurées
 * VERSION CONTRASTE FORT
 *
 * SOMBRE : fond #0D0B1A (bleu nuit), surface #2A2540 (violet moyen visible), or #C8A96E
 * CLAIR  : fond #FAF7F2 (crème ivoire), surface #FFFFFF (blanc pur), or #8B6914
 *
 * Règle : surface doit être CLAIREMENT visible sur le fond.
 */

// ── Palette Nuit (mode sombre) ─────────────────────────────────────────────────
export const DARK_BG         = '#0D0B1A';  // bleu nuit très profond
export const DARK_SURFACE    = '#2A2540';  // violet moyen — très visible sur fond nuit
export const DARK_SURFACE2   = '#201C38';  // surface secondaire
export const DARK_HERO       = '#1A1530';  // fond hero sombre
export const DARK_TEXT       = '#F0EBE0';  // texte principal (crème chaud, fort contraste)
export const DARK_TEXT_MID   = '#D4C8B0';  // texte moyen
export const DARK_TEXT_SOFT  = '#A89880';  // texte doux
export const DARK_TEXT_MUTED = '#6A5C48';  // texte atténué
export const DARK_BORDER     = 'rgba(200,169,110,0.35)';  // bordure or visible
export const DARK_SEP        = 'rgba(200,169,110,0.20)';

// ── Palette Jour (mode clair) ──────────────────────────────────────────────────
export const LIGHT_BG         = '#FAF7F2';  // crème ivoire chaud
export const LIGHT_SURFACE    = '#FFFFFF';  // blanc pur — très visible sur crème
export const LIGHT_SURFACE2   = '#F0EBE0';  // surface secondaire crème dorée
export const LIGHT_HERO       = '#EDE5D0';  // fond hero crème doré
export const LIGHT_TEXT       = '#1C1410';  // brun très foncé (fort contraste)
export const LIGHT_TEXT_MID   = '#3D3020';  // brun moyen foncé
export const LIGHT_TEXT_SOFT  = '#6A5840';  // brun moyen chaud
export const LIGHT_TEXT_MUTED = '#A09080';  // brun atténué
export const LIGHT_BORDER     = 'rgba(139,105,20,0.30)';  // bordure or visible
export const LIGHT_SEP        = 'rgba(139,105,20,0.18)';

// ── Or (accent unique) ─────────────────────────────────────────────────────────
export const GOLD_DARK        = '#C8A96E';  // or principal sombre
export const GOLD_DARK_LIGHT  = '#E8C98E';  // or clair
export const GOLD_DARK_PALE   = 'rgba(200,169,110,0.20)';
export const GOLD_DARK_BORDER = 'rgba(200,169,110,0.40)';

export const GOLD_LIGHT_VAL   = '#8B6914';  // or foncé principal clair
export const GOLD_LIGHT_MID   = '#A8841C';  // or moyen
export const GOLD_LIGHT_PALE  = '#F5EDD8';  // or très pâle
export const GOLD_LIGHT_BORDER = 'rgba(139,105,20,0.35)';

// ── Glassmorphisme ─────────────────────────────────────────────────────────────
export const GLASS_BG_DARK    = 'rgba(42,37,64,0.92)';    // fond glass sombre — visible
export const GLASS_BG_LIGHT   = 'rgba(255,255,255,0.96)'; // fond glass clair
export const GLASS_BORDER_DARK  = 'rgba(200,169,110,0.35)';
export const GLASS_BORDER_LIGHT = 'rgba(139,105,20,0.25)';

// ── Alias rétrocompatibles ─────────────────────────────────────────────────────
export const GLASS_BG     = GLASS_BG_DARK;
export const GLASS_BORDER = GLASS_BORDER_DARK;
export const GOLD         = GOLD_DARK;
export const GOLD_LIGHT   = GOLD_DARK_LIGHT;
export const GOLD_SOFT    = GOLD_DARK_PALE;
export const GOLD_BORDER  = GOLD_DARK_BORDER;
export const GOLD_GLOW    = 'rgba(200,169,110,0.10)';
export const NIGHT_BG     = DARK_BG;
export const INDIGO_DEEP  = DARK_HERO;
export const INDIGO_MID   = '#201C38';
export const WHITE_SOFT   = DARK_TEXT;
export const LAVENDER     = 'rgba(200,169,110,0.55)';
export const LAVENDER_DIM = 'rgba(200,169,110,0.35)';
export const LAVENDER_MED = 'rgba(200,169,110,0.22)';
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
  shadowOpacity: 0.30,
  shadowRadius: 12,
  elevation: 8,
};

// Mode sombre : ombres noires profondes
export const SHADOW_DARK_SM = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.40,
  shadowRadius: 6,
  elevation: 4,
};
export const SHADOW_DARK_MD = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.55,
  shadowRadius: 12,
  elevation: 8,
};
export const SHADOW_DARK_LG = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.65,
  shadowRadius: 20,
  elevation: 14,
};
export const SHADOW_DARK = SHADOW_DARK_MD;

// Mode clair : ombres brun-or visibles sur fond crème
export const SHADOW_LIGHT_SM = {
  shadowColor: '#5C3D0A',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.12,
  shadowRadius: 6,
  elevation: 3,
};
export const SHADOW_LIGHT_MD = {
  shadowColor: '#5C3D0A',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.18,
  shadowRadius: 12,
  elevation: 6,
};
export const SHADOW_LIGHT_LG = {
  shadowColor: '#5C3D0A',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.22,
  shadowRadius: 20,
  elevation: 10,
};
export const SHADOW_LIGHT = SHADOW_LIGHT_MD;

// ── Aurora blobs (discrets) ─────────────────────────────────────────────────────
export const AURORA_BLOBS_DARK = [
  { leftPct: 5,  topPct: 5,  width: 180, height: 100, color: 'rgba(200,169,110,0.07)' },
  { leftPct: 60, topPct: 12, width: 140, height: 80,  color: 'rgba(180,140,80,0.06)'  },
  { leftPct: 25, topPct: 0,  width: 160, height: 70,  color: 'rgba(220,190,130,0.05)' },
];

export const AURORA_BLOBS_LIGHT = [
  { leftPct: 5,  topPct: 5,  width: 180, height: 100, color: 'rgba(139,105,20,0.06)' },
  { leftPct: 60, topPct: 12, width: 140, height: 80,  color: 'rgba(160,120,40,0.05)' },
  { leftPct: 25, topPct: 0,  width: 160, height: 70,  color: 'rgba(200,169,110,0.05)' },
];

export const AURORA_BLOBS = AURORA_BLOBS_DARK;

// ── Gradients réutilisables ─────────────────────────────────────────────────────
export const GRADIENT_HERO         = [DARK_HERO, DARK_BG] as const;
export const GRADIENT_HERO_LIGHT   = [LIGHT_HERO, LIGHT_BG] as const;
export const GRADIENT_CARD         = ['rgba(42,37,64,0.95)', 'rgba(13,11,26,0.98)'] as const;
export const GRADIENT_CARD_LIGHT   = ['rgba(255,255,255,0.99)', 'rgba(240,235,224,0.95)'] as const;
export const GRADIENT_GOLD         = ['rgba(200,169,110,0.25)', 'rgba(200,169,110,0.05)'] as const;
export const GRADIENT_SECTION      = ['rgba(42,37,64,0.75)', 'rgba(13,11,26,0.90)'] as const;
export const GRADIENT_SECTION_LIGHT = ['rgba(240,235,224,0.75)', 'rgba(250,247,242,0.90)'] as const;

// ── Helper principal : couleurs selon le mode ───────────────────────────────────
export function getThemeColors(isDark: boolean) {
  return {
    // Fonds
    bg:             isDark ? DARK_BG       : LIGHT_BG,
    surface:        isDark ? DARK_SURFACE  : LIGHT_SURFACE,   // surface très visible
    surface2:       isDark ? DARK_SURFACE2 : LIGHT_SURFACE2,
    heroBackground: isDark ? DARK_HERO     : LIGHT_HERO,
    cardBackground: isDark ? GLASS_BG_DARK : GLASS_BG_LIGHT,
    cardBorder:     isDark ? GLASS_BORDER_DARK : GLASS_BORDER_LIGHT,

    // Textes (fort contraste)
    foreground:  isDark ? DARK_TEXT       : LIGHT_TEXT,
    textMid:     isDark ? DARK_TEXT_MID   : LIGHT_TEXT_MID,
    muted:       isDark ? DARK_TEXT_SOFT  : LIGHT_TEXT_SOFT,
    textMuted:   isDark ? DARK_TEXT_MUTED : LIGHT_TEXT_MUTED,

    // Or (accent unique)
    gold:        isDark ? GOLD_DARK       : GOLD_LIGHT_VAL,
    goldLight:   isDark ? GOLD_DARK_LIGHT : GOLD_LIGHT_MID,
    goldSoft:    isDark ? GOLD_DARK_PALE  : 'rgba(139,105,20,0.12)',
    goldBorder:  isDark ? GOLD_DARK_BORDER : GOLD_LIGHT_BORDER,
    goldPale:    isDark ? 'rgba(200,169,110,0.12)' : '#F5EDD8',

    // Accent neutre
    violet:      isDark ? '#C8A96E' : '#8B6914',
    violetPale:  isDark ? 'rgba(200,169,110,0.15)' : 'rgba(139,105,20,0.10)',
    violetCard:  isDark ? 'rgba(42,37,64,0.80)'    : '#F5EDD8',

    // Séparateurs (visibles)
    border:      isDark ? DARK_BORDER : LIGHT_BORDER,
    sep:         isDark ? DARK_SEP    : LIGHT_SEP,

    // Navigation
    tabBar:       isDark ? '#100E20'  : 'rgba(250,247,242,0.98)',
    tabBarBorder: isDark ? 'rgba(200,169,110,0.30)' : 'rgba(139,105,20,0.18)',

    // Décorations
    starColor:   isDark ? 'rgba(240,235,224,0.55)' : 'rgba(139,105,20,0.25)',
    auroraBlobs: isDark ? AURORA_BLOBS_DARK : AURORA_BLOBS_LIGHT,

    // Gradients
    gradientHero:    isDark ? GRADIENT_HERO    : GRADIENT_HERO_LIGHT,
    gradientCard:    isDark ? GRADIENT_CARD    : GRADIENT_CARD_LIGHT,
    gradientSection: isDark ? GRADIENT_SECTION : GRADIENT_SECTION_LIGHT,

    // Ombres (3 niveaux)
    shadowSm: isDark ? SHADOW_DARK_SM : SHADOW_LIGHT_SM,
    shadow:   isDark ? SHADOW_DARK_MD : SHADOW_LIGHT_MD,
    shadowLg: isDark ? SHADOW_DARK_LG : SHADOW_LIGHT_LG,
  };
}
