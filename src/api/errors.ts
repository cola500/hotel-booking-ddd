import { NextResponse } from 'next/server';

/**
 * API Error Handling
 *
 * Centralized error handling for API routes.
 * Converts domain errors and exceptions into appropriate HTTP responses.
 *
 * Error Strategy:
 * - Validation errors → 400 Bad Request
 * - Domain errors (OverlappingBookingError) → 422 Unprocessable Entity
 * - Not found → 404 Not Found
 * - System errors → 500 Internal Server Error
 */

export function handleApiError(error: unknown): NextResponse {
  // Handle known Error objects
  if (error instanceof Error) {
    // Domain-specific errors get special treatment
    if (error.name === 'OverlappingBookingError') {
      return NextResponse.json(
        { error: error.message },
        { status: 422 } // Unprocessable Entity
      );
    }

    // Invalid domain state transitions
    if (error.message.includes('Cannot check out') ||
        error.message.includes('Cannot cancel') ||
        error.message.includes('Cannot start') ||
        error.message.includes('Cannot complete')) {
      return NextResponse.json(
        { error: error.message },
        { status: 422 }
      );
    }

    // Generic validation/client errors
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  // Unexpected errors
  console.error('Unexpected error:', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
