import { Router, type IRouter } from "express";
import { ListIntegrationsResponseItem, type Integration } from "@workspace/api-zod";
import { demoIntegrations } from "../data/demoData";

const router: IRouter = Router();

const integrations: Integration[] = [...demoIntegrations];

router.get("/integrations", (_req, res) => {
  const data = integrations.map((integration) =>
    ListIntegrationsResponseItem.parse(integration),
  );
  res.json(data);
});

export default router;