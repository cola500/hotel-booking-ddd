import { NextResponse } from 'next/server';
import { ApplicationServiceFactory } from '@/src/application/services/ApplicationServiceFactory';

/**
 * GET /api/events
 * Returns recent domain events for UI visualization
 */
export async function GET() {
  const eventBus = ApplicationServiceFactory.getEventBus();
  const events = eventBus.getRecentEvents(50);

  return NextResponse.json({
    events: events.map(e => ({
      eventId: e.eventId,
      eventType: e.eventType,
      occurredAt: e.occurredAt.toISOString(),
      aggregateId: e.aggregateId
    }))
  });
}
