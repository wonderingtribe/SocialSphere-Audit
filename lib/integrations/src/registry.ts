import crypto from "node:crypto";
import type { OAuthConfig, PlatformAdapter } from "./types";

const scopesByPlatform: Record<string, string> = {
  instagram:
    "business_management,instagram_business_basic,instagram_business_manage_comments,instagram_business_manage_messages,instagram_business_content_publish",
  linkedin: "openid,profile,email,w_member_social",
  x: "tweet.read users.read follows.read offline.access",
  facebook:
    "pages_show_list,pages_read_engagement,pages_manage_engagement,pages_messaging,business_management",
};

function requirePair(
  config: OAuthConfig,
  clientIdKey: string,
  secretKey: string,
  redirectUriKey: string,
): { clientId: string; redirectUri: string } | null {
  const clientId = config[clientIdKey]?.trim();
  const redirectUri = config[redirectUriKey]?.trim();
  const secret = config[secretKey]?.trim();
  if (!clientId || !secret || !redirectUri) return null;
  return { clientId, redirectUri };
}

/**
 * PKCE helper: derives a verifier/challenge pair deterministically from the
 * platform flow's `state` plus a server-held secret, so the callback can
 * reconstruct the verifier when exchanging the authorization code.
 */
export function pkceChallenge(
  state: string,
  secret: string,
): { verifier: string; challenge: string } {
  const verifier = crypto
    .createHash("sha256")
    .update(`ss-${state}-${secret}`)
    .digest("base64url");
  const challenge = crypto
    .createHash("sha256")
    .update(verifier)
    .digest("base64url");
  return { verifier, challenge };
}

function defineAdapter(adapter: PlatformAdapter): PlatformAdapter {
  return adapter;
}

/**
 * All supported platform adapters. Auth endpoints and scopes are the official
 * ones published by each platform; nothing here purports to connect without
 * real credentials and user authorization.
 */
export const adapters: ReadonlyMap<string, PlatformAdapter> = new Map(
  [
    defineAdapter({
      id: "instagram",
      name: "Instagram",
      description: "Comments, messages, publishing, and approved webhooks",
      icon: "instagram",
      scopes: scopesByPlatform.instagram.split(","),
      isConfigured: (config) =>
        Boolean(
          config.INSTAGRAM_CLIENT_ID &&
            config.INSTAGRAM_CLIENT_SECRET &&
            config.INSTAGRAM_REDIRECT_URI,
        ),
      buildAuthorizationUrl: (config, state) => {
        const creds = requirePair(
          config,
          "INSTAGRAM_CLIENT_ID",
          "INSTAGRAM_CLIENT_SECRET",
          "INSTAGRAM_REDIRECT_URI",
        );
        if (!creds) return "";
        const params = new URLSearchParams({
          client_id: creds.clientId,
          redirect_uri: creds.redirectUri,
          response_type: "code",
          scope: scopesByPlatform.instagram,
          state,
        });
        return `https://api.instagram.com/oauth/authorize?${params.toString()}`;
      },
    }),
    defineAdapter({
      id: "linkedin",
      name: "LinkedIn",
      description: "Page activity, conversations, and campaign signals",
      icon: "briefcase",
      scopes: scopesByPlatform.linkedin.split(","),
      isConfigured: (config) =>
        Boolean(
          config.LINKEDIN_CLIENT_ID &&
            config.LINKEDIN_CLIENT_SECRET &&
            config.LINKEDIN_REDIRECT_URI,
        ),
      buildAuthorizationUrl: (config, state) => {
        const creds = requirePair(
          config,
          "LINKEDIN_CLIENT_ID",
          "LINKEDIN_CLIENT_SECRET",
          "LINKEDIN_REDIRECT_URI",
        );
        if (!creds) return "";
        const params = new URLSearchParams({
          response_type: "code",
          client_id: creds.clientId,
          redirect_uri: creds.redirectUri,
          scope: scopesByPlatform.linkedin,
          state,
        });
        return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
      },
    }),
    defineAdapter({
      id: "x",
      name: "X",
      description: "Replies, mentions, and approved publishing scopes",
      icon: "message-circle",
      scopes: scopesByPlatform.x.split(" "),
      isConfigured: (config) =>
        Boolean(config.X_CLIENT_ID && config.X_CLIENT_SECRET && config.X_REDIRECT_URI),
      buildAuthorizationUrl: (config, state) => {
        const creds = requirePair(
          config,
          "X_CLIENT_ID",
          "X_CLIENT_SECRET",
          "X_REDIRECT_URI",
        );
        if (!creds) return "";
        const { challenge } = pkceChallenge(
          state,
          process.env.SOCIALSPHERE_PKCE_SECRET ?? "dev",
        );
        const params = new URLSearchParams({
          response_type: "code",
          client_id: creds.clientId,
          redirect_uri: creds.redirectUri,
          scope: scopesByPlatform.x,
          state,
          code_challenge: challenge,
          code_challenge_method: "S256",
        });
        return `https://x.com/i/oauth2/authorize?${params.toString()}`;
      },
    }),
    defineAdapter({
      id: "facebook",
      name: "Facebook",
      description: "Page conversations and lead event webhooks",
      icon: "facebook",
      scopes: scopesByPlatform.facebook.split(","),
      isConfigured: (config) =>
        Boolean(
          config.FACEBOOK_CLIENT_ID &&
            config.FACEBOOK_CLIENT_SECRET &&
            config.FACEBOOK_REDIRECT_URI,
        ),
      buildAuthorizationUrl: (config, state) => {
        const creds = requirePair(
          config,
          "FACEBOOK_CLIENT_ID",
          "FACEBOOK_CLIENT_SECRET",
          "FACEBOOK_REDIRECT_URI",
        );
        if (!creds) return "";
        const params = new URLSearchParams({
          client_id: creds.clientId,
          redirect_uri: creds.redirectUri,
          scope: scopesByPlatform.facebook,
          state,
        });
        return `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`;
      },
    }),
  ].map((adapter) => [adapter.id, adapter]),
);