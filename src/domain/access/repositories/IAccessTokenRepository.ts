import { AccessToken } from '../entities/AccessToken';

/**
 * AccessToken Repository Interface
 *
 * Defines the contract for access token persistence.
 */
export interface IAccessTokenRepository {
  /**
   * Save an access token
   */
  save(token: AccessToken): Promise<void>;

  /**
   * Find token by ID
   */
  findById(tokenId: string): Promise<AccessToken | null>;

  /**
   * Find token by room and code
   * Used for access validation
   */
  findByRoomAndCode(roomId: string, code: string): Promise<AccessToken | null>;

  /**
   * Find token by booking ID
   */
  findByBookingId(bookingId: string): Promise<AccessToken | null>;

  /**
   * Find all tokens (useful for queries)
   */
  findAll(): Promise<AccessToken[]>;
}
