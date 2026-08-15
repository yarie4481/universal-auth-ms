import { Inject, Injectable } from '@nestjs/common';
import { UnauthorizedError } from '../../domain/errors/auth.errors';
import { AUTH_ENGINE_PORT, AuthEnginePort } from '../ports/auth-engine.port';

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(AUTH_ENGINE_PORT)
    private readonly authEngine: AuthEnginePort,
  ) {}

  async execute(accessToken: string | undefined): Promise<void> {
    if (!accessToken) {
      throw new UnauthorizedError();
    }
    await this.authEngine.logout(accessToken);
  }
}
