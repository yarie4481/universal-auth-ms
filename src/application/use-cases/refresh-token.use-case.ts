import { Inject, Injectable } from '@nestjs/common';
import { UnauthorizedError } from '../../domain/errors/auth.errors';
import { AUTH_ENGINE_PORT, AuthEnginePort } from '../ports/auth-engine.port';

export interface RefreshResult {
  jwt: string;
  tokenType: 'Bearer';
}

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(AUTH_ENGINE_PORT)
    private readonly authEngine: AuthEnginePort,
  ) {}

  async execute(accessToken: string | undefined): Promise<RefreshResult> {
    if (!accessToken) {
      throw new UnauthorizedError();
    }

    const session = await this.authEngine.getSession(accessToken);
    if (!session) {
      throw new UnauthorizedError('Invalid or expired session');
    }

    const jwt = await this.authEngine.issueJwt(accessToken);
    return { jwt, tokenType: 'Bearer' };
  }
}
