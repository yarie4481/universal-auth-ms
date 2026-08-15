import { Module } from '@nestjs/common';
import { AUTH_ENGINE_PORT } from '../../../application/ports/auth-engine.port';
import { AUTH_CONFIG_RELOAD_PORT } from '../../../application/ports/auth-config-reload.port';
import { APPLICATION_REPOSITORY_PORT } from '../../../domain/repositories/application.repository';
import { OAUTH_PROVIDER_REPOSITORY_PORT } from '../../../domain/repositories/oauth-provider.repository';
import { PrismaApplicationRepository } from '../../database/repositories/prisma-application.repository';
import { PrismaOAuthProviderRepository } from '../../database/repositories/prisma-oauth-provider.repository';
import { BetterAuthAdapter } from './better-auth.adapter';
import { BetterAuthInstanceManager } from './better-auth-instance.manager';

@Module({
  providers: [
    PrismaApplicationRepository,
    PrismaOAuthProviderRepository,
    {
      provide: APPLICATION_REPOSITORY_PORT,
      useExisting: PrismaApplicationRepository,
    },
    {
      provide: OAUTH_PROVIDER_REPOSITORY_PORT,
      useExisting: PrismaOAuthProviderRepository,
    },
    BetterAuthInstanceManager,
    {
      provide: AUTH_CONFIG_RELOAD_PORT,
      useExisting: BetterAuthInstanceManager,
    },
    BetterAuthAdapter,
    {
      provide: AUTH_ENGINE_PORT,
      useExisting: BetterAuthAdapter,
    },
  ],
  exports: [
    AUTH_ENGINE_PORT,
    AUTH_CONFIG_RELOAD_PORT,
    APPLICATION_REPOSITORY_PORT,
    OAUTH_PROVIDER_REPOSITORY_PORT,
    BetterAuthAdapter,
    BetterAuthInstanceManager,
  ],
})
export class BetterAuthModule {}
