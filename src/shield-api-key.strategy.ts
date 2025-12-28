import type * as tools from "@bgord/tools";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import type { ShieldStrategy } from "./shield.strategy";

type ApiKeyShieldConfigType = { API_KEY: tools.ApiKeyType };

export const AccessDeniedApiKeyError = new HTTPException(403, { message: "access_denied_api_key" });

export class ShieldApiKeyStrategy implements ShieldStrategy {
  static readonly HEADER_NAME = "bgord-api-key";

  constructor(private readonly config: ApiKeyShieldConfigType) {}

  verify = createMiddleware(async (c, next) => {
    if (c.req.header(ShieldApiKeyStrategy.HEADER_NAME) === this.config.API_KEY) return next();

    throw AccessDeniedApiKeyError;
  });
}
