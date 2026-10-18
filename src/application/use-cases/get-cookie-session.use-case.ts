import { Inject, Injectable } from '@nestjs/common';
import { UnauthorizedError } from '../../domain/errors/auth.errors';
import {
  AUTH_ENGINE_PORT,
  AuthEnginePort,
  AuthResult,
} from '../ports/auth-engine.port';

@Injectable()
export class GetCookieSessionUseCase {
  constructor(
    @Inject(AUTH_ENGINE_PORT)
    private readonly authEngine: AuthEnginePort,
  ) {}

  async execute(
    cookieHeader: string | undefined,
    applicationId?: string,
  ): Promise<AuthResult> {
    if (!cookieHeader) {
      throw new UnauthorizedError('No session cookie');
    }

    const result = await this.authEngine.getSessionFromCookies(
      cookieHeader,
      applicationId,
    );
    if (!result) {
      throw new UnauthorizedError('Invalid or expired session');
    }

    return result;
  }
}
