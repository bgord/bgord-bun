import type { HasRequestQuery } from "./request-context.port";
import type { SubjectSegmentType } from "./subject-segment-request.strategy";
import {
  SubjectSegmentRequestEmpty,
  type SubjectSegmentRequestStrategy,
} from "./subject-segment-request.strategy";

export class SubjectSegmentQueryStrategy implements SubjectSegmentRequestStrategy {
  create(context: HasRequestQuery): SubjectSegmentType {
    const query = context.request.query();

    const keys = Object.keys(query).toSorted();

    const result = keys.map((key) => `${key}=${query[key]}`).join("&");

    if (!result) return SubjectSegmentRequestEmpty;
    return result;
  }
}
