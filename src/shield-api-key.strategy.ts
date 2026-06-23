import { timingSafeEqual } from "node:crypto";
import type * as tools from "@bgord/tools";
import type { HasRequestHeader } from "./request-context.port";

export type ApiKeyShieldConfig = { API_KEY: tools.ApiKeyType };

export const ShieldApiKeyStrategyError = { Rejected: "shield.api.key.rejected" };

export class ShieldApiKeyStrategy {
  static readonly HEADER_NAME = "api-key";

  constructor(private readonly config: ApiKeyShieldConfig) {}

  evaluate(context: HasRequestHeader): boolean {
    const header = context.request.header(ShieldApiKeyStrategy.HEADER_NAME);
    const config = this.config.API_KEY;

    if (header?.length !== config.length) return false;

    return timingSafeEqual(Buffer.from(header), Buffer.from(config));
  }
}
