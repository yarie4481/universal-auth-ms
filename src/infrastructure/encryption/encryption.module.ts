import { Global, Module } from '@nestjs/common';
import { SECRET_ENCRYPTION_PORT } from '../../application/ports/secret-encryption.port';
import { AesSecretEncryptionAdapter } from './aes-secret-encryption.adapter';

@Global()
@Module({
  providers: [
    AesSecretEncryptionAdapter,
    {
      provide: SECRET_ENCRYPTION_PORT,
      useExisting: AesSecretEncryptionAdapter,
    },
  ],
  exports: [SECRET_ENCRYPTION_PORT, AesSecretEncryptionAdapter],
})
export class EncryptionModule {}
