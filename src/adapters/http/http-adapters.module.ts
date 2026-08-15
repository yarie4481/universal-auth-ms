import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { ApplicationModule } from '../../application/application.module';
import { AuthController } from './controllers/auth.controller';
import { WellKnownController } from './controllers/well-known.controller';
import { HealthController } from './controllers/health.controller';
import { OAuthController } from './controllers/oauth.controller';
import { AdminApplicationsController } from './controllers/admin/applications.controller';
import { AdminProvidersController } from './controllers/admin/providers.controller';
import { BearerAuthGuard } from './guards/bearer-auth.guard';
import { AdminApiKeyGuard } from './guards/admin-api-key.guard';

@Module({
  imports: [ApplicationModule, TerminusModule],
  controllers: [
    AuthController,
    WellKnownController,
    HealthController,
    OAuthController,
    AdminApplicationsController,
    AdminProvidersController,
  ],
  providers: [BearerAuthGuard, AdminApiKeyGuard],
})
export class HttpAdaptersModule {}
