import { timingSafeEqual } from "node:crypto";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import type { HasRequestHeader } from "./request-context.port";

export type ApiKeyShieldConfig = { API_KEY: tools.ApiKeyType };

export const ShieldApiKeyStrategyError = { Rejected: "shield.api.key.rejected" };

export class ShieldApiKeyStrategy {
  static readonly HEADER_NAME = "api-key";

  constructor(private readonly config: ApiKeyShieldConfig) {}

  evaluate(context: HasRequestHeader): boolean {
    const header = v.safeParse(tools.ApiKey, context.request.header(ShieldApiKeyStrategy.HEADER_NAME));

    if (!header.success) return false;

    return timingSafeEqual(Buffer.from(header.output), Buffer.from(this.config.API_KEY));
  }
}
