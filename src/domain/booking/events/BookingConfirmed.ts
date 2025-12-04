import { DomainEvent, generateEventId } from '@/domain/shared/DomainEvent';
import { DateRange } from '../value-objects/DateRange';

/**
 * BookingConfirmed Event
 *
 * Emitted when a booking is confirmed.
 * Other bounded contexts (e.g., Access) can listen to this event.
 */
export class BookingConfirmed implements DomainEvent {
  readonly eventId: string;
  readonly occurredAt: Date;
  readonly eventType = 'BookingConfirmed';

  constructor(
    public readonly aggregateId: string, // bookingId
    public readonly roomId: string,
    public readonly guestId: string,
    public readonly dateRange: DateRange
  ) {
    this.eventId = generateEventId();
    this.occurredAt = new Date();
  }
}
