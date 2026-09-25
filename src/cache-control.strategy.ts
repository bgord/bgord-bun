import type { Context } from "hono";

export type CacheControlStrategy = (path: string, context: Context) => Promise<void> | void;
