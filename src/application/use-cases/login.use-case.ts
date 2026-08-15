import { Inject, Injectable } from '@nestjs/common';
import { Email } from '../../domain/value-objects/email.vo';
import { Password } from '../../domain/value-objects/password.vo';
import {
  AUTH_ENGINE_PORT,
  AuthEnginePort,
  AuthResult,
  LoginCommand,
} from '../ports/auth-engine.port';

export interface LoginInput {
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(AUTH_ENGINE_PORT)
    private readonly authEngine: AuthEnginePort,
  ) {}

  async execute(input: LoginInput): Promise<AuthResult> {
    const email = Email.create(input.email);
    const password = Password.create(input.password);

    const command: LoginCommand = {
      email: email.toString(),
      password: password.reveal(),
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    };

    return this.authEngine.login(command);
  }
}
