import { MiddlewareHandler } from "hono";

export interface CaptchaPort {
  build: MiddlewareHandler;
}
