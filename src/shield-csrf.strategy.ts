import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import type { ShieldStrategy } from "./shield.strategy";

const STATE_CHANGING_METHODS = ["POST", "PUT", "PATCH", "DELETE"];

export type ShieldCsrfConfigType = { origins: string[] };

export const ShieldCsrfError = new HTTPException(403, { message: "shield.csrf" });

export class ShieldCsrfStrategy implements ShieldStrategy {
  constructor(private readonly config: ShieldCsrfConfigType) {}

  verify = createMiddleware(async (context, next) => {
    if (!STATE_CHANGING_METHODS.includes(context.req.method)) return next();

    const origin = context.req.header("Origin");

    if (!origin) return next();
    if (!this.config.origins.includes(origin)) throw ShieldCsrfError;
    return next();
  });
}
