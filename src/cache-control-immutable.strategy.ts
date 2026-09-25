import * as tools from "@bgord/tools";
import type { CacheControlStrategy } from "./cache-control.strategy";
import type { HasRequestPath, HasRequestQuery } from "./request-context.port";

const hashed = /-[a-z0-9]{8}\.js$/;

export class CacheControlImmutableStrategy implements CacheControlStrategy {
  constructor(private readonly fallback: CacheControlStrategy) {}

  resolve(context: HasRequestPath & HasRequestQuery): string | null {
    if (hashed.test(context.request.path) || context.request.query()["v"]) {
      return `public, max-age=${tools.Duration.Days(365).seconds}, immutable`;
    }

    return this.fallback.resolve(context);
  }
}
