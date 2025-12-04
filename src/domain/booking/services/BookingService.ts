import { Booking } from '../entities/Booking';
import { DateRange } from '../value-objects/DateRange';
import { IBookingRepository } from '../repositories/IBookingRepository';
import { OverlappingBookingError } from '@/domain/shared/errors';

/**
 * Booking Domain Service
 *
 * Handles operations that involve multiple aggregates or require repository access.
 * In this case: checking for overlapping bookings before creating a new one.
 */
export class BookingService {
  constructor(private readonly repository: IBookingRepository) {}

  /**
   * Create a new booking.
   * Validates that no overlapping bookings exist for the same room.
   *
   * @param roomId - The room to book
   * @param guestId - The guest making the booking
   * @param dateRange - The date range for the booking
   * @returns The created booking
   * @throws OverlappingBookingError if there's a conflict
   */
  async createBooking(
    roomId: string,
    guestId: string,
    dateRange: DateRange
  ): Promise<Booking> {
    // Check for overlapping bookings
    const overlappingBookings = await this.repository.findByRoomAndDateRange(
      roomId,
      dateRange
    );

    if (overlappingBookings.length > 0) {
      throw new OverlappingBookingError(
        roomId,
        overlappingBookings[0].id,
        `Cannot create booking: Room ${roomId} is already booked for the requested dates`
      );
    }

    // Generate unique booking ID
    const bookingId = this.generateBookingId();

    // Create new booking
    const booking = new Booking(bookingId, roomId, guestId, dateRange);

    // Save to repository
    await this.repository.save(booking);

    return booking;
  }

  /**
   * Generate a unique booking ID
   * In a real system, this might use UUID or database sequence
   */
  private generateBookingId(): string {
    return `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
