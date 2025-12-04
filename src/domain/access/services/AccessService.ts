import { AccessToken } from '../entities/AccessToken';
import { AccessCode } from '../value-objects/AccessCode';
import { IAccessTokenRepository } from '../repositories/IAccessTokenRepository';
import { BookingConfirmed } from '@/domain/booking/events/BookingConfirmed';

/**
 * Access result for door unlock attempts
 */
export interface AccessResult {
  granted: boolean;
  reason?: string;
}

/**
 * Access Domain Service
 *
 * Handles operations related to access tokens and door access validation.
 * This service bridges the Booking and Access bounded contexts.
 */
export class AccessService {
  constructor(private readonly repository: IAccessTokenRepository) {}

  /**
   * Generate an access token from a BookingConfirmed event.
   * This is the event handler that reacts to bookings being confirmed.
   *
   * Token validity:
   * - validFrom: 1 hour before booking start (early check-in grace period)
   * - validTo: 1 hour after booking end (late check-out grace period)
   *
   * @param event - The BookingConfirmed event
   * @returns The generated access token
   */
  async generateTokenFromBooking(event: BookingConfirmed): Promise<AccessToken> {
    const tokenId = this.generateTokenId();
    const code = AccessCode.generate();

    // Calculate valid time window (booking range + 1 hour buffer on each side)
    const validFrom = new Date(event.dateRange.start.getTime() - 60 * 60 * 1000); // -1 hour
    const validTo = new Date(event.dateRange.end.getTime() + 60 * 60 * 1000);     // +1 hour

    const token = new AccessToken(
      tokenId,
      event.roomId,
      event.aggregateId, // bookingId
      code,
      validFrom,
      validTo
    );

    await this.repository.save(token);

    return token;
  }

  /**
   * Try to unlock a door with given credentials.
   * Validates: room + code + time window.
   *
   * @param roomId - The room to unlock
   * @param code - The access code (6-digit string)
   * @param now - Current timestamp
   * @returns AccessResult indicating if access was granted and why/why not
   */
  async tryUnlock(roomId: string, code: string, now: Date): Promise<AccessResult> {
    // Find token by room and code
    const token = await this.repository.findByRoomAndCode(roomId, code);

    if (!token) {
      return {
        granted: false,
        reason: 'No valid access token found for this room and code combination'
      };
    }

    // Validate using token's isValid method
    if (!token.isValid(now, roomId, code)) {
      // Token exists but validation failed - must be time window issue
      if (!token.isWithinTimeWindow(now)) {
        return {
          granted: false,
          reason: 'Access code is outside valid time window'
        };
      }

      // Should not reach here, but for safety
      return {
        granted: false,
        reason: 'Invalid access code or room mismatch'
      };
    }

    return {
      granted: true
    };
  }

  /**
   * Generate a unique token ID
   */
  private generateTokenId(): string {
    return `token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
