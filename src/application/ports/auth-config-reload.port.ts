export const AUTH_CONFIG_RELOAD_PORT = Symbol('AUTH_CONFIG_RELOAD_PORT');

/**
 * Invalidates cached Better Auth instances when admin changes OAuth config.
 */
export interface AuthConfigReloadPort {
  invalidateApplication(applicationId: string): Promise<void>;
  invalidateAll(): Promise<void>;
}
