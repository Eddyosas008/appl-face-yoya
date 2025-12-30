// ============================================
// THÈME - FACE YOGA APP
// ============================================
// Palette de couleurs sombre avec accents verts naturels
// Inspirée du design Figma fourni

export const colors = {
  // Couleurs principales
  primary: {
    50: '#e8f5e9',
    100: '#c8e6c9',
    200: '#a5d6a7',
    300: '#81c784',
    400: '#66bb6a',
    500: '#4caf50',      // Vert principal
    600: '#43a047',
    700: '#388e3c',
    800: '#2e7d32',
    900: '#1b5e20',
  },

  // Couleurs de fond (mode sombre)
  background: {
    primary: '#0d1a0d',      // Fond principal très sombre
    secondary: '#142414',    // Fond secondaire
    tertiary: '#1a2e1a',     // Cartes et surfaces
    elevated: '#213321',     // Éléments surélevés
    input: '#1a2e1a',        // Champs de saisie
  },

  // Texte
  text: {
    primary: '#ffffff',
    secondary: '#a8c5a8',
    tertiary: '#6b8b6b',
    muted: '#4a6b4a',
    inverse: '#0d1a0d',
  },

  // Accents
  accent: {
    green: '#4ade80',        // Vert vif pour CTA
    greenLight: '#86efac',
    greenDark: '#22c55e',
    teal: '#2dd4bf',
    gold: '#fbbf24',         // Pour badges/récompenses
    coral: '#fb7185',        // Pour alertes douces
  },

  // États
  state: {
    success: '#4ade80',
    warning: '#fbbf24',
    error: '#f87171',
    info: '#60a5fa',
  },

  // Alias semantic pour compatibilité
  semantic: {
    success: '#4ade80',
    warning: '#fbbf24',
    error: '#f87171',
    info: '#60a5fa',
  },

  // Bordures
  border: {
    light: '#2d4a2d',
    medium: '#3d5a3d',
    dark: '#1a2e1a',
  },

  // Overlays
  overlay: {
    light: 'rgba(255, 255, 255, 0.05)',
    medium: 'rgba(255, 255, 255, 0.1)',
    dark: 'rgba(0, 0, 0, 0.5)',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const typography = {
  // Titres
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },

  // Corps de texte
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },

  // Labels
  label: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
  labelSmall: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
  },

  // Boutons
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  buttonSmall: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
  },

  // Caption
  caption: {
    fontSize: 11,
    fontWeight: '400' as const,
    lineHeight: 14,
  },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
};

// Thème complet exporté
export const theme = {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
};

export type Theme = typeof theme;
