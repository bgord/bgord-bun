import type { NodeEnvironmentEnum } from "./node-env.vo";
import type { SubjectSegmentApplicationStrategy } from "./subject-segment-application.strategy";
import type { SubjectSegmentType } from "./subject-segment-request.strategy";

export class SubjectSegmentEnvStrategy implements SubjectSegmentApplicationStrategy {
  constructor(private readonly type: NodeEnvironmentEnum) {}

  create(): SubjectSegmentType {
    return this.type;
  }
}
