import { MiddlewareHandler } from "hono";

export interface CaptchaShieldPort {
  build: MiddlewareHandler;
}
