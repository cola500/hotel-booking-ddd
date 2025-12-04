import { BookingService } from '../../domain/booking/services/BookingService';
import { AccessService } from '../../domain/access/services/AccessService';
import { HousekeepingService } from '../../domain/housekeeping/services/HousekeepingService';
import { InMemoryBookingRepository } from '../../infrastructure/InMemoryBookingRepository';
import { InMemoryAccessTokenRepository } from '../../infrastructure/InMemoryAccessTokenRepository';
import { InMemoryCleaningTaskRepository } from '../../infrastructure/InMemoryCleaningTaskRepository';
import { EventBus } from '../events/EventBus';
import { BookingConfirmed } from '../../domain/booking/events/BookingConfirmed';
import { BookingCheckedOut } from '../../domain/booking/events/BookingCheckedOut';

/**
 * ApplicationServiceFactory
 *
 * Singleton factory that initializes and provides access to:
 * - Domain services (BookingService, AccessService, HousekeepingService)
 * - Repositories (in-memory implementations)
 * - EventBus with wired event handlers
 *
 * CRITICAL: This singleton pattern ensures that:
 * 1. State is preserved between API requests (in-memory repositories)
 * 2. Event handlers are only registered once
 * 3. All contexts share the same EventBus instance
 *
 * This is essential for the MVP demo with in-memory storage.
 * In production with a real database, this pattern would be replaced with proper DI.
 */

// Module-level singleton instances
let bookingRepository: InMemoryBookingRepository;
let accessTokenRepository: InMemoryAccessTokenRepository;
let cleaningTaskRepository: InMemoryCleaningTaskRepository;
let eventBus: EventBus;
let bookingService: BookingService;
let accessService: AccessService;
let housekeepingService: HousekeepingService;

export class ApplicationServiceFactory {
  /**
   * Initialize all services and wire up event handlers
   * This is called automatically on first access
   */
  static initialize(): void {
    // Initialize repositories
    bookingRepository = new InMemoryBookingRepository();
    accessTokenRepository = new InMemoryAccessTokenRepository();
    cleaningTaskRepository = new InMemoryCleaningTaskRepository();

    // Initialize event bus
    eventBus = new EventBus();

    // Initialize domain services
    bookingService = new BookingService(bookingRepository);
    accessService = new AccessService(accessTokenRepository);
    housekeepingService = new HousekeepingService(cleaningTaskRepository);

    // Wire up event handlers (cross-context communication)
    // This is where the magic happens - contexts communicate via events!

    // BookingConfirmed → Generate AccessToken
    eventBus.subscribe('BookingConfirmed', async (event) => {
      const bookingConfirmed = event as BookingConfirmed;
      await accessService.generateTokenFromBooking(bookingConfirmed);
    });

    // BookingCheckedOut → Schedule CleaningTask
    eventBus.subscribe('BookingCheckedOut', async (event) => {
      const bookingCheckedOut = event as BookingCheckedOut;
      await housekeepingService.scheduleCleaningFromCheckout(bookingCheckedOut);
    });
  }

  // Getters with lazy initialization

  static getBookingService(): BookingService {
    if (!bookingService) this.initialize();
    return bookingService;
  }

  static getAccessService(): AccessService {
    if (!accessService) this.initialize();
    return accessService;
  }

  static getHousekeepingService(): HousekeepingService {
    if (!housekeepingService) this.initialize();
    return housekeepingService;
  }

  static getEventBus(): EventBus {
    if (!eventBus) this.initialize();
    return eventBus;
  }

  static getBookingRepository(): InMemoryBookingRepository {
    if (!bookingRepository) this.initialize();
    return bookingRepository;
  }

  static getAccessTokenRepository(): InMemoryAccessTokenRepository {
    if (!accessTokenRepository) this.initialize();
    return accessTokenRepository;
  }

  static getCleaningTaskRepository(): InMemoryCleaningTaskRepository {
    if (!cleaningTaskRepository) this.initialize();
    return cleaningTaskRepository;
  }

  /**
   * Reset all state (for testing purposes)
   */
  static reset(): void {
    bookingRepository = undefined as any;
    accessTokenRepository = undefined as any;
    cleaningTaskRepository = undefined as any;
    eventBus = undefined as any;
    bookingService = undefined as any;
    accessService = undefined as any;
    housekeepingService = undefined as any;
  }
}
