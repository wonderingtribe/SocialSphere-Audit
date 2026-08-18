import { Router, type IRouter } from "express";
import {
  AdvanceLeadResponse,
  GetLeadResponse,
  ListLeadsResponseItem,
} from "@workspace/api-zod";
import { getStore } from "../lib/store";

const router: IRouter = Router();

router.get("/leads", async (_req, res) => {
  const store = await getStore();
  const data = (await store.listLeads()).map((lead) =>
    ListLeadsResponseItem.parse(lead),
  );
  res.json(data);
});

router.get("/leads/:id", async (req, res) => {
  const store = await getStore();
  const lead = await store.getLead(req.params.id);
  if (!lead) {
    res.status(404).json({ error: "Lead not found" });
    return;
  }
  res.json(GetLeadResponse.parse(lead));
});

router.post("/leads/:id/advance", async (req, res) => {
  const store = await getStore();
  const advanced = await store.advanceLead(req.params.id);
  if (!advanced) {
    const existing = await store.getLead(req.params.id);
    if (!existing) {
      res.status(404).json({ error: "Lead not found" });
      return;
    }
    res.status(409).json({
      error: "This lead is not in demo mode or is already at the final stage",
    });
    return;
  }
  res.json(AdvanceLeadResponse.parse(advanced));
});

export default router;