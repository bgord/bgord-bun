import type hono from "hono";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import type { AuthSessionReaderPort } from "./auth-session-reader.port";
import { RequestContextAdapterHono } from "./request-context-hono.adapter";

type Dependencies<User, Session> = { AuthSessionReader: AuthSessionReaderPort<User, Session> };

export const ShieldAuthError = new HTTPException(403, { message: "shield.auth" });

export class ShieldAuthStrategy<User, Session> {
  constructor(private readonly deps: Dependencies<User, Session>) {}

  attach = createMiddleware(async (c: hono.Context, next: hono.Next) => {
    const context = new RequestContextAdapterHono(c);
    const auth = await this.deps.AuthSessionReader.getSession(context);

    if (!auth) {
      c.set("user", null);
      c.set("session", null);
      return next();
    }

    c.set("user", auth.user);
    c.set("session", auth.session);
    return next();
  });

  verify = createMiddleware(async (c: hono.Context, next: hono.Next) => {
    const user = c.get("user");

    if (!user) throw ShieldAuthError;
    return next();
  });

  reverse = createMiddleware(async (c: hono.Context, next: hono.Next) => {
    const user = c.get("user");

    if (user) throw ShieldAuthError;
    return next();
  });
}
