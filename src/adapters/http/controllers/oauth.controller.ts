import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { OAuthProviderType } from '../../../domain/enums/application.enums';
import { InvalidInputError } from '../../../domain/errors/auth.errors';
import { StartOAuthUseCase } from '../../../application/use-cases/oauth/start-oauth.use-case';
import { StartOAuthQueryDto } from '../dto/admin.dto';

@ApiTags('OAuth')
@Controller('api/v1/oauth')
export class OAuthController {
  constructor(private readonly startOAuth: StartOAuthUseCase) {}

  @Get(':provider')
  @ApiOperation({
    summary:
      'Start Google/GitHub OAuth for an application — returns authorization URL',
  })
  async start(
    @Param('provider') providerParam: string,
    @Query() query: StartOAuthQueryDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const provider = parseProvider(providerParam);
    const result = await this.startOAuth.execute({
      provider,
      clientId: query.clientId,
      callbackURL: query.callbackURL,
      errorCallbackURL: query.errorCallbackURL,
    });

    // Cookie lets /api/auth/callback/* resolve the correct per-app Better Auth instance
    res.cookie('oauth_app_id', result.applicationId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 10 * 60 * 1000,
      path: '/',
    });

    return {
      provider,
      redirect: true,
      url: result.url,
      applicationId: result.applicationId,
    };
  }
}

function parseProvider(value: string): OAuthProviderType {
  if (value === OAuthProviderType.google || value === OAuthProviderType.github) {
    return value;
  }
  throw new InvalidInputError(
    `Unsupported provider "${value}". Use google or github.`,
  );
}
