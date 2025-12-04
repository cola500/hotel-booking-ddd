import { DateRange } from '../value-objects/DateRange';
import { DomainEvent } from '@/domain/shared/DomainEvent';
import { BookingConfirmed } from '../events/BookingConfirmed';
import { BookingCheckedOut } from '../events/BookingCheckedOut';

/**
 * Booking Status Enum
 */
export enum BookingStatus {
  Confirmed = 'Confirmed',
  CheckedOut = 'CheckedOut',
  Cancelled = 'Cancelled',
}

/**
 * Booking Aggregate Root
 *
 * Represents a hotel room booking.
 * This is an aggregate root - it manages its own consistency and emits domain events.
 *
 * Invariants:
 * - DateRange must be valid (enforced by DateRange Value Object)
 * - Can only check out from Confirmed status
 * - Can only cancel from Confirmed status
 * - Events are emitted for state changes
 */
export class Booking {
  private _status: BookingStatus;
  private _uncommittedEvents: DomainEvent[] = [];

  constructor(
    public readonly id: string,
    public readonly roomId: string,
    public readonly guestId: string,
    public readonly dateRange: DateRange
  ) {
    this._status = BookingStatus.Confirmed;

    // Emit BookingConfirmed event
    this.addEvent(
      new BookingConfirmed(this.id, this.roomId, this.guestId, this.dateRange)
    );

    // Note: We don't freeze the object since _status needs to be mutable
    // The readonly properties are already protected by TypeScript
  }

  /**
   * Current status of the booking
   */
  get status(): BookingStatus {
    return this._status;
  }

  /**
   * Check out the guest.
   * Transitions status to CheckedOut and emits BookingCheckedOut event.
   *
   * @param checkOutTime - When the checkout occurred
   * @throws Error if not in Confirmed status
   */
  checkOut(checkOutTime: Date): void {
    if (this._status !== BookingStatus.Confirmed) {
      throw new Error('Cannot check out: booking is not in Confirmed status');
    }

    this._status = BookingStatus.CheckedOut;

    this.addEvent(
      new BookingCheckedOut(this.id, this.roomId, this.guestId, checkOutTime)
    );
  }

  /**
   * Cancel the booking.
   * Transitions status to Cancelled.
   *
   * @throws Error if not in Confirmed status
   */
  cancel(): void {
    if (this._status !== BookingStatus.Confirmed) {
      throw new Error('Cannot cancel: booking is not in Confirmed status');
    }

    this._status = BookingStatus.Cancelled;

    // Could emit BookingCancelled event if needed
  }

  /**
   * Get all uncommitted domain events.
   * These are events that haven't been persisted/published yet.
   */
  getUncommittedEvents(): DomainEvent[] {
    return [...this._uncommittedEvents];
  }

  /**
   * Mark all uncommitted events as committed.
   * Call this after events have been persisted/published.
   */
  markEventsAsCommitted(): void {
    this._uncommittedEvents = [];
  }

  /**
   * Add a domain event to uncommitted events
   */
  private addEvent(event: DomainEvent): void {
    this._uncommittedEvents.push(event);
  }
}
