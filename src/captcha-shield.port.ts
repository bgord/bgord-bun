import type { MiddlewareHandler } from "hono";

export interface CaptchaShieldPort {
  build: MiddlewareHandler;
}
