/**
 * Domain Event Interface
 *
 * Base interface for all domain events.
 * Events represent things that have happened in the domain (past tense).
 */
export interface DomainEvent {
  /**
   * Unique identifier for this event instance
   */
  eventId: string;

  /**
   * When the event occurred
   */
  occurredAt: Date;

  /**
   * Type of event (e.g., "BookingConfirmed", "BookingCheckedOut")
   */
  eventType: string;

  /**
   * Aggregate ID this event relates to
   */
  aggregateId: string;
}

/**
 * Helper to generate unique event IDs
 */
export function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
