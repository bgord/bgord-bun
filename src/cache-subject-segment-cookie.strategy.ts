import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import type { CacheSubjectSegmentStrategy } from "./cache-subject-segment.strategy";

export class CacheSubjectSegmentCookieStrategy implements CacheSubjectSegmentStrategy {
  constructor(private readonly name: string) {}

  create(context?: Context) {
    if (!context) return "";
    return getCookie(context, this.name) ?? "";
  }
}
