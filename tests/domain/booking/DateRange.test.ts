import { DateRange } from '@/domain/booking/value-objects/DateRange';

describe('DateRange Value Object', () => {
  describe('Creation and Validation', () => {
    it('should create a valid date range when start is before end', () => {
      const start = new Date('2025-12-20T15:00:00');
      const end = new Date('2025-12-22T11:00:00');

      const dateRange = new DateRange(start, end);

      expect(dateRange.start).toEqual(start);
      expect(dateRange.end).toEqual(end);
    });

    it('should throw error when start is after end', () => {
      const start = new Date('2025-12-22T15:00:00');
      const end = new Date('2025-12-20T11:00:00');

      expect(() => new DateRange(start, end)).toThrow('Start date must be before end date');
    });

    it('should throw error when start equals end', () => {
      const date = new Date('2025-12-20T15:00:00');

      expect(() => new DateRange(date, date)).toThrow('Start date must be before end date');
    });
  });

  describe('Overlaps Detection', () => {
    it('should detect overlap when ranges overlap partially', () => {
      // Range 1: Dec 20-22
      const range1 = new DateRange(
        new Date('2025-12-20T15:00:00'),
        new Date('2025-12-22T11:00:00')
      );

      // Range 2: Dec 21-23 (overlaps with range1)
      const range2 = new DateRange(
        new Date('2025-12-21T15:00:00'),
        new Date('2025-12-23T11:00:00')
      );

      expect(range1.overlaps(range2)).toBe(true);
      expect(range2.overlaps(range1)).toBe(true); // Symmetrical
    });

    it('should detect overlap when one range contains another', () => {
      // Range 1: Dec 20-25 (larger)
      const range1 = new DateRange(
        new Date('2025-12-20T15:00:00'),
        new Date('2025-12-25T11:00:00')
      );

      // Range 2: Dec 21-22 (contained within range1)
      const range2 = new DateRange(
        new Date('2025-12-21T15:00:00'),
        new Date('2025-12-22T11:00:00')
      );

      expect(range1.overlaps(range2)).toBe(true);
      expect(range2.overlaps(range1)).toBe(true);
    });

    it('should NOT detect overlap when ranges are adjacent (end = start)', () => {
      // Range 1: Dec 20-22, ends at 11:00
      const range1 = new DateRange(
        new Date('2025-12-20T15:00:00'),
        new Date('2025-12-22T11:00:00')
      );

      // Range 2: Dec 22-24, starts at 11:00 (exactly when range1 ends)
      const range2 = new DateRange(
        new Date('2025-12-22T11:00:00'),
        new Date('2025-12-24T11:00:00')
      );

      // Adjacent ranges should NOT overlap (one ends when other starts)
      expect(range1.overlaps(range2)).toBe(false);
      expect(range2.overlaps(range1)).toBe(false);
    });

    it('should NOT detect overlap when ranges are completely separate', () => {
      // Range 1: Dec 20-22
      const range1 = new DateRange(
        new Date('2025-12-20T15:00:00'),
        new Date('2025-12-22T11:00:00')
      );

      // Range 2: Dec 25-27 (completely after range1)
      const range2 = new DateRange(
        new Date('2025-12-25T15:00:00'),
        new Date('2025-12-27T11:00:00')
      );

      expect(range1.overlaps(range2)).toBe(false);
      expect(range2.overlaps(range1)).toBe(false);
    });
  });

  describe('Contains Timestamp', () => {
    const dateRange = new DateRange(
      new Date('2025-12-20T15:00:00'),
      new Date('2025-12-22T11:00:00')
    );

    it('should return true when timestamp is within range', () => {
      const timestamp = new Date('2025-12-21T10:00:00');
      expect(dateRange.contains(timestamp)).toBe(true);
    });

    it('should return true when timestamp equals start', () => {
      const timestamp = new Date('2025-12-20T15:00:00');
      expect(dateRange.contains(timestamp)).toBe(true);
    });

    it('should return false when timestamp equals end (exclusive)', () => {
      const timestamp = new Date('2025-12-22T11:00:00');
      expect(dateRange.contains(timestamp)).toBe(false);
    });

    it('should return false when timestamp is before start', () => {
      const timestamp = new Date('2025-12-19T10:00:00');
      expect(dateRange.contains(timestamp)).toBe(false);
    });

    it('should return false when timestamp is after end', () => {
      const timestamp = new Date('2025-12-23T10:00:00');
      expect(dateRange.contains(timestamp)).toBe(false);
    });
  });

  describe('Immutability', () => {
    it('should be immutable (start cannot be changed)', () => {
      const start = new Date('2025-12-20T15:00:00');
      const end = new Date('2025-12-22T11:00:00');
      const dateRange = new DateRange(start, end);

      // TypeScript should prevent this at compile time, but let's verify at runtime
      expect(() => {
        // @ts-expect-error - Testing immutability
        dateRange.start = new Date('2025-12-25T15:00:00');
      }).toThrow();
    });

    it('should return new Date objects to prevent mutation', () => {
      const start = new Date('2025-12-20T15:00:00');
      const end = new Date('2025-12-22T11:00:00');
      const dateRange = new DateRange(start, end);

      // Modifying the returned date should NOT affect the DateRange
      const returnedStart = dateRange.start;
      returnedStart.setDate(25);

      expect(dateRange.start).toEqual(new Date('2025-12-20T15:00:00'));
    });
  });

  describe('Equality', () => {
    it('should be equal when start and end are the same', () => {
      const range1 = new DateRange(
        new Date('2025-12-20T15:00:00'),
        new Date('2025-12-22T11:00:00')
      );

      const range2 = new DateRange(
        new Date('2025-12-20T15:00:00'),
        new Date('2025-12-22T11:00:00')
      );

      expect(range1.equals(range2)).toBe(true);
    });

    it('should NOT be equal when dates differ', () => {
      const range1 = new DateRange(
        new Date('2025-12-20T15:00:00'),
        new Date('2025-12-22T11:00:00')
      );

      const range2 = new DateRange(
        new Date('2025-12-20T15:00:00'),
        new Date('2025-12-23T11:00:00') // Different end
      );

      expect(range1.equals(range2)).toBe(false);
    });
  });
});
