import { NextResponse } from 'next/server';
import { ApplicationServiceFactory } from '@/src/application/services/ApplicationServiceFactory';
import { handleApiError } from '@/src/api/errors';

/**
 * GET /api/housekeeping/tasks
 * Lists all cleaning tasks
 */
export async function GET() {
  try {
    const repository = ApplicationServiceFactory.getCleaningTaskRepository();
    const tasks = await repository.findAll();

    return NextResponse.json({
      tasks: tasks.map(t => ({
        id: t.id,
        bookingId: t.bookingId,
        roomNumber: t.roomId,
        status: t.status
      }))
    });
  } catch (error) {
    return handleApiError(error);
  }
}
