import { Password } from './password.vo';
import { InvalidInputError } from '../errors/auth.errors';

describe('Password', () => {
  it('accepts a password of at least 8 characters', () => {
    const password = Password.create('Str0ngPass!');
    expect(password.reveal()).toBe('Str0ngPass!');
  });

  it('rejects short passwords', () => {
    expect(() => Password.create('short')).toThrow(InvalidInputError);
  });
});
