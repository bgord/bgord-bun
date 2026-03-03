import type * as tools from "@bgord/tools";
import type { HasRequestHeader } from "./request-context.port";

export type ApiKeyShieldConfig = { API_KEY: tools.ApiKeyType };

export const ShieldApiKeyStrategyError = { Rejected: "shield.api.key.rejected" };

export class ShieldApiKeyStrategy {
  static readonly HEADER_NAME = "bgord-api-key";

  constructor(private readonly config: ApiKeyShieldConfig) {}

  evaluate(context: HasRequestHeader): boolean {
    return context.request.header(ShieldApiKeyStrategy.HEADER_NAME) === this.config.API_KEY;
  }
}
