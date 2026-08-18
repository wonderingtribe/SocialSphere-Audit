import { Router, type IRouter } from "express";
import { getStore } from "../lib/store";
import { getPlatformAdapter } from "@workspace/integrations";

const router: IRouter = Router();

function baseUrl(req: import("express").Request): string {
  const configured = process.env.PUBLIC_BASE_URL?.replace(/\/+$/, "");
  if (configured) return configured;
  const proto =
    req.headers["x-forwarded-proto"]?.toString() ??
    (req.secure ? "https" : "http");
  return `${proto}://${req.headers.host ?? "localhost:5000"}`;
}

/**
 * Webhook settings. Platforms that require a verified callback (Instagram,
 * Facebook, and friends) expose here the exact URL + verify token a business
 * pastes into that platform's developer dashboard.
 */
router.get("/settings/webhooks", async (req, res) => {
  const store = await getStore();
  const base = baseUrl(req);

  const platforms = (await store.listIntegrations()).map(
    (integration) => integration.id,
  );

  const settings = await Promise.all(
    platforms.map(async (platform) => {
      const token = await store.getWebhookToken(platform);
      return {
        platform,
        callbackUrl: `${base}/api/webhooks/${platform}`,
        verifyToken: token,
        requiresWebhook:
          process.env.WEBHOOK_PLATFORMS?.split(",")
            .map((value) => value.trim())
            .filter(Boolean)
            .includes(platform) ??
          ["instagram", "facebook", "linkedin"].includes(platform),
        configured: Boolean(getPlatformAdapter(platform)),
      };
    }),
  );

  res.json({ base, settings });
});

/**
 * Recent webhook events, newest first. Surface-only; full payloads are stored
 * so adapters can replay them when processing lands.
 */
router.get("/settings/webhooks/events", async (req, res) => {
  const store = await getStore();
  const platform = (req.query.platform as string | undefined) ?? undefined;
  res.json(await store.listWebhookEvents(platform));
});

export default router;