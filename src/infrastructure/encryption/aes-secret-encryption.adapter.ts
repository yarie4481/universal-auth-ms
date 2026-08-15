import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SecretEncryptionPort } from '../../application/ports/secret-encryption.port';
import { AuthEngineError } from '../../domain/errors/auth.errors';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const PREFIX = 'enc:v1:';

@Injectable()
export class AesSecretEncryptionAdapter
  implements SecretEncryptionPort, OnModuleInit
{
  private key!: Buffer;

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    const master =
      this.config.get<string>('security.masterEncryptionKey') ??
      this.config.get<string>('auth.secret');

    if (!master || master.length < 16) {
      throw new Error(
        'MASTER_ENCRYPTION_KEY (or BETTER_AUTH_SECRET) must be set and at least 16 characters',
      );
    }

    this.key = createHash('sha256').update(master).digest();
  }

  async encrypt(value: string): Promise<string> {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, this.key, iv);
    const encrypted = Buffer.concat([
      cipher.update(value, 'utf8'),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();
    return (
      PREFIX +
      Buffer.concat([iv, tag, encrypted]).toString('base64url')
    );
  }

  async decrypt(value: string): Promise<string> {
    if (!value.startsWith(PREFIX)) {
      throw new AuthEngineError('Invalid encrypted secret format');
    }

    const raw = Buffer.from(value.slice(PREFIX.length), 'base64url');
    if (raw.length < IV_LENGTH + AUTH_TAG_LENGTH + 1) {
      throw new AuthEngineError('Corrupt encrypted secret');
    }

    const iv = raw.subarray(0, IV_LENGTH);
    const tag = raw.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const ciphertext = raw.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
    const decipher = createDecipheriv(ALGORITHM, this.key, iv);
    decipher.setAuthTag(tag);

    return Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]).toString('utf8');
  }
}
