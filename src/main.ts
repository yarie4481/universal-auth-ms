import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { toNodeHandler } from 'better-auth/node';
import type { NextFunction, Request, Response } from 'express';
import { json, urlencoded } from 'express';
import cookieParser = require('cookie-parser');
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './adapters/http/filters/global-exception.filter';
import { BetterAuthInstanceManager } from './infrastructure/auth/better-auth/better-auth-instance.manager';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });
  const config = app.get(ConfigService);
  const expressApp = app.getHttpAdapter().getInstance();

  expressApp.use(cookieParser());

  const instanceManager = app.get(BetterAuthInstanceManager);
  expressApp.all('/api/auth/*path', async (req: Request, res: Response) => {
    const applicationId =
      (req.cookies?.oauth_app_id as string | undefined) ??
      (typeof req.query.applicationId === 'string'
        ? req.query.applicationId
        : undefined);
    const auth = await instanceManager.resolveFromCookie(applicationId);
    return toNodeHandler(auth)(req, res);
  });

  expressApp.use((req: Request, res: Response, next: NextFunction) => {
    if (req.url.startsWith('/api/auth')) {
      next();
      return;
    }
    json()(req, res, (err?: unknown) => {
      if (err) {
        next(err as Error);
        return;
      }
      urlencoded({ extended: true })(req, res, next);
    });
  });

  app.enableCors({
    origin: true,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-api-key'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Universal Authentication Microservice')
    .setDescription(
      'Technology-independent authentication platform powered by Better Auth. Clients use this stable REST API — they do not need Better Auth SDKs.',
    )
    .setVersion('0.2.0')
    .addBearerAuth()
    .addApiKey(
      { type: 'apiKey', name: 'x-admin-api-key', in: 'header' },
      'admin-api-key',
    )
    .addTag('Authentication')
    .addTag('OAuth')
    .addTag('Admin — Applications')
    .addTag('Admin — Providers')
    .addTag('Discovery')
    .addTag('Health')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = config.get<number>('app.port', 3000);
  await app.listen(port);
}

void bootstrap();
