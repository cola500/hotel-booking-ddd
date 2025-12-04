/**
 * CleaningTask Status Enum
 */
export enum CleaningTaskStatus {
  Pending = 'Pending',
  InProgress = 'InProgress',
  Completed = 'Completed',
}

/**
 * CleaningTask Entity
 *
 * Represents a cleaning task for a room after checkout.
 * Simple entity - not an aggregate root in this MVP.
 */
export class CleaningTask {
  private _status: CleaningTaskStatus;

  constructor(
    public readonly id: string,
    public readonly roomId: string,
    public readonly bookingId: string,
    public readonly scheduledAt: Date
  ) {
    this._status = CleaningTaskStatus.Pending;
  }

  /**
   * Current status of the task
   */
  get status(): CleaningTaskStatus {
    return this._status;
  }

  /**
   * Mark task as in progress
   */
  startCleaning(): void {
    if (this._status !== CleaningTaskStatus.Pending) {
      throw new Error('Cannot start: task is not pending');
    }
    this._status = CleaningTaskStatus.InProgress;
  }

  /**
   * Mark task as completed
   */
  complete(): void {
    if (this._status === CleaningTaskStatus.Completed) {
      throw new Error('Task is already completed');
    }
    this._status = CleaningTaskStatus.Completed;
  }
}
