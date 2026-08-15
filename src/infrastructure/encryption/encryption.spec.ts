import { createHash, createCipheriv, createDecipheriv, randomBytes } from 'crypto';

describe('secret hashing', () => {
  it('hashes deterministically with sha256', () => {
    const a = createHash('sha256').update('secret_abc').digest('hex');
    const b = createHash('sha256').update('secret_abc').digest('hex');
    expect(a).toBe(b);
    expect(a).not.toBe('secret_abc');
  });
});

describe('AES-GCM encrypt/decrypt shape', () => {
  it('round-trips a client secret', () => {
    const key = createHash('sha256').update('master-key').digest();
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([
      cipher.update('GOCSPX-test-secret', 'utf8'),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();
    const payload = Buffer.concat([iv, tag, encrypted]);

    const iv2 = payload.subarray(0, 12);
    const tag2 = payload.subarray(12, 28);
    const data = payload.subarray(28);
    const decipher = createDecipheriv('aes-256-gcm', key, iv2);
    decipher.setAuthTag(tag2);
    const plain = Buffer.concat([
      decipher.update(data),
      decipher.final(),
    ]).toString('utf8');

    expect(plain).toBe('GOCSPX-test-secret');
  });
});
