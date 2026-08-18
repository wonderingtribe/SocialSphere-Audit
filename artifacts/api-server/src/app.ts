import express, { type Express, type Request } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());

// Capture the raw body so the Stripe webhook can verify its signature over the
// exact bytes Stripe signed. `express.json()` below re-parses for everything else.
app.use(
  express.json({
    verify: (req: Request, _res, buf: Buffer) => {
      (req as Request & { rawBody?: Buffer }).rawBody = buf;
    },
  }),
);
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;