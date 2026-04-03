/** @type {const} */
const themeColors = {
  // ── Fond principal ─────────────────────────────────────────────────────────
  // Sombre : noir quasi-absolu | Clair : blanc ivoire doux
  background: { dark: '#03020F', light: '#F5F2EC' },

  // ── Surfaces / cartes ──────────────────────────────────────────────────────
  // Sombre : glass blanc 4% | Clair : blanc légèrement chaud
  surface: { dark: 'rgba(255,255,255,0.06)', light: '#FFFFFF' },

  // ── Texte principal ────────────────────────────────────────────────────────
  // Sombre : lavande douce | Clair : brun nuit profond
  foreground: { dark: '#EDE9FF', light: '#1A1240' },

  // ── Texte secondaire ──────────────────────────────────────────────────────
  // Sombre : lavande atténuée | Clair : gris chaud
  muted: { dark: 'rgba(237,233,255,0.55)', light: '#7A6E8A' },

  // ── Accent principal : or SomnioPax ───────────────────────────────────────
  primary: { dark: '#C9A84C', light: '#B8922E' },

  // ── Bordures ──────────────────────────────────────────────────────────────
  // Sombre : lavande subtile | Clair : beige doux
  border: { dark: 'rgba(180,160,255,0.14)', light: 'rgba(180,160,200,0.25)' },

  // ── États sémantiques ─────────────────────────────────────────────────────
  success: { dark: '#4ADE80', light: '#22C55E' },
  warning: { dark: '#FBBF24', light: '#D97706' },
  error:   { dark: '#F87171', light: '#DC2626' },

  // ── Alias utiles ──────────────────────────────────────────────────────────
  tint:      { dark: '#C9A84C', light: '#B8922E' },
  goldLight: { dark: '#E8C97A', light: '#D4A84C' },

  // ── Tokens spécifiques SomnioPax ─────────────────────────────────────────
  // Fond hero / sections (sombre : indigo profond | clair : lavande très pâle)
  heroBackground: { dark: '#1A1240', light: '#EDE8FF' },

  // Fond de carte glass (sombre : blanc 4% | clair : blanc pur)
  cardBackground: { dark: 'rgba(255,255,255,0.05)', light: 'rgba(255,255,255,0.92)' },

  // Bordure de carte (sombre : lavande 10% | clair : lavande 20%)
  cardBorder: { dark: 'rgba(180,160,255,0.12)', light: 'rgba(140,110,200,0.22)' },

  // Texte atténué (sombre : lavande 35% | clair : gris violet 50%)
  textDim: { dark: 'rgba(237,233,255,0.55)', light: '#7A6E8A' },
  textMuted: { dark: 'rgba(184,174,255,0.35)', light: 'rgba(120,100,160,0.55)' },

  // Fond or très doux (sombre : or 8% | clair : or 10%)
  goldSoft: { dark: 'rgba(201,168,76,0.10)', light: 'rgba(184,146,46,0.10)' },

  // Fond tab bar (sombre : indigo sombre | clair : blanc ivoire)
  tabBar: { dark: '#0D0B22', light: '#FAFAF8' },

  // Alias legacy (utilisés dans certains écrans)
  indigoCard: { dark: 'rgba(255,255,255,0.04)', light: 'rgba(255,255,255,0.92)' },
  indigoCardBorder: { dark: 'rgba(180,160,255,0.10)', light: 'rgba(140,110,200,0.20)' },
};

module.exports = { themeColors };
