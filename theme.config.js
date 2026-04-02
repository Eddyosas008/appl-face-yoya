/** @type {const} */
const themeColors = {
  // SomnioPax v3 — Palette nuit profonde
  primary:    { light: '#C9A84C', dark: '#C9A84C' },   // or SomnioPax
  background: { light: '#03020F', dark: '#03020F' },   // noir quasi-absolu
  surface:    { light: 'rgba(255,255,255,0.04)', dark: 'rgba(255,255,255,0.04)' }, // glass card
  foreground: { light: '#EDE9FF', dark: '#EDE9FF' },   // texte principal
  muted:      { light: 'rgba(237,233,255,0.55)', dark: 'rgba(237,233,255,0.55)' },
  border:     { light: 'rgba(180,160,255,0.10)', dark: 'rgba(180,160,255,0.10)' },
  success:    { light: '#4ADE80', dark: '#4ADE80' },
  warning:    { light: '#FBBF24', dark: '#FBBF24' },
  error:      { light: '#F87171', dark: '#F87171' },
  // Alias utiles
  tint:       { light: '#C9A84C', dark: '#C9A84C' },
  goldLight:  { light: '#E8C97A', dark: '#E8C97A' },
  textDim:    { light: 'rgba(237,233,255,0.55)', dark: 'rgba(237,233,255,0.55)' },
  textMuted:  { light: 'rgba(184,174,255,0.35)', dark: 'rgba(184,174,255,0.35)' },
  indigoCard: { light: 'rgba(255,255,255,0.04)', dark: 'rgba(255,255,255,0.04)' },
  indigoCardBorder: { light: 'rgba(180,160,255,0.10)', dark: 'rgba(180,160,255,0.10)' },
};

module.exports = { themeColors };
