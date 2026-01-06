import type * as tools from "@bgord/tools";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { timeout } from "hono/timeout";
import type { ShieldStrategy } from "./shield.strategy";

export const ShieldTimeoutError = new HTTPException(408, { message: "shield.timeout" });

type ShieldTimeoutConfigType = { duration: tools.Duration };

export class ShieldTimeoutStrategy implements ShieldStrategy {
  private readonly timeout;

  constructor(config: ShieldTimeoutConfigType) {
    this.timeout = timeout(config.duration.ms, ShieldTimeoutError);
  }

  verify = createMiddleware(async (context, next) => this.timeout(context, next));
}
