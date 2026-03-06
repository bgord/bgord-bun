import type { RequestHandler } from "express";
import type { MiddlewareExpressPort } from "./middleware-express.port";

export class MiddlewareExpressNoopAdapter implements MiddlewareExpressPort {
  handle(): RequestHandler {
    return (_request, _response, next) => next();
  }
}
