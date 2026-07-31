import type { HasRequestQueries } from "./request-context.port";
import type { SubjectSegmentType } from "./subject-segment-request.strategy";
import {
  SubjectSegmentRequestEmpty,
  type SubjectSegmentRequestStrategy,
} from "./subject-segment-request.strategy";

export class SubjectSegmentQueryStrategy implements SubjectSegmentRequestStrategy {
  readonly label = "query";

  create(context: HasRequestQueries): SubjectSegmentType {
    const queries = context.request.queries();

    const keys = Object.keys(queries).toSorted();

    if (keys.length === 0) return SubjectSegmentRequestEmpty;
    return JSON.stringify(keys.map((key) => [key, queries[key]]));
  }
}
