import { Router, type IRouter } from "express";
import healthRouter from "./health";
import integrationsRouter from "./integrations";
import conversationsRouter from "./conversations";
import leadsRouter from "./leads";
import billingRouter from "./billing";
import webhooksRouter from "./webhooks";
import settingsRouter from "./settings";

const router: IRouter = Router();

router.use(healthRouter);
router.use(leadsRouter);
router.use(conversationsRouter);
router.use(integrationsRouter);
router.use(webhooksRouter);
router.use(settingsRouter);
router.use("/billing", billingRouter);

export default router;