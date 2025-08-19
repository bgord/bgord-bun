import type { MiddlewareHandler } from "hono";

export interface CaptchaShieldPort {
  verify: MiddlewareHandler;
}
