import { NextRequest, NextResponse } from 'next/server';
import { ApplicationServiceFactory } from '@/src/application/services/ApplicationServiceFactory';
import { CreateBookingHandler } from '@/src/application/handlers/CreateBookingHandler';
import { CreateBookingCommand } from '@/src/application/commands/CreateBookingCommand';
import { handleApiError } from '@/src/api/errors';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST /api/bookings
 * Creates a new booking
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roomNumber, guestName, checkIn, checkOut } = body;

    // Validation
    if (!roomNumber || !guestName || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: 'Missing required fields: roomNumber, guestName, checkIn, checkOut' },
        { status: 400 }
      );
    }

    // Create command with generated ID
    const bookingId = uuidv4();
    const command = new CreateBookingCommand(
      bookingId,
      roomNumber,
      guestName,
      checkIn,
      checkOut
    );

    // Execute handler
    const handler = new CreateBookingHandler(
      ApplicationServiceFactory.getBookingService(),
      ApplicationServiceFactory.getEventBus()
    );
    const result = await handler.handle(command);

    return NextResponse.json(
      {
        bookingId: result.bookingId,
        message: 'Booking created successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * GET /api/bookings
 * Lists all bookings
 */
export async function GET() {
  try {
    const repository = ApplicationServiceFactory.getBookingRepository();
    const bookings = await repository.findAll();

    return NextResponse.json({
      bookings: bookings.map(b => ({
        id: b.id,
        roomNumber: b.roomId,
        guestName: b.guestId,
        checkIn: b.dateRange.start.toISOString(),
        checkOut: b.dateRange.end.toISOString(),
        status: b.status
      }))
    });
  } catch (error) {
    return handleApiError(error);
  }
}
