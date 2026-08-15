import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { GetJwksUseCase } from '../../../application/use-cases/get-jwks.use-case';

@ApiTags('Discovery')
@Controller('.well-known')
export class WellKnownController {
  constructor(
    private readonly getJwks: GetJwksUseCase,
    private readonly config: ConfigService,
  ) {}

  @Get('jwks.json')
  @ApiOperation({
    summary: 'JSON Web Key Set for local JWT verification across languages',
  })
  @ApiOkResponse({ description: 'JWKS document' })
  async jwks() {
    return this.getJwks.execute();
  }

  @Get('openid-configuration')
  @ApiOperation({ summary: 'Minimal OpenID Connect discovery document' })
  openidConfiguration() {
    const issuer = this.config.getOrThrow<string>('auth.jwtIssuer');
    const baseUrl = this.config.getOrThrow<string>('app.baseUrl');

    return {
      issuer,
      jwks_uri: `${baseUrl}/.well-known/jwks.json`,
      token_endpoint: `${baseUrl}/api/v1/auth/refresh`,
      userinfo_endpoint: `${baseUrl}/api/v1/auth/me`,
      response_types_supported: ['token'],
      subject_types_supported: ['public'],
      id_token_signing_alg_values_supported: ['EdDSA', 'ES256', 'RS256'],
    };
  }
}
