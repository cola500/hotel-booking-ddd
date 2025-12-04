import { BookingService } from '@/domain/booking/services/BookingService';
import { Booking } from '@/domain/booking/entities/Booking';
import { DateRange } from '@/domain/booking/value-objects/DateRange';
import { IBookingRepository } from '@/domain/booking/repositories/IBookingRepository';
import { OverlappingBookingError } from '@/domain/shared/errors';

// Mock repository for testing
class MockBookingRepository implements IBookingRepository {
  private bookings: Booking[] = [];

  async save(booking: Booking): Promise<void> {
    this.bookings.push(booking);
  }

  async findById(bookingId: string): Promise<Booking | null> {
    return this.bookings.find(b => b.id === bookingId) || null;
  }

  async findByRoomAndDateRange(roomId: string, dateRange: DateRange): Promise<Booking[]> {
    return this.bookings.filter(booking => {
      return booking.roomId === roomId && booking.dateRange.overlaps(dateRange);
    });
  }

  async findAll(): Promise<Booking[]> {
    return [...this.bookings];
  }

  // Test helper
  reset() {
    this.bookings = [];
  }
}

describe('BookingService', () => {
  let repository: MockBookingRepository;
  let service: BookingService;

  beforeEach(() => {
    repository = new MockBookingRepository();
    service = new BookingService(repository);
  });

  describe('TEST 1: Create Booking Without Conflict', () => {
    it('should create booking when no overlapping bookings exist', async () => {
      const roomId = 'room-101';
      const guestId = 'guest-456';
      const dateRange = new DateRange(
        new Date('2025-12-20T15:00:00'),
        new Date('2025-12-22T11:00:00')
      );

      const booking = await service.createBooking(roomId, guestId, dateRange);

      expect(booking).toBeDefined();
      expect(booking.roomId).toBe(roomId);
      expect(booking.guestId).toBe(guestId);
      expect(booking.dateRange).toBe(dateRange);
    });

    it('should save the booking to repository', async () => {
      const dateRange = new DateRange(
        new Date('2025-12-20T15:00:00'),
        new Date('2025-12-22T11:00:00')
      );

      const booking = await service.createBooking('room-101', 'guest-456', dateRange);

      const saved = await repository.findById(booking.id);
      expect(saved).toBeDefined();
      expect(saved?.id).toBe(booking.id);
    });
  });

  describe('TEST 2: Prevent Overlapping Bookings', () => {
    it('should throw OverlappingBookingError when bookings overlap partially', async () => {
      const roomId = 'room-101';

      // Create first booking: Dec 20-22
      const existingDateRange = new DateRange(
        new Date('2025-12-20T15:00:00'),
        new Date('2025-12-22T11:00:00')
      );
      await service.createBooking(roomId, 'guest-1', existingDateRange);

      // Attempt second booking: Dec 21-23 (overlaps!)
      const overlappingDateRange = new DateRange(
        new Date('2025-12-21T15:00:00'),
        new Date('2025-12-23T11:00:00')
      );

      await expect(
        service.createBooking(roomId, 'guest-2', overlappingDateRange)
      ).rejects.toThrow(OverlappingBookingError);
    });

    it('should throw with correct error details', async () => {
      const roomId = 'room-101';

      const booking1 = await service.createBooking(
        roomId,
        'guest-1',
        new DateRange(
          new Date('2025-12-20T15:00:00'),
          new Date('2025-12-22T11:00:00')
        )
      );

      try {
        await service.createBooking(
          roomId,
          'guest-2',
          new DateRange(
            new Date('2025-12-21T15:00:00'),
            new Date('2025-12-23T11:00:00')
          )
        );
        fail('Should have thrown OverlappingBookingError');
      } catch (error) {
        expect(error).toBeInstanceOf(OverlappingBookingError);
        const overlappingError = error as OverlappingBookingError;
        expect(overlappingError.roomId).toBe(roomId);
        expect(overlappingError.conflictingBookingId).toBe(booking1.id);
      }
    });

    it('should allow booking when ranges are adjacent (no overlap)', async () => {
      const roomId = 'room-101';

      // First booking: Dec 20-22, ends at 11:00
      await service.createBooking(
        roomId,
        'guest-1',
        new DateRange(
          new Date('2025-12-20T15:00:00'),
          new Date('2025-12-22T11:00:00')
        )
      );

      // Second booking: Dec 22-24, starts at 11:00 (adjacent, not overlapping)
      const adjacentBooking = await service.createBooking(
        roomId,
        'guest-2',
        new DateRange(
          new Date('2025-12-22T11:00:00'),
          new Date('2025-12-24T11:00:00')
        )
      );

      expect(adjacentBooking).toBeDefined();
    });

    it('should allow booking different rooms with same dates', async () => {
      const dateRange = new DateRange(
        new Date('2025-12-20T15:00:00'),
        new Date('2025-12-22T11:00:00')
      );

      await service.createBooking('room-101', 'guest-1', dateRange);

      // Same dates, different room - should be allowed
      const booking2 = await service.createBooking('room-102', 'guest-2', dateRange);

      expect(booking2).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should detect overlap when new booking contains existing booking', async () => {
      const roomId = 'room-101';

      // Small booking: Dec 21-22
      await service.createBooking(
        roomId,
        'guest-1',
        new DateRange(
          new Date('2025-12-21T15:00:00'),
          new Date('2025-12-22T11:00:00')
        )
      );

      // Large booking: Dec 20-25 (contains the first booking)
      await expect(
        service.createBooking(
          roomId,
          'guest-2',
          new DateRange(
            new Date('2025-12-20T15:00:00'),
            new Date('2025-12-25T11:00:00')
          )
        )
      ).rejects.toThrow(OverlappingBookingError);
    });

    it('should allow multiple non-overlapping bookings for same room', async () => {
      const roomId = 'room-101';

      const booking1 = await service.createBooking(
        roomId,
        'guest-1',
        new DateRange(
          new Date('2025-12-20T15:00:00'),
          new Date('2025-12-22T11:00:00')
        )
      );

      const booking2 = await service.createBooking(
        roomId,
        'guest-2',
        new DateRange(
          new Date('2025-12-25T15:00:00'),
          new Date('2025-12-27T11:00:00')
        )
      );

      expect(booking1).toBeDefined();
      expect(booking2).toBeDefined();
    });
  });
});
