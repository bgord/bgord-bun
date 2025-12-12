import type * as tools from "@bgord/tools";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { timeout } from "hono/timeout";
import type { ShieldPort } from "./shield.port";

export const RequestTimeoutError = new HTTPException(408, { message: "request_timeout_error" });

type ShieldTimeoutConfigType = { duration: tools.Duration };

export class ShieldTimeoutAdapter implements ShieldPort {
  private readonly timeout;

  constructor(config: ShieldTimeoutConfigType) {
    this.timeout = timeout(config.duration.ms, RequestTimeoutError);
  }

  verify = createMiddleware(async (c, next) => this.timeout(c, next));
}
