// TODO: tests

import type { betterAuth } from "better-auth";
import type hono from "hono";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

export const AccessDeniedAuthShieldError = new HTTPException(403, {
  message: "access_denied_auth_shield",
});

export class ShieldAuth {
  cors = {
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
    allowHeaders: ["Content-Type"],
    exposeHeaders: ["Set-Cookie"],
  };

  constructor(private readonly Auth: ReturnType<typeof betterAuth>) {}

  attach = createMiddleware(async (c: hono.Context, next: hono.Next) => {
    const session = await this.Auth.api.getSession({ headers: c.req.raw.headers });

    if (!session) {
      c.set("user", null);
      c.set("session", null);

      return next();
    }

    c.set("user", session.user);
    c.set("session", session.session);

    return next();
  });

  verify = createMiddleware(async (c: hono.Context, next: hono.Next) => {
    const user = c.get("user");

    if (!user) throw AccessDeniedAuthShieldError;
    return next();
  });

  reverse = createMiddleware(async (c: hono.Context, next: hono.Next) => {
    const user = c.get("user");

    if (user) throw AccessDeniedAuthShieldError;
    return next();
  });
}
