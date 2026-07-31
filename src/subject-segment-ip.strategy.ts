import type { HasIdentityIp } from "./request-context.port";
import {
  SubjectSegmentRequestEmpty,
  type SubjectSegmentRequestStrategy,
  type SubjectSegmentType,
} from "./subject-segment-request.strategy";

export class SubjectSegmentIpStrategy implements SubjectSegmentRequestStrategy {
  readonly label = "ip";

  create(context: HasIdentityIp): SubjectSegmentType {
    return context.identity.ip() ?? SubjectSegmentRequestEmpty;
  }
}
