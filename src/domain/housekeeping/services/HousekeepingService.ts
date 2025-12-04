import { CleaningTask } from '../entities/CleaningTask';
import { ICleaningTaskRepository } from '../repositories/ICleaningTaskRepository';
import { BookingCheckedOut } from '@/domain/booking/events/BookingCheckedOut';

/**
 * Housekeeping Domain Service
 *
 * Handles operations related to cleaning tasks.
 * This service bridges the Booking and Housekeeping bounded contexts.
 */
export class HousekeepingService {
  constructor(private readonly repository: ICleaningTaskRepository) {}

  /**
   * Schedule a cleaning task from a BookingCheckedOut event.
   * This is the event handler that reacts to checkouts.
   *
   * Scheduling rule:
   * - Task is scheduled 3 hours after checkout time
   *
   * @param event - The BookingCheckedOut event
   * @returns The created cleaning task
   */
  async scheduleCleaningFromCheckout(event: BookingCheckedOut): Promise<CleaningTask> {
    const taskId = this.generateTaskId();

    // Schedule cleaning 3 hours after checkout
    const scheduledAt = new Date(event.checkOutTime.getTime() + 3 * 60 * 60 * 1000);

    const task = new CleaningTask(
      taskId,
      event.roomId,
      event.aggregateId, // bookingId
      scheduledAt
    );

    await this.repository.save(task);

    return task;
  }

  /**
   * Generate a unique task ID
   */
  private generateTaskId(): string {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
