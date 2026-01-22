import type { CacheSubjectSegmentType } from "./cache-subject-segment-request.strategy";
import {
  CacheSubjectSegmentRequestEmpty,
  type CacheSubjectSegmentRequestStrategy,
} from "./cache-subject-segment-request.strategy";
import type { HasRequestQuery } from "./request-context.port";

export class CacheSubjectSegmentQueryStrategy implements CacheSubjectSegmentRequestStrategy {
  create(context: HasRequestQuery): CacheSubjectSegmentType {
    const query = context.request.query();

    const keys = Object.keys(query).toSorted();

    const result = keys.map((key) => `${key}=${query[key]}`).join("&");

    if (!result) return CacheSubjectSegmentRequestEmpty;
    return result;
  }
}
