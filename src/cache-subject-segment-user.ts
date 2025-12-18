import type { Context } from "hono";
import type { CacheSubjectSegmentPort } from "./cache-subject-segment.port";

export class CacheSubjectSegmentUser implements CacheSubjectSegmentPort {
  create(c: Context) {
    return c.get("user")?.id ?? "anon";
  }
}
