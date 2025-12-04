import { CleaningTask } from '../entities/CleaningTask';

/**
 * CleaningTask Repository Interface
 */
export interface ICleaningTaskRepository {
  /**
   * Save a cleaning task
   */
  save(task: CleaningTask): Promise<void>;

  /**
   * Find task by ID
   */
  findById(taskId: string): Promise<CleaningTask | null>;

  /**
   * Find task by booking ID
   */
  findByBookingId(bookingId: string): Promise<CleaningTask | null>;

  /**
   * Find all pending tasks
   */
  findPending(): Promise<CleaningTask[]>;

  /**
   * Find all tasks
   */
  findAll(): Promise<CleaningTask[]>;
}
