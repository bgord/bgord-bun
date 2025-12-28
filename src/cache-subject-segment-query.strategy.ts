import type { Context } from "hono";
import type { CacheSubjectSegmentStrategy } from "./cache-subject-segment.strategy";

export class CacheSubjectSegmentQueryStrategy implements CacheSubjectSegmentStrategy {
  create(context?: Context) {
    const query = context?.req.query() ?? {};

    const keys = Object.keys(query).toSorted();

    if (keys.length === 0) return "";
    return keys.map((key) => `${key}=${query[key]}`).join("&");
  }
}
