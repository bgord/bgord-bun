import type { MiddlewareHandler } from "hono";

export interface ShieldCaptchaPort {
  verify: MiddlewareHandler;
}
