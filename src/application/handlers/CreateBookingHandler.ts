import { BookingService } from '../../domain/booking/services/BookingService';
import { EventBus } from '../events/EventBus';
import { CreateBookingCommand } from '../commands/CreateBookingCommand';
import { DateRange } from '../../domain/booking/value-objects/DateRange';

/**
 * CreateBookingHandler
 *
 * Application layer handler that orchestrates the creation of a booking.
 *
 * Responsibilities:
 * 1. Convert command data to domain objects (DateRange)
 * 2. Call domain service to create booking
 * 3. Publish uncommitted domain events to EventBus
 * 4. Mark events as committed
 * 5. Return result
 *
 * This handler demonstrates the "Handler Pattern" in DDD,
 * separating HTTP/API concerns from domain logic.
 */
export class CreateBookingHandler {
  constructor(
    private readonly bookingService: BookingService,
    private readonly eventBus: EventBus
  ) {}

  async handle(command: CreateBookingCommand): Promise<{ bookingId: string }> {
    // 1. Convert command data to domain value objects
    const dateRange = new DateRange(
      new Date(command.checkIn),
      new Date(command.checkOut)
    );

    // 2. Create booking through domain service
    const booking = await this.bookingService.createBooking(
      command.roomNumber,
      command.guestName,
      dateRange
    );

    // 3. Publish uncommitted events to EventBus
    // This is where cross-context communication happens!
    const events = booking.getUncommittedEvents();
    for (const event of events) {
      await this.eventBus.publish(event);
    }

    // 4. Mark events as committed
    booking.markEventsAsCommitted();

    // 5. Return result
    return { bookingId: booking.id };
  }
}
