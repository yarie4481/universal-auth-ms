import { AuthResult, SessionContext } from '../../../application/ports/auth-engine.port';
import {
  AuthResponseDto,
  MeResponseDto,
  PublicUserDto,
} from '../../../application/dto/auth.dto';
import { User } from '../../../domain/entities/user.entity';

export function toPublicUser(user: User): PublicUserDto {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    emailVerified: user.emailVerified,
    image: user.image,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export function toAuthResponse(result: AuthResult): AuthResponseDto {
  return {
    user: toPublicUser(result.user),
    tokens: {
      accessToken: result.tokens.accessToken,
      jwt: result.tokens.jwt,
      tokenType: result.tokens.tokenType,
      expiresAt: result.tokens.expiresAt.toISOString(),
    },
  };
}

export function toMeResponse(context: SessionContext): MeResponseDto {
  return {
    user: toPublicUser(context.user),
    session: {
      id: context.session.id,
      expiresAt: context.session.expiresAt.toISOString(),
    },
  };
}
