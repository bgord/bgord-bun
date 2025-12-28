import type { MiddlewareHandler } from "hono";

export interface ShieldStrategy {
  verify: MiddlewareHandler;
}
