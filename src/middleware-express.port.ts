import type { RequestHandler } from "express";

export interface MiddlewareExpressPort {
  handle(): RequestHandler;
}
