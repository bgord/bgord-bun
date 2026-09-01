import type * as hono from "hono";
import { ErrorHandler, type ErrorHandlerConfig, type ErrorHandlerDependencies } from "./error.handler";
import { RequestContextHonoAdapter } from "./request-context-hono.adapter";

export class ErrorHonoHandler {
  private readonly handler: ErrorHandler;

  constructor(config: ErrorHandlerConfig, deps: ErrorHandlerDependencies) {
    this.handler = new ErrorHandler(config, deps);
  }

  handle(): hono.ErrorHandler {
    return (error, c) => this.handler.handle(error, new RequestContextHonoAdapter(c));
  }
}
