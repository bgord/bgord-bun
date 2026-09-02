import type { HasIdentityRemoteIp } from "./request-context.port";
import {
  SubjectSegmentRequestEmpty,
  type SubjectSegmentRequestStrategy,
  type SubjectSegmentType,
} from "./subject-segment-request.strategy";

export class SubjectSegmentRemoteIpStrategy implements SubjectSegmentRequestStrategy {
  readonly label = "remote-ip";

  create(context: HasIdentityRemoteIp): SubjectSegmentType {
    return context.identity.remoteIp() ?? SubjectSegmentRequestEmpty;
  }
}
