import {
  validateEmail,
  validatePassword,
  validateName,
  validateAge,
  sanitizeText,
  sanitizeNotes,
} from '../validation';

describe('validateEmail', () => {
  it('rejects empty email', () => {
    expect(validateEmail('')).toEqual({ isValid: false, error: "L'email est requis" });
    expect(validateEmail('  ')).toEqual({ isValid: false, error: "L'email est requis" });
  });

  it('rejects invalid formats', () => {
    expect(validateEmail('notanemail').isValid).toBe(false);
    expect(validateEmail('missing@domain').isValid).toBe(false);
    expect(validateEmail('@no-local.com').isValid).toBe(false);
    expect(validateEmail('spaces in@email.com').isValid).toBe(false);
  });

  it('accepts valid emails', () => {
    expect(validateEmail('test@example.com')).toEqual({ isValid: true });
    expect(validateEmail('user.name+tag@domain.co')).toEqual({ isValid: true });
    expect(validateEmail('  trimmed@email.com  ')).toEqual({ isValid: true });
  });

  it('rejects emails longer than 254 characters', () => {
    const longEmail = 'a'.repeat(246) + '@test.com';
    expect(longEmail.length).toBeGreaterThan(254);
    expect(validateEmail(longEmail).isValid).toBe(false);
  });
});

describe('validatePassword', () => {
  it('rejects empty password', () => {
    expect(validatePassword('')).toEqual({
      isValid: false,
      error: 'Le mot de passe est requis',
    });
  });

  it('rejects passwords shorter than 8 characters', () => {
    expect(validatePassword('Ab1').isValid).toBe(false);
    expect(validatePassword('Short1').isValid).toBe(false);
  });

  it('rejects passwords longer than 128 characters', () => {
    const longPassword = 'A1' + 'a'.repeat(127);
    expect(validatePassword(longPassword).isValid).toBe(false);
  });

  it('rejects passwords without uppercase', () => {
    expect(validatePassword('password123').isValid).toBe(false);
  });

  it('rejects passwords without digits', () => {
    expect(validatePassword('PasswordOnly').isValid).toBe(false);
  });

  it('accepts valid passwords', () => {
    expect(validatePassword('Password1')).toEqual({ isValid: true });
    expect(validatePassword('MyStr0ngPass!')).toEqual({ isValid: true });
  });
});

describe('validateName', () => {
  it('rejects empty name', () => {
    expect(validateName('')).toEqual({ isValid: false, error: 'Le nom est requis' });
    expect(validateName('  ')).toEqual({ isValid: false, error: 'Le nom est requis' });
  });

  it('rejects names shorter than 2 characters', () => {
    expect(validateName('A').isValid).toBe(false);
  });

  it('rejects names longer than 50 characters', () => {
    expect(validateName('A'.repeat(51)).isValid).toBe(false);
  });

  it('rejects names with invalid characters', () => {
    expect(validateName('John123').isValid).toBe(false);
    expect(validateName('Test@Name').isValid).toBe(false);
  });

  it('accepts valid French names', () => {
    expect(validateName('Marie')).toEqual({ isValid: true });
    expect(validateName('Jean-Pierre')).toEqual({ isValid: true });
    expect(validateName("Marie-Hélène")).toEqual({ isValid: true });
    expect(validateName("L'abbé")).toEqual({ isValid: true });
    expect(validateName('François')).toEqual({ isValid: true });
  });
});

describe('validateAge', () => {
  it('rejects non-integer ages', () => {
    expect(validateAge(25.5).isValid).toBe(false);
  });

  it('rejects ages under 13', () => {
    expect(validateAge(12).isValid).toBe(false);
    expect(validateAge(0).isValid).toBe(false);
  });

  it('rejects ages over 120', () => {
    expect(validateAge(121).isValid).toBe(false);
  });

  it('accepts valid ages', () => {
    expect(validateAge(13)).toEqual({ isValid: true });
    expect(validateAge(30)).toEqual({ isValid: true });
    expect(validateAge(120)).toEqual({ isValid: true });
  });
});

describe('sanitizeText', () => {
  it('removes HTML angle brackets', () => {
    expect(sanitizeText('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
  });

  it('removes javascript: protocol', () => {
    expect(sanitizeText('javascript:alert(1)')).toBe('alert(1)');
  });

  it('removes event handlers', () => {
    expect(sanitizeText('onerror=alert(1)')).toBe('alert(1)');
    expect(sanitizeText('onclick=test()')).toBe('test()');
  });

  it('trims whitespace', () => {
    expect(sanitizeText('  hello  ')).toBe('hello');
  });

  it('preserves normal text', () => {
    expect(sanitizeText('Bonjour, comment allez-vous ?')).toBe('Bonjour, comment allez-vous ?');
  });
});

describe('sanitizeNotes', () => {
  it('truncates to 1000 characters', () => {
    const longText = 'a'.repeat(1500);
    expect(sanitizeNotes(longText).length).toBe(1000);
  });

  it('removes dangerous content like sanitizeText', () => {
    expect(sanitizeNotes('<script>xss</script>')).toBe('scriptxss/script');
    expect(sanitizeNotes('javascript:void(0)')).toBe('void(0)');
  });
});
