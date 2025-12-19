import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { ALL_BOTS } from "./bots.vo";
import { Client } from "./client.vo";
import type { ShieldPort } from "./shield.port";

export const UserAgentBlockedError = new HTTPException(403, { message: "app.user.agent.blocked.error" });

export type ShieldUserAgentBlockerOptionsType = { blacklist: string[] };

export class ShieldUserAgentBlockerAdapter implements ShieldPort {
  constructor(private readonly options: ShieldUserAgentBlockerOptionsType = { blacklist: ALL_BOTS }) {}

  verify = createMiddleware(async (context, next) => {
    const client = Client.fromHonoContext(context);

    const detection = this.options.blacklist.some((bot) => client.matchesUa(bot));

    if (!detection) return next();
    throw UserAgentBlockedError;
  });
}
