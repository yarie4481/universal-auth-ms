import {
  Controller,
  Get,
  Param,
  Query,
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
      'Start Google/GitHub OAuth for an application — redirects the browser to the provider',
  })
  async start(
    @Param('provider') providerParam: string,
    @Query() query: StartOAuthQueryDto,
    @Res() res: Response,
  ) {
    const provider = parseProvider(providerParam);
    const result = await this.startOAuth.execute({
      provider,
      clientId: query.clientId,
      callbackURL: query.callbackURL,
      errorCallbackURL: query.errorCallbackURL,
    });

    for (const cookie of result.setCookies) {
      res.append('Set-Cookie', cookie);
    }

    // Cookie lets /api/auth/callback/* resolve the correct per-app Better Auth instance
    res.cookie('oauth_app_id', result.applicationId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 10 * 60 * 1000,
      path: '/',
    });

    // Top-level redirect so the OAuth state cookie is stored on this API origin
    // before the browser goes to Google/GitHub.
    return res.redirect(result.url);
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
