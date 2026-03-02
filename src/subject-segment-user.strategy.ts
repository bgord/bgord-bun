import type { HasIdentityUserId } from "./request-context.port";
import {
  SubjectSegmentRequestEmpty,
  type SubjectSegmentRequestStrategy,
  type SubjectSegmentType,
} from "./subject-segment-request.strategy";

export class SubjectSegmentUserStrategy implements SubjectSegmentRequestStrategy {
  create(context: HasIdentityUserId): SubjectSegmentType {
    return context.identity.userId() ?? SubjectSegmentRequestEmpty;
  }
}
