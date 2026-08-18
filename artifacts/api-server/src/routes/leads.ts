import { Router, type IRouter } from "express";
import {
  AdvanceLeadResponse,
  GetLeadResponse,
  ListLeadsResponseItem,
  type Lead,
} from "@workspace/api-zod";
import { advanceDemoLead, demoLeads } from "../data/demoData";

const router: IRouter = Router();

// In-memory demo store. Advances below mutate this list; real stages will
// come from verified platform/webhook events once integrations exist.
const leads: Lead[] = [...demoLeads];

router.get("/leads", (_req, res) => {
  const data = leads.map((lead) => ListLeadsResponseItem.parse(lead));
  res.json(data);
});

router.get("/leads/:id", (req, res) => {
  const lead = leads.find((candidate) => candidate.id === req.params.id);
  if (!lead) {
    res.status(404).json({ error: "Lead not found" });
    return;
  }
  res.json(GetLeadResponse.parse(lead));
});

router.post("/leads/:id/advance", (req, res) => {
  const index = leads.findIndex((candidate) => candidate.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: "Lead not found" });
    return;
  }

  const advanced = advanceDemoLead(leads[index]);
  if (!advanced) {
    res.status(409).json({
      error: "This lead is not in demo mode or is already at the final stage",
    });
    return;
  }

  leads[index] = advanced;
  res.json(AdvanceLeadResponse.parse(advanced));
});

export default router;