import { AccessCode } from '@/domain/access/value-objects/AccessCode';

describe('AccessCode Value Object', () => {
  describe('Generation', () => {
    it('should generate a 6-digit code', () => {
      const code = AccessCode.generate();

      expect(code.value).toHaveLength(6);
      expect(code.value).toMatch(/^\d{6}$/); // Only digits
    });

    it('should generate different codes on multiple calls', () => {
      const code1 = AccessCode.generate();
      const code2 = AccessCode.generate();
      const code3 = AccessCode.generate();

      // At least one should be different (probabilistically very likely)
      const allSame = code1.equals(code2) && code2.equals(code3);
      expect(allSame).toBe(false);
    });

    it('should generate codes in valid range (000000-999999)', () => {
      const code = AccessCode.generate();
      const numericValue = parseInt(code.value, 10);

      expect(numericValue).toBeGreaterThanOrEqual(0);
      expect(numericValue).toBeLessThanOrEqual(999999);
    });
  });

  describe('Creation from String', () => {
    it('should create code from valid 6-digit string', () => {
      const code = AccessCode.fromString('123456');

      expect(code.value).toBe('123456');
    });

    it('should create code from string with leading zeros', () => {
      const code = AccessCode.fromString('000123');

      expect(code.value).toBe('000123');
    });

    it('should throw error for non-digit characters', () => {
      expect(() => AccessCode.fromString('12345a')).toThrow('Access code must be exactly 6 digits');
      expect(() => AccessCode.fromString('12-456')).toThrow('Access code must be exactly 6 digits');
      expect(() => AccessCode.fromString('12 456')).toThrow('Access code must be exactly 6 digits');
    });

    it('should throw error for incorrect length', () => {
      expect(() => AccessCode.fromString('12345')).toThrow('Access code must be exactly 6 digits');
      expect(() => AccessCode.fromString('1234567')).toThrow('Access code must be exactly 6 digits');
      expect(() => AccessCode.fromString('')).toThrow('Access code must be exactly 6 digits');
    });

    it('should throw error for null or undefined', () => {
      expect(() => AccessCode.fromString(null as any)).toThrow('Access code must be exactly 6 digits');
      expect(() => AccessCode.fromString(undefined as any)).toThrow('Access code must be exactly 6 digits');
    });
  });

  describe('Equality', () => {
    it('should be equal when codes have same value', () => {
      const code1 = AccessCode.fromString('123456');
      const code2 = AccessCode.fromString('123456');

      expect(code1.equals(code2)).toBe(true);
    });

    it('should NOT be equal when codes have different values', () => {
      const code1 = AccessCode.fromString('123456');
      const code2 = AccessCode.fromString('654321');

      expect(code1.equals(code2)).toBe(false);
    });

    it('should handle leading zeros correctly in equality', () => {
      const code1 = AccessCode.fromString('000123');
      const code2 = AccessCode.fromString('000123');

      expect(code1.equals(code2)).toBe(true);
    });
  });

  describe('Immutability', () => {
    it('should be immutable (value cannot be changed)', () => {
      const code = AccessCode.fromString('123456');

      // TypeScript should prevent this at compile time
      expect(() => {
        // @ts-expect-error - Testing immutability
        code.value = '654321';
      }).toThrow();
    });

    it('should be frozen', () => {
      const code = AccessCode.fromString('123456');

      expect(Object.isFrozen(code)).toBe(true);
    });
  });

  describe('String Representation', () => {
    it('should return code value as string', () => {
      const code = AccessCode.fromString('123456');

      expect(code.toString()).toBe('123456');
    });

    it('should preserve leading zeros in string representation', () => {
      const code = AccessCode.fromString('000123');

      expect(code.toString()).toBe('000123');
    });
  });

  describe('Value Object Behavior', () => {
    it('should be usable in Set (based on reference, not value)', () => {
      const code1 = AccessCode.fromString('123456');
      const code2 = AccessCode.fromString('123456'); // Same value, different instance

      const set = new Set([code1, code2]);

      // Since they are different objects, Set will contain both
      expect(set.size).toBe(2);
    });

    it('should be usable in Map as key', () => {
      const code1 = AccessCode.fromString('123456');
      const code2 = AccessCode.fromString('654321');

      const map = new Map<AccessCode, string>();
      map.set(code1, 'Room 101');
      map.set(code2, 'Room 102');

      expect(map.size).toBe(2);
      expect(map.get(code1)).toBe('Room 101');
      expect(map.get(code2)).toBe('Room 102');
    });
  });
});
