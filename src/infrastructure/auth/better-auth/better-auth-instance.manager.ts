import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthConfigReloadPort } from '../../../application/ports/auth-config-reload.port';
import {
  SECRET_ENCRYPTION_PORT,
  SecretEncryptionPort,
} from '../../../application/ports/secret-encryption.port';
import {
  OAUTH_PROVIDER_REPOSITORY_PORT,
  OAuthProviderRepositoryPort,
} from '../../../domain/repositories/oauth-provider.repository';
import { PrismaService } from '../../database/prisma/prisma.service';
import {
  BetterAuthEnv,
  BetterAuthInstance,
  SocialProviderCredentials,
  createBetterAuth,
} from './better-auth.factory';

@Injectable()
export class BetterAuthInstanceManager implements AuthConfigReloadPort {
  private readonly logger = new Logger(BetterAuthInstanceManager.name);
  private readonly env: BetterAuthEnv;
  private readonly defaultAuth: BetterAuthInstance;
  private readonly byApplication = new Map<string, BetterAuthInstance>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    @Inject(OAUTH_PROVIDER_REPOSITORY_PORT)
    private readonly providers: OAuthProviderRepositoryPort,
    @Inject(SECRET_ENCRYPTION_PORT)
    private readonly encryption: SecretEncryptionPort,
  ) {
    this.env = {
      baseURL: this.config.getOrThrow<string>('app.baseUrl'),
      secret: this.config.getOrThrow<string>('auth.secret'),
      jwtIssuer: this.config.getOrThrow<string>('auth.jwtIssuer'),
      jwtAudience: this.config.getOrThrow<string>('auth.jwtAudience'),
      jwtExpiration: this.config.getOrThrow<string>('auth.jwtExpiration'),
    };
    this.defaultAuth = createBetterAuth(this.prisma, this.env);
  }

  getDefault(): BetterAuthInstance {
    return this.defaultAuth;
  }

  async getForApplication(applicationId: string): Promise<BetterAuthInstance> {
    const cached = this.byApplication.get(applicationId);
    if (cached) {
      return cached;
    }

    const enabled = await this.providers.listEnabledByApplication(applicationId);
    const social: SocialProviderCredentials[] = [];

    for (const row of enabled) {
      const clientSecret = await this.encryption.decrypt(row.clientSecretEnc);
      social.push({
        provider: row.provider,
        clientId: row.clientId,
        clientSecret,
        scopes: row.scopes,
        redirectUri: row.redirectUri,
      });
    }

    const instance = createBetterAuth(this.prisma, this.env, social);
    this.byApplication.set(applicationId, instance);
    this.logger.log(
      `Loaded Better Auth instance for application ${applicationId} with providers: ${social
        .map((p) => p.provider)
        .join(', ') || 'none'}`,
    );
    return instance;
  }

  async invalidateApplication(applicationId: string): Promise<void> {
    this.byApplication.delete(applicationId);
    this.logger.log(`Invalidated Better Auth cache for application ${applicationId}`);
  }

  async invalidateAll(): Promise<void> {
    this.byApplication.clear();
    this.logger.log('Invalidated all Better Auth application caches');
  }

  /**
   * Resolve instance for OAuth callback middleware using oauth_app_id cookie.
   */
  async resolveFromCookie(
    applicationId: string | undefined,
  ): Promise<BetterAuthInstance> {
    if (!applicationId) {
      return this.defaultAuth;
    }
    return this.getForApplication(applicationId);
  }
}
