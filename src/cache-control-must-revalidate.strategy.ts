import type * as tools from "@bgord/tools";
import type { CacheControlStrategy } from "./cache-control.strategy";
import type { RequestContext } from "./request-context.port";

export class CacheControlMustRevalidateStrategy implements CacheControlStrategy {
  constructor(private readonly duration: tools.Duration) {}

  resolve(_context: RequestContext): string | null {
    return `public, max-age=${this.duration.seconds}, must-revalidate`;
  }
}
