import type { Context } from "hono";
import type { CacheSubjectSegmentPort } from "./cache-subject-segment.port";

export class CacheSubjectSegmentQuery implements CacheSubjectSegmentPort {
  create(c: Context) {
    const query = c.req.query();

    const keys = Object.keys(query).toSorted();

    if (keys.length === 0) return "";
    return keys.map((key) => `${key}=${query[key]}`).join("&");
  }
}
