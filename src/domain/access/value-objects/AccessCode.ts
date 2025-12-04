/**
 * AccessCode Value Object
 *
 * Represents a 6-digit access code for room access.
 * Immutable and validated to ensure it's always in correct format.
 */
export class AccessCode {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
    Object.freeze(this);
  }

  /**
   * Generates a random 6-digit access code
   */
  static generate(): AccessCode {
    // Generate random number between 0 and 999999
    const randomNumber = Math.floor(Math.random() * 1000000);

    // Pad with leading zeros to ensure 6 digits
    const codeString = randomNumber.toString().padStart(6, '0');

    return new AccessCode(codeString);
  }

  /**
   * Creates an AccessCode from a string value.
   * Validates that the string is exactly 6 digits.
   *
   * @param value - The string to create the code from
   * @throws Error if value is not exactly 6 digits
   */
  static fromString(value: string): AccessCode {
    if (!value || typeof value !== 'string') {
      throw new Error('Access code must be exactly 6 digits');
    }

    // Validate format: exactly 6 digits
    if (!/^\d{6}$/.test(value)) {
      throw new Error('Access code must be exactly 6 digits');
    }

    return new AccessCode(value);
  }

  /**
   * Returns the code value (6 digits as string)
   */
  get value(): string {
    return this._value;
  }

  /**
   * Checks equality with another AccessCode.
   * Two AccessCodes are equal if their values are the same.
   *
   * @param other - The other AccessCode to compare
   * @returns true if equal, false otherwise
   */
  equals(other: AccessCode): boolean {
    return this._value === other._value;
  }

  /**
   * Returns string representation of the code
   */
  toString(): string {
    return this._value;
  }
}
