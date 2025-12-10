import type { MiddlewareHandler } from "hono";

export interface ShieldPort {
  verify: MiddlewareHandler;
}
