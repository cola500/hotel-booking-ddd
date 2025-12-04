import { NextRequest, NextResponse } from 'next/server';
import { ApplicationServiceFactory } from '@/src/application/services/ApplicationServiceFactory';
import { handleApiError } from '@/src/api/errors';

/**
 * POST /api/housekeeping/tasks/[id]/start
 * Starts a cleaning task
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;

    const repository = ApplicationServiceFactory.getCleaningTaskRepository();
    const task = await repository.findById(taskId);

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Start cleaning
    task.startCleaning();
    await repository.save(task);

    return NextResponse.json({
      message: 'Städning påbörjad'
    });
  } catch (error) {
    return handleApiError(error);
  }
}
