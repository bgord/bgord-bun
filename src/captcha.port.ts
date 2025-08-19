import { createMiddleware } from "hono/factory";

export interface CaptchaShieldPort {
  build: ReturnType<typeof createMiddleware>;
}
