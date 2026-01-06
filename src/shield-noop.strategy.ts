import { createMiddleware } from "hono/factory";
import type { ShieldStrategy } from "./shield.strategy";

export class ShieldNoopStrategy implements ShieldStrategy {
  verify = createMiddleware(async (_, next) => next());
}
