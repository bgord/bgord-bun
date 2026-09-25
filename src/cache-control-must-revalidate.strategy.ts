import type * as tools from "@bgord/tools";
import type { CacheControlStrategy } from "./cache-control.strategy";

export const CacheControlMustRevalidateStrategy: (duration: tools.Duration) => CacheControlStrategy =
  (duration) => (_, c) => {
    c.header("Cache-Control", `public, max-age=${duration.seconds}, must-revalidate`);
  };
