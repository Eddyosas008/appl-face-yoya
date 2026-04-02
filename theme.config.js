/** @type {const} */
const themeColors = {
  // Fond indigo nuit profond
  primary:    { light: '#D4A853', dark: '#D4A853' },       // Or doux — accent principal
  background: { light: '#07051C', dark: '#07051C' },       // Indigo nuit profond
  surface:    { light: 'rgba(255,255,255,0.04)', dark: 'rgba(255,255,255,0.04)' }, // Glassmorphisme
  foreground: { light: '#F0EEF8', dark: '#F0EEF8' },       // Blanc lavande
  muted:      { light: 'rgba(180,168,220,0.55)', dark: 'rgba(180,168,220,0.55)' }, // Lavande atténuée
  border:     { light: 'rgba(180,168,220,0.12)', dark: 'rgba(180,168,220,0.12)' }, // Bordure subtile
  success:    { light: '#4ADE80', dark: '#4ADE80' },
  warning:    { light: '#D4A853', dark: '#D4A853' },
  error:      { light: '#F87171', dark: '#F87171' },
  // Couleurs supplémentaires pour le thème nocturne
  tint:       { light: '#D4A853', dark: '#D4A853' },       // Alias pour l'or
  indigo:     { light: '#2D1A6E', dark: '#2D1A6E' },       // Indigo profond pour cartes
  lavender:   { light: '#C4B5FD', dark: '#C4B5FD' },       // Lavande claire
  gold:       { light: '#D4A853', dark: '#D4A853' },       // Or pur
};

module.exports = { themeColors };
