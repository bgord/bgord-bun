import type { MiddlewareHandler } from "hono";

export interface HonoMiddlewarePort {
  handle(): MiddlewareHandler;
}
