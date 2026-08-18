import { Router, type IRouter } from "express";
import { z } from "zod/v4";
import {
  ApproveConversationResponse,
  GetConversationResponse,
  ListConversationsResponseItem,
} from "@workspace/api-zod";
import { getStore } from "../lib/store";

const router: IRouter = Router();

router.get("/conversations", async (_req, res) => {
  const store = await getStore();
  const data = (await store.listConversations()).map((conversation) =>
    ListConversationsResponseItem.parse(conversation),
  );
  res.json(data);
});

router.get("/conversations/:id", async (req, res) => {
  const store = await getStore();
  const conversation = await store.getConversation(req.params.id);
  if (!conversation) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  res.json(GetConversationResponse.parse(conversation));
});

const approveBody = z.object({
  reply: z.string().trim().min(1).max(2000),
});

router.post("/conversations/:id/approve", async (req, res) => {
  const parsed = approveBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "A non-empty reply is required" });
    return;
  }

  const store = await getStore();
  const result = await store.approveConversation(
    req.params.id,
    parsed.data.reply,
  );
  if (!result) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  res.json(
    ApproveConversationResponse.parse({
      conversation: result.conversation,
      delivery: result.delivery,
    }),
  );
});

export default router;