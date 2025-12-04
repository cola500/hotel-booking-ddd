import { NextResponse } from 'next/server';
import { ApplicationServiceFactory } from '@/src/application/services/ApplicationServiceFactory';
import { handleApiError } from '@/src/api/errors';

/**
 * GET /api/access/tokens
 * Lists all access tokens
 */
export async function GET() {
  try {
    const repository = ApplicationServiceFactory.getAccessTokenRepository();
    const tokens = await repository.findAll();

    return NextResponse.json({
      tokens: tokens.map(t => ({
        id: t.id,
        bookingId: t.bookingId,
        roomNumber: t.roomId,
        code: t.code.value,
        validFrom: t.validFrom.toISOString(),
        validUntil: t.validTo.toISOString()
      }))
    });
  } catch (error) {
    return handleApiError(error);
  }
}
