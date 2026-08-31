import type * as hono from "hono";
import { ErrorHandler, type ErrorHandlerConfig } from "./error.handler";
import { RequestContextHonoAdapter } from "./request-context-hono.adapter";

export class ErrorHonoHandler {
  private readonly handler: ErrorHandler;

  constructor(config: ErrorHandlerConfig) {
    this.handler = new ErrorHandler(config);
  }

  handle(): hono.ErrorHandler {
    return (error, c) => this.handler.handle(error, new RequestContextHonoAdapter(c));
  }
}
