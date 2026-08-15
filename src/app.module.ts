import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { PrismaModule } from './infrastructure/database/prisma/prisma.module';
import { EncryptionModule } from './infrastructure/encryption/encryption.module';
import { BetterAuthModule } from './infrastructure/auth/better-auth/better-auth.module';
import { ApplicationModule } from './application/application.module';
import { HttpAdaptersModule } from './adapters/http/http-adapters.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    PrismaModule,
    EncryptionModule,
    BetterAuthModule,
    ApplicationModule,
    HttpAdaptersModule,
  ],
})
export class AppModule {}
