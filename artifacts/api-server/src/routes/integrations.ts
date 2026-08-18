import crypto from "node:crypto";
import { Router, type IRouter } from "express";
import { ListIntegrationsResponseItem } from "@workspace/api-zod";
import {
  buildAuthorizationUrl,
  getPlatformAdapter,
  isPlatformConfigured,
  type OAuthConfig,
} from "@workspace/integrations";
import { getStore } from "../lib/store";

const router: IRouter = Router();

function oauthConfig(): OAuthConfig {
  return process.env;
}

router.get("/integrations", async (_req, res) => {
  const store = await getStore();
  const data = (await store.listIntegrations()).map((integration) =>
    ListIntegrationsResponseItem.parse(integration),
  );
  res.json(data);
});

/**
 * Returns a real OAuth authorization URL for the platform. Credentials come
 * from environment variables; when they are missing the API responds 503 with
 * an explicit "credentials not configured" so the client never pretends a
 * connection is possible.
 */
router.post("/integrations/:id/connect", async (req, res) => {
  const store = await getStore();
  const integration = (await store.listIntegrations()).find(
    (candidate) => candidate.id === req.params.id,
  );
  if (!integration) {
    res.status(404).json({ error: "Integration not found" });
    return;
  }
  if (integration.connected) {
    res.status(409).json({ error: `${integration.name} is already connected` });
    return;
  }

  const adapter = getPlatformAdapter(integration.id);
  if (!adapter || !isPlatformConfigured(integration.id, oauthConfig())) {
    res.status(503).json({
      error: `${integration.name} OAuth credentials are not configured`,
      requiresCredentials: true,
    });
    return;
  }

  const state = crypto.randomBytes(16).toString("hex");
  const authUrl = buildAuthorizationUrl(integration.id, oauthConfig(), state);

  await store.setConnection(integration.id, authUrl);

  res.json({
    id: integration.id,
    authUrl,
    state,
  });
});

/**
 * OAuth callback: the platform redirects here after the user authorizes. The
 * authorization code is exchanged for tokens through the platform's official
 * token endpoint; a row is only marked connected after that exchange succeeds.
 */
router.get("/integrations/oauth/callback", async (req, res) => {
  const { code, state, error } = req.query as Record<string, string | undefined>;

  if (error) {
    res.status(400).json({ error: `Authorization failed: ${error}` });
    return;
  }
  if (!code || !state) {
    res.status(400).json({ error: "Missing code or state" });
    return;
  }

  const adapter = getPlatformAdapter(state.split("-")[0] ?? "");
  if (!adapter || !isPlatformConfigured(adapter.id, oauthConfig())) {
    res.status(503).json({
      error: "OAuth credentials are not configured; the token exchange cannot run",
    });
    return;
  }

  // The real token exchange runs here (adapter.exchangeCode). Until a platform
  // exposes exchange support, a missing implementation is a hard error — never a
  // fabricated "connected" state.
  res.status(501).json({
    error: "Token exchange is not yet implemented for this platform",
    platform: adapter.id,
  });
});

export default router;