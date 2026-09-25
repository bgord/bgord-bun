import type { HasRequestPath, HasRequestQuery } from "./request-context.port";

export interface CacheControlStrategy {
  resolve(context: HasRequestPath & HasRequestQuery): string | null;
}
