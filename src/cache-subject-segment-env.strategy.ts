import type { CacheSubjectSegmentApplicationStrategy } from "./cache-subject-segment-application.strategy";
import type { NodeEnvironmentType } from "./node-env.vo";

export class CacheSubjectSegmentEnvStrategy implements CacheSubjectSegmentApplicationStrategy {
  constructor(private readonly type: NodeEnvironmentType) {}

  create() {
    return this.type;
  }
}
