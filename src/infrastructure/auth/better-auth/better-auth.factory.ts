import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { bearer, jwt } from 'better-auth/plugins';
import { PrismaClient } from '@prisma/client';
import { OAuthProviderType } from '../../../domain/enums/application.enums';

export interface BetterAuthEnv {
  baseURL: string;
  secret: string;
  jwtIssuer: string;
  jwtAudience: string;
  jwtExpiration: string;
}

export interface SocialProviderCredentials {
  provider: OAuthProviderType;
  clientId: string;
  clientSecret: string;
  scopes?: string[];
  redirectUri?: string | null;
}

export function createBetterAuth(
  prisma: PrismaClient,
  env: BetterAuthEnv,
  socialProviders: SocialProviderCredentials[] = [],
) {
  const social = buildSocialProviders(socialProviders);

  return betterAuth({
    baseURL: env.baseURL,
    secret: env.secret,
    database: prismaAdapter(prisma, {
      provider: 'postgresql',
    }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ['google', 'github'],
        // Email/password signup does not verify email in Phase 1, so Google
        // must still be allowed to link to the same address.
        requireLocalEmailVerified: false,
      },
    },
    socialProviders: social,
    trustedOrigins: [
      env.baseURL,
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:5173',
    ],
    plugins: [
      bearer(),
      jwt({
        jwt: {
          issuer: env.jwtIssuer,
          audience: env.jwtAudience,
          expirationTime: env.jwtExpiration,
          definePayload: ({ user }) => ({
            sub: user.id,
            email: user.email,
            name: user.name,
            emailVerified: user.emailVerified,
          }),
        },
        jwks: {
          jwksPath: '/.well-known/jwks.json',
        },
      }),
    ],
  });
}

function buildSocialProviders(
  providers: SocialProviderCredentials[],
): Record<string, { clientId: string; clientSecret: string; scope?: string[]; redirectURI?: string }> {
  const social: Record<
    string,
    { clientId: string; clientSecret: string; scope?: string[]; redirectURI?: string }
  > = {};

  for (const provider of providers) {
    social[provider.provider] = {
      clientId: provider.clientId,
      clientSecret: provider.clientSecret,
      ...(provider.scopes?.length ? { scope: provider.scopes } : {}),
      ...(provider.redirectUri ? { redirectURI: provider.redirectUri } : {}),
    };
  }

  return social;
}

export type BetterAuthInstance = ReturnType<typeof createBetterAuth>;
