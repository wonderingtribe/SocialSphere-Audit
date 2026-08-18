import { Router, type IRouter } from "express";
import {
  GetConversationResponse,
  ListConversationsResponseItem,
  type Conversation,
} from "@workspace/api-zod";
import { demoConversations } from "../data/demoData";

const router: IRouter = Router();

const conversations: Conversation[] = [...demoConversations];

router.get("/conversations", (_req, res) => {
  const data = conversations.map((conversation) =>
    ListConversationsResponseItem.parse(conversation),
  );
  res.json(data);
});

router.get("/conversations/:id", (req, res) => {
  const conversation = conversations.find(
    (candidate) => candidate.id === req.params.id,
  );
  if (!conversation) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  res.json(GetConversationResponse.parse(conversation));
});

export default router;