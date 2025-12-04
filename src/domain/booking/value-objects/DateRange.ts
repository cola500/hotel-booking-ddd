/**
 * DateRange Value Object
 *
 * Represents an immutable date range with start and end dates.
 * Ensures invariant: start must be before end.
 */
export class DateRange {
  private readonly _start: Date;
  private readonly _end: Date;

  constructor(start: Date, end: Date) {
    if (start >= end) {
      throw new Error('Start date must be before end date');
    }

    // Store copies to ensure immutability
    this._start = new Date(start);
    this._end = new Date(end);

    // Freeze to prevent modifications
    Object.freeze(this);
  }

  /**
   * Returns a copy of the start date to prevent external mutation
   */
  get start(): Date {
    return new Date(this._start);
  }

  /**
   * Returns a copy of the end date to prevent external mutation
   */
  get end(): Date {
    return new Date(this._end);
  }

  /**
   * Checks if this date range overlaps with another date range.
   * Ranges are considered overlapping if they share any time period.
   * Adjacent ranges (one ends exactly when the other starts) do NOT overlap.
   *
   * @param other - The other DateRange to check against
   * @returns true if ranges overlap, false otherwise
   */
  overlaps(other: DateRange): boolean {
    // No overlap if one range ends before or when the other starts
    // Range 1: [-----)
    // Range 2:       [-----)  <- No overlap (adjacent)
    // Range 2:        [-----)  <- No overlap (after)

    // Overlap exists if:
    // - this starts before other ends, AND
    // - this ends after other starts
    return this._start < other._end && this._end > other._start;
  }

  /**
   * Checks if a given timestamp falls within this date range.
   * Start is inclusive, end is exclusive: [start, end)
   *
   * @param timestamp - The date to check
   * @returns true if timestamp is within range, false otherwise
   */
  contains(timestamp: Date): boolean {
    return timestamp >= this._start && timestamp < this._end;
  }

  /**
   * Checks equality with another DateRange.
   * Two DateRanges are equal if their start and end dates are the same.
   *
   * @param other - The other DateRange to compare
   * @returns true if equal, false otherwise
   */
  equals(other: DateRange): boolean {
    return this._start.getTime() === other._start.getTime()
        && this._end.getTime() === other._end.getTime();
  }

  /**
   * Returns a string representation of the date range
   */
  toString(): string {
    return `DateRange(${this._start.toISOString()} - ${this._end.toISOString()})`;
  }
}
