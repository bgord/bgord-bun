import type { Context } from "hono";
import {
  CacheSubjectSegmentRequestEmpty,
  type CacheSubjectSegmentRequestStrategy,
} from "./cache-subject-segment-request.strategy";

export class CacheSubjectSegmentQueryStrategy implements CacheSubjectSegmentRequestStrategy {
  create(context: Context) {
    const query = context.req.query() ?? {};

    const keys = Object.keys(query).toSorted();

    const result = keys.map((key) => `${key}=${query[key]}`).join("&");

    if (!result) return CacheSubjectSegmentRequestEmpty;
    return result;
  }
}
