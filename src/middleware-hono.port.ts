import type { MiddlewareHandler } from "hono";

export interface MiddlewareHonoPort {
  handle(): MiddlewareHandler;
}
