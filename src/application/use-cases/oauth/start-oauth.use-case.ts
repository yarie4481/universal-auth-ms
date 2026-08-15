import { Inject, Injectable } from '@nestjs/common';
import { OAuthProviderType } from '../../../domain/enums/application.enums';
import { InvalidInputError } from '../../../domain/errors/auth.errors';
import {
  ForbiddenError,
  NotFoundError,
} from '../../../domain/errors/common.errors';
import {
  APPLICATION_REPOSITORY_PORT,
  ApplicationRepositoryPort,
} from '../../../domain/repositories/application.repository';
import {
  OAUTH_PROVIDER_REPOSITORY_PORT,
  OAuthProviderRepositoryPort,
} from '../../../domain/repositories/oauth-provider.repository';
import {
  AUTH_ENGINE_PORT,
  AuthEnginePort,
} from '../../ports/auth-engine.port';

export interface StartOAuthInput {
  provider: OAuthProviderType;
  clientId: string;
  callbackURL: string;
  errorCallbackURL?: string;
}

@Injectable()
export class StartOAuthUseCase {
  constructor(
    @Inject(APPLICATION_REPOSITORY_PORT)
    private readonly applications: ApplicationRepositoryPort,
    @Inject(OAUTH_PROVIDER_REPOSITORY_PORT)
    private readonly providers: OAuthProviderRepositoryPort,
    @Inject(AUTH_ENGINE_PORT)
    private readonly authEngine: AuthEnginePort,
  ) {}

  async execute(input: StartOAuthInput): Promise<{
    url: string;
    applicationId: string;
    redirect: true;
  }> {
    const app = await this.applications.findByClientId(input.clientId);
    if (!app || !app.isActive()) {
      throw new NotFoundError('Application not found or disabled');
    }

    if (!app.allowsProvider(input.provider)) {
      throw new ForbiddenError(
        `Provider "${input.provider}" is not allowed for this application`,
      );
    }

    if (!app.allowsRedirectUri(input.callbackURL)) {
      throw new InvalidInputError(
        'callbackURL is not in the application redirect URI allow-list',
      );
    }

    const providerConfig = await this.providers.findByApplicationAndProvider(
      app.id,
      input.provider,
    );

    if (!providerConfig?.enabled) {
      throw new NotFoundError(
        `Provider "${input.provider}" is not configured or enabled`,
      );
    }

    const result = await this.authEngine.getOAuthAuthorizationUrl({
      applicationId: app.id,
      provider: input.provider,
      callbackURL: input.callbackURL,
      errorCallbackURL: input.errorCallbackURL,
    });

    return {
      url: result.url,
      applicationId: app.id,
      redirect: true,
    };
  }
}
