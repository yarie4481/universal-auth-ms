import { createHash, randomBytes } from 'crypto';
import { Inject, Injectable } from '@nestjs/common';
import { Application } from '../../../domain/entities/application.entity';
import {
  AppEnvironment,
  ApplicationStatus,
  ApplicationType,
} from '../../../domain/enums/application.enums';
import { ConflictError, NotFoundError } from '../../../domain/errors/common.errors';
import { InvalidInputError } from '../../../domain/errors/auth.errors';
import {
  APPLICATION_REPOSITORY_PORT,
  ApplicationRepositoryPort,
} from '../../../domain/repositories/application.repository';

export interface CreateApplicationInput {
  name: string;
  type: ApplicationType;
  environment: AppEnvironment;
  redirectUris?: string[];
  allowedOrigins?: string[];
  allowedProviders?: string[];
  allowedScopes?: string[];
}

export interface CreateApplicationResult {
  application: Application;
  /** Shown once — store securely; only the hash is persisted. */
   /** Shown once — store securely; only the hash is persisted. */
  clientSecret: string;
}

@Injectable()
export class CreateApplicationUseCase {
  constructor(
    @Inject(APPLICATION_REPOSITORY_PORT)
    private readonly applications: ApplicationRepositoryPort,
  ) {}

  async execute(input: CreateApplicationInput): Promise<CreateApplicationResult> {
    const name = input.name?.trim();
    if (!name) {
      throw new InvalidInputError('Application name is required');
    }

    const clientId = `app_${randomBytes(16).toString('hex')}`;
    const clientSecret = `secret_${randomBytes(24).toString('base64url')}`;
    const clientSecretHash = hashSecret(clientSecret);

    try {
      const application = await this.applications.create({
        name,
        clientId,
        clientSecretHash,
        type: input.type,
        environment: input.environment,
        redirectUris: input.redirectUris ?? [],
        allowedOrigins: input.allowedOrigins ?? [],
        allowedProviders: input.allowedProviders ?? [],
        allowedScopes: input.allowedScopes ?? [],
        status: ApplicationStatus.active,
      });

      return { application, clientSecret };
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictError(
          `Application "${name}" already exists in ${input.environment}`,
        );
      }
      throw error;
    }
  }
}

@Injectable()
export class ListApplicationsUseCase {
  constructor(
    @Inject(APPLICATION_REPOSITORY_PORT)
    private readonly applications: ApplicationRepositoryPort,
  ) {}

  execute(filters?: {
    environment?: AppEnvironment;
    status?: ApplicationStatus;
  }): Promise<Application[]> {
    return this.applications.list(filters);
  }
}

@Injectable()
export class GetApplicationUseCase {
  constructor(
    @Inject(APPLICATION_REPOSITORY_PORT)
    private readonly applications: ApplicationRepositoryPort,
  ) {}

  async execute(id: string): Promise<Application> {
    const app = await this.applications.findById(id);
    if (!app) {
      throw new NotFoundError('Application not found');
    }
    return app;
  }
}

export interface UpdateApplicationInput {
  name?: string;
  type?: ApplicationType;
  redirectUris?: string[];
  allowedOrigins?: string[];
  allowedProviders?: string[];
  allowedScopes?: string[];
  status?: ApplicationStatus;
}

@Injectable()
export class UpdateApplicationUseCase {
  constructor(
    @Inject(APPLICATION_REPOSITORY_PORT)
    private readonly applications: ApplicationRepositoryPort,
  ) {}

  async execute(id: string, input: UpdateApplicationInput): Promise<Application> {
    await this.ensureExists(id);
    try {
      return await this.applications.update(id, input);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictError('Application name already exists in this environment');
      }
      throw error;
    }
  }

  private async ensureExists(id: string): Promise<void> {
    const app = await this.applications.findById(id);
    if (!app) {
      throw new NotFoundError('Application not found');
    }
  }
}

@Injectable()
export class DeleteApplicationUseCase {
  constructor(
    @Inject(APPLICATION_REPOSITORY_PORT)
    private readonly applications: ApplicationRepositoryPort,
  ) {}

  async execute(id: string): Promise<void> {
    const app = await this.applications.findById(id);
    if (!app) {
      throw new NotFoundError('Application not found');
    }
    await this.applications.delete(id);
  }
}

@Injectable()
export class RotateApplicationSecretUseCase {
  constructor(
    @Inject(APPLICATION_REPOSITORY_PORT)
    private readonly applications: ApplicationRepositoryPort,
  ) {}

  async execute(id: string): Promise<{ clientSecret: string }> {
    const app = await this.applications.findById(id);
    if (!app) {
      throw new NotFoundError('Application not found');
    }

    const clientSecret = `secret_${randomBytes(24).toString('base64url')}`;
    await this.applications.update(id, {
      clientSecretHash: hashSecret(clientSecret),
    });

    return { clientSecret };
  }
}

export function hashSecret(secret: string): string {
  return createHash('sha256').update(secret).digest('hex');
}

export function verifySecret(secret: string, hash: string): boolean {
  return hashSecret(secret) === hash;
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === 'P2002'
  );
}
