import { Router, type IRouter } from "express";
import healthRouter from "./health";
import integrationsRouter from "./integrations";
import conversationsRouter from "./conversations";
import leadsRouter from "./leads";

const router: IRouter = Router();

router.use(healthRouter);
router.use(leadsRouter);
router.use(conversationsRouter);
router.use(integrationsRouter);

export default router;
