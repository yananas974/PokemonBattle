import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getCSPHeader,
  getSecurityHeaders,
  generateNonce,
  isValidRedirectUrl,
  sanitizeUrl,
  isRateLimited,
  secureCleanup
} from '~/utils/security';

// Mock window.location
const mockLocation = {
  origin: 'https://example.com',
  protocol: 'https:',
  host: 'example.com'
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
});

// Mock crypto
const mockCrypto = {
  randomUUID: vi.fn()
};

Object.defineProperty(global, 'crypto', {
  value: mockCrypto,
  writable: true
});

describe('security utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clear rate limit map between tests
    const rateLimitMapKey = 'test-key';
    try {
      isRateLimited(rateLimitMapKey, 1, 1);
    } catch {}
  });

  describe('getCSPHeader', () => {
    test('returns basic CSP header without nonce', () => {
      const header = getCSPHeader();
      
      expect(header).toContain("default-src 'self'");
      expect(header).toContain("script-src 'self' 'unsafe-inline' 'unsafe-eval'");
      expect(header).toContain("style-src 'self' 'unsafe-inline'");
      expect(header).toContain("img-src 'self' data: https: blob:");
      expect(header).toContain("frame-src 'none'");
      expect(header).toContain("object-src 'none'");
    });

    test('replaces unsafe-inline with nonce when provided', () => {
      const nonce = 'test-nonce-123';
      const header = getCSPHeader(nonce);
      
      expect(header).toContain(`'nonce-${nonce}'`);
      expect(header).not.toContain("'unsafe-inline'");
    });

    test('includes required domains for external resources', () => {
      const header = getCSPHeader();
      
      expect(header).toContain('https://cdn.jsdelivr.net');
      expect(header).toContain('https://unpkg.com');
      expect(header).toContain('https://fonts.googleapis.com');
      expect(header).toContain('https://fonts.gstatic.com');
      expect(header).toContain('https://api.openweathermap.org');
    });

    test('includes websocket connections', () => {
      const header = getCSPHeader();
      
      expect(header).toContain('ws: wss:');
    });

    test('prevents framing and includes security directives', () => {
      const header = getCSPHeader();
      
      expect(header).toContain("frame-ancestors 'none'");
      expect(header).toContain("base-uri 'self'");
      expect(header).toContain("form-action 'self'");
      expect(header).toContain('upgrade-insecure-requests');
    });
  });

  describe('getSecurityHeaders', () => {
    test('returns all required security headers', () => {
      const headers = getSecurityHeaders();
      
      expect(headers).toHaveProperty('Content-Security-Policy');
      expect(headers).toHaveProperty('Strict-Transport-Security');
      expect(headers).toHaveProperty('X-Frame-Options');
      expect(headers).toHaveProperty('X-Content-Type-Options');
      expect(headers).toHaveProperty('Referrer-Policy');
      expect(headers).toHaveProperty('Permissions-Policy');
      expect(headers).toHaveProperty('Cross-Origin-Embedder-Policy');
      expect(headers).toHaveProperty('Cross-Origin-Opener-Policy');
      expect(headers).toHaveProperty('Cross-Origin-Resource-Policy');
    });

    test('includes CSP header with nonce when provided', () => {
      const nonce = 'test-nonce';
      const headers = getSecurityHeaders(nonce);
      
      expect(headers['Content-Security-Policy']).toContain(`'nonce-${nonce}'`);
    });

    test('sets HSTS header correctly', () => {
      const headers = getSecurityHeaders();
      
      expect(headers['Strict-Transport-Security']).toBe(
        'max-age=31536000; includeSubDomains; preload'
      );
    });

    test('sets frame options to DENY', () => {
      const headers = getSecurityHeaders();
      
      expect(headers['X-Frame-Options']).toBe('DENY');
    });

    test('sets content type options correctly', () => {
      const headers = getSecurityHeaders();
      
      expect(headers['X-Content-Type-Options']).toBe('nosniff');
    });

    test('sets referrer policy', () => {
      const headers = getSecurityHeaders();
      
      expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
    });

    test('includes permissions policy with restrictions', () => {
      const headers = getSecurityHeaders();
      
      expect(headers['Permissions-Policy']).toContain('geolocation=(self)');
      expect(headers['Permissions-Policy']).toContain('camera=()');
      expect(headers['Permissions-Policy']).toContain('microphone=()');
      expect(headers['Permissions-Policy']).toContain('payment=()');
    });

    test('sets cross-origin policies', () => {
      const headers = getSecurityHeaders();
      
      expect(headers['Cross-Origin-Embedder-Policy']).toBe('require-corp');
      expect(headers['Cross-Origin-Opener-Policy']).toBe('same-origin');
      expect(headers['Cross-Origin-Resource-Policy']).toBe('same-origin');
    });
  });

  describe('generateNonce', () => {
    test('uses crypto.randomUUID when available', () => {
      mockCrypto.randomUUID.mockReturnValue('123e4567-e89b-12d3-a456-426614174000');
      
      const nonce = generateNonce();
      
      expect(mockCrypto.randomUUID).toHaveBeenCalled();
      expect(nonce).toBe('123e4567e89b12d3a456426614174000'); // UUID sans tirets
    });

    test('falls back to Math.random when crypto.randomUUID not available', () => {
      const originalCrypto = global.crypto;
      global.crypto = {} as any;
      
      vi.spyOn(Math, 'random')
        .mockReturnValueOnce(0.123456789)
        .mockReturnValueOnce(0.987654321);
      
      const nonce = generateNonce();
      
      expect(nonce).toBeDefined();
      expect(typeof nonce).toBe('string');
      expect(nonce.length).toBeGreaterThan(0);
      
      global.crypto = originalCrypto;
    });

    test('generates different nonces on successive calls', () => {
      mockCrypto.randomUUID
        .mockReturnValueOnce('111e1111-e11b-11d1-a111-111111111111')
        .mockReturnValueOnce('222e2222-e22b-22d2-a222-222222222222');
      
      const nonce1 = generateNonce();
      const nonce2 = generateNonce();
      
      expect(nonce1).not.toBe(nonce2);
    });
  });

  describe('isValidRedirectUrl', () => {
    test('accepts same-origin URLs', () => {
      expect(isValidRedirectUrl('https://example.com/dashboard')).toBe(true);
      expect(isValidRedirectUrl('/dashboard')).toBe(true);
      expect(isValidRedirectUrl('/dashboard/pokemon')).toBe(true);
    });

    test('rejects different origin URLs', () => {
      expect(isValidRedirectUrl('https://evil.com/phishing')).toBe(false);
      expect(isValidRedirectUrl('http://different.com')).toBe(false);
    });

    test('rejects javascript URLs', () => {
      expect(isValidRedirectUrl('javascript:alert(1)')).toBe(false);
    });

    test('rejects data URLs', () => {
      expect(isValidRedirectUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
    });

    test('handles malformed URLs', () => {
      expect(isValidRedirectUrl('not-a-url')).toBe(false);
      expect(isValidRedirectUrl('')).toBe(false);
      expect(isValidRedirectUrl('://invalid')).toBe(false);
    });

    test('handles protocol-relative URLs', () => {
      expect(isValidRedirectUrl('//example.com/page')).toBe(true);
      expect(isValidRedirectUrl('//evil.com/page')).toBe(false);
    });
  });

  describe('sanitizeUrl', () => {
    test('allows safe protocols', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com/');
      expect(sanitizeUrl('http://example.com')).toBe('http://example.com/');
      expect(sanitizeUrl('mailto:test@example.com')).toBe('mailto:test@example.com');
      expect(sanitizeUrl('tel:+1234567890')).toBe('tel:+1234567890');
    });

    test('blocks dangerous protocols', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBe('/');
      expect(sanitizeUrl('data:text/html,<script>')).toBe('/');
      expect(sanitizeUrl('vbscript:msgbox(1)')).toBe('/');
      expect(sanitizeUrl('file:///etc/passwd')).toBe('/');
    });

    test('handles relative URLs', () => {
      expect(sanitizeUrl('/dashboard')).toBe('https://example.com/dashboard');
      expect(sanitizeUrl('pokemon/123')).toBe('https://example.com/pokemon/123');
    });

    test('handles malformed URLs', () => {
      expect(sanitizeUrl('not-a-url')).toBe('/');
      expect(sanitizeUrl('')).toBe('/');
      expect(sanitizeUrl('://invalid')).toBe('/');
    });

    test('preserves query parameters and fragments', () => {
      const url = 'https://example.com/page?param=value#section';
      expect(sanitizeUrl(url)).toBe(url);
    });
  });

  describe('isRateLimited', () => {
    test('allows first request', () => {
      expect(isRateLimited('test-key-1', 5, 60000)).toBe(false);
    });

    test('allows requests within limit', () => {
      const key = 'test-key-2';
      
      expect(isRateLimited(key, 5, 60000)).toBe(false);
      expect(isRateLimited(key, 5, 60000)).toBe(false);
      expect(isRateLimited(key, 5, 60000)).toBe(false);
    });

    test('blocks requests after limit exceeded', () => {
      const key = 'test-key-3';
      
      // Use up the limit
      for (let i = 0; i < 5; i++) {
        expect(isRateLimited(key, 5, 60000)).toBe(false);
      }
      
      // Should be rate limited now
      expect(isRateLimited(key, 5, 60000)).toBe(true);
      expect(isRateLimited(key, 5, 60000)).toBe(true);
    });

    test('resets after time window', () => {
      vi.useFakeTimers();
      const key = 'test-key-4';
      
      // Use up the limit
      for (let i = 0; i < 5; i++) {
        expect(isRateLimited(key, 5, 1000)).toBe(false);
      }
      
      expect(isRateLimited(key, 5, 1000)).toBe(true);
      
      // Advance time past window
      vi.advanceTimersByTime(1001);
      
      // Should be allowed again
      expect(isRateLimited(key, 5, 1000)).toBe(false);
      
      vi.useRealTimers();
    });

    test('handles different keys independently', () => {
      const key1 = 'test-key-5a';
      const key2 = 'test-key-5b';
      
      // Use up limit for key1
      for (let i = 0; i < 3; i++) {
        expect(isRateLimited(key1, 3, 60000)).toBe(false);
      }
      expect(isRateLimited(key1, 3, 60000)).toBe(true);
      
      // key2 should still be allowed
      expect(isRateLimited(key2, 3, 60000)).toBe(false);
    });

    test('uses default parameters', () => {
      const key = 'test-key-6';
      
      // Default is 5 attempts in 60 seconds
      for (let i = 0; i < 5; i++) {
        expect(isRateLimited(key)).toBe(false);
      }
      expect(isRateLimited(key)).toBe(true);
    });
  });

  describe('secureCleanup', () => {
    test('overwrites string properties', () => {
      const obj = {
        password: 'secret123',
        token: 'abc123xyz',
        publicData: 'safe-data'
      };
      
      secureCleanup(obj);
      
      expect(obj.password).not.toBe('secret123');
      expect(obj.token).not.toBe('abc123xyz');
      expect(obj.publicData).not.toBe('safe-data');
    });

    test('cleans nested objects recursively', () => {
      const obj = {
        user: {
          password: 'secret',
          profile: {
            sensitiveData: 'classified'
          }
        },
        session: {
          token: 'token123'
        }
      };
      
      secureCleanup(obj);
      
      expect(obj).toEqual({});
    });

    test('handles arrays', () => {
      const obj = {
        passwords: ['secret1', 'secret2'],
        data: [{ token: 'abc' }, { key: 'xyz' }]
      };
      
      secureCleanup(obj);
      
      expect(obj).toEqual({});
    });

    test('handles null and undefined', () => {
      expect(() => secureCleanup(null)).not.toThrow();
      expect(() => secureCleanup(undefined)).not.toThrow();
    });

    test('handles non-object types', () => {
      expect(() => secureCleanup('string')).not.toThrow();
      expect(() => secureCleanup(123)).not.toThrow();
      expect(() => secureCleanup(true)).not.toThrow();
    });

    test('overwrites strings with random data', () => {
      const obj = { secret: 'original-secret' };
      const originalValue = obj.secret;
      
      secureCleanup(obj);
      
      // Object should be empty after cleanup
      expect(Object.keys(obj)).toHaveLength(0);
    });

    test('handles circular references gracefully', () => {
      const obj: any = { data: 'secret' };
      obj.self = obj; // Create circular reference
      
      expect(() => secureCleanup(obj)).not.toThrow();
    });

    test('handles complex nested structures', () => {
      const obj = {
        level1: {
          level2: {
            level3: {
              secret: 'deep-secret',
              number: 42,
              boolean: true
            },
            array: ['secret1', 'secret2', { nested: 'secret3' }]
          }
        }
      };
      
      secureCleanup(obj);
      
      expect(obj).toEqual({});
    });
  });
});