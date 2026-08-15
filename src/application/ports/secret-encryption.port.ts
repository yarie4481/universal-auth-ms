export const SECRET_ENCRYPTION_PORT = Symbol('SECRET_ENCRYPTION_PORT');

/**
 * Encrypts sensitive configuration at rest.
 * Swap implementation for Vault / AWS SM / Azure Key Vault later.
 */
export interface SecretEncryptionPort {
  encrypt(value: string): Promise<string>;
  decrypt(value: string): Promise<string>;
}
