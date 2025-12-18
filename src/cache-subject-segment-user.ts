import type { Context } from "hono";
import type { CacheSubjectSegmentPort } from "./cache-subject-segment.port";

export class CacheSubjectSegmentUser implements CacheSubjectSegmentPort {
  create(context?: Context) {
    return context?.get("user")?.id ?? "anon";
  }
}
