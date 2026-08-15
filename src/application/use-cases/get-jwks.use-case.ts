import { Inject, Injectable } from '@nestjs/common';
import {
  AUTH_ENGINE_PORT,
  AuthEnginePort,
  JwksDocument,
} from '../ports/auth-engine.port';

@Injectable()
export class GetJwksUseCase {
  constructor(
    @Inject(AUTH_ENGINE_PORT)
    private readonly authEngine: AuthEnginePort,
  ) {}

  execute(): Promise<JwksDocument> {
    return this.authEngine.getJwks();
  }
}
