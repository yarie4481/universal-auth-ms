import { DomainError } from './domain.error';

export class InvalidCredentialsError extends DomainError {
  readonly code = 'INVALID_CREDENTIALS';
  readonly httpStatus = 401;

  constructor(message = 'Invalid email or password') {
    super(message);
  }
}

export class UserAlreadyExistsError extends DomainError {
  readonly code = 'USER_ALREADY_EXISTS';
  readonly httpStatus = 409;

  constructor(message = 'A user with this email already exists') {
    super(message);
  }
}

export class UnauthorizedError extends DomainError {
  readonly code = 'UNAUTHORIZED';
  readonly httpStatus = 401;

  constructor(message = 'Authentication required') {
    super(message);
  }
}

export class SessionNotFoundError extends DomainError {
  readonly code = 'SESSION_NOT_FOUND';
  readonly httpStatus = 401;

  constructor(message = 'Session not found or expired') {
    super(message);
  }
}

export class InvalidInputError extends DomainError {
  readonly code = 'INVALID_INPUT';
  readonly httpStatus = 400;

  constructor(message: string) {
    super(message);
  }
}

export class AuthEngineError extends DomainError {
  readonly code = 'AUTH_ENGINE_ERROR';
  readonly httpStatus = 502;

  constructor(message = 'Authentication engine failed') {
    super(message);
  }
}
