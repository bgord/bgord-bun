import type * as tools from "@bgord/tools";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { timeout } from "hono/timeout";
import type { ShieldStrategy } from "./shield.strategy";

export const RequestTimeoutError = new HTTPException(408, { message: "request_timeout_error" });

type ShieldTimeoutConfigType = { duration: tools.Duration };

export class ShieldTimeoutStrategy implements ShieldStrategy {
  private readonly timeout;

  constructor(config: ShieldTimeoutConfigType) {
    this.timeout = timeout(config.duration.ms, RequestTimeoutError);
  }

  verify = createMiddleware(async (c, next) => this.timeout(c, next));
}
