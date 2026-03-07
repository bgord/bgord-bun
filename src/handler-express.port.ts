import type { RequestHandler } from "express";

export interface HandlerExpressPort {
  handle(): RequestHandler | Array<RequestHandler>;
}
