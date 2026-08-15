export default () => ({
  app: {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: parseInt(process.env.PORT ?? '3000', 10),
    baseUrl: process.env.APP_BASE_URL ?? 'http://localhost:3000',
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  auth: {
    secret: process.env.BETTER_AUTH_SECRET ?? process.env.AUTH_SECRET,
    jwtIssuer:
      process.env.JWT_ISSUER ??
      process.env.APP_BASE_URL ??
      'http://localhost:3000',
    jwtAudience:
      process.env.JWT_AUDIENCE ??
      process.env.APP_BASE_URL ??
      'http://localhost:3000',
    jwtExpiration: process.env.JWT_EXPIRATION ?? '15m',
  },
  security: {
    masterEncryptionKey:
      process.env.MASTER_ENCRYPTION_KEY ??
      process.env.BETTER_AUTH_SECRET ??
      process.env.AUTH_SECRET,
  },
  admin: {
    apiKey: process.env.ADMIN_API_KEY,
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
  },
});
