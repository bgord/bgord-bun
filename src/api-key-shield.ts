import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { z } from "zod/v4";

export const ApiKeySchema = z.string().trim().length(64);
export type ApiKeySchemaType = z.infer<typeof ApiKeySchema>;

type ApiKeyShieldConfigType = { API_KEY: ApiKeySchemaType };

export const AccessDeniedApiKeyError = new HTTPException(403, {
  message: "access_denied_api_key",
});

export class ApiKeyShield {
  static readonly HEADER_NAME = "bgord-api-key";

  constructor(private readonly config: ApiKeyShieldConfigType) {}

  verify = createMiddleware(async (c, next) => {
    if (c.req.header(ApiKeyShield.HEADER_NAME) === this.config.API_KEY) {
      return next();
    }

    throw AccessDeniedApiKeyError;
  });
}
