/**
 * SomnioPax — Palette Premium Épurée
 *
 * SOMBRE : Bleu nuit profond (#0D0B1A), surface (#16132B), or doux (#C8A96E)
 * CLAIR  : Crème ivoire (#FAF7F2), surface (#FFFFFF), or riche (#8B6914)
 *
 * Philosophie : contraste élevé, tons neutres chauds, un seul accent (or),
 *               lisibilité parfaite, aucune couleur criarde.
 */

/** @type {const} */
const themeColors = {
  // Accent principal — or premium
  primary: {
    light: '#8B6914',   // or foncé — boutons, liens (mode clair)
    dark:  '#C8A96E',   // or doux — boutons, liens (mode sombre)
  },
  // Fond de l'application
  background: {
    light: '#FAF7F2',   // crème ivoire chaud
    dark:  '#0D0B1A',   // bleu nuit très profond
  },
  // Surface des cartes
  surface: {
    light: '#FFFFFF',   // blanc pur
    dark:  '#16132B',   // bleu nuit légèrement plus clair
  },
  // Texte principal
  foreground: {
    light: '#1C1410',   // brun très foncé (quasi noir chaud)
    dark:  '#EDE8DC',   // crème clair (chaud, pas blanc froid)
  },
  // Texte secondaire
  muted: {
    light: '#7A6A58',   // brun moyen chaud
    dark:  '#9A8F7E',   // crème atténué
  },
  // Bordures
  border: {
    light: 'rgba(139,105,20,0.15)',   // or très transparent
    dark:  'rgba(200,169,110,0.14)',  // or très transparent
  },
  // États
  success: { light: '#2D6A4F', dark: '#52B788' },
  warning: { light: '#7D4E00', dark: '#E9C46A' },
  error:   { light: '#9B2335', dark: '#E07070' },
};

module.exports = { themeColors };
