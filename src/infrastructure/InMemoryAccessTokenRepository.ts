import { IAccessTokenRepository } from '@/domain/access/repositories/IAccessTokenRepository';
import { AccessToken } from '@/domain/access/entities/AccessToken';
import { AccessCode } from '@/domain/access/value-objects/AccessCode';
import { saveToFile, loadFromFile } from './persistence';

/**
 * In-Memory AccessToken Repository with file persistence
 *
 * Simple in-memory implementation with JSON file backup for MVP.
 */
export class InMemoryAccessTokenRepository implements IAccessTokenRepository {
  private tokens: Map<string, AccessToken> = new Map();

  constructor() {
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    try {
      const data = loadFromFile<any[]>('access-tokens', []);
      for (const item of data) {
        const code = AccessCode.fromString(item.code);
        const token = new AccessToken(
          item.id,
          item.roomId,
          item.bookingId,
          code,
          new Date(item.validFrom),
          new Date(item.validTo)
        );
        this.tokens.set(token.id, token);
      }
    } catch (error) {
      console.error('Failed to load access tokens from disk:', error);
    }
  }

  private saveToDisk(): void {
    const data = Array.from(this.tokens.values()).map(t => ({
      id: t.id,
      roomId: t.roomId,
      bookingId: t.bookingId,
      code: t.code.value,
      validFrom: t.validFrom.toISOString(),
      validTo: t.validTo.toISOString()
    }));
    saveToFile('access-tokens', data);
  }

  async save(token: AccessToken): Promise<void> {
    this.tokens.set(token.id, token);
    this.saveToDisk();
  }

  async findById(tokenId: string): Promise<AccessToken | null> {
    return this.tokens.get(tokenId) || null;
  }

  async findByRoomAndCode(roomId: string, code: string): Promise<AccessToken | null> {
    for (const token of this.tokens.values()) {
      if (token.roomId === roomId && token.code.value === code) {
        return token;
      }
    }
    return null;
  }

  async findByBookingId(bookingId: string): Promise<AccessToken | null> {
    for (const token of this.tokens.values()) {
      if (token.bookingId === bookingId) {
        return token;
      }
    }
    return null;
  }

  async findAll(): Promise<AccessToken[]> {
    return Array.from(this.tokens.values());
  }

  /**
   * Test helper: Clear all tokens
   */
  clear(): void {
    this.tokens.clear();
  }
}
