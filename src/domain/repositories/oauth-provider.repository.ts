import { OAuthProviderConfig } from '../entities/oauth-provider-config.entity';
import { OAuthProviderType } from '../enums/application.enums';

export const OAUTH_PROVIDER_REPOSITORY_PORT = Symbol(
  'OAUTH_PROVIDER_REPOSITORY_PORT',
);

export interface UpsertOAuthProviderRecord {
  applicationId: string;
  provider: OAuthProviderType;
  enabled: boolean;
  clientId: string;
  clientSecretEnc: string;
  scopes: string[];
  redirectUri: string | null;
}

export interface OAuthProviderRepositoryPort {
  upsert(data: UpsertOAuthProviderRecord): Promise<OAuthProviderConfig>;
  update(
    id: string,
    data: Partial<
      Omit<UpsertOAuthProviderRecord, 'applicationId' | 'provider'>
    >,
  ): Promise<OAuthProviderConfig>;
  findById(id: string): Promise<OAuthProviderConfig | null>;
  findByApplicationAndProvider(
    applicationId: string,
    provider: OAuthProviderType,
  ): Promise<OAuthProviderConfig | null>;
  listByApplication(applicationId: string): Promise<OAuthProviderConfig[]>;
  listEnabledByApplication(
    applicationId: string,
  ): Promise<OAuthProviderConfig[]>;
  delete(id: string): Promise<void>;
}
