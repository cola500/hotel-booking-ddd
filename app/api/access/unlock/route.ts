import { NextRequest, NextResponse } from 'next/server';
import { ApplicationServiceFactory } from '@/src/application/services/ApplicationServiceFactory';
import { handleApiError } from '@/src/api/errors';

/**
 * POST /api/access/unlock
 * Attempts to unlock a door with given credentials
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roomNumber, code } = body;

    if (!roomNumber || !code) {
      return NextResponse.json(
        { error: 'Missing required fields: roomNumber, code' },
        { status: 400 }
      );
    }

    // Try to unlock
    const service = ApplicationServiceFactory.getAccessService();
    const result = await service.tryUnlock(roomNumber, code, new Date());

    return NextResponse.json({
      success: result.granted,
      message: result.granted
        ? 'Dörren är upplåst! Välkommen in.'
        : result.reason || 'Åtkomst nekad'
    });
  } catch (error) {
    return handleApiError(error);
  }
}
