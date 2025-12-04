import { ICleaningTaskRepository } from '@/domain/housekeeping/repositories/ICleaningTaskRepository';
import { CleaningTask, CleaningTaskStatus } from '@/domain/housekeeping/entities/CleaningTask';
import { saveToFile, loadFromFile } from './persistence';

/**
 * In-Memory CleaningTask Repository with file persistence
 *
 * Simple in-memory implementation with JSON file backup for MVP.
 */
export class InMemoryCleaningTaskRepository implements ICleaningTaskRepository {
  private tasks: Map<string, CleaningTask> = new Map();

  constructor() {
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    try {
      const data = loadFromFile<any[]>('cleaning-tasks', []);
      for (const item of data) {
        const task = new CleaningTask(
          item.id,
          item.roomId,
          item.bookingId,
          new Date(item.scheduledAt)
        );

        // Restore status
        if (item.status === 'InProgress') {
          task.startCleaning();
        } else if (item.status === 'Completed') {
          if (task.status === CleaningTaskStatus.Pending) {
            task.startCleaning();
          }
          task.complete();
        }

        this.tasks.set(task.id, task);
      }
    } catch (error) {
      console.error('Failed to load cleaning tasks from disk:', error);
    }
  }

  private saveToDisk(): void {
    const data = Array.from(this.tasks.values()).map(t => ({
      id: t.id,
      roomId: t.roomId,
      bookingId: t.bookingId,
      scheduledAt: t.scheduledAt.toISOString(),
      status: t.status
    }));
    saveToFile('cleaning-tasks', data);
  }

  async save(task: CleaningTask): Promise<void> {
    this.tasks.set(task.id, task);
    this.saveToDisk();
  }

  async findById(taskId: string): Promise<CleaningTask | null> {
    return this.tasks.get(taskId) || null;
  }

  async findByBookingId(bookingId: string): Promise<CleaningTask | null> {
    for (const task of this.tasks.values()) {
      if (task.bookingId === bookingId) {
        return task;
      }
    }
    return null;
  }

  async findPending(): Promise<CleaningTask[]> {
    const result: CleaningTask[] = [];
    for (const task of this.tasks.values()) {
      if (task.status === CleaningTaskStatus.Pending) {
        result.push(task);
      }
    }
    return result;
  }

  async findAll(): Promise<CleaningTask[]> {
    return Array.from(this.tasks.values());
  }

  /**
   * Test helper: Clear all tasks
   */
  clear(): void {
    this.tasks.clear();
  }
}
