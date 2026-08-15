import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class AdminApiKeyGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const expected = this.config.get<string>('admin.apiKey');
    if (!expected) {
      throw new UnauthorizedException(
        'ADMIN_API_KEY is not configured on the server',
      );
    }

    const request = context.switchToHttp().getRequest<Request>();
    const provided =
      request.header('x-admin-api-key') ??
      request.header('authorization')?.replace(/^Bearer\s+/i, '');

    if (!provided || provided !== expected) {
      throw new UnauthorizedException('Invalid admin API key');
    }

    return true;
  }
}
