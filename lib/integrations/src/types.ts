/**
 * Shared types for the social platform integration framework.
 *
 * New platforms are added by registering a `PlatformAdapter` — no logic in the
 * rest of the app should hardcode a specific platform.
 */

/**
 * Scoped credentials supplied from the runtime environment. Individual
 * platforms read the keys they need (client id/secret) from here.
 */
export type OAuthConfig = Record<string, string | undefined>;

export interface PlatformAdapter {
  /** Canonical platform id, e.g. "instagram". */
  id: string;
  /** Display name, e.g. "Instagram". */
  name: string;
  /** Short description shown in the connections UI. */
  description: string;
  /** Feather icon name used by the mobile app. */
  icon: string;
  /**
   * OAuth scopes requested during authorization. Emerging from the platform's
   * own scope vocabulary; never broader than needed.
   */
  scopes: string[];
  /** True when client id/secret environment variables are present. */
  isConfigured(config: OAuthConfig): boolean;
  /**
   * Build the official OAuth authorization URL. `state` is the caller-owned
   * CSRF token to be verified when the platform redirects back.
   */
  buildAuthorizationUrl(config: OAuthConfig, state: string): string;
}