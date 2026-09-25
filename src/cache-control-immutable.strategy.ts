import * as tools from "@bgord/tools";
import type { CacheControlStrategy } from "./cache-control.strategy";

const hashed = /-[a-z0-9]{8}\.js$/;

export const CacheControlImmutableStrategy: (fallback: CacheControlStrategy) => CacheControlStrategy =
  (fallback) => (path, c) => {
    if (hashed.test(path) || c.req.query("v")) {
      return c.header("Cache-Control", `public, max-age=${tools.Duration.Days(365).seconds}, immutable`);
    }

    return fallback(path, c);
  };
