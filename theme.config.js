/**
 * SomnioPax — Palette de thème
 * Deux modes très distincts :
 *   CLAIR  : fond #F7F3FD (lavande pâle), texte #1A1230 (violet foncé), or #A8762C
 *   SOMBRE : fond #120E2E (bleu nuit profond), texte #EDE8FF (lavande clair), or #C9963E
 */

/** @type {const} */
const themeColors = {
  // Couleur d'accent principale
  primary: {
    light: '#5A3BA0',   // violet moyen — boutons, liens
    dark:  '#8B6CC8',   // violet clair — boutons, liens
  },
  // Fond de l'application
  background: {
    light: '#F7F3FD',   // lavande très pâle
    dark:  '#120E2E',   // bleu nuit profond
  },
  // Surface des cartes
  surface: {
    light: '#FFFFFF',   // blanc pur
    dark:  '#1C1740',   // bleu nuit légèrement plus clair
  },
  // Texte principal
  foreground: {
    light: '#1A1230',   // violet très foncé
    dark:  '#EDE8FF',   // lavande clair
  },
  // Texte secondaire
  muted: {
    light: '#7A6A9A',   // violet moyen-clair
    dark:  '#8878AA',   // violet grisé
  },
  // Bordures
  border: {
    light: 'rgba(139,108,200,0.20)',
    dark:  'rgba(139,108,200,0.18)',
  },
  // États
  success: { light: '#1A7A6E', dark: '#4ADE80' },
  warning: { light: '#8A5A10', dark: '#FBBF24' },
  error:   { light: '#9B3060', dark: '#F87171' },
};

module.exports = { themeColors };
