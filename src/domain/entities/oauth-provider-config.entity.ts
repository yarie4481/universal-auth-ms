import { OAuthProviderType } from '../enums/application.enums';

export interface OAuthProviderConfigProps {
  id: string;
  applicationId: string;
  provider: OAuthProviderType;
  enabled: boolean;
  clientId: string;
  /** Ciphertext — never log or return to clients. */
  clientSecretEnc: string;
  scopes: string[];
  redirectUri: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class OAuthProviderConfig {
  constructor(private readonly props: OAuthProviderConfigProps) {}

  get id(): string {
    return this.props.id;
  }

  get applicationId(): string {
    return this.props.applicationId;
  }

  get provider(): OAuthProviderType {
    return this.props.provider;
  }

  get enabled(): boolean {
    return this.props.enabled;
  }

  get clientId(): string {
    return this.props.clientId;
  }

  get clientSecretEnc(): string {
    return this.props.clientSecretEnc;
  }

  get scopes(): string[] {
    return [...this.props.scopes];
  }

  get redirectUri(): string | null {
    return this.props.redirectUri;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  toSafeView(): Omit<OAuthProviderConfigProps, 'clientSecretEnc'> & {
    clientSecretMasked: string;
  } {
    return {
      id: this.props.id,
      applicationId: this.props.applicationId,
      provider: this.props.provider,
      enabled: this.props.enabled,
      clientId: this.props.clientId,
      clientSecretMasked: '****************',
      scopes: this.scopes,
      redirectUri: this.props.redirectUri,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
