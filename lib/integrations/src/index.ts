import type { OAuthConfig, PlatformAdapter } from "./types";
import { adapters } from "./registry";

export type { OAuthConfig, PlatformAdapter } from "./types";

/** All registered platform adapters, keyed by platform id. */
export function getPlatformAdapters(): ReadonlyMap<string, PlatformAdapter> {
  return adapters;
}

/** Look up a single adapter. Returns undefined for unknown platform ids. */
export function getPlatformAdapter(platformId: string): PlatformAdapter | undefined {
  return adapters.get(platformId);
}

/**
 * Builds the official OAuth authorization URL for a platform, or null when the
 * platform's client credentials are not configured via environment variables.
 * The URL is always constructed from the platform's real authorization
 * endpoint and requested OAuth scopes — never a fabricated connection.
 */
export function buildAuthorizationUrl(
  platformId: string,
  config: OAuthConfig,
): string | null {
  const adapter = adapters.get(platformId);
  if (!adapter) return null;
  if (!adapter.isConfigured(config)) return null;
  return adapter.buildAuthorizationUrl(config);
}

/**
 * Whether a platform's client credentials are configured (env vars present),
 * so the UI can show a real "Connect with X" flow vs. a "credentials needed"
 * state without pretending.
 */
export function isPlatformConfigured(
  platformId: string,
  config: OAuthConfig,
): boolean {
  const adapter = adapters.get(platformId);
  if (!adapter) return false;
  return adapter.isConfigured(config);
}