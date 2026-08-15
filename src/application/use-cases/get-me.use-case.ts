import { Inject, Injectable } from '@nestjs/common';
import { UnauthorizedError } from '../../domain/errors/auth.errors';
import {
  AUTH_ENGINE_PORT,
  AuthEnginePort,
  SessionContext,
} from '../ports/auth-engine.port';

@Injectable()
export class GetMeUseCase {
  constructor(
    @Inject(AUTH_ENGINE_PORT)
    private readonly authEngine: AuthEnginePort,
  ) {}

  async execute(accessToken: string | undefined): Promise<SessionContext> {
    if (!accessToken) {
      throw new UnauthorizedError();
    }

    const session = await this.authEngine.getSession(accessToken);
    if (!session) {
      throw new UnauthorizedError('Invalid or expired session');
    }

    return session;
  }
}
