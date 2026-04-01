import type hono from "hono";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import type { AuthSessionReaderPort } from "./auth-session-reader.port";
import { RequestContextHonoAdapter } from "./request-context-hono.adapter";
import { ShieldAuthStrategy, ShieldAuthStrategyError } from "./shield-auth.strategy";

type Dependencies<User, Session> = { AuthSessionReader: AuthSessionReaderPort<User, Session> };

export const ShieldAuthVerifyError = new HTTPException(401, { message: ShieldAuthStrategyError.Rejected });
export const ShieldAuthReverseError = new HTTPException(403, { message: ShieldAuthStrategyError.Rejected });

export class ShieldAuthHonoStrategy<User, Session> {
  private readonly strategy: ShieldAuthStrategy<User, Session>;

  constructor(deps: Dependencies<User, Session>) {
    this.strategy = new ShieldAuthStrategy(deps);
  }

  attach = createMiddleware(async (c: hono.Context, next: hono.Next) => {
    const context = new RequestContextHonoAdapter(c);
    const auth = await this.strategy.attach(context);

    c.set("user", auth.user);
    c.set("session", auth.session);
    return next();
  });

  verify = createMiddleware(async (c: hono.Context, next: hono.Next) => {
    const user = c.get("user");

    if (this.strategy.verify(user)) return next();
    throw ShieldAuthVerifyError;
  });

  reverse = createMiddleware(async (c: hono.Context, next: hono.Next) => {
    const user = c.get("user");

    if (this.strategy.reverse(user)) return next();
    throw ShieldAuthReverseError;
  });
}
