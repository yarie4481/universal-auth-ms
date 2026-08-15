import { InvalidInputError } from '../errors/auth.errors';

export class Password {
  private constructor(private readonly value: string) {}

  static create(raw: string): Password {
    if (raw.length < 8) {
      throw new InvalidInputError('Password must be at least 8 characters');
    }
    if (raw.length > 128) {
      throw new InvalidInputError('Password must be at most 128 characters');
    }
    return new Password(raw);
  }

  /** Never log or serialize this. */
  reveal(): string {
    return this.value;
  }
}
