import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import { CacheSubjectSegmentEmpty, type CacheSubjectSegmentStrategy } from "./cache-subject-segment.strategy";

export class CacheSubjectSegmentCookieStrategy implements CacheSubjectSegmentStrategy {
  constructor(private readonly name: string) {}

  create(context?: Context) {
    if (!context) return CacheSubjectSegmentEmpty;
    return getCookie(context, this.name) ?? CacheSubjectSegmentEmpty;
  }
}
