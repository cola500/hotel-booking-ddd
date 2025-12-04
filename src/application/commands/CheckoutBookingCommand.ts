/**
 * CheckoutBookingCommand
 *
 * Represents the user's intent to checkout from a booking.
 */
export class CheckoutBookingCommand {
  constructor(public readonly bookingId: string) {}
}
