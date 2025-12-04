/**
 * Domain Errors
 *
 * Custom error classes for domain-specific exceptions.
 * These represent business rule violations in the domain layer.
 */

/**
 * Base class for all domain errors
 */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    // Maintains proper stack trace for where our error was thrown (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Thrown when attempting to create a booking that overlaps with an existing booking
 */
export class OverlappingBookingError extends DomainError {
  constructor(
    public readonly roomId: string,
    public readonly conflictingBookingId: string,
    message?: string
  ) {
    super(message || `Cannot create booking: Room ${roomId} is already booked (conflicts with booking ${conflictingBookingId})`);
  }
}

/**
 * Thrown when attempting to create an invalid date range
 */
export class InvalidDateRangeError extends DomainError {
  constructor(message?: string) {
    super(message || 'Invalid date range: start date must be before end date');
  }
}

/**
 * Thrown when access is denied (invalid code, wrong time, wrong room, etc)
 */
export class AccessDeniedError extends DomainError {
  constructor(
    public readonly roomId: string,
    public readonly reason: string
  ) {
    super(`Access denied to room ${roomId}: ${reason}`);
  }
}

/**
 * Thrown when a booking is not found
 */
export class BookingNotFoundError extends DomainError {
  constructor(public readonly bookingId: string) {
    super(`Booking not found: ${bookingId}`);
  }
}

/**
 * Thrown when attempting an invalid state transition
 */
export class InvalidStateTransitionError extends DomainError {
  constructor(
    public readonly currentState: string,
    public readonly attemptedState: string
  ) {
    super(`Invalid state transition: cannot transition from ${currentState} to ${attemptedState}`);
  }
}
