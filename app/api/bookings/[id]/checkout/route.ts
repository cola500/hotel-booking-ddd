import { NextRequest, NextResponse } from 'next/server';
import { ApplicationServiceFactory } from '@/src/application/services/ApplicationServiceFactory';
import { handleApiError } from '@/src/api/errors';

/**
 * POST /api/bookings/[id]/checkout
 * Checks out a booking
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params;

    // Get booking from repository
    const repository = ApplicationServiceFactory.getBookingRepository();
    const booking = await repository.findById(bookingId);

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Checkout booking
    booking.checkOut(new Date());
    await repository.save(booking);

    // Publish events
    const eventBus = ApplicationServiceFactory.getEventBus();
    const events = booking.getUncommittedEvents();
    for (const event of events) {
      await eventBus.publish(event);
    }
    booking.markEventsAsCommitted();

    return NextResponse.json({
      message: 'Booking checked out successfully'
    });
  } catch (error) {
    return handleApiError(error);
  }
}
