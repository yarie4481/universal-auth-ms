import { Email } from './email.vo';
import { InvalidInputError } from '../errors/auth.errors';

describe('Email', () => {
  it('normalizes and accepts a valid email', () => {
    const email = Email.create('  Ada@Example.COM ');
    expect(email.toString()).toBe('ada@example.com');
  });

  it('rejects invalid emails', () => {
    expect(() => Email.create('not-an-email')).toThrow(InvalidInputError);
  });
});
