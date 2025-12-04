import { IBookingRepository } from '@/domain/booking/repositories/IBookingRepository';
import { Booking, BookingStatus } from '@/domain/booking/entities/Booking';
import { DateRange } from '@/domain/booking/value-objects/DateRange';
import { saveToFile, loadFromFile } from './persistence';

/**
 * In-Memory Booking Repository with file persistence
 *
 * Simple in-memory implementation with JSON file backup for MVP.
 * In production, this would be replaced with a database implementation.
 */
export class InMemoryBookingRepository implements IBookingRepository {
  private bookings: Map<string, Booking> = new Map();

  constructor() {
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    try {
      const data = loadFromFile<any[]>('bookings', []);
      for (const item of data) {
        // Reconstruct Booking from serialized data
        const dateRange = new DateRange(new Date(item.dateRange.start), new Date(item.dateRange.end));
        const booking = new Booking(item.id, item.roomId, item.guestId, dateRange);

        // Restore status by manually calling methods
        if (item.status === 'CheckedOut') {
          booking.checkOut(new Date());
        } else if (item.status === 'Cancelled') {
          booking.cancel();
        }

        // Clear events since we're loading existing data
        booking.markEventsAsCommitted();

        this.bookings.set(booking.id, booking);
      }
    } catch (error) {
      console.error('Failed to load bookings from disk:', error);
    }
  }

  private saveToDisk(): void {
    const data = Array.from(this.bookings.values()).map(b => ({
      id: b.id,
      roomId: b.roomId,
      guestId: b.guestId,
      dateRange: {
        start: b.dateRange.start.toISOString(),
        end: b.dateRange.end.toISOString()
      },
      status: b.status
    }));
    saveToFile('bookings', data);
  }

  async save(booking: Booking): Promise<void> {
    this.bookings.set(booking.id, booking);
    this.saveToDisk();
  }

  async findById(bookingId: string): Promise<Booking | null> {
    return this.bookings.get(bookingId) || null;
  }

  async findByRoomAndDateRange(
    roomId: string,
    dateRange: DateRange
  ): Promise<Booking[]> {
    const result: Booking[] = [];

    for (const booking of this.bookings.values()) {
      // Only consider confirmed bookings (not cancelled or checked out)
      if (booking.status !== BookingStatus.Confirmed) {
        continue;
      }

      // Check if room matches and dates overlap
      if (booking.roomId === roomId && booking.dateRange.overlaps(dateRange)) {
        result.push(booking);
      }
    }

    return result;
  }

  async findAll(): Promise<Booking[]> {
    return Array.from(this.bookings.values());
  }

  /**
   * Test helper: Clear all bookings
   */
  clear(): void {
    this.bookings.clear();
  }
}
