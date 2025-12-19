import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { ALL_BOTS } from "./bots.vo";
import { Client } from "./client.vo";
import type { ShieldPort } from "./shield.port";

export const UserAgentBlockedError = new HTTPException(403, { message: "app.user.agent.blocked.error" });

export class ShieldUserAgentBlockerAdapter implements ShieldPort {
  verify = createMiddleware(async (context, next) => {
    const client = Client.fromHonoContext(context);

    const detection = ALL_BOTS.some((bot) => client.matchesUa(bot));

    if (!detection) return next();
    throw UserAgentBlockedError;
  });
}
