import { AccessService } from '@/domain/access/services/AccessService';
import { AccessToken } from '@/domain/access/entities/AccessToken';
import { AccessCode } from '@/domain/access/value-objects/AccessCode';
import { IAccessTokenRepository } from '@/domain/access/repositories/IAccessTokenRepository';
import { BookingConfirmed } from '@/domain/booking/events/BookingConfirmed';
import { DateRange } from '@/domain/booking/value-objects/DateRange';
import { AccessDeniedError } from '@/domain/shared/errors';

// Mock repository for testing
class MockAccessTokenRepository implements IAccessTokenRepository {
  private tokens: AccessToken[] = [];

  async save(token: AccessToken): Promise<void> {
    this.tokens.push(token);
  }

  async findById(tokenId: string): Promise<AccessToken | null> {
    return this.tokens.find(t => t.id === tokenId) || null;
  }

  async findByRoomAndCode(roomId: string, code: string): Promise<AccessToken | null> {
    return this.tokens.find(t => t.roomId === roomId && t.code.value === code) || null;
  }

  async findByBookingId(bookingId: string): Promise<AccessToken | null> {
    return this.tokens.find(t => t.bookingId === bookingId) || null;
  }

  async findAll(): Promise<AccessToken[]> {
    return [...this.tokens];
  }

  // Test helper
  reset() {
    this.tokens = [];
  }
}

describe('AccessService', () => {
  let repository: MockAccessTokenRepository;
  let service: AccessService;

  beforeEach(() => {
    repository = new MockAccessTokenRepository();
    service = new AccessService(repository);
  });

  describe('TEST 3: Generate Access Token from BookingConfirmed Event', () => {
    it('should create access token when booking is confirmed', async () => {
      const bookingId = 'booking-123';
      const roomId = 'room-101';
      const guestId = 'guest-456';
      const dateRange = new DateRange(
        new Date('2025-12-20T15:00:00'),
        new Date('2025-12-22T11:00:00')
      );

      const event = new BookingConfirmed(bookingId, roomId, guestId, dateRange);

      const token = await service.generateTokenFromBooking(event);

      expect(token).toBeDefined();
      expect(token.roomId).toBe(roomId);
      expect(token.bookingId).toBe(bookingId);
      expect(token.code).toBeDefined();
      expect(token.code.value).toMatch(/^\d{6}$/); // 6-digit code
    });

    it('should set validFrom to 1 hour before booking start', async () => {
      const bookingStart = new Date('2025-12-20T15:00:00');
      const bookingEnd = new Date('2025-12-22T11:00:00');
      const dateRange = new DateRange(bookingStart, bookingEnd);

      const event = new BookingConfirmed('booking-123', 'room-101', 'guest-456', dateRange);

      const token = await service.generateTokenFromBooking(event);

      // validFrom should be 1 hour before booking start
      const expectedValidFrom = new Date(bookingStart.getTime() - 60 * 60 * 1000);
      expect(token.validFrom).toEqual(expectedValidFrom);
    });

    it('should set validTo to 1 hour after booking end', async () => {
      const bookingStart = new Date('2025-12-20T15:00:00');
      const bookingEnd = new Date('2025-12-22T11:00:00');
      const dateRange = new DateRange(bookingStart, bookingEnd);

      const event = new BookingConfirmed('booking-123', 'room-101', 'guest-456', dateRange);

      const token = await service.generateTokenFromBooking(event);

      // validTo should be 1 hour after booking end
      const expectedValidTo = new Date(bookingEnd.getTime() + 60 * 60 * 1000);
      expect(token.validTo).toEqual(expectedValidTo);
    });

    it('should save the token to repository', async () => {
      const event = new BookingConfirmed(
        'booking-123',
        'room-101',
        'guest-456',
        new DateRange(
          new Date('2025-12-20T15:00:00'),
          new Date('2025-12-22T11:00:00')
        )
      );

      const token = await service.generateTokenFromBooking(event);

      const saved = await repository.findById(token.id);
      expect(saved).toBeDefined();
      expect(saved?.id).toBe(token.id);
    });
  });

  describe('TEST 4: Validate Access at Door', () => {
    it('should grant access with valid code, room, and time', async () => {
      const roomId = 'room-101';
      const code = AccessCode.fromString('123456');
      const now = new Date('2025-12-21T10:00:00'); // During valid period

      // Create token manually for test
      const token = new AccessToken(
        'token-123',
        roomId,
        'booking-123',
        code,
        new Date('2025-12-20T14:00:00'), // validFrom
        new Date('2025-12-22T12:00:00')  // validTo
      );
      await repository.save(token);

      const result = await service.tryUnlock(roomId, code.value, now);

      expect(result.granted).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should deny access with wrong code', async () => {
      const roomId = 'room-101';
      const correctCode = AccessCode.fromString('123456');
      const wrongCode = '654321';
      const now = new Date('2025-12-21T10:00:00');

      const token = new AccessToken(
        'token-123',
        roomId,
        'booking-123',
        correctCode,
        new Date('2025-12-20T14:00:00'),
        new Date('2025-12-22T12:00:00')
      );
      await repository.save(token);

      const result = await service.tryUnlock(roomId, wrongCode, now);

      expect(result.granted).toBe(false);
      expect(result.reason).toContain('No valid access token found');
    });

    it('should deny access when time is before validFrom', async () => {
      const roomId = 'room-101';
      const code = AccessCode.fromString('123456');
      const tooEarly = new Date('2025-12-20T13:00:00'); // Before validFrom

      const token = new AccessToken(
        'token-123',
        roomId,
        'booking-123',
        code,
        new Date('2025-12-20T14:00:00'), // validFrom
        new Date('2025-12-22T12:00:00')
      );
      await repository.save(token);

      const result = await service.tryUnlock(roomId, code.value, tooEarly);

      expect(result.granted).toBe(false);
      expect(result.reason).toContain('outside valid time window');
    });

    it('should deny access when time is after validTo', async () => {
      const roomId = 'room-101';
      const code = AccessCode.fromString('123456');
      const tooLate = new Date('2025-12-22T13:00:00'); // After validTo

      const token = new AccessToken(
        'token-123',
        roomId,
        'booking-123',
        code,
        new Date('2025-12-20T14:00:00'),
        new Date('2025-12-22T12:00:00')  // validTo
      );
      await repository.save(token);

      const result = await service.tryUnlock(roomId, code.value, tooLate);

      expect(result.granted).toBe(false);
      expect(result.reason).toContain('outside valid time window');
    });

    it('should deny access for wrong room', async () => {
      const correctRoomId = 'room-101';
      const wrongRoomId = 'room-102';
      const code = AccessCode.fromString('123456');
      const now = new Date('2025-12-21T10:00:00');

      const token = new AccessToken(
        'token-123',
        correctRoomId,
        'booking-123',
        code,
        new Date('2025-12-20T14:00:00'),
        new Date('2025-12-22T12:00:00')
      );
      await repository.save(token);

      const result = await service.tryUnlock(wrongRoomId, code.value, now);

      expect(result.granted).toBe(false);
      expect(result.reason).toContain('No valid access token found');
    });

    it('should deny access when no token exists', async () => {
      const result = await service.tryUnlock('room-101', '123456', new Date());

      expect(result.granted).toBe(false);
      expect(result.reason).toContain('No valid access token found');
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple tokens for different rooms', async () => {
      const code1 = AccessCode.fromString('111111');
      const code2 = AccessCode.fromString('222222');
      const now = new Date('2025-12-21T10:00:00');

      const token1 = new AccessToken(
        'token-1',
        'room-101',
        'booking-1',
        code1,
        new Date('2025-12-20T14:00:00'),
        new Date('2025-12-22T12:00:00')
      );

      const token2 = new AccessToken(
        'token-2',
        'room-102',
        'booking-2',
        code2,
        new Date('2025-12-20T14:00:00'),
        new Date('2025-12-22T12:00:00')
      );

      await repository.save(token1);
      await repository.save(token2);

      // Room 101 with correct code
      const result1 = await service.tryUnlock('room-101', code1.value, now);
      expect(result1.granted).toBe(true);

      // Room 102 with correct code
      const result2 = await service.tryUnlock('room-102', code2.value, now);
      expect(result2.granted).toBe(true);

      // Room 101 with wrong code
      const result3 = await service.tryUnlock('room-101', code2.value, now);
      expect(result3.granted).toBe(false);
    });
  });
});
