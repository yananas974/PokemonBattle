import { describe, test, expect } from 'vitest';
import {
  loginSchema,
  registerSchema,
  battleActionSchema,
  teamSchema,
  idSchema,
  uuidSchema,
  paginationSchema,
  weatherSchema,
  sanitizeString,
  sanitizeHtml,
  validateEmail,
  validatePassword,
  validateFormData
} from '~/utils/validation';

describe('validation schemas', () => {
  describe('loginSchema', () => {
    test('validates correct login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    test('rejects invalid email format', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123'
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Email invalide');
      }
    });

    test('rejects empty email', () => {
      const invalidData = {
        email: '',
        password: 'password123'
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Email requis');
      }
    });

    test('rejects password too short', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '12345'
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Le mot de passe doit contenir au moins 6 caractères');
      }
    });

    test('rejects password too long', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'a'.repeat(129)
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Mot de passe trop long');
      }
    });

    test('rejects email too long', () => {
      const invalidData = {
        email: 'a'.repeat(250) + '@example.com',
        password: 'password123'
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Email trop long');
      }
    });
  });

  describe('registerSchema', () => {
    test('validates correct registration data', () => {
      const validData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123'
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test('rejects mismatched passwords', () => {
      const invalidData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'DifferentPassword123'
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Les mots de passe ne correspondent pas');
      }
    });

    test('rejects invalid username format', () => {
      const invalidData = {
        username: 'test user!',
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123'
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores');
      }
    });

    test('rejects username too short', () => {
      const invalidData = {
        username: 'ab',
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123'
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Le nom d\'utilisateur doit contenir au moins 3 caractères');
      }
    });

    test('rejects weak password', () => {
      const invalidData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password',
        confirmPassword: 'password'
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre');
      }
    });
  });

  describe('battleActionSchema', () => {
    test('validates attack action', () => {
      const validData = {
        battleId: '123e4567-e89b-12d3-a456-426614174000',
        intent: 'attack' as const,
        moveIndex: 0
      };

      const result = battleActionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test('validates hack action', () => {
      const validData = {
        battleId: '123e4567-e89b-12d3-a456-426614174000',
        intent: 'hack' as const,
        answer: 'Réponse du hack'
      };

      const result = battleActionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test('rejects invalid battle ID', () => {
      const invalidData = {
        battleId: 'invalid-uuid',
        intent: 'attack' as const,
        moveIndex: 0
      };

      const result = battleActionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('ID de combat invalide');
      }
    });

    test('rejects invalid intent', () => {
      const invalidData = {
        battleId: '123e4567-e89b-12d3-a456-426614174000',
        intent: 'invalid-action',
        moveIndex: 0
      };

      const result = battleActionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Action de combat invalide');
      }
    });

    test('rejects invalid move index', () => {
      const invalidData = {
        battleId: '123e4567-e89b-12d3-a456-426614174000',
        intent: 'attack' as const,
        moveIndex: 5
      };

      const result = battleActionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Index du mouvement invalide');
      }
    });

    test('rejects answer too long', () => {
      const invalidData = {
        battleId: '123e4567-e89b-12d3-a456-426614174000',
        intent: 'hack' as const,
        answer: 'a'.repeat(501)
      };

      const result = battleActionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Réponse trop longue');
      }
    });
  });

  describe('teamSchema', () => {
    test('validates correct team data', () => {
      const validData = {
        name: 'Mon équipe',
        description: 'Une équipe formidable'
      };

      const result = teamSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test('validates team without description', () => {
      const validData = {
        name: 'Mon équipe'
      };

      const result = teamSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test('rejects invalid team name characters', () => {
      const invalidData = {
        name: 'Mon équipe @#$%',
        description: 'Une équipe'
      };

      const result = teamSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Le nom d\'équipe contient des caractères invalides');
      }
    });

    test('rejects description too long', () => {
      const invalidData = {
        name: 'Mon équipe',
        description: 'a'.repeat(501)
      };

      const result = teamSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Description trop longue');
      }
    });
  });

  describe('idSchema', () => {
    test('validates positive integer', () => {
      const result = idSchema.safeParse(123);
      expect(result.success).toBe(true);
    });

    test('rejects negative number', () => {
      const result = idSchema.safeParse(-1);
      expect(result.success).toBe(false);
    });

    test('rejects zero', () => {
      const result = idSchema.safeParse(0);
      expect(result.success).toBe(false);
    });

    test('rejects decimal number', () => {
      const result = idSchema.safeParse(1.5);
      expect(result.success).toBe(false);
    });
  });

  describe('uuidSchema', () => {
    test('validates correct UUID', () => {
      const result = uuidSchema.safeParse('123e4567-e89b-12d3-a456-426614174000');
      expect(result.success).toBe(true);
    });

    test('rejects invalid UUID format', () => {
      const result = uuidSchema.safeParse('invalid-uuid');
      expect(result.success).toBe(false);
    });
  });

  describe('paginationSchema', () => {
    test('validates with defaults', () => {
      const result = paginationSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    test('validates custom values', () => {
      const result = paginationSchema.safeParse({ page: 5, limit: 50 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(5);
        expect(result.data.limit).toBe(50);
      }
    });

    test('rejects page too high', () => {
      const result = paginationSchema.safeParse({ page: 1001 });
      expect(result.success).toBe(false);
    });

    test('rejects limit too high', () => {
      const result = paginationSchema.safeParse({ limit: 101 });
      expect(result.success).toBe(false);
    });
  });

  describe('weatherSchema', () => {
    test('validates correct coordinates', () => {
      const validData = { lat: 48.8566, lon: 2.3522 };
      const result = weatherSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test('rejects invalid latitude', () => {
      const invalidData = { lat: 91, lon: 2.3522 };
      const result = weatherSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    test('rejects invalid longitude', () => {
      const invalidData = { lat: 48.8566, lon: 181 };
      const result = weatherSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});

describe('utility functions', () => {
  describe('sanitizeString', () => {
    test('removes dangerous characters', () => {
      const input = '<script>alert("xss")</script>';
      const result = sanitizeString(input);
      expect(result).toBe('scriptalert(xss)/script');
    });

    test('trims whitespace', () => {
      const input = '  test string  ';
      const result = sanitizeString(input);
      expect(result).toBe('test string');
    });

    test('limits string length', () => {
      const input = 'a'.repeat(1500);
      const result = sanitizeString(input);
      expect(result.length).toBe(1000);
    });

    test('handles empty string', () => {
      const result = sanitizeString('');
      expect(result).toBe('');
    });
  });

  describe('sanitizeHtml', () => {
    test('escapes HTML entities', () => {
      const input = '<div class="test">Hello & "World"</div>';
      const result = sanitizeHtml(input);
      expect(result).toBe('&lt;div class=&quot;test&quot;&gt;Hello &amp; &quot;World&quot;&lt;/div&gt;');
    });

    test('handles single quotes', () => {
      const input = "It's a test";
      const result = sanitizeHtml(input);
      expect(result).toBe('It&#x27;s a test');
    });

    test('handles empty string', () => {
      const result = sanitizeHtml('');
      expect(result).toBe('');
    });
  });

  describe('validateEmail', () => {
    test('validates correct email', () => {
      expect(validateEmail('test@example.com')).toBe(true);
    });

    test('rejects invalid email', () => {
      expect(validateEmail('invalid-email')).toBe(false);
    });

    test('rejects empty string', () => {
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    test('validates correct password', () => {
      expect(validatePassword('password123')).toBe(true);
    });

    test('rejects password too short', () => {
      expect(validatePassword('12345')).toBe(false);
    });

    test('rejects password too long', () => {
      expect(validatePassword('a'.repeat(129))).toBe(false);
    });
  });

  describe('validateFormData', () => {
    test('returns success for valid data', () => {
      const result = validateFormData(loginSchema, {
        email: 'test@example.com',
        password: 'password123'
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        email: 'test@example.com',
        password: 'password123'
      });
      expect(result.errors).toBeUndefined();
    });

    test('returns errors for invalid data', () => {
      const result = validateFormData(loginSchema, {
        email: 'invalid-email',
        password: '123'
      });

      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.errors).toEqual({
        'email': 'Email invalide',
        'password': 'Le mot de passe doit contenir au moins 6 caractères'
      });
    });

    test('handles multiple validation errors', () => {
      const result = validateFormData(registerSchema, {
        username: 'ab',
        email: 'invalid',
        password: '123',
        confirmPassword: '456'
      });

      expect(result.success).toBe(false);
      expect(Object.keys(result.errors || {})).toContain('username');
      expect(Object.keys(result.errors || {})).toContain('email');
      expect(Object.keys(result.errors || {})).toContain('password');
    });

    test('handles nested field errors', () => {
      const result = validateFormData(registerSchema, {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'DifferentPassword'
      });

      expect(result.success).toBe(false);
      expect(result.errors).toHaveProperty('confirmPassword');
    });

    test('handles schema parsing exceptions', () => {
      const result = validateFormData(loginSchema, null);

      expect(result.success).toBe(false);
      expect(result.errors).toEqual({
        general: 'Erreur de validation'
      });
    });

    test('handles undefined data', () => {
      const result = validateFormData(loginSchema, undefined);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });
});