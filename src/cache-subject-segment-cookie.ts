import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import type { CacheSubjectSegmentPort } from "./cache-subject-segment.port";

export class CacheSubjectSegmentCookie implements CacheSubjectSegmentPort {
  constructor(private readonly name: string) {}

  create(context?: Context) {
    if (!context) return "";
    return getCookie(context, this.name) ?? "";
  }
}
