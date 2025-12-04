import { HousekeepingService } from '@/domain/housekeeping/services/HousekeepingService';
import { CleaningTask, CleaningTaskStatus } from '@/domain/housekeeping/entities/CleaningTask';
import { ICleaningTaskRepository } from '@/domain/housekeeping/repositories/ICleaningTaskRepository';
import { BookingCheckedOut } from '@/domain/booking/events/BookingCheckedOut';

// Mock repository for testing
class MockCleaningTaskRepository implements ICleaningTaskRepository {
  private tasks: CleaningTask[] = [];

  async save(task: CleaningTask): Promise<void> {
    this.tasks.push(task);
  }

  async findById(taskId: string): Promise<CleaningTask | null> {
    return this.tasks.find(t => t.id === taskId) || null;
  }

  async findByBookingId(bookingId: string): Promise<CleaningTask | null> {
    return this.tasks.find(t => t.bookingId === bookingId) || null;
  }

  async findPending(): Promise<CleaningTask[]> {
    return this.tasks.filter(t => t.status === CleaningTaskStatus.Pending);
  }

  async findAll(): Promise<CleaningTask[]> {
    return [...this.tasks];
  }

  reset() {
    this.tasks = [];
  }
}

describe('Housekeeping Context', () => {
  let repository: MockCleaningTaskRepository;
  let service: HousekeepingService;

  beforeEach(() => {
    repository = new MockCleaningTaskRepository();
    service = new HousekeepingService(repository);
  });

  describe('TEST 5: Create Cleaning Task on Checkout', () => {
    it('should create cleaning task when booking is checked out', async () => {
      const bookingId = 'booking-123';
      const roomId = 'room-101';
      const guestId = 'guest-456';
      const checkOutTime = new Date('2025-12-22T10:30:00');

      const event = new BookingCheckedOut(bookingId, roomId, guestId, checkOutTime);

      const task = await service.scheduleCleaningFromCheckout(event);

      expect(task).toBeDefined();
      expect(task.roomId).toBe(roomId);
      expect(task.bookingId).toBe(bookingId);
      expect(task.status).toBe(CleaningTaskStatus.Pending);
    });

    it('should schedule task for 3 hours after checkout', async () => {
      const checkOutTime = new Date('2025-12-22T10:30:00');
      const event = new BookingCheckedOut('booking-123', 'room-101', 'guest-456', checkOutTime);

      const task = await service.scheduleCleaningFromCheckout(event);

      // Task should be scheduled 3 hours after checkout
      const expectedScheduledAt = new Date(checkOutTime.getTime() + 3 * 60 * 60 * 1000);
      expect(task.scheduledAt).toEqual(expectedScheduledAt);
    });

    it('should save the task to repository', async () => {
      const event = new BookingCheckedOut(
        'booking-123',
        'room-101',
        'guest-456',
        new Date('2025-12-22T10:30:00')
      );

      const task = await service.scheduleCleaningFromCheckout(event);

      const saved = await repository.findById(task.id);
      expect(saved).toBeDefined();
      expect(saved?.id).toBe(task.id);
    });

    it('should be findable by booking ID', async () => {
      const bookingId = 'booking-123';
      const event = new BookingCheckedOut(
        bookingId,
        'room-101',
        'guest-456',
        new Date('2025-12-22T10:30:00')
      );

      await service.scheduleCleaningFromCheckout(event);

      const found = await repository.findByBookingId(bookingId);
      expect(found).toBeDefined();
      expect(found?.bookingId).toBe(bookingId);
    });
  });

  describe('CleaningTask Entity', () => {
    it('should start with Pending status', () => {
      const task = new CleaningTask(
        'task-123',
        'room-101',
        'booking-123',
        new Date()
      );

      expect(task.status).toBe(CleaningTaskStatus.Pending);
    });

    it('should transition to InProgress when started', () => {
      const task = new CleaningTask(
        'task-123',
        'room-101',
        'booking-123',
        new Date()
      );

      task.startCleaning();

      expect(task.status).toBe(CleaningTaskStatus.InProgress);
    });

    it('should transition to Completed when completed', () => {
      const task = new CleaningTask(
        'task-123',
        'room-101',
        'booking-123',
        new Date()
      );

      task.startCleaning();
      task.complete();

      expect(task.status).toBe(CleaningTaskStatus.Completed);
    });

    it('should not allow starting non-pending task', () => {
      const task = new CleaningTask(
        'task-123',
        'room-101',
        'booking-123',
        new Date()
      );

      task.startCleaning();

      expect(() => task.startCleaning()).toThrow('Cannot start: task is not pending');
    });

    it('should allow completing from Pending or InProgress', () => {
      const task1 = new CleaningTask('task-1', 'room-101', 'booking-1', new Date());
      const task2 = new CleaningTask('task-2', 'room-102', 'booking-2', new Date());

      // Complete from Pending
      task1.complete();
      expect(task1.status).toBe(CleaningTaskStatus.Completed);

      // Complete from InProgress
      task2.startCleaning();
      task2.complete();
      expect(task2.status).toBe(CleaningTaskStatus.Completed);
    });
  });

  describe('Repository Queries', () => {
    it('should find all pending tasks', async () => {
      const task1 = new CleaningTask('task-1', 'room-101', 'booking-1', new Date());
      const task2 = new CleaningTask('task-2', 'room-102', 'booking-2', new Date());
      const task3 = new CleaningTask('task-3', 'room-103', 'booking-3', new Date());

      await repository.save(task1);
      await repository.save(task2);
      await repository.save(task3);

      // Complete one task
      task2.complete();

      const pending = await repository.findPending();

      expect(pending).toHaveLength(2);
      expect(pending.find(t => t.id === 'task-1')).toBeDefined();
      expect(pending.find(t => t.id === 'task-3')).toBeDefined();
    });
  });
});
