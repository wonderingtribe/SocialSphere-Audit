import type { NextFunction, Request, Response } from "express";
import { logger } from "../lib/logger";

/**
 * Standard 404 + error handling. Express 5 forwards rejected/async errors to
 * the error handler automatically.
 */

export function notFoundHandler(req: Request, res: Response) {
  void req;
  res.status(404).json({ error: "Not found" });
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  logger.error({ err }, "Unhandled error");
  res.status(500).json({ error: "Internal server error" });
}