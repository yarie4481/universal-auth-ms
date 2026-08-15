import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { RegisterUseCase } from '../../../application/use-cases/register.use-case';
import { LoginUseCase } from '../../../application/use-cases/login.use-case';
import { LogoutUseCase } from '../../../application/use-cases/logout.use-case';
import { GetMeUseCase } from '../../../application/use-cases/get-me.use-case';
import { RefreshTokenUseCase } from '../../../application/use-cases/refresh-token.use-case';
import { LoginRequestDto, RegisterRequestDto } from '../dto/auth-request.dto';
import { AccessToken } from '../decorators/access-token.decorator';
import { BearerAuthGuard, SESSION_CONTEXT_KEY } from '../guards/bearer-auth.guard';
import { toAuthResponse, toMeResponse } from '../serializers/auth.serializer';
import { SessionContext } from '../../../application/ports/auth-engine.port';

@ApiTags('Authentication')
@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly getMeUseCase: GetMeUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user with email and password' })
  @ApiOkResponse({ description: 'User registered and session issued' })
  async register(@Body() body: RegisterRequestDto, @Req() req: Request) {
    const result = await this.registerUseCase.execute({
      email: body.email,
      password: body.password,
      name: body.name,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return toAuthResponse(result);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() body: LoginRequestDto, @Req() req: Request) {
    const result = await this.loginUseCase.execute({
      email: body.email,
      password: body.password,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return toAuthResponse(result);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout current session' })
  async logout(@AccessToken() accessToken?: string): Promise<void> {
    await this.logoutUseCase.execute(accessToken);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Issue a fresh JWT from a valid session access token',
  })
  async refresh(@AccessToken() accessToken?: string) {
    return this.refreshTokenUseCase.execute(accessToken);
  }

  @Get('me')
  @UseGuards(BearerAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the current authenticated user' })
  async me(@Req() req: Request & { [SESSION_CONTEXT_KEY]?: SessionContext }) {
    const context = req[SESSION_CONTEXT_KEY];
    if (!context) {
      const fallback = await this.getMeUseCase.execute(
        req.headers.authorization?.replace(/^Bearer\s+/i, ''),
      );
      return toMeResponse(fallback);
    }
    return toMeResponse(context);
  }
}
