import {
  AppEnvironment,
  ApplicationStatus,
  ApplicationType,
} from '../enums/application.enums';

export interface ApplicationProps {
  id: string;
  name: string;
  clientId: string;
  clientSecretHash: string;
  type: ApplicationType;
  environment: AppEnvironment;
  redirectUris: string[];
  allowedOrigins: string[];
  allowedProviders: string[];
  allowedScopes: string[];
  status: ApplicationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class Application {
  constructor(private readonly props: ApplicationProps) {}

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get clientId(): string {
    return this.props.clientId;
  }

  get clientSecretHash(): string {
    return this.props.clientSecretHash;
  }

  get type(): ApplicationType {
    return this.props.type;
  }

  get environment(): AppEnvironment {
    return this.props.environment;
  }

  get redirectUris(): string[] {
    return [...this.props.redirectUris];
  }

  get allowedOrigins(): string[] {
    return [...this.props.allowedOrigins];
  }

  get allowedProviders(): string[] {
    return [...this.props.allowedProviders];
  }

  get allowedScopes(): string[] {
    return [...this.props.allowedScopes];
  }

  get status(): ApplicationStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  isActive(): boolean {
    return this.props.status === ApplicationStatus.active;
  }

  allowsProvider(provider: string): boolean {
    if (this.props.allowedProviders.length === 0) {
      return true;
    }
    return this.props.allowedProviders.includes(provider);
  }

  allowsRedirectUri(uri: string): boolean {
    return this.props.redirectUris.includes(uri);
  }

  toProps(): ApplicationProps {
    return { ...this.props, redirectUris: this.redirectUris, allowedOrigins: this.allowedOrigins, allowedProviders: this.allowedProviders, allowedScopes: this.allowedScopes };
  }
}
