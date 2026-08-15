export type ApplicationType =
  | "WEB"
  | "SPA"
  | "MOBILE"
  | "BACKEND"
  | "MACHINE_TO_MACHINE";

export type AppEnvironment = "development" | "staging" | "production";
export type ApplicationStatus = "active" | "disabled";
export type OAuthProviderType = "google" | "github";

export interface Application {
  id: string;
  name: string;
  clientId: string;
  type: ApplicationType;
  environment: AppEnvironment;
  redirectUris: string[];
  allowedOrigins: string[];
  allowedProviders: string[];
  allowedScopes: string[];
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateApplicationPayload {
  name: string;
  type: ApplicationType;
  environment: AppEnvironment;
  redirectUris?: string[];
  allowedOrigins?: string[];
  allowedProviders?: string[];
  allowedScopes?: string[];
}

export interface CreateApplicationResponse {
  application: Application;
  clientSecret: string;
  warning: string;
}

export interface OAuthProvider {
  id: string;
  applicationId: string;
  provider: OAuthProviderType;
  enabled: boolean;
  clientId: string;
  clientSecret: string;
  scopes: string[];
  redirectUri: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertProviderPayload {
  provider: OAuthProviderType;
  enabled: boolean;
  clientId: string;
  clientSecret: string;
  scopes?: string[];
  redirectUri?: string;
}
