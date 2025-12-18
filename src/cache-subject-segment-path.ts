import type { Context } from "hono";
import type { CacheSubjectSegmentPort } from "./cache-subject-segment.port";

export class CacheSubjectSegmentPath implements CacheSubjectSegmentPort {
  create(c: Context) {
    return c.req.path;
  }
}
