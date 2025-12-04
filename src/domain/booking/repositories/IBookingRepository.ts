import { Booking } from '../entities/Booking';
import { DateRange } from '../value-objects/DateRange';

/**
 * Booking Repository Interface
 *
 * Defines the contract for booking persistence.
 * Domain layer depends on this interface, not the implementation.
 * This enables dependency inversion and makes domain testable.
 */
export interface IBookingRepository {
  /**
   * Save a booking (create or update)
   */
  save(booking: Booking): Promise<void>;

  /**
   * Find a booking by ID
   * @returns Booking if found, null otherwise
   */
  findById(bookingId: string): Promise<Booking | null>;

  /**
   * Find all bookings for a specific room within a date range
   * Used for overlap detection
   */
  findByRoomAndDateRange(roomId: string, dateRange: DateRange): Promise<Booking[]>;

  /**
   * Find all bookings (useful for queries)
   */
  findAll(): Promise<Booking[]>;
}
