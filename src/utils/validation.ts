// ============================================
// INPUT VALIDATION UTILITIES
// ============================================

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate email format
 */
export const validateEmail = (email: string): ValidationResult => {
  const trimmed = email.trim();
  if (!trimmed) {
    return { isValid: false, error: 'L\'email est requis' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Format d\'email invalide' };
  }
  if (trimmed.length > 254) {
    return { isValid: false, error: 'Email trop long' };
  }
  return { isValid: true };
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: 'Le mot de passe est requis' };
  }
  if (password.length < 8) {
    return { isValid: false, error: 'Le mot de passe doit contenir au moins 8 caractères' };
  }
  if (password.length > 128) {
    return { isValid: false, error: 'Le mot de passe est trop long' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Le mot de passe doit contenir au moins une majuscule' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Le mot de passe doit contenir au moins un chiffre' };
  }
  return { isValid: true };
};

/**
 * Validate a name/first name
 */
export const validateName = (name: string): ValidationResult => {
  const trimmed = name.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Le nom est requis' };
  }
  if (trimmed.length < 2) {
    return { isValid: false, error: 'Le nom doit contenir au moins 2 caractères' };
  }
  if (trimmed.length > 50) {
    return { isValid: false, error: 'Le nom ne peut pas dépasser 50 caractères' };
  }
  // Allow letters, spaces, hyphens, apostrophes (French names)
  if (!/^[a-zA-ZÀ-ÿ\s\-']+$/.test(trimmed)) {
    return { isValid: false, error: 'Le nom contient des caractères non autorisés' };
  }
  return { isValid: true };
};

/**
 * Validate age
 */
export const validateAge = (age: number): ValidationResult => {
  if (!Number.isInteger(age)) {
    return { isValid: false, error: 'L\'âge doit être un nombre entier' };
  }
  if (age < 13) {
    return { isValid: false, error: 'Vous devez avoir au moins 13 ans' };
  }
  if (age > 120) {
    return { isValid: false, error: 'Âge invalide' };
  }
  return { isValid: true };
};

/**
 * Sanitize text input (prevent XSS / injection)
 */
export const sanitizeText = (input: string): string => {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
};

/**
 * Sanitize notes/free text (allow more characters but strip dangerous ones)
 */
export const sanitizeNotes = (input: string): string => {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
    .slice(0, 1000); // Max 1000 chars for notes
};
