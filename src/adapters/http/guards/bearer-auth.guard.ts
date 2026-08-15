import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { GetMeUseCase } from '../../../application/use-cases/get-me.use-case';
import { SessionContext } from '../../../application/ports/auth-engine.port';
import { extractBearerToken } from '../decorators/access-token.decorator';

export const SESSION_CONTEXT_KEY = 'sessionContext';

@Injectable()
export class BearerAuthGuard implements CanActivate {
  constructor(private readonly getMe: GetMeUseCase) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<
      Request & { [SESSION_CONTEXT_KEY]?: SessionContext }
    >();

    const token = extractBearerToken(request);
    if (!token) {
      throw new UnauthorizedException('Authentication required');
    }

    const sessionContext = await this.getMe.execute(token);
    request[SESSION_CONTEXT_KEY] = sessionContext;
    return true;
  }
}
