import { Booking, BookingStatus } from '@/domain/booking/entities/Booking';
import { DateRange } from '@/domain/booking/value-objects/DateRange';
import { BookingConfirmed } from '@/domain/booking/events/BookingConfirmed';
import { BookingCheckedOut } from '@/domain/booking/events/BookingCheckedOut';

describe('Booking Aggregate Root', () => {
  describe('TEST 1: Create Booking Without Conflict', () => {
    it('should create a confirmed booking with valid data', () => {
      const bookingId = 'booking-123';
      const roomId = 'room-101';
      const guestId = 'guest-456';
      const dateRange = new DateRange(
        new Date('2025-12-20T15:00:00'),
        new Date('2025-12-22T11:00:00')
      );

      const booking = new Booking(bookingId, roomId, guestId, dateRange);

      expect(booking.id).toBe(bookingId);
      expect(booking.roomId).toBe(roomId);
      expect(booking.guestId).toBe(guestId);
      expect(booking.dateRange).toBe(dateRange);
      expect(booking.status).toBe(BookingStatus.Confirmed);
    });

    it('should emit BookingConfirmed event when booking is created', () => {
      const bookingId = 'booking-123';
      const roomId = 'room-101';
      const guestId = 'guest-456';
      const dateRange = new DateRange(
        new Date('2025-12-20T15:00:00'),
        new Date('2025-12-22T11:00:00')
      );

      const booking = new Booking(bookingId, roomId, guestId, dateRange);

      const events = booking.getUncommittedEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(BookingConfirmed);

      const event = events[0] as BookingConfirmed;
      expect(event.aggregateId).toBe(bookingId);
      expect(event.roomId).toBe(roomId);
      expect(event.guestId).toBe(guestId);
      expect(event.dateRange).toBe(dateRange);
    });

    it('should clear uncommitted events after marking them as committed', () => {
      const booking = new Booking(
        'booking-123',
        'room-101',
        'guest-456',
        new DateRange(
          new Date('2025-12-20T15:00:00'),
          new Date('2025-12-22T11:00:00')
        )
      );

      expect(booking.getUncommittedEvents()).toHaveLength(1);

      booking.markEventsAsCommitted();

      expect(booking.getUncommittedEvents()).toHaveLength(0);
    });
  });

  describe('TEST 2: Checkout Flow', () => {
    it('should change status to CheckedOut when checking out', () => {
      const booking = new Booking(
        'booking-123',
        'room-101',
        'guest-456',
        new DateRange(
          new Date('2025-12-20T15:00:00'),
          new Date('2025-12-22T11:00:00')
        )
      );

      // Clear initial event
      booking.markEventsAsCommitted();

      const checkOutTime = new Date('2025-12-22T10:30:00');
      booking.checkOut(checkOutTime);

      expect(booking.status).toBe(BookingStatus.CheckedOut);
    });

    it('should emit BookingCheckedOut event when checking out', () => {
      const bookingId = 'booking-123';
      const roomId = 'room-101';
      const guestId = 'guest-456';
      const booking = new Booking(
        bookingId,
        roomId,
        guestId,
        new DateRange(
          new Date('2025-12-20T15:00:00'),
          new Date('2025-12-22T11:00:00')
        )
      );

      // Clear initial event
      booking.markEventsAsCommitted();

      const checkOutTime = new Date('2025-12-22T10:30:00');
      booking.checkOut(checkOutTime);

      const events = booking.getUncommittedEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(BookingCheckedOut);

      const event = events[0] as BookingCheckedOut;
      expect(event.aggregateId).toBe(bookingId);
      expect(event.roomId).toBe(roomId);
      expect(event.guestId).toBe(guestId);
      expect(event.checkOutTime).toEqual(checkOutTime);
    });
  });

  describe('Invariants and Business Rules', () => {
    it('should not allow checkout when already checked out', () => {
      const booking = new Booking(
        'booking-123',
        'room-101',
        'guest-456',
        new DateRange(
          new Date('2025-12-20T15:00:00'),
          new Date('2025-12-22T11:00:00')
        )
      );

      booking.checkOut(new Date('2025-12-22T10:30:00'));

      // Attempt second checkout
      expect(() => booking.checkOut(new Date('2025-12-22T11:00:00')))
        .toThrow('Cannot check out: booking is not in Confirmed status');
    });

    it('should not allow checkout if cancelled', () => {
      const booking = new Booking(
        'booking-123',
        'room-101',
        'guest-456',
        new DateRange(
          new Date('2025-12-20T15:00:00'),
          new Date('2025-12-22T11:00:00')
        )
      );

      booking.cancel();

      expect(() => booking.checkOut(new Date('2025-12-22T10:30:00')))
        .toThrow('Cannot check out: booking is not in Confirmed status');
    });
  });

  describe('State Management', () => {
    it('should allow cancellation from Confirmed status', () => {
      const booking = new Booking(
        'booking-123',
        'room-101',
        'guest-456',
        new DateRange(
          new Date('2025-12-20T15:00:00'),
          new Date('2025-12-22T11:00:00')
        )
      );

      booking.cancel();

      expect(booking.status).toBe(BookingStatus.Cancelled);
    });

    it('should not allow cancellation after checkout', () => {
      const booking = new Booking(
        'booking-123',
        'room-101',
        'guest-456',
        new DateRange(
          new Date('2025-12-20T15:00:00'),
          new Date('2025-12-22T11:00:00')
        )
      );

      booking.checkOut(new Date('2025-12-22T10:30:00'));

      expect(() => booking.cancel())
        .toThrow('Cannot cancel: booking is not in Confirmed status');
    });
  });
});
