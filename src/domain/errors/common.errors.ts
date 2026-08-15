import { DomainError } from './domain.error';

export class NotFoundError extends DomainError {
  readonly code = 'NOT_FOUND';
  readonly httpStatus = 404;

  constructor(message = 'Resource not found') {
    super(message);
  }
}

export class ConflictError extends DomainError {
  readonly code = 'CONFLICT';
  readonly httpStatus = 409;

  constructor(message: string) {
    super(message);
  }
}

export class ForbiddenError extends DomainError {
  readonly code = 'FORBIDDEN';
  readonly httpStatus = 403;

  constructor(message = 'Forbidden') {
    super(message);
  }
}
