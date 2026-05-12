import { useState, useCallback } from 'react';

// ── Règles de validation ──────────────────────────────────────────────────────

export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'L\'adresse e-mail est requise';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) return 'Adresse e-mail invalide';
  return null;
}

export function validateFirstName(name: string): string | null {
  if (!name.trim()) return 'Le prénom est requis';
  if (name.trim().length < 2) return 'Le prénom doit contenir au moins 2 caractères';
  if (name.trim().length > 50) return 'Le prénom est trop long';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Le mot de passe est requis';
  if (password.length < 8) return 'Au moins 8 caractères requis';
  return null;
}

export function validatePasswordConfirm(password: string, confirm: string): string | null {
  if (!confirm) return 'Veuillez confirmer votre mot de passe';
  if (password !== confirm) return 'Les mots de passe ne correspondent pas';
  return null;
}

// ── Force du mot de passe ─────────────────────────────────────────────────────

export type PasswordStrength = 'empty' | 'weak' | 'medium' | 'strong';

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return 'empty';
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return 'weak';
  if (score <= 3) return 'medium';
  return 'strong';
}

export function getStrengthLabel(strength: PasswordStrength): string {
  switch (strength) {
    case 'weak':   return 'Faible';
    case 'medium': return 'Moyen';
    case 'strong': return 'Fort';
    default:       return '';
  }
}

export function getStrengthColor(strength: PasswordStrength): string {
  switch (strength) {
    case 'weak':   return '#F87171';
    case 'medium': return '#FBBF24';
    case 'strong': return '#4ADE80';
    default:       return 'transparent';
  }
}

export function getStrengthFill(strength: PasswordStrength): number {
  switch (strength) {
    case 'weak':   return 0.33;
    case 'medium': return 0.66;
    case 'strong': return 1.0;
    default:       return 0;
  }
}

// ── Hook pour le formulaire de connexion ──────────────────────────────────────

export interface SignInFieldErrors {
  email: string | null;
  password: string | null;
}

export function useSignInValidation() {
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<SignInFieldErrors>({ email: null, password: null });

  const touch = useCallback((field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const validate = useCallback((email: string, password: string): boolean => {
    const newErrors: SignInFieldErrors = {
      email: validateEmail(email),
      password: !password ? 'Le mot de passe est requis' : null,
    };
    setErrors(newErrors);
    setTouched({ email: true, password: true });
    return !newErrors.email && !newErrors.password;
  }, []);

  const updateField = useCallback((field: keyof SignInFieldErrors, value: string, allValues: { email: string; password: string }) => {
    if (!touched[field]) return;
    const newErrors: SignInFieldErrors = {
      email: validateEmail(allValues.email),
      password: !allValues.password ? 'Le mot de passe est requis' : null,
    };
    setErrors(newErrors);
  }, [touched]);

  const isFieldValid = useCallback((field: keyof SignInFieldErrors, value: string): boolean | null => {
    if (!touched[field]) return null;
    return errors[field] === null;
  }, [touched, errors]);

  return { errors, touched, touch, validate, updateField, isFieldValid };
}

// ── Hook pour le formulaire d'inscription ─────────────────────────────────────

export interface SignUpFieldErrors {
  firstName: string | null;
  email: string | null;
  password: string | null;
  confirmPassword: string | null;
}

export function useSignUpValidation() {
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<SignUpFieldErrors>({
    firstName: null,
    email: null,
    password: null,
    confirmPassword: null,
  });

  const touch = useCallback((field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const validate = useCallback((firstName: string, email: string, password: string, confirmPassword: string): boolean => {
    const newErrors: SignUpFieldErrors = {
      firstName: validateFirstName(firstName),
      email: validateEmail(email),
      password: validatePassword(password),
      confirmPassword: validatePasswordConfirm(password, confirmPassword),
    };
    setErrors(newErrors);
    setTouched({ firstName: true, email: true, password: true, confirmPassword: true });
    return !newErrors.firstName && !newErrors.email && !newErrors.password && !newErrors.confirmPassword;
  }, []);

  const updateFields = useCallback((values: { firstName: string; email: string; password: string; confirmPassword: string }, changedField: keyof SignUpFieldErrors) => {
    setTouched(prev => ({ ...prev, [changedField]: true }));
    setErrors(prev => {
      const newErrors = { ...prev };
      switch (changedField) {
        case 'firstName':
          newErrors.firstName = validateFirstName(values.firstName);
          break;
        case 'email':
          newErrors.email = validateEmail(values.email);
          break;
        case 'password':
          newErrors.password = validatePassword(values.password);
          // Re-valider la confirmation si déjà touchée
          if (touched.confirmPassword) {
            newErrors.confirmPassword = validatePasswordConfirm(values.password, values.confirmPassword);
          }
          break;
        case 'confirmPassword':
          newErrors.confirmPassword = validatePasswordConfirm(values.password, values.confirmPassword);
          break;
      }
      return newErrors;
    });
  }, [touched]);

  const isFieldValid = useCallback((field: keyof SignUpFieldErrors): boolean | null => {
    if (!touched[field]) return null;
    return errors[field] === null;
  }, [touched, errors]);

  const isFormValid = useCallback((firstName: string, email: string, password: string, confirmPassword: string): boolean => {
    return (
      !validateFirstName(firstName) &&
      !validateEmail(email) &&
      !validatePassword(password) &&
      !validatePasswordConfirm(password, confirmPassword)
    );
  }, []);

  return { errors, touched, touch, validate, updateFields, isFieldValid, isFormValid };
}
