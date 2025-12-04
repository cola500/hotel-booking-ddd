/**
 * CreateBookingCommand
 *
 * Represents the user's intent to create a new booking.
 * This is an immutable DTO (Data Transfer Object) that captures all necessary data.
 */
export class CreateBookingCommand {
  constructor(
    public readonly bookingId: string,
    public readonly roomNumber: string,
    public readonly guestName: string,
    public readonly checkIn: string,  // ISO date string
    public readonly checkOut: string  // ISO date string
  ) {}
}
