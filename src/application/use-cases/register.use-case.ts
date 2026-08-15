import { Inject, Injectable } from '@nestjs/common';
import { Email } from '../../domain/value-objects/email.vo';
import { Password } from '../../domain/value-objects/password.vo';
import { InvalidInputError } from '../../domain/errors/auth.errors';
import {
  AUTH_ENGINE_PORT,
  AuthEnginePort,
  AuthResult,
  RegisterCommand,
} from '../ports/auth-engine.port';

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(AUTH_ENGINE_PORT)
    private readonly authEngine: AuthEnginePort,
  ) {}

  async execute(input: RegisterInput): Promise<AuthResult> {
    const email = Email.create(input.email);
    const password = Password.create(input.password);
    const name = input.name?.trim();

    if (!name || name.length < 1) {
      throw new InvalidInputError('Name is required');
    }

    const command: RegisterCommand = {
      email: email.toString(),
      password: password.reveal(),
      name,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    };

    return this.authEngine.register(command);
  }
}
