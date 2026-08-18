import { Router, type IRouter } from "express";
import { getStore } from "../lib/store";

const router: IRouter = Router();

/**
 * Webhook verification challenge.
 *
 * Platforms such as Facebook and Instagram ping the callback URL with
 * `hub.mode=subscribe` + `hub.verify_token` + `hub.challenge` to confirm the
 * endpoint is ours. We echo the challenge only when the token matches, then
 * handlers for each platform can follow their own verification shape.
 */
router.get("/webhooks/:platform", async (req, res) => {
  const { platform } = req.params;
  const query = req.query as Record<string, string | undefined>;

  if (query["hub.mode"] || query["hub.verify_token"]) {
    const mode = query["hub.mode"];
    const token = query["hub.verify_token"];
    const challenge = query["hub.challenge"];

    if (
      mode !== "subscribe" ||
      !token ||
      !challenge ||
      token !== (await getStore()).getWebhookToken(platform)
    ) {
      res.status(403).send("Verification failed");
      return;
    }
    res.send(challenge);
    return;
  }

  res.status(400).json({ error: "Missing verification parameters" });
});

/**
 * Incoming webhook event receiver. The verify token arrives via query param or
 * the `x-webhook-token` header; after it passes, the event is stored verbatim
 * so adapters can consume it as REAL platform data.
 */
router.post("/webhooks/:platform", async (req, res) => {
  const { platform } = req.params;
  const store = await getStore();
  const expected = await store.getWebhookToken(platform);
  const provided =
    ((req.query as Record<string, string | undefined>).token ?? "") ||
    ((req.headers["x-webhook-token"] as string | undefined) ?? "");

  if (provided !== expected) {
    res.status(401).json({ error: "Invalid webhook token" });
    return;
  }

  const payload = (req.body ?? {}) as Record<string, unknown>;
  const eventType =
    typeof payload.entry === "string" ? payload.entry : (payload.event ?? "event");

  await store.recordWebhookEvent(platform, String(eventType), payload);
  res.json({ received: true });
});

export default router;