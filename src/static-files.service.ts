// Stryker disable all
import type * as tools from "@bgord/tools";
import { type Context, Hono } from "hono";
import { serveStatic } from "hono/bun";
import { etag } from "hono/etag";

type StaticFilesStrategy = (path: string, context: Context) => Promise<void> | void;

export const StaticFileStrategyNoop: StaticFilesStrategy = () => {};

export const StaticFileStrategyMustRevalidate: (duration: tools.Duration) => StaticFilesStrategy =
  (duration) => (_, c) => {
    c.header("Cache-Control", `public, max-age=${duration.ms}, must-revalidate`);
  };

export class StaticFiles {
  static handle(path: string, strategy: StaticFilesStrategy) {
    return {
      [path]: new Hono().use(
        path,
        etag(),
        serveStatic({ root: "./", precompressed: true, onFound: strategy }),
      ).fetch,
    };
  }
}
// Stryker restore all
