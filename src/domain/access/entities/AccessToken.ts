import { AccessCode } from '../value-objects/AccessCode';

/**
 * AccessToken Aggregate Root
 *
 * Represents a time-limited access token for a specific room.
 * Linked to a booking and only valid during the booking's date range (+ buffer).
 *
 * Invariants:
 * - validFrom must be before validTo
 * - Access code must be valid 6-digit code
 * - Token is only valid for specific room
 */
export class AccessToken {
  constructor(
    public readonly id: string,
    public readonly roomId: string,
    public readonly bookingId: string,
    public readonly code: AccessCode,
    public readonly validFrom: Date,
    public readonly validTo: Date
  ) {
    // Validate invariants
    if (validFrom >= validTo) {
      throw new Error('validFrom must be before validTo');
    }
  }

  /**
   * Check if this token is valid for access.
   * Validates: time window, room match, and code match.
   *
   * @param now - Current timestamp
   * @param roomId - Room trying to access
   * @param code - Access code provided
   * @returns true if access should be granted, false otherwise
   */
  isValid(now: Date, roomId: string, code: string): boolean {
    // Check time window (inclusive start, exclusive end)
    if (now < this.validFrom || now >= this.validTo) {
      return false;
    }

    // Check room matches
    if (roomId !== this.roomId) {
      return false;
    }

    // Check code matches
    if (code !== this.code.value) {
      return false;
    }

    return true;
  }

  /**
   * Check if token is currently within valid time window
   */
  isWithinTimeWindow(now: Date): boolean {
    return now >= this.validFrom && now < this.validTo;
  }
}
