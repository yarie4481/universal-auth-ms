import { User } from '../../domain/entities/user.entity';
import { Session } from '../../domain/entities/session.entity';
import { OAuthProviderType } from '../../domain/enums/application.enums';

export const AUTH_ENGINE_PORT = Symbol('AUTH_ENGINE_PORT');

export interface RegisterCommand {
  email: string;
  password: string;
  name: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface LoginCommand {
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuthTokens {
  /** Opaque session token for Bearer auth against this service. */
  accessToken: string;
  /** JWT for cross-service verification via JWKS. */
  jwt: string;
  tokenType: 'Bearer';
  expiresAt: Date;
}

export interface AuthResult {
  user: User;
  session: Session;
  tokens: AuthTokens;
}

export interface SessionContext {
  user: User;
  session: Session;
}

export interface JwksDocument {
  keys: Record<string, unknown>[];
}

export interface OAuthAuthorizationCommand {
  applicationId: string;
  provider: OAuthProviderType;
  callbackURL: string;
  errorCallbackURL?: string;
}

/**
 * Port for the authentication engine.
 * Implemented by the Better Auth infrastructure adapter.
 * Domain/application never import Better Auth directly.
 */
export interface AuthEnginePort {
  register(command: RegisterCommand): Promise<AuthResult>;
  login(command: LoginCommand): Promise<AuthResult>;
  logout(accessToken: string): Promise<void>;
  getSession(accessToken: string): Promise<SessionContext | null>;
  issueJwt(accessToken: string): Promise<string>;
  getJwks(): Promise<JwksDocument>;
  getOAuthAuthorizationUrl(
    command: OAuthAuthorizationCommand,
  ): Promise<{ url: string }>;
}
