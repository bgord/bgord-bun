import * as tools from "@bgord/tools";
import { createMiddleware } from "hono/factory";

export enum CacheStaticFilesStrategy {
  never = "never",
  always = "always",
  five_minutes = "five_minutes",
}

export class CacheStaticFiles {
  static handle(strategy: CacheStaticFilesStrategy) {
    return createMiddleware(async (c, next) => {
      if (strategy === CacheStaticFilesStrategy.never) {
        c.res.headers.set("cache-control", "private, no-cache, no-store, must-revalidate");
      }
      if (strategy === CacheStaticFilesStrategy.always) {
        c.res.headers.set("cache-control", `public, max-age=${tools.Time.Days(365).seconds}, immutable`);
      }
      if (strategy === CacheStaticFilesStrategy.five_minutes) {
        c.res.headers.set("cache-control", `public, max-age=${tools.Time.Minutes(5).seconds}`);
      }
      return next();
    });
  }
}
