import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuthProviderConfig } from '../../../domain/entities/oauth-provider-config.entity';
import { OAuthProviderType } from '../../../domain/enums/application.enums';
import { InvalidInputError } from '../../../domain/errors/auth.errors';
import { NotFoundError } from '../../../domain/errors/common.errors';
import {
  APPLICATION_REPOSITORY_PORT,
  ApplicationRepositoryPort,
} from '../../../domain/repositories/application.repository';
import {
  OAUTH_PROVIDER_REPOSITORY_PORT,
  OAuthProviderRepositoryPort,
} from '../../../domain/repositories/oauth-provider.repository';
import {
  SECRET_ENCRYPTION_PORT,
  SecretEncryptionPort,
} from '../../ports/secret-encryption.port';
import { AUTH_CONFIG_RELOAD_PORT, AuthConfigReloadPort } from '../../ports/auth-config-reload.port';

export interface UpsertProviderInput {
  applicationId: string;
  provider: OAuthProviderType;
  enabled: boolean;
  clientId: string;
  clientSecret: string;
  scopes?: string[];
  redirectUri?: string | null;
}

@Injectable()
export class UpsertOAuthProviderUseCase {
  constructor(
    @Inject(APPLICATION_REPOSITORY_PORT)
    private readonly applications: ApplicationRepositoryPort,
    @Inject(OAUTH_PROVIDER_REPOSITORY_PORT)
    private readonly providers: OAuthProviderRepositoryPort,
    @Inject(SECRET_ENCRYPTION_PORT)
    private readonly encryption: SecretEncryptionPort,
    @Inject(AUTH_CONFIG_RELOAD_PORT)
    private readonly authConfigReload: AuthConfigReloadPort,
    private readonly config: ConfigService,
  ) {}

  async execute(input: UpsertProviderInput): Promise<OAuthProviderConfig> {
    const app = await this.applications.findById(input.applicationId);
    if (!app) {
      throw new NotFoundError('Application not found');
    }

    if (!input.clientId?.trim()) {
      throw new InvalidInputError('OAuth client ID is required');
    }
    if (!input.clientSecret?.trim()) {
      throw new InvalidInputError('OAuth client secret is required');
    }

    const baseUrl = this.config.getOrThrow<string>('app.baseUrl');
    const defaultRedirect = `${baseUrl}/api/auth/callback/${input.provider}`;
    const clientSecretEnc = await this.encryption.encrypt(input.clientSecret);

    const saved = await this.providers.upsert({
      applicationId: input.applicationId,
      provider: input.provider,
      enabled: input.enabled,
      clientId: input.clientId.trim(),
      clientSecretEnc,
      scopes: input.scopes ?? defaultScopes(input.provider),
      redirectUri: input.redirectUri ?? defaultRedirect,
    });

    await this.authConfigReload.invalidateApplication(input.applicationId);
    return saved;
  }
}

@Injectable()
export class ListOAuthProvidersUseCase {
  constructor(
    @Inject(APPLICATION_REPOSITORY_PORT)
    private readonly applications: ApplicationRepositoryPort,
    @Inject(OAUTH_PROVIDER_REPOSITORY_PORT)
    private readonly providers: OAuthProviderRepositoryPort,
  ) {}

  async execute(applicationId: string): Promise<OAuthProviderConfig[]> {
    const app = await this.applications.findById(applicationId);
    if (!app) {
      throw new NotFoundError('Application not found');
    }
    return this.providers.listByApplication(applicationId);
  }
}

@Injectable()
export class GetOAuthProviderUseCase {
  constructor(
    @Inject(OAUTH_PROVIDER_REPOSITORY_PORT)
    private readonly providers: OAuthProviderRepositoryPort,
  ) {}

  async execute(id: string): Promise<OAuthProviderConfig> {
    const provider = await this.providers.findById(id);
    if (!provider) {
      throw new NotFoundError('Provider configuration not found');
    }
    return provider;
  }
}

export interface PatchProviderInput {
  enabled?: boolean;
  clientId?: string;
  clientSecret?: string;
  scopes?: string[];
  redirectUri?: string | null;
}

@Injectable()
export class UpdateOAuthProviderUseCase {
  constructor(
    @Inject(OAUTH_PROVIDER_REPOSITORY_PORT)
    private readonly providers: OAuthProviderRepositoryPort,
    @Inject(SECRET_ENCRYPTION_PORT)
    private readonly encryption: SecretEncryptionPort,
    @Inject(AUTH_CONFIG_RELOAD_PORT)
    private readonly authConfigReload: AuthConfigReloadPort,
  ) {}

  async execute(id: string, input: PatchProviderInput): Promise<OAuthProviderConfig> {
    const existing = await this.providers.findById(id);
    if (!existing) {
      throw new NotFoundError('Provider configuration not found');
    }

    const clientSecretEnc = input.clientSecret
      ? await this.encryption.encrypt(input.clientSecret)
      : undefined;

    const updated = await this.providers.update(id, {
      enabled: input.enabled,
      clientId: input.clientId?.trim(),
      clientSecretEnc,
      scopes: input.scopes,
      redirectUri: input.redirectUri,
    });

    await this.authConfigReload.invalidateApplication(existing.applicationId);
    return updated;
  }
}

@Injectable()
export class DeleteOAuthProviderUseCase {
  constructor(
    @Inject(OAUTH_PROVIDER_REPOSITORY_PORT)
    private readonly providers: OAuthProviderRepositoryPort,
    @Inject(AUTH_CONFIG_RELOAD_PORT)
    private readonly authConfigReload: AuthConfigReloadPort,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.providers.findById(id);
    if (!existing) {
      throw new NotFoundError('Provider configuration not found');
    }
    await this.providers.delete(id);
    await this.authConfigReload.invalidateApplication(existing.applicationId);
  }
}

function defaultScopes(provider: OAuthProviderType): string[] {
  if (provider === OAuthProviderType.google) {
    return ['openid', 'email', 'profile'];
  }
  return ['read:user', 'user:email'];
}
