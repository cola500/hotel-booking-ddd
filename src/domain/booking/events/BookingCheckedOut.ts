import { DomainEvent, generateEventId } from '@/domain/shared/DomainEvent';

/**
 * BookingCheckedOut Event
 *
 * Emitted when a guest checks out.
 * Housekeeping context can listen to this event to create cleaning tasks.
 */
export class BookingCheckedOut implements DomainEvent {
  readonly eventId: string;
  readonly occurredAt: Date;
  readonly eventType = 'BookingCheckedOut';

  constructor(
    public readonly aggregateId: string, // bookingId
    public readonly roomId: string,
    public readonly guestId: string,
    public readonly checkOutTime: Date
  ) {
    this.eventId = generateEventId();
    this.occurredAt = new Date();
  }
}
