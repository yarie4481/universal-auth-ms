import { Module } from '@nestjs/common';
import { BetterAuthModule } from '../infrastructure/auth/better-auth/better-auth.module';
import { RegisterUseCase } from './use-cases/register.use-case';
import { LoginUseCase } from './use-cases/login.use-case';
import { LogoutUseCase } from './use-cases/logout.use-case';
import { GetMeUseCase } from './use-cases/get-me.use-case';
import { RefreshTokenUseCase } from './use-cases/refresh-token.use-case';
import { GetJwksUseCase } from './use-cases/get-jwks.use-case';
import {
  CreateApplicationUseCase,
  DeleteApplicationUseCase,
  GetApplicationUseCase,
  ListApplicationsUseCase,
  RotateApplicationSecretUseCase,
  UpdateApplicationUseCase,
} from './use-cases/applications/application.use-cases';
import {
  DeleteOAuthProviderUseCase,
  GetOAuthProviderUseCase,
  ListOAuthProvidersUseCase,
  UpdateOAuthProviderUseCase,
  UpsertOAuthProviderUseCase,
} from './use-cases/providers/provider.use-cases';
import { StartOAuthUseCase } from './use-cases/oauth/start-oauth.use-case';

const useCases = [
  RegisterUseCase,
  LoginUseCase,
  LogoutUseCase,
  GetMeUseCase,
  RefreshTokenUseCase,
  GetJwksUseCase,
  CreateApplicationUseCase,
  ListApplicationsUseCase,
  GetApplicationUseCase,
  UpdateApplicationUseCase,
  DeleteApplicationUseCase,
  RotateApplicationSecretUseCase,
  UpsertOAuthProviderUseCase,
  ListOAuthProvidersUseCase,
  GetOAuthProviderUseCase,
  UpdateOAuthProviderUseCase,
  DeleteOAuthProviderUseCase,
  StartOAuthUseCase,
];

@Module({
  imports: [BetterAuthModule],
  providers: [...useCases],
  exports: [...useCases],
})
export class ApplicationModule {}
