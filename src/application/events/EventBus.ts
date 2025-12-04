import { DomainEvent } from '../../domain/shared/DomainEvent';

export type EventHandler = (event: DomainEvent) => Promise<void>;

/**
 * EventBus
 *
 * Manages domain event subscriptions and publishing.
 * Enables cross-context communication without direct dependencies.
 *
 * Features:
 * - Subscribe handlers to specific event types
 * - Publish events to all registered handlers
 * - Store event history for debugging and UI display
 */
export class EventBus {
  private handlers: Map<string, EventHandler[]> = new Map();
  private publishedEvents: DomainEvent[] = [];

  /**
   * Subscribe a handler to a specific event type
   */
  subscribe(eventType: string, handler: EventHandler): void {
    console.log(`[EventBus] Subscribing handler for event: ${eventType}`);
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  /**
   * Publish an event to all registered handlers
   */
  async publish(event: DomainEvent): Promise<void> {
    console.log(`[EventBus] Publishing event: ${event.eventType} for aggregate ${event.aggregateId.substring(0, 12)}...`);

    // Store for history/debugging
    this.publishedEvents.push(event);

    // Execute all handlers for this event type
    const handlers = this.handlers.get(event.eventType) || [];
    console.log(`[EventBus] Found ${handlers.length} handler(s) for ${event.eventType}`);

    for (const handler of handlers) {
      await handler(event);
    }
  }

  /**
   * Get recent events (for UI display/debugging)
   */
  getRecentEvents(limit: number = 50): DomainEvent[] {
    return this.publishedEvents.slice(-limit);
  }

  /**
   * Clear event history (for testing)
   */
  clearHistory(): void {
    this.publishedEvents = [];
  }
}
