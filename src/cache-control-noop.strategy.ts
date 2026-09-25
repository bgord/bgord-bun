import type { CacheControlStrategy } from "./cache-control.strategy";
import type { RequestContext } from "./request-context.port";

export class CacheControlNoopStrategy implements CacheControlStrategy {
  resolve(_context: RequestContext): string | null {
    return null;
  }
}
