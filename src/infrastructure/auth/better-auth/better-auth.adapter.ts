import { Injectable, Logger } from '@nestjs/common';
import { APIError } from 'better-auth/api';
import { User } from '../../../domain/entities/user.entity';
import { Session } from '../../../domain/entities/session.entity';
import {
  AuthEngineError,
  InvalidCredentialsError,
  SessionNotFoundError,
  UserAlreadyExistsError,
} from '../../../domain/errors/auth.errors';
import { NotFoundError } from '../../../domain/errors/common.errors';
import {
  AuthEnginePort,
  AuthResult,
  AuthTokens,
  JwksDocument,
  LoginCommand,
  OAuthAuthorizationCommand,
  RegisterCommand,
  SessionContext,
} from '../../../application/ports/auth-engine.port';
import { BetterAuthInstanceManager } from './better-auth-instance.manager';
import { BetterAuthInstance } from './better-auth.factory';

@Injectable()
export class BetterAuthAdapter implements AuthEnginePort {
  private readonly logger = new Logger(BetterAuthAdapter.name);

  constructor(private readonly instances: BetterAuthInstanceManager) {}

  getAuthInstance(): BetterAuthInstance {
    return this.instances.getDefault();
  }

  getInstanceManager(): BetterAuthInstanceManager {
    return this.instances;
  }

  private get auth(): BetterAuthInstance {
    return this.instances.getDefault();
  }

  async register(command: RegisterCommand): Promise<AuthResult> {
    try {
      const { headers, response } = await this.auth.api.signUpEmail({
        body: {
          email: command.email,
          password: command.password,
          name: command.name,
        },
        headers: this.buildRequestHeaders(command.ipAddress, command.userAgent),
        returnHeaders: true,
      });

      return this.toAuthResult(response, headers);
    } catch (error) {
      throw this.mapError(error, 'register');
    }
  }

  async login(command: LoginCommand): Promise<AuthResult> {
    try {
      const { headers, response } = await this.auth.api.signInEmail({
        body: {
          email: command.email,
          password: command.password,
        },
        headers: this.buildRequestHeaders(command.ipAddress, command.userAgent),
        returnHeaders: true,
      });

      return this.toAuthResult(response, headers);
    } catch (error) {
      throw this.mapError(error, 'login');
    }
  }

  async logout(accessToken: string): Promise<void> {
    try {
      await this.auth.api.signOut({
        headers: this.bearerHeaders(accessToken),
      });
    } catch (error) {
      throw this.mapError(error, 'logout');
    }
  }

  async getSession(accessToken: string): Promise<SessionContext | null> {
    try {
      const result = await this.auth.api.getSession({
        headers: this.bearerHeaders(accessToken),
      });

      if (!result?.user || !result.session) {
        return null;
      }

      return {
        user: this.mapUser(result.user),
        session: this.mapSession(result.session),
      };
    } catch (error) {
      this.logger.debug(`getSession failed: ${this.safeErrorMessage(error)}`);
      return null;
    }
  }

  async issueJwt(accessToken: string): Promise<string> {
    try {
      const result = await this.auth.api.getToken({
        headers: this.bearerHeaders(accessToken),
      });

      if (!result?.token) {
        throw new AuthEngineError('Failed to issue JWT');
      }

      return result.token;
    } catch (error) {
      throw this.mapError(error, 'issueJwt');
    }
  }

  async getJwks(): Promise<JwksDocument> {
    try {
      const result = await this.auth.api.getJwks();
      return { keys: (result?.keys ?? []) as Record<string, unknown>[] };
    } catch (error) {
      throw this.mapError(error, 'getJwks');
    }
  }

  async getOAuthAuthorizationUrl(
    command: OAuthAuthorizationCommand,
  ): Promise<{ url: string }> {
    try {
      const auth = await this.instances.getForApplication(command.applicationId);
      const result = await auth.api.signInSocial({
        body: {
          provider: command.provider,
          callbackURL: command.callbackURL,
          errorCallbackURL: command.errorCallbackURL,
        },
      });

      if (!result?.url) {
        throw new AuthEngineError('OAuth provider did not return an authorization URL');
      }

      return { url: result.url };
    } catch (error) {
      if (error instanceof APIError) {
        const message = error.message || 'OAuth provider not available';
        if (/not found|provider/i.test(message)) {
          throw new NotFoundError(message);
        }
      }
      throw this.mapError(error, 'getOAuthAuthorizationUrl');
    }
  }

  private async toAuthResult(
    response: {
      user: {
        id: string;
        email: string;
        name: string;
        emailVerified: boolean;
        image?: string | null;
        createdAt: Date | string;
        updatedAt: Date | string;
      };
      token?: string | null;
    },
    headers: Headers,
  ): Promise<AuthResult> {
    const accessToken =
      headers.get('set-auth-token') ?? response.token ?? undefined;

    if (!accessToken) {
      throw new AuthEngineError(
        'Authentication engine did not return a session token',
      );
    }

    const sessionContext = await this.getSession(accessToken);
    if (!sessionContext) {
      throw new SessionNotFoundError(
        'Session was not created after authentication',
      );
    }

    const jwt = await this.issueJwt(accessToken);
    const tokens: AuthTokens = {
      accessToken,
      jwt,
      tokenType: 'Bearer',
      expiresAt: sessionContext.session.expiresAt,
    };

    return {
      user: this.mapUser(response.user),
      session: sessionContext.session,
      tokens,
    };
  }

  private mapUser(raw: {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
    image?: string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
  }): User {
    return new User({
      id: raw.id,
      email: raw.email,
      name: raw.name,
      emailVerified: raw.emailVerified,
      image: raw.image ?? null,
      createdAt: new Date(raw.createdAt),
      updatedAt: new Date(raw.updatedAt),
    });
  }

  private mapSession(raw: {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date | string;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
  }): Session {
    return new Session({
      id: raw.id,
      userId: raw.userId,
      token: raw.token,
      expiresAt: new Date(raw.expiresAt),
      ipAddress: raw.ipAddress ?? null,
      userAgent: raw.userAgent ?? null,
      createdAt: new Date(raw.createdAt),
      updatedAt: new Date(raw.updatedAt),
    });
  }

  private bearerHeaders(accessToken: string): Headers {
    return new Headers({
      Authorization: `Bearer ${accessToken}`,
    });
  }

  private buildRequestHeaders(ipAddress?: string, userAgent?: string): Headers {
    const headers = new Headers();
    if (ipAddress) {
      headers.set('x-forwarded-for', ipAddress);
    }
    if (userAgent) {
      headers.set('user-agent', userAgent);
    }
    return headers;
  }

  private mapError(error: unknown, operation: string): Error {
    if (
      error instanceof InvalidCredentialsError ||
      error instanceof UserAlreadyExistsError ||
      error instanceof SessionNotFoundError ||
      error instanceof AuthEngineError ||
      error instanceof NotFoundError
    ) {
      return error;
    }

    if (error instanceof APIError) {
      const status = error.statusCode ?? error.status;
      const message = error.message || 'Authentication failed';

      if (status === 401 || status === 'UNAUTHORIZED') {
        return new InvalidCredentialsError();
      }
      if (status === 422 || status === 409 || /already|exists/i.test(message)) {
        return new UserAlreadyExistsError();
      }

      this.logger.warn(`Better Auth ${operation} APIError: ${message}`);
      return new AuthEngineError(message);
    }

    this.logger.error(
      `Better Auth ${operation} failed: ${this.safeErrorMessage(error)}`,
    );
    return new AuthEngineError();
  }

  private safeErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return 'Unknown error';
  }
}
