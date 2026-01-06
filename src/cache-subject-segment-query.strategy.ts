import type { Context } from "hono";
import { CacheSubjectSegmentEmpty, type CacheSubjectSegmentStrategy } from "./cache-subject-segment.strategy";

export class CacheSubjectSegmentQueryStrategy implements CacheSubjectSegmentStrategy {
  create(context?: Context) {
    const query = context?.req.query() ?? {};

    const keys = Object.keys(query).toSorted();

    const result = keys.map((key) => `${key}=${query[key]}`).join("&");

    if (!result) return CacheSubjectSegmentEmpty;
    return result;
  }
}
